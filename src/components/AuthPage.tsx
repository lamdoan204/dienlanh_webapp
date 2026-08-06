import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthPageProps {
  setActiveTab: (tab: ActiveTab) => void;
  initialMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ setActiveTab, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper to format phone as email for Supabase default auth compatibility
  // if SMS provider is not configured.
  const formatIdentifier = (identifier: string) => {
    if (!identifier.includes('@')) {
      // If it looks like a phone number, append a dummy domain for Supabase email auth
      return `${identifier.replace(/\D/g, '')}@hvac-masters.local`;
    }
    return identifier;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (mode === 'register' && password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!isSupabaseConfigured() || !supabase) {
      // Simulate auth if no Supabase
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        if (mode === 'register') {
          setActiveTab('onboarding');
        } else {
          setActiveTab('account');
        }
      }, 1000);
      return;
    }

    setLoading(true);
    const emailToUse = formatIdentifier(phoneOrEmail);

    try {
      if (mode === 'register') {
        const { error: signUpError } = await supabase.auth.signUp({
          email: emailToUse,
          password,
        });
        if (signUpError) throw signUpError;
        // On success, go to onboarding
        setActiveTab('onboarding');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password,
        });
        if (signInError) throw signInError;
        setActiveTab('home');
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      setActiveTab('account');
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Lỗi đăng nhập Google.');
    }
  };

  return (
    <div className="pt-24 lg:pt-28 pb-16 px-4 sm:px-6 flex justify-center min-h-[calc(100vh-200px)] items-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#c1c7d3]/30 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#141b2b]">
            {mode === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản Mới'}
          </h1>
          <p className="text-sm text-[#414751] mt-2">
            {mode === 'login' 
              ? 'Chào mừng bạn quay lại với HVAC Masters' 
              : 'Đăng ký để quản lý lịch hẹn và nhận ưu đãi'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#ba1a1a] rounded-xl text-sm font-semibold text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full mb-6 bg-white border border-[#c1c7d3] hover:bg-[#f9f9ff] text-[#141b2b] font-bold py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-3 cursor-pointer"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span>Tiếp tục với Google</span>
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-[#c1c7d3]/40 flex-grow" />
          <span className="text-xs font-bold text-[#717783] uppercase tracking-wider">hoặc</span>
          <div className="h-px bg-[#c1c7d3]/40 flex-grow" />
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#414751] block mb-1">Số điện thoại / Email</label>
            <input
              type="text"
              required
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              placeholder="Nhập số điện thoại hoặc email"
              className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#414751] block mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396]"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-[#414751] block mb-1">Xác nhận mật khẩu</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#f9f9ff] border border-[#c1c7d3] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#005396] hover:bg-[#0f6cbd] disabled:bg-[#005396]/50 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors cursor-pointer mt-2"
          >
            {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#414751]">
          {mode === 'login' ? (
            <>
              Chưa có tài khoản?{' '}
              <button
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className="text-[#005396] font-bold hover:underline cursor-pointer"
              >
                Đăng ký ngay
              </button>
            </>
          ) : (
            <>
              Đã có tài khoản?{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="text-[#005396] font-bold hover:underline cursor-pointer"
              >
                Đăng nhập
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
