import { supabase } from './supabaseClient';
import { AddressRecord } from '../types';

export const addressService = {
  /**
   * Add a new address record to public.address table
   */
  async addAddress(addressData: {
    user_id: number;
    province: string;
    ward: string;
    street?: string | null;
    house_number?: string | null;
    full_address: string;
    note?: string | null;
  }): Promise<{ success: boolean; data?: AddressRecord; message?: string }> {
    const payload = {
      user_id: addressData.user_id,
      province: addressData.province,
      ward: addressData.ward,
      street: addressData.street || null,
      house_number: addressData.house_number || null,
      full_address: addressData.full_address,
      note: addressData.note || null,
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('address')
          .insert([payload])
          .select('*')
          .single();

        if (!error && data) {
          return { success: true, data };
        } else {
          console.warn('Supabase addAddress notice/error:', error?.message);
        }
      } catch (err: any) {
        console.warn('Supabase addAddress exception:', err?.message);
      }
    }

    // Local fallback persistence
    try {
      const localAddresses: AddressRecord[] = JSON.parse(
        localStorage.getItem('hvac_masters_addresses') || '[]'
      );
      const newRecord: AddressRecord = {
        id: Date.now(),
        ...payload,
        created_at: new Date().toISOString(),
      };
      localAddresses.push(newRecord);
      localStorage.setItem('hvac_masters_addresses', JSON.stringify(localAddresses));
      return { success: true, data: newRecord };
    } catch {
      return { success: true };
    }
  },

  /**
   * Fetch all addresses for a specific user
   */
  async getUserAddresses(userId: number): Promise<AddressRecord[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('address')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('GetUserAddresses exception:', err);
      }
    }

    // Fallback local addresses
    try {
      const localAddresses: AddressRecord[] = JSON.parse(
        localStorage.getItem('hvac_masters_addresses') || '[]'
      );
      return localAddresses.filter((a) => a.user_id === userId);
    } catch {
      return [];
    }
  },

  /**
   * Update an existing address record
   */
  async updateAddress(
    addressId: number,
    addressData: {
      province: string;
      ward: string;
      street?: string | null;
      house_number?: string | null;
      full_address: string;
      note?: string | null;
    }
  ): Promise<{ success: boolean; data?: AddressRecord; message?: string }> {
    const payload = {
      province: addressData.province,
      ward: addressData.ward,
      street: addressData.street || null,
      house_number: addressData.house_number || null,
      full_address: addressData.full_address,
      note: addressData.note || null,
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('address')
          .update(payload)
          .eq('id', addressId)
          .select('*')
          .single();

        if (!error && data) {
          return { success: true, data };
        } else {
          console.warn('Supabase updateAddress notice/error:', error?.message);
        }
      } catch (err: any) {
        console.warn('Supabase updateAddress exception:', err?.message);
      }
    }

    // Local fallback persistence
    try {
      const localAddresses: AddressRecord[] = JSON.parse(
        localStorage.getItem('hvac_masters_addresses') || '[]'
      );
      const index = localAddresses.findIndex((a) => a.id === addressId);
      if (index !== -1) {
        localAddresses[index] = { ...localAddresses[index], ...payload };
        localStorage.setItem('hvac_masters_addresses', JSON.stringify(localAddresses));
        return { success: true, data: localAddresses[index] };
      }
    } catch {
      // Ignore fallback errors
    }
    return { success: true };
  },

  /**
   * Delete an address record by ID
   */
  async deleteAddress(addressId: number): Promise<{ success: boolean; message?: string }> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('address')
          .delete()
          .eq('id', addressId);

        if (error) {
          console.warn('Supabase deleteAddress error:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase deleteAddress exception:', err?.message);
      }
    }

    // Local fallback persistence
    try {
      const localAddresses: AddressRecord[] = JSON.parse(
        localStorage.getItem('hvac_masters_addresses') || '[]'
      );
      const filtered = localAddresses.filter((a) => a.id !== addressId);
      localStorage.setItem('hvac_masters_addresses', JSON.stringify(filtered));
    } catch {
      // Ignore fallback errors
    }

    return { success: true };
  },
};
