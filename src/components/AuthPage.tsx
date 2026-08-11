import React, { useState } from 'react';
import { ActiveTab, UserProfile } from '../types';
import { authService } from '../services/authService';

interface AuthPageProps {
  setActiveTab: (tab: ActiveTab) => void;
  initialMode?: 'login' | 'register';
  onLoginSuccess?: (user: UserProfile) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  setActiveTab,
  initialMode = 'login',
  onLoginSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  
  // Login Form state
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown timer effect
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Register multi-step state
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthYear, setBirthYear] = useState<number | ''>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.loginWithPhone(phone, password);
      if (!result.success || !result.user) {
        setError(result.message || 'Đăng nhập thất bại.');
        return;
      }

      if (onLoginSuccess) {
        onLoginSuccess(result.user);
      }

      // If user is admin, navigate directly to admin dashboard, else home
      if (result.user.role === 'admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('home');
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  // Send Email OTP
  const handleSendEmailOTP = async () => {
    setError('');
    setSuccessMsg('');

    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.sendEmailOTP(forgotEmail);
      if (!res.success) {
        setError(res.message || 'Không thể gửi mã OTP.');
        return;
      }

      setOtpSent(true);
      setResendTimer(60);
      setSuccessMsg(
        `Mã OTP đã được gửi đến email: ${forgotEmail}. Vui lòng kiểm tra hộp thư.`
      );
    } catch (err: any) {
      setError(err.message || 'Lỗi khi gửi mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password submit
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setError('Vui lòng nhập email đăng ký.');
      return;
    }

    if (!otpSent) {
      await handleSendEmailOTP();
      return;
    }

    // Step 2: Verify OTP & Reset
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số mã OTP.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu mới phải từ 6 ký tự trở lên.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPasswordWithEmail(
        forgotEmail,
        otpCode,
        newPassword
      );
      if (!res.success) {
        setError(res.message || 'Không thể đặt lại mật khẩu.');
        return;
      }
      setSuccessMsg(
        'Đặt lại mật khẩu thành công! Đang chuyển hướng sang trang đăng nhập...'
      );
      setTimeout(() => {
        setMode('login');
        setPassword('');
        setOtpSent(false);
        setSuccessMsg('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submit (Phone + Password directly -> Onboarding)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regPhone.trim()) {
      setError('Vui lòng nhập số điện thoại.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setError('Mật khẩu phải từ 6 ký tự trở lên.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.registerCustomer({
        phone: regPhone,
        rawPassword: regPassword,
        firstName: 'Khách',
        lastName: 'Hàng',
      });

      if (!result.success || !result.user) {
        setError(result.message || 'Đăng ký không thành công.');
        return;
      }

      if (onLoginSuccess) {
        onLoginSuccess(result.user);
      }

      setActiveTab('onboarding');
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống khi đăng ký.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 lg:pt-28 pb-16 px-4 sm:px-6 flex justify-center min-h-[calc(100vh-200px)] items-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#c1c7d3]/30 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#005396]/10 text-[#005396] rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-2xl">
              {mode === 'login' ? 'lock' : mode === 'register' ? 'person_add' : 'lock_reset'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#141b2b]">
            {mode === 'login' ? 'Đăng Nhập' : mode === 'register' ? 'Đăng Ký Tài Khoản Khách Hàng' : 'Khôi Phục Mật Khẩu'}
          </h1>
          <p className="text-xs text-[#717783] mt-2 font-medium">
            {mode === 'login'
              ? 'Nhập số điện thoại và mật khẩu của bạn để đăng nhập'
              : mode === 'register'
              ? 'Tài khoản đăng ký mặc định là Khách Hàng (Customer)'
              : 'Nhập số điện thoại đã đăng ký để lấy lại mật khẩu'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#ba1a1a] rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3 bg-[#e1f8eb] border border-[#10b981]/30 text-[#10b981] rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#414751] block mb-1">
                Số điện thoại đăng nhập
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717783] text-lg">call</span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0912345678"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-[#414751]">Mật khẩu</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setForgotEmail('');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-xs text-[#005396] font-semibold hover:underline cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717783] text-lg">key</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#005396] hover:bg-[#0f6cbd] disabled:bg-[#005396]/50 text-white font-bold py-3.5 rounded-xl shadow-md transition-all cursor-pointer mt-2 text-sm"
            >
              {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#414751] block mb-1">
                Email đăng ký nhận mã xác thực OTP <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717783] text-lg">mail</span>
                <input
                  type="email"
                  required
                  disabled={otpSent}
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Ví dụ: khachhang@example.com"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#005396] disabled:opacity-75"
                />
              </div>
            </div>

            {!otpSent ? (
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#005396] hover:bg-[#0f6cbd] disabled:bg-[#005396]/50 text-white font-bold py-3.5 rounded-xl shadow-md transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">mark_email_read</span>
                <span>{loading ? 'Đang gửi mã...' : 'Gửi Mã Xác Thực Qua Email'}</span>
              </button>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#414751]">
                      Nhập mã OTP 6 chữ số
                    </label>
                    <button
                      type="button"
                      disabled={resendTimer > 0 || loading}
                      onClick={handleSendEmailOTP}
                      className="text-[11px] text-[#005396] font-semibold hover:underline disabled:text-gray-400 disabled:no-underline cursor-pointer"
                    >
                      {resendTimer > 0 ? `Gửi lại sau (${resendTimer}s)` : 'Gửi lại mã OTP'}
                    </button>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717783] text-lg">pin</span>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Nhập 6 chữ số OTP"
                      className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#005396] letter-spacing-2 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#414751] block mb-1">Mật khẩu mới</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717783] text-lg">lock</span>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#005396]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#414751] block mb-1">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717783] text-lg">verified_user</span>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#005396]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#005396] hover:bg-[#0f6cbd] disabled:bg-[#005396]/50 text-white font-bold py-3.5 rounded-xl shadow-md transition-all cursor-pointer text-sm"
                >
                  {loading ? 'Đang cập nhật...' : 'Xác Nhận Đặt Lại Mật Khẩu'}
                </button>
              </>
            )}
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#414751] block mb-1">
                Số điện thoại đăng ký
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717783] text-lg">call</span>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="09xx xxx xxx"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#414751] block mb-1">Mật khẩu (từ 6 ký tự)</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717783] text-lg">lock</span>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#414751] block mb-1">Xác nhận mật khẩu</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717783] text-lg">verified_user</span>
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396]"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-[#005396] font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base">info</span>
              <span>Sau khi tạo tài khoản, bạn sẽ chuyển đến trang thiết lập hồ sơ & địa chỉ dịch vụ.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#005396] hover:bg-[#0f6cbd] disabled:bg-[#005396]/50 text-white font-bold py-3.5 rounded-xl shadow-md transition-all cursor-pointer mt-2 text-sm flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Đang tạo tài khoản...' : 'Đăng Ký Tài Khoản'}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-[#414751]">
          {mode === 'login' ? (
            <>
              Chưa có tài khoản khách hàng?{' '}
              <button
                onClick={() => {
                  setMode('register');
                  setRegisterStep(1);
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-[#005396] font-bold hover:underline cursor-pointer"
              >
                Đăng ký ngay
              </button>
            </>
          ) : mode === 'forgot' ? (
            <>
              Nhớ lại mật khẩu?{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-[#005396] font-bold hover:underline cursor-pointer"
              >
                Quay lại Đăng nhập
              </button>
            </>
          ) : (
            <>
              Đã có tài khoản?{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-[#005396] font-bold hover:underline cursor-pointer"
              >
                Đăng nhập bằng số điện thoại
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
