import React, { useState, useEffect } from 'react';
import { ActiveTab, UserProfile, AddressRecord, CustomerAddressData } from '../types';
import { authService } from '../services/authService';
import { addressService } from '../services/addressService';
import { AddressSelector } from './AddressSelector';

interface AccountPageProps {
  setActiveTab: (tab: ActiveTab) => void;
  bookingCount: number;
  userProfile?: UserProfile | null;
  onUpdateProfile?: (profile: UserProfile) => void;
  onLogout?: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  setActiveTab,
  bookingCount,
  userProfile,
  onUpdateProfile,
  onLogout
}) => {
  // Personal profile form state
  const [profileForm, setProfileForm] = useState({
    lastName: userProfile?.last_name || 'Nguyễn Văn',
    firstName: userProfile?.first_name || 'A',
    phone: userProfile?.phone_number || '0901234567',
    email: userProfile?.email || 'nguyenvana@example.com',
  });

  // Sync state if userProfile prop changes
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        lastName: userProfile.last_name || '',
        firstName: userProfile.first_name || '',
        phone: userProfile.phone_number || '',
        email: userProfile.email || '',
      });
    }
  }, [userProfile]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Address list state
  const [addresses, setAddresses] = useState<AddressRecord[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // Address form modal / inline state
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressData, setAddressData] = useState<CustomerAddressData>({
    province_code: '79',
    province_name: 'Thành phố Hồ Chí Minh',
    ward_code: '',
    ward_name: '',
    house_number: '',
    street: '',
    full_address: '',
    latitude: null,
    longitude: null,
    note: '',
  });
  const [addressNote, setAddressNote] = useState<string>('');

  // Fetch addresses on mount or when user Profile changes
  useEffect(() => {
    if (!userProfile?.id) {
      setAddresses([]);
      setIsLoadingAddresses(false);
      return;
    }
    let isMounted = true;
    const userId = userProfile.id;
    
    setIsLoadingAddresses(true);
    addressService.getUserAddresses(userId).then((data) => {
      if (isMounted) {
        setAddresses(data || []);
        setIsLoadingAddresses(false);
      }
    }).catch(() => {
      if (isMounted) setIsLoadingAddresses(false);
    });

    return () => { isMounted = false; };
  }, [userProfile?.id]);

  // Save personal information
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);

    const updatedProfile: UserProfile = {
      id: userProfile?.id || Date.now(),
      first_name: profileForm.firstName.trim(),
      last_name: profileForm.lastName.trim(),
      email: profileForm.email.trim(),
      phone_number: profileForm.phone.trim(),
      role: userProfile?.role || 'customer',
      avatar: userProfile?.avatar || null,
      birth_year: userProfile?.birth_year || null,
    };

    const res = await authService.updateUserProfile(updatedProfile);
    if (res.success) {
      if (onUpdateProfile) {
        onUpdateProfile(updatedProfile);
      }
      setIsEditingProfile(false);
      setSaveStatus({ type: 'success', message: 'Đã cập nhật thông tin cá nhân thành công!' });
      setTimeout(() => setSaveStatus(null), 4000);
    } else {
      setSaveStatus({ type: 'error', message: res.message || 'Lỗi khi lưu thông tin cá nhân.' });
    }
  };

  // Open form for adding new address
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressData({
      province_code: '79',
      province_name: 'Thành phố Hồ Chí Minh',
      ward_code: '',
      ward_name: '',
      house_number: '',
      street: '',
      full_address: '',
      latitude: null,
      longitude: null,
      note: '',
    });
    setAddressNote('');
    setIsAddressFormOpen(true);
  };

  // Open form for editing existing address
  const handleOpenEditAddress = (addr: AddressRecord) => {
    setEditingAddressId(addr.id || null);
    setAddressData({
      province_code: addr.province_code || '',
      province_name: addr.province_name || addr.province || '',
      ward_code: addr.ward_code || '',
      ward_name: addr.ward_name || addr.ward || '',
      house_number: addr.house_number || '',
      street: addr.street || '',
      full_address: addr.full_address || '',
      latitude: addr.latitude || null,
      longitude: addr.longitude || null,
      note: addr.note || '',
    });
    setAddressNote(addr.note || '');
    setIsAddressFormOpen(true);
  };

  // Delete an address
  const handleDeleteAddress = async (addressId?: number) => {
    if (!addressId) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này khỏi tài khoản?')) return;

    await addressService.deleteAddress(addressId);
    setAddresses((prev) => prev.filter((a) => a.id !== addressId));
    setSaveStatus({ type: 'success', message: 'Đã xóa địa chỉ thành công.' });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Save address (Add or Edit)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = userProfile?.id || 1;

    if (!addressData.province_name || !addressData.ward_name) {
      alert('Vui lòng chọn Tỉnh/Thành phố và Phường/Xã.');
      return;
    }

    const full =
      addressData.full_address ||
      [addressData.house_number, addressData.street, addressData.ward_name, addressData.province_name]
        .filter(Boolean)
        .join(', ');

    const payload = {
      province: addressData.province_name,
      ward: addressData.ward_name,
      province_code: addressData.province_code || null,
      province_name: addressData.province_name || null,
      ward_code: addressData.ward_code || null,
      ward_name: addressData.ward_name || null,
      street: addressData.street || null,
      house_number: addressData.house_number || null,
      full_address: full,
      latitude: addressData.latitude || null,
      longitude: addressData.longitude || null,
      note: addressNote.trim() || null,
    };

    if (editingAddressId) {
      // Update existing address
      const res = await addressService.updateAddress(editingAddressId, payload);
      if (res.success) {
        setAddresses((prev) =>
          prev.map((a) => (a.id === editingAddressId ? { ...a, ...payload } : a))
        );
        setIsAddressFormOpen(false);
        setSaveStatus({ type: 'success', message: 'Cập nhật địa chỉ thành công!' });
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } else {
      // Add new address
      const res = await addressService.addAddress({
        user_id: userId,
        ...payload,
      });

      if (res.success) {
        const newRecord: AddressRecord = res.data || {
          id: Date.now(),
          user_id: userId,
          ...payload,
        };
        setAddresses((prev) => [newRecord, ...prev]);
        setIsAddressFormOpen(false);
        setSaveStatus({ type: 'success', message: 'Thêm địa chỉ mới thành công!' });
        setTimeout(() => setSaveStatus(null), 3000);
      }
    }
  };

  const handleSignOut = () => {
    authService.logout();
    if (onLogout) onLogout();
    setActiveTab('home');
  };

  const fullName = `${profileForm.lastName} ${profileForm.firstName}`.trim() || 'Khách hàng';

  if (!userProfile) {
    return (
      <div className="pt-36 sm:pt-38 lg:pt-36 pb-16 max-w-xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-[#c1c7d3]/40 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-[#e9edff] text-[#005396] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#005396]/20">
            <span className="material-symbols-outlined text-3xl">manage_accounts</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#141b2b] mb-2">
            Tài Khoản Cá Nhân
          </h2>
          <p className="text-xs sm:text-sm text-[#414751] mb-6 leading-relaxed">
            Vui lòng đăng nhập hoặc đăng ký tài khoản để xem và cập nhật thông tin cá nhân, quản lý sổ địa chỉ nhận dịch vụ.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setActiveTab('auth')}
              className="bg-[#005396] hover:bg-[#003868] text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">login</span>
              <span>Đăng nhập ngay</span>
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className="bg-[#f1f3ff] hover:bg-[#e2e7ff] text-[#005396] font-bold py-3 px-6 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Về trang chủ</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-36 sm:pt-38 lg:pt-36 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title Header */}
      <div className="mb-6 border-b border-[#c1c7d3]/30 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141b2b] tracking-tight">Tài Khoản Cá Nhân</h1>
          <p className="text-xs sm:text-sm text-[#414751] mt-1 font-medium">
            Quản lý thông tin hồ sơ cá nhân và danh sách địa chỉ nhận dịch vụ kỹ thuật.
          </p>
        </div>
        {userProfile && (
          <button
            onClick={handleSignOut}
            className="hidden sm:flex text-[#ba1a1a] hover:bg-[#ffdad6] font-bold px-4 py-2 rounded-xl transition-colors text-xs sm:text-sm items-center gap-1.5 cursor-pointer border border-[#ba1a1a]/20"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Đăng xuất</span>
          </button>
        )}
      </div>

      {/* Global Toast Status Banner */}
      {saveStatus && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border shadow-xs transition-all ${
            saveStatus.type === 'success'
              ? 'bg-[#e1f8eb] border-[#10b981]/30 text-[#047857]'
              : 'bg-[#ffdad6] border-[#ba1a1a]/30 text-[#ba1a1a]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {saveStatus.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{saveStatus.message}</span>
        </div>
      )}

      {/* Admin Quick Access Banner */}
      {userProfile?.role === 'admin' && (
        <div className="bg-gradient-to-r from-[#005396] to-[#003868] text-white rounded-2xl p-5 shadow-md mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
            </div>
            <div>
              <h3 className="text-base font-extrabold">Bảng Quản Trị Hệ Thống (Admin)</h3>
              <p className="text-xs text-white/80 mt-0.5">Quản lý đơn dịch vụ, kỹ thuật viên, danh mục và báo cáo tài chính.</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('admin')}
            className="bg-[#ff8a00] hover:bg-[#914c00] text-white font-bold px-5 py-2.5 rounded-xl shadow transition-all cursor-pointer whitespace-nowrap text-xs sm:text-sm min-h-[40px]"
          >
            Truy cập Admin &rarr;
          </button>
        </div>
      )}

      {/* Personal Information & Profile Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#005396] text-white rounded-full flex items-center justify-center font-black text-xl sm:text-2xl shadow-sm uppercase shrink-0">
              {fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-extrabold text-[#141b2b]">{fullName}</h2>
                <span className="inline-flex items-center gap-1 bg-[#e9edff] text-[#005396] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#005396]/10">
                  <span className="material-symbols-outlined text-[12px]">badge</span>
                  <span>{userProfile?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</span>
                </span>
              </div>
              <p className="text-xs text-[#717783] mt-0.5 font-medium">
                Thông tin tài khoản và liên hệ cá nhân
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="bg-[#e9edff] text-[#005396] hover:bg-[#005396] hover:text-white font-bold px-4 py-2 rounded-xl transition-all text-xs cursor-pointer whitespace-nowrap flex items-center gap-1.5 self-end sm:self-auto"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isEditingProfile ? 'close' : 'edit'}
            </span>
            <span>{isEditingProfile ? 'Hủy chỉnh sửa' : 'Chỉnh sửa'}</span>
          </button>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#414751] block mb-1">Họ và tên lót *</label>
                <input
                  type="text"
                  required
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn"
                  className="w-full bg-[#f8f9ff] border border-[#c1c7d3] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#005396] focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#414751] block mb-1">Tên *</label>
                <input
                  type="text"
                  required
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  placeholder="Ví dụ: Anh"
                  className="w-full bg-[#f8f9ff] border border-[#c1c7d3] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#005396] focus:bg-white font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#414751] block mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="0901234567"
                  className="w-full bg-[#f8f9ff] border border-[#c1c7d3] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#005396] focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#414751] block mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="example@gmail.com"
                  className="w-full bg-[#f8f9ff] border border-[#c1c7d3] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#005396] focus:bg-white font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#005396] hover:bg-[#0f6cbd] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Lưu thông tin cá nhân
              </button>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#414751] rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="bg-[#f8f9ff] p-3.5 rounded-xl border border-gray-100">
              <span className="text-[11px] text-[#717783] uppercase font-bold block mb-0.5">Họ và tên lót:</span>
              <span className="font-bold text-[#141b2b]">{profileForm.lastName || '—'}</span>
            </div>
            <div className="bg-[#f8f9ff] p-3.5 rounded-xl border border-gray-100">
              <span className="text-[11px] text-[#717783] uppercase font-bold block mb-0.5">Tên:</span>
              <span className="font-bold text-[#141b2b]">{profileForm.firstName || '—'}</span>
            </div>
            <div className="bg-[#f8f9ff] p-3.5 rounded-xl border border-gray-100">
              <span className="text-[11px] text-[#717783] uppercase font-bold block mb-0.5">Số điện thoại:</span>
              <span className="font-bold text-[#141b2b]">{profileForm.phone || '—'}</span>
            </div>
            <div className="bg-[#f8f9ff] p-3.5 rounded-xl border border-gray-100">
              <span className="text-[11px] text-[#717783] uppercase font-bold block mb-0.5">Email:</span>
              <span className="font-bold text-[#141b2b]">{profileForm.email || '—'}</span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Multiple Address Management */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-gray-100 mb-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-extrabold text-[#005396] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">location_on</span>
              Danh Sách Địa Chỉ Nhận Dịch Vụ
              <span className="text-xs font-bold px-2.5 py-0.5 bg-[#e9edff] text-[#005396] rounded-full">
                {addresses.length}
              </span>
            </h2>
            <p className="text-xs text-[#717783] mt-0.5">
              Khách hàng có thể lưu nhiều địa chỉ để chọn nhanh khi đặt dịch vụ kỹ thuật.
            </p>
          </div>

          <button
            onClick={handleOpenAddAddress}
            className="px-3.5 py-2 bg-[#005396] hover:bg-[#0f6cbd] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Thêm địa chỉ</span>
          </button>
        </div>

        {/* Address Add / Edit Form Modal / Inline Card with VIETMAP Autocomplete */}
        {isAddressFormOpen && (
          <form
            onSubmit={handleSaveAddress}
            className="bg-[#f8f9ff] p-4 sm:p-5 rounded-2xl border-2 border-[#005396]/30 space-y-3.5"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <h3 className="text-xs sm:text-sm font-extrabold text-[#005396] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">edit_location</span>
                <span>{editingAddressId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddressFormOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* AddressSelector Component */}
            <AddressSelector
              value={addressData}
              onChange={(updated) => setAddressData(updated)}
              showNoteField={true}
              noteValue={addressNote}
              onNoteChange={(txt) => setAddressNote(txt)}
              required={true}
              idPrefix="account_addr"
            />

            {/* Submit Action buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200/60">
              <button
                type="submit"
                className="px-4 py-2 bg-[#005396] hover:bg-[#0f6cbd] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                {editingAddressId ? 'Cập nhật địa chỉ' : 'Lưu địa chỉ'}
              </button>
              <button
                type="button"
                onClick={() => setIsAddressFormOpen(false)}
                className="px-3.5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        {/* Address List Display */}
        {isLoadingAddresses ? (
          <div className="py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-7 w-7 border-3 border-[#005396] border-t-transparent mb-2"></div>
            <p className="text-xs text-[#005396] font-bold">Đang tải danh sách địa chỉ...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="p-6 text-center bg-[#f8f9ff] rounded-2xl border border-dashed border-gray-200">
            <span className="material-symbols-outlined text-3xl text-gray-300 mb-1">add_location_alt</span>
            <p className="text-xs text-[#717783] font-medium mb-3">Bạn chưa lưu địa chỉ dịch vụ nào.</p>
            <button
              onClick={handleOpenAddAddress}
              className="px-3.5 py-1.5 bg-[#005396] text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Thêm địa chỉ ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {addresses.map((addr, idx) => (
              <div
                key={addr.id || idx}
                className="p-4 rounded-xl border border-gray-200 bg-[#f8f9ff]/60 hover:bg-white hover:border-[#005396]/30 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#005396] bg-[#e9edff] px-2.5 py-0.5 rounded-md">
                      <span className="material-symbols-outlined text-[14px]">home_pin</span>
                      <span>Địa chỉ #{idx + 1}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditAddress(addr)}
                        className="text-xs text-[#005396] hover:bg-[#e9edff] p-1 rounded-md font-bold cursor-pointer flex items-center gap-0.5"
                        title="Sửa địa chỉ"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                        <span className="hidden sm:inline">Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-xs text-[#ba1a1a] hover:bg-[#ffdad6] p-1 rounded-md font-bold cursor-pointer flex items-center gap-0.5"
                        title="Xóa địa chỉ"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                        <span className="hidden sm:inline">Xóa</span>
                      </button>
                    </div>
                  </div>

                  {/* Full Address */}
                  <p className="text-xs sm:text-sm font-bold text-[#141b2b] leading-relaxed mb-1">
                    {addr.full_address}
                  </p>

                  {/* Details */}
                  {(addr.house_number || addr.street || addr.ward || addr.province) && (
                    <p className="text-[11px] text-[#717783] font-medium">
                      {[addr.house_number ? `Số ${addr.house_number}` : '', addr.street, addr.ward, addr.province].filter(Boolean).join(' • ')}
                    </p>
                  )}

                  {/* Note */}
                  {addr.note && (
                    <p className="text-[11px] text-[#914c00] bg-amber-50 border border-amber-200/60 p-2 rounded-lg mt-2 font-medium">
                      📌 Ghi chú: {addr.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: Bookings & Support Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 space-y-2">
          <h3 className="text-sm font-bold text-[#141b2b] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#005396]">receipt_long</span>
            <span>Lịch hẹn đã đặt</span>
          </h3>
          <p className="text-xs text-[#414751]">Hiện tại bạn có <strong className="text-[#005396]">{bookingCount}</strong> lịch hẹn dịch vụ kỹ thuật.</p>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-bold text-[#005396] hover:underline cursor-pointer pt-1 inline-block"
          >
            Xem lịch sử đặt dịch vụ &rarr;
          </button>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 space-y-2">
          <h3 className="text-sm font-bold text-[#141b2b] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#005396]">support_agent</span>
            <span>Hỗ trợ kỹ thuật 24/7</span>
          </h3>
          <p className="text-xs text-[#414751]">Zalo / Hotline: <strong className="text-[#ba1a1a]">0352572821</strong> • Email: support@dienlanhcongthuong.com</p>
          <a
            href="tel:0352572821"
            className="text-xs font-bold text-[#005396] hover:underline cursor-pointer pt-1 inline-block"
          >
            Liên hệ Zalo / Gọi ngay &rarr;
          </a>
        </div>
      </div>

      {userProfile && (
        <button
          onClick={handleSignOut}
          className="sm:hidden w-full flex items-center justify-center gap-2 bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white font-bold py-3 rounded-xl transition-colors cursor-pointer text-xs"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Đăng xuất tài khoản</span>
        </button>
      )}
    </div>
  );
};
