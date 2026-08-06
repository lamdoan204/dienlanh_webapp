import React, { useState } from 'react';
import { BookingRecord, ActiveTab } from '../types';
import { DEVICE_OPTIONS, SERVICE_PACKAGES } from '../data/mockData';

interface HistoryPageProps {
  bookings: BookingRecord[];
  setActiveTab: (tab: ActiveTab) => void;
  onCancelBooking: (id: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  bookings,
  setActiveTab,
  onCancelBooking,
}) => {
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(
    bookings.length > 0 ? bookings[0] : null
  );

  const getDeviceName = (devId: string) =>
    DEVICE_OPTIONS.find((d) => d.id === devId)?.name || 'Thiết bị HVAC';

  const getServiceName = (srvId: string) =>
    SERVICE_PACKAGES.find((s) => s.id === srvId)?.name || 'Dịch vụ';

  const getStatusBadge = (status: BookingRecord['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="bg-[#e9edff] text-[#005396] text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#005396] animate-pulse" />
            Đã tiếp nhận
          </span>
        );
      case 'technician_assigned':
        return (
          <span className="bg-[#ffdcc4] text-[#914c00] text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#ff8a00] animate-pulse" />
            Đã điều KTV
          </span>
        );
      case 'in_progress':
        return (
          <span className="bg-[#ffdcc4] text-[#914c00] text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#ff8a00] animate-ping" />
            Đang thực hiện
          </span>
        );
      case 'completed':
        return (
          <span className="bg-[#e1f8eb] text-[#10b981] text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Hoàn thành
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-[#ffdad6] text-[#ba1a1a] text-xs px-3 py-1 rounded-full font-bold">
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusStepIndex = (status: BookingRecord['status']) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'technician_assigned':
        return 2;
      case 'in_progress':
        return 3;
      case 'completed':
        return 4;
      default:
        return 0;
    }
  };

  return (
    <div className="pt-24 lg:pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title Header */}
      <div className="mb-8 border-b border-[#c1c7d3]/30 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#141b2b]">Lịch sử &amp; Trạng thái dịch vụ</h1>
          <p className="text-sm text-[#414751] mt-1">
            Theo dõi tiến độ di chuyển của kỹ thuật viên và lịch sử các lần sửa chữa, bảo trì của bạn.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('booking')}
          className="bg-[#005396] hover:bg-[#0f6cbd] text-white font-bold px-6 py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap min-h-[44px]"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span>Đặt lịch mới</span>
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#c1c7d3]/30 shadow-sm max-w-xl mx-auto my-8">
          <span className="material-symbols-outlined text-6xl text-[#c1c7d3] mb-4">history_toggle_off</span>
          <h3 className="text-xl font-bold text-[#141b2b] mb-2">Chưa có lịch hẹn nào</h3>
          <p className="text-sm text-[#414751] mb-6">
            Bạn chưa thực hiện đặt lịch dịch vụ nào. Hãy thử đặt lịch ngay hôm nay để nhận báo giá minh bạch!
          </p>
          <button
            onClick={() => setActiveTab('booking')}
            className="bg-[#ff8a00] hover:bg-[#914c00] text-white font-bold px-8 py-3 rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Đặt lịch ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking List Cards */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-bold text-[#414751] uppercase tracking-wider">
              Danh sách lịch hẹn ({bookings.length})
            </h3>

            {bookings.map((booking) => {
              const isSelected = selectedBooking?.id === booking.id;
              return (
                <div
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[#005396] bg-white shadow-md ring-2 ring-[#005396]/20'
                      : 'border-[#c1c7d3]/50 bg-white/80 hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-[#005396] bg-[#e9edff] px-2.5 py-0.5 rounded-md">
                      #{booking.id}
                    </span>
                    {getStatusBadge(booking.status)}
                  </div>

                  <h4 className="font-bold text-base text-[#141b2b]">
                    {getServiceName(booking.servicePackage)} {getDeviceName(booking.device)}
                  </h4>

                  <div className="text-xs text-[#414751] mt-2 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#005396]">event</span>
                      <span>
                        {booking.selectedDate} ({booking.selectedTimeSlot})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#005396]">location_on</span>
                      <span className="truncate">{booking.address}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Status Tracker Details */}
          {selectedBooking && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-[#c1c7d3]/30 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#c1c7d3]/30">
                  <div>
                    <span className="text-xs font-bold text-[#005396] uppercase tracking-wider block">
                      Chi tiết mã lịch hẹn #{selectedBooking.id}
                    </span>
                    <h2 className="text-2xl font-bold text-[#141b2b] mt-1">
                      {getServiceName(selectedBooking.servicePackage)} {getDeviceName(selectedBooking.device)}
                    </h2>
                  </div>
                  <div>{getStatusBadge(selectedBooking.status)}</div>
                </div>

                {/* Status Stepper Progress Bar */}
                {selectedBooking.status !== 'cancelled' && (
                  <div className="bg-[#f9f9ff] p-6 rounded-2xl border border-[#c1c7d3]/30">
                    <h4 className="text-xs font-bold text-[#414751] uppercase tracking-wider mb-6">
                      Tiến độ thực hiện theo thời gian thực
                    </h4>

                    <div className="relative flex items-center justify-between">
                      {/* Connecting Line */}
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#c1c7d3]/40 -translate-y-1/2 z-0" />
                      <div
                        className="absolute top-1/2 left-0 h-1 bg-[#005396] -translate-y-1/2 z-0 transition-all duration-500"
                        style={{
                          width: `${
                            ((getStatusStepIndex(selectedBooking.status) - 1) / 3) * 100
                          }%`,
                        }}
                      />

                      {/* Steps */}
                      {[
                        { step: 1, label: 'Đã tiếp nhận', icon: 'assignment' },
                        { step: 2, label: 'KTV di chuyển', icon: 'directions_car' },
                        { step: 3, label: 'Đang sửa chữa', icon: 'build' },
                        { step: 4, label: 'Hoàn thành', icon: 'task_alt' },
                      ].map((s) => {
                        const currentStep = getStatusStepIndex(selectedBooking.status);
                        const isDone = s.step <= currentStep;
                        const isCurrent = s.step === currentStep;

                        return (
                          <div key={s.step} className="relative z-10 flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                isDone
                                  ? 'bg-[#005396] text-white shadow-md'
                                  : 'bg-[#f1f3ff] text-[#717783] border-2 border-[#c1c7d3]'
                              } ${isCurrent ? 'ring-4 ring-[#ff8a00]/30 scale-110' : ''}`}
                            >
                              <span className="material-symbols-outlined text-xl">{s.icon}</span>
                            </div>
                            <span
                              className={`text-[11px] sm:text-xs font-bold mt-2 text-center max-w-[80px] ${
                                isDone ? 'text-[#005396]' : 'text-[#717783]'
                              }`}
                            >
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Technician Info Card */}
                {selectedBooking.technicianName && (
                  <div className="bg-[#e9edff]/60 border border-[#005396]/20 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#005396] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                        <span className="material-symbols-outlined text-2xl">person</span>
                      </div>
                      <div>
                        <span className="text-xs text-[#005396] font-bold uppercase block">
                          Kỹ thuật viên phụ trách
                        </span>
                        <h4 className="font-bold text-base text-[#141b2b]">
                          {selectedBooking.technicianName}
                        </h4>
                        <p className="text-xs text-[#414751]">Số điện thoại: {selectedBooking.technicianPhone}</p>
                      </div>
                    </div>

                    <a
                      href={`tel:${selectedBooking.technicianPhone}`}
                      className="bg-[#005396] hover:bg-[#0f6cbd] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm self-stretch sm:self-auto justify-center"
                    >
                      <span className="material-symbols-outlined text-base">call</span>
                      <span>Gọi KTV ngay</span>
                    </a>
                  </div>
                )}

                {/* Appointment Information Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="p-4 bg-[#f9f9ff] rounded-xl border border-[#c1c7d3]/30">
                    <span className="text-[#717783] block mb-1">Khách hàng đặt</span>
                    <strong className="text-[#141b2b]">{selectedBooking.fullName}</strong>
                    <div className="text-[#414751] mt-0.5">{selectedBooking.phone}</div>
                    <div className="text-[#414751]">{selectedBooking.email}</div>
                  </div>

                  <div className="p-4 bg-[#f9f9ff] rounded-xl border border-[#c1c7d3]/30">
                    <span className="text-[#717783] block mb-1">Thời gian &amp; Địa điểm</span>
                    <strong className="text-[#141b2b]">
                      {selectedBooking.selectedTimeSlot}, {selectedBooking.selectedDate}
                    </strong>
                    <div className="text-[#414751] mt-0.5">{selectedBooking.address}</div>
                  </div>
                </div>

                {/* Cost & Actions */}
                <div className="pt-4 border-t border-[#c1c7d3]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-[#717783] block">Phí dự kiến ban đầu</span>
                    <span className="text-xl font-bold text-[#005396]">
                      {selectedBooking.estimatedCost.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>

                  {selectedBooking.status !== 'completed' && selectedBooking.status !== 'cancelled' && (
                    <button
                      onClick={() => onCancelBooking(selectedBooking.id)}
                      className="bg-[#ffdad6] hover:bg-[#ba1a1a] hover:text-white text-[#93000a] text-xs sm:text-sm font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer w-full sm:w-auto text-center"
                    >
                      Hủy lịch hẹn này
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
