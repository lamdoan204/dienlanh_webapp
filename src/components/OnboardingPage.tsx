import React, { useState } from 'react';
import { ActiveTab, UserProfile, CustomerAddressData } from '../types';
import { Logo } from './Logo';
import { authService } from '../services/authService';
import { addressService } from '../services/addressService';
import { AddressSelector } from './AddressSelector';

interface OnboardingPageProps {
  setActiveTab: (tab: ActiveTab) => void;
  userProfile?: UserProfile | null;
  onUpdateProfile?: (profile: UserProfile) => void;
}

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jude',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lola',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
];

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  setActiveTab,
  userProfile,
  onUpdateProfile,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(
    userProfile?.avatar || AVATARS[0]
  );
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [birthYear, setBirthYear] = useState<string>('');

  // Address fields managed by AddressSelector
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

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!lastName.trim() || !firstName.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ Họ và Tên.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ Email.');
      return;
    }

    if (!addressData.province_name?.trim() || !addressData.ward_name?.trim()) {
      setErrorMessage('Vui lòng chọn Tỉnh/Thành phố và Phường/Xã.');
      return;
    }

    setLoading(true);

    try {
      const activeUser = userProfile || authService.getStoredProfile();
      const userId = activeUser?.id || Date.now();

      // Calculated full address string
      const computedFullAddress =
        addressData.full_address ||
        [
          addressData.house_number?.trim(),
          addressData.street?.trim(),
          addressData.ward_name?.trim(),
          addressData.province_name?.trim(),
        ]
          .filter(Boolean)
          .join(', ');

      // 1. Add Address Record to public.address database table
      const addressRes = await addressService.addAddress({
        user_id: userId,
        province: addressData.province_name.trim(),
        ward: addressData.ward_name.trim(),
        street: addressData.street?.trim() || null,
        house_number: addressData.house_number?.trim() || null,
        full_address: computedFullAddress,
        latitude: addressData.latitude ?? null,
        longitude: addressData.longitude ?? null,
        note: addressNote.trim() || addressData.note?.trim() || null,
      });

      if (!addressRes.success) {
        console.warn('Lưu địa chỉ thông báo:', addressRes.message);
      }

      // 2. Update local profile object and database
      const updatedProfile: UserProfile = {
        id: userId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim() || activeUser?.email || '',
        phone_number: activeUser?.phone_number || '0900000000',
        role: activeUser?.role || 'customer',
        avatar: selectedAvatar,
        birth_year: birthYear ? Number(birthYear) : null,
      };

      const updateRes = await authService.updateUserProfile(updatedProfile);
      if (!updateRes.success) {
        setErrorMessage(updateRes.message || 'Lỗi cập nhật hồ sơ. Vui lòng thử lại.');
        setLoading(false);
        return;
      }

      if (onUpdateProfile) {
        onUpdateProfile(updatedProfile);
      }

      setSuccessMessage('Hồ sơ và địa chỉ mặc định đã được lưu thành công!');

      setTimeout(() => {
        setActiveTab('home');
      }, 1500);
    } catch (error: any) {
      console.error('Error completing profile:', error);
      setErrorMessage('Đã xảy ra lỗi khi hoàn tất hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-36 sm:pt-38 lg:pt-36 pb-16 min-h-screen bg-[#f9f9ff] text-[#141b2b] flex flex-col items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#c1c7d3]/30 my-4">
        {/* Header & Branding */}
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <Logo size="lg" className="mb-2" />
          <h2 className="text-xl font-bold text-[#141b2b]">Thiết lập hồ sơ</h2>
          <p className="text-xs text-[#414751] mt-1">
            Hoàn thiện thông tin để bắt đầu sử dụng dịch vụ.
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="mb-8 flex items-center justify-center max-w-sm mx-auto">
          <div className="flex items-center w-full">
            <div className="flex flex-col items-center relative">
              <div className="w-8 h-8 rounded-full bg-[#005396] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                <span className="material-symbols-outlined text-[16px]">check</span>
              </div>
              <span className="text-[11px] font-bold text-[#005396] mt-1.5 absolute top-8 whitespace-nowrap">
                Đăng ký
              </span>
            </div>

            <div className="flex-1 h-1 bg-[#005396] mx-3 rounded-full" />

            <div className="flex flex-col items-center relative">
              <div className="w-8 h-8 rounded-full bg-[#ff8a00] flex items-center justify-center text-white font-bold text-xs shadow-[0_0_8px_rgba(255,138,0,0.5)]">
                2
              </div>
              <span className="text-[11px] font-bold text-[#914c00] mt-1.5 absolute top-8 whitespace-nowrap">
                Hồ sơ
              </span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#ba1a1a] rounded-xl text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-3 bg-[#e1f8eb] border border-[#10b981]/30 text-[#10b981] rounded-xl text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleComplete} className="space-y-6">
          {/* Avatar Selection */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-[#414751] mb-2">Chọn ảnh đại diện</span>
            <div className="flex flex-wrap justify-center gap-3">
              {AVATARS.map((avatar, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`relative w-12 h-12 rounded-full overflow-hidden transition-all border-2 cursor-pointer ${
                    selectedAvatar === avatar
                      ? 'border-[#005396] scale-105 shadow-md ring-2 ring-[#005396]/20'
                      : 'border-transparent hover:border-[#c1c7d3]'
                  }`}
                >
                  <img
                    src={avatar}
                    alt={`Avatar ${idx + 1}`}
                    className="w-full h-full object-cover bg-[#f1f3ff]"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-[#c1c7d3]/30 w-full" />

          {/* Name & Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-xs font-bold text-[#141b2b] mb-1" htmlFor="lastName">
                Họ và tên đệm
              </label>
              <input
                id="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn"
                className="w-full px-4 py-2.5 rounded-xl border border-[#c1c7d3] bg-[#f9f9ff] text-sm focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396]/30 transition-all text-[#141b2b]"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-bold text-[#141b2b] mb-1" htmlFor="firstName">
                Tên
              </label>
              <input
                id="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ví dụ: A"
                className="w-full px-4 py-2.5 rounded-xl border border-[#c1c7d3] bg-[#f9f9ff] text-sm focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396]/30 transition-all text-[#141b2b]"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-[#141b2b] mb-1" htmlFor="email">
              Email <span className="text-[#ba1a1a]">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#717783]">
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ví dụ: nguyenvana@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#c1c7d3] bg-[#f9f9ff] text-sm focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396]/30 transition-all text-[#141b2b]"
              />
            </div>
          </div>

          {/* Birth Year */}
          <div>
            <label className="block text-xs font-bold text-[#141b2b] mb-1" htmlFor="birthYear">
              Năm sinh
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#717783]">
                <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              </span>
              <input
                id="birthYear"
                type="number"
                min="1930"
                max="2026"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="Ví dụ: 1990"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#c1c7d3] bg-[#f9f9ff] text-sm focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396]/30 transition-all text-[#141b2b]"
              />
            </div>
          </div>

          {/* Address Section with AddressSelector */}
          <div className="pt-4 pb-1 border-t border-[#c1c7d3]/30 mt-4">
            <h3 className="text-sm font-bold text-[#141b2b] flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#005396]">location_on</span>
              <span>Địa chỉ dịch vụ mặc định (Gợi ý thông minh &amp; Tự động lưu)</span>
            </h3>

            <div className="bg-[#f8f9ff] p-4 rounded-xl border border-[#c1c7d3]/40">
              <AddressSelector
                value={addressData}
                onChange={(updated) => setAddressData(updated)}
                showNoteField={true}
                noteValue={addressNote}
                onNoteChange={(txt) => setAddressNote(txt)}
                required={true}
                idPrefix="onboarding_addr"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#005396] hover:bg-[#0f6cbd] disabled:bg-[#005396]/50 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer min-h-[44px]"
            >
              <span>{loading ? 'Đang lưu thông tin...' : 'Lưu thông tin'}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
