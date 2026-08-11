import React, { useState, useEffect } from 'react';
import { ActiveTab, UserProfile } from '../types';

interface ForumPost {
  id: string;
  title: string;
  category: string;
  author: string;
  authorRole?: string;
  date: string;
  summary: string;
  content: string;
  views: number;
  likes: number;
  commentsCount: number;
  tags: string[];
  comments: ForumComment[];
}

interface ForumComment {
  id: string;
  author: string;
  authorRole?: string;
  date: string;
  content: string;
  likes: number;
}

const INITIAL_POSTS: ForumPost[] = [
  {
    id: 'post-1',
    title: 'Cách khắc phục máy lạnh bị chảy nước ở dàn lạnh nhanh chóng tại nhà',
    category: 'Máy lạnh / Điều hòa',
    author: 'KTV. Nguyễn Văn Nam',
    authorRole: 'Chuyên gia Điện lạnh',
    date: '10/08/2026',
    summary: 'Hiện tượng máy lạnh chảy nước triệt để thường do tắc ống thoát nước, bẩn máng nước hoặc thiếu ga gây đóng tuyết. Dưới đây là hướng dẫn xử lý từng bước.',
    content: `Hiện tượng máy lạnh bị chảy nước dàn lạnh rất phổ biến khi sử dụng liên tục mùa nắng nóng.

### 1. Nguyên nhân chính
* **Máng thoát nước bị bẩn hoặc rêu bám**: Sau thời gian dài không vệ sinh, rêu và bụi bẩn làm tắc lỗ thoát nước.
* **Ống dẫn nước thải bị nứt hoặc gấp khúc**: Khiến nước không chảy ra ngoài mà tràn ngược vào phòng.
* **Máy lạnh bị thiếu ga (xì ga)**: Dàn lạnh bị đóng tuyết, khi ngắt lốc tuyết tan nhanh làm tràn máng hứng.
* **Lắp đặt dàn lạnh không cân bằng**: Làm nước chảy dồn về một bên và văng ra ngoài.

### 2. Các bước tự xử lý ban đầu
1. Tắt aptomat nguồn điện máy lạnh để đảm bảo an toàn.
2. Tháo lưới lọc bụi ra rửa sạch dưới vòi nước.
3. Dùng bơm xịt hoặc dải dây nhỏ thông nhẹ đầu ra ống thoát nước bên ngoài.
4. Nếu vẫn còn chảy nước hoặc có hiện tượng bám tuyết trên lá nhôm, hãy gọi kỹ thuật viên kiểm tra áp suất ga và thông rửa máng nước sâu.`,
    views: 1240,
    likes: 86,
    commentsCount: 3,
    tags: ['chảy nước dàn lạnh', 'điều hòa', 'khắc phục sự cố'],
    comments: [
      {
        id: 'c1',
        author: 'Trần Hoài An',
        date: '10/08/2026',
        content: 'Bài viết rất hữu ích ạ! Nhà mình vừa áp dụng thông ống thoát nước bằng bơm hút là hết chảy nước ngay.',
        likes: 12,
      },
      {
        id: 'c2',
        author: 'Phạm Minh Tuấn',
        date: '11/08/2026',
        content: 'Cho mình hỏi nếu đóng tuyết dàn lạnh thì thường do rò rỉ ga ở đâu ạ?',
        likes: 4,
      },
      {
        id: 'c3',
        author: 'KTV. Nguyễn Văn Nam',
        authorRole: 'Chuyên gia Điện lạnh',
        date: '11/08/2026',
        content: '@Phạm Minh Tuấn: Thường xì ở hở giắc co xáng đồng hoặc thủng mục dàn lạnh do môi trường mặn/ẩm bạn nhé.',
        likes: 8,
      }
    ]
  },
  {
    id: 'post-2',
    title: 'Tủ lạnh bị đóng tuyết dày ở dàn lạnh không ngắt: Nguyên nhân & Bắt bệnh',
    category: 'Tủ lạnh / Tủ đông',
    author: 'KTV. Lê Hoàng Phúc',
    authorRole: 'Kỹ thuật viên cao cấp',
    date: '08/08/2026',
    summary: 'Tủ lạnh quạt vẫn quay nhưng ngăn mát không lạnh, ngăn đá bám tuyết dày đặc. Kiểm tra rơ-le xả đá, sò lạnh và cầu chì nhiệt.',
    content: `Khi tủ lạnh gia đình xuất hiện tình trạng ngăn đá bám tuyết thành tảng dày, quạt gió kêu xè xè và ngăn mát không có hơi lạnh, bộ phận xả đá tự động đang gặp sự cố.

### Các linh kiện cần kiểm tra trong hệ thống xả đá:
1. **Sò lạnh (Rơ-le âm)**: Có nhiệm vụ kẹp vào dàn lạnh, đóng tiếp điểm khi nhiệt độ xuống dưới -4°C để kích hoạt may-so xả đá.
2. **Cầu chì nhiệt (Thermal Fuse)**: Bảo vệ chống cháy nổ khi điện trở xả đá quá nóng. Nếu cầu chì đứt, mạch xả đá sẽ ngưng hoàn toàn.
3. **Thanh may-so xả đá (Heater)**: Đốt nóng chảy tuyết bám trên dàn.
4. **Timer xả đá hoặc Bo mạch điều khiển**: Chuyển chế độ từ làm lạnh sang xả đá định kỳ 8-12 tiếng.

*Khuyên dùng*: Nếu không có đồng hồ vạn năng đo trở kháng, quý khách nên nhờ thợ kỹ thuật thay đúng trị số sò lạnh và cầu chì nhiệt để tránh chập cháy bo mạch.`,
    views: 950,
    likes: 62,
    commentsCount: 2,
    tags: ['tủ lạnh', 'đóng tuyết', 'sò lạnh', 'xả đá'],
    comments: [
      {
        id: 'c4',
        author: 'Đỗ Tiến Dũng',
        date: '09/08/2026',
        content: 'Con tủ Side-by-Side Hitachi nhà tôi cũng dính bệnh này, gọi thợ thay sò lạnh hết 250k chạy êm ru.',
        likes: 5,
      },
      {
        id: 'c5',
        author: 'Nguyễn Thị Hương',
        date: '10/08/2026',
        content: 'Ngăn dưới không mát có phải do tắc đường gió từ ngăn đá xuống không shop?',
        likes: 2,
      }
    ]
  },
  {
    id: 'post-3',
    title: 'Tại sao máy lạnh Inverter vẫn tốn điện? 5 sai lầm người dùng hay mắc phải',
    category: 'Bảo trì & Tiết kiệm điện',
    author: 'Nguyễn Hoàng Bách',
    authorRole: 'Thành viên diễn đàn',
    date: '05/08/2026',
    summary: 'Nhiều gia đình mua máy lạnh Inverter nhưng hóa đơn tiền điện vẫn tăng vọt. Hãy kiểm tra lại công suất máy, nhiệt độ đặt và tần suất bật/tắt.',
    content: `Máy lạnh Inverter chỉ tiết kiệm điện từ 30% - 50% khi hoạt động đúng điều kiện tiêu chuẩn. Dưới đây là 5 sai lầm phổ biến:

1. **Chọn công suất máy lạnh nhỏ hơn diện tích phòng**: Máy phải chạy 100% tải liên tục mà không thể giảm tần số nén.
2. **Bật ngắt máy lạnh liên tục**: Bật 30 phút rồi tắt, khi nóng lại bật lên làm dòng khởi động tăng cao tiêu tốn điện năng gấp bội.
3. **Cài đặt nhiệt độ quá thấp (16°C - 20°C)**: Nên duy trì ở mức 25°C - 27°C kết hợp quạt gió nhẹ.
4. **Không vệ sinh dàn nóng và dàn lạnh định kỳ**: Bụi bẩn cản trở trao đổi nhiệt khiến lốc nén làm việc quá sức.
5. **Thất thoát nhiệt qua khe cửa, tường kính hướng nắng**: Không dùng rèm che nắng mặt trời chiếu trực tiếp.`,
    views: 1820,
    likes: 145,
    commentsCount: 1,
    tags: ['Inverter', 'tiết kiệm điện', 'kinh nghiệm sử dụng'],
    comments: [
      {
        id: 'c6',
        author: 'Vũ Quốc Khánh',
        date: '06/08/2026',
        content: 'Chuẩn luôn! Nhà mình để 26 độ kèm quạt đảo trần vừa mát dịu vừa tiết kiệm hẳn 30% tiền điện mỗi tháng.',
        likes: 18,
      }
    ]
  },
  {
    id: 'post-4',
    title: 'Tổng hợp bảng mã lỗi máy lạnh Inverter phổ biến 2026 (Daikin, Panasonic, LG)',
    category: 'Mã lỗi & Kỹ thuật',
    author: 'KTV. Đặng Anh Khoa',
    authorRole: 'Kỹ thuật viên cao cấp',
    date: '01/08/2026',
    summary: 'Tra cứu nhanh mã lỗi hiển thị trên điều khiển hoặc nhấp nháy đèn LED để chẩn đoán chính xác linh kiện bị hỏng.',
    content: `Khi điều hòa bị sự cố, đèn TIMER sẽ nhấp nháy hoặc màn hình remote hiển thị ký hiệu mã lỗi:

### Bảng mã lỗi Daikin
* **U4**: Lỗi đường truyền tín hiệu giữa dàn nóng và dàn lạnh.
* **E7**: Lỗi quạt dàn nóng bị kẹt hoặc hỏng motor.
* **F3**: Nhiệt độ ống nén quá cao (thiếu ga hoặc tắc ẩm).
* **C9**: Hỏng cảm biến nhiệt độ gió gió nạp dàn lạnh.

### Bảng mã lỗi Panasonic
* **H11**: Lỗi giao tiếp khối trong và ngoài nhà.
* **F95**: Nhiệt độ dàn nóng quá cao (bụi bẩn phủ kín dàn tản nhiệt).
* **H15**: Cảm biến nhiệt độ máy nén bị rò/ngắn mạch.

### Bảng mã lỗi LG Inverter
* **CH05**: Lỗi tín hiệu truyền thông bo mạch.
* **CH21**: Lỗi quá dòng IPM (Bo công suất dàn nóng).
* **CH38**: Máy lạnh thiếu ga hoặc hết ga.`,
    views: 2310,
    likes: 210,
    commentsCount: 0,
    tags: ['mã lỗi điều hòa', 'Daikin', 'Panasonic', 'LG'],
    comments: []
  }
];

