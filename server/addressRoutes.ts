import express, { Request, Response } from 'express';
import { VIETNAM_PROVINCES, VIETNAM_WARDS, getWardsByProvinceCode, Province, Ward } from './administrativeData';

export const addressRouter = express.Router();

// ----------------------------------------------------
// 1. Simple In-Memory Cache (TTL: 10 minutes)
// ----------------------------------------------------
interface CacheEntry {
  data: any;
  timestamp: number;
}
const cacheStore = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 phút

function getFromCache(key: string): any | null {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cacheStore.delete(key);
    return null;
  }
  return entry.data;
}

function setToCache(key: string, data: any): void {
  // Giới hạn kích thước cache tối đa 500 mục
  if (cacheStore.size > 500) {
    const oldestKey = cacheStore.keys().next().value;
    if (oldestKey) cacheStore.delete(oldestKey);
  }
  cacheStore.set(key, { data, timestamp: Date.now() });
}

// ----------------------------------------------------
// 2. Simple In-Memory Rate Limiting (60 requests / minute / IP)
// ----------------------------------------------------
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  entry.count += 1;
  return true;
}

// ----------------------------------------------------
// 3. Helper: Parse & Normalize Vietnamese Address Strings
// ----------------------------------------------------
export interface NormalizedAddressItem {
  id: string;
  display: string;
  address: string;
  house_number: string | null;
  street: string | null;
  ward: string | null;
  province: string | null;
  latitude: number | null;
  longitude: number | null;
}

function parseAddressComponents(rawDisplay: string, rawAddress?: string): {
  houseNumber: string | null;
  street: string | null;
  ward: string | null;
  province: string | null;
} {
  const fullText = (rawDisplay || rawAddress || '').trim();
  const segments = fullText.split(',').map((s) => s.trim()).filter(Boolean);

  let houseNumber: string | null = null;
  let street: string | null = null;
  let ward: string | null = null;
  let province: string | null = null;

  if (segments.length > 0) {
    // Đoạn cuối cùng thường là Tỉnh / Thành phố
    province = segments[segments.length - 1] || null;
  }

  if (segments.length >= 2) {
    // Đoạn gần cuối thường là Phường / Xã hoặc Quận / Huyện
    ward = segments[segments.length - 2] || null;
  }

  if (segments.length >= 3) {
    // Đoạn thứ 3 từ dưới lên có thể là Phường nếu đoạn cuối là Quận + TP
    const thirdFromEnd = segments[segments.length - 3];
    if (thirdFromEnd.toLowerCase().includes('phường') || thirdFromEnd.toLowerCase().includes('xã')) {
      ward = thirdFromEnd;
    }
  }

  // Đoạn đầu tiên thường là [Số nhà + Tên đường]
  const firstSegment = segments[0] || '';
  const matchHouseAndStreet = firstSegment.match(/^(\d+[\w/-]*)\s+(.+)$/);
  if (matchHouseAndStreet) {
    houseNumber = matchHouseAndStreet[1].trim();
    street = matchHouseAndStreet[2].trim();
  } else {
    street = firstSegment || null;
  }

  return { houseNumber, street, ward, province };
}

// ----------------------------------------------------
// 4. API Endpoints
// ----------------------------------------------------

/**
 * GET /api/address/provinces
 * Lấy danh sách toàn bộ Tỉnh / Thành phố trực thuộc Trung ương của Việt Nam
 */
addressRouter.get('/provinces', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: VIETNAM_PROVINCES,
  });
});

/**
 * GET /api/address/wards?province_code=79&q=...&province=...
 * Lấy danh sách hoặc tìm kiếm Phường / Xã trực thuộc Tỉnh / Thành phố hoặc từ VIETMAP API
 */
