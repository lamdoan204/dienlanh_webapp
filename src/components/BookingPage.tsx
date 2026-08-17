import React, { useState, useEffect, useMemo } from 'react';
import {
  BookingFormData,
  BookingRecord,
  DeviceType,
  ServicePackageType,
  ActiveTab,
  UserProfile,
  AddressRecord,
  AdminService,
  SelectedServiceItem,
} from '../types';
import { addressService } from '../services/addressService';
import { adminService } from '../services/adminService';
import { timeSlotService, TimeSlotRecord } from '../services/timeSlotService';
import { notificationService } from '../services/notificationService';

interface BookingPageProps {
  initialPreset?: AdminService | { device: DeviceType; service: ServicePackageType };
  userProfile?: UserProfile | null;
  onBookingSubmit: (
    newBooking: BookingRecord,
    extra?: { serviceId?: number; timeSlotId?: number; customerId?: number }
  ) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  initialPreset,
  userProfile,
  onBookingSubmit,
  setActiveTab,
}) => {
  // ----------------------------------------------------
  // 1. Customer & Address State
  // ----------------------------------------------------
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  // Address selection mode: 'saved' | 'new' | 'guest'
  const [addressMode, setAddressMode] = useState<'saved' | 'new' | 'guest'>('new');
  const [userAddresses, setUserAddresses] = useState<AddressRecord[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // Address fields for new address / guest address
  const [province, setProvince] = useState<string>('');
  const [ward, setWard] = useState<string>('');
  const [street, setStreet] = useState<string>('');
  const [houseNumber, setHouseNumber] = useState<string>('');
  const [addressNote, setAddressNote] = useState<string>('');
  const [saveAddressToAccount, setSaveAddressToAccount] = useState<boolean>(true);

  // Notes for service
  const [notes, setNotes] = useState<string>('');

  // ----------------------------------------------------
  // 2. Services State (Multi-service support with quantity)
  // ----------------------------------------------------
  const [allServices, setAllServices] = useState<AdminService[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedServiceItem[]>([]);
  const [isPresetMode, setIsPresetMode] = useState<boolean>(false);

  // Filters & Search for services when choosing manually
  const [serviceSearch, setServiceSearch] = useState<string>('');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('all');
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('all');

  // ----------------------------------------------------
  // 3. Date & Time Slots State
  // ----------------------------------------------------
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1); // 1-12
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(today.getDate());

  const [dbTimeSlots, setDbTimeSlots] = useState<TimeSlotRecord[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotRecord | null>(null);

  // ----------------------------------------------------
  // 4. Modal & Processing State
  // ----------------------------------------------------
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [createdBookingId, setCreatedBookingId] = useState<string>('');
  const [notifiedAdmins, setNotifiedAdmins] = useState<string[]>([]);

  // ----------------------------------------------------
  // Effects & Initializations
  // ----------------------------------------------------

  // Auto-fill customer profile if logged in
  useEffect(() => {
    if (userProfile) {
      const combinedName = (
        (userProfile.last_name || '') +
        ' ' +
        (userProfile.first_name || '')
      ).trim();
      setFullName(combinedName || 'Khách hàng');
      setPhone(userProfile.phone_number || '');
      setEmail(
        userProfile.email && !userProfile.email.endsWith('@guest.local')
          ? userProfile.email
          : ''
      );

      // Fetch saved addresses
      addressService.getUserAddresses(userProfile.id).then((addresses) => {
        setUserAddresses(addresses);
        if (addresses && addresses.length > 0) {
          setAddressMode('saved');
          setSelectedAddressId(addresses[0].id || null);
        } else {
          setAddressMode('new');
        }
      });
    } else {
      setAddressMode('guest');
    }
  }, [userProfile]);

  // Load all services from database & initialize preset / default selected service
  useEffect(() => {
    adminService.fetchAdminServices().then((servicesList) => {
      setAllServices(servicesList);

      // Check if opened with preset
      if (initialPreset) {
        if ('name' in initialPreset && initialPreset.name) {
          const srv = initialPreset as AdminService;
          setSelectedItems([
            {
              serviceId: Number(srv.id),
              serviceName: srv.name,
              deviceType: srv.deviceType,
              serviceType: srv.category,
              unitPrice: srv.price,
              quantity: 1,
            },
          ]);
          setIsPresetMode(true);
        } else if ('device' in initialPreset) {
          const dev = initialPreset.device;
          const match = servicesList.find((s) => {
            const devLower = s.deviceType.toLowerCase();
            if (dev === 'air_conditioner')
              return devLower.includes('lạnh') || devLower.includes('điều hòa');
            if (dev === 'refrigerator') return devLower.includes('tủ');
            if (dev === 'washing_machine') return devLower.includes('giặt');
            if (dev === 'microwave')
              return devLower.includes('sóng') || devLower.includes('vi sóng');
            return true;
          });
          if (match) {
            setSelectedItems([
              {
                serviceId: Number(match.id),
                serviceName: match.name,
                deviceType: match.deviceType,
                serviceType: match.category,
                unitPrice: match.price,
                quantity: 1,
              },
            ]);
            setIsPresetMode(true);
          } else if (servicesList.length > 0) {
            const srv = servicesList[0];
            setSelectedItems([
              {
                serviceId: Number(srv.id),
                serviceName: srv.name,
                deviceType: srv.deviceType,
                serviceType: srv.category,
                unitPrice: srv.price,
                quantity: 1,
              },
            ]);
          }
        }
      } else if (servicesList.length > 0) {
        // Default select first service if empty
        const srv = servicesList[0];
        setSelectedItems([
          {
            serviceId: Number(srv.id),
            serviceName: srv.name,
            deviceType: srv.deviceType,
            serviceType: srv.category,
            unitPrice: srv.price,
            quantity: 1,
          },
        ]);
      }
    });
  }, [initialPreset]);

  // Handlers for selected services list
  const handleAddItem = (srv: AdminService) => {
    setSelectedItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => String(item.serviceId) === String(srv.id)
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [
          ...prev,
          {
            serviceId: Number(srv.id),
            serviceName: srv.name,
            deviceType: srv.deviceType,
            serviceType: srv.category,
            unitPrice: srv.price,
            quantity: 1,
          },
        ];
      }
    });
  };

  const handleUpdateQuantity = (serviceId: number | string, delta: number) => {
    setSelectedItems((prev) => {
      return prev
        .map((item) => {
          if (String(item.serviceId) === String(serviceId)) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as SelectedServiceItem[];
    });
  };

  const handleRemoveItem = (serviceId: number | string) => {
    setSelectedItems((prev) =>
      prev.filter((item) => String(item.serviceId) !== String(serviceId))
    );
  };

  // Total price calculation
  const computedTotalPrice = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [selectedItems]);

  // Load time slots from database table `time_slots`
  useEffect(() => {
    timeSlotService.fetchTimeSlots().then((slots) => {
      setDbTimeSlots(slots);
      if (slots && slots.length > 0) {
        setSelectedTimeSlot(slots[0]);
      }
    });
  }, []);

  // ----------------------------------------------------
  // Dynamic Options & Filters
  // ----------------------------------------------------

  // Extract unique categories (service types) without label 'service_type'
  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    allServices.forEach((s) => {
      if (s.category) set.add(s.category.trim());
    });
    return Array.from(set);
  }, [allServices]);

  // Extract unique device types without label 'device_type'
  const uniqueDeviceTypes = useMemo(() => {
    const set = new Set<string>();
    allServices.forEach((s) => {
      if (s.deviceType) set.add(s.deviceType.trim());
    });
    return Array.from(set);
  }, [allServices]);

  // Filtered services when browsing manually
  const filteredServices = useMemo(() => {
    return allServices.filter((s) => {
      const matchSearch =
        !serviceSearch.trim() ||
        s.name.toLowerCase().includes(serviceSearch.toLowerCase().trim()) ||
        (s.note && s.note.toLowerCase().includes(serviceSearch.toLowerCase().trim()));

      const matchCategory =
        selectedServiceType === 'all' || s.category === selectedServiceType;

      const matchDevice =
        selectedDeviceType === 'all' || s.deviceType === selectedDeviceType;

      return matchSearch && matchCategory && matchDevice;
    });
  }, [allServices, serviceSearch, selectedServiceType, selectedDeviceType]);

  // Computed full address string
  const computedFullAddress = useMemo(() => {
    if (addressMode === 'saved' && selectedAddressId) {
      const found = userAddresses.find((a) => a.id === selectedAddressId);
      return found ? found.full_address : '';
    }

    const parts = [houseNumber, street, ward, province].map((p) => p.trim()).filter(Boolean);
    return parts.join(', ');
  }, [addressMode, selectedAddressId, userAddresses, houseNumber, street, ward, province]);

  // Selected date formatted
  const formattedSelectedDate = useMemo(() => {
    const m = selectedMonth < 10 ? `0${selectedMonth}` : `${selectedMonth}`;
    const d = selectedDayNumber < 10 ? `0${selectedDayNumber}` : `${selectedDayNumber}`;
    return `${selectedYear}-${m}-${d}`;
  }, [selectedYear, selectedMonth, selectedDayNumber]);

  // Calendar calculations
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(selectedYear, selectedMonth - 1, 1).getDay(); // 0 = Sunday
  }, [selectedYear, selectedMonth]);

  // Generate list of available years for dropdown
  const yearOptions = useMemo(() => {
    const curr = today.getFullYear();
    return [curr, curr + 1, curr + 2];
  }, []);

  const monthOptions = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
  ];

  const getDayName = (dateStr: string) => {
    const d = new Date(dateStr);
    const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[d.getDay()] || 'Thứ 2';
  };

  // ----------------------------------------------------
  // Form Submission
  // ----------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất 1 dịch vụ bạn cần thực hiện.');
      return;
    }

    if (!fullName.trim() || !phone.trim()) {
      alert('Vui lòng nhập đầy đủ Họ tên và Số điện thoại.');
      return;
    }

    if (!computedFullAddress.trim()) {
      alert('Vui lòng cung cấp địa chỉ chi tiết (Tỉnh thành, Phường xã, Số nhà, Đường).');
      return;
    }

    if (!selectedTimeSlot) {
      alert('Vui lòng chọn khung giờ hẹn.');
      return;
    }

    setIsSubmitting(true);

    try {
      // If user is logged in and wants to save new address to account
      if (userProfile && addressMode === 'new' && saveAddressToAccount) {
        await addressService.addAddress({
          user_id: userProfile.id,
          province,
          ward,
          street,
          house_number: houseNumber,
          full_address: computedFullAddress,
          note: addressNote,
        });
      }

      const bookingId = `HVAC-${Math.floor(100000 + Math.random() * 900000)}`;

      // Infer device type enum for compatibility
      let deviceEnum: DeviceType = 'air_conditioner';
      const firstDevLower = (selectedItems[0]?.deviceType || '').toLowerCase();
      if (firstDevLower.includes('tủ') || firstDevLower.includes('refrigerator')) deviceEnum = 'refrigerator';
      if (firstDevLower.includes('giặt') || firstDevLower.includes('washing')) deviceEnum = 'washing_machine';
      if (firstDevLower.includes('sóng') || firstDevLower.includes('microwave')) deviceEnum = 'microwave';

      const serviceNamesCombined = selectedItems
        .map((i) => `${i.serviceName} (${i.quantity} thiết bị)`)
        .join(', ');

      const newRecord: BookingRecord = {
        id: bookingId,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: computedFullAddress,
        device: deviceEnum,
        servicePackage: 'repair',
        items: selectedItems,
        serviceName: serviceNamesCombined,
        selectedDate: formattedSelectedDate,
        selectedTimeSlot: selectedTimeSlot.label || `${selectedTimeSlot.start_time} - ${selectedTimeSlot.end_time}`,
        notes,
        createdAt: new Date().toISOString(),
        status: 'pending',
        estimatedCost: computedTotalPrice,
      };

      // 1. Submit booking to database / parent handler
      const firstServiceId = selectedItems[0]?.serviceId ? Number(selectedItems[0].serviceId) : undefined;
      const timeSlotIdNum = selectedTimeSlot.id ? Number(selectedTimeSlot.id) : undefined;

      onBookingSubmit(newRecord, {
        serviceId: firstServiceId,
        timeSlotId: timeSlotIdNum,
        customerId: userProfile?.id,
      });

      // 2. Send Email Notification to all admins in the database
      const notifyResult = await notificationService.notifyAdminsNewBooking({
        bookingId,
        customerName: fullName,
        customerPhone: phone,
        customerEmail: email || 'Chưa cung cấp',
        address: computedFullAddress,
        serviceName: serviceNamesCombined,
        appointmentDate: formattedSelectedDate,
        timeSlot: selectedTimeSlot.label || `${selectedTimeSlot.start_time} - ${selectedTimeSlot.end_time}`,
        totalPrice: computedTotalPrice,
        notes,
      });

      setNotifiedAdmins(notifyResult.adminEmails);
      setCreatedBookingId(bookingId);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Submit booking error:', err);
      alert('Có lỗi xảy ra khi gửi đăng ký đặt lịch. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-20 lg:pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="mb-6 pb-4 border-b border-[#c1c7d3]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#141b2b]">Đặt Lịch Dịch Vụ kỹ Thuật</h1>
          <p className="text-xs sm:text-sm text-[#414751] mt-1">
            Đặt hẹn nhanh chóng • Kỹ thuật viên kiểm tra tận nơi • Báo giá minh bạch
          </p>
        </div>
        {userProfile && (
          <div className="inline-flex items-center gap-2 bg-[#e9edff] text-[#005396] px-3 py-1.5 rounded-xl text-xs font-semibold w-fit">
            <span className="material-symbols-outlined text-base">account_circle</span>
            <span>Xin chào, {userProfile.last_name} {userProfile.first_name}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Form Steps */}
        <div className="lg:col-span-2 space-y-6">

          {/* ------------------------------------------------ */}
          {/* STEP 1: Thông tin khách hàng & Địa chỉ */}
          {/* ------------------------------------------------ */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#c1c7d3]/30 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-[#005396]/10 text-[#005396] flex items-center justify-center font-bold">
                1
              </div>
              <h2 className="text-lg font-bold text-[#141b2b]">Thông tin khách hàng &amp; Địa chỉ</h2>
            </div>

            {/* Basic Info Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#414751] mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3]/80 rounded-xl px-3.5 py-2.5 text-sm text-[#141b2b] focus:outline-none focus:border-[#005396] transition-all h-[42px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#414751] mb-1">
                  Số điện thoại liên hệ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0901234567"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3]/80 rounded-xl px-3.5 py-2.5 text-sm text-[#141b2b] focus:outline-none focus:border-[#005396] transition-all h-[42px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#414751] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nguyenvana@gmail.com"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3]/80 rounded-xl px-3.5 py-2.5 text-sm text-[#141b2b] focus:outline-none focus:border-[#005396] transition-all h-[42px]"
                />
              </div>
            </div>

            {/* Address Selection Section */}
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#141b2b] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#005396] text-[18px]">location_on</span>
                  <span>Địa chỉ</span>
                </label>

                {/* Logged in address mode toggle */}
                {userProfile && userAddresses.length > 0 && (
                  <div className="flex bg-[#f1f3ff] p-1 rounded-lg text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setAddressMode('saved')}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                        addressMode === 'saved'
                          ? 'bg-[#005396] text-white shadow-xs'
                          : 'text-[#414751] hover:text-[#005396]'
                      }`}
                    >
                      Địa chỉ đã lưu ({userAddresses.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddressMode('new')}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                        addressMode === 'new'
                          ? 'bg-[#005396] text-white shadow-xs'
                          : 'text-[#414751] hover:text-[#005396]'
                      }`}
                    >
                      + Tạo địa chỉ mới
                    </button>
                  </div>
                )}
              </div>

              {/* Saved Address Selection Dropdown / Cards */}
              {addressMode === 'saved' && userAddresses.length > 0 && (
                <div className="grid grid-cols-1 gap-2.5">
                  {userAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id || null)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'border-[#005396] bg-[#e9edff]/50 text-[#141b2b] ring-1 ring-[#005396]'
                            : 'border-[#c1c7d3]/60 bg-[#f9f9ff] text-[#414751] hover:bg-[#f1f3ff]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="saved_address"
                          checked={isSelected}
                          onChange={() => setSelectedAddressId(addr.id || null)}
                          className="mt-1 accent-[#005396]"
                        />
                        <div className="flex-1 text-xs">
                          <p className="font-bold text-sm text-[#141b2b]">{addr.full_address}</p>
                          {addr.note && <p className="text-[#005396] mt-0.5 font-medium">Ghi chú: {addr.note}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* New Address / Guest Address Input Form */}
              {(addressMode === 'new' || addressMode === 'guest') && (
                <div className="bg-[#f8f9ff] p-3.5 rounded-xl border border-[#c1c7d3]/40 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#414751] mb-1">
                        Tỉnh / Thành phố <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        placeholder="TP. Hồ Chí Minh, Hà Nội, Đà Nẵng..."
                        className="w-full bg-white border border-[#c1c7d3] rounded-lg px-3 py-2 text-xs text-[#141b2b] focus:outline-none focus:border-[#005396]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#414751] mb-1">
                        Phường / Xã / Quận <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                        placeholder="Phường Bến Nghé, Quận 1..."
                        className="w-full bg-white border border-[#c1c7d3] rounded-lg px-3 py-2 text-xs text-[#141b2b] focus:outline-none focus:border-[#005396]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#414751] mb-1">
                        Tên đường / Thôn xóm
                      </label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Đường Lê Duẩn..."
                        className="w-full bg-white border border-[#c1c7d3] rounded-lg px-3 py-2 text-xs text-[#141b2b] focus:outline-none focus:border-[#005396]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#414751] mb-1">
                        Số nhà / Căn hộ
                      </label>
                      <input
                        type="text"
                        value={houseNumber}
                        onChange={(e) => setHouseNumber(e.target.value)}
                        placeholder="Số 123A..."
                        className="w-full bg-white border border-[#c1c7d3] rounded-lg px-3 py-2 text-xs text-[#141b2b] focus:outline-none focus:border-[#005396]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#414751] mb-1">
                      Ghi chú vị trí (tầng, mã cửa, v.v.)
                    </label>
                    <input
                      type="text"
                      value={addressNote}
                      onChange={(e) => setAddressNote(e.target.value)}
                      placeholder="Ví dụ: Tầng 3, chung cư HAGL..."
                      className="w-full bg-white border border-[#c1c7d3] rounded-lg px-3 py-2 text-xs text-[#141b2b] focus:outline-none focus:border-[#005396]"
                    />
                  </div>

                  {computedFullAddress && (
                    <div className="bg-white p-2.5 rounded-lg border border-[#005396]/20 text-xs">
                      <span className="font-semibold text-[#005396]">Địa chỉ xem trước: </span>
                      <span className="text-[#141b2b] font-medium">{computedFullAddress}</span>
                    </div>
                  )}

                  {userProfile && (
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={saveAddressToAccount}
                        onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                        className="rounded text-[#005396] focus:ring-[#005396]"
                      />
                      <span className="text-xs text-[#414751] font-medium">Lưu địa chỉ này vào tài khoản của tôi</span>
                    </label>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ------------------------------------------------ */}
          {/* STEP 2: Chọn Dịch Vụ & Số Lượng Thiết Bị */}
          {/* ------------------------------------------------ */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#c1c7d3]/30 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#005396]/10 text-[#005396] flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#141b2b]">
                    Chọn dịch vụ &amp; số lượng thiết bị
                  </h2>
                  <p className="text-xs text-[#717783]">
                    Khách hàng có thể đặt nhiều dịch vụ trong 1 đơn, mỗi dịch vụ có thể điều chỉnh số lượng thiết bị
                  </p>
                </div>
              </div>

              {isPresetMode && selectedItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsPresetMode(false)}
                  className="text-xs font-semibold text-[#005396] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Mở rộng danh sách dịch vụ</span>
                </button>
              )}
            </div>

            {/* Selected Services List (Cart view inside Step 2) */}
            <div className="bg-[#f8f9ff] p-4 rounded-xl border border-[#c1c7d3]/50 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#005396] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">shopping_cart</span>
                  <span>Danh sách dịch vụ đã chọn ({selectedItems.length})</span>
                </h3>
                {selectedItems.length > 0 && (
                  <span className="text-xs font-extrabold text-[#141b2b]">
                    Tạm tính: <span className="text-[#005396]">{computedTotalPrice.toLocaleString('vi-VN')} VNĐ</span>
                  </span>
                )}
              </div>

              {selectedItems.length === 0 ? (
                <div className="text-center py-6 text-xs text-red-500 font-medium bg-white rounded-xl border border-dashed border-red-200">
                  Chưa chọn dịch vụ nào. Vui lòng bấm "+ Thêm dịch vụ" ở danh sách bên dưới!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedItems.map((item) => (
                    <div
                      key={item.serviceId}
                      className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex-1 space-y-1">
                        <h4 className="font-bold text-sm text-[#141b2b] leading-snug">{item.serviceName}</h4>
                        {item.deviceType && (
                          <div>
                            <span className="inline-block bg-[#e9edff] text-[#005396] text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">
                              {item.deviceType}
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-[#717783] whitespace-nowrap">
                          Đơn giá: <strong className="text-[#141b2b] whitespace-nowrap">{item.unitPrice.toLocaleString('vi-VN')} VNĐ</strong> / thiết bị
                        </p>
                      </div>

                      {/* Quantity Controls (Số lượng thiết bị) */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-1.5 bg-[#f1f3ff] p-1 rounded-lg border border-[#c1c7d3]/40 shrink-0">
                          <span className="text-[11px] text-[#414751] font-semibold px-1 whitespace-nowrap shrink-0">
                            Số thiết bị:
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.serviceId, -1)}
                            className="w-7 h-7 rounded-md bg-white text-[#141b2b] font-bold text-sm hover:bg-gray-100 flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-extrabold text-xs text-[#005396] whitespace-nowrap">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.serviceId, 1)}
                            className="w-7 h-7 rounded-md bg-white text-[#141b2b] font-bold text-sm hover:bg-gray-100 flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right min-w-[100px] shrink-0">
                          <div className="text-[10px] text-[#717783] whitespace-nowrap">Thành tiền</div>
                          <div className="text-sm font-extrabold text-[#005396] whitespace-nowrap">
                            {(item.unitPrice * item.quantity).toLocaleString('vi-VN')} VNĐ
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.serviceId)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer"
                          title="Xóa dịch vụ này"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MANUAL SEARCH & FILTER SERVICE CATALOG */}
            {!isPresetMode && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-[#141b2b] uppercase tracking-wider">
                  Thêm dịch vụ khác vào đơn
                </h3>

                {/* Search & Filter bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Search box */}
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                      search
                    </span>
                    <input
                      type="text"
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      placeholder="Tìm tên dịch vụ..."
                      className="w-full pl-9 pr-3 py-2 bg-[#f9f9ff] border border-[#c1c7d3]/80 rounded-xl text-xs text-[#141b2b] focus:outline-none focus:border-[#005396] h-[38px]"
                    />
                  </div>

                  {/* Filter category */}
                  <select
                    value={selectedServiceType}
                    onChange={(e) => setSelectedServiceType(e.target.value)}
                    className="w-full bg-[#f9f9ff] border border-[#c1c7d3]/80 rounded-xl px-3 py-2 text-xs font-medium text-[#141b2b] focus:outline-none focus:border-[#005396] h-[38px] cursor-pointer"
                  >
                    <option value="all">Tất cả phân loại</option>
                    {uniqueCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  {/* Filter device */}
                  <select
                    value={selectedDeviceType}
                    onChange={(e) => setSelectedDeviceType(e.target.value)}
                    className="w-full bg-[#f9f9ff] border border-[#c1c7d3]/80 rounded-xl px-3 py-2 text-xs font-medium text-[#141b2b] focus:outline-none focus:border-[#005396] h-[38px] cursor-pointer"
                  >
                    <option value="all">Tất cả thiết bị</option>
                    {uniqueDeviceTypes.map((dev) => (
                      <option key={dev} value={dev}>
                        {dev}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Services Grid Catalog */}
                <div className="max-h-[280px] overflow-y-auto pr-1 space-y-2">
                  {filteredServices.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#717783] bg-[#f9f9ff] rounded-xl border border-dashed border-gray-200">
                      Không tìm thấy dịch vụ phù hợp với điều kiện tìm kiếm.
                    </div>
                  ) : (
                    filteredServices.map((srv) => {
                      const selectedItem = selectedItems.find(
                        (i) => String(i.serviceId) === String(srv.id)
                      );
                      const isAdded = Boolean(selectedItem);

                      return (
                        <div
                          key={srv.id}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                            isAdded
                              ? 'border-[#005396]/60 bg-[#e9edff]/40'
                              : 'border-[#c1c7d3]/50 bg-[#f9f9ff] hover:bg-[#f1f3ff]'
                          }`}
                        >
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-[#141b2b]">
                              {srv.name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs sm:text-sm font-extrabold text-[#005396]">
                              {srv.price.toLocaleString('vi-VN')} VNĐ
                            </span>

                            {isAdded ? (
                              <div className="flex items-center gap-1 bg-[#005396] text-white px-2.5 py-1 rounded-lg text-xs font-bold">
                                <span>Đã thêm ({selectedItem?.quantity})</span>
                                <button
                                  type="button"
                                  onClick={() => handleAddItem(srv)}
                                  className="ml-1 text-xs bg-white/20 hover:bg-white/30 px-1 rounded cursor-pointer"
                                  title="Thêm số lượng thiết bị"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddItem(srv)}
                                className="bg-[#005396] hover:bg-[#0f6cbd] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                              >
                                <span>+ Thêm</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </section>

          {/* ------------------------------------------------ */}
          {/* STEP 3: Lịch hẹn & Khung giờ */}
          {/* ------------------------------------------------ */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#c1c7d3]/30 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-[#005396]/10 text-[#005396] flex items-center justify-center font-bold">
                3
              </div>
              <h2 className="text-lg font-bold text-[#141b2b]">Chọn ngày &amp; khung giờ hẹn</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Calendar with Month AND Year Selectors */}
              <div className="bg-[#f9f9ff] border border-[#c1c7d3]/60 rounded-xl p-3.5 space-y-3">
                {/* Year & Month Dropdown Controls */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 w-full">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="bg-white border border-[#c1c7d3] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#141b2b] focus:outline-none focus:border-[#005396] cursor-pointer flex-1"
                    >
                      {monthOptions.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="bg-white border border-[#c1c7d3] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#141b2b] focus:outline-none focus:border-[#005396] cursor-pointer w-24"
                    >
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>
                          Năm {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Day of week header */}
                <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-[#414751]">
                  <div>CN</div>
                  <div>T2</div>
                  <div>T3</div>
                  <div>T4</div>
                  <div>T5</div>
                  <div>T6</div>
                  <div>T7</div>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {/* Empty slots for first week padding */}
                  {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="p-1.5" />
                  ))}

                  {/* Days 1 to daysInMonth */}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((dayNum) => {
                    const isSelected = selectedDayNumber === dayNum;
                    return (
                      <button
                        key={dayNum}
                        type="button"
                        onClick={() => setSelectedDayNumber(dayNum)}
                        className={`py-1.5 rounded-lg cursor-pointer transition-all font-semibold flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#005396] text-white font-bold shadow-xs'
                            : 'hover:bg-[#e1e8fd] text-[#141b2b]'
                        }`}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slot Selection (Loaded from time_slots table) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#141b2b] uppercase tracking-wider block mb-2">
                  Khung giờ khả dụng (từ cơ sở dữ liệu)
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {dbTimeSlots.length === 0 ? (
                    <div className="text-xs text-gray-500 text-center py-4">Đang tải danh sách khung giờ...</div>
                  ) : (
                    dbTimeSlots.map((slot) => {
                      const isSelected = selectedTimeSlot?.id === slot.id;
                      const slotText = slot.label || `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={!slot.is_active}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-semibold text-xs flex items-center justify-between ${
                            !slot.is_active
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'bg-[#005396] text-white border-[#005396] shadow-xs'
                              : 'bg-[#f9f9ff] text-[#141b2b] border-[#c1c7d3]/60 hover:bg-[#e1e8fd]'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                            <span>{slotText}</span>
                          </span>
                          {isSelected && (
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Additional Notes input */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#414751] mb-1">
                Ghi chú thêm cho kỹ thuật viên
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Máy lạnh lắp ở vị trí cao, vui lòng mang thang cao..."
                className="w-full bg-[#f9f9ff] border border-[#c1c7d3]/80 rounded-xl p-3 text-xs text-[#141b2b] focus:outline-none focus:border-[#005396]"
              />
            </div>
          </section>
        </div>

        {/* ------------------------------------------------ */}
        {/* Right Column: Order Summary Sidebar */}
        {/* ------------------------------------------------ */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl p-5 shadow-md border border-[#c1c7d3]/40 space-y-4">
            <h3 className="text-lg font-bold text-[#141b2b] pb-3 border-b border-gray-100 flex items-center justify-between">
              <span>Tóm tắt đơn hẹn</span>
              <span className="material-symbols-outlined text-[#005396]">assignment</span>
            </h3>

            <div className="space-y-3 text-xs">
              {/* Selected Services breakdown */}
              <div className="bg-[#f9f9ff] p-3 rounded-xl border border-[#c1c7d3]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#717783] uppercase tracking-wider block">
                    Dịch vụ đã chọn ({selectedItems.length})
                  </span>
                </div>

                {selectedItems.length === 0 ? (
                  <p className="text-red-500 font-semibold">Chưa chọn dịch vụ nào</p>
                ) : (
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {selectedItems.map((item) => (
                      <div key={item.serviceId} className="flex justify-between items-start border-b border-gray-100 pb-1.5 last:border-b-0 last:pb-0">
                        <div>
                          <p className="font-bold text-[#141b2b]">{item.serviceName}</p>
                          <p className="text-[11px] text-[#717783]">
                            {item.quantity} thiết bị × {item.unitPrice.toLocaleString('vi-VN')} VNĐ
                          </p>
                        </div>
                        <span className="font-bold text-[#005396] text-xs">
                          {(item.unitPrice * item.quantity).toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Schedule */}
              <div className="bg-[#f9f9ff] p-3 rounded-xl border border-[#c1c7d3]/40 space-y-1">
                <span className="text-[11px] font-semibold text-[#717783] uppercase tracking-wider block">Thời gian hẹn</span>
                <p className="font-bold text-[#141b2b]">
                  {getDayName(formattedSelectedDate)}, {selectedDayNumber}/{selectedMonth}/{selectedYear}
                </p>
                <p className="text-[#005396] font-semibold">
                  {selectedTimeSlot ? (selectedTimeSlot.label || `${selectedTimeSlot.start_time.slice(0,5)} - ${selectedTimeSlot.end_time.slice(0,5)}`) : 'Chưa chọn khung giờ'}
                </p>
              </div>

              {/* Location */}
              <div className="bg-[#f9f9ff] p-3 rounded-xl border border-[#c1c7d3]/40 space-y-1">
                <span className="text-[11px] font-semibold text-[#717783] uppercase tracking-wider block">Khách hàng &amp; Địa điểm</span>
                <p className="font-bold text-[#141b2b]">{fullName || 'Chưa nhập tên'} {phone ? `• ${phone}` : ''}</p>
                <p className="text-[#414751] leading-relaxed">
                  {computedFullAddress || 'Chưa cung cấp địa chỉ'}
                </p>
              </div>

              {/* Notes */}
              {notes && (
                <div className="bg-[#f9f9ff] p-3 rounded-xl border border-[#c1c7d3]/40 space-y-1">
                  <span className="text-[11px] font-semibold text-[#717783] uppercase tracking-wider block">Ghi chú</span>
                  <p className="text-[#141b2b] italic">{notes}</p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-sm font-extrabold">
                <span className="text-[#141b2b]">Tổng chi phí dự kiến:</span>
                <span className="text-[#005396] text-base">
                  {computedTotalPrice.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </div>

            {/* CTA Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || selectedItems.length === 0}
              className="w-full bg-[#ff8a00] hover:bg-[#d97500] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 min-h-[48px]"
            >
              {isSubmitting ? (
                <span>Đang xử lý đặt lịch...</span>
              ) : (
                <>
                  <span>Xác Nhận Đặt Lịch</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-[#717783]">
              ✉️ Hệ thống sẽ tự động gửi thông báo chi tiết đơn đặt lịch tới email của ban quản trị (Admin).
            </p>
          </div>
        </div>
      </form>

      {/* SUCCESS MODAL */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-gray-200 space-y-4">
            <div className="w-14 h-14 bg-[#005396] text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-3xl">check_circle</span>
            </div>

            <h3 className="text-xl font-extrabold text-[#141b2b]">Đặt Lịch Thành Công!</h3>

            <p className="text-xs text-[#414751]">
              Mã lịch hẹn: <strong className="text-[#005396] text-sm">{createdBookingId}</strong>.
              <br />Kỹ thuật viên sẽ liên hệ xác nhận trong 15-30 phút.
            </p>

            <div className="bg-[#f8f9ff] p-3 rounded-xl text-left text-xs space-y-1.5 border border-gray-200">
              <div>
                <strong>Dịch vụ:</strong>{' '}
                {selectedItems
                  .map((i) => `${i.serviceName} (${i.quantity} thiết bị)`)
                  .join(', ')}
              </div>
              <div><strong>Tổng tiền:</strong> <span className="text-[#005396] font-bold">{computedTotalPrice.toLocaleString('vi-VN')} VNĐ</span></div>
              <div><strong>Thời gian:</strong> {selectedTimeSlot?.label}, {selectedDayNumber}/{selectedMonth}/{selectedYear}</div>
              <div><strong>Khách hàng:</strong> {fullName} ({phone})</div>
              <div><strong>Địa chỉ:</strong> {computedFullAddress}</div>
              {notes && <div><strong>Ghi chú:</strong> <span className="italic">{notes}</span></div>}
            </div>



            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setActiveTab('history');
                }}
                className="w-full bg-[#005396] hover:bg-[#0f6cbd] text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Xem Lịch Sử Dịch Vụ
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setActiveTab('home');
                }}
                className="w-full bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#005396] font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Trở Về Trang Chủ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
