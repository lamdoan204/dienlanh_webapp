import React, { useState, useEffect } from 'react';
import { ActiveTab, BookingRecord, DeviceType, ServicePackageType } from './types';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { BookingPage } from './components/BookingPage';
import { PricingPage } from './components/PricingPage';
import { ReviewsPage } from './components/ReviewsPage';
import { HistoryPage } from './components/HistoryPage';
import { AccountPage } from './components/AccountPage';
import { AuthPage } from './components/AuthPage';
import { OnboardingPage } from './components/OnboardingPage';
import { AdminDashboard } from './components/AdminDashboard';
import {
  isSupabaseConfigured,
  fetchBookingsFromSupabase,
  insertBookingToSupabase,
  updateBookingStatusInSupabase,
  supabase
} from './lib/supabase';
import { User } from '@supabase/supabase-js';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(isSupabaseConfigured());
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);

  const [bookingPreset, setBookingPreset] = useState<{
    device: DeviceType;
    service: ServicePackageType;
  } | undefined>(undefined);

  // Load from Supabase on mount if configured
  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      setSupabaseConnected(true);
      
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      fetchBookingsFromSupabase().then((data) => {
        if (data) {
          setBookings(data);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hvac_masters_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Handle new booking creation
  const handleBookingSubmit = async (newBooking: BookingRecord) => {
    setBookings((prev) => [newBooking, ...prev]);

    if (isSupabaseConfigured()) {
      await insertBookingToSupabase(newBooking);
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );

    if (isSupabaseConfigured()) {
      await updateBookingStatusInSupabase(bookingId, 'cancelled');
    }
  };

  const handleSelectBookingPreset = (device: DeviceType, service: ServicePackageType) => {
    setBookingPreset({ device, service });
  };

  if (activeTab === 'admin') {
    return (
      <AdminDashboard
        setActiveTab={setActiveTab}
        user={user}
        bookings={bookings}
        onUpdateBookings={setBookings}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] flex flex-col font-['Inter',sans-serif] selection:bg-[#005396] selection:text-white pb-[68px] md:pb-0">
      {/* Top Navbar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bookingCount={bookings.length}
        user={user}
      />

      {/* Connection Indicator Bar */}
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
            onBookingSubmit={handleBookingSubmit}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'reviews' && <ReviewsPage setActiveTab={setActiveTab} />}

        {activeTab === 'history' && (
          <HistoryPage
            bookings={bookings}
            setActiveTab={setActiveTab}
            onCancelBooking={handleCancelBooking}
          />
        )}

        {activeTab === 'account' && (
          <AccountPage setActiveTab={setActiveTab} bookingCount={bookings.length} user={user} />
        )}

        {activeTab === 'auth' && <AuthPage setActiveTab={setActiveTab} />}

        {activeTab === 'onboarding' && <OnboardingPage setActiveTab={setActiveTab} />}
      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} user={user} />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bookingCount={bookings.length}
        user={user}
      />
    </div>
  );
}