interface ForumPageProps {
  setActiveTab: (tab: ActiveTab) => void;
  userProfile?: UserProfile | null;
}

export const ForumPage: React.FC<ForumPageProps> = ({ setActiveTab, userProfile }) => {
  const [posts, setPosts] = useState<ForumPost[]>(() => {
    const saved = localStorage.getItem('hvac_forum_posts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_POSTS;
      }
    }
    return INITIAL_POSTS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);

  // New post modal state
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Máy lạnh / Điều hòa');
  const [newAuthor, setNewAuthor] = useState<string>(
    userProfile ? `${userProfile.last_name || ''} ${userProfile.first_name || ''}`.trim() : ''
  );
  const [newSummary, setNewSummary] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newTags, setNewTags] = useState<string>('điện lạnh, mẹo hay');

  // New comment input
  const [commentText, setCommentText] = useState<string>('');
  const [commentAuthor, setCommentAuthor] = useState<string>(
    userProfile ? `${userProfile.last_name || ''} ${userProfile.first_name || ''}`.trim() : ''
  );

  useEffect(() => {
    localStorage.setItem('hvac_forum_posts', JSON.stringify(posts));
  }, [posts]);

  const categories = [
    'Tất cả',
    'Máy lạnh / Điều hòa',
    'Tủ lạnh / Tủ đông',
    'Máy giặt',
    'Bảo trì & Tiết kiệm điện',
    'Mã lỗi & Kỹ thuật'
  ];

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'Tất cả' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleLikePost = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return { ...p, likes: p.likes + 1 };
        }
        return p;
      })
    );
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) => (prev ? { ...prev, likes: prev.likes + 1 } : null));
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedPost) return;

    const authorName = commentAuthor.trim() || (userProfile ? `${userProfile.last_name} ${userProfile.first_name}`.trim() : 'Khách ghé thăm');
    const newCommentObj: ForumComment = {
      id: `c-${Date.now()}`,
      author: authorName,
      authorRole: userProfile?.role === 'admin' ? 'Quản trị viên' : userProfile?.role === 'worker' ? 'Kỹ thuật viên' : 'Thành viên',
      date: new Date().toLocaleDateString('vi-VN'),
      content: commentText.trim(),
      likes: 0
    };

    const updatedComments = [...selectedPost.comments, newCommentObj];
    const updatedPost = {
      ...selectedPost,
      comments: updatedComments,
      commentsCount: updatedComments.length
    };

    setSelectedPost(updatedPost);
    setPosts((prev) => prev.map((p) => (p.id === selectedPost.id ? updatedPost : p)));
    setCommentText('');
  };

  const handleCreateNewPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const authorName = newAuthor.trim() || (userProfile ? `${userProfile.last_name} ${userProfile.first_name}`.trim() : 'Thành viên');
    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newPostObj: ForumPost = {
      id: `post-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      author: authorName,
      authorRole: userProfile?.role === 'admin' ? 'Quản trị viên' : userProfile?.role === 'worker' ? 'Kỹ thuật viên' : 'Thành viên',
      date: new Date().toLocaleDateString('vi-VN'),
      summary: newSummary.trim() || newContent.trim().substring(0, 120) + '...',
      content: newContent.trim(),
      views: 1,
      likes: 0,
      commentsCount: 0,
      tags: tagsArray.length > 0 ? tagsArray : ['điện lạnh'],
      comments: []
    };

    setPosts([newPostObj, ...posts]);
    setIsNewPostModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewSummary('');
    setNewContent('');
  };

  const handleOpenPostDetail = (post: ForumPost) => {
    // Increment view count
    const updatedPost = { ...post, views: post.views + 1 };
    setSelectedPost(updatedPost);
    setPosts((prev) => prev.map((p) => (p.id === post.id ? updatedPost : p)));
  };

  return (
    <div className="pt-[88px] pb-16 min-h-screen bg-[#f9f9ff]">
      {/* Top Banner / Hero */}
      <section className="bg-gradient-to-r from-[#003868] via-[#005396] to-[#006cb8] text-white py-10 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/20">
              <span className="material-symbols-outlined text-[18px] text-[#ffb800]">forum</span>
              <span>Cộng đồng &amp; Diễn đàn Điện Lạnh Công Thương</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Diễn Đàn Kiến Thức &amp; Hỏi Đáp Điện Lạnh
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Nơi trao đổi kinh nghiệm, tư vấn kỹ thuật, tra cứu mã lỗi điều hòa, tủ lạnh, máy giặt và chia sẻ mẹo tiết kiệm điện từ đội ngũ kỹ thuật viên chuyên nghiệp.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsNewPostModalOpen(true)}
              className="w-full sm:w-auto px-5 py-3 bg-[#ff8a00] hover:bg-[#e07800] text-white rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>Đăng bài viết mới</span>
            </button>
            <button
              onClick={() => setActiveTab('booking')}
              className="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm border border-white/30 backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
              <span>Đặt thợ kiểm tra</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* If viewing post detail */}
        {selectedPost ? (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedPost(null)}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#005396] bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm hover:bg-[#005396] hover:text-white transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Quay lại danh sách bài viết</span>
            </button>

            <article className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-sm space-y-6">
              <div className="space-y-3 pb-6 border-b border-gray-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-[#005396]/10 text-[#005396] text-xs font-bold rounded-full">
                    {selectedPost.category}
                  </span>
                  <span className="text-xs text-[#717783]">{selectedPost.date}</span>
                  <span className="text-xs text-[#717783]">| {selectedPost.views} lượt xem</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-[#141b2b] leading-snug">
                  {selectedPost.title}
                </h2>

                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-full bg-[#005396] text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                    {selectedPost.author.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#141b2b] flex items-center gap-1.5">
                      <span>{selectedPost.author}</span>
                      {selectedPost.authorRole && (
                        <span className="px-2 py-0.5 bg-blue-50 text-[#005396] text-[10px] font-bold rounded border border-blue-100">
                          {selectedPost.authorRole}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#717783]">Tác giả bài viết</div>
                  </div>
                </div>
              </div>

              {/* Main Markdown Content */}
              <div className="prose prose-blue max-w-none text-sm sm:text-base text-[#2d3748] leading-relaxed whitespace-pre-line space-y-4">
                {selectedPost.content}
              </div>

              {/* Tags & Actions */}
              <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-[#717783]">Thẻ:</span>
                  {selectedPost.tags.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-gray-100 text-[#414751] text-xs rounded-lg font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleLikePost(selectedPost.id)}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-[#d97706] border border-amber-200 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                  <span>Hữu ích ({selectedPost.likes})</span>
                </button>
              </div>
            </article>

            {/* Comments Section */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-[#141b2b] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#005396]">chat_bubble</span>
                <span>Bình luận &amp; Thảo luận ({selectedPost.comments.length})</span>
              </h3>

              {/* Comments List */}
              <div className="space-y-4">
                {selectedPost.comments.length === 0 ? (
                  <p className="text-xs text-[#717783] italic bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                    Chưa có bình luận nào. Hãy là người đầu tiên đặt câu hỏi hoặc đóng góp ý kiến!
                  </p>
                ) : (
                  selectedPost.comments.map((comment) => (
                    <div key={comment.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200/60 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-[#141b2b] font-bold text-xs flex items-center justify-center">
                            {comment.author.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-[#141b2b]">{comment.author}</span>
                          {comment.authorRole && (
                            <span className="text-[10px] bg-blue-100 text-[#005396] px-2 py-0.5 rounded font-semibold">
                              {comment.authorRole}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#717783]">{comment.date}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#414751] leading-relaxed pl-9">
                        {comment.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input Form */}
              <form onSubmit={handleAddComment} className="pt-4 border-t border-gray-100 space-y-3">
                <h4 className="text-xs font-bold text-[#141b2b] uppercase tracking-wider">Thêm bình luận của bạn</h4>
                
                {!userProfile && (
                  <div className="max-w-xs">
                    <input
                      type="text"
                      placeholder="Tên của bạn..."
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005396]"
                    />
                  </div>
                )}

                <textarea
                  rows={3}
                  required
                  placeholder="Viết thắc mắc hoặc ý kiến thảo luận của bạn tại đây..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-3 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005396]"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#005396] hover:bg-[#003e73] text-white rounded-xl font-bold text-xs shadow flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    <span>Gửi bình luận</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Forum Articles List View */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filter */}
            <aside className="lg:col-span-1 space-y-6">
              {/* Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm space-y-3">
                <label className="text-xs font-bold text-[#141b2b] uppercase tracking-wider block">
                  Tìm kiếm bài viết
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-lg">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Máy lạnh, tủ lạnh, mã lỗi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005396]"
                  />
                </div>
              </div>

              {/* Categories Navigation */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-[#141b2b] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#005396] text-[18px]">category</span>
                  <span>Chủ đề thảo luận</span>
                </h3>

                <div className="flex flex-col gap-1">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#005396] text-white shadow-sm'
                            : 'text-[#414751] hover:bg-gray-100 hover:text-[#005396]'
                        }`}
                      >
                        <span>{cat}</span>
                        {isSelected && (
                          <span className="material-symbols-outlined text-sm">chevron_right</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Need Quick Technician Box */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200 space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#ff8a00] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined">build</span>
                </div>
                <h4 className="font-bold text-sm text-[#141b2b]">Cần thợ kiểm tra tận nơi?</h4>
                <p className="text-xs text-[#414751] leading-relaxed">
                  Đội ngũ kỹ thuật viên Công Thương sẵn sàng hỗ trợ sửa chữa và bảo trì tại nhà trong vòng 30 phút.
                </p>
                <button
                  onClick={() => setActiveTab('booking')}
                  className="w-full py-2.5 bg-[#005396] hover:bg-[#003e73] text-white text-xs font-bold rounded-xl transition-all shadow cursor-pointer"
                >
                  Đặt lịch kiểm tra ngay
                </button>
              </div>
            </aside>

            {/* Posts Grid / List */}
            <main className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
                <h2 className="text-base sm:text-lg font-bold text-[#141b2b]">
                  {selectedCategory === 'Tất cả' ? 'Tất cả bài viết & thảo luận' : `Chủ đề: ${selectedCategory}`}
                  <span className="text-xs text-[#717783] font-normal ml-2">({filteredPosts.length} bài)</span>
                </h2>

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-[#005396] hover:underline font-semibold"
                  >
                    Xóa tìm kiếm
                  </button>
                )}
              </div>

              {filteredPosts.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-gray-200/80 space-y-4">
                  <span className="material-symbols-outlined text-4xl text-gray-300">article</span>
                  <p className="text-sm text-[#717783]">Không tìm thấy bài viết nào phù hợp.</p>
                  <button
                    onClick={() => setIsNewPostModalOpen(true)}
                    className="px-4 py-2 bg-[#005396] text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Tạo bài viết mới
                  </button>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => handleOpenPostDetail(post)}
                    className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-[#005396]/40 transition-all cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="px-2.5 py-0.5 bg-[#005396]/10 text-[#005396] text-[11px] font-bold rounded-full">
                        {post.category}
                      </span>
                      <span className="text-[11px] text-[#717783]">{post.date}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#141b2b] group-hover:text-[#005396] transition-colors leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#414751] line-clamp-2 leading-relaxed">
                      {post.summary}
                    </p>

                    <div className="pt-2 flex items-center justify-between flex-wrap gap-3 text-xs text-[#717783] border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#141b2b]">{post.author}</span>
                        {post.authorRole && (
                          <span className="px-1.5 py-0.2 bg-blue-50 text-[#005396] text-[10px] font-bold rounded">
                            {post.authorRole}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          {post.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">chat</span>
                          {post.commentsCount}
                        </span>
                        <button
                          onClick={(e) => handleLikePost(post.id, e)}
                          className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-bold"
                        >
                          <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                          {post.likes}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </main>
          </div>
        )}
      </div>

      {/* Modal: Create New Forum Post */}
      {isNewPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-[#141b2b] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#005396]">edit_note</span>
                <span>Đăng bài viết mới lên Diễn Đàn</span>
              </h3>
              <button
                onClick={() => setIsNewPostModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNewPost} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#141b2b] block mb-1">Tiêu đề bài viết (*)</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyên nhân tủ lạnh chạy liên tục không ngắt..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005396]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#141b2b] block mb-1">Chủ đề (*)</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005396]"
                  >
                    {categories.filter((c) => c !== 'Tất cả').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#141b2b] block mb-1">Tên tác giả</label>
                  <input
                    type="text"
                    placeholder="Tên của bạn..."
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005396]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#141b2b] block mb-1">Tóm tắt ngắn</label>
                <input
                  type="text"
                  placeholder="Mô tả ngắn gọn về vấn đề..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005396]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#141b2b] block mb-1">Nội dung bài viết chi tiết (*)</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Trình bày chi tiết tình trạng máy, các dấu hiệu nhận biết hoặc kinh nghiệm xử lý..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-3 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005396]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#141b2b] block mb-1">Thẻ từ khóa (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  placeholder="điều hòa, tủ lạnh, mã lỗi, chảy nước"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005396]"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewPostModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-[#414751] rounded-xl text-xs font-bold hover:bg-gray-200"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#005396] hover:bg-[#003e73] text-white rounded-xl text-xs font-bold shadow"
                >
                  Đăng bài ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