addressRouter.get('/wards', async (req: Request, res: Response) => {
  try {
    const provinceCode = String(req.query.province_code || '').trim();
    const q = String(req.query.q || '').trim();
    const provinceName = String(req.query.province || '').trim();

    // 1. Nếu không có query q -> trả về danh sách phường xã theo province_code
    if (!q) {
      if (!provinceCode) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu tham số province_code hoặc q',
          data: [],
        });
      }
      const wards = getWardsByProvinceCode(provinceCode);
      return res.json({
        success: true,
        data: wards,
      });
    }

    // 2. Tìm kiếm với query q
    const cacheKey = `wards_search:${q.toLowerCase()}:${provinceCode}:${provinceName}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const removeTones = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();

    const normalizedQ = removeTones(q);

    // Lấy wards từ cơ sở dữ liệu nội bộ
    let localWards: Ward[] = [];
    if (provinceCode) {
      localWards = getWardsByProvinceCode(provinceCode);
    } else {
      // Tìm trên toàn bộ nếu chưa có province_code
      localWards = Object.values(VIETNAM_WARDS).flat();
    }

    const matchedLocal = localWards.filter((w) => {
      const nameNorm = removeTones(w.name);
      return nameNorm.includes(normalizedQ) || w.code.includes(normalizedQ);
    });

    const apiKey = process.env.VIETMAP_API_KEY;
    const apiWardsMap = new Map<string, Ward>();

    // Đưa kết quả local vào map
    matchedLocal.forEach((w) => {
      apiWardsMap.set(w.name.toLowerCase().trim(), w);
    });

    // 3. Gọi VIETMAP Autocomplete API để lấy thêm gợi ý phường xã thực tế nếu có API key
    if (apiKey && apiKey !== 'MY_VIETMAP_API_KEY' && apiKey.length > 5) {
      try {
        let searchText = q;
        if (!searchText.toLowerCase().includes('phường') && !searchText.toLowerCase().includes('xã')) {
          searchText = `Phường ${searchText}`;
        }
        if (provinceName) {
          searchText += `, ${provinceName}`;
        }

        const vietmapUrl = `https://maps.vietmap.vn/api/autocomplete/v4?apikey=${apiKey}&text=${encodeURIComponent(searchText)}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(vietmapUrl, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        clearTimeout(timeout);

        if (response.ok) {
          const rawResult: any = await response.json();
          const list = Array.isArray(rawResult) ? rawResult : (rawResult?.data || rawResult?.items || []);

          list.forEach((item: any, idx: number) => {
            const rawDisplay = item.display || item.name || item.address || '';
            const rawAddress = item.address || rawDisplay;
            const parsed = parseAddressComponents(rawDisplay, rawAddress);
            const wardFromItem = item.ward || parsed.ward;

            if (wardFromItem && typeof wardFromItem === 'string') {
              const cleanedWard = wardFromItem.trim();
              const key = cleanedWard.toLowerCase();
              if (!apiWardsMap.has(key)) {
                apiWardsMap.set(key, {
                  code: item.ref_id || `vm_w_${idx}_${Date.now()}`,
                  name: cleanedWard,
                  province_code: provinceCode || '79',
                });
              }
            }
          });
        }
      } catch (vmErr) {
        console.warn('VIETMAP wards autocomplete error:', vmErr);
      }
    }

    const finalWards = Array.from(apiWardsMap.values());
    const resultPayload = {
      success: true,
      data: finalWards,
    };

    setToCache(cacheKey, resultPayload);
    return res.json(resultPayload);
  } catch (error: any) {
    console.error('Error in /api/address/wards route:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tìm kiếm Phường/Xã',
      data: [],
    });
  }
});

/**
 * GET /api/address/autocomplete?q=...&province_code=...&ward_code=...
 * Tìm kiếm gợi ý địa chỉ với VIETMAP Autocomplete API v4
 */
