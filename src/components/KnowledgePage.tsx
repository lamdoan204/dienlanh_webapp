import React, { useState, useEffect, useMemo } from 'react';
import { ActiveTab, ArticleItem } from '../types';
import { articleService } from '../services/articleService';

interface KnowledgePageProps {
  setActiveTab: (tab: ActiveTab) => void;
}

const CATEGORIES = [
  'Tất cả',
  'Kiến thức',
  'Hướng dẫn sử dụng',
  'Mẹo sử dụng',
  'Vệ sinh bảo dưỡng'
];

export const KnowledgePage: React.FC<KnowledgePageProps> = ({ setActiveTab }) => {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<ArticleItem | null>(null);

  // Sync state from current URL
  const syncFromURL = async () => {
    setIsLoading(true);
    const path = window.location.pathname;
    const all = await articleService.fetchArticles({ publishedOnly: true });
    setArticles(all);

    // Extract slug from path like /goc-kien-thuc/slug-bai-viet
    const parts = path.split('/').filter(Boolean);
    if (parts.length >= 2 && parts[0] === 'goc-kien-thuc') {
      const slug = parts[1];
      const found = all.find(
        (a) => a.slug.toLowerCase() === slug.toLowerCase() || String(a.id) === slug
      );
      if (found) {
        setActiveArticle(found);
      } else {
        // Try fetching single from service
        const fetched = await articleService.fetchArticleBySlug(slug);
        setActiveArticle(fetched);
      }
    } else {
      setActiveArticle(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    syncFromURL();

    const handlePopState = () => {
      syncFromURL();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openArticleDetail = (article: ArticleItem) => {
    setActiveArticle(article);
    const targetPath = `/goc-kien-thuc/${article.slug}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ slug: article.slug }, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeArticleDetail = () => {
    setActiveArticle(null);
    const targetPath = '/goc-kien-thuc';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter articles
  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      const matchCat =
        selectedCategory === 'Tất cả' ||
        item.category.toLowerCase().includes(selectedCategory.toLowerCase());

      const searchLower = searchTerm.toLowerCase().trim();
      const matchSearch =
        !searchLower ||
        item.title.toLowerCase().includes(searchLower) ||
        (item.context && item.context.toLowerCase().includes(searchLower)) ||
        item.category.toLowerCase().includes(searchLower);

      return matchCat && matchSearch;
    });
  }, [articles, selectedCategory, searchTerm]);

  // Featured article (first item)
  const featuredArticle = useMemo(() => {
    return filteredArticles.length > 0 ? filteredArticles[0] : null;
  }, [filteredArticles]);

  const regularArticles = useMemo(() => {
    if (!featuredArticle) return [];
    return filteredArticles.filter((a) => a.id !== featuredArticle.id);
  }, [filteredArticles, featuredArticle]);

  // Calculate estimated reading time
  const getReadingTime = (text: string) => {
    const words = text ? text.trim().split(/\s+/).length : 0;
    const minutes = Math.ceil(words / 200);
    return minutes < 1 ? 1 : minutes;
  };

  // Format content paragraphs
  const renderFormattedContent = (contentStr: string) => {
    if (!contentStr) return null;

    const blocks = contentStr.split('\n\n');
    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // Heading 3
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-xl sm:text-2xl font-bold text-[#141b2b] mt-6 mb-3 tracking-tight">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      // Heading 2
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-2xl sm:text-3xl font-extrabold text-[#005396] mt-8 mb-4 tracking-tight">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      // Blockquote / Tip Callout
      if (trimmed.startsWith('> ')) {
        return (
          <div
            key={idx}
            className="my-5 p-4 sm:p-5 bg-amber-50/90 border-l-4 border-[#ff8a00] rounded-r-2xl text-amber-950 text-sm leading-relaxed shadow-xs font-medium"
          >
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#ff8a00] text-xl shrink-0 mt-0.5">
                tips_and_updates
              </span>
              <div>{trimmed.replace('> ', '')}</div>
            </div>
          </div>
        );
      }

      // Bullet lists
      if (trimmed.includes('\n- ') || trimmed.startsWith('- ')) {
        const items = trimmed.split('\n').filter((l) => l.trim().startsWith('- '));
        return (
          <ul key={idx} className="my-4 space-y-2 list-none pl-1">
            {items.map((it, iIdx) => (
              <li key={iIdx} className="flex items-start gap-2.5 text-sm sm:text-base text-[#414751] leading-relaxed">
                <span className="w-2 h-2 rounded-full bg-[#005396] shrink-0 mt-2"></span>
                <span>{it.replace('- ', '')}</span>
              </li>
            ))}
          </ul>
        );
      }

      // Default paragraph
      return (
        <p key={idx} className="my-3 text-sm sm:text-base text-[#333e4f] leading-relaxed font-normal">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] pt-36 sm:pt-38 lg:pt-36 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* DETAIL VIEW MODE */}
        {activeArticle ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 flex-wrap bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-2xs">
              <button
                onClick={() => setActiveTab('home')}
                className="hover:text-[#005396] transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                <span className="material-symbols-outlined text-base">home</span>
                <span>Trang chủ</span>
              </button>
              <span>/</span>
              <button
                onClick={closeArticleDetail}
                className="hover:text-[#005396] transition-colors cursor-pointer font-medium"
              >
                Góc kiến thức
              </button>
              <span>/</span>
              <span className="font-bold text-[#005396] truncate max-w-[220px] sm:max-w-xs">
                {activeArticle.title}
              </span>
            </div>

            {/* Back Button */}
            <button
              onClick={closeArticleDetail}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-[#005396] border border-[#005396]/20 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              <span>Quay lại danh sách bài viết</span>
            </button>

            {/* Main Article Container */}
            <article className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
              {/* Category & Meta */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#005396]/10 text-[#005396] rounded-full text-xs font-bold border border-[#005396]/20">
                  <span className="material-symbols-outlined text-sm">auto_stories</span>
                  <span>{activeArticle.category}</span>
                </span>

                <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">calendar_month</span>
                    <span>{activeArticle.created_at}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">person</span>
                    <span>{activeArticle.author || 'Điện lạnh Công Thương'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span>~{getReadingTime(activeArticle.context)} phút đọc</span>
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-black text-[#141b2b] tracking-tight leading-tight">
                {activeArticle.title}
              </h1>

              {/* Cover Image */}
              {activeArticle.cover_image && (
                <div className="relative w-full h-[240px] sm:h-[400px] rounded-2xl overflow-hidden shadow-md">
                  <img
                    src={activeArticle.cover_image}
                    alt={activeArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Formatted Content */}
              <div className="prose max-w-none text-gray-800 space-y-2">
                {renderFormattedContent(activeArticle.context)}
              </div>

              {/* CTA Booking Banner Inside Article */}
              <div className="mt-8 bg-gradient-to-r from-[#003c6e] via-[#005396] to-[#0f6cbd] text-white p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-lg sm:text-xl font-bold">
                    Máy lạnh nhà bạn đang gặp sự cố hoặc cần bảo dưỡng?
                  </h4>
                  <p className="text-xs sm:text-sm text-blue-100">
                    Đội ngũ kỹ thuật viên Điện lạnh Công Thương sẵn sàng kiểm tra &amp; phục vụ tận nhà nhanh chóng trong 30 phút!
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('booking')}
                  className="px-6 py-3 bg-[#ff8a00] hover:bg-[#e07a00] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 shrink-0 cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">calendar_month</span>
                  <span>Đặt dịch vụ ngay</span>
                </button>
              </div>
            </article>

            {/* Related Articles Section */}
            {articles.filter((a) => a.id !== activeArticle.id).length > 0 && (
              <div className="space-y-4 pt-6">
                <h3 className="text-xl font-extrabold text-[#141b2b] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#005396]">library_books</span>
                  <span>Bài viết liên quan</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {articles
                    .filter((a) => a.id !== activeArticle.id)
                    .slice(0, 3)
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => openArticleDetail(item)}
                        className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md hover:border-[#005396]/30 transition-all cursor-pointer flex flex-col justify-between group"
                      >
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-[#005396] bg-[#005396]/10 px-2.5 py-0.5 rounded-full inline-block">
                            {item.category}
                          </span>
                          <h4 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-[#005396] transition-colors">
                            {item.title}
                          </h4>
                        </div>
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 mt-2">
                          <span>{item.created_at}</span>
                          <span className="text-[#005396] font-bold group-hover:underline">Xem thêm →</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ARTICLES LIST VIEW MODE */
          <>
            {/* Header Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#003c6e] via-[#005396] to-[#0f6cbd] rounded-3xl p-6 sm:p-10 text-white shadow-xl">
              <div className="relative z-10 max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-blue-100">
                  <span className="material-symbols-outlined text-sm text-[#ffd700]">menu_book</span>
                  <span>Góc Kiến Thức Điện Lạnh</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  Kinh Nghiệm &amp; Hướng Dẫn Sử Dụng Điện Lạnh
                </h1>
                <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
                  Tổng hợp kiến thức kỹ thuật, mẹo sử dụng tiết kiệm điện và cẩm nang bảo dưỡng máy lạnh, máy giặt, tủ lạnh đúng chuẩn chuyên gia.
                </p>
              </div>
            </div>

            {/* Category Pills & Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm bài viết, hướng dẫn, mẹo hay..."
                    className="w-full pl-11 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#005396] focus:bg-white transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  )}
                </div>

                {/* Article Count */}
                <div className="text-xs font-bold text-gray-500 self-end md:self-center">
                  Hiển thị <span className="text-[#005396] font-extrabold text-sm">{filteredArticles.length}</span> bài viết
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-400 mr-1 shrink-0 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">filter_alt</span>
                  <span>Chuyên mục:</span>
                </span>
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-[#005396] text-white shadow-xs'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Articles Display Section */}
            {isLoading ? (
              <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-gray-200">
                <div className="inline-block w-8 h-8 border-3 border-[#005396] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-500">Đang tải danh sách bài viết...</p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="py-16 text-center space-y-4 bg-white rounded-2xl border border-gray-200 px-4">
                <span className="material-symbols-outlined text-4xl text-gray-300">article</span>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-800">Không tìm thấy bài viết phù hợp</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    Thử thay đổi từ khóa tìm kiếm hoặc chọn chuyên mục khác.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('Tất cả');
                  }}
                  className="px-4 py-2 bg-[#005396] text-white rounded-xl text-xs font-bold hover:bg-[#003c6e] cursor-pointer"
                >
                  Xem tất cả bài viết
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Featured Hero Article */}
                {featuredArticle && !searchTerm && selectedCategory === 'Tất cả' && (
                  <div
                    onClick={() => openArticleDetail(featuredArticle)}
                    className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all cursor-pointer group grid grid-cols-1 lg:grid-cols-12"
                  >
                    <div className="lg:col-span-7 h-64 lg:h-auto relative overflow-hidden">
                      <img
                        src={
                          featuredArticle.cover_image ||
                          'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80'
                        }
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-4 left-4 bg-[#005396] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        Bài viết nổi bật
                      </span>
                    </div>

                    <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <span className="inline-block px-3 py-1 bg-[#005396]/10 text-[#005396] rounded-full text-xs font-bold">
                          {featuredArticle.category}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-[#141b2b] group-hover:text-[#005396] transition-colors leading-tight">
                          {featuredArticle.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed">
                          {featuredArticle.context ? featuredArticle.context.replace(/[#*`>-]/g, '').trim().substring(0, 160) + '...' : ''}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1 font-semibold">
                          <span className="material-symbols-outlined text-sm">calendar_month</span>
                          <span>{featuredArticle.created_at}</span>
                        </span>
                        <span className="text-[#005396] font-bold flex items-center gap-1 group-hover:underline">
                          <span>Đọc tiếp</span>
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Grid of Articles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(searchTerm || selectedCategory !== 'Tất cả'
                    ? filteredArticles
                    : regularArticles
                  ).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => openArticleDetail(item)}
                      className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden hover:shadow-md hover:border-[#005396]/30 transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        {/* Image */}
                        <div className="h-48 overflow-hidden relative">
                          <img
                            src={
                              item.cover_image ||
                              'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80'
                            }
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[#005396] text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                            {item.category}
                          </span>
                        </div>

                        {/* Text */}
                        <div className="p-5 space-y-2">
                          <h3 className="font-extrabold text-[#141b2b] text-base leading-snug group-hover:text-[#005396] transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                            {item.context ? item.context.replace(/[#*`>-]/g, '').trim().substring(0, 140) + '...' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-5 pb-5 pt-2 flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 mt-auto">
                        <span className="flex items-center gap-1 font-medium">
                          <span className="material-symbols-outlined text-sm">calendar_month</span>
                          <span>{item.created_at}</span>
                        </span>
                        <span className="text-[#005396] font-bold flex items-center gap-0.5 group-hover:underline">
                          <span>Đọc bài</span>
                          <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
