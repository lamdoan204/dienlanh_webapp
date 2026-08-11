import React, { useState, useEffect } from 'react';
import { BookingRecord, ActiveTab, CustomerReview } from '../types';
import { DEVICE_OPTIONS, SERVICE_PACKAGES } from '../data/mockData';
import { commonService } from '../services/commonService';

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
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    bookings.length > 0 ? bookings[0].id : null
  );

  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>('');
  const [existingReview, setExistingReview] = useState<CustomerReview | null>(null);
  const [isCheckingReview, setIsCheckingReview] = useState<boolean>(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewMsg, setReviewMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId) || bookings[0] || null;

  useEffect(() => {
    if (selectedBooking && selectedBooking.status === 'completed') {
      setIsCheckingReview(true);
      setReviewMsg(null);
      commonService.checkOrderIsReviewed(selectedBooking.id).then((res) => {
        setIsCheckingReview(false);
        if (res.isReviewed && res.review) {
          setExistingReview(res.review);
        } else {
          setExistingReview(null);
        }
      });
    } else {
      setExistingReview(null);
      setReviewMsg(null);
    }
  }, [selectedBooking?.id, selectedBooking?.status]);

  const handleSubmitReview = async () => {
    if (!selectedBooking) return;
    if (!commentInput.trim()) {
      setReviewMsg({ type: 'error', text: 'Vui lòng nhập lời nhận xét của bạn.' });
      return;
    }

    setIsSubmittingReview(true);
    setReviewMsg(null);

    const res = await commonService.submitOrderReview({
      orderId: selectedBooking.id,
      author: selectedBooking.fullName || 'Khách hàng',
      rating: ratingInput,
      comment: commentInput.trim(),
      serviceType: getServiceNameDisplay(selectedBooking),
      workerId: selectedBooking.workerId || selectedBooking.technicianId
    });

    setIsSubmittingReview(false);

    if (res.success && res.review) {
      setExistingReview(res.review);
      setReviewMsg({ type: 'success', text: res.message });
      setCommentInput('');
    } else {
      setReviewMsg({ type: 'error', text: res.message || 'Lỗi khi gửi đánh giá.' });
    }
  };

  const getDeviceName = (devId: string) =>
    DEVICE_OPTIONS.find((d) => d.id === devId)?.name || 'Thiết bị HVAC';

  const formatOrderTime = (dateStr?: string) => {
    if (!dateStr) return 'Mới đặt';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${hours}:${minutes} - ${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const getServiceNameDisplay = (booking: BookingRecord) => {
    if (booking.serviceName) {
      return booking.serviceName;
    }
    const pkgName = SERVICE_PACKAGES.find((s) => s.id === booking.servicePackage)?.name;
    const devName = DEVICE_OPTIONS.find((d) => d.id === booking.device)?.name;
    if (pkgName && devName) return `${pkgName} ${devName}`;
    return pkgName || devName || 'Dịch vụ HVAC';
  };

  const getStatusBadge = (status: BookingRecord['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="bg-[#e9edff] text-[#005396] text-xs px-3 py-1 rounded-full font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#005396] animate-pulse shrink-0" />
            Đã tiếp nhận
          </span>
        );
      case 'verified':
      case 'technician_assigned':
      case 'in_progress':
        return (
          <span className="bg-[#ffdcc4] text-[#914c00] text-xs px-3 py-1 rounded-full font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#ff8a00] animate-pulse shrink-0" />
            Đã xác nhận
          </span>
        );
      case 'completed':
        return (
          <span className="bg-[#e1f8eb] text-[#10b981] text-xs px-3 py-1 rounded-full font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0">
            <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
            Đã hoàn thành
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-[#ffdad6] text-[#ba1a1a] text-xs px-3 py-1 rounded-full font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0">
            <span className="material-symbols-outlined text-sm shrink-0">cancel</span>
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
      case 'verified':
      case 'technician_assigned':
      case 'in_progress':
        return 2;
      case 'completed':
        return 3;
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
                  onClick={() => setSelectedBookingId(booking.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[#005396] bg-white shadow-md ring-2 ring-[#005396]/20'
                      : 'border-[#c1c7d3]/50 bg-white/80 hover:bg-white'
                  }`}
                >
                  <div className="flex justify-end items-start mb-2">
                    {getStatusBadge(booking.status)}
                  </div>

                  <h4 className="font-bold text-base text-[#141b2b]">
                    {getServiceNameDisplay(booking)}
                  </h4>

                  <div className="text-xs text-[#414751] mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-[#717783] text-[11px]">
                      <span className="material-symbols-outlined text-sm text-[#005396]">schedule</span>
                      <span>
                        Đặt lúc: <strong className="text-[#141b2b]">{formatOrderTime(booking.createdAt)}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#005396]">event</span>
                      <span>
                        Lịch hẹn: {booking.selectedDate} ({booking.selectedTimeSlot})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#005396]">location_on</span>
                      <span className="truncate">{booking.address}</span>
                    </div>
                    {booking.notes && (
                      <div className="flex items-center gap-1.5 text-xs text-[#005396] bg-[#f0f4ff] p-1.5 rounded-md mt-1">
                        <span className="material-symbols-outlined text-sm flex-shrink-0">edit_note</span>
                        <span className="truncate italic">Ghi chú: {booking.notes}</span>
                      </div>
                    )}
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#005396] uppercase tracking-wider block">
                        Chi tiết lịch hẹn
                      </span>
                      <span className="text-xs text-[#717783] bg-[#f1f3ff] px-2 py-0.5 rounded-md">
                        Thời gian đặt đơn: {formatOrderTime(selectedBooking.createdAt)}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-[#141b2b] mt-1">
                      {getServiceNameDisplay(selectedBooking)}
                    </h2>
                  </div>
                  <div>{getStatusBadge(selectedBooking.status)}</div>
                </div>

                {/* Status Stepper Progress Bar */}
                {selectedBooking.status === 'cancelled' ? (
                  <div className="bg-[#ffdad6]/40 p-5 rounded-2xl border border-[#ba1a1a]/30 flex items-center gap-3">
                    <span className="material-symbols-outlined text-2xl text-[#ba1a1a]">cancel</span>
                    <div>
                      <h4 className="font-bold text-sm text-[#ba1a1a]">Đơn hàng đã hủy</h4>
                      <p className="text-xs text-[#521414] mt-0.5">
                        Trạng thái "Đã hủy" không hiển thị trên thanh tiến độ thực hiện. Khách hàng có thể tạo đơn đặt lịch mới nếu muốn.
                      </p>
                    </div>
                  </div>
                ) : (
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
                            ((getStatusStepIndex(selectedBooking.status) - 1) / 2) * 100
                          }%`,
                        }}
                      />

                      {/* Steps */}
                      {[
                        { step: 1, label: 'Đã tiếp nhận', icon: 'assignment' },
                        { step: 2, label: 'Đã xác nhận', icon: 'verified' },
                        { step: 3, label: 'Đã hoàn thành', icon: 'task_alt' },
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
                  </div>
                )}

                {/* Completed Order Review Section */}
                {selectedBooking.status === 'completed' && (
                  <div className="p-5 bg-[#f0f7ff] rounded-2xl border border-[#005396]/20 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#005396]/10">
                      <h4 className="text-sm font-bold text-[#005396] uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#ff8a00] text-xl">star</span>
                        <span>Đánh giá dịch vụ &amp; Kỹ thuật viên</span>
                      </h4>
                      {existingReview ? (
                        <span className="bg-[#e6f4ea] text-[#137333] text-xs font-bold px-3 py-1 rounded-full border border-[#a8dab5] flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          <span>Đã đánh giá (Không thể đánh giá lại)</span>
                        </span>
                      ) : (
                        <span className="bg-[#fff3e0] text-[#e65100] text-xs font-bold px-3 py-1 rounded-full border border-[#ffe0b2]">
                          Chưa đánh giá (1 lần duy nhất)
                        </span>
                      )}
                    </div>

                    {isCheckingReview ? (
                      <div className="text-xs text-[#717783] italic py-2">Đang kiểm tra trạng thái đánh giá...</div>
                    ) : existingReview ? (
                      <div className="bg-white p-4 rounded-xl border border-gray-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#141b2b]">
                            Đánh giá của bạn ({existingReview.date})
                          </span>
                          <div className="flex items-center gap-0.5 text-[#ff8a00]">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={`material-symbols-outlined text-lg ${i < existingReview.rating ? 'fill-1' : 'text-gray-300'}`}>
                                star
                              </span>
                            ))}
                            <span className="text-xs font-bold text-[#141b2b] ml-1">{existingReview.rating}/5 sao</span>
                          </div>
                        </div>
                        <p className="text-xs text-[#414751] italic bg-[#f9f9ff] p-3 rounded-lg border border-gray-100">
                          "{existingReview.comment}"
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-1">
                        <p className="text-xs text-[#414751]">
                          Quý khách vui lòng đánh giá chất lượng dịch vụ và kỹ thuật viên cho đơn hàng đã hoàn thành này. Đánh giá sẽ được tính vào điểm sao trung bình của Kỹ thuật viên.
                        </p>

                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200/80 flex-wrap">
                          <span className="text-xs font-bold text-[#141b2b]">Chọn số sao:</span>
                          <div className="flex items-center gap-1 text-[#ff8a00]">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRatingInput(star)}
                                className="hover:scale-125 transition-transform cursor-pointer p-0.5"
                              >
                                <span className={`material-symbols-outlined text-2xl ${star <= ratingInput ? 'fill-1' : 'text-gray-300'}`}>
                                  star
                                </span>
                              </button>
                            ))}
                          </div>
                          <span className="text-xs font-extrabold text-[#005396]">{ratingInput}/5 sao</span>
                        </div>

                        <div>
                          <textarea
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder="Nhập nhận xét chi tiết của quý khách (ví dụ: KTV làm việc cẩn thận, đúng giờ...)"
                            rows={3}
                            className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:border-[#005396] focus:ring-1 focus:ring-[#005396] outline-none"
                          />
                        </div>

                        {reviewMsg && (
                          <div className={`p-3 rounded-xl text-xs font-bold ${reviewMsg.type === 'success' ? 'bg-[#e6f4ea] text-[#137333] border border-[#a8dab5]' : 'bg-[#fce8e6] text-[#c5221f] border border-[#f5c2c7]'}`}>
                            {reviewMsg.text}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleSubmitReview}
                          disabled={isSubmittingReview}
                          className="bg-[#005396] hover:bg-[#0f6cbd] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-base">send</span>
                          <span>{isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá (1 lần duy nhất)'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Breakdown of Services & Device Quantities */}
                {selectedBooking.items && selectedBooking.items.length > 0 && (
                  <div className="p-4 bg-[#f9f9ff] rounded-2xl border border-[#c1c7d3]/30 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                      <h4 className="text-xs font-bold text-[#141b2b] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#005396] text-base">home_repair_service</span>
                        <span>Danh sách dịch vụ &amp; Số lượng thiết bị ({selectedBooking.items.length})</span>
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {selectedBooking.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-white p-3 rounded-xl border border-gray-200/80">
                          <div>
                            <span className="font-bold text-[#141b2b]">{item.serviceName}</span>
                            <div className="text-[11px] text-[#717783] mt-0.5">
                              Số lượng thiết bị: <strong className="text-[#005396]">{item.quantity} thiết bị</strong> • Đơn giá: {item.unitPrice.toLocaleString('vi-VN')} VNĐ
                            </div>
                          </div>
                          <div className="text-right font-extrabold text-[#005396]">
                            {(item.unitPrice * item.quantity).toLocaleString('vi-VN')} VNĐ
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer Note */}
                {selectedBooking.notes && (
                  <div className="p-4 bg-[#fff9e6] rounded-xl border border-[#ffe082] space-y-1">
                    <span className="text-xs font-bold text-[#b78103] flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">edit_note</span>
                      <span>Ghi chú của khách hàng:</span>
                    </span>
                    <p className="text-xs text-[#5c4300] italic leading-relaxed">{selectedBooking.notes}</p>
                  </div>
                )}

                {/* Appointment Information Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                  <div className="p-4 bg-[#f9f9ff] rounded-xl border border-[#c1c7d3]/30">
                    <span className="text-[#717783] block mb-1">Thời gian đặt đơn</span>
                    <strong className="text-[#005396] block">{formatOrderTime(selectedBooking.createdAt)}</strong>
                    <div className="text-[#717783] text-[11px] mt-0.5">Thời điểm tạo đơn hàng</div>
                  </div>

                  <div className="p-4 bg-[#f9f9ff] rounded-xl border border-[#c1c7d3]/30">
                    <span className="text-[#717783] block mb-1">Khách hàng đặt</span>
                    <strong className="text-[#141b2b]">{selectedBooking.fullName}</strong>
                    <div className="text-[#414751] mt-0.5">{selectedBooking.phone}</div>
                    <div className="text-[#414751]">{selectedBooking.email}</div>
                  </div>

                  <div className="p-4 bg-[#f9f9ff] rounded-xl border border-[#c1c7d3]/30">
                    <span className="text-[#717783] block mb-1">Lịch hẹn &amp; Địa điểm</span>
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

                  {selectedBooking.status === 'verified' ||
                  selectedBooking.status === 'technician_assigned' ||
                  selectedBooking.status === 'in_progress' ? (
                    <div className="bg-[#ffdcc4]/50 text-[#914c00] text-xs font-bold px-4 py-2.5 rounded-xl border border-[#ff8a00]/30 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">info</span>
                      <span>Đơn hàng đã được xác nhận, không thể hủy</span>
                    </div>
                  ) : selectedBooking.status !== 'completed' && selectedBooking.status !== 'cancelled' ? (
                    <button
                      onClick={() => onCancelBooking(selectedBooking.id)}
                      className="bg-[#ffdad6] hover:bg-[#ba1a1a] hover:text-white text-[#93000a] text-xs sm:text-sm font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer w-full sm:w-auto text-center"
                    >
                      Hủy lịch hẹn này
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
