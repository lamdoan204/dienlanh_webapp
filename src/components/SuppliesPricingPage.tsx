import React, { useState, useEffect, useMemo } from 'react';
import { ActiveTab, SupplyItem } from '../types';
import { suppliesService } from '../services/suppliesService';

interface SuppliesPricingPageProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const SuppliesPricingPage: React.FC<SuppliesPricingPageProps> = ({ setActiveTab }) => {
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'id' | 'price_asc' | 'price_desc' | 'name'>('id');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    suppliesService
      .fetchSupplies()
      .then((data) => {
        if (isMounted) {
          setSupplies(data || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error loading supplies data:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Extract unique device list from database supplies
  const deviceList = useMemo(() => {
    const set = new Set<string>();
    supplies.forEach((s) => {
      if (s.device && s.device.trim()) {
        set.add(s.device.trim());
      }
    });
    return Array.from(set);
  }, [supplies]);

  // Extract unique type list from database supplies
  const typeList = useMemo(() => {
    const set = new Set<string>();
    supplies.forEach((s) => {
      if (s.type && s.type.trim()) {
        set.add(s.type.trim());
      }
    });
    return Array.from(set);
  }, [supplies]);

  // Filter & Sort supplies
  const filteredSupplies = useMemo(() => {
    let list = supplies.filter((item) => {
      const searchLower = searchTerm.toLowerCase().trim();
      const matchSearch =
        !searchLower ||
        item.name.toLowerCase().includes(searchLower) ||
        (item.device && item.device.toLowerCase().includes(searchLower)) ||
        (item.type && item.type.toLowerCase().includes(searchLower)) ||
        (item.unit && item.unit.toLowerCase().includes(searchLower)) ||
        (item.note_detail && item.note_detail.toLowerCase().includes(searchLower));

      const matchDevice =
        selectedDevice === 'all' ||
        (item.device && item.device.toLowerCase().trim() === selectedDevice.toLowerCase().trim());

      const matchType =
        selectedType === 'all' ||
        (item.type && item.type.toLowerCase().trim() === selectedType.toLowerCase().trim());

      return matchSearch && matchDevice && matchType;
    });

    if (sortBy === 'price_asc') {
      list = [...list].sort((a, b) => (a.unit_price || 0) - (b.unit_price || 0));
    } else if (sortBy === 'price_desc') {
      list = [...list].sort((a, b) => (b.unit_price || 0) - (a.unit_price || 0));
    } else if (sortBy === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else {
      list = [...list].sort((a, b) => a.id - b.id);
    }

    return list;
  }, [supplies, searchTerm, selectedDevice, selectedType, sortBy]);

  const formatVND = (price: number | null | undefined) => {
    if (price === null || price === undefined) return 'Liên hệ báo giá';
    return price.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-36 sm:pt-38 lg:pt-36 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5">
        {/* Ultra Compact Top Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#003c6e] via-[#005396] to-[#0f6cbd] rounded-2xl p-4 sm:p-5 text-white shadow-md border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 text-[#ffd700] shadow-xs">
                <span className="material-symbols-outlined text-2xl">inventory_2</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>Bảng Giá Vật Tư &amp; Linh Kiện</span>
                  <span className="text-xs font-bold text-[#ffd700] bg-white/15 px-2 py-0.5 rounded-full hidden sm:inline-block">
                    {supplies.length} hạng mục
                  </span>
                </h1>
                <p className="text-xs text-blue-100/90 font-medium mt-0.5">
                  Đơn giá niêm yết công khai • Cam kết chính hãng 100% • Minh bạch trước khi thi công
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <span className="px-3 py-1.5 bg-white/15 text-white text-xs font-bold rounded-xl border border-white/20 backdrop-blur-xs">
                Bảo hành 3 - 12 Tháng
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên vật tư, quy cách, thiết bị, ghi chú..."
                className="w-full pl-11 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#005396] focus:bg-white transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </div>

            {/* Sort options */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 whitespace-nowrap hidden sm:inline">
                Sắp xếp:
              </span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-[#005396] cursor-pointer"
              >
                <option value="id">Mặc định (ID)</option>
                <option value="name">Tên vật tư A-Z</option>
                <option value="price_asc">Đơn giá: Thấp đến Cao</option>
                <option value="price_desc">Đơn giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-500 mr-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">filter_alt</span>
              <span>Thiết bị:</span>
            </span>

            <button
              onClick={() => setSelectedDevice('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDevice === 'all'
                  ? 'bg-[#005396] text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              Tất cả ({supplies.length})
            </button>

            {deviceList.map((dev) => {
              const count = supplies.filter(
                (s) => s.device && s.device.trim().toLowerCase() === dev.trim().toLowerCase()
              ).length;
              return (
                <button
                  key={dev}
                  onClick={() => setSelectedDevice(dev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDevice.toLowerCase() === dev.toLowerCase()
                      ? 'bg-[#005396] text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {dev} ({count})
                </button>
              );
            })}

            {/* Type filter if available */}
            {typeList.length > 0 && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">Loại:</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none focus:border-[#005396] cursor-pointer"
                >
                  <option value="all">Tất cả loại ({typeList.length})</option>
                  {typeList.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Data Table Content */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <div className="inline-block w-8 h-8 border-3 border-[#005396] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-500">Đang tải dữ liệu bảng giá vật tư...</p>
            </div>
          ) : filteredSupplies.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                <span className="material-symbols-outlined text-3xl">search_off</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-800">Không tìm thấy vật tư phù hợp</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  {supplies.length === 0
                    ? 'Hiện chưa có dữ liệu vật tư trong hệ thống.'
                    : 'Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc thiết bị.'}
                </p>
              </div>
              {(searchTerm || selectedDevice !== 'all' || selectedType !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDevice('all');
                    setSelectedType('all');
                  }}
                  className="px-4 py-2 bg-[#005396] text-white rounded-xl text-xs font-bold hover:bg-[#003c6e] transition-colors cursor-pointer"
                >
                  Đặt lại bộ lọc
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#003c6e] text-white text-xs font-extrabold uppercase tracking-wider">
                      <th className="py-3.5 px-4 w-12 text-center">STT</th>
                      <th className="py-3.5 px-4">Tên vật tư &amp; Quy cách</th>
                      <th className="py-3.5 px-4 w-36">Thiết bị áp dụng</th>
                      <th className="py-3.5 px-4 w-28 text-center">Đơn vị</th>
                      <th className="py-3.5 px-4 w-40 text-right">Đơn giá (VNĐ)</th>
                      <th className="py-3.5 px-4">Ghi chú chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredSupplies.map((item, idx) => (
                      <tr
                        key={item.id}
                        className="hover:bg-blue-50/50 transition-colors group"
                      >
                        <td className="py-3.5 px-4 text-center font-bold text-gray-400 group-hover:text-[#005396]">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900 text-sm group-hover:text-[#005396] transition-colors">
                            {item.name}
                          </div>
                          {item.type && (
                            <div className="inline-block mt-0.5 text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                              Loại/Quy cách: {item.type}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {item.device ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-800 bg-blue-100/80 px-2.5 py-1 rounded-lg border border-blue-200/60">
                              <span className="material-symbols-outlined text-sm">build</span>
                              <span>{item.device}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Dùng chung</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md text-xs">
                            {item.unit || 'Bộ'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-extrabold text-[#ba1a1a] text-sm sm:text-base">
                            {formatVND(item.unit_price)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 text-xs italic">
                          {item.note_detail ? (
                            <span>{item.note_detail}</span>
                          ) : (
                            <span className="text-gray-400 not-italic">Theo tiêu chuẩn kỹ thuật</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden divide-y divide-gray-200">
                {filteredSupplies.map((item, idx) => (
                  <div key={item.id} className="p-4 space-y-2 bg-white">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                          <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                        </div>
                        {item.type && (
                          <div className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded inline-block font-medium">
                            {item.type}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-[#ba1a1a] text-base">
                          {formatVND(item.unit_price)}
                        </div>
                        <div className="text-[11px] font-bold text-gray-500">
                          ĐVT: {item.unit || 'Bộ'}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                      {item.device && (
                        <span className="inline-flex items-center gap-1 font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          <span className="material-symbols-outlined text-xs">build</span>
                          <span>{item.device}</span>
                        </span>
                      )}
                      {item.note_detail && (
                        <p className="text-xs text-gray-500 italic w-full bg-gray-50 p-2 rounded border border-gray-100 mt-1">
                          📝 {item.note_detail}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
