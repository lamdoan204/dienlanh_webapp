import React, { useState, useEffect } from 'react';
import { ActiveTab, BookingRecord, DeviceType, ServicePackageType, UserProfile, AdminService } from './types';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { BookingPage } from './components/BookingPage';
import { PricingPage } from './components/PricingPage';
import { HistoryPage } from './components/HistoryPage';
import { AccountPage } from './components/AccountPage';
import { AuthPage } from './components/AuthPage';
import { OnboardingPage } from './components/OnboardingPage';
import { AdminDashboard } from './components/AdminDashboard';
import { PurchasingPage } from './components/PurchasingPage';
import { SuppliesPricingPage } from './components/SuppliesPricingPage';
import { KnowledgePage } from './components/KnowledgePage';
import { authService } from './services/authService';
import { customerService } from './services/customerService';

export default function App() {
  const getInitialTabInfo = (profile: UserProfile | null): { tab: ActiveTab; notice: { title: string; message: string; type: 'admin' | 'history' | 'account' } | null } => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (path.includes('/bang-gia-vat-tu') || path.includes('/supplies')) return { tab: 'supplies', notice: null };
    if (path.includes('/goc-kien-thuc') || path.includes('/articles')) return { tab: 'articles', notice: null };
    if (path.includes('/pricing') || path.includes('/bang-gia')) return { tab: 'pricing', notice: null };
    if (path.includes('/booking') || path.includes('/dat-lich')) return { tab: 'booking', notice: null };
    if (path.includes('/purchasing') || path.includes('/thu-mua')) return { tab: 'purchasing', notice: null };
    
    if (path.includes('/history') || path.includes('/lich-su')) {
      if (!profile) {
        return {
          tab: 'auth',
          notice: {
            title: 'Yêu cầu đăng nhập',
            message: 'Vui lòng đăng nhập để xem lịch sử đặt lịch và đơn thu mua của bạn.',
            type: 'history'
          }
        };
      }
      return { tab: 'history', notice: null };
    }

    if (path.includes('/account') || path.includes('/tai-khoan')) {
      if (!profile) {
        return {
          tab: 'auth',
          notice: {
            title: 'Yêu cầu đăng nhập',
            message: 'Vui lòng đăng nhập để quản lý tài khoản và sổ địa chỉ cá nhân.',
            type: 'account'
          }
        };
      }
      return { tab: 'account', notice: null };
    }

    if (path.includes('/admin')) {
      if (!profile || profile.role !== 'admin') {
        return {
          tab: 'auth',
          notice: {
            title: 'Yêu cầu quyền Quản trị viên',
            message: 'Bạn cần đăng nhập với tài khoản Quản trị viên (Admin) để truy cập trang quản trị.',
            type: 'admin'
          }
        };
      }
      return { tab: 'admin', notice: null };
    }

    if (path.includes('/auth') || path.includes('/dang-nhap')) return { tab: 'auth', notice: null };

    if (hash.includes('bang-gia-vat-tu')) return { tab: 'supplies', notice: null };
    if (hash.includes('goc-kien-thuc')) return { tab: 'articles', notice: null };
    if (hash.includes('bang-gia')) return { tab: 'pricing', notice: null };
    if (hash.includes('dat-lich')) return { tab: 'booking', notice: null };
    if (hash.includes('thu-mua')) return { tab: 'purchasing', notice: null };
    
    return { tab: 'home', notice: null };
  };

  const storedProfile = authService.getStoredProfile();
  const initialInfo = getInitialTabInfo(storedProfile);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(storedProfile);
  const [activeTab, setActiveTabState] = useState<ActiveTab>(initialInfo.tab);
  const [authNotice, setAuthNotice] = useState<{ title: string; message: string; type?: 'admin' | 'history' | 'account' | 'general' } | null>(initialInfo.notice);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [bookingPreset, setBookingPreset] = useState<AdminService | { device: DeviceType; service: ServicePackageType } | undefined>(undefined);

  const setActiveTab = (tab: ActiveTab) => {
    let finalTab = tab;

    // Security Gate for Admin
    if (tab === 'admin') {
      const currentProfile = userProfile || authService.getStoredProfile();
      if (!currentProfile || currentProfile.role !== 'admin') {
        finalTab = 'auth';
        setAuthNotice({
          title: 'Yêu cầu quyền Quản trị viên',
          message: 'Bạn cần đăng nhập với tài khoản Quản trị viên (Admin) để truy cập trang quản trị.',
          type: 'admin'
        });
      } else {
        setAuthNotice(null);
      }
    } else if (tab === 'history' || tab === 'account') {
      const currentProfile = userProfile || authService.getStoredProfile();
      if (!currentProfile) {
        finalTab = 'auth';
        setAuthNotice({
          title: 'Yêu cầu đăng nhập',
          message: tab === 'history'
            ? 'Vui lòng đăng nhập để xem lịch sử đặt lịch và đơn thu mua của bạn.'
            : 'Vui lòng đăng nhập để quản lý tài khoản và sổ địa chỉ cá nhân.',
          type: tab as 'history' | 'account'
        });
      } else {
        setAuthNotice(null);
      }
    } else {
      if (tab !== 'auth') {
        setAuthNotice(null);
      }
    }

    setActiveTabState(finalTab);

    // Sync URL cleanly
    const pathMap: Record<ActiveTab, string> = {
      home: '/',
      pricing: '/bang-gia',
      supplies: '/bang-gia-vat-tu',
      articles: '/goc-kien-thuc',
      booking: '/dat-lich',
      purchasing: '/thu-mua',
      history: '/lich-su',
      account: '/tai-khoan',
      reviews: '/danh-gia',
      auth: '/dang-nhap',
      onboarding: '/onboarding',
      admin: '/admin'
    };

    const targetPath = pathMap[finalTab] || '/';
    if (window.location.pathname !== targetPath && !window.location.hash) {
      window.history.pushState({ tab: finalTab }, '', targetPath);
    }
  };

  // Listen to browser Back / Forward buttons & Hash changes
  useEffect(() => {
    const handlePopState = () => {
      const currentProfile = authService.getStoredProfile();
      const info = getInitialTabInfo(currentProfile);
      setActiveTabState(info.tab);
      setAuthNotice(info.notice);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Automatically scroll to the top of the page whenever activeTab changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeTab]);

  // Load customer booking history when logged in or profile changes
  useEffect(() => {
    if (userProfile?.phone_number) {
      customerService.fetchCustomerBookings(userProfile.phone_number).then((data) => {
        if (data && data.length > 0) {
          setBookings(data);
        }
      });
    } else {
      setBookings([]);
    }
  }, [userProfile]);

  useEffect(() => {
    if (bookings.length > 0) {
      localStorage.setItem('hvac_masters_bookings', JSON.stringify(bookings));
    }
  }, [bookings]);

  const handleLoginSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    setAuthNotice(null);
    if (profile.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('home');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUserProfile(null);
    setBookings([]);
    setAuthNotice(null);
    setActiveTab('home');
  };

  // Handle new booking creation
  const handleBookingSubmit = async (
    newBooking: BookingRecord,
    extra?: { serviceId?: number; timeSlotId?: number; customerId?: number }
  ) => {
    setBookings((prev) => [newBooking, ...prev]);
    await customerService.createBooking(newBooking, extra);
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string) => {
    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (
      targetBooking &&
      (targetBooking.status === 'verified' ||
        targetBooking.status === 'technician_assigned' ||
        targetBooking.status === 'in_progress' ||
        targetBooking.status === 'completed' ||
        targetBooking.status === 'cancelled')
    ) {
      return;
    }

    const confirmCancel = window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?');
    if (!confirmCancel) return;

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
    await customerService.cancelBooking(bookingId);
  };

  const handleSelectBookingPreset = (preset: AdminService | { device: DeviceType; service: ServicePackageType }) => {
    setBookingPreset(preset);
  };

  // Only count active orders that are not completed or cancelled
  const activeBookingCount = bookings.filter(
    (b) => b.status !== 'completed' && b.status !== 'cancelled'
  ).length;

  if (activeTab === 'admin') {
    // If somehow reached without admin privileges, redirect to Auth
    if (!userProfile || userProfile.role !== 'admin') {
      return (
        <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] flex flex-col font-['Inter',sans-serif]">
          <Header
            activeTab="auth"
            setActiveTab={setActiveTab}
            bookingCount={0}
            userProfile={null}
          />
          <main className="flex-grow w-full">
            <AuthPage
              setActiveTab={setActiveTab}
              onLoginSuccess={handleLoginSuccess}
              authNotice={{
                title: 'Yêu cầu quyền Quản trị viên',
                message: 'Bạn cần đăng nhập với tài khoản Quản trị viên (Admin) để truy cập trang quản trị.',
                type: 'admin'
              }}
            />
          </main>
          <Footer setActiveTab={setActiveTab} userProfile={null} />
        </div>
      );
    }

    return (
      <AdminDashboard
        setActiveTab={setActiveTab}
        user={null}
        userProfile={userProfile}
        bookings={bookings}
        onUpdateBookings={setBookings}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] flex flex-col font-['Inter',sans-serif] selection:bg-[#005396] selection:text-white pb-[68px] md:pb-0">
      {/* Top Navbar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bookingCount={activeBookingCount}
        userProfile={userProfile}
      />

      {/* Main Content Area */}
      <main className="flex-grow w-full">
        {activeTab === 'home' && (
          <HomePage
            setActiveTab={setActiveTab}
            onSelectBookingPreset={handleSelectBookingPreset}
          />
        )}

        {activeTab === 'pricing' && (
          <PricingPage
            setActiveTab={setActiveTab}
            onSelectBookingPreset={handleSelectBookingPreset}
          />
        )}

        {activeTab === 'supplies' && (
          <SuppliesPricingPage
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'articles' && (
          <KnowledgePage
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'booking' && (
          <BookingPage
            initialPreset={bookingPreset}
            userProfile={userProfile}
            onBookingSubmit={handleBookingSubmit}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'purchasing' && (
          <PurchasingPage
            userProfile={userProfile}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage
            bookings={bookings}
            userProfile={userProfile}
            setActiveTab={setActiveTab}
            onCancelBooking={handleCancelBooking}
          />
        )}

        {activeTab === 'account' && (
          <AccountPage
            setActiveTab={setActiveTab}
            bookingCount={activeBookingCount}
            userProfile={userProfile}
            onUpdateProfile={setUserProfile}
            onLogout={handleLogout}
          />
        )}

        {activeTab === 'auth' && (
          <AuthPage
            setActiveTab={setActiveTab}
            onLoginSuccess={handleLoginSuccess}
            authNotice={authNotice}
          />
        )}

        {activeTab === 'onboarding' && (
          <OnboardingPage
            setActiveTab={setActiveTab}
            userProfile={userProfile}
            onUpdateProfile={setUserProfile}
          />
        )}
      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} userProfile={userProfile} />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bookingCount={activeBookingCount}
        userProfile={userProfile}
      />
    </div>
  );
}
