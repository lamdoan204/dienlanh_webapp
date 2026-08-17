import { supabase } from './supabaseClient';
import { SupplyItem, OrderSupplyItem } from '../types';

export const suppliesService = {
  /**
   * Fetch all construction & supplies pricing data from 'public.supplies'
   */
  async fetchSupplies(): Promise<SupplyItem[]> {
    if (!supabase) {
      return [];
    }
    try {
      const { data, error } = await supabase
        .from('supplies')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching supplies from public.supplies:', error);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: Number(row.id),
        name: row.name || '',
        device: row.device || null,
        type: row.type || null,
        unit: row.unit || null,
        unit_price: row.unit_price !== null && row.unit_price !== undefined ? Number(row.unit_price) : null,
        note_detail: row.note_detail || null,
      }));
    } catch (err) {
      console.error('Exception fetching supplies:', err);
      return [];
    }
  },

  /**
   * Create a new supply item
   */
  async createSupply(payload: Omit<SupplyItem, 'id'>): Promise<{ success: boolean; data?: SupplyItem; error?: string }> {
    if (!supabase) return { success: false, error: 'Chưa kết nối Supabase' };
    try {
      const insertPayload = {
        name: payload.name.trim(),
        device: payload.device?.trim() || null,
        type: payload.type?.trim() || null,
        unit: payload.unit?.trim() || null,
        unit_price: payload.unit_price !== undefined && payload.unit_price !== null ? Number(payload.unit_price) : null,
        note_detail: payload.note_detail?.trim() || null,
      };

      const { data, error } = await supabase
        .from('supplies')
        .insert([insertPayload])
        .select()
        .single();

      if (error) {
        console.error('Error creating supply:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: {
          id: Number(data.id),
          name: data.name,
          device: data.device,
          type: data.type,
          unit: data.unit,
          unit_price: data.unit_price !== null ? Number(data.unit_price) : null,
          note_detail: data.note_detail,
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi không xác định khi thêm vật tư' };
    }
  },

  /**
   * Update an existing supply item
   */
  async updateSupply(id: number, payload: Partial<Omit<SupplyItem, 'id'>>): Promise<{ success: boolean; data?: SupplyItem; error?: string }> {
    if (!supabase) return { success: false, error: 'Chưa kết nối Supabase' };
    try {
      const updatePayload: any = {};
      if (payload.name !== undefined) updatePayload.name = payload.name.trim();
      if (payload.device !== undefined) updatePayload.device = payload.device?.trim() || null;
      if (payload.type !== undefined) updatePayload.type = payload.type?.trim() || null;
      if (payload.unit !== undefined) updatePayload.unit = payload.unit?.trim() || null;
      if (payload.unit_price !== undefined) updatePayload.unit_price = payload.unit_price !== null ? Number(payload.unit_price) : null;
      if (payload.note_detail !== undefined) updatePayload.note_detail = payload.note_detail?.trim() || null;

      const { data, error } = await supabase
        .from('supplies')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating supply:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: {
          id: Number(data.id),
          name: data.name,
          device: data.device,
          type: data.type,
          unit: data.unit,
          unit_price: data.unit_price !== null ? Number(data.unit_price) : null,
          note_detail: data.note_detail,
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi không xác định khi cập nhật vật tư' };
    }
  },

  /**
   * Delete a supply item
   */
  async deleteSupply(id: number): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: false, error: 'Chưa kết nối Supabase' };
    try {
      const { error } = await supabase
        .from('supplies')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting supply:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi không xác định khi xóa vật tư' };
    }
  },

  /**
   * Fetch all supplies attached to a specific order (detail_supplies_order)
   */
  async fetchOrderSupplies(orderId: number): Promise<OrderSupplyItem[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('detail_supplies_order')
        .select(`
          *,
          supplies (id, name, device, type, unit, unit_price, note_detail)
        `)
        .eq('order_id', orderId);

      if (error) {
        console.error(`Error fetching supplies for order #${orderId}:`, error);
        return [];
      }

      return (data || []).map((row: any) => {
        const sup = row.supplies;
        return {
          id: Number(row.id),
          order_id: Number(row.order_id),
          supply_id: Number(row.supply_id),
          quantity: Number(row.quantity || 1),
          price: Number(row.price || 0),
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
    } catch (err) {
      console.error(`Exception fetching supplies for order #${orderId}:`, err);
      return [];
    }
  },

  /**
   * Save order supplies (replace list for order_id) and recalculate order total_price
   */
  async saveOrderSupplies(
    orderId: number,
    items: { supply_id: number; quantity: number; price: number }[]
  ): Promise<{ success: boolean; newTotalPrice?: number; orderSupplies?: OrderSupplyItem[]; error?: string }> {
    if (!supabase) return { success: false, error: 'Chưa kết nối Supabase' };
    try {
      // 1. Delete existing order supplies for orderId
      const { error: delErr } = await supabase
        .from('detail_supplies_order')
        .delete()
        .eq('order_id', orderId);

      if (delErr) {
        console.error('Error deleting previous detail_supplies_order:', delErr);
        return { success: false, error: delErr.message };
      }

      // 2. Insert new supplies list if non-empty
      if (items.length > 0) {
        const insertRows = items.map((it) => ({
          order_id: Number(orderId),
          supply_id: Number(it.supply_id),
          quantity: Number(it.quantity || 1),
          price: Number(it.price || 0)
        }));

        const { error: insErr } = await supabase
          .from('detail_supplies_order')
          .insert(insertRows);

        if (insErr) {
          console.error('Error inserting detail_supplies_order:', insErr);
          return { success: false, error: insErr.message };
        }
      }

      // 3. Recalculate total_price for the order
      // Sum of order_details (services)
      const { data: orderDetails } = await supabase
        .from('order_details')
        .select('sub_total_price, quantity, unit_price')
        .eq('order_id', orderId);

      const servicesTotal = (orderDetails || []).reduce((sum: number, d: any) => {
        const sub = d.sub_total_price ?? (Number(d.quantity || 1) * Number(d.unit_price || 0));
        return sum + Number(sub || 0);
      }, 0);

      const suppliesTotal = items.reduce((sum, it) => sum + Number(it.price || 0), 0);
      const newTotalPrice = servicesTotal + suppliesTotal;

      // Update orders table with new total_price
      const { error: updateOrderErr } = await supabase
        .from('orders')
        .update({ total_price: newTotalPrice })
        .eq('id', orderId);

      if (updateOrderErr) {
        console.error('Error updating order total_price:', updateOrderErr);
      }

      // 4. Fetch updated list with joined supply details
      const updatedOrderSupplies = await this.fetchOrderSupplies(orderId);

      return {
        success: true,
        newTotalPrice,
        orderSupplies: updatedOrderSupplies
      };
    } catch (err: any) {
      console.error('Exception in saveOrderSupplies:', err);
      return { success: false, error: err.message || 'Lỗi khi cập nhật vật tư đơn hàng' };
    }
  }
};
