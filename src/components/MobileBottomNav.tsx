import React from 'react';
import { ActiveTab, UserProfile } from '../types';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  bookingCount: number;
  userProfile?: UserProfile | null;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  bookingCount,
  userProfile,
}) => {
  const tabs = [
    { id: 'home' as ActiveTab, label: 'Trang chủ', icon: 'home' },
    { id: 'pricing' as ActiveTab, label: 'Bảng giá', icon: 'local_offer' },
    { id: 'booking' as ActiveTab, label: 'Đặt lịch', icon: 'calendar_month' },
    ...(userProfile ? [{ id: 'history' as ActiveTab, label: 'Lịch sử', icon: 'history' }] : []),
    ...(userProfile?.role === 'admin' ? [{ id: 'admin' as ActiveTab, label: 'Admin', icon: 'admin_panel_settings' }] : []),
    { id: (userProfile ? 'account' : 'auth') as ActiveTab, label: userProfile ? 'Cá nhân' : 'Đăng nhập', icon: userProfile ? 'person' : 'login' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex h-[62px] items-center justify-around border-t border-[#c1c7d3]/40 bg-white/95 backdrop-blur-md px-1 pb-safe shadow-[0px_-4px_20px_rgba(0,0,0,0.06)]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center w-full h-full relative cursor-pointer transition-colors py-1 ${
              isActive ? 'text-[#005396] font-bold' : 'text-[#5a606d] hover:text-[#005396]'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] ${
                isActive ? 'fill-1' : ''
              }`}
            >
              {tab.icon}
            </span>
            <span className="text-[10.5px] font-semibold mt-0.5 whitespace-nowrap tracking-tight leading-none">
              {tab.label}
            </span>
            {tab.id === 'history' && bookingCount > 0 && (
              <span className="absolute top-1 right-2 sm:right-3 bg-[#ff8a00] text-white text-[9px] px-1 py-0.2 rounded-full font-bold min-w-[15px] text-center leading-tight shadow-xs">
                {bookingCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
