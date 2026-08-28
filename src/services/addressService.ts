import { supabase } from './supabaseClient';
import {
  AddressRecord,
  AdministrativeProvince,
  AdministrativeWard,
  AddressSuggestionItem,
  CustomerAddressData,
} from '../types';

export const addressService = {
  /**
   * 1. Lấy danh sách toàn bộ Tỉnh / Thành phố Việt Nam từ Backend API
   */
  async getProvinces(): Promise<AdministrativeProvince[]> {
    try {
      const response = await fetch('/api/address/provinces');
      if (response.ok) {
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('getProvinces fetch error, using fallback:', err);
    }

    // Fallback nếu API backend tạm thời không phản hồi
    return [
      { code: '79', name: 'Thành phố Hồ Chí Minh' },
      { code: '01', name: 'Thành phố Hà Nội' },
      { code: '48', name: 'Thành phố Đà Nẵng' },
      { code: '31', name: 'Thành phố Hải Phòng' },
      { code: '92', name: 'Thành phố Cần Thơ' },
      { code: '74', name: 'Tỉnh Bình Dương' },
      { code: '75', name: 'Tỉnh Đồng Nai' },
      { code: '77', name: 'Tỉnh Bà Rịa - Vũng Tàu' },
    ];
  },

  /**
   * 2. Lấy danh sách Phường / Xã theo Tỉnh / Thành phố từ Backend API
   */
  async getWards(provinceCode: string): Promise<AdministrativeWard[]> {
    if (!provinceCode) return [];
    try {
      const response = await fetch(`/api/address/wards?province_code=${encodeURIComponent(provinceCode)}`);
      if (response.ok) {
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('getWards fetch error:', err);
    }
    return [];
  },

  /**
   * 2b. Tìm kiếm và gợi ý Phường / Xã qua Backend & VIETMAP API
   */
  async searchWards(
    query: string,
    options?: {
      provinceCode?: string;
      provinceName?: string;
    },
    signal?: AbortSignal
  ): Promise<AdministrativeWard[]> {
    const q = (query || '').trim();
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (options?.provinceCode) params.set('province_code', options.provinceCode);
      if (options?.provinceName) params.set('province', options.provinceName);

      const response = await fetch(`/api/address/wards?${params.toString()}`, {
        signal,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return [];
      }
      console.warn('searchWards fetch error:', err);
    }
    return [];
  },

  /**
   * 3. Gợi ý địa chỉ Autocomplete với VIETMAP Autocomplete API v4 (qua Backend Proxy)
   */
  async autocomplete(
    query: string,
    options?: {
      provinceCode?: string;
      wardCode?: string;
      provinceName?: string;
      wardName?: string;
    },
    signal?: AbortSignal
  ): Promise<AddressSuggestionItem[]> {
    const q = (query || '').trim();
    if (!q || q.length < 3) return [];

    try {
      const params = new URLSearchParams();
      params.set('q', q);
      if (options?.provinceCode) params.set('province_code', options.provinceCode);
      if (options?.wardCode) params.set('ward_code', options.wardCode);
      if (options?.provinceName) params.set('province', options.provinceName);
      if (options?.wardName) params.set('ward', options.wardName);

      const response = await fetch(`/api/address/autocomplete?${params.toString()}`, {
        signal,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        const json = await response.json();
        if (Array.isArray(json.items)) {
          return json.items;
        }
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // Request bị abort chủ động, không báo lỗi
        return [];
      }
      console.warn('addressService autocomplete error:', err);
    }
    return [];
  },

  /**
   * 4. Lấy chi tiết tọa độ Place Detail từ VIETMAP Place API v4
   */
  async getPlaceDetail(refId: string): Promise<AddressSuggestionItem | null> {
    if (!refId) return null;
    try {
      const response = await fetch(`/api/address/place-detail?refid=${encodeURIComponent(refId)}`);
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('getPlaceDetail error:', err);
    }
    return null;
  },

  /**
   * 5. Lưu địa chỉ mới vào cơ sở dữ liệu `customer_addresses` / `address`
   */
  async addAddress(addressData: {
    user_id: number;
    province: string;
    ward: string;
    province_code?: string | null;
    province_name?: string | null;
    ward_code?: string | null;
    ward_name?: string | null;
    street?: string | null;
    house_number?: string | null;
    full_address: string;
    latitude?: number | null;
    longitude?: number | null;
    note?: string | null;
  }): Promise<{ success: boolean; data?: AddressRecord; message?: string }> {
    const payload: Partial<AddressRecord> = {
      user_id: addressData.user_id,
      province: addressData.province_name || addressData.province,
      ward: addressData.ward_name || addressData.ward,
      province_code: addressData.province_code || null,
      province_name: addressData.province_name || addressData.province,
      ward_code: addressData.ward_code || null,
      ward_name: addressData.ward_name || addressData.ward,
      street: addressData.street || null,
      house_number: addressData.house_number || null,
      full_address: addressData.full_address,
      latitude: addressData.latitude || null,
      longitude: addressData.longitude || null,
      note: addressData.note || null,
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        // Thử lưu vào customer_addresses hoặc address
        const { data, error } = await supabase
          .from('customer_addresses')
          .insert([payload])
          .select('*')
          .single();

        if (!error && data) {
          return { success: true, data };
        } else {
          // Thử lưu bảng address
          const { data: addrData, error: addrError } = await supabase
            .from('address')
            .insert([payload])
            .select('*')
            .single();

          if (!addrError && addrData) {
            return { success: true, data: addrData };
          }
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
        user_id: addressData.user_id,
        province: addressData.province_name || addressData.province,
        ward: addressData.ward_name || addressData.ward,
        province_code: addressData.province_code || null,
        province_name: addressData.province_name || addressData.province,
        ward_code: addressData.ward_code || null,
        ward_name: addressData.ward_name || addressData.ward,
        street: addressData.street || null,
        house_number: addressData.house_number || null,
        full_address: addressData.full_address,
        latitude: addressData.latitude || null,
        longitude: addressData.longitude || null,
        note: addressData.note || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localAddresses.unshift(newRecord);
      localStorage.setItem('hvac_masters_addresses', JSON.stringify(localAddresses));
      return { success: true, data: newRecord };
    } catch {
      return { success: true };
    }
  },

  /**
   * 6. Lấy tất cả địa chỉ của người dùng
   */
  async getUserAddresses(userId: number): Promise<AddressRecord[]> {
    if (supabase) {
      try {
        // Thử lấy từ customer_addresses
        const { data, error } = await supabase
          .from('customer_addresses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data;
        }

        // Thử lấy từ address
        const { data: addrData, error: addrError } = await supabase
          .from('address')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!addrError && addrData && addrData.length > 0) {
          return addrData;
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
   * 7. Cập nhật địa chỉ
   */
  async updateAddress(
    addressId: number,
    addressData: Partial<CustomerAddressData> & { note?: string | null }
  ): Promise<{ success: boolean; data?: AddressRecord; message?: string }> {
    const payload = {
      province: addressData.province_name,
      ward: addressData.ward_name,
      province_code: addressData.province_code || null,
      province_name: addressData.province_name || null,
      ward_code: addressData.ward_code || null,
      ward_name: addressData.ward_name || null,
      street: addressData.street || null,
      house_number: addressData.house_number || null,
      full_address: addressData.full_address,
      latitude: addressData.latitude || null,
      longitude: addressData.longitude || null,
      note: addressData.note || null,
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('customer_addresses')
          .update(payload)
          .eq('id', addressId)
          .select('*')
          .single();

        if (!error && data) {
          return { success: true, data };
        }

        const { data: addrData, error: addrError } = await supabase
          .from('address')
          .update(payload)
          .eq('id', addressId)
          .select('*')
          .single();

        if (!addrError && addrData) {
          return { success: true, data: addrData };
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
   * 8. Xóa địa chỉ
   */
  async deleteAddress(addressId: number): Promise<{ success: boolean; message?: string }> {
    if (supabase) {
      try {
        await supabase.from('customer_addresses').delete().eq('id', addressId);
        await supabase.from('address').delete().eq('id', addressId);
      } catch (err) {
        console.warn('Delete address error:', err);
      }
    }

    try {
      const localAddresses: AddressRecord[] = JSON.parse(
        localStorage.getItem('hvac_masters_addresses') || '[]'
      );
      const filtered = localAddresses.filter((a) => a.id !== addressId);
      localStorage.setItem('hvac_masters_addresses', JSON.stringify(filtered));
    } catch {
      // Ignore
    }

    return { success: true };
  },
};
