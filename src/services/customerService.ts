import { supabase } from './supabaseClient';
import { BookingRecord } from '../types';

/**
 * Service to manage Customer specific operations:
 * - Fetching booking/service history for a customer
 * - Creating new booking requests
 * - Cancelling pending bookings
 * - Querying completed orders for review verification
 */
export const customerService = {
  /**
   * Fetch booking history for customer
   */
  async fetchCustomerBookings(customerPhoneOrEmail?: string): Promise<BookingRecord[]> {
    if (!supabase) {
      return [];
    }

    try {
      // 1. Try relational 'orders' table
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customer_id (
            first_name, last_name, phone_number, email,
            address (*)
          ),
          assignment (*, worker:worker_id (id, first_name, last_name, phone_number)),
          time_slot:time_slot_id (start_time, end_time),
          order_details (
            quantity, sub_total_price,
            services (name, service_type, device_type)
          ),
          detail_supplies_order (
            id, quantity, price, supply_id,
            supplies (id, name, device, type, unit, unit_price, note_detail)
          )
        `)
        .order('created_at', { ascending: false });

      if (!orderErr && orderData && orderData.length > 0) {
        let results = orderData.map((row: any) => {
          const details = row.order_details || [];
          const items = details.map((d: any) => {
            const srv = d.services;
            const unitPrice = Number(d.unit_price || (d.quantity ? d.sub_total_price / d.quantity : d.sub_total_price) || srv?.price || 0);
            return {
              serviceId: srv?.id || d.service_id,
              serviceName: srv?.name || 'Dịch vụ',
              deviceType: srv?.device_type || '',
              serviceType: srv?.service_type || '',
              unitPrice,
              quantity: Number(d.quantity || 1),
            };
          });

          const serviceNamesCombined = items.length > 0
            ? items.map((i: any) => `${i.serviceName} (${i.quantity} thiết bị)`).join(', ')
            : 'Dịch vụ kỹ thuật';

          const firstService = details[0]?.services;
          const custAddr = Array.isArray(row.customer?.address) ? row.customer?.address[0] : row.customer?.address;
          const fullAddressStr = 
            row.full_address || 
            row.address || 
            custAddr?.full_address || 
            [custAddr?.house_number, custAddr?.street, custAddr?.ward, custAddr?.province].filter(Boolean).join(', ') || 
            'Chưa cập nhật địa chỉ';

          const primaryAssign = Array.isArray(row.assignment) && row.assignment.length > 0 ? row.assignment[0] : null;
          const primaryWorker = primaryAssign?.worker;
          const assignedWorkerId = primaryAssign?.worker_id ? Number(primaryAssign.worker_id) : undefined;
          const techName = primaryWorker ? `${primaryWorker.last_name || ''} ${primaryWorker.first_name || ''}`.trim() : undefined;

          const rawSupplies = row.detail_supplies_order || [];
          const orderSupplies = rawSupplies.map((s: any) => {
            const sup = s.supplies;
            return {
              id: Number(s.id),
              order_id: Number(s.order_id || row.id),
              supply_id: Number(s.supply_id),
              quantity: Number(s.quantity || 1),
              price: Number(s.price || 0),
              supply_name: sup?.name || 'Vật tư',
              supply_device: sup?.device || '',
              supply_type: sup?.type || '',
              supply_unit: sup?.unit || 'bộ',
              unit_price: sup?.unit_price ? Number(sup.unit_price) : undefined,
              supply: sup
                ? {
                    id: Number(sup.id),
                    name: sup.name,
                    device: sup.device,
                    type: sup.type,
                    unit: sup.unit,
                    unit_price: sup.unit_price !== null ? Number(sup.unit_price) : null,
                    note_detail: sup.note_detail
                  }
                : undefined
            };
          });

          return {
            id: String(row.id),
            fullName: row.customer ? `${row.customer.last_name} ${row.customer.first_name}`.trim() : 'Khách hàng',
            phone: row.customer?.phone_number || '',
            email: row.customer?.email || '',
            address: fullAddressStr,
            device: firstService?.device_type || 'air_conditioner',
            servicePackage: firstService?.service_type || 'cleaning',
            serviceName: serviceNamesCombined,
            items,
            orderSupplies,
            selectedDate: row.appointment_time ? new Date(row.appointment_time).toISOString().split('T')[0] : '',
            selectedTimeSlot: row.time_slot ? `${row.time_slot.start_time.slice(0,5)} - ${row.time_slot.end_time.slice(0,5)}` : '08:00 - 10:00',
            notes: row.customer_note || row.note || row.notes || '',
            createdAt: row.created_at || row.order_time || new Date().toISOString(),
            status: row.status as any,
            technicianName: techName,
            technicianPhone: primaryWorker?.phone_number || undefined,
            workerId: assignedWorkerId,
            technicianId: assignedWorkerId,
            estimatedCost: Number(row.total_price || 0),
            finalCost: row.status === 'completed' ? Number(row.total_price || 0) : undefined,
          };
        });

        if (customerPhoneOrEmail) {
          const term = customerPhoneOrEmail.toLowerCase();
          results = results.filter(b => 
            b.phone.toLowerCase().includes(term) || 
            b.email.toLowerCase().includes(term)
          );
        }
        return results;
      }

      // 2. Fallback to 'bookings' table
      let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (customerPhoneOrEmail) {
        query = query.or(`email.eq.${customerPhoneOrEmail},phone.eq.${customerPhoneOrEmail}`);
      }

      const { data: legacyData, error: legacyErr } = await query;
      if (legacyErr || !legacyData) return [];

      return legacyData.map((row: any) => ({
        id: String(row.id),
        fullName: row.full_name || 'Khách hàng',
        phone: row.phone || '',
        email: row.email || '',
        address: row.address || '',
        device: row.device || 'air_conditioner',
        servicePackage: row.service_package || 'cleaning',
        selectedDate: row.selected_date || '',
        selectedTimeSlot: row.selected_time_slot || '',
        notes: row.notes || '',
        createdAt: row.created_at,
        status: row.status,
        technicianName: row.technician_name || undefined,
        technicianPhone: row.technician_phone || undefined,
        estimatedCost: Number(row.estimated_cost || 0),
        finalCost: row.final_cost ? Number(row.final_cost) : undefined,
      }));
    } catch (err) {
      console.error('Error fetching customer bookings:', err);
      return [];
    }
  },

  /**
   * Create a new service booking for Customer
   */
  async createBooking(
    booking: BookingRecord,
    extra?: { serviceId?: number; timeSlotId?: number; customerId?: number }
  ): Promise<{ success: boolean; message?: string }> {
    if (!supabase) {
      return { success: true };
    }

    try {
      // ----------------------------------------------------
      // 1. Resolve Customer ID (FK -> public.users)
      // ----------------------------------------------------
      let customerId: number | null = extra?.customerId || null;

      if (!customerId) {
        if (booking.email && !booking.email.endsWith('@guest.local')) {
          const { data: userByEmail } = await supabase
            .from('users')
            .select('id')
            .eq('email', booking.email)
            .maybeSingle();
          if (userByEmail) customerId = userByEmail.id;
        }

        if (!customerId && booking.phone) {
          const { data: userByPhone } = await supabase
            .from('users')
            .select('id')
            .eq('phone_number', booking.phone)
            .maybeSingle();
          if (userByPhone) customerId = userByPhone.id;
        }

        // If not found in users table, insert new user into public.users
        if (!customerId) {
          const nameParts = (booking.fullName || 'Khách Hàng').trim().split(' ');
          const lastName = nameParts[0] || 'Khách';
          const firstName = nameParts.slice(1).join(' ') || 'Hàng';
          const userEmail = booking.email && booking.email.trim() ? booking.email.trim() : null;

          const insertPayload: any = {
            first_name: firstName,
            last_name: lastName,
            email: userEmail,
            phone_number: booking.phone?.trim() || null,
            role: 'guest_customer',
          };

          let { data: newUser, error: newUserErr } = await supabase
            .from('users')
            .insert([insertPayload])
            .select('id')
            .single();

          if (newUserErr && (newUserErr.code === '23502' || newUserErr.message?.includes('password'))) {
            insertPayload.password = '';
            const retry = await supabase
              .from('users')
              .insert([insertPayload])
              .select('id')
              .single();
            newUser = retry.data;
            newUserErr = retry.error;
          }

          if (!newUserErr && newUser) {
            customerId = newUser.id;
          }
        }
      }

      // Fallback customer ID if still null
      if (!customerId) {
        const { data: anyUser } = await supabase.from('users').select('id').limit(1);
        if (anyUser && anyUser.length > 0) {
          customerId = anyUser[0].id;
        }
      }

      // ----------------------------------------------------
      // 2. Resolve Time Slot ID (FK -> public.time_slots)
      // ----------------------------------------------------
      let timeSlotId: number | null = extra?.timeSlotId || null;

      if (!timeSlotId) {
        const { data: slots } = await supabase
          .from('time_slots')
          .select('id')
          .eq('is_active', true)
          .limit(1);
        if (slots && slots.length > 0) {
          timeSlotId = slots[0].id;
        } else {
          timeSlotId = 1;
        }
      }

      // ----------------------------------------------------
      // 3. Resolve Service ID (FK -> public.services)
      // ----------------------------------------------------
      let serviceId: number | null = extra?.serviceId || null;

      if (!serviceId) {
        const { data: services } = await supabase.from('services').select('id').limit(1);
        if (services && services.length > 0) {
          serviceId = services[0].id;
        } else {
          serviceId = 1;
        }
      }

      // ----------------------------------------------------
      // 4. Insert into public.orders & public.order_details
      // ----------------------------------------------------
      if (customerId && timeSlotId) {
        const appointmentTimeStr = booking.selectedDate ? `${booking.selectedDate}T08:00:00` : new Date().toISOString();
        const { data: insertedOrder, error: orderErr } = await supabase
          .from('orders')
          .insert([
            {
              customer_id: customerId,
              time_slot_id: timeSlotId,
              appointment_time: appointmentTimeStr,
              status: 'pending',
              total_price: booking.estimatedCost || 0,
              order_time: new Date().toISOString(),
              customer_note: booking.notes || null,
            },
          ])
          .select('id')
          .single();

        if (orderErr) {
          console.error('Error inserting into orders table:', orderErr);
        } else if (insertedOrder) {
          if (booking.items && booking.items.length > 0) {
            const detailsToInsert = booking.items.map((item) => ({
              order_id: insertedOrder.id,
              service_id: Number(item.serviceId),
              quantity: item.quantity,
              unit_price: item.unitPrice,
              sub_total_price: item.quantity * item.unitPrice,
            }));
            const { error: detailErr } = await supabase.from('order_details').insert(detailsToInsert);
            if (detailErr) {
              console.error('Error inserting into order_details table:', detailErr);
            }
          } else if (serviceId) {
            const { error: detailErr } = await supabase.from('order_details').insert([
              {
                order_id: insertedOrder.id,
                service_id: serviceId,
                quantity: 1,
                unit_price: booking.estimatedCost || 0,
                sub_total_price: booking.estimatedCost || 0,
              },
            ]);
            if (detailErr) {
              console.error('Error inserting into order_details table:', detailErr);
            }
          }
        }
      }

      // ----------------------------------------------------
      // 5. Also insert into legacy/flat bookings table if exists
      // ----------------------------------------------------
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
        status: booking.status || 'pending',
        technician_name: booking.technicianName || null,
        technician_phone: booking.technicianPhone || null,
        estimated_cost: booking.estimatedCost,
        final_cost: booking.finalCost || null,
      };

      try {
        await supabase.from('bookings').insert([payload]);
      } catch (legacyErr) {
        // Ignored if bookings table does not exist
      }

      return { success: true };
    } catch (err) {
      console.error('Unexpected error in createBooking:', err);
      return { success: false, message: 'Lỗi kết nối cơ sở dữ liệu.' };
    }
  },

  /**
   * Cancel booking (Customer action)
   */
  async cancelBooking(bookingId: string): Promise<boolean> {
    if (!supabase) return true;
    try {
      let updated = false;

      // 1. Try updating 'orders' table (numeric ID)
      const numId = Number(bookingId);
      if (!isNaN(numId)) {
        const { error: orderErr } = await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', numId);

        if (!orderErr) {
          updated = true;
        }
      }

      // 2. Also try updating 'bookings' table
      const { error: bookingErr } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (!bookingErr) {
        updated = true;
      }

      return updated || true;
    } catch (err) {
      console.info('Info in cancelBooking:', err);
      return true;
    }
  },

  /**
   * Get list of completed orders for customer to verify review eligibility
   */
  async getCompletedOrders(customerPhoneOrEmail: string): Promise<BookingRecord[]> {
    const allBookings = await customerService.fetchCustomerBookings(customerPhoneOrEmail);
    return allBookings.filter(b => b.status === 'completed');
  }
};
