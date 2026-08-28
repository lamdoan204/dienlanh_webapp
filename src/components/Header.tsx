import React, { useState } from 'react';
import { ActiveTab, UserProfile } from '../types';
import { Logo } from './Logo';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  bookingCount: number;
  userProfile?: UserProfile | null;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, bookingCount, userProfile }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navItems = [
    { id: 'home' as ActiveTab, label: 'Trang chủ', icon: 'home' },
    { id: 'pricing' as ActiveTab, label: 'Bảng giá dịch vụ', icon: 'receipt_long' },
    { id: 'supplies' as ActiveTab, label: 'Bảng giá vật tư', icon: 'inventory_2' },
    { id: 'articles' as ActiveTab, label: 'Góc kiến thức', icon: 'menu_book' },
    { id: 'purchasing' as ActiveTab, label: 'Dịch vụ thu mua', icon: 'shopping_bag' },
    ...(userProfile ? [{ id: 'history' as ActiveTab, label: 'Lịch sử đặt lịch', icon: 'history' }] : []),
  ];

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <>
      <header className="fixed top-0 w-full z-40 bg-[#f9f9ff]/95 backdrop-blur-md border-b border-[#c1c7d3]/30 shadow-md">
        {/* Top Hotline Bar */}
        <div className="bg-[#003c6e] text-white text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-white/10">
          <div className="w-full max-w-[1755px] mx-auto flex justify-between items-center gap-2">
            <div className="flex items-center gap-3 text-blue-100">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
                <span>Điện lạnh Công Thương</span>
              </div>
              <span className="text-blue-300 hidden md:inline">|</span>
              <div className="hidden md:flex items-center gap-1 text-blue-200">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                <span>Thành Phố Hồ Chí Minh</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span
                className="flex items-center gap-1.5 font-bold text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[15px] text-[#ffd700]">phone_in_talk</span>
                <span>Hotline / Zalo: <strong className="text-[#ffd700] text-sm font-extrabold">0352572821</strong></span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="h-[66px] sm:h-[72px] flex items-center">
          <div className="flex justify-between items-center px-2.5 sm:px-4 lg:px-5 xl:px-6 w-full max-w-[1755px] mx-auto gap-[clamp(0.5rem,1vw,1.5rem)] flex-nowrap">
            {/* Logo */}
            <button
              onClick={() => setActiveTab('home')}
              className="hover:opacity-90 transition-opacity text-left cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Logo size="md" className="w-[212px] h-[68px] items-center shrink-0 whitespace-nowrap" />
            </button>

            {/* Desktop Nav with Fluid Auto-Scaling */}
            <nav className="hidden lg:flex items-center gap-[clamp(0.15rem,0.45vw,0.8rem)] w-[816px] h-[49px] min-w-0 justify-center">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-[clamp(0.35rem,0.5vw,0.75rem)] py-1.5 rounded-lg font-semibold text-[clamp(13px,0.88vw,15.5px)] transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 shrink-0 ${
                      isActive
                        ? 'text-[#005396] border-b-2 border-[#005396] font-bold bg-[#005396]/5'
                        : 'text-[#414751] hover:text-[#005396] hover:bg-[#005396]/5'
                    }`}
                  >
                    {item.label}
                    {item.id === 'history' && bookingCount > 0 && (
                      <span className="ml-0.5 bg-[#ff8a00] text-white text-[10.5px] sm:text-[11.5px] px-1.5 py-0.2 rounded-full font-bold leading-tight">
                        {bookingCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Header Actions with Fluid Auto-Scaling */}
            <div className="flex items-center gap-[clamp(0.35rem,0.6vw,0.75rem)] shrink-0">
              <div
                className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 bg-[#ff8a00]/10 text-[#914c00] border border-[#ff8a00]/30 rounded-xl font-bold text-xs shadow-2xs"
                title="Hotline / Zalo 24/7"
              >
                <span className="material-symbols-outlined text-[16px] text-[#ff8a00] animate-bounce">phone_in_talk</span>
                <span>Zalo / Hotline: <strong className="text-[#ba1a1a]">0352572821</strong></span>
              </div>

              <div className="hidden lg:flex items-center gap-[clamp(0.35rem,0.6vw,0.75rem)]">
                {/* Admin button ONLY shown when logged-in role is admin */}
                {userProfile?.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`px-2.5 py-1.5 rounded-xl font-bold text-[clamp(12px,0.8vw,14px)] flex items-center gap-1 border transition-all cursor-pointer ${
                      activeTab === 'admin'
                        ? 'bg-[#005396] text-white border-[#005396]'
                        : 'bg-[#ff8a00]/10 text-[#914c00] border-[#ff8a00]/30 hover:bg-[#ff8a00] hover:text-white'
                    }`}
                    title="Giao diện Quản trị viên"
                  >
                    <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                    <span className="hidden xl:inline">Quản trị (Admin)</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveTab(userProfile ? 'account' : 'auth')}
                  aria-label={userProfile ? 'Tài khoản cá nhân' : 'Đăng nhập'}
                  className={`w-8.5 h-8.5 xl:w-9.5 xl:h-9.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    activeTab === 'account' || activeTab === 'auth'
                      ? 'bg-[#005396] text-white'
                      : 'text-[#414751] hover:bg-[#005396]/5 hover:text-[#005396]'
                  }`}
                  title={userProfile ? 'Tài khoản cá nhân' : 'Đăng nhập'}
                >
                  <span className="material-symbols-outlined text-[22px] xl:text-[25px]">account_circle</span>
                </button>
                <button
                  onClick={() => setActiveTab('booking')}
                  className="px-[clamp(0.55rem,0.75vw,1rem)] py-1.5 bg-[#e9edff] text-[#005396] border border-[#005396]/20 rounded-xl font-semibold transition-all hover:bg-[#005396] hover:text-white active:scale-95 shadow-sm whitespace-nowrap min-h-[36px] xl:min-h-[40px] cursor-pointer text-[clamp(13px,0.88vw,15.5px)] flex items-center justify-center"
                >
                  Đặt dịch vụ
                </button>
              </div>

              {/* Mobile Hotline Quick Button */}
              <div
                className="lg:hidden flex items-center justify-center w-11 h-11 bg-[#ba1a1a] text-white rounded-full shadow-md"
                title="Hotline / Zalo 0352572821"
              >
                <span className="material-symbols-outlined text-[22px]">call</span>
              </div>

              {/* Mobile Hamburger Menu button */}
              <button
                className="lg:hidden text-[#141b2b] p-2 w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[#dce2f7]/50 active:bg-[#dce2f7] cursor-pointer"
                onClick={toggleDrawer}
                aria-label="Toggle menu"
              >
                <span className="material-symbols-outlined text-2xl">menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isDrawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={toggleDrawer}
        />
        <div
          className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ${
            isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-[#c1c7d3]/30 flex justify-between items-center">
            <Logo size="sm" />
            <button
              onClick={toggleDrawer}
              className="p-2 hover:bg-[#dce2f7]/50 rounded-full w-10 h-10 flex items-center justify-center text-[#414751]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Hotline Box in Drawer */}
          <div className="p-4 m-3 bg-[#f0f7ff] rounded-xl border border-[#005396]/20 flex items-center justify-between shadow-xs">
            <div>
              <div className="text-[11px] font-bold text-[#005396] uppercase tracking-wider">Hotline / Zalo 24/7</div>
              <span className="text-lg font-extrabold text-[#ba1a1a] block">
                0352572821
              </span>
              <div className="text-xs text-[#414751]">Hỗ trợ nhanh chóng</div>
            </div>
            <div
              className="w-10 h-10 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">call</span>
            </div>
          </div>

          <nav className="flex flex-col px-4 gap-2 flex-grow overflow-y-auto">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsDrawerOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-semibold min-h-[44px] whitespace-nowrap w-full text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#005396] text-white'
                      : 'text-[#414751] hover:bg-[#dce2f7]/50 hover:text-[#005396]'
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="flex-grow">{item.label}</span>
                  {item.id === 'history' && bookingCount > 0 && (
                    <span className="bg-[#ff8a00] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {bookingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[#c1c7d3]/30 flex flex-col gap-2 bg-[#f9f9ff]">
            {userProfile?.role === 'admin' && (
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setIsDrawerOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 bg-[#ff8a00]/10 text-[#914c00] border border-[#ff8a00]/30 hover:bg-[#ff8a00] hover:text-white rounded-lg transition-colors font-bold min-h-[44px] w-full text-left cursor-pointer"
              >
                <span className="material-symbols-outlined">admin_panel_settings</span>
                <span>Giao diện Quản trị (Admin)</span>
              </button>
            )}
            <button
              onClick={() => {
                setActiveTab(userProfile ? 'account' : 'auth');
                setIsDrawerOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 bg-[#005396] text-white rounded-lg transition-colors font-bold min-h-[44px] w-full text-left cursor-pointer"
            >
              <span className="material-symbols-outlined">account_circle</span>
              <span>{userProfile ? 'Tài khoản cá nhân' : 'Đăng nhập'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
