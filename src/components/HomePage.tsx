import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ActiveTab, DeviceType, ServicePackageType, AdminService } from '../types';
import { HERO_IMAGE_URL, PROJECT_IMAGES } from '../data/mockData';

interface HomePageProps {
  setActiveTab: (tab: ActiveTab) => void;
  onSelectBookingPreset?: (preset: AdminService | { device: DeviceType; service: ServicePackageType }) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setActiveTab, onSelectBookingPreset }) => {
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);

  // Auto scroll to element if URL has a hash (e.g. #bao-lau-nen-ve-sinh-may-lanh)
  React.useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
        }
      }
    };

    handleHashScroll();
    window.addEventListener('hashchange', handleHashScroll);
    return () => window.removeEventListener('hashchange', handleHashScroll);
  }, []);

  const handleServiceClick = (device: DeviceType, service: ServicePackageType) => {
    if (onSelectBookingPreset) {
      onSelectBookingPreset({ device, service });
    }
    setActiveTab('booking');
  };

  const cleaningFrequencies = [
    { title: 'Gia đình dùng thường xuyên', frequency: '3 – 4 tháng / lần', desc: 'Đảm bảo luồng khí sạch, tiết kiệm điện và làm lạnh nhanh.', icon: 'home' },
    { title: 'Gia đình dùng giờ cố định', frequency: '6 tháng / lần', desc: 'Thích hợp với hộ gia đình chỉ bật máy lạnh vào buổi tối.', icon: 'schedule' },
    { title: 'Văn phòng, chung cư, bệnh viện', frequency: '3 tháng / lần', desc: 'Mật độ máy cao, công suất lớn, cần vệ sinh thường xuyên.', icon: 'corporate_fare' },
    { title: 'Nhà máy, xí nghiệp, nhà hàng', frequency: '1 tháng / lần', desc: 'Môi trường nhiều khói bụi, máy chạy liên tục công suất cao.', icon: 'factory' },
  ];

  const symptomsList = [
    { text: 'Máy hoạt động nhưng không lạnh', icon: 'ac_unit' },
    { text: 'Thời gian làm lạnh lâu, lạnh yếu', icon: 'speed' },
    { text: 'Dàn lạnh chảy nước hoặc bám tuyết', icon: 'water_drop' },
    { text: 'Đường ống thoát nước bị nghẹt', icon: 'plumbing' },
    { text: 'Dàn nóng / dàn lạnh bám nhiều bụi', icon: 'cleaning_services' },
    { text: 'Máy hoạt động không đúng công suất', icon: 'warning' },
    { text: 'Máy chạy nhưng hay bị chết máy', icon: 'power_off' },
    { text: 'Hơi lạnh tỏa ra có mùi khó chịu', icon: 'air' },
    { text: 'Dàn nóng / dàn lạnh phát tiếng ồn lớn', icon: 'volume_up' },
  ];

  const benefitsList = [
    {
      title: 'Tiết kiệm điện năng',
      desc: 'Vệ sinh định kỳ giúp máy làm lạnh nhanh hơn, giảm áp lực lên máy nén. Theo tài liệu kỹ thuật, bảo trì đúng cách giúp giảm đến 30% điện năng tiêu thụ.',
      icon: 'bolt',
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    {
      title: 'Tăng tuổi thọ & Giảm hư hỏng',
      desc: 'Loại bỏ cặn bẩn bám lâu ngày, ngăn ngừa tắc nghẽn đường ống thoát nước, phát hiện sớm nguy cơ hỏng board mạch, hư block máy nén.',
      icon: 'verified',
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      title: 'Bảo vệ sức khỏe gia đình',
      desc: 'Loại bỏ nấm mốc, bụi mịn và các vi khuẩn tích tụ bên trong dàn lạnh (đặc biệt là Salmonella), mang lại luồng không khí trong lành, tươi mát.',
      icon: 'health_and_safety',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    }
  ];

  const processSteps = [
    {
      step: '01',
      title: 'Tiếp nhận thông tin',
      desc: 'Khách hàng liên hệ qua hotline. Nhân viên tiếp nhận thông tin, tư vấn và hẹn lịch kỹ thuật viên đến tận nhà đúng giờ.',
      icon: 'headset_mic'
    },
    {
      step: '02',
      title: 'Vệ sinh dàn lạnh',
      desc: 'Tháo mặt nạ ngoài, lá đảo, máng nước. Dùng khăn che bo mạch và dùng bơm xịt áp lực chuyên dụng rửa sạch dàn lá nhôm tản nhiệt.',
      icon: 'waves'
    },
    {
      step: '03',
      title: 'Vệ sinh lưới lọc & vỏ máy',
      desc: 'Làm sạch tấm lọc bụi, lau khô kỹ càng các khu vực ẩm ướt, tiến hành lắp lại lưới lọc và lau sạch toàn bộ vỏ dàn lạnh.',
      icon: 'dry_cleaning'
    },
    {
      step: '04',
      title: 'Vệ sinh dàn nóng',
      desc: 'Dùng máy xịt áp lực vệ sinh cánh quạt, lá đồng tản nhiệt dàn nóng và toàn bộ khu vực bên ngoài cục nóng ngoài trời.',
      icon: 'mode_fan'
    },
    {
      step: '05',
      title: 'Kiểm tra & Bàn giao',
      desc: 'Thông tắc đường ống nước thải, kiểm tra dòng điện, đo áp suất gas (bổ sung nếu thiếu), vận hành chạy thử và bàn giao.',
      icon: 'fact_check'
    }
  ];

  const reasonsList = [
    { title: 'Đơn vị uy tín hàng đầu', desc: 'Chuyên về thiết kế, lắp đặt, sửa chữa, vệ sinh và bảo trì máy lạnh dân dụng & công nghiệp.', icon: 'workspace_premium' },
    { title: 'Kỹ thuật viên chuyên nghiệp', desc: 'Đội ngũ thợ lành nghề, giàu kinh nghiệm, tác phong lịch sự và tận tâm phục vụ.', icon: 'engineering' },
    { title: 'Sản phẩm & Linh kiện chính hãng', desc: 'Cam kết phụ tùng thay thế chính hãng 100%, có nguồn gốc rõ ràng và tem bảo hành.', icon: 'verified_user' },
    { title: 'Giá cả công khai & Cạnh tranh', desc: 'Bảng giá minh bạch, báo giá trước khi làm, không phát sinh chi phí ẩn.', icon: 'payments' },
    { title: 'Bảo hành dài hạn & Tận tâm', desc: 'Chính sách bảo hành chu đáo sau dịch vụ, sẵn sàng hỗ trợ kiểm tra tận nơi.', icon: 'support_agent' },
    { title: 'Hướng dẫn sử dụng bền lâu', desc: 'Tư vấn nhiệt tình cách dùng máy lạnh tiết kiệm điện và duy trì tuổi thọ tối đa.', icon: 'tips_and_updates' }
  ];

  return (
    <div className="pt-36 sm:pt-38 lg:pt-36 pb-16">
      {/* Top Hotline Banner */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="bg-gradient-to-r from-[#003c6e] via-[#005396] to-[#0f6cbd] text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 text-[#ffd700] shadow-inner">
              <span className="material-symbols-outlined text-2xl animate-pulse">phone_in_talk</span>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-bold text-blue-200">Zalo / Hotline hỗ trợ kỹ thuật 24/7</div>
              <div className="text-lg sm:text-2xl font-extrabold text-white mt-0.5">
                Zalo / Hotline: <span className="text-[#ffd700]">0352572821</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#ffffff] pt-6 pb-12 lg:pt-10 lg:pb-20 border-b border-[#c1c7d3]/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[45%_55%] gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-6 lg:space-y-8 flex flex-col items-start text-left"
          >
            <h1 className="text-[34px] sm:text-[40px] lg:text-[48px] xl:text-[54px] font-bold text-[#141b2b] leading-[1.2] tracking-tight">
              Dịch vụ điện lạnh chuyên nghiệp - <span className="text-[#005396]">Tận tâm</span> trong từng lần phục vụ
            </h1>

            <p className="text-[15px] sm:text-[17px] lg:text-[19px] text-[#414751] max-w-xl leading-relaxed">
              Vệ sinh, sửa chữa, nạp gas và bảo trì máy lạnh tận nhà. Đặt lịch nhanh chóng, kỹ thuật viên giỏi chuyên môn, giá cả minh bạch.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
              <button
                onClick={() => setActiveTab('booking')}
                className="bg-[#005396] text-white font-semibold text-base px-8 py-4 rounded-xl hover:bg-[#0f6cbd] active:scale-95 transition-all shadow-md text-center flex items-center justify-center gap-2 cursor-pointer min-w-[200px]"
              >
                <span>Đặt lịch ngay</span>
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className="bg-[#f0f4f8] text-[#141b2b] font-semibold text-base px-8 py-4 rounded-xl hover:bg-[#e2e8f0] active:scale-95 transition-all text-center flex items-center justify-center cursor-pointer min-w-[160px]"
              >
                Bảng giá dịch vụ
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 pt-4 lg:pt-2 w-full">
              <div className="flex items-center gap-2 text-sm lg:text-base font-medium text-[#414751]">
                <span className="material-symbols-outlined text-[#005396] text-xl">check_circle</span>
                Kỹ thuật viên nhiệt tình
              </div>
              <div className="flex items-center gap-2 text-sm lg:text-base font-medium text-[#414751]">
                <span className="material-symbols-outlined text-[#005396] text-xl">check_circle</span>
                Báo giá minh bạch
              </div>
              <div className="flex items-center gap-2 text-sm lg:text-base font-medium text-[#414751]">
                <span className="material-symbols-outlined text-[#005396] text-xl">check_circle</span>
                Phục vụ tận nơi
              </div>
            </div>
          </motion.div>

          {/* Right Column - Image */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="relative w-full h-[380px] sm:h-[480px] lg:h-[550px] rounded-3xl overflow-hidden shadow-2xl"
          >
            <img
              className="w-full h-full object-cover"
              alt="Kỹ thuật viên điện lạnh đang làm việc"
              src={HERO_IMAGE_URL}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </section>

      {/* Featured Services */}
      <section id="dich-vu-noi-bat" className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-[#f9f9ff] scroll-mt-28">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 bg-[#005396]/10 text-[#005396] font-bold text-xs rounded-full mb-2">
              Dịch vụ nòng cốt
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#141b2b] mb-3">Dịch vụ chuyên nghiệp</h2>
            <p className="text-base text-[#414751] max-w-2xl mx-auto">
              Giải pháp toàn diện cho mọi nhu cầu về điều hòa không khí của bạn, từ vệ sinh định kỳ đến bảo trì tổng quát.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#c1c7d3]/30 hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-[#0f6cbd] text-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <span className="material-symbols-outlined text-2xl">water_drop</span>
                </div>
                <h3 className="text-xl font-bold text-[#141b2b] mb-2">Vệ sinh &amp; Rửa máy lạnh</h3>
                <p className="text-sm text-[#414751] mb-4">
                  Xịt rửa chuyên sâu dàn nóng, dàn lạnh bằng thiết bị áp lực, diệt khuẩn, khử mùi hôi và thông tắc máng nước.
                </p>
              </div>
              <button
                onClick={() => handleServiceClick('air_conditioner', 'cleaning')}
                className="text-[#005396] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all min-h-[44px] cursor-pointer text-left"
              >
                <span>Đặt dịch vụ này</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#c1c7d3]/30 hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-[#0f6cbd] text-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <span className="material-symbols-outlined text-2xl">speed</span>
                </div>
                <h3 className="text-xl font-bold text-[#141b2b] mb-2">Bơm gas &amp; Bảo dưỡng tổng quát</h3>
                <p className="text-sm text-[#414751] mb-4">
                  Kiểm tra rò rỉ van đường ống, đo dòng điện và nạp bổ sung gas chuẩn định lượng giúp máy lạnh đạt độ lạnh sâu.
                </p>
              </div>
              <button
                onClick={() => handleServiceClick('air_conditioner', 'maintenance')}
                className="text-[#005396] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all min-h-[44px] cursor-pointer text-left"
              >
                <span>Đặt dịch vụ này</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1 — Giới thiệu & Tần suất vệ sinh máy lạnh */}
      <section 
        id="bao-lau-nen-ve-sinh-may-lanh" 
        className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#c1c7d3]/20 scroll-mt-28"
      >
        {/* Support alternative anchor */}
        <span id="tan-suat-ve-sinh" className="block -mt-28 pt-28 pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-block px-3 py-1 bg-[#005396]/10 text-[#005396] font-bold text-xs rounded-full mb-3">
              Kiến thức cần biết
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#141b2b] mb-4">
              Bao lâu nên vệ sinh máy lạnh một lần?
            </h2>
            <p className="text-base text-[#414751] leading-relaxed">
              Tương tự như các thiết bị điện khác, máy lạnh sau một thời gian hoạt động đều sẽ bị bám bụi bẩn. Việc bảo trì và vệ sinh định kỳ phụ thuộc vào tần suất sử dụng cũng như môi trường hoạt động thực tế.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cleaningFrequencies.map((item, index) => (
              <div key={index} className="bg-[#f9f9ff] p-6 rounded-2xl border border-[#c1c7d3]/30 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-10 h-10 bg-[#e9edff] text-[#005396] rounded-xl flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <h3 className="font-bold text-[#141b2b] text-base mb-1">{item.title}</h3>
                  <div className="text-sm font-extrabold text-[#005396] mb-2">{item.frequency}</div>
                  <p className="text-xs text-[#414751] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2 — Dấu hiệu máy lạnh cần vệ sinh ngay */}
      <section 
        id="dau-hieu-can-ve-sinh" 
        className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-[#fffcf5] border-t border-[#ff8a00]/20 scroll-mt-28"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 bg-[#ff8a00]/15 text-[#914c00] font-bold text-xs rounded-full mb-2">
              Cảnh báo sự cố
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#141b2b] mb-3">
              Những dấu hiệu máy lạnh cần được vệ sinh ngay
            </h2>
            <p className="text-base text-[#414751] max-w-2xl mx-auto">
              Nếu thiết bị nhà bạn xuất hiện một trong các hiện tượng dưới đây, hãy lên lịch vệ sinh để tránh hư hỏng nặng hơn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {symptomsList.map((symptom, idx) => (
              <div 
                key={idx}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ff8a00]/20 shadow-2xs flex items-center gap-3.5 hover:border-[#ff8a00]/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#fff8eb] text-[#ff8a00] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">{symptom.icon}</span>
                </div>
                <span className="text-sm font-medium text-[#141b2b]">{symptom.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 & 4 — Vì sao cần vệ sinh & Lợi ích bảo trì */}
      <section 
        id="loi-ich-ve-sinh" 
        className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#c1c7d3]/20 scroll-mt-28"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-[#005396]/10 text-[#005396] font-bold text-xs rounded-full mb-2">
              Giá trị mang lại
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#141b2b] mb-3">
              Lợi ích của việc vệ sinh máy lạnh thường xuyên
            </h2>
            <p className="text-base text-[#414751] max-w-2xl mx-auto">
              Không chỉ làm sạch bề mặt, việc bảo dưỡng đúng chuẩn giúp bảo vệ sức khỏe, tiết kiệm chi phí và giữ máy luôn bền bỉ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefitsList.map((benefit, idx) => (
              <div key={idx} className="bg-[#f9f9ff] p-6 sm:p-8 rounded-3xl border border-[#c1c7d3]/30 flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border ${benefit.color}`}>
                    <span className="material-symbols-outlined text-2xl">{benefit.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#141b2b] mb-3">{benefit.title}</h3>
                  <p className="text-sm text-[#414751] leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — Quy trình vệ sinh máy lạnh chuyên nghiệp (5 Bước) */}
      <section 
        id="quy-trinh-ve-sinh" 
        className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-[#f0f7ff] border-t border-[#005396]/15 scroll-mt-28"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-[#005396] text-white font-bold text-xs rounded-full mb-2">
              Chuẩn quy trình
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#141b2b] mb-3">
              Quy trình vệ sinh máy lạnh chuyên nghiệp
            </h2>
            <p className="text-base text-[#414751] max-w-2xl mx-auto">
              5 bước vệ sinh đúng kỹ thuật thực hiện bởi Điện lạnh Công Thương mang lại sự an tâm tuyệt đối.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {processSteps.map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-[#005396]/20 shadow-2xs flex flex-col justify-between relative group hover:border-[#005396] transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-[#005396]/30 group-hover:text-[#005396] transition-colors">{item.step}</span>
                    <div className="w-8 h-8 rounded-full bg-[#e9edff] text-[#005396] flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-[#141b2b] text-base mb-2">{item.title}</h3>
                  <p className="text-xs text-[#414751] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — Những lưu ý khi bảo dưỡng máy lạnh tại nhà */}
      <section 
        id="luu-y-bao-duong" 
        className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto scroll-mt-28"
      >
        <div className="bg-[#fff3f3] p-6 sm:p-8 rounded-3xl border border-red-200/80 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#ba1a1a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">report_problem</span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#ba1a1a] mb-2">
                Những lưu ý kỹ thuật quan trọng khi bảo dưỡng
              </h3>
              <ul className="text-sm text-[#414751] space-y-2.5 list-disc pl-5">
                <li>Tránh sử dụng lực phun nước quá mạnh ở gần khu vực bảng mạch điều khiển (nằm phía trên máy nén) để tránh hư hỏng bo mạch.</li>
                <li>Tuyệt đối không để dàn lạnh tiếp xúc trực tiếp với ánh nắng mặt trời hay mưa gió quá nhiều trong quá trình tháo lắp bảo dưỡng.</li>
                <li>Kiểm tra kỹ tình trạng rò rỉ van đường ống gas để hạn chế tình trạng mất lạnh, quá nhiệt hỏng dây dẫn.</li>
                <li>Đảm bảo quá trình vệ sinh an toàn tuyệt đối cho toàn bộ linh kiện điện tử của máy.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — Tại sao nên chọn Điện lạnh Công Thương? */}
      <section 
        id="tai-sao-chon-chung-toi" 
        className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#c1c7d3]/20 scroll-mt-28"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-[#005396]/10 text-[#005396] font-bold text-xs rounded-full mb-2">
              Thương hiệu uy tín
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#141b2b] mb-3">
              Tại sao nên chọn Điện lạnh Công Thương?
            </h2>
            <p className="text-base text-[#414751] max-w-2xl mx-auto">
              Đơn vị đồng hành tin cậy của hàng nghìn hộ gia đình và doanh nghiệp.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {reasonsList.map((reason, idx) => (
              <div key={idx} className="bg-[#f9f9ff] p-6 rounded-2xl border border-[#c1c7d3]/30 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#005396] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <span className="material-symbols-outlined text-xl">{reason.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#141b2b] text-base mb-1">{reason.title}</h3>
                  <p className="text-xs text-[#414751] leading-relaxed">{reason.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-[#f9f9ff] border-t border-[#c1c7d3]/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#141b2b] mb-3">Hình ảnh thực tế</h2>
            <p className="text-base text-[#414751] max-w-2xl mx-auto">
              Quá trình làm việc tận tâm và kết quả dịch vụ từ đội ngũ kỹ thuật viên chuyên nghiệp.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {PROJECT_IMAGES.map((imgUrl, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="relative rounded-2xl overflow-hidden shadow-sm group aspect-square sm:aspect-[4/3] w-full"
              >
                <img 
                  src={imgUrl} 
                  alt={`Dự án thực tế ${idx + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 — CTA Chuyển đổi */}
      <section className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-[#003c6e] via-[#005396] to-[#0f6cbd] text-white rounded-3xl p-8 sm:p-12 text-center shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              Máy lạnh nhà bạn đang có dấu hiệu hoạt động kém?
            </h2>
            <p className="text-blue-100 text-base sm:text-lg leading-relaxed">
              Đặt lịch vệ sinh và bảo trì máy lạnh ngay hôm nay để thiết bị hoạt động ổn định, tiết kiệm điện năng và bảo vệ sức khỏe cho cả gia đình!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setActiveTab('booking')}
                className="w-full sm:w-auto bg-[#ff8a00] hover:bg-[#e07a00] text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Đặt lịch ngay</span>
                <span className="material-symbols-outlined">calendar_month</span>
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-base px-8 py-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Xem bảng giá</span>
                <span className="material-symbols-outlined">payments</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
