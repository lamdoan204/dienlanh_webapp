import React, { useState, useEffect } from 'react';
import { CustomerReview, ActiveTab } from '../types';
import { fetchReviewsFromSupabase } from '../lib/supabase';

interface ReviewsPageProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ setActiveTab }) => {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  useEffect(() => {
    fetchReviewsFromSupabase().then(data => {
      if (data) setReviews(data);
    });
  }, []);

  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newServiceType, setNewServiceType] = useState('Vệ sinh máy lạnh');
  const [newComment, setNewComment] = useState('');

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    const newRev: CustomerReview = {
      id: `rev-${Date.now()}`,
      author: newAuthor,
      rating: newRating,
      date: new Date().toLocaleDateString('vi-VN'),
      serviceType: newServiceType,
      comment: newComment,
      verified: true,
    };

    setReviews([newRev, ...reviews]);
    setIsWriteModalOpen(false);
    setNewAuthor('');
    setNewComment('');
  };

  const filteredReviews = reviews.filter((r) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === '5') return r.rating >= 5;
    if (selectedFilter === '4') return r.rating >= 4 && r.rating < 5;
    return true;
  });

  return (
    <div className="pt-24 lg:pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title Header */}
      <div className="mb-8 border-b border-[#c1c7d3]/30 pb-6 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-[#e9edff] text-[#005396] font-semibold text-xs rounded-full mb-2">
            Đánh giá thực tế từ khách hàng
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#141b2b]">Đánh Giá Khách Hàng</h1>
          <p className="text-sm text-[#414751] mt-1">
            Xem ý kiến thực tế từ hàng nghìn khách hàng đã trải nghiệm dịch vụ của HVAC Masters.
          </p>
        </div>

        <button
          onClick={() => setIsWriteModalOpen(true)}
          className="bg-[#005396] hover:bg-[#0f6cbd] text-white font-bold px-6 py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-center whitespace-nowrap min-h-[44px]"
        >
          <span className="material-symbols-outlined text-lg">rate_review</span>
          <span>Viết đánh giá</span>
        </button>
      </div>

      {/* Summary Rating Overview */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#c1c7d3]/30 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-[#c1c7d3]/30 pb-6 md:pb-0 md:pr-6">
          <div className="text-5xl font-extrabold text-[#005396]">4.9</div>
          <div className="flex items-center justify-center md:justify-start gap-1 my-2 text-[#ff8a00]">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="material-symbols-outlined fill-1 text-2xl">star</span>
            ))}
          </div>
          <div className="text-xs text-[#414751]">Dựa trên 2.450+ đánh giá đã xác thực</div>
        </div>

        <div className="space-y-2 col-span-2">
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="w-16 font-semibold">5 sao</span>
            <div className="flex-grow bg-[#f1f3ff] h-3 rounded-full overflow-hidden">
              <div className="bg-[#ff8a00] h-full w-[94%]" />
            </div>
            <span className="w-10 text-right text-[#414751]">94%</span>
          </div>
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="w-16 font-semibold">4 sao</span>
            <div className="flex-grow bg-[#f1f3ff] h-3 rounded-full overflow-hidden">
              <div className="bg-[#ff8a00] h-full w-[5%]" />
            </div>
            <span className="w-10 text-right text-[#414751]">5%</span>
          </div>
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="w-16 font-semibold">3 sao trở xuống</span>
            <div className="flex-grow bg-[#f1f3ff] h-3 rounded-full overflow-hidden">
              <div className="bg-[#ff8a00] h-full w-[1%]" />
            </div>
            <span className="w-10 text-right text-[#414751]">1%</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            selectedFilter === 'all'
              ? 'bg-[#005396] text-white'
              : 'bg-white text-[#414751] border border-[#c1c7d3]/40 hover:bg-[#f1f3ff]'
          }`}
        >
          Tất cả ({reviews.length})
        </button>
        <button
          onClick={() => setSelectedFilter('5')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            selectedFilter === '5'
              ? 'bg-[#005396] text-white'
              : 'bg-white text-[#414751] border border-[#c1c7d3]/40 hover:bg-[#f1f3ff]'
          }`}
        >
          5 Sao
        </button>
        <button
          onClick={() => setSelectedFilter('4')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            selectedFilter === '4'
              ? 'bg-[#005396] text-white'
              : 'bg-white text-[#414751] border border-[#c1c7d3]/40 hover:bg-[#f1f3ff]'
          }`}
        >
          4 Sao
        </button>
      </div>

      {/* Review List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-2xl p-6 shadow-sm border border-[#c1c7d3]/30 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#005396] text-white font-bold flex items-center justify-center text-sm">
                    {rev.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#141b2b]">{rev.author}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-[#005396]">
                      <span className="material-symbols-outlined text-sm fill-1">verified</span>
                      <span>Khách hàng đã trải nghiệm</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-[#717783]">{rev.date}</span>
              </div>

              <div className="flex items-center gap-1 text-[#ff8a00] mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`material-symbols-outlined text-lg ${
                      i < Math.floor(rev.rating) ? 'fill-1' : ''
                    }`}
                  >
                    star
                  </span>
                ))}
                <span className="text-xs font-bold text-[#141b2b] ml-1">{rev.rating}</span>
              </div>

              <span className="inline-block bg-[#f1f3ff] text-[#005396] text-xs px-2.5 py-1 rounded-md font-semibold mb-3">
                {rev.serviceType}
              </span>

              <p className="text-xs sm:text-sm text-[#414751] leading-relaxed italic">
                "{rev.comment}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Write Review Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#c1c7d3]/30">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#c1c7d3]/30">
              <h3 className="text-xl font-bold text-[#141b2b]">Viết đánh giá dịch vụ</h3>
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="text-[#414751] hover:text-black p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#414751] block mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Nhập tên của bạn"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#414751] block mb-1">Loại dịch vụ đã dùng</label>
                <select
                  value={newServiceType}
                  onChange={(e) => setNewServiceType(e.target.value)}
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl px-4 py-2.5 text-sm"
                >
                  <option value="Vệ sinh máy lạnh">Vệ sinh máy lạnh</option>
                  <option value="Sửa chữa tủ lạnh">Sửa chữa tủ lạnh</option>
                  <option value="Bảo trì máy giặt">Bảo trì máy giặt</option>
                  <option value="Lắp đặt điều hòa">Lắp đặt điều hòa</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#414751] block mb-1">Đánh giá số sao</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="text-[#ff8a00] p-1 cursor-pointer"
                    >
                      <span className={`material-symbols-outlined text-3xl ${star <= newRating ? 'fill-1' : ''}`}>
                        star
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#414751] block mb-1">Nội dung đánh giá</label>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về thái độ phục vụ và tay nghề kỹ thuật viên..."
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl p-3 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#005396] hover:bg-[#0f6cbd] text-white font-bold py-3 rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Gửi đánh giá
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
