import { supabase } from './supabaseClient';
import { AdminTechnician, AdminCustomer, AdminService, AdminOrder } from '../types';

/**
 * Service dedicated to Admin operations:
 * - Supabase connection initialized & ready
 * - Methods and endpoints implemented per Admin requirements
 */
export const adminService = {
  /**
   * Check if Supabase connection is active for Admin service
   */
  isClientConnected(): boolean {
    return Boolean(supabase);
  },

  /**
   * Get Supabase client instance for admin queries
   */
  getClient() {
    return supabase;
  },

  /**
   * Fetch all orders with full joins (customer, worker, time_slots, order_details -> services, assignment)
   */
  async fetchAdminOrders(): Promise<AdminOrder[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customer_id(*, address(*)),
          time_slots(*),
          order_details(*, services(*)),
          assignment(*, worker:worker_id(*, worker_star(*)))
        `)
        .order('order_time', { ascending: false });

      if (error) {
        console.error('Error fetching admin orders:', error);
        return [];
      }

      return (data || []).map((order: any) => {
        const custObj = order.customer;
        const custLastName = custObj?.last_name || '';
        const custFirstName = custObj?.first_name || '';
        const customerName = (custLastName + ' ' + custFirstName).trim() || 'Khách hàng vãng lai';
        const customerPhone = custObj?.phone_number || '';
        const customerEmail = custObj?.email && !custObj.email.endsWith('@guest.local') ? custObj.email : '';

        // Address resolution
        const addressObj = Array.isArray(custObj?.address) ? custObj.address[0] : custObj?.address;
        const address = addressObj?.full_address ||
          [addressObj?.house_number, addressObj?.street, addressObj?.ward, addressObj?.province].filter(Boolean).join(', ') ||
          'Chưa cập nhật địa chỉ';

        // Time slot string
        const ts = order.time_slots;
        const timeSlotStr = ts ? `${ts.start_time?.slice(0, 5) || ''} - ${ts.end_time?.slice(0, 5) || ''}` : 'Chưa xếp lịch';

        // Multi-worker assignments resolution
        const assignList = order.assignment || [];
        const assignedWorkers: any[] = [];
        const addedWorkerIds = new Set<number>();

        if (Array.isArray(assignList) && assignList.length > 0) {
          assignList.forEach((a: any) => {
            const workerUser = a.worker;
            const wInfo = Array.isArray(workerUser?.worker_star) ? workerUser.worker_star[0] : (workerUser?.worker_star || workerUser?.worker);
            const lastName = workerUser?.last_name || '';
            const firstName = workerUser?.first_name || '';
            const wName = workerUser ? (lastName + ' ' + firstName).trim() : 'Kỹ thuật viên';
            const wPhone = workerUser?.phone_number || '';
            const rawStars = wInfo?.stars;
            const wStars = (rawStars !== undefined && rawStars !== null && !isNaN(Number(rawStars)) && Number(rawStars) > 0)
              ? Number(rawStars)
              : 5;

            if (a.worker_id && !addedWorkerIds.has(Number(a.worker_id))) {
              addedWorkerIds.add(Number(a.worker_id));
              assignedWorkers.push({
                workerId: Number(a.worker_id),
                workerName: wName,
                workerPhone: wPhone,
                workerStars: wStars,
                assignedAt: a.created_at
              });
            }
          });
        }

        const primaryWorker = assignedWorkers.length > 0 ? assignedWorkers[0] : null;
        const workerName = primaryWorker ? primaryWorker.workerName : 'Chưa phân công';
        const workerPhone = primaryWorker ? primaryWorker.workerPhone : '';
        const workerStars = primaryWorker ? primaryWorker.workerStars : 5;
        const primaryWorkerId = primaryWorker ? primaryWorker.workerId : undefined;

        // Order details items
        const details = order.order_details || [];
        const items = details.map((d: any) => {
          const s = d.services;
          const unitPrice = d.unit_price ?? s?.price ?? 0;
          const quantity = d.quantity || 1;
          const subTotalPrice = d.sub_total_price ?? (unitPrice * quantity);

          return {
            id: d.id,
            serviceId: d.service_id,
            serviceName: s?.name || 'Dịch vụ HVAC',
            deviceType: s?.device_type || '',
            quantity,
            unitPrice: Number(unitPrice),
            subTotalPrice: Number(subTotalPrice)
          };
        });

        // Human readable status text
        let statusText = 'Chờ xác nhận';
        if (order.status === 'verified') statusText = 'Đã xác nhận & Phân công';
        else if (order.status === 'completed') statusText = 'Hoàn thành';
        else if (order.status === 'cancelled') statusText = 'Đã hủy';

        // Assignment date
        const latestAssign = assignList.length > 0 ? assignList[assignList.length - 1] : null;

        return {
          id: order.id,
          orderCode: `#HD-${String(order.id).padStart(4, '0')}`,
          customerId: order.customer_id,
          customerName,
          customerPhone,
          customerEmail,
          address,
          orderTime: order.order_time || order.created_at,
          appointmentTime: order.appointment_time,
          timeSlot: timeSlotStr,
          status: order.status || 'pending',
          statusText,
          totalPrice: Number(order.total_price || 0),
          note: order.note || '',
          workerId: primaryWorkerId,
          workerName,
          workerPhone,
          workerStars,
          assignedWorkers,
          items,
          assignmentCreatedAt: latestAssign?.created_at || null
        };
      });
    } catch (err) {
      console.error('Unexpected error in fetchAdminOrders:', err);
      return [];
    }
  },

  /**
   * Assign one or multiple workers to order, set status to 'verified', and create records in 'assignment' table
   */
  async assignWorkersToOrder(orderId: number, workerIds: number[]): Promise<{ success: boolean; message?: string }> {
    if (!supabase) return { success: false, message: 'Supabase client chưa kết nối' };

    try {
      const nowIso = new Date().toISOString();
      const uniqueWorkerIds = Array.from(new Set(workerIds.map(id => Number(id)).filter(id => !isNaN(id) && id > 0)));

      // 1. Update orders table status = 'verified', updated_status_time
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'verified',
          updated_status_time: nowIso
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order for worker assignment:', orderError);
        return { success: false, message: orderError.message || 'Lỗi khi cập nhật trạng thái đơn hàng' };
      }

      // 2. Clear old assignments for this order
      await supabase
        .from('assignment')
        .delete()
        .eq('order_id', orderId);

      // 3. Insert new records into assignment table
      if (uniqueWorkerIds.length > 0) {
        const baseTime = Date.now();
        const rows = uniqueWorkerIds.map((wId, index) => {
          const rowCreatedAt = new Date(baseTime + index * 10 + Math.floor(Math.random() * 5)).toISOString();
          return {
            order_id: orderId,
            worker_id: wId,
            created_at: rowCreatedAt,
            updated_at: rowCreatedAt
          };
        });

        const { error: assignError } = await supabase
          .from('assignment')
          .insert(rows);

        if (assignError) {
          console.error('Error inserting into assignment table:', assignError);
          return { success: false, message: 'Lỗi khi lưu phân công kỹ thuật viên: ' + assignError.message };
        }
      }

      return { success: true };
    } catch (err: any) {
      console.error('Unexpected error in assignWorkersToOrder:', err);
      return { success: false, message: err?.message || 'Lỗi hệ thống khi phân công' };
    }
  },

  async assignWorkerToOrder(orderId: number, workerId: number): Promise<{ success: boolean; message?: string }> {
    return this.assignWorkersToOrder(orderId, [workerId]);
  },

  /**
   * Update order status directly
   */
  async updateOrderStatus(orderId: number, status: 'pending' | 'verified' | 'completed' | 'cancelled'): Promise<{ success: boolean; message?: string }> {
    if (!supabase) return { success: false, message: 'Supabase client chưa kết nối' };

    const nowIso = new Date().toISOString();
    const updatePayload: any = {
      status,
      updated_status_time: nowIso
    };
    if (status === 'completed') {
      updatePayload.completed_time = nowIso;
    }

    const { error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      return { success: false, message: error.message };
    }
    return { success: true };
  },

  async fetchTechnicians(): Promise<AdminTechnician[]> {
    if (!supabase) return [];

    try {
      const { data: usersData, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'worker')
        .order('created_at', { ascending: false });

      if (error || !usersData) {
        console.error('Error fetching technicians:', error);
        return [];
      }

      // Fetch stars from worker_star table
      const starsMap = new Map<number, number>();
      const { data: starsData } = await supabase.from('worker_star').select('*');
      if (starsData) {
        starsData.forEach((s: any) => {
          if (s.user_id) starsMap.set(Number(s.user_id), Number(s.stars));
        });
      }

      // Ensure missing worker_star rows are created in DB with default 5 stars
      const missingStarPayloads: { user_id: number; stars: number }[] = [];
      usersData.forEach((u: any) => {
        const uId = Number(u.id);
        if (!starsMap.has(uId)) {
          starsMap.set(uId, 5);
          missingStarPayloads.push({ user_id: uId, stars: 5 });
        }
      });

      if (missingStarPayloads.length > 0) {
        await supabase.from('worker_star').upsert(missingStarPayloads, { onConflict: 'user_id' });
      }

      return usersData.map((u: any) => {
        const rawStar = starsMap.get(Number(u.id));
        const stars = (rawStar !== undefined && rawStar !== null && !isNaN(Number(rawStar)) && Number(rawStar) > 0)
          ? Number(rawStar)
          : 5;

        return {
          id: String(u.id),
          first_name: u.first_name,
          last_name: u.last_name,
          email: u.email,
          phone_number: u.phone_number || '',
          avatar: u.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent((u.last_name || '') + ' ' + (u.first_name || '')),
          stars: stars,
          completedOrders: 0
        };
      });
    } catch (err) {
      console.error('Error in fetchTechnicians:', err);
      return [];
    }
  },

  async addTechnician(tech: { first_name: string, last_name: string, phone_number: string, email: string }): Promise<{ success: boolean; message?: string }> {
    if (!supabase) return { success: false, message: 'Supabase client not initialized' };
    
    const { data, error } = await supabase.from('users').insert([{
      first_name: tech.first_name,
      last_name: tech.last_name,
      phone_number: tech.phone_number,
      email: tech.email,
      password: null,
      role: 'worker'
    }]).select().single();

    if (error || !data) {
      console.error('Error adding tech (users):', error);
      return { success: false, message: error?.message || 'Lỗi khi thêm user' };
    }

    // Insert star into worker_star with default 5
    const { error: starError } = await supabase.from('worker_star').upsert([{
      user_id: data.id,
      stars: 5
    }]);

    if (starError) {
      console.warn('Notice inserting worker_star:', starError);
    }

    // Fallback: try worker table if it exists
    try {
      await supabase.from('worker').insert([{
        user_id: data.id,
        status: 'active',
        stars: 5
      }]);
    } catch {
      // ignore
    }

    return { success: true };
  },

  async updateTechnician(id: string, tech: { first_name: string, last_name: string, phone_number: string, email: string }): Promise<boolean> {
    if (!supabase) return false;
    
    const { error: userError } = await supabase.from('users').update({
      first_name: tech.first_name,
      last_name: tech.last_name,
      phone_number: tech.phone_number,
      email: tech.email
    }).eq('id', Number(id));

    if (userError) {
      console.error('Error updating tech (users):', userError);
      return false;
    }

    return true;
  },

  async deleteTechnician(id: string): Promise<boolean> {
    if (!supabase) return false;
    const techId = Number(id);
    if (isNaN(techId)) return false;

    try {
      // 1. Delete all records of this worker in 'assignment' table first
      const { error: assignError } = await supabase
        .from('assignment')
        .delete()
        .eq('worker_id', techId);

      if (assignError) {
        console.warn('Notice deleting worker assignment records:', assignError);
      }

      // 2. Delete from worker_star table
      const { error: starError } = await supabase
        .from('worker_star')
        .delete()
        .eq('user_id', techId);

      if (starError) {
        console.warn('Notice deleting worker_star record:', starError);
      }

      // 3. Delete from worker table if exists
      try {
        await supabase.from('worker').delete().eq('user_id', techId);
      } catch {
        // ignore
      }

      // 4. Delete technician record from users table
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', techId);

      if (userError) {
        console.error('Error deleting technician user:', userError);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Exception deleting technician:', err);
      return false;
    }
  },

  async fetchTechnicianHistory(id: string): Promise<any[]> {
    if (!supabase) return [];
    const techId = Number(id);
    if (isNaN(techId)) return [];

    const { data: assignData } = await supabase
      .from('assignment')
      .select('order_id')
      .eq('worker_id', techId);

    if (!assignData || assignData.length === 0) return [];
    const orderIds = assignData.map(a => Number(a.order_id)).filter(n => !isNaN(n) && n > 0);
    if (orderIds.length === 0) return [];

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_details(*, services(*))')
      .in('id', orderIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tech history:', error);
      return [];
    }

    return (data || []).map((order: any) => {
      const details = order.order_details || [];
      const serviceNames = details.map((d: any) => d.services?.name).filter(Boolean).join(', ');
      return {
        id: order.id,
        service_name: serviceNames || 'Dịch vụ',
        created_at: order.created_at,
        price: order.total_price || 0,
        status: order.status === 'completed' ? 'Hoàn thành' : order.status === 'verified' ? 'Đã xác nhận' : order.status === 'in_progress' ? 'Đang thực hiện' : order.status === 'cancelled' ? 'Đã hủy' : 'Đang chờ'
      };
    });
  },

  async fetchCustomers(): Promise<AdminCustomer[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('users')
      .select('*, address(*), orders:orders!customer_id(*)')
      .in('role', ['customer', 'loyal_customer', 'unregistered_customer'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      return [];
    }

    return (data || []).map((u: any) => {
      const addressObj = u.address?.[0];
      const fullAddress = addressObj?.full_address || 
        [addressObj?.house_number, addressObj?.street, addressObj?.ward, addressObj?.province].filter(Boolean).join(', ') || 
        'Chưa cập nhật địa chỉ';

      const ordersList = u.orders || [];
      const totalOrdersCount = ordersList.length;
      const totalSpendAmount = ordersList.reduce((sum: number, o: any) => sum + Number(o.total_price || 0), 0);
      
      const latestOrder = ordersList.length > 0 
        ? ordersList.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0] 
        : null;

      const lastName = u.last_name || '';
      const firstName = u.first_name || '';
      const fullName = (lastName + ' ' + firstName).trim() || 'Khách hàng';

      const isGuest = u.role === 'unregistered_customer' || !u.password || u.password.trim() === '' || (u.email && u.email.endsWith('@guest.local'));

      return {
        id: String(u.id),
        numericId: u.id,
        first_name: firstName,
        last_name: lastName,
        code: `KH-${String(u.id).padStart(4, '0')}`,
        name: fullName,
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=005396&color=fff`,
        phone: u.phone_number || 'Chưa có SĐT',
        email: u.email && !u.email.endsWith('@guest.local') ? u.email : 'Chưa tạo tài khoản',
        address: fullAddress,
        province: addressObj?.province || '',
        ward: addressObj?.ward || '',
        street: addressObj?.street || '',
        house_number: addressObj?.house_number || '',
        birth_year: u.birth_year,
        hasAccount: !isGuest,
        password: u.password,
        created_at: u.created_at,
        totalOrders: totalOrdersCount,
        totalSpend: totalSpendAmount,
        lastServiceDate: latestOrder ? new Date(latestOrder.created_at || latestOrder.order_time).toLocaleDateString('vi-VN') : 'Chưa có đơn',
        lastServiceType: latestOrder ? `Đơn #${latestOrder.id}` : 'N/A'
      };
    });
  },

  async addCustomerWithoutAccount(cust: {
    first_name: string;
    last_name: string;
    phone_number: string;
    province?: string;
    ward?: string;
    street?: string;
    house_number?: string;
    full_address?: string;
    address?: string;
  }): Promise<{ success: boolean; message?: string }> {
    if (!supabase) return { success: false, message: 'Supabase client chưa kết nối' };

    const cleanPhone = cust.phone_number.trim().replace(/\s+/g, '');
    const cleanFirstName = cust.first_name.trim();
    const cleanLastName = cust.last_name.trim();

    if (!cleanPhone) {
      return { success: false, message: 'Số điện thoại không hợp lệ.' };
    }

    // 1. Check if phone_number already exists in users table
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, phone_number')
        .eq('phone_number', cleanPhone)
        .maybeSingle();

      if (existingUser) {
        return { success: false, message: 'Số điện thoại này đã tồn tại trong hệ thống.' };
      }
    } catch (e) {
      console.warn('Check existing phone error:', e);
    }

    let insertPayload: any = {
      first_name: cleanFirstName,
      last_name: cleanLastName,
      phone_number: cleanPhone,
      email: null,
      password: null,
      role: 'unregistered_customer'
    };

    let { data, error } = await supabase.from('users').insert([insertPayload]).select().single();

    // If password NOT NULL constraint violation (error code 23502)
    if (error && (error.code === '23502' || error.message?.includes('password'))) {
      insertPayload.password = '';
      const retry = await supabase.from('users').insert([insertPayload]).select().single();
      data = retry.data;
      error = retry.error;
    }

    if (error || !data) {
      console.error('Error adding guest customer:', error);
      if (error?.code === '23505' || error?.message?.includes('unique') || error?.message?.includes('duplicate')) {
        return { success: false, message: 'Số điện thoại hoặc Email đã tồn tại trong hệ thống.' };
      }
      return { success: false, message: error?.message || 'Lỗi khi thêm khách hàng' };
    }

    const finalFullAddress = cust.full_address?.trim() || cust.address?.trim();
    if (finalFullAddress) {
      const { error: addrError } = await supabase.from('address').insert([{
        user_id: data.id,
        province: cust.province?.trim() || 'Chưa cập nhật',
        ward: cust.ward?.trim() || 'Chưa cập nhật',
        street: cust.street?.trim() || null,
        house_number: cust.house_number?.trim() || null,
        full_address: finalFullAddress
      }]);
      if (addrError) {
        console.error('Error adding address:', addrError);
      }
    }

    return { success: true };
  },

  async updateGuestCustomer(userId: number, cust: {
    first_name: string;
    last_name: string;
    phone_number: string;
    province?: string;
    ward?: string;
    street?: string;
    house_number?: string;
    full_address?: string;
  }): Promise<{ success: boolean; message?: string }> {
    if (!supabase) return { success: false, message: 'Supabase client chưa kết nối' };

    const cleanPhone = cust.phone_number.trim().replace(/\s+/g, '');
    const cleanFirstName = cust.first_name.trim();
    const cleanLastName = cust.last_name.trim();

    if (!cleanPhone || !cleanFirstName || !cleanLastName) {
      return { success: false, message: 'Vui lòng điền đầy đủ Họ, Tên và Số điện thoại.' };
    }

    // Update users table
    const { error: userError } = await supabase.from('users').update({
      first_name: cleanFirstName,
      last_name: cleanLastName,
      phone_number: cleanPhone
    }).eq('id', userId);

    if (userError) {
      console.error('Error updating guest customer:', userError);
      return { success: false, message: userError.message || 'Lỗi khi cập nhật thông tin khách hàng' };
    }

    // Update or Insert address table
    const finalFullAddress = cust.full_address?.trim();
    if (finalFullAddress) {
      const { data: existingAddr } = await supabase
        .from('address')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingAddr) {
        await supabase.from('address').update({
          province: cust.province?.trim() || 'Chưa cập nhật',
          ward: cust.ward?.trim() || 'Chưa cập nhật',
          street: cust.street?.trim() || null,
          house_number: cust.house_number?.trim() || null,
          full_address: finalFullAddress
        }).eq('id', existingAddr.id);
      } else {
        await supabase.from('address').insert([{
          user_id: userId,
          province: cust.province?.trim() || 'Chưa cập nhật',
          ward: cust.ward?.trim() || 'Chưa cập nhật',
          street: cust.street?.trim() || null,
          house_number: cust.house_number?.trim() || null,
          full_address: finalFullAddress
        }]);
      }
    }

    return { success: true };
  },

  async deleteGuestCustomer(userId: number): Promise<{ success: boolean; message?: string }> {
    if (!supabase) return { success: false, message: 'Supabase client chưa kết nối' };

    // Check if customer has orders
    const { data: existingOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('customer_id', userId)
      .limit(1);

    if (existingOrders && existingOrders.length > 0) {
      return {
        success: false,
        message: 'Không thể xóa khách hàng này vì khách hàng đã có đơn đặt dịch vụ trong hệ thống.'
      };
    }

    // Delete address record first
    await supabase.from('address').delete().eq('user_id', userId);

    // Delete user record
    const { error } = await supabase.from('users').delete().eq('id', userId);

    if (error) {
      console.error('Error deleting guest customer:', error);
      return { success: false, message: error.message || 'Lỗi khi xóa khách hàng' };
    }

    return { success: true };
  },

  async createCustomerAccount(userId: number, accountData: { email: string; password: string }): Promise<{ success: boolean; message?: string }> {
    if (!supabase) return { success: false, message: 'Supabase client chưa kết nối' };

    const { error } = await supabase.from('users').update({
      email: accountData.email,
      password: accountData.password
    }).eq('id', userId);

    if (error) {
      console.error('Error creating customer account:', error);
      return { success: false, message: error?.message || 'Lỗi khi tạo tài khoản' };
    }

    return { success: true };
  },

  async fetchCustomerOrders(customerId: number): Promise<any[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_details(*, services(*)), assignment(*, worker:worker_id(id, first_name, last_name, phone_number)), time_slots(*)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer orders:', error);
      return [];
    }

    return (data || []).map((order: any) => {
      const primaryWorker = order.assignment?.[0]?.worker;
      const workerName = primaryWorker 
        ? `${primaryWorker.last_name || ''} ${primaryWorker.first_name || ''}`.trim()
        : 'Chưa phân công';

      const timeSlotText = order.time_slots 
        ? `${order.time_slots.start_time || ''} - ${order.time_slots.end_time || ''}`
        : '';

      const items = (order.order_details || []).map((detail: any) => ({
        service_name: detail.services?.name || 'Dịch vụ',
        quantity: detail.quantity || 1,
        price: detail.sub_total_price || detail.services?.price || 0,
        device_type: detail.services?.device_type || ''
      }));

      return {
        id: order.id,
        order_time: order.order_time || order.created_at,
        appointment_time: order.appointment_time,
        time_slot: timeSlotText,
        status: order.status,
        status_text: order.status === 'completed' ? 'Hoàn thành' : order.status === 'verified' ? 'Đã xác nhận' : order.status === 'in_progress' ? 'Đang thực hiện' : order.status === 'cancelled' ? 'Đã hủy' : 'Đang chờ',
        total_price: order.total_price || 0,
        worker_name: workerName,
        worker_phone: primaryWorker?.phone_number || '',
        items
      };
    });
  },

  async fetchAdminServices(): Promise<AdminService[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching admin services:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: String(item.id),
      name: item.name,
      category: item.service_type,
      deviceType: item.device_type,
      price: Number(item.price) || 0,
      imageUrl: item.note || '',
      note: item.note
    }));
  },

  async addAdminService(service: { name: string, service_type: string, price: number, device_type: string, note?: string }): Promise<AdminService | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('services').insert([{
      name: service.name.trim(),
      service_type: service.service_type,
      price: Math.max(0, Number(service.price) || 0),
      device_type: service.device_type.trim(),
      note: service.note?.trim() || null
    }]).select().single();

    if (error) {
      console.error('Error adding admin service:', error);
      return null;
    }
    return {
      id: String(data.id),
      name: data.name,
      category: data.service_type,
      deviceType: data.device_type,
      price: Number(data.price) || 0,
      imageUrl: data.note || '',
      note: data.note
    };
  },

  async updateAdminService(id: string, service: { name: string, service_type: string, price: number, device_type: string, note?: string }): Promise<AdminService | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('services').update({
      name: service.name.trim(),
      service_type: service.service_type,
      price: Math.max(0, Number(service.price) || 0),
      device_type: service.device_type.trim(),
      note: service.note?.trim() || null,
      updated_at: new Date().toISOString()
    }).eq('id', Number(id)).select().single();

    if (error) {
      console.error('Error updating admin service:', error);
      return null;
    }
    return {
      id: String(data.id),
      name: data.name,
      category: data.service_type,
      deviceType: data.device_type,
      price: Number(data.price) || 0,
      imageUrl: data.note || '',
      note: data.note
    };
  },

  async deleteAdminService(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('services').delete().eq('id', Number(id));
    if (error) {
      console.error('Error deleting admin service:', error);
      return false;
    }
    return true;
  }
};

