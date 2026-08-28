import React, { useState, useEffect } from 'react';
import { BookingRecord, ActiveTab, CustomerReview, UserProfile, PurchasingOrderRecord } from '../types';
import { DEVICE_OPTIONS, SERVICE_PACKAGES } from '../data/mockData';
import { commonService } from '../services/commonService';
import { purchasingService } from '../services/purchasingService';

interface HistoryPageProps {
  bookings: BookingRecord[];
  setActiveTab: (tab: ActiveTab) => void;
  onCancelBooking: (id: string) => void;
  userProfile?: UserProfile | null;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  bookings,
  setActiveTab,
  onCancelBooking,
  userProfile,
}) => {
  // Main sub-tab: 'service' (Đơn dịch vụ điện lạnh) | 'purchasing' (Đơn thu mua)
  const [historyTab, setHistoryTab] = useState<'service' | 'purchasing'>('service');

  // Service bookings state
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    bookings.length > 0 ? bookings[0].id : null
  );

  // Purchasing orders state
  const [purchasingOrders, setPurchasingOrders] = useState<PurchasingOrderRecord[]>([]);
  const [isPurchasingLoading, setIsPurchasingLoading] = useState<boolean>(false);
  const [selectedPurchasingId, setSelectedPurchasingId] = useState<number | null>(null);
  const [previewPurchasingImage, setPreviewPurchasingImage] = useState<string | null>(null);

  // Reviews state
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>('');
  const [existingReview, setExistingReview] = useState<CustomerReview | null>(null);
  const [isCheckingReview, setIsCheckingReview] = useState<boolean>(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewMsg, setReviewMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId) || bookings[0] || null;

  // Load customer purchasing orders
  useEffect(() => {
    if (!userProfile) {
      setPurchasingOrders([]);
      return;
    }
    const identifier = userProfile?.phone_number || userProfile?.email || '';
    if (!identifier) {
      setPurchasingOrders([]);
      return;
    }
    setIsPurchasingLoading(true);
    purchasingService.fetchCustomerPurchasingOrders(identifier).then((orders) => {
      setPurchasingOrders(orders);
      if (orders.length > 0) {
        setSelectedPurchasingId(orders[0].id);
      }
      setIsPurchasingLoading(false);
    });
  }, [userProfile]);

  const selectedPurchasing =
    purchasingOrders.find((p) => p.id === selectedPurchasingId) || purchasingOrders[0] || null;

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
      workerId: selectedBooking.workerId || selectedBooking.technicianId,
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

  const getPurchasingStatusBadge = (status: PurchasingOrderRecord['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="bg-[#e9edff] text-[#005396] text-xs px-3 py-1 rounded-full font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#005396] animate-pulse shrink-0" />
            Chờ thẩm định &amp; xác nhận
          </span>
        );
      case 'verified':
        return (
          <span className="bg-[#ffdcc4] text-[#914c00] text-xs px-3 py-1 rounded-full font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#ff8a00] animate-pulse shrink-0" />
            Đã thẩm định giá
          </span>
        );
      case 'completed':
        return (
          <span className="bg-[#e1f8eb] text-[#10b981] text-xs px-3 py-1 rounded-full font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0">
            <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
            Đã thu mua &amp; thanh toán
          </span>
        );
      case 'canceled':
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

  const getPurchasingStepIndex = (status: PurchasingOrderRecord['status']) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'verified':
        return 2;
      case 'completed':
        return 3;
      default:
        return 0;
    }
  };

  if (!userProfile) {
    return (
      <div className="pt-36 sm:pt-38 lg:pt-36 pb-16 max-w-xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-[#c1c7d3]/40 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-[#e9edff] text-[#005396] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#005396]/20">
            <span className="material-symbols-outlined text-3xl">history_toggle_off</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#141b2b] mb-2">
            Vui lòng đăng nhập
          </h2>
          <p className="text-xs sm:text-sm text-[#414751] mb-6 leading-relaxed">
            Bạn cần đăng nhập tài khoản để theo dõi lịch sử đặt lịch dịch vụ, trạng thái phân công kỹ thuật viên và các đơn yêu cầu thu mua thiết bị.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setActiveTab('auth')}
              className="bg-[#005396] hover:bg-[#003868] text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">login</span>
              <span>Đăng nhập ngay</span>
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className="bg-[#f1f3ff] hover:bg-[#e2e7ff] text-[#005396] font-bold py-3 px-6 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Về trang chủ</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-36 sm:pt-38 lg:pt-36 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title Header */}
      <div className="mb-6 border-b border-[#c1c7d3]/30 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#141b2b]">Lịch sử đơn hàng &amp; Trạng thái</h1>
          <p className="text-sm text-[#414751] mt-1">
            Theo dõi tiến độ dịch vụ sửa chữa/bảo trì và các yêu cầu thu mua thiết bị cũ của bạn.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('purchasing')}
            className="bg-[#e9edff] hover:bg-[#005396] text-[#005396] hover:text-white font-bold px-4 py-2.5 rounded-xl border border-[#005396]/20 transition-all flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">recycling</span>
            <span>Gửi đơn thu mua</span>
          </button>
          <button
            onClick={() => setActiveTab('booking')}
            className="bg-[#005396] hover:bg-[#0f6cbd] text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>Đặt dịch vụ mới</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Switcher: Đơn dịch vụ điện lạnh vs Đơn thu mua thiết bị */}
      <div className="flex items-center gap-2 mb-8 bg-[#f1f3ff] p-1.5 rounded-2xl w-fit border border-[#c1c7d3]/40">
        <button
          onClick={() => setHistoryTab('service')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            historyTab === 'service'
              ? 'bg-[#005396] text-white shadow-md'
              : 'text-[#414751] hover:text-[#005396]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">build</span>
          <span>Dịch vụ điện lạnh ({bookings.length})</span>
        </button>

        <button
          onClick={() => setHistoryTab('purchasing')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            historyTab === 'purchasing'
              ? 'bg-[#005396] text-white shadow-md'
              : 'text-[#414751] hover:text-[#005396]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">recycling</span>
          <span>Dịch vụ thu mua ({purchasingOrders.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SERVICE ORDERS (DỊCH VỤ ĐIỆN LẠNH) */}
      {/* ========================================================================= */}
      {historyTab === 'service' && (
        <>
          {bookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#c1c7d3]/30 shadow-sm max-w-xl mx-auto my-8">
              <span className="material-symbols-outlined text-6xl text-[#c1c7d3] mb-4">history_toggle_off</span>
              <h3 className="text-xl font-bold text-[#141b2b] mb-2">Chưa có lịch hẹn dịch vụ nào</h3>
              <p className="text-sm text-[#414751] mb-6">
                Bạn chưa thực hiện đặt lịch dịch vụ nào. Hãy thử đặt lịch ngay hôm nay để nhận báo giá minh bạch!
              </p>
              <button
                onClick={() => setActiveTab('booking')}
                className="bg-[#005396] hover:bg-[#003c6e] text-white font-bold px-8 py-3 rounded-xl shadow-md transition-colors cursor-pointer"
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
                            <span className="material-symbols-outlined text-sm shrink-0">edit_note</span>
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
                            Thời gian đặt: {formatOrderTime(selectedBooking.createdAt)}
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
                            Trạng thái "Đã hủy" không hiển thị trên thanh tiến độ thực hiện. Bạn có thể tạo đơn mới nếu cần.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#f9f9ff] p-6 rounded-2xl border border-[#c1c7d3]/30">
                        <h4 className="text-xs font-bold text-[#414751] uppercase tracking-wider mb-6">
                          Tiến độ thực hiện theo thời gian thực
                        </h4>

                        <div className="relative flex items-center justify-between">
                          <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#c1c7d3]/40 -translate-y-1/2 z-0" />
                          <div
                            className="absolute top-1/2 left-0 h-1 bg-[#005396] -translate-y-1/2 z-0 transition-all duration-500"
                            style={{
                              width: `${((getStatusStepIndex(selectedBooking.status) - 1) / 2) * 100}%`,
                            }}
                          />

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

                    {/* Booking Details Card */}
                    <div className="bg-[#f9f9ff] p-5 rounded-2xl border border-[#c1c7d3]/30 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-[#717783] block">Khách hàng:</span>
                          <strong className="text-[#141b2b] text-sm">
                            {selectedBooking.fullName || 'Khách hàng'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#717783] block">Số điện thoại:</span>
                          <strong className="text-[#141b2b] text-sm">{selectedBooking.phone}</strong>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-[#717783] block">Địa chỉ thực hiện:</span>
                          <strong className="text-[#141b2b]">{selectedBooking.address}</strong>
                        </div>
                        <div>
                          <span className="text-[#717783] block">Thời gian hẹn:</span>
                          <strong className="text-[#005396] text-sm">
                            {selectedBooking.selectedDate} ({selectedBooking.selectedTimeSlot})
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#717783] block">Tổng chi phí dự kiến:</span>
                          <strong className="text-[#ba1a1a] text-base">
                            {Number(selectedBooking.estimatedCost || 0).toLocaleString('vi-VN')} VNĐ
                          </strong>
                        </div>
                      </div>

                      {selectedBooking.notes && (
                        <div className="pt-2 border-t border-[#c1c7d3]/20 text-xs">
                          <span className="text-[#717783] block">Ghi chú:</span>
                          <p className="text-[#141b2b] italic">{selectedBooking.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Service Items Table */}
                    {selectedBooking.items && selectedBooking.items.length > 0 && (
                      <div className="bg-[#f9f9ff] p-5 rounded-2xl border border-[#c1c7d3]/30 space-y-3">
                        <h4 className="font-bold text-[#141b2b] text-xs flex items-center gap-1.5 uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[18px] text-[#005396]">build</span>
                          Danh sách dịch vụ đặt hẹn ({selectedBooking.items.length})
                        </h4>
                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-[#f1f3ff] border-b border-gray-200">
                                <th className="p-2.5 font-bold text-[#414751]">Tên dịch vụ</th>
                                <th className="p-2.5 font-bold text-[#414751] text-center">Số lượng</th>
                                <th className="p-2.5 font-bold text-[#414751] text-right">Đơn giá</th>
                                <th className="p-2.5 font-bold text-[#414751] text-right">Thành tiền</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {selectedBooking.items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="p-2.5">
                                    <span className="font-bold text-[#141b2b]">{item.serviceName}</span>
                                    {item.deviceType && (
                                      <span className="block text-[11px] text-[#717783]">Loại: {item.deviceType}</span>
                                    )}
                                  </td>
                                  <td className="p-2.5 text-center font-bold text-[#141b2b]">{item.quantity}</td>
                                  <td className="p-2.5 text-right text-gray-700">{Number(item.unitPrice || 0).toLocaleString('vi-VN')} đ</td>
                                  <td className="p-2.5 text-right font-bold text-[#005396]">{Number(item.subTotalPrice || 0).toLocaleString('vi-VN')} đ</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Order Supplies Section for Customer */}
                    {selectedBooking.orderSupplies && selectedBooking.orderSupplies.length > 0 && (
                      <div className="bg-[#fffdf5] p-5 rounded-2xl border border-amber-200 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[20px] text-amber-700">inventory_2</span>
                            Vật tư &amp; Linh kiện bổ sung ({selectedBooking.orderSupplies.length})
                          </h4>
                          <span className="text-[11px] text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full font-medium">
                            Đã được kỹ thuật viên xác nhận &amp; cập nhật
                          </span>
                        </div>

                        <div className="border border-amber-200/80 rounded-xl overflow-hidden bg-white">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-amber-50 border-b border-amber-200 text-amber-950">
                                <th className="p-2.5 font-bold w-10 text-center">STT</th>
                                <th className="p-2.5 font-bold">Vật tư / Linh kiện</th>
                                <th className="p-2.5 font-bold text-center">Số lượng</th>
                                <th className="p-2.5 font-bold text-right">Đơn giá</th>
                                <th className="p-2.5 font-bold text-right">Số tiền</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-100/60">
                              {selectedBooking.orderSupplies.map((sup, idx) => {
                                const unitP = sup.unit_price ?? (sup.supply?.unit_price ? Number(sup.supply.unit_price) : 0);
                                return (
                                  <tr key={idx} className="hover:bg-amber-50/40">
                                    <td className="p-2.5 text-center font-bold text-amber-800">{idx + 1}</td>
                                    <td className="p-2.5">
                                      <span className="font-bold text-[#141b2b] block">{sup.supply_name || 'Vật tư'}</span>
                                      <span className="text-[11px] text-gray-500">
                                        {sup.supply_device ? `Thiết bị: ${sup.supply_device}` : ''}{' '}
                                        {sup.supply_type ? `| Quy cách: ${sup.supply_type}` : ''}
                                      </span>
                                    </td>
                                    <td className="p-2.5 text-center font-bold text-[#141b2b]">
                                      {sup.quantity} {sup.supply_unit || 'bộ'}
                                    </td>
                                    <td className="p-2.5 text-right text-gray-600">
                                      {unitP > 0 ? `${unitP.toLocaleString('vi-VN')} đ` : '---'}
                                    </td>
                                    <td className="p-2.5 text-right font-bold text-[#005396]">
                                      {Number(sup.price || 0).toLocaleString('vi-VN')} đ
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              <tr className="bg-amber-50/80 border-t border-amber-200 text-xs">
                                <td colSpan={4} className="p-2.5 text-right font-bold text-amber-900">
                                  Tổng chi phí vật tư:
                                </td>
                                <td className="p-2.5 text-right font-bold text-[#005396]">
                                  {selectedBooking.orderSupplies
                                    .reduce((sum, s) => sum + Number(s.price || 0), 0)
                                    .toLocaleString('vi-VN')} đ
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Review section if completed */}
                    {selectedBooking.status === 'completed' && (
                      <div className="pt-4 border-t border-[#c1c7d3]/30">
                        <h4 className="font-bold text-sm text-[#141b2b] mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#ff8a00]">star</span>
                          <span>Đánh giá dịch vụ</span>
                        </h4>

                        {isCheckingReview ? (
                          <div className="text-xs text-[#717783]">Đang kiểm tra đánh giá...</div>
                        ) : existingReview ? (
                          <div className="p-4 bg-[#f0fdf4] border border-[#22c55e]/30 rounded-xl text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#16a34a]">Bạn đã đánh giá dịch vụ này</span>
                              <div className="flex text-[#ff8a00]">
                                {Array.from({ length: existingReview.rating || 5 }).map((_, i) => (
                                  <span key={i} className="material-symbols-outlined text-sm fill-1">
                                    star
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="text-[#141b2b] italic">"{existingReview.comment}"</p>
                          </div>
                        ) : (
                          <div className="p-4 bg-[#f8f9ff] border border-[#005396]/20 rounded-xl space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#414751]">Số sao hài lòng:</span>
                              <div className="flex gap-1 text-[#ff8a00]">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => setRatingInput(s)}
                                    className="cursor-pointer"
                                  >
                                    <span
                                      className={`material-symbols-outlined text-xl ${
                                        s <= ratingInput ? 'fill-1' : ''
                                      }`}
                                    >
                                      star
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <textarea
                              rows={2}
                              value={commentInput}
                              onChange={(e) => setCommentInput(e.target.value)}
                              placeholder="Nhập cảm nhận của bạn về kỹ thuật viên và chất lượng dịch vụ..."
                              className="w-full p-2.5 bg-white border border-[#c1c7d3] rounded-xl text-xs outline-hidden focus:border-[#005396]"
                            />
                            {reviewMsg && (
                              <div
                                className={`text-xs ${
                                  reviewMsg.type === 'success' ? 'text-[#16a34a]' : 'text-[#ba1a1a]'
                                } font-bold`}
                              >
                                {reviewMsg.text}
                              </div>
                            )}
                            <button
                              type="button"
                              disabled={isSubmittingReview}
                              onClick={handleSubmitReview}
                              className="px-4 py-2 bg-[#005396] text-white rounded-lg font-bold text-xs hover:bg-[#003c6e] cursor-pointer"
                            >
                              {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cancel booking option if pending */}
                    {selectedBooking.status === 'pending' && (
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => {
                            if (confirm('Bạn có chắc chắn muốn hủy yêu cầu đặt lịch này không?')) {
                              onCancelBooking(selectedBooking.id);
                            }
                          }}
                          className="px-4 py-2 text-xs font-bold text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-xl transition-all cursor-pointer border border-[#ba1a1a]/30"
                        >
                          Hủy yêu cầu đặt lịch này
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PURCHASING ORDERS (DỊCH VỤ THU MUA) */}
      {/* ========================================================================= */}
      {historyTab === 'purchasing' && (
        <>
          {isPurchasingLoading ? (
            <div className="py-16 text-center text-sm text-[#717783]">
              <span className="material-symbols-outlined text-4xl text-[#005396] animate-spin mb-2 block">
                progress_activity
              </span>
              Đang tải danh sách đơn thu mua...
            </div>
          ) : purchasingOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#c1c7d3]/30 shadow-sm max-w-xl mx-auto my-8">
              <span className="material-symbols-outlined text-6xl text-[#c1c7d3] mb-4">recycling</span>
              <h3 className="text-xl font-bold text-[#141b2b] mb-2">Chưa có đơn thu mua nào</h3>
              <p className="text-sm text-[#414751] mb-6">
                Bạn chưa gửi yêu cầu thu mua thanh lý thiết bị cũ nào (tủ lạnh, máy giặt, máy lạnh).
              </p>
              <button
                onClick={() => setActiveTab('purchasing')}
                className="bg-[#005396] hover:bg-[#003c6e] text-white font-bold px-8 py-3 rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Gửi đơn thu mua ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Purchasing List Cards */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-sm font-bold text-[#414751] uppercase tracking-wider">
                  Đơn thu mua ({purchasingOrders.length})
                </h3>

                {purchasingOrders.map((order) => {
                  const isSelected = selectedPurchasing?.id === order.id;
                  const totalItemsCount = order.details.reduce((s, d) => s + d.quantity, 0);

                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedPurchasingId(order.id)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-[#005396] bg-white shadow-md ring-2 ring-[#005396]/20'
                          : 'border-[#c1c7d3]/50 bg-white/80 hover:bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-black text-[#005396] bg-[#005396]/10 px-2.5 py-0.5 rounded-md">
                          {order.orderCode}
                        </span>
                        {getPurchasingStatusBadge(order.status)}
                      </div>

                      <h4 className="font-extrabold text-base text-[#141b2b] mt-1">
                        Thu mua {totalItemsCount} thiết bị (
                        {order.details.map((d) => d.device).join(', ')})
                      </h4>

                      <div className="text-xs text-[#414751] mt-2 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[#717783] text-[11px]">
                          <span className="material-symbols-outlined text-sm text-[#005396]">schedule</span>
                          <span>
                            Gửi lúc: <strong className="text-[#141b2b]">{formatOrderTime(order.create_at)}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-[#005396]">event</span>
                          <span>
                            Hẹn thẩm định: <strong>{order.appointment_time || 'Chưa định ngày'}</strong> (
                            {order.timeSlotStr})
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-[#005396]">payments</span>
                          <span>
                            {order.totalVerifiedPrice > 0 ? (
                              <>
                                Giá thẩm định:{' '}
                                <strong className="text-[#16a34a]">
                                  {order.totalVerifiedPrice.toLocaleString('vi-VN')} đ
                                </strong>
                              </>
                            ) : (
                              <>
                                Giá thu mua:{' '}
                                <strong className="text-[#005396]">Chờ thẩm định</strong>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Purchasing Order Details Panel */}
              {selectedPurchasing && (
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-[#c1c7d3]/30 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#c1c7d3]/30">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#005396] uppercase tracking-wider block">
                            Chi tiết đơn thu mua
                          </span>
                          <span className="text-xs font-black text-[#005396] bg-[#005396]/10 px-2.5 py-0.5 rounded-md">
                            {selectedPurchasing.orderCode}
                          </span>
                        </div>
                        <h2 className="text-2xl font-black text-[#141b2b] mt-1">
                          Yêu cầu thanh lý {selectedPurchasing.details.reduce((s, d) => s + d.quantity, 0)} thiết bị
                        </h2>
                      </div>
                      <div>{getPurchasingStatusBadge(selectedPurchasing.status)}</div>
                    </div>

                    {/* Status Stepper Progress */}
                    {selectedPurchasing.status === 'canceled' ? (
                      <div className="bg-[#ffdad6]/40 p-5 rounded-2xl border border-[#ba1a1a]/30 flex items-center gap-3">
                        <span className="material-symbols-outlined text-2xl text-[#ba1a1a]">cancel</span>
                        <div>
                          <h4 className="font-bold text-sm text-[#ba1a1a]">Đơn thu mua đã hủy</h4>
                          <p className="text-xs text-[#521414] mt-0.5">
                            Yêu cầu thu mua này đã được hủy. Bạn có thể tạo yêu cầu thu mua mới bất cứ lúc nào.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#f9f9ff] p-6 rounded-2xl border border-[#c1c7d3]/30">
                        <h4 className="text-xs font-bold text-[#414751] uppercase tracking-wider mb-6">
                          Tiến trình xử lý thu mua
                        </h4>

                        <div className="relative flex items-center justify-between">
                          <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#c1c7d3]/40 -translate-y-1/2 z-0" />
                          <div
                            className="absolute top-1/2 left-0 h-1 bg-[#005396] -translate-y-1/2 z-0 transition-all duration-500"
                            style={{
                              width: `${
                                ((getPurchasingStepIndex(selectedPurchasing.status) - 1) / 2) * 100
                              }%`,
                            }}
                          />

                          {[
                            { step: 1, label: 'Tiếp nhận đơn', icon: 'assignment' },
                            { step: 2, label: 'Thẩm định giá', icon: 'price_check' },
                            { step: 3, label: 'Hoàn tất & Nhận tiền', icon: 'payments' },
                          ].map((s) => {
                            const currentStep = getPurchasingStepIndex(selectedPurchasing.status);
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
                                  className={`text-[11px] sm:text-xs font-bold mt-2 text-center max-w-[90px] ${
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

                    {/* Breakdown of Devices */}
                    <div>
                      <h4 className="font-extrabold text-sm text-[#141b2b] uppercase tracking-wider mb-3">
                        Danh sách thiết bị thanh lý ({selectedPurchasing.details.length} loại)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedPurchasing.details.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="p-4 rounded-xl border border-[#c1c7d3]/50 bg-[#f9f9ff] space-y-2"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-sm text-[#005396] flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base">
                                  {item.device.includes('lạnh')
                                    ? 'mode_fan'
                                    : item.device.includes('giặt')
                                    ? 'local_laundry_service'
                                    : 'kitchen'}
                                </span>
                                {item.device}
                              </span>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-[#c1c7d3]">
                                SL: {item.quantity}
                              </span>
                            </div>

                            <div className="text-xs space-y-1">
                              {item.verified_price !== null && Number(item.verified_price) > 0 ? (
                                <div className="flex justify-between text-[#16a34a] font-bold">
                                  <span>Giá thẩm định:</span>
                                  <span>{Number(item.verified_price).toLocaleString('vi-VN')} đ</span>
                                </div>
                              ) : (
                                <div className="flex justify-between text-[#005396] font-medium">
                                  <span>Giá thu mua:</span>
                                  <span className="italic">Chờ thẩm định</span>
                                </div>
                              )}
                            </div>

                            {item.note && (
                              <div className="p-2 bg-white rounded-lg text-[11px] text-[#414751] border border-[#c1c7d3]/30">
                                <strong>Mô tả tình trạng:</strong> {item.note}
                              </div>
                            )}

                            {item.previewUrls && item.previewUrls.length > 0 && (
                              <div className="pt-1">
                                <span className="text-[10px] font-bold text-[#005396] block mb-1">
                                  Hình ảnh đã tải ({item.previewUrls.length}):
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {item.previewUrls.map((url, imgIdx) => (
                                    <button
                                      key={imgIdx}
                                      type="button"
                                      onClick={() => setPreviewPurchasingImage(url)}
                                      className="relative group w-12 h-12 rounded-lg overflow-hidden border border-[#c1c7d3] hover:border-[#005396] shadow-2xs transition-all cursor-pointer"
                                      title="Xem ảnh phóng to"
                                    >
                                      <img
                                        src={url}
                                        alt={`Ảnh thiết bị ${imgIdx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                      />
                                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white text-[12px] opacity-0 group-hover:opacity-100">zoom_in</span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="bg-[#f9f9ff] p-5 rounded-2xl border border-[#c1c7d3]/30 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-[#717783] block">Khách hàng:</span>
                          <strong className="text-[#141b2b] text-sm">{selectedPurchasing.customerName}</strong>
                        </div>
                        <div>
                          <span className="text-[#717783] block">Số điện thoại:</span>
                          <strong className="text-[#141b2b] text-sm">{selectedPurchasing.customerPhone}</strong>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-[#717783] block">Địa chỉ thu mua tận nơi:</span>
                          <strong className="text-[#141b2b]">{selectedPurchasing.address}</strong>
                          {selectedPurchasing.addressNote && (
                            <span className="text-[#005396] block mt-0.5 italic">
                              Chỉ dẫn: {selectedPurchasing.addressNote}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-[#717783] block">Lịch hẹn thu mua:</span>
                          <strong className="text-[#005396] text-sm">
                            {selectedPurchasing.appointment_time || 'Chưa định ngày'} (
                            {selectedPurchasing.timeSlotStr})
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#717783] block">Tổng giá thu mua:</span>
                          {selectedPurchasing.totalVerifiedPrice > 0 ? (
                            <strong className="text-[#16a34a] text-base">
                              {selectedPurchasing.totalVerifiedPrice.toLocaleString('vi-VN')} VNĐ
                            </strong>
                          ) : (
                            <strong className="text-[#005396] text-xs italic">
                              Chờ kỹ thuật viên thẩm định & báo giá
                            </strong>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Purchasing Image Lightbox Viewer */}
      {previewPurchasingImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewPurchasingImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewPurchasingImage(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Đóng xem ảnh"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <img
              src={previewPurchasingImage}
              alt="Ảnh thiết bị chi tiết"
              className="max-h-[85vh] max-w-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
