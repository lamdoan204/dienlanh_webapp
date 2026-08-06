import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AccountPageProps {
  setActiveTab: (tab: ActiveTab) => void;
  bookingCount: number;
  user?: User | null;
}

export const AccountPage: React.FC<AccountPageProps> = ({ setActiveTab, bookingCount, user }) => {
  const [profile, setProfile] = useState({
    name: 'Nguyễn Văn A',
    phone: '090 123 4567',
    email: user?.email || 'nguyenvana@example.com',
    address: '123 Đường Khí Hậu, Thành phố Mát Mẻ',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setActiveTab('home');
  };

  return (
    <div className="pt-24 lg:pt-28 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title Header */}
      <div className="mb-8 border-b border-[#c1c7d3]/30 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#141b2b]">Tài Khoản Cá Nhân</h1>
          <p className="text-sm text-[#414751] mt-1">
            Quản lý thông tin liên hệ, địa chỉ dịch vụ mặc định và ưu đãi thành viên.
          </p>
        </div>
        {user && (
          <button
            onClick={handleSignOut}
            className="hidden sm:flex text-[#ba1a1a] hover:bg-[#ffdad6] font-bold px-4 py-2 rounded-xl transition-colors text-sm items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Đăng xuất
          </button>
        )}
      </div>

      {savedMessage && (
        <div className="mb-6 p-4 bg-[#e1f8eb] border border-[#10b981]/30 text-[#10b981] rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span>Đã cập nhật thông tin cá nhân thành công!</span>
        </div>
      )}

      {/* Admin Quick Portal Access Card */}
      <div className="bg-gradient-to-r from-[#005396] to-[#003868] text-white rounded-2xl p-6 shadow-md mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
          </div>
          <div>
            <h3 className="text-lg font-bold">Giao diện Quản trị viên (Admin)</h3>
            <p className="text-xs text-white/80 mt-0.5">Quản lý đơn dịch vụ, phân công kỹ thuật viên, danh mục và xem báo cáo tài chính.</p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('admin')}
          className="bg-[#ff8a00] hover:bg-[#914c00] text-white font-bold px-6 py-2.5 rounded-xl shadow transition-all cursor-pointer whitespace-nowrap min-h-[44px]"
        >
          Truy cập Admin &rarr;
        </button>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#c1c7d3]/30 mb-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 bg-[#005396] text-white rounded-full flex items-center justify-center font-bold text-3xl shadow-md">
          {profile.name.charAt(0)}
        </div>

        <div className="flex-grow text-center sm:text-left space-y-1">
          <h2 className="text-xl font-bold text-[#141b2b]">{profile.name}</h2>
          <p className="text-xs sm:text-sm text-[#414751]">{profile.email} • {profile.phone}</p>
          <div className="inline-flex items-center gap-1 bg-[#ffdcc4] text-[#914c00] text-xs font-bold px-3 py-1 rounded-full mt-2">
            <span className="material-symbols-outlined text-sm">stars</span>
            <span>Thành viên Thân Thiết HVAC (250 Điểm)</span>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-[#e9edff] text-[#005396] hover:bg-[#005396] hover:text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-xs sm:text-sm cursor-pointer whitespace-nowrap min-h-[44px]"
        >
          {isEditing ? 'Hủy sửa' : 'Chỉnh sửa'}
        </button>
      </div>

      {/* Edit Form or Readonly View */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#c1c7d3]/30 space-y-4 mb-8">
          <h3 className="text-lg font-bold text-[#141b2b] mb-4 pb-2 border-b border-[#c1c7d3]/30">
            Cập nhật thông tin
          </h3>

          <div>
            <label className="text-xs font-bold text-[#414751] block mb-1">Họ và tên</label>
            <input
              type="text"
              required
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#414751] block mb-1">Số điện thoại</label>
              <input
                type="tel"
                required
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#414751] block mb-1">Email</label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#414751] block mb-1">Địa chỉ mặc định</label>
            <input
              type="text"
              required
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#005396] hover:bg-[#0f6cbd] text-white font-bold py-3 rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Lưu thay đổi
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#c1c7d3]/30 space-y-3">
            <h3 className="text-base font-bold text-[#141b2b] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#005396]">location_on</span>
              <span>Địa chỉ dịch vụ mặc định</span>
            </h3>
            <p className="text-sm text-[#414751] leading-relaxed">{profile.address}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#c1c7d3]/30 space-y-3">
            <h3 className="text-base font-bold text-[#141b2b] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#005396]">receipt_long</span>
              <span>Lịch hẹn đã đăng ký</span>
            </h3>
            <p className="text-sm text-[#414751]">Hiện tại bạn có <strong>{bookingCount}</strong> lịch hẹn dịch vụ.</p>
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs font-bold text-[#005396] hover:underline cursor-pointer"
            >
              Xem danh sách lịch hẹn &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Support & Quick Actions */}
      <div className="bg-[#f1f3ff] rounded-2xl p-6 border border-[#c1c7d3]/30 space-y-4 mb-8">
        <h3 className="text-base font-bold text-[#141b2b]">Hỗ trợ khách hàng 24/7</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          <a
            href="tel:19006868"
            className="bg-white p-4 rounded-xl border border-[#c1c7d3]/40 flex items-center gap-3 text-[#141b2b] hover:border-[#005396] transition-colors"
          >
            <span className="material-symbols-outlined text-[#ba1a1a]">phone_in_talk</span>
            <div>
              <span className="font-bold block">Hotline khẩn cấp</span>
              <span className="text-[#717783] text-xs">1900 6868</span>
            </div>
          </a>

          <a
            href="mailto:support@hvacmasters.com"
            className="bg-white p-4 rounded-xl border border-[#c1c7d3]/40 flex items-center gap-3 text-[#141b2b] hover:border-[#005396] transition-colors"
          >
            <span className="material-symbols-outlined text-[#005396]">mail</span>
            <div>
              <span className="font-bold block">Gửi Email hỗ trợ</span>
              <span className="text-[#717783] text-xs">support@hvacmasters.com</span>
            </div>
          </a>
        </div>
      </div>

      {user && (
        <button
          onClick={handleSignOut}
          className="sm:hidden w-full flex items-center justify-center gap-2 bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white font-bold py-3.5 rounded-xl transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Đăng xuất khỏi thiết bị
        </button>
      )}
    </div>
  );
};
