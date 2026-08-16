import { supabase } from './supabaseClient';
import {
  PurchasingOrderInput,
  PurchasingOrderRecord,
  PurchasingOrderDetail,
  UserProfile,
} from '../types';
import { notificationService } from './notificationService';

const PURCHASING_IMAGES_BUCKET = 'purchassing_devices_images';

/**
 * Helper to compress image and convert to Base64 data URL
 */
const compressImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 960;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve((e.target?.result as string) || '');
        }
      };
      img.onerror = () => resolve((e.target?.result as string) || '');
      img.src = (e.target?.result as string) || '';
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export const purchasingService = {
  /**
   * Upload device photos to Supabase Storage bucket: purchassing_devices_images/{order_id}/{order_detail_id}/{filename}
   * If RLS restriction or storage error occurs, automatically falls back to compressed Base64 data URLs with local cache.
   */
  async uploadDeviceImages(
    orderId: number,
    orderDetailId: number,
    files: File[]
  ): Promise<string[]> {
    if (!files || files.length === 0) return [];
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let finalUrl = '';

      if (supabase) {
        try {
          const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const fileName = `${Date.now()}_${i}_${cleanName}`;
          const filePath = `${orderId}/${orderDetailId}/${fileName}`;

          const { error } = await supabase.storage
            .from(PURCHASING_IMAGES_BUCKET)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
              contentType: file.type || 'image/jpeg',
            });

          if (!error) {
            const { data: urlData } = supabase.storage
              .from(PURCHASING_IMAGES_BUCKET)
              .getPublicUrl(filePath);

            if (urlData?.publicUrl) {
              finalUrl = urlData.publicUrl;
            }
          } else {
            console.warn(
              `Notice: Supabase Storage upload returned [${error.message}]. Switching to compressed base64 cache fallback. (To enable cloud storage uploads directly, add an INSERT policy on storage.objects for bucket '${PURCHASING_IMAGES_BUCKET}').`
            );
          }
        } catch (uploadErr) {
          console.warn('Storage upload exception:', uploadErr);
        }
      }

      // If Supabase upload was not successful (e.g. RLS policy restriction), use compressed base64 fallback
      if (!finalUrl) {
        try {
          finalUrl = await compressImageToBase64(file);
        } catch (convErr) {
          console.error('Error converting file to base64:', convErr);
        }
      }

      if (finalUrl) {
        uploadedUrls.push(finalUrl);
      }
    }

    // Cache locally for offline/RLS fallback retrieval
    if (uploadedUrls.length > 0) {
      try {
        localStorage.setItem(`purchasing_img_${orderId}_${orderDetailId}`, JSON.stringify(uploadedUrls));
      } catch (cacheErr) {
        console.warn('Could not cache images to localStorage (quota exceeded or disabled):', cacheErr);
      }
    }

    return uploadedUrls;
  },

  /**
   * Fetch device photos from Supabase Storage bucket purchassing_devices_images/{order_id}/{order_detail_id}
   * with local cache fallback.
   */
  async fetchDeviceDetailImages(orderId: number, orderDetailId: number): Promise<string[]> {
    let cloudUrls: string[] = [];
    if (supabase) {
      try {
        const folderPath = `${orderId}/${orderDetailId}`;
        const { data: fileList, error } = await supabase.storage
          .from(PURCHASING_IMAGES_BUCKET)
          .list(folderPath, {
            limit: 100,
            sortBy: { column: 'created_at', order: 'asc' },
          });

        if (!error && fileList && fileList.length > 0) {
          cloudUrls = fileList
            .filter((f) => f.name && !f.name.startsWith('.'))
            .map((f) => {
              const { data } = supabase.storage
                .from(PURCHASING_IMAGES_BUCKET)
                .getPublicUrl(`${folderPath}/${f.name}`);
              return data.publicUrl;
            });
        }
      } catch (err) {
        console.warn('Exception listing cloud device images:', err);
      }
    }

    if (cloudUrls.length > 0) {
      return cloudUrls;
    }

    // Fallback: check local storage cache
    try {
      const cached = localStorage.getItem(`purchasing_img_${orderId}_${orderDetailId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    return [];
  },

  /**
   * Create a new Purchasing Order (Thu mua thiết bị cũ)
   * Supports both unregistered visitors and logged-in customers
   */
  async createPurchasingOrder(
    input: PurchasingOrderInput,
    userProfile?: UserProfile | null
  ): Promise<{ success: boolean; orderId?: number; orderCode?: string; message?: string }> {
    try {
      let userId: number | null = userProfile?.id || null;

      // 1. Resolve User ID from users table
      if (!userId && supabase) {
        if (input.email && !input.email.endsWith('@guest.local')) {
          const { data: userByEmail } = await supabase
            .from('users')
            .select('id')
            .eq('email', input.email.trim())
            .maybeSingle();
          if (userByEmail) userId = userByEmail.id;
        }

        if (!userId && input.phone) {
          const cleanPhone = input.phone.trim().replace(/\s+/g, '');
          const { data: userByPhone } = await supabase
            .from('users')
            .select('id')
            .eq('phone_number', cleanPhone)
            .maybeSingle();
          if (userByPhone) userId = userByPhone.id;
        }

        // If unregistered customer not found, insert new user into public.users
        if (!userId) {
          const nameParts = (input.fullName || 'Khách Hàng').trim().split(' ');
          const lastName = nameParts[0] || 'Khách';
          const firstName = nameParts.slice(1).join(' ') || 'Vãng Lai';
          const userEmail = input.email && input.email.trim() ? input.email.trim() : null;

          const insertUserPayload: any = {
            first_name: firstName,
            last_name: lastName,
            email: userEmail,
            phone_number: input.phone?.trim() || null,
            role: 'unregistered_customer',
          };

          let { data: newUser, error: newUserErr } = await supabase
            .from('users')
            .insert([insertUserPayload])
            .select('id')
            .single();

          if (newUserErr && (newUserErr.code === '23502' || newUserErr.message?.includes('password'))) {
            insertUserPayload.password = '';
            const retry = await supabase
              .from('users')
              .insert([insertUserPayload])
              .select('id')
              .single();
            newUser = retry.data;
            newUserErr = retry.error;
          }

          if (newUser) {
            userId = newUser.id;
          }
        }
      }

      // Fallback user ID if still null
      if (!userId && supabase) {
        const { data: anyUser } = await supabase.from('users').select('id').limit(1);
        if (anyUser && anyUser.length > 0) {
          userId = anyUser[0].id;
        }
      }

      if (!userId) {
        userId = 1;
      }

      // 2. Resolve or Insert into public.address table
      let addressId: number | null = input.address_id ? Number(input.address_id) : null;

      // If no saved address was selected, insert a new address into public.address table
      if (!addressId && supabase) {
        const addrPayload = {
          user_id: userId,
          province: input.province?.trim() || 'Chưa xác định',
          ward: input.ward?.trim() || 'Chưa xác định',
          street: input.street?.trim() || null,
          house_number: input.house_number?.trim() || null,
          full_address: input.full_address?.trim() || 'Chưa cập nhật địa chỉ',
          note: input.address_note?.trim() || null,
        };

        const { data: newAddr, error: addrErr } = await supabase
          .from('address')
          .insert([addrPayload])
          .select('id')
          .single();

        if (addrErr) {
          console.error('Error inserting purchasing address:', addrErr);
          // Try fetching an existing address for this user
          const { data: existAddr } = await supabase
            .from('address')
            .select('id')
            .eq('user_id', userId)
            .limit(1);
          if (existAddr && existAddr.length > 0) {
            addressId = existAddr[0].id;
          }
        } else if (newAddr) {
          addressId = newAddr.id;
        }
      }

      if (!addressId) {
        addressId = 1;
      }

      // 3. Insert into public.purchassing_orders table
      let orderId: number = Date.now();
      if (supabase) {
        const orderPayload: any = {
          user_id: userId,
          address_id: addressId,
          status: 'pending',
          time_slot_id: input.time_slot_id || null,
          appointment_time: input.appointment_time || null,
        };

        const { data: insertedOrder, error: orderErr } = await supabase
          .from('purchassing_orders')
          .insert([orderPayload])
          .select('id')
          .single();

        if (orderErr) {
          console.error('Error inserting into purchassing_orders table:', orderErr);
          return { success: false, message: 'Lỗi khi lưu đơn thu mua: ' + orderErr.message };
        }

        if (insertedOrder) {
          orderId = Number(insertedOrder.id);
        }
      }

      // 4. Insert into public.purchassing_order_detail table and upload device images
      const savedDetails: PurchasingOrderDetail[] = [];

      if (input.items && input.items.length > 0) {
        for (let i = 0; i < input.items.length; i++) {
          const item = input.items[i];
          let detailId: number = Date.now() + i;
          let uploadedUrls: string[] = [];

          if (supabase) {
            const detailPayload: any = {
              purchassing_order_id: orderId,
              device: item.device,
              quantity: item.quantity || 1,
              desired_price: item.desired_price || 0,
              verified_price: null,
              note: item.note?.trim() || null,
            };

            const { data: insertedDetail, error: detailErr } = await supabase
              .from('purchassing_order_detail')
              .insert([detailPayload])
              .select('id')
              .single();

            if (detailErr) {
              console.error('Error inserting detail for', item.device, detailErr);
            } else if (insertedDetail) {
              detailId = Number(insertedDetail.id);
            }

            // Upload files to Supabase Storage bucket `purchassing_devices_images/{order_id}/{order_detail_id}`
            if (item.images && item.images.length > 0) {
              uploadedUrls = await purchasingService.uploadDeviceImages(orderId, detailId, item.images);
            }
          } else {
            uploadedUrls = item.previewUrls || [];
          }

          savedDetails.push({
            id: detailId,
            purchassing_order_id: orderId,
            device: String(item.device),
            quantity: item.quantity || 1,
            desired_price: item.desired_price || null,
            verified_price: null,
            note: item.note || null,
            images: uploadedUrls,
            previewUrls: uploadedUrls,
          });
        }
      }

      const orderCode = `#TM-${String(orderId).padStart(4, '0')}`;

      // 5. Send notification email to Admin Gmails
      const totalDesired = input.items.reduce((sum, it) => sum + (Number(it.desired_price) || 0), 0);
      const devicesSummary = input.items
        .map((it) => `${it.device} (SL: ${it.quantity}, Giá mong muốn: ${Number(it.desired_price || 0).toLocaleString('vi-VN')} đ)`)
        .join('; ');

      notificationService.notifyAdminsNewPurchasingOrder({
        orderId: String(orderId),
        orderCode,
        customerName: input.fullName,
        customerPhone: input.phone,
        customerEmail: input.email,
        address: input.full_address,
        addressNote: input.address_note,
        appointmentDate: input.appointment_time,
        timeSlotId: input.time_slot_id,
        items: input.items,
        totalDesiredPrice: totalDesired,
        devicesSummary,
      });

      // 6. Save fallback record to local storage for immediate persistence
      try {
        const localPurchasing: PurchasingOrderRecord[] = JSON.parse(
          localStorage.getItem('hvac_masters_purchasing_orders') || '[]'
        );
        const record: PurchasingOrderRecord = {
          id: orderId,
          orderCode,
          user_id: userId,
          customerName: input.fullName,
          customerPhone: input.phone,
          customerEmail: input.email,
          address_id: addressId,
          address: input.full_address,
          province: input.province,
          ward: input.ward,
          street: input.street,
          house_number: input.house_number,
          addressNote: input.address_note,
          status: 'pending',
          statusText: 'Chờ thẩm định & xác nhận',
          create_at: new Date().toISOString(),
          time_slot_id: input.time_slot_id,
          timeSlotStr: 'Theo lịch hẹn',
          appointment_time: input.appointment_time,
          details: savedDetails,
          totalDesiredPrice: totalDesired,
          totalVerifiedPrice: 0,
        };
        localPurchasing.unshift(record);
        localStorage.setItem('hvac_masters_purchasing_orders', JSON.stringify(localPurchasing));
      } catch (storageErr) {
        console.warn('Local storage error in purchasingService:', storageErr);
      }

      return {
        success: true,
        orderId,
        orderCode,
        message: 'Đăng ký yêu cầu thu mua thành công!',
      };
    } catch (err: any) {
      console.error('Unexpected error in createPurchasingOrder:', err);
      return { success: false, message: err?.message || 'Lỗi hệ thống khi gửi yêu cầu' };
    }
  },

  /**
   * Fetch customer purchasing orders for History tab
   */
  async fetchCustomerPurchasingOrders(customerPhoneOrEmail?: string): Promise<PurchasingOrderRecord[]> {
    if (!supabase) {
      try {
        const local: PurchasingOrderRecord[] = JSON.parse(
          localStorage.getItem('hvac_masters_purchasing_orders') || '[]'
        );
        if (!customerPhoneOrEmail) return local;
        const q = customerPhoneOrEmail.toLowerCase();
        return local.filter(
          (o) => o.customerPhone.toLowerCase().includes(q) || o.customerEmail.toLowerCase().includes(q)
        );
      } catch {
        return [];
      }
    }

    try {
      const { data, error } = await supabase
        .from('purchassing_orders')
        .select(`
          *,
          user:user_id (*),
          address:address_id (*),
          time_slot:time_slot_id (*),
          details:purchassing_order_detail (*)
        `)
        .order('create_at', { ascending: false });

      if (error) {
        console.error('Error fetching customer purchasing orders:', error);
        return [];
      }

      const results: PurchasingOrderRecord[] = await Promise.all(
        (data || []).map(async (row: any) => {
          const userObj = row.user;
          const addrObj = row.address;
          const ts = row.time_slot;
          const detailsList: PurchasingOrderDetail[] = await Promise.all(
            (row.details || []).map(async (d: any) => {
              let previewUrls: string[] = [];
              if (supabase && row.id && d.id) {
                previewUrls = await purchasingService.fetchDeviceDetailImages(row.id, d.id);
              }
              return {
                id: d.id,
                purchassing_order_id: d.purchassing_order_id,
                device: d.device || 'Thiết bị',
                quantity: Number(d.quantity || 1),
                desired_price: d.desired_price !== null ? Number(d.desired_price) : null,
                verified_price: d.verified_price !== null ? Number(d.verified_price) : null,
                note: d.note || '',
                previewUrls: previewUrls.length > 0 ? previewUrls : (d.previewUrls || []),
              };
            })
          );

          const totalDesired = detailsList.reduce((sum, d) => sum + (d.desired_price || 0), 0);
          const totalVerified = detailsList.reduce((sum, d) => sum + (d.verified_price || 0), 0);

          const customerName = userObj
            ? `${userObj.last_name || ''} ${userObj.first_name || ''}`.trim()
            : 'Khách hàng';

          const fullAddrStr =
            addrObj?.full_address ||
            [addrObj?.house_number, addrObj?.street, addrObj?.ward, addrObj?.province].filter(Boolean).join(', ') ||
            'Chưa cập nhật địa chỉ';

          const timeSlotStr = ts
            ? `${String(ts.start_time || '').slice(0, 5)} - ${String(ts.end_time || '').slice(0, 5)}`
            : '08:00 - 10:00';

          let statusText = 'Chờ thẩm định & xác nhận';
          if (row.status === 'verified') statusText = 'Đã thẩm định & Xác nhận';
          else if (row.status === 'completed') statusText = 'Đã hoàn thành thu mua';
          else if (row.status === 'canceled') statusText = 'Đã hủy';

          return {
            id: row.id,
            orderCode: `#TM-${String(row.id).padStart(4, '0')}`,
            user_id: row.user_id,
            customerName,
            customerPhone: userObj?.phone_number || '',
            customerEmail: userObj?.email && !userObj.email.endsWith('@guest.local') ? userObj.email : '',
            address_id: row.address_id,
            address: fullAddrStr,
            province: addrObj?.province,
            ward: addrObj?.ward,
            street: addrObj?.street,
            house_number: addrObj?.house_number,
            addressNote: addrObj?.note,
            status: row.status as any,
            statusText,
            create_at: row.create_at || new Date().toISOString(),
            time_slot_id: row.time_slot_id,
            timeSlotStr,
            appointment_time: row.appointment_time,
            details: detailsList,
            totalDesiredPrice: totalDesired,
            totalVerifiedPrice: totalVerified,
          };
        })
      );

      if (customerPhoneOrEmail) {
        const q = customerPhoneOrEmail.toLowerCase();
        return results.filter(
          (o) => o.customerPhone.toLowerCase().includes(q) || o.customerEmail.toLowerCase().includes(q)
        );
      }

      return results;
    } catch (err) {
      console.error('Unexpected error in fetchCustomerPurchasingOrders:', err);
      return [];
    }
  },

  /**
   * Fetch all purchasing orders for Admin management
   */
  async fetchAllPurchasingOrdersForAdmin(): Promise<PurchasingOrderRecord[]> {
    if (!supabase) {
      try {
        return JSON.parse(localStorage.getItem('hvac_masters_purchasing_orders') || '[]');
      } catch {
        return [];
      }
    }

    try {
      const { data, error } = await supabase
        .from('purchassing_orders')
        .select(`
          *,
          user:user_id (*),
          address:address_id (*),
          time_slot:time_slot_id (*),
          details:purchassing_order_detail (*)
        `)
        .order('create_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin purchasing orders:', error);
        return [];
      }

      return await Promise.all(
        (data || []).map(async (row: any) => {
          const userObj = row.user;
          const addrObj = row.address;
          const ts = row.time_slot;
          const detailsList: PurchasingOrderDetail[] = await Promise.all(
            (row.details || []).map(async (d: any) => {
              let previewUrls: string[] = [];
              if (supabase && row.id && d.id) {
                previewUrls = await purchasingService.fetchDeviceDetailImages(row.id, d.id);
              }
              return {
                id: d.id,
                purchassing_order_id: d.purchassing_order_id,
                device: d.device || 'Thiết bị',
                quantity: Number(d.quantity || 1),
                desired_price: d.desired_price !== null ? Number(d.desired_price) : null,
                verified_price: d.verified_price !== null ? Number(d.verified_price) : null,
                note: d.note || '',
                previewUrls: previewUrls.length > 0 ? previewUrls : (d.previewUrls || []),
              };
            })
          );

          const totalDesired = detailsList.reduce((sum, d) => sum + (d.desired_price || 0), 0);
          const totalVerified = detailsList.reduce((sum, d) => sum + (d.verified_price || 0), 0);

          const customerName = userObj
            ? `${userObj.last_name || ''} ${userObj.first_name || ''}`.trim()
            : 'Khách hàng';

          const fullAddrStr =
            addrObj?.full_address ||
            [addrObj?.house_number, addrObj?.street, addrObj?.ward, addrObj?.province].filter(Boolean).join(', ') ||
            'Chưa cập nhật địa chỉ';

          const timeSlotStr = ts
            ? `${String(ts.start_time || '').slice(0, 5)} - ${String(ts.end_time || '').slice(0, 5)}`
            : 'Chưa chọn khung giờ';

          let statusText = 'Chờ thẩm định & xác nhận';
          if (row.status === 'verified') statusText = 'Đã thẩm định & Xác nhận';
          else if (row.status === 'completed') statusText = 'Đã hoàn thành thu mua';
          else if (row.status === 'canceled') statusText = 'Đã hủy';

          return {
            id: row.id,
            orderCode: `#TM-${String(row.id).padStart(4, '0')}`,
            user_id: row.user_id,
            customerName,
            customerPhone: userObj?.phone_number || '',
            customerEmail: userObj?.email && !userObj.email.endsWith('@guest.local') ? userObj.email : '',
            address_id: row.address_id,
            address: fullAddrStr,
            province: addrObj?.province,
            ward: addrObj?.ward,
            street: addrObj?.street,
            house_number: addrObj?.house_number,
            addressNote: addrObj?.note,
            status: row.status as any,
            statusText,
            create_at: row.create_at || new Date().toISOString(),
            time_slot_id: row.time_slot_id,
            timeSlotStr,
            appointment_time: row.appointment_time,
            details: detailsList,
            totalDesiredPrice: totalDesired,
            totalVerifiedPrice: totalVerified,
          };
        })
      );
    } catch (err) {
      console.error('Unexpected error in fetchAllPurchasingOrdersForAdmin:', err);
      return [];
    }
  },

  /**
   * Update purchasing order status
   */
  async updatePurchasingOrderStatus(
    orderId: number,
    status: 'pending' | 'verified' | 'completed' | 'canceled'
  ): Promise<{ success: boolean; message?: string }> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('purchassing_orders')
          .update({ status })
          .eq('id', orderId);

        if (error) {
          console.error('Error updating purchasing order status:', error);
          return { success: false, message: error.message };
        }
      } catch (err: any) {
        console.error('Exception updating purchasing order status:', err);
      }
    }

    // Update local storage
    try {
      const local: PurchasingOrderRecord[] = JSON.parse(
        localStorage.getItem('hvac_masters_purchasing_orders') || '[]'
      );
      const updated = local.map((o) => (o.id === orderId ? { ...o, status } : o));
      localStorage.setItem('hvac_masters_purchasing_orders', JSON.stringify(updated));
    } catch {}

    return { success: true };
  },

  /**
   * Update verified price for a specific purchasing detail item
   */
  async updatePurchasingOrderDetailPrice(
    detailId: number,
    verifiedPrice: number | null
  ): Promise<{ success: boolean; message?: string }> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('purchassing_order_detail')
          .update({ verified_price: verifiedPrice })
          .eq('id', detailId);

        if (error) {
          console.error('Error updating purchasing detail price:', error);
          return { success: false, message: error.message };
        }
      } catch (err: any) {
        console.error('Exception in updatePurchasingOrderDetailPrice:', err);
      }
    }
    return { success: true };
  },
};
