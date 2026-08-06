import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface OnboardingPageProps {
  setActiveTab: (tab: ActiveTab) => void;
}

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jude',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lola',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max'
];

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ setActiveTab }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Address fields
  const [province, setProvince] = useState('');
  const [ward, setWard] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');

  const [loading, setLoading] = useState(false);

  const fullAddress = [houseNumber, street, ward, province].filter(Boolean).join(', ');

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSupabaseConfigured() && supabase) {
        // You could update a users/profiles table here.
        // For now we just simulate success.
        // const { data: { user } } = await supabase.auth.getUser();
        // if (user) {
        //   await supabase.from('profiles').upsert({ id: user.id, full_name: `${lastName} ${firstName}`, avatar_url: selectedAvatar, etc... })
        // }
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setActiveTab('home');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 lg:pt-28 pb-16 px-4 sm:px-6 flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#c1c7d3]/30 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#141b2b]">Hoàn thiện hồ sơ</h1>
          <p className="text-sm text-[#414751] mt-2">
            Cung cấp thông tin để chúng tôi phục vụ bạn tốt nhất
          </p>
        </div>

        <form onSubmit={handleComplete} className="space-y-8">
          {/* Avatar Selection */}
          <div>
            <label className="text-sm font-bold text-[#141b2b] block mb-3 text-center">Chọn ảnh đại diện</label>
            <div className="flex flex-wrap justify-center gap-4">
              {AVATARS.map((avatar, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`relative w-16 h-16 rounded-full overflow-hidden transition-all border-2 cursor-pointer ${
                    selectedAvatar === avatar ? 'border-[#005396] scale-110 shadow-md ring-4 ring-[#e9edff]' : 'border-transparent hover:border-[#c1c7d3]'
                  }`}
                >
                  <img src={avatar} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover bg-[#f1f3ff]" />
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-[#c1c7d3]/30 w-full" />

          {/* Personal Information */}
          <div>
            <h3 className="text-base font-bold text-[#141b2b] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#005396]">person</span>
              Thông tin cá nhân
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#414751] block mb-1">Họ và tên đệm</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#414751] block mb-1">Tên</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ví dụ: A"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#414751] block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#414751] block mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396]"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-base font-bold text-[#141b2b] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#005396]">location_on</span>
              Địa chỉ liên hệ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#414751] block mb-1">Tỉnh / Thành phố</label>
                <input
                  type="text"
                  required
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Ví dụ: TP. Hồ Chí Minh"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#414751] block mb-1">Phường / Xã</label>
                <input
                  type="text"
                  required
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="Ví dụ: Phường 1"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#414751] block mb-1">Tên đường</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Ví dụ: Lê Lợi"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#414751] block mb-1">Số nhà</label>
                <input
                  type="text"
                  required
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  placeholder="Ví dụ: 123A"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396]"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-[#414751] block mb-1">Địa chỉ đầy đủ (Gợi ý tự động)</label>
                <div className="w-full bg-[#f1f3ff] border border-[#c1c7d3]/50 rounded-xl px-4 py-3 text-sm text-[#414751] min-h-[44px]">
                  {fullAddress || <span className="text-[#a0a5b1]">Sẽ tự động hiển thị khi bạn nhập các trường trên</span>}
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#005396] hover:bg-[#0f6cbd] disabled:bg-[#005396]/50 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors cursor-pointer mt-8"
          >
            {loading ? 'Đang lưu...' : 'Hoàn tất & Khám phá'}
          </button>
        </form>
      </div>
    </div>
  );
};
