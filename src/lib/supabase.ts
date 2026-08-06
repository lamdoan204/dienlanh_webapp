import { createClient } from '@supabase/supabase-js';
import { BookingRecord, CustomerReview } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = 'sb_publishable_w0MtXGM4QuSKb_p0h-KRcQ_KIAA4ahb';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co');
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Fetch bookings from Supabase using the new relational schema ('orders' table)
 */
export async function fetchBookingsFromSupabase(): Promise<BookingRecord[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customer_id (first_name, last_name, phone_number, email),
        worker:worker_id (first_name, last_name, phone_number),
        time_slot:time_slot_id (start_time, end_time),
        order_details (
          quantity, sub_total_price,
          services (name, service_type, device_type)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch bookings error (new schema):', error);
      // Fallback to old 'bookings' table for compatibility if new schema fails
      return fetchBookingsLegacy();
    }

    if (!data) return [];

    return data.map((row: any) => {
      const firstService = row.order_details?.[0]?.services;
      return {
        id: String(row.id), // converting int to string for compatibility
        fullName: row.customer ? `${row.customer.last_name} ${row.customer.first_name}`.trim() : 'Khách hàng',
        phone: row.customer?.phone_number || '',
        email: row.customer?.email || '',
        address: 'Địa chỉ lấy từ table address', // Requires joining address if needed
        device: firstService?.device_type || 'air_conditioner',
        servicePackage: firstService?.service_type || 'cleaning',
        selectedDate: row.appointment_time ? new Date(row.appointment_time).toISOString().split('T')[0] : '',
        selectedTimeSlot: row.time_slot ? `${row.time_slot.start_time.slice(0,5)} - ${row.time_slot.end_time.slice(0,5)}` : '',
        notes: '',
        createdAt: row.created_at,
        status: row.status as any,
        technicianName: row.worker ? `${row.worker.last_name} ${row.worker.first_name}`.trim() : undefined,
        technicianPhone: row.worker?.phone_number || undefined,
        estimatedCost: Number(row.total_price || 0),
        finalCost: row.status === 'completed' ? Number(row.total_price || 0) : undefined,
      };
    });
  } catch (err) {
    console.error('Unexpected error fetching bookings from Supabase:', err);
    return null;
  }
}

async function fetchBookingsLegacy(): Promise<BookingRecord[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((row: any) => ({
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    device: row.device,
    servicePackage: row.service_package,
    selectedDate: row.selected_date,
    selectedTimeSlot: row.selected_time_slot,
    notes: row.notes || '',
    createdAt: row.created_at,
    status: row.status,
    technicianName: row.technician_name || undefined,
    technicianPhone: row.technician_phone || undefined,
    estimatedCost: Number(row.estimated_cost || 0),
    finalCost: row.final_cost ? Number(row.final_cost) : undefined,
  }));
}

/**
 * Insert a new booking into Supabase table 'bookings'
 */
export async function insertBookingToSupabase(booking: BookingRecord): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: booking.id,
      full_name: booking.fullName,
      phone: booking.phone,
      email: booking.email,
      address: booking.address,
      device: booking.device,
      service_package: booking.servicePackage,
      selected_date: booking.selectedDate,
      selected_time_slot: booking.selectedTimeSlot,
      notes: booking.notes || null,
      created_at: booking.createdAt,
      status: booking.status,
      technician_name: booking.technicianName || null,
      technician_phone: booking.technicianPhone || null,
      estimated_cost: booking.estimatedCost,
      final_cost: booking.finalCost || null,
    };

    const { error } = await supabase.from('bookings').insert([payload]);
    if (error) {
      console.error('Supabase insert booking error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error inserting booking into Supabase:', err);
    return false;
  }
}

/**
 * Update booking status in Supabase
 */
export async function updateBookingStatusInSupabase(
  bookingId: string,
  status: BookingRecord['status']
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      console.error('Supabase update status error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error updating booking status:', err);
    return false;
  }
}

/**
 * Fetch customer reviews from Supabase using new relational schema ('reviews' table)
 */
export async function fetchReviewsFromSupabase(): Promise<CustomerReview[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users:user_id (first_name, last_name, avatar),
        orders:order_id (
          order_details (
            services (service_type)
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch reviews error (new schema):', error);
      return fetchReviewsLegacy();
    }

    if (!data) return [];

    return data.map((row: any) => {
      const serviceType = row.orders?.order_details?.[0]?.services?.service_type || 'repair';
      return {
        id: String(row.id),
        author: row.users ? `${row.users.last_name} ${row.users.first_name}`.trim() : 'Khách hàng',
        avatar: row.users?.avatar || undefined,
        rating: Number(row.stars || row.rating || 5),
        date: new Date(row.created_at).toLocaleDateString('vi-VN'),
        serviceType: serviceType,
        comment: row.detail || row.comment || '',
        verified: true, // Assuming verified for now
      };
    });
  } catch (err) {
    console.error('Unexpected error fetching reviews:', err);
    return null;
  }
}

async function fetchReviewsLegacy(): Promise<CustomerReview[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((row: any) => ({
    id: row.id,
    author: row.author,
    avatar: row.avatar || undefined,
    rating: Number(row.rating),
    date: row.date || new Date(row.created_at).toLocaleDateString('vi-VN'),
    serviceType: row.service_type,
    comment: row.comment,
    verified: row.verified ?? true,
  }));
}

/**
 * Insert a customer review into Supabase table 'reviews'
 */
export async function insertReviewToSupabase(review: CustomerReview): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: review.id,
      author: review.author,
      avatar: review.avatar || null,
      rating: review.rating,
      date: review.date,
      service_type: review.serviceType,
      comment: review.comment,
      verified: review.verified,
    };

    const { error } = await supabase.from('reviews').insert([payload]);
    if (error) {
      console.error('Supabase insert review error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error inserting review into Supabase:', err);
    return false;
  }
}
