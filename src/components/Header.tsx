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
        <div className="bg-[#003c6e] text-white text-xs py-1.5 px-4 md:px-8 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 text-blue-100">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
              <span className="hidden sm:inline font-medium">Điện lạnh Công Thương — Hỗ trợ kỹ thuật &amp; Đặt lịch khẩn cấp 24/7</span>
              <span className="sm:hidden font-medium">Điện lạnh Công Thương 24/7</span>
            </div>
            <div className="flex items-center gap-4">
              <span
                className="flex items-center gap-1.5 font-bold text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[15px] text-[#ffd700]">phone_in_talk</span>
                <span>Hotline: <strong className="text-[#ffd700] text-sm font-extrabold">1900 6868</strong></span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="h-[64px] flex items-center">
          <div className="flex justify-between items-center px-4 md:px-8 max-w-7xl mx-auto w-full gap-4 flex-nowrap">
            {/* Logo */}
            <button
              onClick={() => setActiveTab('home')}
              className="hover:opacity-90 transition-opacity text-left cursor-pointer flex-shrink-0"
            >
              <Logo size="md" />
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 flex-grow justify-center">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3 py-1 rounded font-semibold text-base transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'text-[#005396] border-b-2 border-[#005396] font-bold'
                        : 'text-[#414751] hover:text-[#005396] hover:bg-[#005396]/5'
                    }`}
                  >
                    {item.label}
                    {item.id === 'history' && bookingCount > 0 && (
                      <span className="ml-1 bg-[#ff8a00] text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                        {bookingCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Header Actions */}
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              <div
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-[#ff8a00]/10 text-[#914c00] border border-[#ff8a00]/30 rounded-xl font-bold text-xs sm:text-sm shadow-2xs"
                title="Hotline 24/7"
              >
                <span className="material-symbols-outlined text-[18px] text-[#ff8a00] animate-bounce">phone_in_talk</span>
                <span>Hotline: <strong className="text-[#ba1a1a]">1900 6868</strong></span>
              </div>

              <div className="hidden md:flex items-center gap-3">
                {/* Admin button ONLY shown when logged-in role is admin */}
                {userProfile?.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                      activeTab === 'admin'
                        ? 'bg-[#005396] text-white border-[#005396]'
                        : 'bg-[#ff8a00]/10 text-[#914c00] border-[#ff8a00]/30 hover:bg-[#ff8a00] hover:text-white'
                    }`}
                    title="Giao diện Quản trị viên"
                  >
                    <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                    <span>Quản trị (Admin)</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveTab(userProfile ? 'account' : 'auth')}
                  aria-label={userProfile ? 'Tài khoản cá nhân' : 'Đăng nhập'}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    activeTab === 'account' || activeTab === 'auth'
                      ? 'bg-[#005396] text-white'
                      : 'text-[#414751] hover:bg-[#005396]/5 hover:text-[#005396]'
                  }`}
                  title={userProfile ? 'Tài khoản cá nhân' : 'Đăng nhập'}
                >
                  <span className="material-symbols-outlined text-[28px]">account_circle</span>
                </button>
                <button
                  onClick={() => setActiveTab('booking')}
                  className="px-5 py-2.5 bg-[#e9edff] text-[#005396] border border-[#005396]/20 rounded-xl font-semibold transition-all hover:bg-[#005396] hover:text-white active:scale-95 shadow-sm whitespace-nowrap min-h-[44px] cursor-pointer text-sm"
                >
                  Đặt dịch vụ
                </button>
              </div>

              {/* Mobile Hotline Quick Button */}
              <div
                className="md:hidden flex items-center justify-center w-10 h-10 bg-[#ba1a1a] text-white rounded-full shadow-md"
                title="Hotline 1900 6868"
              >
                <span className="material-symbols-outlined text-[20px]">call</span>
              </div>

              {/* Mobile Hamburger Menu button */}
              <button
                className="md:hidden text-[#141b2b] p-2 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#dce2f7]/50 active:bg-[#dce2f7] cursor-pointer"
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
          className={`absolute right-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ${
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
              <div className="text-[11px] font-bold text-[#005396] uppercase tracking-wider">Hotline tư vấn 24/7</div>
              <span className="text-lg font-extrabold text-[#ba1a1a] block">
                1900 6868
              </span>
              <div className="text-xs text-[#414751]">Phụ trách: 0901 234 567</div>
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
