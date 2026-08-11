import { BookingRecord, CustomerReview } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { commonService } from '../services/commonService';
import { customerService } from '../services/customerService';
import { adminService } from '../services/adminService';

// Re-export core clients and individual services
export { supabase, isSupabaseConfigured };
export { commonService } from '../services/commonService';
export { customerService } from '../services/customerService';
export { adminService } from '../services/adminService';

/**
 * Backward-compatible wrappers pointing to object-oriented domain services
 */
export async function fetchBookingsFromSupabase(): Promise<BookingRecord[] | null> {
  if (!isSupabaseConfigured()) return null;
  return customerService.fetchCustomerBookings();
}

export async function insertBookingToSupabase(booking: BookingRecord): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const res = await customerService.createBooking(booking);
  return res.success;
}

export async function updateBookingStatusInSupabase(
  bookingId: string,
  status: BookingRecord['status']
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  return customerService.cancelBooking(bookingId);
}

export async function fetchReviewsFromSupabase(): Promise<CustomerReview[] | null> {
  if (!isSupabaseConfigured()) return null;
  return commonService.fetchReviews();
}

export async function insertReviewToSupabase(
  review: CustomerReview,
  customerIdentifier?: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const res = await commonService.insertReview(review, customerIdentifier);
  return res.success;
}
