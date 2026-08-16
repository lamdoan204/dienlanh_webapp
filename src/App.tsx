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
import { authService } from './services/authService';
import { customerService } from './services/customerService';

export default function App() {
  const getInitialTab = (): ActiveTab => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (path.includes('/pricing') || path.includes('/bang-gia')) return 'pricing';
    if (path.includes('/booking') || path.includes('/dat-lich')) return 'booking';
    if (path.includes('/purchasing') || path.includes('/thu-mua')) return 'purchasing';
    if (path.includes('/history') || path.includes('/lich-su')) return 'history';
    if (path.includes('/account') || path.includes('/tai-khoan')) return 'account';
    if (path.includes('/admin')) return 'admin';
    if (path.includes('/auth') || path.includes('/dang-nhap')) return 'auth';

    if (hash.includes('bang-gia')) return 'pricing';
    if (hash.includes('dat-lich')) return 'booking';
    if (hash.includes('thu-mua')) return 'purchasing';
    
    return 'home';
  };

  const [activeTab, setActiveTabState] = useState<ActiveTab>(getInitialTab);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => authService.getStoredProfile());
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [bookingPreset, setBookingPreset] = useState<AdminService | { device: DeviceType; service: ServicePackageType } | undefined>(undefined);

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    // Sync URL cleanly
    const pathMap: Record<ActiveTab, string> = {
      home: '/',
      pricing: '/bang-gia',
      booking: '/dat-lich',
      purchasing: '/thu-mua',
      history: '/lich-su',
      account: '/tai-khoan',
      reviews: '/danh-gia',
      auth: '/dang-nhap',
      onboarding: '/onboarding',
      admin: '/admin'
    };

    const targetPath = pathMap[tab] || '/';
    if (window.location.pathname !== targetPath && !window.location.hash) {
      window.history.pushState({ tab }, '', targetPath);
    }
  };

  // Listen to browser Back / Forward buttons & Hash changes
  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getInitialTab());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Load customer booking history when logged in or profile changes
  useEffect(() => {
    if (userProfile) {
      customerService.fetchCustomerBookings(userProfile.phone_number).then((data) => {
        if (data && data.length > 0) {
          setBookings(data);
        }
      });
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('hvac_masters_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const handleLoginSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const handleLogout = () => {
    setUserProfile(null);
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
