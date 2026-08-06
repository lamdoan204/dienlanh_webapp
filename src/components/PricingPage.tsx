import React from 'react';
import { ActiveTab, DeviceType, ServicePackageType } from '../types';
import { PRICING_CATEGORIES } from '../data/mockData';

interface PricingPageProps {
  setActiveTab: (tab: ActiveTab) => void;
  onSelectBookingPreset?: (device: DeviceType, service: ServicePackageType) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ setActiveTab, onSelectBookingPreset }) => {
  const handleBookCategory = (index: number) => {
    let dev: DeviceType = 'air_conditioner';
    if (index === 1) dev = 'refrigerator';
    if (index === 2) dev = 'washing_machine';

    if (onSelectBookingPreset) {
      onSelectBookingPreset(dev, 'repair');
    }
    setActiveTab('booking');
  };

  return (
    <div className="pt-24 lg:pt-28 pb-16">
      {/* Header Banner */}
      <section className="relative py-10 lg:py-14 bg-white border-b border-[#c1c7d3]/30 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <span className="inline-block py-1 px-3 bg.005396]/10 text-[#005396] bg-[#e9edff] rounded-full font-semibold text-xs mb-3">
            Cam kết minh bạch 100%
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#005396] mb-4">
            Bảng Giá Dịch Vụ Minh Bạch
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-[#414751] max-w-2xl mx-auto leading-relaxed">
            Chúng tôi cung cấp các gói dịch vụ HVAC chuyên nghiệp với chi phí được chuẩn hóa. Không phụ phí ẩn, bảo hành chất lượng dài hạn cho mọi công trình tại nhà và doanh nghiệp.
          </p>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRICING_CATEGORIES.map((cat, idx) => (
            <div
              key={idx}
              className={`glass-card p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-300 ${
                cat.borderSecondary ? 'border-t-4 border-[#ff8a00] bg-white/90' : 'bg-white/80'
              }`}
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    cat.borderSecondary ? 'bg-[#ff8a00]/15 text-[#914c00]' : 'bg-[#005396]/10 text-[#005396]'
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                </div>

                <h3 className="text-xl font-bold text-[#005396] mb-1">{cat.category}</h3>
                <p className="text-xs text-[#414751] mb-4">{cat.subtitle}</p>

                <div className="mb-6">
                  <span className="text-[11px] text-[#717783] uppercase font-bold tracking-wider block">
                    Bắt đầu từ
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-[#914c00]">{cat.startingPrice}</div>
                </div>

                {/* Price Itemized List */}
                <ul className="mb-8 space-y-3 divide-y divide-[#c1c7d3]/30">
                  {cat.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="pt-3 flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-[#141b2b]">{item.name}</span>
                      <span className="font-bold text-[#141b2b]">{item.price}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleBookCategory(idx)}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all h-[52px] flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                  cat.borderSecondary
                    ? 'bg-[#914c00] hover:bg-[#ff8a00] text-white'
                    : 'bg-[#005396] hover:bg-[#0f6cbd] text-white'
                }`}
              >
                <span>Đặt lịch ngay</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Price Transparency Banner */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-[#ffdcc4]/30 border border-[#ff8a00]/30 p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
          <div className="flex-shrink-0 w-16 h-16 bg-[#ff8a00]/15 rounded-full flex items-center justify-center text-[#914c00]">
            <span className="material-symbols-outlined text-3xl fill-1">verified</span>
          </div>
          <div>
            <h4 className="text-xl font-bold text-[#005396] mb-2">Cam kết báo giá chính xác</h4>
            <p className="text-xs sm:text-sm text-[#414751] leading-relaxed">
              Bảng giá trên mang tính chất tham khảo cho các hạng mục phổ thông. Kỹ thuật viên của{' '}
              <strong>HVAC Masters</strong> sẽ cung cấp báo giá cuối cùng{' '}
              <strong className="text-[#005396]">ngay sau khi kiểm tra hiện trạng thực tế</strong>. Chúng tôi chỉ thực hiện khi khách hàng đồng ý với báo giá.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
