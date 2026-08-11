import React, { useState } from 'react';
import { ActiveTab, DeviceType, ServicePackageType, AdminService } from '../types';
import { HERO_IMAGE_URL } from '../data/mockData';

interface HomePageProps {
  setActiveTab: (tab: ActiveTab) => void;
  onSelectBookingPreset?: (preset: AdminService | { device: DeviceType; service: ServicePackageType }) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setActiveTab, onSelectBookingPreset }) => {
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);

  const symptoms = [
    { text: 'Máy lạnh chảy nước / không mát', device: 'air_conditioner' as DeviceType, service: 'repair' as ServicePackageType, advice: 'Nhiều khả năng do lưới lọc bẩn hoặc đường ống thoát nước bị nghẹt. Nên đăng ký dịch vụ vệ sinh hoặc kiểm tra hệ thống.' },
    { text: 'Tủ lạnh bị chảy nước / đóng tuyết', device: 'refrigerator' as DeviceType, service: 'repair' as ServicePackageType, advice: 'Cần kiểm tra bộ xả đá hoặc roăng cao su cửa tủ lạnh để tiết kiệm điện và giữ lạnh sâu.' },
    { text: 'Máy giặt vắt kêu to / rung lắc', device: 'washing_machine' as DeviceType, service: 'maintenance' as ServicePackageType, advice: 'Cần kiểm tra cân bằng chân đế, tụ motor hoặc thụt giảm xóc lò xo.' },
    { text: 'Cần bảo dưỡng vệ sinh máy lạnh', device: 'air_conditioner' as DeviceType, service: 'cleaning' as ServicePackageType, advice: 'Gói vệ sinh sâu xịt rửa dàn lạnh, dàn nóng giúp tiết kiệm 25% điện năng.' },
  ];

  const handleServiceClick = (device: DeviceType, service: ServicePackageType) => {
    if (onSelectBookingPreset) {
      onSelectBookingPreset({ device, service });
    }
    setActiveTab('booking');
  };

  return (
    <div className="pt-24 lg:pt-28 pb-16">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#ffffff] py-8 lg:py-12 border-b border-[#c1c7d3]/20">
        {/* Abstract BG Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#d3e3ff] opacity-25 rounded-bl-[100px] -z-10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-[#ffdcc4] opacity-25 rounded-full -z-10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center text-center lg:text-left">
          <div className="space-y-6 flex flex-col items-center lg:items-start">
            {/* 24/7 Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e9edff] rounded-full text-[#005396] font-medium text-xs sm:text-sm">
              <span className="w-2 h-2 rounded-full bg-[#ff8a00] animate-pulse" />
              Dịch vụ khẩn cấp 24/7 luôn sẵn sàng
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141b2b] leading-tight">
              Giải pháp điều hòa không khí chuyên nghiệp cho ngôi nhà của bạn
            </h1>

            {/* Body */}
            <p className="text-base sm:text-lg text-[#414751] max-w-lg leading-relaxed">
              Trải nghiệm sự tin cậy trong từng hơi thở. Chúng tôi cung cấp các dịch vụ sửa chữa, bảo trì hệ thống sưởi và làm mát tin cậy, minh bạch và chuyên nghiệp để giữ cho môi trường sống của bạn luôn hoàn hảo.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full lg:w-auto">
              <button
                onClick={() => setActiveTab('booking')}
                className="bg-[#005396] text-white font-semibold text-base px-8 py-4 rounded-xl hover:bg-[#0f6cbd] active:scale-98 transition-all shadow-md text-center w-full sm:w-auto min-h-[48px] whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">calendar_month</span>
                <span>Lên lịch dịch vụ</span>
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className="border-2 border-[#005396] text-[#005396] font-semibold text-base px-8 py-4 rounded-xl hover:bg-[#005396]/5 active:scale-98 transition-all text-center w-full sm:w-auto min-h-[48px] whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">receipt_long</span>
                <span>Xem gói bảo trì</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#c1c7d3]/30 mt-6 w-full">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-[#005396]">15+</div>
                <div className="text-xs sm:text-sm text-[#414751]">Năm kinh nghiệm</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-[#005396]">10k+</div>
                <div className="text-xs sm:text-sm text-[#414751]">Dự án hoàn thành</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-[#005396]">4.9★</div>
                <div className="text-xs sm:text-sm text-[#414751]">Đánh giá trung bình</div>
              </div>
            </div>
          </div>

          {/* Hero Image & Floating Glass Badge */}
          <div className="relative h-72 sm:h-96 lg:h-[480px] rounded-2xl overflow-hidden shadow-2xl w-full border border-white/50">
            <img
              className="w-full h-full object-cover"
              alt="Kỹ thuật viên HVAC chuyên nghiệp kiểm tra dàn nóng điều hòa"
              src={HERO_IMAGE_URL}
            />
            {/* Floating Glass Badge */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 glass-card p-4 rounded-xl flex items-center gap-4 max-w-[92%] shadow-lg">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#ff8a00] shadow-md flex-shrink-0">
                <span className="material-symbols-outlined fill-1 text-2xl">verified</span>
              </div>
              <div>
                <div className="font-bold text-sm text-[#141b2b]">Kỹ thuật viên chứng chỉ</div>
                <div className="text-xs text-[#414751]">Đầy đủ bằng cấp, kinh nghiệm &amp; bảo hiểm</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-[#f9f9ff]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#141b2b] mb-3">Dịch vụ chuyên nghiệp</h2>
            <p className="text-base text-[#414751] max-w-2xl mx-auto">
              Giải pháp toàn diện cho mọi nhu cầu về điều hòa không khí của bạn, từ sửa chữa khẩn cấp đến bảo trì định kỳ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#c1c7d3]/30 hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-[#0f6cbd] text-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <span className="material-symbols-outlined text-2xl">build</span>
                </div>
                <h3 className="text-xl font-bold text-[#141b2b] mb-2">Sửa chữa 24/7</h3>
                <p className="text-sm text-[#414751] mb-4">
                  Khắc phục sự cố nhanh chóng, hiệu quả bất kể ngày đêm. Chẩn đoán chính xác lỗi thiết bị.
                </p>
              </div>
              <button
                onClick={() => handleServiceClick('air_conditioner', 'repair')}
                className="text-[#005396] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all min-h-[44px] cursor-pointer text-left"
              >
                <span>Tìm hiểu thêm</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#c1c7d3]/30 hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-[#0f6cbd] text-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <span className="material-symbols-outlined text-2xl">ac_unit</span>
                </div>
                <h3 className="text-xl font-bold text-[#141b2b] mb-2">Bảo trì định kỳ</h3>
                <p className="text-sm text-[#414751] mb-4">
                  Gói bảo dưỡng định kỳ giúp máy hoạt động bền bỉ, tiết kiệm điện năng và kéo dài tuổi thọ.
                </p>
              </div>
              <button
                onClick={() => handleServiceClick('air_conditioner', 'cleaning')}
                className="text-[#005396] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all min-h-[44px] cursor-pointer text-left"
              >
                <span>Tìm hiểu thêm</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#c1c7d3]/30 hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-[#0f6cbd] text-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <span className="material-symbols-outlined text-2xl">home_work</span>
                </div>
                <h3 className="text-xl font-bold text-[#141b2b] mb-2">Lắp đặt mới</h3>
                <p className="text-sm text-[#414751] mb-4">
                  Tư vấn và thi công lắp đặt hệ thống điều hòa phù hợp nhất cho không gian gia đình &amp; văn phòng.
                </p>
              </div>
              <button
                onClick={() => handleServiceClick('air_conditioner', 'maintenance')}
                className="text-[#005396] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all min-h-[44px] cursor-pointer text-left"
              >
                <span>Tìm hiểu thêm</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#c1c7d3]/30 hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-[#0f6cbd] text-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <span className="material-symbols-outlined text-2xl">air</span>
                </div>
                <h3 className="text-xl font-bold text-[#141b2b] mb-2">Lọc không khí</h3>
                <p className="text-sm text-[#414751] mb-4">
                  Cải thiện chất lượng không khí trong nhà, khử khuẩn và diệt nấm mốc bảo vệ sức khỏe gia đình.
                </p>
              </div>
              <button
                onClick={() => handleServiceClick('air_conditioner', 'cleaning')}
                className="text-[#005396] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all min-h-[44px] cursor-pointer text-left"
              >
                <span>Tìm hiểu thêm</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Symptom Helper */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#e9edff] to-[#f1f3ff] rounded-2xl p-6 sm:p-8 border border-[#005396]/20 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="max-w-xl">
              <span className="inline-block px-3 py-1 bg-[#005396]/10 text-[#005396] font-bold text-xs rounded-full mb-2">
                Chẩn đoán nhanh sự cố
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#141b2b]">
                Thiết bị nhà bạn đang gặp vấn đề gì?
              </h3>
              <p className="text-sm text-[#414751] mt-1">
                Chọn hiện tượng bên dưới để nhận hướng xử lý và đặt thợ nhanh chóng.
              </p>
            </div>

            <div className="w-full lg:w-auto flex-grow max-w-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {symptoms.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSymptom(selectedSymptom === s.text ? null : s.text)}
                    className={`p-3 text-xs sm:text-sm text-left rounded-xl border transition-all cursor-pointer ${
                      selectedSymptom === s.text
                        ? 'bg-[#005396] text-white border-[#005396] font-semibold shadow-sm'
                        : 'bg-white text-[#141b2b] border-[#c1c7d3]/50 hover:border-[#005396]'
                    }`}
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedSymptom && (
            <div className="mt-6 pt-4 border-t border-[#005396]/20 bg-white/80 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#ff8a00] text-2xl">info</span>
                <div>
                  <span className="text-xs font-bold text-[#005396] uppercase block">Gợi ý từ chuyên gia</span>
                  <p className="text-xs sm:text-sm text-[#141b2b] font-medium">
                    {symptoms.find((s) => s.text === selectedSymptom)?.advice}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const match = symptoms.find((s) => s.text === selectedSymptom);
                  if (match) {
                    handleServiceClick(match.device, match.service);
                  }
                }}
                className="bg-[#ff8a00] hover:bg-[#914c00] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-lg whitespace-nowrap shadow-sm transition-colors cursor-pointer self-end sm:self-center"
              >
                Đặt lịch theo hiện tượng này
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
