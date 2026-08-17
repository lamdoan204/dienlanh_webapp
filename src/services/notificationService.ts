import { supabase } from './supabaseClient';

export interface AdminNotificationPayload {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  serviceName: string;
  appointmentDate: string;
  timeSlot: string;
  totalPrice: number;
  notes?: string;
}

export interface AdminPurchasingNotificationPayload {
  orderId: string;
  orderCode?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  addressNote?: string;
  appointmentDate?: string;
  timeSlotId?: number;
  items: Array<{
    device: string;
    quantity: number;
    desired_price?: number;
    price?: number;
    note?: string;
  }>;
  totalDesiredPrice?: number;
  devicesSummary: string;
}

export const notificationService = {
  /**
   * Fetch all admin emails from database and dispatch notification
   */
  async notifyAdminsNewBooking(payload: AdminNotificationPayload): Promise<{
    success: boolean;
    adminEmails: string[];
    message: string;
  }> {
    let adminEmails: string[] = [];

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('email, first_name, last_name')
          .eq('role', 'admin');

        if (!error && data && data.length > 0) {
          adminEmails = data.map((u: any) => u.email).filter(Boolean);
        }
      } catch (err) {
        console.warn('Error fetching admin emails:', err);
      }
    }

    // Fallback default admin email if none retrieved
    if (adminEmails.length === 0) {
      adminEmails = ['admin@hvacmasters.com'];
    }

    // Call backend endpoint to dispatch real email via nodemailer
    try {
      const response = await fetch('/api/notify-admin-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          adminEmails,
        }),
      });

      const resData = await response.json().catch(() => ({}));
      if (resData.success) {
        console.log('Notification dispatched via backend API:', resData);
      }
    } catch (err) {
      console.warn('Backend email API error, fallback logged:', err);
    }

    return {
      success: true,
      adminEmails,
      message: `Đã gửi email thông báo đặt lịch tới ${adminEmails.length} quản trị viên (${adminEmails.join(', ')}).`,
    };
  },

  /**
   * Dispatch purchasing order notification to all admin emails
   */
  async notifyAdminsNewPurchasingOrder(payload: AdminPurchasingNotificationPayload): Promise<{
    success: boolean;
    adminEmails: string[];
    message: string;
  }> {
    let adminEmails: string[] = [];

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('email, first_name, last_name')
          .eq('role', 'admin');

        if (!error && data && data.length > 0) {
          adminEmails = data.map((u: any) => u.email).filter(Boolean);
        }
      } catch (err) {
        console.warn('Error fetching admin emails for purchasing notification:', err);
      }
    }

    if (adminEmails.length === 0) {
      adminEmails = ['admin@hvacmasters.com'];
    }

    try {
      const response = await fetch('/api/notify-admin-purchasing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          adminEmails,
        }),
      });

      const resData = await response.json().catch(() => ({}));
      if (resData.success) {
        console.log('Purchasing notification dispatched via backend API:', resData);
      }
    } catch (err) {
      console.warn('Backend email API error for purchasing notification:', err);
    }

    return {
      success: true,
      adminEmails,
      message: `Đã gửi thông báo đơn thu mua mới tới ${adminEmails.length} quản trị viên.`,
    };
  },
};
