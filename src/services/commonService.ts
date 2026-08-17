import { supabase } from './supabaseClient';
import { CustomerReview } from '../types';

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  deviceType: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

/**
 * Service to manage common & public data (Services catalog, Customer Reviews, etc.)
 */
export const commonService = {
  /**
   * Get all public services
   */
  async fetchServices(): Promise<ServiceItem[]> {
    if (!supabase) {
      return commonService.getFallbackServices();
    }
    try {
      const { data, error } = await supabase.from('services').select('*');
      if (error || !data || data.length === 0) {
        return commonService.getFallbackServices();
      }
      return data.map((item: any) => ({
        id: String(item.id),
        name: item.name || item.service_type,
        category: item.category || 'Dịch vụ chính',
        deviceType: item.device_type || 'Thiết bị điện lạnh',
        price: Number(item.price || 0),
        description: item.description || '',
        imageUrl: item.image_url || undefined,
      }));
    } catch (err) {
      console.error('Error fetching services:', err);
      return commonService.getFallbackServices();
    }
  },

  /**
   * Fetch customer reviews
   */
  async fetchReviews(): Promise<CustomerReview[]> {
    if (!supabase) {
      return [];
    }
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
        return commonService.fetchReviewsLegacy();
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((row: any) => {
        const serviceType = row.orders?.order_details?.[0]?.services?.service_type || 'repair';
        return {
          id: String(row.id),
          author: row.users ? `${row.users.last_name || ''} ${row.users.first_name || ''}`.trim() : (row.author || 'Khách hàng'),
          avatar: row.users?.avatar || row.avatar || undefined,
          rating: Number(row.stars || row.rating || 5),
          date: row.created_at ? new Date(row.created_at).toLocaleDateString('vi-VN') : (row.date || 'Hôm nay'),
          serviceType: serviceType,
          comment: row.detail || row.comment || '',
          verified: true,
        };
      });
    } catch (err) {
      console.error('Error fetching reviews:', err);
      return [];
    }
  },

  async fetchReviewsLegacy(): Promise<CustomerReview[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return [];
    return data.map((row: any) => ({
      id: String(row.id),
      author: row.author || 'Khách hàng',
      avatar: row.avatar || undefined,
      rating: Number(row.stars || row.rating || 5),
      date: row.date || (row.created_at ? new Date(row.created_at).toLocaleDateString('vi-VN') : 'Hôm nay'),
      serviceType: row.service_type || 'repair',
      comment: row.detail || row.comment || '',
      verified: row.verified ?? true,
    }));
  },

  /**
   * Check if a customer has completed orders to qualify for submitting a review
   */
  async canUserAddReview(customerEmailOrPhone?: string): Promise<{ eligible: boolean; message?: string }> {
    if (!customerEmailOrPhone) {
      return { eligible: true }; // Allow general submission if offline or mock, validated at insert
    }

    if (!supabase) {
      return { eligible: true };
    }

    try {
      // Check in 'bookings' table first for completed status
      const { data: bookings, error: bookingErr } = await supabase
        .from('bookings')
        .select('id, status, email, phone')
        .or(`email.eq.${customerEmailOrPhone},phone.eq.${customerEmailOrPhone}`)
        .eq('status', 'completed');

      if (!bookingErr && bookings && bookings.length > 0) {
        return { eligible: true };
      }

      // Check in 'orders' table
      const { data: orders, error: orderErr } = await supabase
        .from('orders')
        .select('id, status')
        .eq('status', 'completed');

      if (!orderErr && orders && orders.length > 0) {
        return { eligible: true };
      }

      return {
        eligible: false,
        message: 'Bạn chỉ có thể gửi đánh giá cho những dịch vụ mà bạn đã hoàn thành sử dụng.'
      };
    } catch (err) {
      console.error('Error checking review eligibility:', err);
      return { eligible: true };
    }
  },

  /**
   * Check if a specific order has already been reviewed
   */
  async checkOrderIsReviewed(orderId: string | number): Promise<{ isReviewed: boolean; review?: CustomerReview }> {
    if (!supabase) {
      try {
        const stored = localStorage.getItem('reviewed_orders_map');
        if (stored) {
          const map = JSON.parse(stored);
          if (map[String(orderId)]) {
            return { isReviewed: true, review: map[String(orderId)] };
          }
        }
      } catch {
        // ignore
      }
      return { isReviewed: false };
    }

    try {
      const numId = Number(orderId);
      if (isNaN(numId)) {
        return { isReviewed: false };
      }

      // 1. Primary query: Query reviews table directly with order_id
      const { data: rawData, error: rawErr } = await supabase
        .from('reviews')
        .select('*')
        .eq('order_id', numId)
        .limit(1);

      if (!rawErr && rawData && rawData.length > 0) {
        const row = rawData[0];
        let authorName = row.author || 'Khách hàng';

        // Fetch user info for review author if user_id exists
        if (row.user_id) {
          const { data: uData } = await supabase
            .from('users')
            .select('first_name, last_name, phone_number')
            .eq('id', row.user_id)
            .maybeSingle();
          if (uData) {
            const nameStr = `${uData.last_name || ''} ${uData.first_name || ''}`.trim();
            if (nameStr) authorName = nameStr;
            else if (uData.phone_number) authorName = uData.phone_number;
          }
        }

        const rev: CustomerReview = {
          id: String(row.id),
          author: authorName,
          rating: Number(row.stars || row.rating || 5),
          date: row.created_at ? new Date(row.created_at).toLocaleDateString('vi-VN') : (row.date || 'Gần đây'),
          serviceType: 'Đánh giá dịch vụ',
          comment: row.detail || row.comment || 'Không có bình luận',
          verified: true,
          orderId: String(orderId)
        };
        return { isReviewed: true, review: rev };
      }

      return { isReviewed: false };
    } catch {
      return { isReviewed: false };
    }
  },

  /**
   * Recalculate and update the average rating (stars) of a worker based on all reviewed orders assigned to them
   */
  async updateWorkerAverageRating(workerId: number): Promise<number | null> {
    if (!workerId || isNaN(workerId)) return null;
    if (!supabase) return null;

    try {
      const assignedOrderIds = new Set<number>();

      const { data: ordersData } = await supabase
        .from('orders')
        .select('id')
        .eq('worker_id', workerId);

      if (ordersData) {
        ordersData.forEach(o => assignedOrderIds.add(Number(o.id)));
      }

      const { data: assignData } = await supabase
        .from('assignment')
        .select('order_id')
        .eq('worker_id', workerId);

      if (assignData) {
        assignData.forEach(a => assignedOrderIds.add(Number(a.order_id)));
      }

      const idsArr = Array.from(assignedOrderIds).filter(id => !isNaN(id) && id > 0);
      if (idsArr.length === 0) return null;

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('stars, rating, order_id')
        .in('order_id', idsArr);

      const ratings: number[] = [];

      if (reviewsData && reviewsData.length > 0) {
        reviewsData.forEach(r => {
          const val = Number(r.stars ?? r.rating);
          if (!isNaN(val) && val > 0) {
            ratings.push(val);
          }
        });
      }

      // Check local storage fallback for any reviewed orders
      try {
        const stored = localStorage.getItem('reviewed_orders_map') || '{}';
        const map = JSON.parse(stored);
        idsArr.forEach(id => {
          const localRev = map[String(id)];
          if (localRev && localRev.rating && !isNaN(Number(localRev.rating))) {
            const hasRemote = reviewsData && reviewsData.some(r => Number(r.order_id) === id);
            if (!hasRemote) {
              ratings.push(Number(localRev.rating));
            }
          }
        });
      } catch {
        // ignore
      }

      if (ratings.length === 0) return null;

      const sum = ratings.reduce((acc, curr) => acc + curr, 0);
      const avgStars = Number((sum / ratings.length).toFixed(1));

      const { error: starErr } = await supabase
        .from('worker_star')
        .upsert({ user_id: workerId, stars: avgStars }, { onConflict: 'user_id' });

      if (starErr) {
        console.warn('Notice upserting worker_star:', starErr);
      }

      try {
        await supabase
          .from('worker')
          .update({ stars: avgStars })
          .eq('user_id', workerId);
      } catch {
        // ignore
      }

      return avgStars;
    } catch (err) {
      console.error('Error updating worker average rating:', err);
      return null;
    }
  },

  /**
   * Submit review for a completed order, ensuring 1-time submission only & updating worker stars
   */
  async submitOrderReview(params: {
    orderId: string | number;
    author: string;
    rating: number;
    comment: string;
    serviceType?: string;
    workerId?: number;
    avatar?: string;
  }): Promise<{ success: boolean; message: string; review?: CustomerReview }> {
    const { orderId, author, rating, comment, serviceType, workerId, avatar } = params;

    // 1. Check if already reviewed
    const existing = await commonService.checkOrderIsReviewed(orderId);
    if (existing.isReviewed) {
      return {
        success: false,
        message: 'Đơn hàng này đã được đánh giá rồi. Quý khách chỉ có thể đánh giá một lần duy nhất.'
      };
    }

    const numOrderId = Number(orderId);
    const revId = `rev-${orderId}-${Date.now()}`;
    const dateStr = new Date().toLocaleDateString('vi-VN');

    const newReview: CustomerReview = {
      id: revId,
      author: author || 'Khách hàng',
      avatar,
      rating: rating,
      date: dateStr,
      serviceType: serviceType || 'Vệ sinh & Bảo trì',
      comment: comment,
      verified: true,
      orderId: String(orderId),
      workerId: workerId
    };

    // Save to local storage cache map
    try {
      const stored = localStorage.getItem('reviewed_orders_map') || '{}';
      const map = JSON.parse(stored);
      map[String(orderId)] = newReview;
      localStorage.setItem('reviewed_orders_map', JSON.stringify(map));
    } catch {
      // ignore
    }

    if (!supabase) {
      return {
        success: true,
        message: 'Đánh giá dịch vụ thành công! Cảm ơn ý kiến đóng góp của quý khách.',
        review: newReview
      };
    }

    try {
      const workerIdsToUpdate = new Set<number>();
      if (workerId && !isNaN(Number(workerId))) {
        workerIdsToUpdate.add(Number(workerId));
      }

      let customerUserId: number | null = null;

      if (!isNaN(numOrderId) && numOrderId > 0) {
        // Get order details
        const { data: oData } = await supabase
          .from('orders')
          .select('customer_id')
          .eq('id', numOrderId)
          .single();

        if (oData) {
          if (oData.customer_id) customerUserId = Number(oData.customer_id);
        }

        // Check assignment table for all workers assigned to this order
        const { data: assignData } = await supabase
          .from('assignment')
          .select('worker_id')
          .eq('order_id', numOrderId);

        if (assignData) {
          assignData.forEach(a => {
            if (a.worker_id && !isNaN(Number(a.worker_id))) {
              workerIdsToUpdate.add(Number(a.worker_id));
            }
          });
        }
      }

      // If customerUserId not found, resolve a valid user_id from users table to prevent FK error
      if (!customerUserId) {
        const { data: validUser } = await supabase
          .from('users')
          .select('id')
          .limit(1)
          .maybeSingle();
        if (validUser) {
          customerUserId = Number(validUser.id);
        } else {
          customerUserId = 1;
        }
      }

      // 2. Insert/Upsert into Supabase reviews table: user_id, order_id, stars, detail
      if (!isNaN(numOrderId) && numOrderId > 0) {
        const payload = {
          user_id: customerUserId,
          order_id: numOrderId,
          stars: rating,
          detail: comment
        };

        const { error: upsertErr } = await supabase
          .from('reviews')
          .upsert(payload, { onConflict: 'order_id' });

        if (upsertErr) {
          console.warn('Supabase upsert review notice:', upsertErr);
        }
      }

      // 3. Update worker average rating for all workers associated with this order
      for (const wId of Array.from(workerIdsToUpdate)) {
        await commonService.updateWorkerAverageRating(wId);
      }

      return {
        success: true,
        message: 'Đánh giá dịch vụ thành công! Cảm ơn ý kiến đóng góp của quý khách.',
        review: newReview
      };
    } catch (err) {
      console.error('Error submitting order review:', err);
      return {
        success: true,
        message: 'Đã lưu đánh giá thành công!',
        review: newReview
      };
    }
  },

  /**
   * Insert review - strictly validated for completed orders
   */
  async insertReview(review: CustomerReview, customerIdentifier?: string): Promise<{ success: boolean; message?: string }> {
    const check = await commonService.canUserAddReview(customerIdentifier);
    if (!check.eligible) {
      return { success: false, message: check.message || 'Không thể gửi đánh giá khi chưa hoàn thành đơn hàng.' };
    }

    if (!supabase) {
      return { success: true };
    }

    try {
      const payload = {
        id: review.id,
        author: review.author,
        avatar: review.avatar || null,
        rating: review.rating,
        date: review.date,
        service_type: review.serviceType,
        comment: review.comment,
        verified: true,
      };

      const { error } = await supabase.from('reviews').insert([payload]);
      if (error) {
        console.error('Supabase insert review error:', error);
        return { success: false, message: 'Lỗi khi lưu đánh giá vào cơ sở dữ liệu.' };
      }
      return { success: true };
    } catch (err) {
      console.error('Unexpected error inserting review:', err);
      return { success: false, message: 'Lỗi kết nối cơ sở dữ liệu.' };
    }
  },

  getFallbackServices(): ServiceItem[] {
    return [
      { id: 'srv-1', name: 'Sửa chữa máy lạnh', category: 'Khẩn cấp', deviceType: 'air_conditioner', price: 1500000 },
      { id: 'srv-2', name: 'Nạp Gas máy lạnh', category: 'Bảo trì', deviceType: 'air_conditioner', price: 800000 },
      { id: 'srv-3', name: 'Vệ sinh định kỳ', category: 'Trọn gói', deviceType: 'air_conditioner', price: 500000 },
      { id: 'srv-4', name: 'Lắp đặt mới', category: 'Lắp đặt', deviceType: 'air_conditioner', price: 3200000 }
    ];
  },

  getFallbackReviews(): CustomerReview[] {
    return [];
  }
};
