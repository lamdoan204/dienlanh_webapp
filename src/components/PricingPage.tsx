import React, { useState, useEffect, useMemo } from 'react';
import { ActiveTab, DeviceType, ServicePackageType, AdminService } from '../types';
import { SERVICE_TYPES, getServiceTypeInfo } from '../constants/serviceTypes';

interface PricingPageProps {
  setActiveTab: (tab: ActiveTab) => void;
  onSelectBookingPreset?: (preset: AdminService | { device: DeviceType; service: ServicePackageType }) => void;
}

const getDeviceIcon = (deviceStr: string) => {
  const d = (deviceStr || '').toLowerCase();
  if (d.includes('lạnh') || d.includes('điều hòa')) return 'ac_unit';
  if (d.includes('tủ')) return 'kitchen';
  if (d.includes('giặt')) return 'local_laundry_service';
  if (d.includes('sóng') || d.includes('vi sóng')) return 'microwave';
  if (d.includes('nước nóng')) return 'water_heater';
  return 'devices_other';
};

export const PricingPage: React.FC<PricingPageProps> = ({ setActiveTab, onSelectBookingPreset }) => {
  const [services, setServices] = useState<AdminService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [detailService, setDetailService] = useState<AdminService | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    import('../services/adminService').then(({ adminService }) => {
      adminService.fetchAdminServices().then(data => {
        if (isMounted) {
          setServices(data || []);
          setIsLoading(false);
        }
      }).catch(err => {
        console.error('Failed to load services in PricingPage:', err);
        if (isMounted) setIsLoading(false);
      });
    });
    return () => { isMounted = false; };
  }, []);

  // Count available items per service type
  const typeCounts = useMemo(() => {
    const counts: { [key: string]: number } = { all: services.length };
    SERVICE_TYPES.forEach(st => {
      counts[st.code] = 0;
    });
    services.forEach(srv => {
      const info = getServiceTypeInfo(srv.category);
      counts[info.code] = (counts[info.code] || 0) + 1;
    });
    return counts;
  }, [services]);

  // Only show service types that exist in the database
  const availableServiceTypes = useMemo(() => {
    return SERVICE_TYPES.filter(st => (typeCounts[st.code] || 0) > 0);
  }, [typeCounts]);

  // Dynamically extract unique device types present in the database services
  const availableDevices = useMemo(() => {
    const map = new Map<string, { code: string; label: string; icon: string }>();
    map.set('all', { code: 'all', label: 'Tất cả thiết bị', icon: 'devices' });

    services.forEach(srv => {
      const raw = (srv.deviceType || '').trim();
      if (!raw) return;
      const key = raw.toLowerCase();
      if (!map.has(key)) {
        const icon = getDeviceIcon(key);
        const formattedLabel = raw.charAt(0).toUpperCase() + raw.slice(1);
        map.set(key, { code: key, label: formattedLabel, icon });
      }
    });

    return Array.from(map.values());
  }, [services]);

  // Filtered services (flat array)
  const filteredServices = useMemo(() => {
    return services.filter(srv => {
      const searchLower = searchTerm.toLowerCase().trim();
      const matchSearch = !searchLower ||
        srv.name.toLowerCase().includes(searchLower) ||
        (srv.note && srv.note.toLowerCase().includes(searchLower)) ||
        srv.deviceType.toLowerCase().includes(searchLower);

      const srvTypeInfo = getServiceTypeInfo(srv.category);
      const matchType = selectedType === 'all' || srvTypeInfo.code === selectedType.toLowerCase() || (srv.category || '').toLowerCase().trim() === selectedType.toLowerCase();

      const srvDeviceLower = (srv.deviceType || '').toLowerCase().trim();
      const matchDevice = selectedDevice === 'all' || srvDeviceLower.includes(selectedDevice.toLowerCase());

      return matchSearch && matchType && matchDevice;
    });
  }, [services, searchTerm, selectedType, selectedDevice]);

  const handleBookService = (srv: AdminService) => {
    if (onSelectBookingPreset) {
      onSelectBookingPreset(srv);
    }
    setActiveTab('booking');
  };

  return (
    <div className="pt-36 sm:pt-38 lg:pt-36 pb-16 bg-[#f8f9ff] min-h-screen">
      {/* Ultra Compact Header Banner */}
      <section className="relative py-3 lg:py-4 bg-white border-b border-[#c1c7d3]/30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e9edff] text-[#005396] flex items-center justify-center font-bold text-base shadow-xs">
              ✨
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#005396] tracking-tight">
                Bảng Giá Dịch Vụ Kỹ Thuật
              </h1>
              <p className="text-xs text-[#717783] font-medium hidden sm:block">
                Tra cứu báo giá chi tiết sửa chữa, vệ sinh, bảo trì, thi công &amp; thu mua điện lạnh.
              </p>
            </div>
          </div>
          <span className="py-1 px-3 bg-[#e9edff] text-[#005396] rounded-full font-bold text-xs shadow-xs">
            Cam kết minh bạch 100% • Báo giá trước khi làm
          </span>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-4 sm:py-5 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-3.5">
        {/* 1. Search Bar & Result Summary (Directly Below Banner) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-xl border border-gray-100 shadow-xs">
          <div className="relative w-full sm:w-96">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717783] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên dịch vụ, thiết bị, ghi chú..."
              className="w-full pl-10 pr-9 py-2 bg-[#f8f9ff] border border-gray-200 rounded-xl text-xs sm:text-sm text-[#141b2b] placeholder-[#717783] outline-none focus:border-[#005396] focus:bg-white transition-all font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717783] hover:text-[#005396] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#414751] self-end sm:self-center">
            <span>Hiển thị <strong className="text-[#005396] text-sm">{filteredServices.length}</strong> dịch vụ</span>
            {(selectedType !== 'all' || selectedDevice !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedDevice('all');
                }}
                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-bold cursor-pointer transition-all ml-1"
              >
                Đặt lại lọc
              </button>
            )}
          </div>
        </div>

        {/* 2. Side-by-Side Filters Row (Service Types & Device Types on Same Row) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Service Type Filter */}
          <div className="lg:col-span-7 bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-[#005396] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">handyman</span>
                Loại Dịch Vụ
              </span>
              <span className="text-[11px] font-bold text-[#717783]">
                {selectedType === 'all' ? 'Tất cả dịch vụ' : getServiceTypeInfo(selectedType).label}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedType === 'all'
                    ? 'bg-[#005396] text-white border-[#005396] shadow-xs'
                    : 'bg-[#f8f9ff] text-[#414751] border-gray-200 hover:bg-white hover:border-[#005396]/40'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">apps</span>
                <span>Tất Cả</span>
              </button>

              {availableServiceTypes.map(st => {
                const isActive = selectedType === st.code;
                return (
                  <button
                    key={st.code}
                    onClick={() => setSelectedType(st.code)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#005396] text-white border-[#005396] shadow-xs'
                        : 'bg-[#f8f9ff] text-[#414751] border-gray-200 hover:bg-white hover:border-[#005396]/40'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[16px] ${isActive ? 'text-white' : st.colorClass}`}>
                      {st.icon}
                    </span>
                    <span>{st.label.replace('Dịch vụ ', '')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Device Type Filter */}
          <div className="lg:col-span-5 bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-[#005396] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">devices</span>
                Loại Thiết Bị
              </span>
              {selectedDevice !== 'all' && (
                <button
                  onClick={() => setSelectedDevice('all')}
                  className="text-[11px] text-[#005396] hover:underline font-bold cursor-pointer"
                >
                  Xóa lọc
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {availableDevices.map(dev => {
                const isActive = selectedDevice === dev.code || (dev.code !== 'all' && selectedDevice.toLowerCase().includes(dev.code.toLowerCase()));
                return (
                  <button
                    key={dev.code}
                    onClick={() => setSelectedDevice(dev.code)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#005396] text-white border-[#005396] shadow-xs'
                        : 'bg-[#f8f9ff] text-[#414751] border-gray-200 hover:bg-white hover:border-[#005396]/40'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{dev.icon}</span>
                    <span>{dev.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Main Priority Services Display Cards */}
        {isLoading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-[#005396] border-t-transparent mb-2"></div>
            <p className="text-[#005396] font-bold text-sm">Đang tải danh sách dịch vụ...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-xs px-4">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">search_off</span>
            <h3 className="text-base font-bold text-[#141b2b] mb-1">Không có dịch vụ phù hợp</h3>
            <p className="text-xs text-[#717783] mb-3">Vui lòng thử tìm kiếm với từ khóa khác hoặc bỏ chọn bộ lọc.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedDevice('all');
              }}
              className="px-4 py-2 bg-[#005396] text-white rounded-xl text-xs font-bold hover:brightness-95 cursor-pointer"
            >
              Xem tất cả dịch vụ
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredServices.map((srv) => {
              const typeInfo = getServiceTypeInfo(srv.category);
              const deviceIcon = getDeviceIcon(srv.deviceType);
              const isFreeOrContact = srv.price === 0;

              return (
                <div
                  key={srv.id}
                  onClick={() => setDetailService(srv)}
                  className="p-4 sm:p-5 rounded-2xl border border-gray-100 bg-white hover:border-[#005396]/40 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer relative"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${typeInfo.badgeBg}`}>
                        <span className="material-symbols-outlined text-[15px]">{typeInfo.icon}</span>
                        <span>{typeInfo.label}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-[#414751] rounded-lg text-[11px] font-bold capitalize border border-gray-200">
                        <span className="material-symbols-outlined text-[15px] text-[#005396]">{deviceIcon}</span>
                        <span>{srv.deviceType || 'Thiết bị'}</span>
                      </span>
                    </div>

                    {/* Service Name */}
                    <h3 className="font-extrabold text-[#141b2b] text-base mb-1.5 group-hover:text-[#005396] transition-colors leading-snug">
                      {srv.name}
                    </h3>

                    {/* Service Note Preview & View Detail Trigger */}
                    {srv.note ? (
                      <p className="text-xs text-[#717783] mb-2 line-clamp-2 leading-relaxed whitespace-pre-line">
                        {srv.note}
                      </p>
                    ) : null}

                    <div className="text-[11px] font-bold text-[#005396] group-hover:underline flex items-center gap-1 mb-3">
                      <span>Xem chi tiết nội dung</span>
                      <span className="material-symbols-outlined text-[14px]">info</span>
                    </div>
                  </div>

                  {/* Bottom Footer Price & Action */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-1">
                    <div>
                      <span className="text-[10px] text-[#717783] uppercase font-bold block">Giá từ:</span>
                      <span className="text-base sm:text-lg font-black text-[#914c00]">
                        {isFreeOrContact ? 'Báo giá sau kiểm tra' : `${srv.price.toLocaleString('vi-VN')} đ`}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookService(srv);
                      }}
                      className="px-3.5 py-2 bg-[#005396] hover:bg-[#0f6cbd] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs group-hover:shadow-md"
                    >
                      <span>Đặt dịch vụ</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Price Guarantee Banner */}
      <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-amber-50/80 border border-amber-200 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-xs">
          <div className="flex-shrink-0 w-11 h-11 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl fill-1">verified</span>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-[#005396] mb-0.5">Cam kết minh bạch và báo giá trước khi thực hiện</h4>
            <p className="text-xs text-[#414751] leading-relaxed">
              Giá niêm yết áp dụng minh bạch cho mọi thiết bị. Kỹ thuật viên <strong>Điện lạnh Công Thương</strong> sẽ lập phiếu kiểm tra và báo giá trực tiếp với khách hàng trước khi thi công.
            </p>
          </div>
        </div>
      </section>

      {/* Service Detail Modal Pop-up */}
      {detailService && (() => {
        const typeInfo = getServiceTypeInfo(detailService.category);
        const deviceIcon = getDeviceIcon(detailService.deviceType);
        const isFreeOrContact = detailService.price === 0;

        return (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-2xs"
            onClick={() => setDetailService(null)}
          >
            <div
              className="bg-white rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${typeInfo.badgeBg}`}>
                      <span className="material-symbols-outlined text-[14px]">{typeInfo.icon}</span>
                      <span>{typeInfo.label}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 text-[#414751] rounded-lg text-[11px] font-bold capitalize border border-gray-200">
                      <span className="material-symbols-outlined text-[14px] text-[#005396]">{deviceIcon}</span>
                      <span>{detailService.deviceType || 'Thiết bị'}</span>
                    </span>
                  </div>
                  <h3 className="font-black text-[#141b2b] text-lg sm:text-xl leading-snug pt-1">
                    {detailService.name}
                  </h3>
                </div>

                <button
                  onClick={() => setDetailService(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Price Banner Box */}
              <div className="bg-[#f8f9ff] p-3.5 rounded-xl border border-[#005396]/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#717783] uppercase font-bold block">Đơn giá niêm yết:</span>
                  <span className="text-xl font-black text-[#914c00]">
                    {isFreeOrContact ? 'Báo giá sau kiểm tra' : `${detailService.price.toLocaleString('vi-VN')} VNĐ`}
                  </span>
                </div>
                <span className="text-[11px] bg-[#e9edff] text-[#005396] font-bold px-3 py-1 rounded-full">
                  Minh bạch 100%
                </span>
              </div>

              {/* Detailed Content / Note Paragraphs */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#005396] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  <span>Nội dung chi tiết dịch vụ</span>
                </h4>
                {detailService.note ? (
                  <div className="p-4 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-[#141b2b] leading-relaxed whitespace-pre-line font-medium space-y-2">
                    {detailService.note}
                  </div>
                ) : (
                  <p className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 italic">
                    Dịch vụ hiện chưa có thêm ghi chú bổ sung. Vui lòng liên hệ bộ phận kỹ thuật để được tư vấn chi tiết hơn.
                  </p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setDetailService(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#414751] rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = detailService;
                    setDetailService(null);
                    handleBookService(target);
                  }}
                  className="px-4 py-2 bg-[#005396] hover:bg-[#0f6cbd] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Đặt dịch vụ ngay</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

