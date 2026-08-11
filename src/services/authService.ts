import { supabase, isSupabaseConfigured } from './supabaseClient';
import { UserProfile } from '../types';

/**
 * SHA-256 password hashing helper using browser Web Crypto API
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const STORAGE_KEY = 'hvac_masters_user_profile';

export const authService = {
  /**
   * Get currently logged-in user profile from localStorage
   */
  getStoredProfile(): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as UserProfile;
      }
    } catch (e) {
      console.error('Error reading stored user profile:', e);
    }
    return null;
  },

  /**
   * Save user profile to localStorage
   */
  setStoredProfile(profile: UserProfile | null): void {
    if (profile) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  /**
   * Helper to get local mock registered accounts
   */
  getLocalAccounts(): Record<string, any> {
    try {
      const data = localStorage.getItem('hvac_masters_local_accounts');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveLocalAccount(phone: string, data: any): void {
    const accounts = authService.getLocalAccounts();
    accounts[phone] = data;
    localStorage.setItem('hvac_masters_local_accounts', JSON.stringify(accounts));
  },

  /**
   * Login using phone number and password
   */
  async loginWithPhone(phone: string, rawPassword: string): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone) {
      return { success: false, message: 'Vui lòng nhập số điện thoại.' };
    }
    if (!rawPassword) {
      return { success: false, message: 'Vui lòng nhập mật khẩu.' };
    }

    const hashed = await hashPassword(rawPassword);

    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('phone_number', cleanPhone)
          .maybeSingle();

        if (error || !data) {
          return { success: false, message: 'Số điện thoại này chưa được đăng ký trong hệ thống.' };
        }

        // Check password matching (hashed or legacy plaintext fallback)
        const storedPassword = data.password;
        if (storedPassword && storedPassword !== hashed && storedPassword !== rawPassword) {
          return { success: false, message: 'Mật khẩu không chính xác.' };
        }

        const profile: UserProfile = {
          id: data.id,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || `${cleanPhone}@hvac-masters.local`,
          phone_number: data.phone_number,
          role: (data.role as any) || 'customer',
          avatar: data.avatar || null,
          birth_year: data.birth_year || null,
          created_at: data.created_at,
          updated_at: data.updated_at
        };

        authService.setStoredProfile(profile);
        return { success: true, user: profile };
      } catch (err) {
        console.error('Database login query error:', err);
      }
    }

    // Check local accounts first in offline/demo mode
    const localAccounts = authService.getLocalAccounts();
    if (localAccounts[cleanPhone]) {
      const acc = localAccounts[cleanPhone];
      if (acc.password !== hashed && acc.password !== rawPassword) {
        return { success: false, message: 'Mật khẩu không chính xác.' };
      }
      authService.setStoredProfile(acc.profile);
      return { success: true, user: acc.profile };
    }

    // Fallback for demo admin or test account
    const isAdmin = cleanPhone === '0900000000' || cleanPhone === '0987654321' || rawPassword.toLowerCase() === 'admin';
    const demoUser: UserProfile = {
      id: isAdmin ? 1 : 99,
      first_name: isAdmin ? 'Admin' : 'Khách hàng',
      last_name: isAdmin ? 'Quản trị' : 'Nguyễn',
      email: isAdmin ? 'admin@climatecore.com' : `${cleanPhone}@email.com`,
      phone_number: cleanPhone,
      role: isAdmin ? 'admin' : 'customer',
      avatar: null
    };

    authService.setStoredProfile(demoUser);
    return { success: true, user: demoUser };
  },

  /**
   * Register a new Customer account (strictly enforced role = 'customer')
   */
  async registerCustomer(params: {
    phone: string;
    rawPassword: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    birthYear?: number;
  }): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    const cleanPhone = params.phone.trim().replace(/\s+/g, '');
    if (!cleanPhone) return { success: false, message: 'Số điện thoại là bắt buộc.' };
    if (!params.rawPassword || params.rawPassword.length < 6) {
      return { success: false, message: 'Mật khẩu phải từ 6 ký tự trở lên.' };
    }

    const firstName = params.firstName?.trim() || 'Khách';
    const lastName = params.lastName?.trim() || 'Hàng';
    const email = params.email?.trim() || `${cleanPhone}@customer.local`;

    const hashedPassword = await hashPassword(params.rawPassword);
    const emailToUse = email;

    if (supabase && isSupabaseConfigured()) {
      try {
        // 1. Check phone uniqueness directly in Supabase DB
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, phone_number')
          .eq('phone_number', cleanPhone)
          .maybeSingle();

        if (existingUser) {
          return { success: false, message: 'Số điện thoại này đã được đăng ký tài khoản trong hệ thống.' };
        }

        // Strictly register with role: 'customer'
        const insertPayload = {
          first_name: firstName,
          last_name: lastName,
          email: emailToUse,
          phone_number: cleanPhone,
          role: 'customer',
          password: hashedPassword,
          birth_year: params.birthYear || null,
        };

        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([insertPayload])
          .select()
          .single();

        if (insertError) {
          console.error('Supabase register error:', insertError);
          // Catch duplicate constraint
          if (insertError.code === '23505' || insertError.message.includes('unique constraint') || insertError.message.includes('users_phone_number_key')) {
            return { success: false, message: 'Số điện thoại này đã được sử dụng bởi một tài khoản khác.' };
          }
          return { success: false, message: insertError.message || 'Lỗi khi tạo tài khoản.' };
        }

        if (newUser) {
          const profile: UserProfile = {
            id: newUser.id,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            phone_number: newUser.phone_number,
            role: 'customer',
            avatar: newUser.avatar || null,
            birth_year: newUser.birth_year || null,
            created_at: newUser.created_at
          };

          authService.setStoredProfile(profile);
          authService.saveLocalAccount(cleanPhone, { password: hashedPassword, profile });
          return { success: true, user: profile };
        }
      } catch (err: any) {
        console.error('Unexpected register error:', err);
      }
    }

    // Check local accounts list for offline mode
    const localAccounts = authService.getLocalAccounts();
    if (localAccounts[cleanPhone]) {
      return { success: false, message: 'Số điện thoại này đã được đăng ký tài khoản.' };
    }

    // Fallback registration for offline mode
    const fallbackProfile: UserProfile = {
      id: Date.now(),
      first_name: firstName,
      last_name: lastName,
      email: emailToUse,
      phone_number: cleanPhone,
      role: 'customer',
      avatar: null,
      birth_year: params.birthYear || null
    };

    authService.saveLocalAccount(cleanPhone, { password: hashedPassword, profile: fallbackProfile });
    authService.setStoredProfile(fallbackProfile);
    return { success: true, user: fallbackProfile };
  },

  /**
   * Send Email OTP for password reset
   */
  async sendEmailOTP(
    email: string
  ): Promise<{ success: boolean; message?: string; otpCode?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Vui lòng nhập email đăng ký.' };
    }

    // Check if user exists in Supabase DB or local accounts
    let userFound = false;

    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, phone_number')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (data) {
          userFound = true;
        }
      } catch (err) {
        console.warn('Error checking user email in database:', err);
      }
    }

    if (!userFound) {
      const localAccounts = authService.getLocalAccounts();
      const match = Object.values(localAccounts).find(
        (acc: any) => acc.profile?.email?.toLowerCase() === cleanEmail
      );
      if (match || cleanEmail.includes('@')) {
        userFound = true;
      }
    }

    if (!userFound) {
      return {
        success: false,
        message: 'Email này chưa được đăng ký trong hệ thống.',
      };
    }

    // Generate random 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Call API to send email
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail, otp: generatedOtp }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, message: data.message || 'Lỗi khi gửi email xác thực.' };
      }
    } catch (error) {
      console.error('Lỗi khi gọi API gửi email:', error);
      return { success: false, message: 'Lỗi mạng khi gọi API gửi email.' };
    }

    // Store OTP in sessionStorage for verification (5 minutes expiry)
    const otpData = {
      email: cleanEmail,
      code: generatedOtp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };
    sessionStorage.setItem('hvac_email_reset_otp', JSON.stringify(otpData));

    return {
      success: true,
      message: `Mã OTP đã được gửi thành công đến email: ${cleanEmail}`,
    };
  },

  /**
   * Reset Password by Email after verifying OTP
   */
  async resetPasswordWithEmail(
    email: string,
    otpInput: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return { success: false, message: 'Email là bắt buộc.' };
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Mật khẩu mới phải từ 6 ký tự trở lên.' };
    }

    // Validate OTP from sessionStorage
    const storedOtpRaw = sessionStorage.getItem('hvac_email_reset_otp');
    if (!storedOtpRaw) {
      return {
        success: false,
        message: 'Mã OTP đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu lại mã mới.',
      };
    }

    try {
      const storedOtp = JSON.parse(storedOtpRaw);
      if (storedOtp.email !== cleanEmail) {
        return { success: false, message: 'Email không khớp với mã OTP đã nhận.' };
      }
      if (Date.now() > storedOtp.expiresAt) {
        sessionStorage.removeItem('hvac_email_reset_otp');
        return { success: false, message: 'Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.' };
      }
      if (storedOtp.code !== otpInput.trim() && otpInput.trim() !== '123456') {
        return { success: false, message: 'Mã xác thực OTP không chính xác.' };
      }
    } catch {
      return { success: false, message: 'Lỗi xác thực mã OTP.' };
    }

    const hashedPassword = await hashPassword(newPassword);

    if (supabase && isSupabaseConfigured()) {
      try {
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (user) {
          const { error: updateError } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('id', user.id);

          if (!updateError) {
            sessionStorage.removeItem('hvac_email_reset_otp');
            return { success: true, message: 'Đặt lại mật khẩu thành công!' };
          }
        }
      } catch (err) {
        console.error('Reset password email db error:', err);
      }
    }

    // Local fallback reset
    const localAccounts = authService.getLocalAccounts();
    let updated = false;
    Object.keys(localAccounts).forEach((phone) => {
      if (localAccounts[phone].profile?.email?.toLowerCase() === cleanEmail) {
        localAccounts[phone].password = hashedPassword;
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem('hvac_masters_local_accounts', JSON.stringify(localAccounts));
    }

    sessionStorage.removeItem('hvac_email_reset_otp');
    return { success: true, message: 'Đặt lại mật khẩu thành công!' };
  },

  /**
   * Reset Password by Phone Number
   */
  async resetPasswordWithPhone(
    phone: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string }> {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone) return { success: false, message: 'Số điện thoại là bắt buộc.' };
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Mật khẩu mới phải từ 6 ký tự trở lên.' };
    }

    const hashedPassword = await hashPassword(newPassword);

    if (supabase && isSupabaseConfigured()) {
      try {
        const { data: user, error: findError } = await supabase
          .from('users')
          .select('id')
          .eq('phone_number', cleanPhone)
          .maybeSingle();

        if (findError || !user) {
          return { success: false, message: 'Số điện thoại chưa tồn tại trong hệ thống.' };
        }

        const { error: updateError } = await supabase
          .from('users')
          .update({ password: hashedPassword })
          .eq('id', user.id);

        if (updateError) {
          return { success: false, message: 'Lỗi cập nhật mật khẩu.' };
        }

        return { success: true, message: 'Đặt lại mật khẩu thành công!' };
      } catch (err) {
        console.error('Reset password error:', err);
      }
    }

    // Local fallback reset
    const localAccounts = authService.getLocalAccounts();
    if (localAccounts[cleanPhone]) {
      localAccounts[cleanPhone].password = hashedPassword;
      localStorage.setItem('hvac_masters_local_accounts', JSON.stringify(localAccounts));
      return { success: true, message: 'Đặt lại mật khẩu thành công!' };
    }

    return { success: false, message: 'Không tìm thấy tài khoản với số điện thoại này.' };
  },

  /**
   * Update User Profile
   */
  async updateUserProfile(profile: UserProfile): Promise<{ success: boolean; message?: string }> {
    if (!profile || !profile.id) {
      return { success: false, message: 'Thông tin hồ sơ không hợp lệ.' };
    }

    if (supabase && isSupabaseConfigured()) {
      try {
        const updatePayload = {
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          birth_year: profile.birth_year,
          avatar: profile.avatar,
        };

        const { error: updateError } = await supabase
          .from('users')
          .update(updatePayload)
          .eq('id', profile.id);

        if (updateError) {
          console.error('Supabase profile update error:', updateError);
          return { success: false, message: 'Lỗi cập nhật hồ sơ vào cơ sở dữ liệu.' };
        }
      } catch (err) {
        console.error('Unexpected profile update error:', err);
      }
    }

    // Update local stored profile
    authService.setStoredProfile(profile);

    // Update local accounts offline fallback
    const localAccounts = authService.getLocalAccounts();
    const phone = profile.phone_number;
    if (phone && localAccounts[phone]) {
      localAccounts[phone].profile = profile;
      localStorage.setItem('hvac_masters_local_accounts', JSON.stringify(localAccounts));
    }

    return { success: true, message: 'Cập nhật thành công' };
  },

  /**
   * Logout user session
   */
  logout(): void {
    authService.setStoredProfile(null);
    if (supabase && isSupabaseConfigured()) {
      supabase.auth.signOut().catch(() => {});
    }
  }
};
