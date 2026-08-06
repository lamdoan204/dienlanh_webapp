import React, { useState } from 'react';
import { BookingFormData, BookingRecord, DeviceType, ServicePackageType, ActiveTab } from '../types';
import { DEVICE_OPTIONS, SERVICE_PACKAGES } from '../data/mockData';

interface BookingPageProps {
  initialPreset?: { device: DeviceType; service: ServicePackageType };
  onBookingSubmit: (newBooking: BookingRecord) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  initialPreset,
  onBookingSubmit,
  setActiveTab,
}) => {
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: 'Nguyễn Văn A',
    phone: '090 123 4567',
    email: 'nguyenvana@example.com',
    address: '123 Đường Khí Hậu, Thành phố Mát Mẻ',
    device: initialPreset?.device || 'air_conditioner',
    servicePackage: initialPreset?.service || 'repair',
    selectedDate: '2024-10-16',
    selectedTimeSlot: '10:00 Sáng - 12:00 Trưa',
    notes: '',
  });

  const [currentMonthYear, setCurrentMonthYear] = useState({ year: 2024, month: 10 });
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(16);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string>('');

  const timeSlots = [
    { id: 't1', label: '08:00 Sáng - 10:00 Sáng', available: true },
    { id: 't2', label: '10:00 Sáng - 12:00 Trưa', available: true },
    { id: 't3', label: '12:00 Trưa - 02:00 Chiều', available: false },
    { id: 't4', label: '02:00 Chiều - 04:00 Chiều', available: true },
    { id: 't5', label: '04:00 Chiều - 06:00 Chiều', available: true },
  ];

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const selectedDeviceObj = DEVICE_OPTIONS.find((d) => d.id === formData.device) || DEVICE_OPTIONS[0];
  const selectedServiceObj = SERVICE_PACKAGES.find((s) => s.id === formData.servicePackage) || SERVICE_PACKAGES[0];

  const getDayName = (dateStr: string) => {
    const d = new Date(dateStr);
    const dayIndex = d.getDay();
    const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[dayIndex] || 'Thứ 4';
  };

  const handleDaySelect = (dayNum: number) => {
    setSelectedDayNumber(dayNum);
    const formattedMonth = currentMonthYear.month < 10 ? `0${currentMonthYear.month}` : `${currentMonthYear.month}`;
    const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const dateStr = `${currentMonthYear.year}-${formattedMonth}-${formattedDay}`;
    handleInputChange('selectedDate', dateStr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `HVAC-${Math.floor(10000 + Math.random() * 90000)}`;
    const newBookingRecord: BookingRecord = {
      ...formData,
      id: newId,
      createdAt: new Date().toISOString(),
      status: 'pending',
      technicianName: 'Trần Hoàng Nam (Mã KTV: 104)',
      technicianPhone: '098 765 4321',
      estimatedCost: selectedServiceObj.basePrice,
    };

    onBookingSubmit(newBookingRecord);
    setCreatedBookingId(newId);
    setIsSuccessModalOpen(true);
  };

  // Cost estimates
  const basePrice = selectedServiceObj.basePrice;

  return (
    <div className="pt-24 lg:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Step Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#c1c7d3]/30 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#141b2b]">Đặt lịch dịch vụ</h1>
          <p className="text-sm sm:text-base text-[#414751] mt-1">
            Hoàn thành biểu mẫu dưới đây để đặt lịch hẹn dịch vụ HVAC chuyên nghiệp của bạn.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#005396] bg-[#e9edff] px-4 py-2 rounded-xl">
          <span className="material-symbols-outlined text-lg">edit_calendar</span>
          <span>Chi tiết - Dịch vụ - Lịch hẹn</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Fields */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
          {/* 1. Thông tin khách hàng */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#c1c7d3]/30">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#c1c7d3]/30">
              <span className="material-symbols-outlined fill-1 text-[#005396] bg-[#0f6cbd]/15 p-2 rounded-full">
                person
              </span>
              <h2 className="text-xl font-bold text-[#141b2b]">Thông tin khách hàng</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#414751] uppercase tracking-wider" htmlFor="fullName">
                  Họ và tên
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl px-4 py-3 text-sm text-[#141b2b] focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396] transition-colors h-[48px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#414751] uppercase tracking-wider" htmlFor="phone">
                  Số điện thoại
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="090 123 4567"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl px-4 py-3 text-sm text-[#141b2b] focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396] transition-colors h-[48px]"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-[#414751] uppercase tracking-wider" htmlFor="email">
                  Địa chỉ email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="nguyenvana@example.com"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl px-4 py-3 text-sm text-[#141b2b] focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396] transition-colors h-[48px]"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-[#414751] uppercase tracking-wider" htmlFor="address">
                  Địa chỉ dịch vụ
                </label>
                <input
                  id="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Đường Khí Hậu, Thành phố Mát Mẻ"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl px-4 py-3 text-sm text-[#141b2b] focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396] transition-colors h-[48px]"
                />
              </div>
            </div>
          </section>

          {/* 2. Chi tiết dịch vụ */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#c1c7d3]/30 space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-[#c1c7d3]/30">
              <span className="material-symbols-outlined fill-1 text-[#005396] bg-[#0f6cbd]/15 p-2 rounded-full">
                build
              </span>
              <h2 className="text-xl font-bold text-[#141b2b]">Chi tiết dịch vụ</h2>
            </div>

            {/* Device Type Selection */}
            <div>
              <h3 className="text-sm font-semibold text-[#141b2b] mb-3">Chọn loại thiết bị</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {DEVICE_OPTIONS.map((dev) => {
                  const isSelected = formData.device === dev.id;
                  return (
                    <button
                      key={dev.id}
                      type="button"
                      onClick={() => handleInputChange('device', dev.id)}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer relative text-center ${
                        isSelected
                          ? 'border-[#005396] bg-[#e3ecff] text-[#005396] ring-2 ring-[#005396] font-semibold'
                          : 'border-[#c1c7d3]/60 bg-[#f9f9ff] text-[#414751] hover:bg-[#f1f3ff]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-3xl">{dev.icon}</span>
                      <span className="text-xs sm:text-sm">{dev.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Service Package Selection */}
            <div>
              <h3 className="text-sm font-semibold text-[#141b2b] mb-3">Chọn gói dịch vụ</h3>
              <div className="grid grid-cols-1 gap-3">
                {SERVICE_PACKAGES.map((pkg) => {
                  const isSelected = formData.servicePackage === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => handleInputChange('servicePackage', pkg.id)}
                      className={`p-4 sm:p-5 rounded-xl border flex flex-col text-left transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-[#005396] bg-[#005396] text-white shadow-md'
                          : 'border-[#c1c7d3]/60 bg-[#f9f9ff] text-[#141b2b] hover:bg-[#f1f3ff]'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-[#141b2b]'}`}>
                          {pkg.name}
                        </span>
                        <span className={`material-symbols-outlined ${isSelected ? 'text-white' : 'text-[#005396]'}`}>
                          {pkg.icon}
                        </span>
                      </div>
                      <p className={`text-xs sm:text-sm mt-1.5 ${isSelected ? 'text-white/90' : 'text-[#414751]'}`}>
                        {pkg.description}
                      </p>
                      <div className={`mt-3 pt-2 font-bold text-sm ${isSelected ? 'text-white' : 'text-[#005396]'}`}>
                        {pkg.priceText}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 3. Lịch hẹn dịch vụ */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#c1c7d3]/30">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#c1c7d3]/30">
              <span className="material-symbols-outlined fill-1 text-[#005396] bg-[#0f6cbd]/15 p-2 rounded-full">
                calendar_month
              </span>
              <h2 className="text-xl font-bold text-[#141b2b]">Lịch hẹn dịch vụ</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Calendar Date Picker */}
              <div>
                <h3 className="text-sm font-semibold text-[#141b2b] mb-3">Chọn ngày</h3>
                <div className="bg-[#f9f9ff] border border-[#c1c7d3]/60 rounded-xl p-4 w-full">
                  <div className="flex justify-between items-center mb-4">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentMonthYear((prev) => ({
                          ...prev,
                          month: prev.month === 1 ? 12 : prev.month - 1,
                          year: prev.month === 1 ? prev.year - 1 : prev.year,
                        }))
                      }
                      className="p-1.5 rounded-full hover:bg-[#e1e8fd] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <span className="font-bold text-sm text-[#141b2b]">
                      Tháng {currentMonthYear.month} {currentMonthYear.year}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentMonthYear((prev) => ({
                          ...prev,
                          month: prev.month === 12 ? 1 : prev.month + 1,
                          year: prev.month === 12 ? prev.year + 1 : prev.year,
                        }))
                      }
                      className="p-1.5 rounded-full hover:bg-[#e1e8fd] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-[#414751] mb-2">
                    <div>CN</div>
                    <div>T2</div>
                    <div>T3</div>
                    <div>T4</div>
                    <div>T5</div>
                    <div>T6</div>
                    <div>T7</div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-xs sm:text-sm">
                    {/* Previous Month trailing days */}
                    <div className="p-2 text-[#c1c7d3]">29</div>
                    <div className="p-2 text-[#c1c7d3]">30</div>

                    {/* Days 1 to 31 */}
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((dayNum) => {
                      const isSelected = selectedDayNumber === dayNum;
                      return (
                        <button
                          key={dayNum}
                          type="button"
                          onClick={() => handleDaySelect(dayNum)}
                          className={`p-2 rounded-full cursor-pointer transition-all flex items-center justify-center font-medium ${
                            isSelected
                              ? 'bg-[#005396] text-white font-bold shadow-md'
                              : 'hover:bg-[#e1e8fd] text-[#141b2b]'
                          }`}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <h3 className="text-sm font-semibold text-[#141b2b] mb-3">Chọn giờ</h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {timeSlots.map((slot) => {
                    const isSelected = formData.selectedTimeSlot === slot.label;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => handleInputChange('selectedTimeSlot', slot.label)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-medium text-xs sm:text-sm h-[44px] flex items-center justify-center ${
                          !slot.available
                            ? 'bg-[#f1f3ff] text-[#c1c7d3] border-[#c1c7d3]/30 cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'bg-[#005396] text-white border-[#005396] font-bold shadow-sm'
                            : 'bg-[#f9f9ff] text-[#141b2b] border-[#c1c7d3]/60 hover:bg-[#e1e8fd]'
                        }`}
                      >
                        {slot.label} {!slot.available && '(Đã kín lịch)'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <button
            type="submit"
            className="w-full md:hidden bg-[#ff8a00] hover:bg-[#914c00] text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <span>Xác nhận đặt lịch ({basePrice.toLocaleString('vi-VN')} VNĐ)</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </form>

        {/* 4. Summary Sidebar (Desktop & Tablet) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-lg border border-[#c1c7d3]/40 flex flex-col h-fit">
            <h2 className="text-xl font-bold text-[#141b2b] mb-5 pb-3 border-b border-[#c1c7d3]/30">
              Tóm tắt đặt lịch
            </h2>

            <div className="space-y-4">
              {/* Service Summary */}
              <div className="flex gap-4 items-start pb-4 border-b border-[#c1c7d3]/30">
                <div className="bg-[#0f6cbd]/15 p-3 rounded-xl text-[#005396] flex-shrink-0">
                  <span className="material-symbols-outlined">{selectedDeviceObj.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#141b2b]">
                    {selectedServiceObj.name} {selectedDeviceObj.name}
                  </h4>
                  <p className="text-xs text-[#414751] mt-1">{selectedServiceObj.description}</p>
                </div>
              </div>

              {/* Schedule Summary */}
              <div className="flex gap-4 items-start pb-4 border-b border-[#c1c7d3]/30">
                <div className="bg-[#f1f3ff] p-3 rounded-xl text-[#005396] flex-shrink-0">
                  <span className="material-symbols-outlined">event</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#141b2b]">
                    {getDayName(formData.selectedDate)}, ngày {selectedDayNumber} tháng {currentMonthYear.month}, {currentMonthYear.year}
                  </h4>
                  <p className="text-xs text-[#005396] font-semibold mt-1">{formData.selectedTimeSlot}</p>
                </div>
              </div>

              {/* Location Summary */}
              <div className="flex gap-4 items-start pb-4 border-b border-[#c1c7d3]/30">
                <div className="bg-[#f1f3ff] p-3 rounded-xl text-[#414751] flex-shrink-0">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#141b2b]">Địa chỉ dịch vụ</h4>
                  <p className="text-xs text-[#414751] mt-1 leading-relaxed">
                    {formData.address || '123 Đường Khí Hậu, Thành phố Mát Mẻ'}
                  </p>
                  <p className="text-xs text-[#414751] font-medium mt-0.5">
                    {formData.fullName} - {formData.phone}
                  </p>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="pt-2 pb-4 space-y-2">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-[#414751]">Phí kiểm tra ban đầu</span>
                  <span className="font-bold text-[#141b2b]">{basePrice.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-[#414751]">Dự kiến sửa chữa</span>
                  <span className="font-semibold text-[#005396]">Báo giá sau kiểm tra</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleSubmit}
              type="button"
              className="w-full bg-[#ff8a00] hover:bg-[#914c00] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer mt-2 min-h-[48px] active:scale-98"
            >
              <span>Xác nhận đặt lịch</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>

            <p className="text-[11px] text-center text-[#414751] mt-3">
              Bằng việc đặt lịch, bạn đồng ý với Điều khoản dịch vụ &amp; chính sách bảo mật của chúng tôi.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Summary Bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-[#c1c7d3]/50 shadow-[0px_-4px_20px_rgba(0,0,0,0.12)] p-4 z-20">
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="text-xs text-[#414751] block">Tổng phí ban đầu</span>
            <span className="font-bold text-base text-[#141b2b]">
              {basePrice.toLocaleString('vi-VN')} VNĐ+
            </span>
          </div>
          <span className="text-xs text-[#005396] font-semibold bg-[#e9edff] px-2.5 py-1 rounded-full">
            {selectedServiceObj.name}
          </span>
        </div>
        <button
          onClick={handleSubmit}
          type="button"
          className="w-full bg-[#ff8a00] hover:bg-[#914c00] text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm min-h-[44px] cursor-pointer"
        >
          <span>Xác nhận đặt lịch</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-[#c1c7d3]/30">
            <div className="w-16 h-16 bg-[#005396] text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="material-symbols-outlined text-4xl fill-1">check_circle</span>
            </div>
            <h3 className="text-2xl font-bold text-[#141b2b] mb-2">Đặt lịch thành công!</h3>
            <p className="text-sm text-[#414751] mb-4 leading-relaxed">
              Mã lịch hẹn của bạn là <strong className="text-[#005396]">{createdBookingId}</strong>. Kỹ thuật viên sẽ liên hệ xác nhận trước khung giờ đặt 15-30 phút.
            </p>

            <div className="bg-[#f1f3ff] p-4 rounded-xl text-left text-xs space-y-1.5 mb-6 text-[#141b2b]">
              <div><strong>Thiết bị:</strong> {selectedDeviceObj.name} ({selectedServiceObj.name})</div>
              <div><strong>Thời gian:</strong> {formData.selectedTimeSlot}, ngày {selectedDayNumber}/10/2024</div>
              <div><strong>Địa chỉ:</strong> {formData.address}</div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setActiveTab('history');
                }}
                className="w-full bg-[#005396] hover:bg-[#0f6cbd] text-white font-bold py-3 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Xem trạng thái trong Lịch sử dịch vụ
              </button>
              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setActiveTab('home');
                }}
                className="w-full bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#005396] font-semibold py-3 rounded-xl transition-colors cursor-pointer"
              >
                Trở về Trang chủ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
