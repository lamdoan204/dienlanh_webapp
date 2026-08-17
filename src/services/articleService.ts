import { supabase } from './supabaseClient';
import { ArticleItem, ArticleCategory } from '../types';
import mammoth from 'mammoth';

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  'Kiến thức',
  'Hướng dẫn sử dụng',
  'Mẹo sử dụng',
  'Vệ sinh bảo dưỡng'
];

export const INITIAL_ARTICLES: ArticleItem[] = [
  {
    id: 1,
    title: 'Hướng dẫn vệ sinh máy lạnh tại nhà đúng cách và an toàn',
    slug: 'huong-dan-ve-sinh-may-lanh-tai-nha',
    context: `Vệ sinh máy lạnh định kỳ là công việc cực kỳ quan trọng giúp thiết bị duy trì hiệu suất hoạt động tốt nhất. Dưới đây là hướng dẫn chi tiết quy trình vệ sinh dàn lạnh và dàn nóng an toàn tại nhà.

### 1. Tại sao cần vệ sinh máy lạnh định kỳ?
Sau một thời gian sử dụng (từ 3 đến 6 tháng), bụi bẩn bám dầy trên lưới lọc và màng tản nhiệt. Việc này sẽ dẫn đến:
- Máy làm lạnh chậm, yếu lạnh dù cài đặt nhiệt độ thấp.
- Tiêu tốn nhiều điện năng hơn (tăng từ 20% - 30% hóa đơn tiền điện).
- Phát ra tiếng ồn khó chịu và hiện tượng chảy nước ở dàn lạnh.
- Môi trường màng ẩm tạo điều kiện cho vi khuẩn, nấm mốc phát triển gây mùi hôi.

### 2. Dụng cụ cần chuẩn bị
- Máy xịt rửa áp lực cao (hoặc bình xịt nước chuyên dụng).
- Bạt che rửa máy lạnh (túi hứng nước).
- Khăn lau mềm, khô ráo.
- Chai xịt dung dịch diệt khuẩn chuyên dụng.
- Tua vít để tháo mặt nạ máy lạnh.

### 3. Quy trình thực hiện 5 bước
**Bước 1: Ngắt nguồn điện**
Ngắt cầu dao (CB) điện của máy lạnh trước khi thao tác ít nhất 5-10 phút để đảm bảo an toàn tuyệt đối.

**Bước 2: Tháo và rửa lưới lọc bụi**
Nhẹ nhàng mở nắp dàn lạnh, rút tấm lưới lọc bụi ra ngoài. Dùng vòi xịt rửa sạch bụi bẩn và để ráo nước nơi thoáng mát.

**Bước 3: Vệ sinh dàn lạnh (Cục lạnh trong nhà)**
Trùm túi hứng nước bên dưới dàn lạnh. Dùng khăn khô che kín khu vực bo mạch điện tử. Dùng bình xịt áp lực phun rửa các khe kim loại tản nhiệt từ trên xuống dưới.

**Bước 4: Vệ sinh dàn nóng (Cục nóng ngoài trời)**
Dùng vòi phun nước xịt trực tiếp vào cánh quạt và lá nhôm tản nhiệt của dàn nóng để loại bỏ cặn bẩn, đất cát bám lâu ngày.

**Bước 5: Lắp lại và vận hành chạy thử**
Lau khô toàn bộ bề mặt, lắp lại lưới lọc và vỏ máy. Bật cầu dao điện, cho máy chạy thử ở chế độ Cool trong 15-20 phút để kiểm tra độ lạnh và thoát nước.`,
    cover_image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    category: 'Vệ sinh bảo dưỡng',
    created_at: '2026-08-10',
    status: true,
    author: 'Điện lạnh Công Thương'
  },
  {
    id: 2,
    title: 'Cách tiết kiệm đến 30% điện năng khi dùng điều hòa mùa nắng nóng',
    slug: 'cach-tiet-kiem-dien-khi-dung-dieu-hoa-mua-nang-nong',
    context: `Vào những ngày hè oi bức, máy lạnh gần như phải hoạt động liên tục. Làm thế nào để vừa duy trì không khí mát mẻ vừa không "đau ví" khi nhận hóa đơn tiền điện?

### 1. Bật máy lạnh ở nhiệt độ lý tưởng (25°C - 28°C)
Mức nhiệt độ thích hợp nhất cho sức khỏe và tiết kiệm điện là từ 25°C đến 28°C. Mỗi khi bạn giảm 1°C, máy lạnh sẽ tiêu tốn thêm khoảng 7-10% điện năng.

### 2. Kết hợp sử dụng cùng quạt gió
Bật thêm quạt máy ở mức nhẹ khi chạy điều hòa giúp luồng khí lạnh tuần hoàn đều khắp phòng nhanh hơn.

### 3. Đóng kín cửa và kéo rèm che nắng
Đảm bảo các cửa sổ, cửa ra vào được đóng kín để tránh thất thoát hơi lạnh. Kéo rèm che nắng giúp ngăn bức xạ nhiệt mặt trời chiếu trực tiếp vào phòng.

### 4. Vệ sinh màng lọc bụi thường xuyên
Lưới lọc bẩn ngăn cản luồng gió thổi ra, buộc máy nén phải chạy công suất cao hơn. Vệ sinh lưới lọc 2 tuần/lần giúp gió thổi mạnh và tiết kiệm điện rõ rệt.`,
    cover_image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80',
    category: 'Mẹo sử dụng',
    created_at: '2026-08-12',
    status: true,
    author: 'Điện lạnh Công Thương'
  },
  {
    id: 3,
    title: 'Bao lâu thì nên nạp gas máy lạnh? Dấu hiệu nhận biết máy lạnh thiếu gas',
    slug: 'bao-lau-nen-nap-gas-may-lanh-dau-hieu-thieu-gas',
    context: `Gas máy lạnh (môi chất làm lạnh) là thành phần quan trọng giúp vận chuyển nhiệt từ trong phòng ra ngoài. Many people wonder how often gas needs to be refilled.

### 1. Máy lạnh có tự hết gas không?
Theo lý thuyết kỹ thuật, gas máy lạnh chạy trong hệ thống ống đồng kín hoàn toàn. Nếu không bị rò rỉ, gas có thể sử dụng từ 5 đến 10 năm.

### 2. Dấu hiệu nhận biết máy lạnh bị thiếu gas
- Máy hoạt động nhưng không lạnh.
- Dàn lạnh bị bám tuyết / chảy nước.
- Đường ống đồng đóng tuyết trắng ở rắc co.`,
    cover_image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80',
    category: 'Hướng dẫn sử dụng',
    created_at: '2026-08-14',
    status: true,
    author: 'Điện lạnh Công Thương'
  },
  {
    id: 4,
    title: 'Những điều cần biết về công nghệ Inverter tiết kiệm điện',
    slug: 'nhung-dieu-can-biet-ve-cong-nghe-inverter',
    context: `Công nghệ biến tần Inverter đã trở thành tiêu chuẩn trên các thiết bị máy lạnh, tủ lạnh đời mới. Giúp máy vận hành êm ái, bền bỉ và tiết kiệm điện năng tối ưu tới 40%.`,
    cover_image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    category: 'Kiến thức',
    created_at: '2026-08-15',
    status: true,
    author: 'Điện lạnh Công Thương'
  }
];

