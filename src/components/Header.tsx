import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { User } from '@supabase/supabase-js';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  bookingCount: number;
  user?: User | null;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, bookingCount, user }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navItems = [
    { id: 'home' as ActiveTab, label: 'Trang chủ', icon: 'home' },
    { id: 'pricing' as ActiveTab, label: 'Bảng giá dịch vụ', icon: 'receipt_long' },
    { id: 'booking' as ActiveTab, label: 'Đặt lịch dịch vụ', icon: 'calendar_month' },
    { id: 'reviews' as ActiveTab, label: 'Đánh giá khách hàng', icon: 'star' },
    ...(user ? [{ id: 'history' as ActiveTab, label: 'Lịch sử dịch vụ', icon: 'history' }] : []),
  ];

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <>
      <header className="fixed top-0 w-full z-40 bg-[#f9f9ff]/90 backdrop-blur-md border-b border-[#c1c7d3]/30 h-[72px] flex items-center shadow-md">
        <div className="flex justify-between items-center px-4 md:px-8 max-w-7xl mx-auto w-full gap-4 flex-nowrap">
          {/* Logo */}
          <button
            onClick={() => setActiveTab('home')}
            className="font-bold text-2xl text-[#005396] flex items-center gap-2 flex-shrink-0 hover:opacity-90 transition-opacity text-left cursor-pointer"
          >
            <span className="material-symbols-outlined fill-1 text-3xl">ac_unit</span>
            <span>HVAC Masters</span>
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
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="hidden md:flex items-center gap-3">
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
              <button
                onClick={() => setActiveTab(user ? 'account' : 'auth')}
                aria-label={user ? 'Tài khoản cá nhân' : 'Đăng nhập'}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  activeTab === 'account' || activeTab === 'auth'
                    ? 'bg-[#005396] text-white'
                    : 'text-[#414751] hover:bg-[#005396]/5 hover:text-[#005396]'
                }`}
                title={user ? 'Tài khoản cá nhân' : 'Đăng nhập'}
              >
                <span className="material-symbols-outlined text-[28px]">account_circle</span>
              </button>
              <button
                onClick={() => setActiveTab('booking')}
                className="px-6 py-2.5 bg-[#e9edff] text-[#005396] border border-[#005396]/20 rounded-xl font-semibold transition-all hover:bg-[#005396] hover:text-white active:scale-95 shadow-sm whitespace-nowrap min-h-[44px] cursor-pointer"
              >
                Đặt dịch vụ
              </button>
            </div>

            {/* Mobile Hamburger Menu button */}
            <button
              className="md:hidden text-[#141b2b] p-2 w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[#dce2f7]/50 active:bg-[#dce2f7] cursor-pointer"
              onClick={toggleDrawer}
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
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
            <span className="font-bold text-xl text-[#141b2b] flex items-center gap-2">
              <span className="material-symbols-outlined fill-1 text-[#005396]">ac_unit</span>
              HVAC Masters
            </span>
            <button
              onClick={toggleDrawer}
              className="p-2 hover:bg-[#dce2f7]/50 rounded-full w-10 h-10 flex items-center justify-center text-[#414751]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <nav className="flex flex-col p-4 gap-2 flex-grow overflow-y-auto">
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
            <button
              onClick={() => {
                setActiveTab(user ? 'account' : 'auth');
                setIsDrawerOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 text-[#414751] hover:bg-[#dce2f7]/50 hover:text-[#005396] rounded-lg transition-colors font-semibold min-h-[44px] w-full text-left cursor-pointer"
            >
              <span className="material-symbols-outlined">{user ? 'person' : 'login'}</span>
              <span>{user ? 'Tài khoản cá nhân' : 'Đăng nhập / Đăng ký'}</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('booking');
                setIsDrawerOpen(false);
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[#ff8a00] text-white font-bold rounded-xl shadow-sm hover:bg-[#914c00] transition-colors min-h-[44px] w-full text-center cursor-pointer"
            >
              <span className="material-symbols-outlined">add_task</span>
              <span>Đặt dịch vụ ngay</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