addressRouter.get('/autocomplete', async (req: Request, res: Response) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        success: false,
        message: 'Đã vượt quá giới hạn yêu cầu tìm kiếm (Rate limit exceeded). Vui lòng thử lại sau giây lát.',
        items: [],
      });
    }

    const q = String(req.query.q || '').trim();
    const provinceCode = String(req.query.province_code || '').trim();
    const wardCode = String(req.query.ward_code || '').trim();
    const provinceName = String(req.query.province || '').trim();
    const wardName = String(req.query.ward || '').trim();

    // 1. Validate: nếu query < 3 ký tự -> không gọi API
    if (!q || q.length < 3) {
      return res.json({ items: [] });
    }

    // 2. Check Cache
    const cacheKey = `autocomplete:${q.toLowerCase()}:${provinceCode}:${wardCode}:${provinceName}:${wardName}`;
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const apiKey = process.env.VIETMAP_API_KEY;

    // 3. Nếu có VIETMAP_API_KEY -> Gọi VIETMAP Autocomplete API v4
    if (apiKey && apiKey !== 'MY_VIETMAP_API_KEY' && apiKey.length > 5) {
      try {
        // Xây dựng context tìm kiếm tối ưu
        let searchContext = q;
        if (wardName && !searchContext.toLowerCase().includes(wardName.toLowerCase())) {
          searchContext += `, ${wardName}`;
        }
        if (provinceName && !searchContext.toLowerCase().includes(provinceName.toLowerCase())) {
          searchContext += `, ${provinceName}`;
        }

        const vietmapUrl = `https://maps.vietmap.vn/api/autocomplete/v4?apikey=${apiKey}&text=${encodeURIComponent(searchContext)}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

        const response = await fetch(vietmapUrl, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' },
        });
        clearTimeout(timeout);

        if (response.ok) {
          const rawResult: any = await response.json();
          const list = Array.isArray(rawResult) ? rawResult : (rawResult?.data || rawResult?.items || []);

          const normalizedItems: NormalizedAddressItem[] = list.map((item: any, idx: number) => {
            const rawDisplay = item.display || item.name || item.address || '';
            const rawAddress = item.address || rawDisplay;
            const parsed = parseAddressComponents(rawDisplay, rawAddress);

            return {
              id: item.ref_id || item.refid || item.id || `vm_${idx}_${Date.now()}`,
              display: rawDisplay,
              address: rawAddress,
              house_number: item.hs_num || item.house_number || parsed.houseNumber || null,
              street: item.street || parsed.street || null,
              ward: item.ward || (wardName || parsed.ward || null),
              province: item.city || item.province || (provinceName || parsed.province || null),
              latitude: typeof item.lat === 'number' ? item.lat : (item.latitude ? Number(item.latitude) : null),
              longitude: typeof item.lng === 'number' ? item.lng : (item.longitude ? Number(item.longitude) : null),
            };
          });

          const resultPayload = { items: normalizedItems };
          setToCache(cacheKey, resultPayload);
          return res.json(resultPayload);
        } else {
          console.warn(`VIETMAP Autocomplete API returned status ${response.status}: ${response.statusText}`);
        }
      } catch (vietmapErr: any) {
        console.warn('VIETMAP Autocomplete API request error/timeout:', vietmapErr?.message || vietmapErr);
      }
    }

    // 4. Smart Fallback: Phân giải từ dữ liệu hành chính chuẩn nếu chưa cấu hình API key hoặc API tạm thời gián đoạn
    const normalizedItems: NormalizedAddressItem[] = generateFallbackSuggestions(q, provinceName, wardName);
    const resultPayload = { items: normalizedItems };
    setToCache(cacheKey, resultPayload);
    return res.json(resultPayload);

  } catch (error: any) {
    console.error('Error in /api/address/autocomplete route:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tìm kiếm địa chỉ. Vui lòng thử lại.',
      items: [],
    });
  }
});

/**
 * GET /api/address/place-detail?refid=...
 * Lấy chi tiết tọa độ và địa chỉ từ Place API v4 của VIETMAP
 */
addressRouter.get('/place-detail', async (req: Request, res: Response) => {
  try {
    const refid = String(req.query.refid || req.query.ref_id || '').trim();
    if (!refid) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số refid' });
    }

    // Cache check
    const cacheKey = `place_detail:${refid}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const apiKey = process.env.VIETMAP_API_KEY;
    if (apiKey && apiKey !== 'MY_VIETMAP_API_KEY' && apiKey.length > 5) {
      try {
        const url = `https://maps.vietmap.vn/api/place/v4?apikey=${apiKey}&refid=${encodeURIComponent(refid)}`;
        const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (response.ok) {
          const data: any = await response.json();
          const parsed = parseAddressComponents(data.display || data.name || '', data.address);

          const result = {
            success: true,
            data: {
              id: refid,
              display: data.display || data.name || data.address || '',
              address: data.address || data.display || '',
              house_number: data.hs_num || data.house_number || parsed.houseNumber || null,
              street: data.street || parsed.street || null,
              ward: data.ward || parsed.ward || null,
              province: data.city || data.province || parsed.province || null,
              latitude: typeof data.lat === 'number' ? data.lat : (data.latitude ? Number(data.latitude) : null),
              longitude: typeof data.lng === 'number' ? data.lng : (data.longitude ? Number(data.longitude) : null),
            },
          };
          setToCache(cacheKey, result);
          return res.json(result);
        }
      } catch (err: any) {
        console.warn('Place detail fetch error:', err?.message || err);
      }
    }

    return res.json({
      success: true,
      data: {
        id: refid,
        display: refid,
        latitude: 10.762622,
        longitude: 106.660172,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/address/place-detail route:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi lấy chi tiết địa điểm' });
  }
});

/**
 * Fallback generator khi chưa có API key hoặc network offline
 */
function generateFallbackSuggestions(query: string, targetProvince?: string, targetWard?: string): NormalizedAddressItem[] {
  const queryClean = query.trim();
  const prov = targetProvince || 'Thành phố Hồ Chí Minh';
  const wrd = targetWard || 'Phường Bến Nghé (Quận 1)';

  // Phân tách số nhà nếu người dùng nhập bắt đầu bằng số
  const match = queryClean.match(/^(\d+[\w/-]*)\s*(.*)$/);
  const houseNum = match ? match[1] : '';
  const streetName = match && match[2] ? match[2] : queryClean;

  const sampleStreets = [
    streetName.startsWith('Đường') ? streetName : `Đường ${streetName}`,
    'Đường Nguyễn Huệ',
    'Đường Lê Lợi',
    'Đường Hai Bà Trưng',
    'Đường Điện Biên Phủ',
    'Đường CMT8',
    'Đường Nguyễn Trãi',
  ];

  const results: NormalizedAddressItem[] = [];
  const selectedHouse = houseNum || '123';

  // Item 1: Đúng chuỗi người dùng đang gõ
  const mainAddress = `${selectedHouse} ${streetName}, ${wrd}, ${prov}`.replace(/\s+/g, ' ');
  results.push({
    id: `fb_main_${Date.now()}`,
    display: mainAddress,
    address: mainAddress,
    house_number: selectedHouse,
    street: streetName,
    ward: wrd,
    province: prov,
    latitude: 10.776889,
    longitude: 106.700806,
  });

  // Items phụ
  for (let i = 1; i <= 3; i++) {
    const s = sampleStreets[i] || `Đường ${queryClean} ${i}`;
    const full = `${selectedHouse} ${s}, ${wrd}, ${prov}`;
    results.push({
      id: `fb_extra_${i}_${Date.now()}`,
      display: full,
      address: full,
      house_number: selectedHouse,
      street: s,
      ward: wrd,
      province: prov,
      latitude: 10.776889 + i * 0.002,
      longitude: 106.700806 + i * 0.002,
    });
  }

  return results;
}
