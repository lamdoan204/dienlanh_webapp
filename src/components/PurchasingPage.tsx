import React, { useState, useEffect, useMemo } from 'react';
import {
  ActiveTab,
  UserProfile,
  AddressRecord,
  PurchasingItemInput,
  PurchasingOrderInput,
} from '../types';
import { addressService } from '../services/addressService';
import { timeSlotService, TimeSlotRecord } from '../services/timeSlotService';
import { purchasingService } from '../services/purchasingService';
import { VIETNAM_ADDRESS_DATA } from '../data/vietnamAddressData';

interface PurchasingPageProps {
  userProfile?: UserProfile | null;
  setActiveTab: (tab: ActiveTab) => void;
}

interface DeviceSelectionState {
  enabled: boolean;
  quantity: number;
  desiredPrice: number;
  note: string;
  images: File[];
  previewUrls: string[];
}

export const PurchasingPage: React.FC<PurchasingPageProps> = ({
  userProfile,
  setActiveTab,
}) => {
  // ----------------------------------------------------
  // 1. Customer & Address Information
  // ----------------------------------------------------
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  // Address mode for logged-in users: 'saved' | 'new' | 'guest'
  const [addressMode, setAddressMode] = useState<'saved' | 'new' | 'guest'>('guest');
  const [userAddresses, setUserAddresses] = useState<AddressRecord[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // Address fields
  const [province, setProvince] = useState<string>('TP. Hồ Chí Minh');
  const [ward, setWard] = useState<string>('');
  const [street, setStreet] = useState<string>('');
  const [houseNumber, setHouseNumber] = useState<string>('');
  const [addressNote, setAddressNote] = useState<string>('');

  // ----------------------------------------------------
  // 2. Devices for Purchasing (Tủ lạnh, Máy giặt, Máy lạnh)
  // ----------------------------------------------------
  const [deviceFridge, setDeviceFridge] = useState<DeviceSelectionState>({
    enabled: true,
    quantity: 1,
    desiredPrice: 1500000,
    note: '',
    images: [],
    previewUrls: [],
  });

  const [deviceWasher, setDeviceWasher] = useState<DeviceSelectionState>({
    enabled: false,
    quantity: 1,
    desiredPrice: 1200000,
    note: '',
    images: [],
    previewUrls: [],
  });

  const [deviceAC, setDeviceAC] = useState<DeviceSelectionState>({
    enabled: false,
    quantity: 1,
    desiredPrice: 2000000,
    note: '',
    images: [],
    previewUrls: [],
  });

  // Lightbox Preview Modal State
  const [previewLightboxUrl, setPreviewLightboxUrl] = useState<string | null>(null);

  // Image Upload Handlers
  const handleAddImages = (
    setter: React.Dispatch<React.SetStateAction<DeviceSelectionState>>,
    incomingFiles: FileList | File[] | null
  ) => {
    if (!incomingFiles) return;
    const fileArray = Array.from(incomingFiles).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    const newPreviewUrls = fileArray.map((f) => URL.createObjectURL(f));
    setter((prev) => ({
      ...prev,
      images: [...prev.images, ...fileArray],
      previewUrls: [...prev.previewUrls, ...newPreviewUrls],
    }));
  };

  const handleRemoveImage = (
    setter: React.Dispatch<React.SetStateAction<DeviceSelectionState>>,
    index: number
  ) => {
    setter((prev) => {
      const urlToRevoke = prev.previewUrls[index];
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
        previewUrls: prev.previewUrls.filter((_, i) => i !== index),
      };
    });
  };

  // ----------------------------------------------------
  // 3. Appointment Date & Time Slots
  // ----------------------------------------------------
  const todayStr = new Date().toISOString().split('T')[0];
  const [appointmentDate, setAppointmentDate] = useState<string>(todayStr);
  const [dbTimeSlots, setDbTimeSlots] = useState<TimeSlotRecord[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotRecord | null>(null);

  // ----------------------------------------------------
  // 4. Modal & Submission State
  // ----------------------------------------------------
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [createdOrderCode, setCreatedOrderCode] = useState<string>('');

  // Clean up ObjectURLs on unmount
  useEffect(() => {
    return () => {
      [...deviceFridge.previewUrls, ...deviceWasher.previewUrls, ...deviceAC.previewUrls].forEach(
        (url) => {
          if (url.startsWith('blob:')) URL.revokeObjectURL(url);
        }
      );
    };
  }, []);

  // ----------------------------------------------------
  // Address Data helpers
  // ----------------------------------------------------
  const currentProvinceData = useMemo(() => {
    return VIETNAM_ADDRESS_DATA.find((p) => p.name === province) || VIETNAM_ADDRESS_DATA[0];
  }, [province]);

  const wardsList = useMemo(() => {
    return currentProvinceData ? currentProvinceData.wards : [];
  }, [currentProvinceData]);

  const currentWardData = useMemo(() => {
    return wardsList.find((w) => w.name === ward) || wardsList[0];
  }, [wardsList, ward]);

  const streetsList = useMemo(() => {
    return currentWardData ? currentWardData.streets : [];
  }, [currentWardData]);

  // Set default ward & street when province changes
  useEffect(() => {
    if (wardsList.length > 0) {
      if (!wardsList.some((w) => w.name === ward)) {
        setWard(wardsList[0].name);
      }
    }
  }, [province, wardsList, ward]);

  // Auto-fill logged in user
  useEffect(() => {
    if (userProfile) {
      const combined = `${userProfile.last_name || ''} ${userProfile.first_name || ''}`.trim();
      setFullName(combined || 'Khách hàng');
      setPhone(userProfile.phone_number || '');
      setEmail(
        userProfile.email && !userProfile.email.endsWith('@guest.local') ? userProfile.email : ''
      );

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

  // Load time slots
  useEffect(() => {
    timeSlotService.fetchTimeSlots().then((slots) => {
      setDbTimeSlots(slots);
      if (slots && slots.length > 0) {
        setSelectedTimeSlot(slots[0]);
      }
    });
  }, []);

  // Computed Full Address string
  const computedFullAddress = useMemo(() => {
    if (addressMode === 'saved') {
      const found = userAddresses.find((a) => a.id === selectedAddressId);
      if (found) {
        return (
          found.full_address ||
          [found.house_number, found.street, found.ward, found.province].filter(Boolean).join(', ')
        );
      }
    }
    const parts = [houseNumber.trim(), street.trim(), ward.trim(), province.trim()].filter(Boolean);
    return parts.join(', ') || 'Chưa cập nhật địa chỉ';
  }, [addressMode, userAddresses, selectedAddressId, houseNumber, street, ward, province]);

  // Selected items list
  const selectedItems = useMemo(() => {
    const list: PurchasingItemInput[] = [];
    if (deviceFridge.enabled) {
      list.push({
        device: 'Tủ lạnh',
        quantity: Math.max(1, deviceFridge.quantity),
        desired_price: Number(deviceFridge.desiredPrice) || 0,
        note: deviceFridge.note,
        images: deviceFridge.images,
        previewUrls: deviceFridge.previewUrls,
      });
    }
    if (deviceWasher.enabled) {
      list.push({
        device: 'Máy giặt',
        quantity: Math.max(1, deviceWasher.quantity),
        desired_price: Number(deviceWasher.desiredPrice) || 0,
        note: deviceWasher.note,
        images: deviceWasher.images,
        previewUrls: deviceWasher.previewUrls,
      });
    }
    if (deviceAC.enabled) {
      list.push({
        device: 'Máy lạnh',
        quantity: Math.max(1, deviceAC.quantity),
        desired_price: Number(deviceAC.desiredPrice) || 0,
        note: deviceAC.note,
        images: deviceAC.images,
        previewUrls: deviceAC.previewUrls,
      });
    }
    return list;
  }, [deviceFridge, deviceWasher, deviceAC]);

  const totalDesiredPrice = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.desired_price, 0);
  }, [selectedItems]);

  const totalDeviceCount = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [selectedItems]);

  // ----------------------------------------------------
  // Form Submission
  // ----------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validation for Customer Info
    if (!fullName.trim()) {
      setErrorMessage('Vui lòng nhập Họ và Tên của bạn.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 9 || cleanPhone.length > 11) {
      setErrorMessage('Vui lòng nhập số điện thoại hợp lệ (9 - 11 chữ số).');
      return;
    }

    // 2. Validation for Address
    if (addressMode === 'saved') {
      if (!selectedAddressId) {
        setErrorMessage('Vui lòng chọn một địa chỉ đã lưu hoặc chuyển sang nhập địa chỉ mới.');
        return;
      }
    } else {
      if (!province.trim()) {
        setErrorMessage('Vui lòng chọn Tỉnh / Thành phố.');
        return;
      }
      if (!ward.trim()) {
        setErrorMessage('Vui lòng chọn Phường / Xã.');
        return;
      }
      if (!street.trim()) {
        setErrorMessage('Vui lòng nhập tên Đường / Tuyến phố.');
        return;
      }
      if (!houseNumber.trim()) {
        setErrorMessage('Vui lòng nhập Số nhà, ngõ/ngách hoặc tòa nhà.');
        return;
      }
    }

    // 3. Validation for Devices
    if (selectedItems.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một thiết bị cần thu mua (Tủ lạnh, Máy giặt hoặc Máy lạnh).');
      return;
    }

    // 4. Validation for Time slot & date
    if (!appointmentDate) {
      setErrorMessage('Vui lòng chọn ngày hẹn thu mua.');
      return;
    }
    if (!selectedTimeSlot) {
      setErrorMessage('Vui lòng chọn khung giờ hẹn.');
      return;
    }

    setIsSubmitting(true);

    const payload: PurchasingOrderInput = {
      address_id: addressMode === 'saved' && selectedAddressId ? selectedAddressId : undefined,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      province: addressMode === 'saved' ? '' : province,
      ward: addressMode === 'saved' ? '' : ward,
      street: addressMode === 'saved' ? '' : street,
      house_number: addressMode === 'saved' ? '' : houseNumber,
      full_address: computedFullAddress,
      address_note: addressNote.trim(),
      time_slot_id: Number(selectedTimeSlot.id),
      appointment_time: appointmentDate,
      items: selectedItems,
    };

    const res = await purchasingService.createPurchasingOrder(payload, userProfile);
    setIsSubmitting(false);

    if (res.success) {
      setCreatedOrderCode(res.orderCode || `#TM-${res.orderId}`);
      setIsSuccessModalOpen(true);
    } else {
      setErrorMessage(res.message || 'Có lỗi xảy ra khi tạo yêu cầu thu mua. Vui lòng thử lại!');
    }
  };

  return (
    <div className="pt-24 lg:pt-28 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#005396]/10 text-[#005396] font-bold text-xs sm:text-sm mb-3">
          <span className="material-symbols-outlined text-[18px]">recycling</span>
          <span>Dịch Vụ Thu Mua Thiết Bị Cũ Tận Nhà</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#141b2b] tracking-tight mb-2">
          Thu Mua Tủ Lạnh, Máy Giặt, Máy Lạnh Giá Cao
        </h1>
        <p className="text-sm sm:text-base text-[#414751] max-w-2xl mx-auto">
          Định giá minh bạch, kiểm tra tận nơi nhanh chóng, thu mua đúng giá mong muốn và thanh toán ngay bằng tiền mặt hoặc chuyển khoản.
        </p>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-[#c1c7d3]/50 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#005396]/10 text-[#005396] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">home_pin</span>
          </div>
          <div>
            <h2 className="font-bold text-sm text-[#141b2b]">Thẩm định tận nhà</h2>
            <p className="text-xs text-[#717783]">Kỹ thuật viên đến đúng lịch hẹn, kiểm tra miễn phí</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#c1c7d3]/50 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#22c55e]/10 text-[#16a34a] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">payments</span>
          </div>
          <div>
            <h2 className="font-bold text-sm text-[#141b2b]">Giá mong muốn hợp lý</h2>
            <p className="text-xs text-[#717783]">Khách hàng tự đề xuất mức giá kỳ vọng</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#c1c7d3]/50 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#ff8a00]/10 text-[#ea580c] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">local_shipping</span>
          </div>
          <div>
            <h2 className="font-bold text-sm text-[#141b2b]">Tự vận chuyển & Tháo dỡ</h2>
            <p className="text-xs text-[#717783]">Không phát sinh chi phí khuân vác, bao trọn gói</p>
          </div>
        </div>
      </div>

      {/* Main Form Area */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#ba1a1a] flex items-start gap-3 text-sm font-medium animate-shake">
            <span className="material-symbols-outlined text-xl shrink-0">error</span>
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 1: CUSTOMER & ADDRESS DETAILS */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#c1c7d3]/60 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-[#f1f3ff]">
            <div className="w-9 h-9 rounded-xl bg-[#005396] text-white flex items-center justify-center font-bold text-base">
              1
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#141b2b]">Thông tin khách hàng & Địa chỉ thu mua</h2>
              <p className="text-xs text-[#717783]">
                {userProfile
                  ? 'Bạn đang đăng nhập. Có thể chọn địa chỉ đã lưu hoặc nhập địa chỉ mới.'
                  : 'Dành cho khách hàng vãng lai. Vui lòng cung cấp đầy đủ thông tin để kỹ thuật viên liên hệ.'}
              </p>
            </div>
          </div>

          {/* Customer Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-[#414751] mb-1.5">
                Họ và Tên <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717783] text-[20px]">
                  person
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl text-sm font-medium focus:bg-white focus:border-[#005396] focus:ring-1 focus:ring-[#005396] outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#414751] mb-1.5">
                Số điện thoại <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717783] text-[20px]">
                  call
                </span>
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl text-sm font-medium focus:bg-white focus:border-[#005396] focus:ring-1 focus:ring-[#005396] outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#414751] mb-1.5">
                Email nhận thông báo <span className="text-[#717783] font-normal">(không bắt buộc)</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717783] text-[20px]">
                  mail
                </span>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl text-sm font-medium focus:bg-white focus:border-[#005396] focus:ring-1 focus:ring-[#005396] outline-hidden transition-all"
                />
              </div>
            </div>
          </div>

          {/* Address Mode Switch for Logged in Users */}
          {userProfile && userAddresses.length > 0 && (
            <div className="mb-5 p-1 bg-[#f1f3ff] rounded-xl inline-flex gap-1 border border-[#c1c7d3]/40">
              <button
                type="button"
                onClick={() => setAddressMode('saved')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  addressMode === 'new'
                    ? 'bg-[#005396] text-white shadow-xs'
                    : 'text-[#414751] hover:text-[#005396]'
                }`}
              >
                Nhập địa chỉ mới
              </button>
            </div>
          )}

          {/* Saved Addresses List */}
          {addressMode === 'saved' && userAddresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {userAddresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                const fullStr =
                  addr.full_address ||
                  [addr.house_number, addr.street, addr.ward, addr.province].filter(Boolean).join(', ');
                return (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id || null)}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'border-[#005396] bg-[#005396]/5 text-[#141b2b]'
                        : 'border-[#c1c7d3]/60 bg-white hover:border-[#005396]/40'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[22px] mt-0.5 ${
                        isSelected ? 'text-[#005396]' : 'text-[#717783]'
                      }`}
                    >
                      {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                    </span>
                    <div className="flex-1 text-xs">
                      <div className="font-bold text-sm text-[#141b2b] mb-0.5">{fullStr}</div>
                      {addr.note && <div className="text-[#717783]">Ghi chú: {addr.note}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* New / Guest Address Inputs with Full Hierarchy */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Province */}
                <div>
                  <label className="block text-xs font-bold text-[#414751] mb-1.5">
                    Tỉnh / Thành phố <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl text-sm font-medium focus:bg-white focus:border-[#005396] outline-hidden transition-all"
                  >
                    {VIETNAM_ADDRESS_DATA.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Ward */}
                <div>
                  <label className="block text-xs font-bold text-[#414751] mb-1.5">
                    Phường / Xã / Quận <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl text-sm font-medium focus:bg-white focus:border-[#005396] outline-hidden transition-all"
                  >
                    {wardsList.map((w) => (
                      <option key={w.name} value={w.name}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Street */}
                <div>
                  <label className="block text-xs font-bold text-[#414751] mb-1.5">
                    Đường / Phố <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="purchasing-street-suggestions"
                    placeholder="Tên đường hoặc chọn gợi ý"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl text-sm font-medium focus:bg-white focus:border-[#005396] outline-hidden transition-all"
                  />
                  <datalist id="purchasing-street-suggestions">
                    {streetsList.map((s, idx) => (
                      <option key={idx} value={s} />
                    ))}
                  </datalist>
                </div>

                {/* 4. House Number */}
                <div>
                  <label className="block text-xs font-bold text-[#414751] mb-1.5">
                    Số nhà / Căn hộ <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Số nhà, ngõ, tòa nhà..."
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl text-sm font-medium focus:bg-white focus:border-[#005396] outline-hidden transition-all"
                  />
                </div>
              </div>

              {/* Address Note */}
              <div>
                <label className="block text-xs font-bold text-[#414751] mb-1.5">
                  Ghi chú địa chỉ / Chỉ dẫn đường đi{' '}
                  <span className="text-[#717783] font-normal">(VD: Lầu 2, thang máy, gần ngã tư...)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ghi chú chi tiết cho thợ đến thu mua..."
                  value={addressNote}
                  onChange={(e) => setAddressNote(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl text-sm font-medium focus:bg-white focus:border-[#005396] outline-hidden transition-all"
                />
              </div>

              <div className="p-3 bg-[#f1f3ff] rounded-xl text-xs text-[#005396] flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span>
                  <strong>Địa chỉ đầy đủ:</strong> {computedFullAddress}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: CHOOSE DEVICES (Tủ lạnh, Máy giặt, Máy lạnh) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#c1c7d3]/60 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#f1f3ff] flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#005396] text-white flex items-center justify-center font-bold text-base">
                2
              </div>
              <div>
                <h2 className="font-bold text-lg text-[#141b2b]">Chọn các thiết bị cần thanh lý / thu mua</h2>
                <p className="text-xs text-[#717783]">
                  Bạn có thể chọn 1 hoặc nhiều thiết bị trong cùng 1 đơn. Nhập số lượng và giá mong muốn tương ứng.
                </p>
              </div>
            </div>
            <div className="text-xs font-bold px-3 py-1 bg-[#005396]/10 text-[#005396] rounded-full">
              Đã chọn: {totalDeviceCount} thiết bị ({selectedItems.length} loại)
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 1. Tủ lạnh */}
            <div
              className={`rounded-2xl border-2 p-4 sm:p-5 transition-all flex flex-col justify-between ${
                deviceFridge.enabled
                  ? 'border-[#005396] bg-[#005396]/3 shadow-md'
                  : 'border-[#c1c7d3]/50 bg-[#f9f9ff] opacity-80'
              }`}
            >
              <div>
                {/* Header Checkbox */}
                <div
                  onClick={() => setDeviceFridge((prev) => ({ ...prev, enabled: !prev.enabled }))}
                  className="flex items-center justify-between cursor-pointer pb-3 border-b border-[#c1c7d3]/30 select-none"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                        deviceFridge.enabled ? 'bg-[#005396] text-white' : 'border border-[#717783] bg-white'
                      }`}
                    >
                      {deviceFridge.enabled && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                    </div>
                    <span className="font-extrabold text-base text-[#141b2b]">Tủ lạnh</span>
                  </div>
                  <span className="material-symbols-outlined text-2xl text-[#005396]">kitchen</span>
                </div>

                {deviceFridge.enabled ? (
                  <div className="mt-4 space-y-4">
                    {/* Quantity */}
                    <div>
                      <label className="block text-xs font-bold text-[#414751] mb-1">Số lượng tủ lạnh</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setDeviceFridge((prev) => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))
                          }
                          className="w-9 h-9 rounded-lg bg-white border border-[#c1c7d3] hover:bg-[#f1f3ff] text-base font-bold flex items-center justify-center cursor-pointer transition-colors"
                        >
                          -
                        </button>
                        <span className="text-base font-extrabold w-8 text-center text-[#141b2b]">
                          {deviceFridge.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDeviceFridge((prev) => ({ ...prev, quantity: prev.quantity + 1 }))}
                          className="w-9 h-9 rounded-lg bg-white border border-[#c1c7d3] hover:bg-[#f1f3ff] text-base font-bold flex items-center justify-center cursor-pointer transition-colors"
                        >
                          +
                        </button>
                        <span className="text-xs text-[#717783] font-medium">chiếc</span>
                      </div>
                    </div>

                    {/* Desired Price */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-[#414751]">
                          Giá tiền mong muốn (tổng {deviceFridge.quantity} cái)
                        </label>
                        <span className="text-xs font-extrabold text-[#005396]">
                          {Number(deviceFridge.desiredPrice || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          step="50000"
                          min="0"
                          value={deviceFridge.desiredPrice || ''}
                          onChange={(e) =>
                            setDeviceFridge((prev) => ({
                              ...prev,
                              desiredPrice: Number(e.target.value) || 0,
                            }))
                          }
                          placeholder="Ví dụ: 1500000"
                          className="w-full pr-12 pl-3 py-2 bg-white border border-[#c1c7d3] rounded-xl text-sm font-bold text-[#141b2b] focus:border-[#005396] outline-hidden transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#717783]">
                          VNĐ
                        </span>
                      </div>
                      <p className="text-[11px] text-[#717783] mt-1">
                        * Giá mong muốn là tổng số tiền bạn muốn nhận cho cả {deviceFridge.quantity} cái tủ lạnh.
                      </p>
                    </div>

                    {/* Condition Note */}
                    <div>
                      <label className="block text-xs font-bold text-[#414751] mb-1">
                        Mô tả tình trạng tủ lạnh <span className="text-[#717783] font-normal">(Hãng, dung tích, lỗi...)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={deviceFridge.note}
                        onChange={(e) => setDeviceFridge((prev) => ({ ...prev, note: e.target.value }))}
                        placeholder="Vui lòng mô tả tình trạng: Toshiba 200L, còn làm lạnh tốt, bị trầy xước nhẹ..."
                        className="w-full p-2.5 bg-white border border-[#c1c7d3] rounded-xl text-xs text-[#141b2b] focus:border-[#005396] outline-hidden transition-all resize-none"
                      />
                    </div>

                    {/* Image Upload Area for Tủ lạnh */}
                    <div className="pt-2 border-t border-[#c1c7d3]/40">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-[#414751] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px] text-[#005396]">add_a_photo</span>
                          <span>Hình ảnh thực tế tủ lạnh</span>
                        </label>
                        {deviceFridge.previewUrls.length > 0 && (
                          <span className="text-[11px] font-bold text-[#005396] bg-[#005396]/10 px-2 py-0.5 rounded-full">
                            {deviceFridge.previewUrls.length} ảnh
                          </span>
                        )}
                      </div>

                      <label className="group flex flex-col items-center justify-center p-3 border-2 border-dashed border-[#c1c7d3] hover:border-[#005396] bg-[#f9f9ff] hover:bg-[#005396]/5 rounded-xl cursor-pointer transition-all text-center">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleAddImages(setDeviceFridge, e.target.files)}
                          className="hidden"
                        />
                        <span className="material-symbols-outlined text-2xl text-[#717783] group-hover:text-[#005396] transition-colors mb-0.5">
                          cloud_upload
                        </span>
                        <span className="text-xs font-bold text-[#141b2b] group-hover:text-[#005396]">
                          Tải ảnh tủ lạnh lên
                        </span>
                        <span className="text-[10px] text-[#717783] mt-0.5">
                          Tem thông số, nhãn năng lượng, toàn cảnh & lỗi nếu có
                        </span>
                      </label>

                      {deviceFridge.previewUrls.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2.5">
                          {deviceFridge.previewUrls.map((url, imgIdx) => (
                            <div
                              key={imgIdx}
                              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shadow-xs"
                            >
                              <img
                                src={url}
                                alt={`Ảnh tủ lạnh ${imgIdx + 1}`}
                                className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform"
                                onClick={() => setPreviewLightboxUrl(url)}
                              />
                              <button
                                type="button"
                                onClick={() => setPreviewLightboxUrl(url)}
                                title="Xem phóng to"
                                className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-lg">zoom_in</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage(setDeviceFridge, imgIdx);
                                }}
                                title="Xóa ảnh"
                                className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-sm text-xs font-bold"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#717783] mt-4 italic">
                    Nhấp chọn nếu bạn có nhu cầu thanh lý tủ lạnh.
                  </p>
                )}
              </div>
            </div>

            {/* 2. Máy giặt */}
            <div
              className={`rounded-2xl border-2 p-4 sm:p-5 transition-all flex flex-col justify-between ${
                deviceWasher.enabled
                  ? 'border-[#005396] bg-[#005396]/3 shadow-md'
                  : 'border-[#c1c7d3]/50 bg-[#f9f9ff] opacity-80'
              }`}
            >
              <div>
                {/* Header Checkbox */}
                <div
                  onClick={() => setDeviceWasher((prev) => ({ ...prev, enabled: !prev.enabled }))}
                  className="flex items-center justify-between cursor-pointer pb-3 border-b border-[#c1c7d3]/30 select-none"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                        deviceWasher.enabled ? 'bg-[#005396] text-white' : 'border border-[#717783] bg-white'
                      }`}
                    >
                      {deviceWasher.enabled && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                    </div>
                    <span className="font-extrabold text-base text-[#141b2b]">Máy giặt</span>
                  </div>
                  <span className="material-symbols-outlined text-2xl text-[#005396]">local_laundry_service</span>
                </div>

                {deviceWasher.enabled ? (
                  <div className="mt-4 space-y-4">
                    {/* Quantity */}
                    <div>
                      <label className="block text-xs font-bold text-[#414751] mb-1">Số lượng máy giặt</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setDeviceWasher((prev) => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))
                          }
                          className="w-9 h-9 rounded-lg bg-white border border-[#c1c7d3] hover:bg-[#f1f3ff] text-base font-bold flex items-center justify-center cursor-pointer transition-colors"
                        >
                          -
                        </button>
                        <span className="text-base font-extrabold w-8 text-center text-[#141b2b]">
                          {deviceWasher.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDeviceWasher((prev) => ({ ...prev, quantity: prev.quantity + 1 }))}
                          className="w-9 h-9 rounded-lg bg-white border border-[#c1c7d3] hover:bg-[#f1f3ff] text-base font-bold flex items-center justify-center cursor-pointer transition-colors"
                        >
                          +
                        </button>
                        <span className="text-xs text-[#717783] font-medium">chiếc</span>
                      </div>
                    </div>

                    {/* Desired Price */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-[#414751]">
                          Giá tiền mong muốn (tổng {deviceWasher.quantity} cái)
                        </label>
                        <span className="text-xs font-extrabold text-[#005396]">
                          {Number(deviceWasher.desiredPrice || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          step="50000"
                          min="0"
                          value={deviceWasher.desiredPrice || ''}
                          onChange={(e) =>
                            setDeviceWasher((prev) => ({
                              ...prev,
                              desiredPrice: Number(e.target.value) || 0,
                            }))
                          }
                          placeholder="Ví dụ: 1200000"
                          className="w-full pr-12 pl-3 py-2 bg-white border border-[#c1c7d3] rounded-xl text-sm font-bold text-[#141b2b] focus:border-[#005396] outline-hidden transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#717783]">
                          VNĐ
                        </span>
                      </div>
                      <p className="text-[11px] text-[#717783] mt-1">
                        * Giá mong muốn là tổng số tiền bạn muốn nhận cho cả {deviceWasher.quantity} cái máy giặt.
                      </p>
                    </div>

                    {/* Condition Note */}
                    <div>
                      <label className="block text-xs font-bold text-[#414751] mb-1">
                        Mô tả tình trạng máy giặt <span className="text-[#717783] font-normal">(Cửa trước/trên, kg, lỗi...)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={deviceWasher.note}
                        onChange={(e) => setDeviceWasher((prev) => ({ ...prev, note: e.target.value }))}
                        placeholder="Vui lòng mô tả tình trạng: Electrolux cửa ngang 8kg, vắt hơi kêu, còn giặt tốt..."
                        className="w-full p-2.5 bg-white border border-[#c1c7d3] rounded-xl text-xs text-[#141b2b] focus:border-[#005396] outline-hidden transition-all resize-none"
                      />
                    </div>

                    {/* Image Upload Area for Máy giặt */}
                    <div className="pt-2 border-t border-[#c1c7d3]/40">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-[#414751] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px] text-[#005396]">add_a_photo</span>
                          <span>Hình ảnh thực tế máy giặt</span>
                        </label>
                        {deviceWasher.previewUrls.length > 0 && (
                          <span className="text-[11px] font-bold text-[#005396] bg-[#005396]/10 px-2 py-0.5 rounded-full">
                            {deviceWasher.previewUrls.length} ảnh
                          </span>
                        )}
                      </div>

                      <label className="group flex flex-col items-center justify-center p-3 border-2 border-dashed border-[#c1c7d3] hover:border-[#005396] bg-[#f9f9ff] hover:bg-[#005396]/5 rounded-xl cursor-pointer transition-all text-center">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleAddImages(setDeviceWasher, e.target.files)}
                          className="hidden"
                        />
                        <span className="material-symbols-outlined text-2xl text-[#717783] group-hover:text-[#005396] transition-colors mb-0.5">
                          cloud_upload
                        </span>
                        <span className="text-xs font-bold text-[#141b2b] group-hover:text-[#005396]">
                          Tải ảnh máy giặt lên
                        </span>
                        <span className="text-[10px] text-[#717783] mt-0.5">
                          Tem thông số, lồng giặt, nắp mở & toàn cảnh
                        </span>
                      </label>

                      {deviceWasher.previewUrls.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2.5">
                          {deviceWasher.previewUrls.map((url, imgIdx) => (
                            <div
                              key={imgIdx}
                              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shadow-xs"
                            >
                              <img
                                src={url}
                                alt={`Ảnh máy giặt ${imgIdx + 1}`}
                                className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform"
                                onClick={() => setPreviewLightboxUrl(url)}
                              />
                              <button
                                type="button"
                                onClick={() => setPreviewLightboxUrl(url)}
                                title="Xem phóng to"
                                className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-lg">zoom_in</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage(setDeviceWasher, imgIdx);
                                }}
                                title="Xóa ảnh"
                                className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-sm text-xs font-bold"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#717783] mt-4 italic">
                    Nhấp chọn nếu bạn có nhu cầu thanh lý máy giặt.
                  </p>
                )}
              </div>
            </div>

            {/* 3. Máy lạnh */}
            <div
              className={`rounded-2xl border-2 p-4 sm:p-5 transition-all flex flex-col justify-between ${
                deviceAC.enabled
                  ? 'border-[#005396] bg-[#005396]/3 shadow-md'
                  : 'border-[#c1c7d3]/50 bg-[#f9f9ff] opacity-80'
              }`}
            >
              <div>
                {/* Header Checkbox */}
                <div
                  onClick={() => setDeviceAC((prev) => ({ ...prev, enabled: !prev.enabled }))}
                  className="flex items-center justify-between cursor-pointer pb-3 border-b border-[#c1c7d3]/30 select-none"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                        deviceAC.enabled ? 'bg-[#005396] text-white' : 'border border-[#717783] bg-white'
                      }`}
                    >
                      {deviceAC.enabled && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                    </div>
                    <span className="font-extrabold text-base text-[#141b2b]">Máy lạnh</span>
                  </div>
                  <span className="material-symbols-outlined text-2xl text-[#005396]">mode_fan</span>
                </div>

                {deviceAC.enabled ? (
                  <div className="mt-4 space-y-4">
                    {/* Quantity */}
                    <div>
                      <label className="block text-xs font-bold text-[#414751] mb-1">Số lượng máy lạnh</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setDeviceAC((prev) => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))
                          }
                          className="w-9 h-9 rounded-lg bg-white border border-[#c1c7d3] hover:bg-[#f1f3ff] text-base font-bold flex items-center justify-center cursor-pointer transition-colors"
                        >
                          -
                        </button>
                        <span className="text-base font-extrabold w-8 text-center text-[#141b2b]">
                          {deviceAC.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDeviceAC((prev) => ({ ...prev, quantity: prev.quantity + 1 }))}
                          className="w-9 h-9 rounded-lg bg-white border border-[#c1c7d3] hover:bg-[#f1f3ff] text-base font-bold flex items-center justify-center cursor-pointer transition-colors"
                        >
                          +
                        </button>
                        <span className="text-xs text-[#717783] font-medium">bộ</span>
                      </div>
                    </div>

                    {/* Desired Price */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-[#414751]">
                          Giá tiền mong muốn (tổng {deviceAC.quantity} cái)
                        </label>
                        <span className="text-xs font-extrabold text-[#005396]">
                          {Number(deviceAC.desiredPrice || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          step="50000"
                          min="0"
                          value={deviceAC.desiredPrice || ''}
                          onChange={(e) =>
                            setDeviceAC((prev) => ({
                              ...prev,
                              desiredPrice: Number(e.target.value) || 0,
                            }))
                          }
                          placeholder="Ví dụ: 2000000"
                          className="w-full pr-12 pl-3 py-2 bg-white border border-[#c1c7d3] rounded-xl text-sm font-bold text-[#141b2b] focus:border-[#005396] outline-hidden transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#717783]">
                          VNĐ
                        </span>
                      </div>
                      <p className="text-[11px] text-[#717783] mt-1">
                        * Giá mong muốn là tổng số tiền bạn muốn nhận cho cả {deviceAC.quantity} bộ máy lạnh.
                      </p>
                    </div>

                    {/* Condition Note */}
                    <div>
                      <label className="block text-xs font-bold text-[#414751] mb-1">
                        Mô tả tình trạng máy lạnh <span className="text-[#717783] font-normal">(Hãng, 1HP/1.5HP, Inverter...)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={deviceAC.note}
                        onChange={(e) => setDeviceAC((prev) => ({ ...prev, note: e.target.value }))}
                        placeholder="Vui lòng mô tả tình trạng: Daikin 1.5 HP Inverter, còn đủ dàn nóng lạnh, đã tháo sẵn..."
                        className="w-full p-2.5 bg-white border border-[#c1c7d3] rounded-xl text-xs text-[#141b2b] focus:border-[#005396] outline-hidden transition-all resize-none"
                      />
                    </div>

                    {/* Image Upload Area for Máy lạnh */}
                    <div className="pt-2 border-t border-[#c1c7d3]/40">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-[#414751] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px] text-[#005396]">add_a_photo</span>
                          <span>Hình ảnh thực tế máy lạnh</span>
                        </label>
                        {deviceAC.previewUrls.length > 0 && (
                          <span className="text-[11px] font-bold text-[#005396] bg-[#005396]/10 px-2 py-0.5 rounded-full">
                            {deviceAC.previewUrls.length} ảnh
                          </span>
                        )}
                      </div>

                      <label className="group flex flex-col items-center justify-center p-3 border-2 border-dashed border-[#c1c7d3] hover:border-[#005396] bg-[#f9f9ff] hover:bg-[#005396]/5 rounded-xl cursor-pointer transition-all text-center">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleAddImages(setDeviceAC, e.target.files)}
                          className="hidden"
                        />
                        <span className="material-symbols-outlined text-2xl text-[#717783] group-hover:text-[#005396] transition-colors mb-0.5">
                          cloud_upload
                        </span>
                        <span className="text-xs font-bold text-[#141b2b] group-hover:text-[#005396]">
                          Tải ảnh máy lạnh lên
                        </span>
                        <span className="text-[10px] text-[#717783] mt-0.5">
                          Tem thông số, dàn lạnh, dàn nóng & ống đồng nếu có
                        </span>
                      </label>

                      {deviceAC.previewUrls.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2.5">
                          {deviceAC.previewUrls.map((url, imgIdx) => (
                            <div
                              key={imgIdx}
                              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shadow-xs"
                            >
                              <img
                                src={url}
                                alt={`Ảnh máy lạnh ${imgIdx + 1}`}
                                className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform"
                                onClick={() => setPreviewLightboxUrl(url)}
                              />
                              <button
                                type="button"
                                onClick={() => setPreviewLightboxUrl(url)}
                                title="Xem phóng to"
                                className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-lg">zoom_in</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage(setDeviceAC, imgIdx);
                                }}
                                title="Xóa ảnh"
                                className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-sm text-xs font-bold"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#717783] mt-4 italic">
                    Nhấp chọn nếu bạn có nhu cầu thanh lý máy lạnh.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: APPOINTMENT DATE & TIMESLOT */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#c1c7d3]/60 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-[#f1f3ff]">
            <div className="w-9 h-9 rounded-xl bg-[#005396] text-white flex items-center justify-center font-bold text-base">
              3
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#141b2b]">Chọn ngày hẹn & Khung giờ thu mua</h2>
              <p className="text-xs text-[#717783]">
                Kỹ thuật viên sẽ đến địa chỉ của bạn theo đúng thời gian đã đặt để kiểm tra thiết bị.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Selection */}
            <div>
              <label className="block text-xs font-bold text-[#414751] mb-2">
                Ngày hẹn thu mua <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="date"
                min={todayStr}
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl text-sm font-bold text-[#141b2b] focus:bg-white focus:border-[#005396] outline-hidden transition-all"
              />
              <p className="text-xs text-[#717783] mt-1.5">
                Hỗ trợ thu mua tất cả các ngày trong tuần (kể cả Thứ 7 và Chủ Nhật).
              </p>
            </div>

            {/* Timeslot Selection */}
            <div>
              <label className="block text-xs font-bold text-[#414751] mb-2">
                Khung giờ hẹn <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {dbTimeSlots.length > 0 ? (
                  dbTimeSlots.map((slot) => {
                    const isSelected = selectedTimeSlot?.id === slot.id;
                    const timeLabel = `${String(slot.start_time).slice(0, 5)} - ${String(
                      slot.end_time
                    ).slice(0, 5)}`;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs ${
                          isSelected
                            ? 'bg-[#005396] text-white border-[#005396] shadow-sm'
                            : 'bg-[#f9f9ff] border-[#c1c7d3]/60 text-[#414751] hover:border-[#005396]'
                        }`}
                      >
                        {timeLabel}
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-full py-3 text-center text-xs text-[#717783]">
                    Đang tải khung giờ khả dụng...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: SUMMARY & SUBMIT */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-br from-[#003c6e] to-[#005396] text-white rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-bold">
                <span className="material-symbols-outlined text-[16px]">receipt</span>
                <span>Tóm tắt đơn thu mua</span>
              </div>
              <div className="text-sm text-blue-100 space-y-1">
                <p>
                  <strong>Khách hàng:</strong> {fullName || 'Chưa nhập'} ({phone || 'Chưa nhập SĐT'})
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {computedFullAddress}
                </p>
                <p>
                  <strong>Thiết bị ({totalDeviceCount}):</strong>{' '}
                  {selectedItems.map((it) => `${it.device} (x${it.quantity})`).join(', ') || 'Chưa chọn'}
                </p>
                <p>
                  <strong>Lịch hẹn:</strong>{' '}
                  {selectedTimeSlot
                    ? `${String(selectedTimeSlot.start_time).slice(0, 5)} - ${String(
                        selectedTimeSlot.end_time
                      ).slice(0, 5)}`
                    : ''}
                  , Ngày {appointmentDate}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start lg:items-end w-full lg:w-auto border-t lg:border-t-0 border-white/20 pt-4 lg:pt-0">
              <div className="text-xs text-blue-200 font-medium">Tổng giá bạn mong muốn:</div>
              <div className="text-2xl sm:text-3xl font-black text-[#ffd700] mb-4">
                {totalDesiredPrice.toLocaleString('vi-VN')} VNĐ
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full lg:w-auto px-8 py-3.5 bg-[#ffd700] hover:bg-[#ffdf33] active:scale-95 text-[#003c6e] font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[48px]"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                    <span>Đang gửi yêu cầu...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">send</span>
                    <span>Gửi Yêu Cầu Thu Mua Ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* SUCCESS MODAL */}
      {/* ========================================================================= */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#c1c7d3]/30 text-center relative animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-[#22c55e]/15 text-[#16a34a] mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl font-bold">check_circle</span>
            </div>

            <h2 className="text-2xl font-black text-[#141b2b] mb-1">Gửi Yêu Cầu Thành Công!</h2>
            <p className="text-xs sm:text-sm text-[#717783] mb-6">
              Mã đơn thu mua của bạn là: <strong className="text-[#005396] text-base">{createdOrderCode}</strong>
            </p>

            <div className="bg-[#f8f9ff] rounded-2xl p-4 text-left text-xs space-y-2 mb-6 border border-[#c1c7d3]/30">
              <div className="font-bold text-sm text-[#141b2b] border-b border-[#e1e8fd] pb-1.5 mb-2 flex items-center justify-between">
                <span>Chi tiết yêu cầu</span>
                <span className="text-[#005396] font-extrabold">{totalDesiredPrice.toLocaleString('vi-VN')} đ</span>
              </div>
              <p>
                <strong>Khách hàng:</strong> {fullName} - {phone}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {computedFullAddress}
              </p>
              <p>
                <strong>Thiết bị:</strong> {selectedItems.map((it) => `${it.device} x${it.quantity}`).join(', ')}
              </p>
              <p>
                <strong>Thời gian hẹn:</strong> {appointmentDate} (
                {selectedTimeSlot
                  ? `${String(selectedTimeSlot.start_time).slice(0, 5)} - ${String(
                      selectedTimeSlot.end_time
                    ).slice(0, 5)}`
                  : ''}
                )
              </p>
            </div>

            <div className="p-3 bg-[#e1f8eb] text-[#065f46] rounded-xl text-xs font-medium mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-base shrink-0">info</span>
              <span>Đội ngũ kỹ thuật viên sẽ liên hệ với bạn trong vòng 15-30 phút để xác nhận lịch thẩm định.</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {userProfile ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccessModalOpen(false);
                    setActiveTab('history');
                  }}
                  className="flex-1 py-3 bg-[#005396] hover:bg-[#003c6e] text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Xem trong Lịch sử đơn
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccessModalOpen(false);
                    setActiveTab('home');
                  }}
                  className="flex-1 py-3 bg-[#005396] hover:bg-[#003c6e] text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Về trang chủ
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  // Reset form to place another
                  setDeviceFridge({ enabled: true, quantity: 1, desiredPrice: 1500000, note: '', images: [], previewUrls: [] });
                  setDeviceWasher({ enabled: false, quantity: 1, desiredPrice: 1200000, note: '', images: [], previewUrls: [] });
                  setDeviceAC({ enabled: false, quantity: 1, desiredPrice: 2000000, note: '', images: [], previewUrls: [] });
                }}
                className="py-3 px-4 border border-[#c1c7d3] hover:bg-[#f1f3ff] text-[#414751] font-bold rounded-xl text-sm transition-all cursor-pointer"
              >
                Tạo yêu cầu mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IMAGE LIGHTBOX MODAL */}
      {/* ========================================================================= */}
      {previewLightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewLightboxUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewLightboxUrl(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Đóng xem ảnh"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <img
              src={previewLightboxUrl}
              alt="Ảnh thiết bị chi tiết"
              className="max-h-[85vh] max-w-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