const LOCAL_STORAGE_KEY = 'hvac_masters_posts';

export const articleService = {
  /**
   * Helper: Convert title to URL slug
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  },

  /**
   * Load stored articles/posts from localStorage
   */
  getStoredArticles(): ArticleItem[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading posts from localStorage:', e);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_ARTICLES));
    return INITIAL_ARTICLES;
  },

  /**
   * Save articles/posts to localStorage
   */
  saveStoredArticles(articles: ArticleItem[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(articles));
    } catch (e) {
      console.error('Error saving posts to localStorage:', e);
    }
  },

  /**
   * Trích xuất nội dung văn bản / HTML từ file Word (.docx)
   */
  async extractContextFromDocx(file: File): Promise<{ success: boolean; text?: string; html?: string; title?: string; error?: string }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
      const rawTextResult = await mammoth.extractRawText({ arrayBuffer });

      const text = rawTextResult.value ? rawTextResult.value.trim() : '';
      const html = htmlResult.value ? htmlResult.value.trim() : '';

      // Tự động gợi ý tiêu đề từ dòng đầu tiên nếu có
      let suggestedTitle = '';
      if (text) {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length > 0) {
          suggestedTitle = lines[0].substring(0, 200);
        }
      }

      return {
        success: true,
        text,
        html,
        title: suggestedTitle
      };
    } catch (err: any) {
      console.error('Lỗi đọc file Word docx:', err);
      return {
        success: false,
        error: err.message || 'Không thể trích xuất file Word. Vui lòng kiểm tra file .docx!'
      };
    }
  },

  /**
   * Tải ảnh đại diện bài viết lên Supabase Storage bucket 'post_image'
   */
  async uploadPostImage(file: File, postId?: number | string): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
    if (!supabase) {
      // Local fallback using FileReader base64
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ success: true, publicUrl: reader.result as string });
        };
        reader.onerror = () => {
          resolve({ success: false, error: 'Lỗi đọc file ảnh' });
        };
        reader.readAsDataURL(file);
      });
    }

    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = postId ? `${postId}/${cleanFileName}` : `general/${cleanFileName}`;

      const { data, error } = await supabase.storage
        .from('post_image')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error uploading image to post_image bucket:', error);
        // Fallback: Return data URL so user isn't blocked
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({ success: true, publicUrl: reader.result as string });
          };
          reader.readAsDataURL(file);
        });
      }

      const { data: publicUrlData } = supabase.storage
        .from('post_image')
        .getPublicUrl(data.path);

      return {
        success: true,
        publicUrl: publicUrlData.publicUrl
      };
    } catch (err: any) {
      console.error('Exception during post_image upload:', err);
      return {
        success: false,
        error: err.message || 'Lỗi tải ảnh lên storage'
      };
    }
  },

  /**
   * Fetch all posts (queries table 'public.posts' in Supabase)
   */
  async fetchArticles(options?: { category?: string; search?: string; publishedOnly?: boolean }): Promise<ArticleItem[]> {
    let list: ArticleItem[] = [];

    if (supabase) {
      try {
        let query = supabase.from('posts').select('*').order('id', { ascending: false });
        if (options?.publishedOnly) {
          query = query.eq('status', true);
        }
        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          list = data.map((row: any) => ({
            id: Number(row.id),
            title: row.title || '',
            slug: row.url_slug || row.slug || this.generateSlug(row.title || ''),
            context: row.context || row.content || '',
            cover_image: row.image_url || row.cover_image || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
            category: row.category || 'Kiến thức',
            created_at: row.created_at ? String(row.created_at) : new Date().toISOString().substring(0, 10),
            status: row.status !== undefined && row.status !== null ? Boolean(row.status) : true,
            author: row.author || 'Điện lạnh Công Thương'
          }));
        } else {
          list = this.getStoredArticles();
        }
      } catch (err) {
        console.error('Error fetching posts from Supabase, using local fallback:', err);
        list = this.getStoredArticles();
      }
    } else {
      list = this.getStoredArticles();
    }

    // Filter by options
    if (options?.publishedOnly) {
      list = list.filter(a => a.status === true);
    }

    if (options?.category && options.category !== 'all') {
      const catLower = options.category.toLowerCase().trim();
      list = list.filter(a => a.category.toLowerCase().includes(catLower));
    }

    if (options?.search) {
      const searchLower = options.search.toLowerCase().trim();
      list = list.filter(a =>
        a.title.toLowerCase().includes(searchLower) ||
        a.context.toLowerCase().includes(searchLower) ||
        a.category.toLowerCase().includes(searchLower)
      );
    }

    return list;
  },

  /**
   * Fetch a single article by slug
   */
  async fetchArticleBySlug(slug: string): Promise<ArticleItem | null> {
    const all = await this.fetchArticles({ publishedOnly: false });
    const normalizedSlug = slug.toLowerCase().trim();
    const found = all.find(a => a.slug.toLowerCase() === normalizedSlug || String(a.id) === normalizedSlug);
    return found || null;
  },

  /**
   * Fetch single article by ID
   */
  async fetchArticleById(id: number): Promise<ArticleItem | null> {
    const all = await this.fetchArticles({ publishedOnly: false });
    return all.find(a => Number(a.id) === Number(id)) || null;
  },

  /**
   * Create new article in 'posts' table
   */
  async createArticle(payload: {
    title: string;
    category: ArticleCategory | string;
    context: string;
    url_slug?: string;
    status?: boolean;
    cover_image?: string | null;
    author?: string;
  }): Promise<{ success: boolean; data?: ArticleItem; error?: string }> {
    const now = new Date().toISOString().substring(0, 10);
    const slug = payload.url_slug?.trim() ? this.generateSlug(payload.url_slug) : this.generateSlug(payload.title);

    const newArticle: ArticleItem = {
      id: Date.now(),
      title: payload.title.trim(),
      slug,
      context: payload.context.trim(),
      cover_image: payload.cover_image?.trim() || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
      category: payload.category || 'Kiến thức',
      status: payload.status !== undefined ? payload.status : true,
      created_at: now,
      author: payload.author || 'Điện lạnh Công Thương'
    };

    // Try Supabase insert into 'posts'
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('posts')
          .insert([{
            title: newArticle.title,
            category: newArticle.category,
            context: newArticle.context,
            url_slug: newArticle.slug,
            status: newArticle.status
          }])
          .select()
          .single();

        if (error) {
          console.error('Supabase insert into posts error:', error);
        } else if (data) {
          newArticle.id = Number(data.id);
        }
      } catch (err) {
        console.warn('Supabase insert failed for posts, saving locally:', err);
      }
    }

    // Sync local storage fallback
    const localList = this.getStoredArticles();
    const updated = [newArticle, ...localList];
    this.saveStoredArticles(updated);

    return { success: true, data: newArticle };
  },

  /**
   * Update article in 'posts' table
   */
  async updateArticle(id: number, payload: Partial<ArticleItem>): Promise<{ success: boolean; data?: ArticleItem; error?: string }> {
    const localList = this.getStoredArticles();
    const index = localList.findIndex(a => Number(a.id) === Number(id));

    const current = index !== -1 ? localList[index] : {
      id,
      title: payload.title || '',
      slug: payload.slug || '',
      context: payload.context || '',
      category: payload.category || 'Kiến thức',
      status: payload.status !== undefined ? payload.status : true,
      created_at: new Date().toISOString().substring(0, 10),
      cover_image: payload.cover_image
    };

    const updatedSlug = payload.slug ? this.generateSlug(payload.slug) : payload.title ? this.generateSlug(payload.title) : current.slug;

    const updatedItem: ArticleItem = {
      ...current,
      ...payload,
      id,
      slug: updatedSlug,
    };

    if (supabase) {
      try {
        await supabase
          .from('posts')
          .update({
            title: updatedItem.title,
            category: updatedItem.category,
            context: updatedItem.context,
            url_slug: updatedItem.slug,
            status: updatedItem.status
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase update failed for posts:', err);
      }
    }

    if (index !== -1) {
      localList[index] = updatedItem;
      this.saveStoredArticles(localList);
    }

    return { success: true, data: updatedItem };
  },

  /**
   * Delete article from 'posts' table
   */
  async deleteArticle(id: number): Promise<{ success: boolean; error?: string }> {
    if (supabase) {
      try {
        await supabase.from('posts').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete failed for post:', err);
      }
    }

    const localList = this.getStoredArticles();
    const filtered = localList.filter(a => Number(a.id) !== Number(id));
    this.saveStoredArticles(filtered);

    return { success: true };
  }
};
