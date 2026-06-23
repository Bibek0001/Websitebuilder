import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/api';
import Logo from '../components/Logo';

const Login: React.FC = () => {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { toggleLanguage, language } = useLanguage();
  const navigate = useNavigate();
  const np = language === 'np';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.login(form);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'superadmin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || (np ? 'गलत प्रमाणपत्र' : 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 flex">
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-purple-700 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative">
          <Logo size={38} showText={true} dark to="/" />
        </div>
        <div className="relative space-y-6">
          <h2 className="text-4xl font-extrabold text-white leading-tight">
            {np ? 'आफ्नो डिजिटल पहिचान बनाउनुस्' : 'Build your digital identity'}
          </h2>
          <p className="text-primary-100 text-lg leading-relaxed">
            {np ? 'लगइन गर्नुस् र आफ्नो व्यक्तिगत वेबसाइट व्यवस्थापन गर्न सुरु गर्नुस्।' : 'Sign in to manage your personal website, showcase your work, and connect with the world.'}
          </p>
          <div className="flex gap-4">
            {['Projects', 'Blog', 'Timeline', 'Gallery'].map(f => (
              <span key={f} className="bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
                {f}
              </span>
            ))}
          </div>
        </div>
        <p className="relative text-primary-200 text-sm">
          © {new Date().getFullYear()} PersonalSite
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <Logo size={32} showText={true} />
            <div className="flex gap-2">
              <button onClick={toggleLanguage} className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                {np ? 'EN' : 'NP'}
              </button>
              <button onClick={toggleTheme} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500">
                {isDark ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
            {np ? 'स्वागत छ' : 'Welcome back'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            {np ? 'जारी राख्न आफ्नो खातामा साइन इन गर्नुस्' : 'Sign in to your account to continue'}
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
              <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                {np ? 'इमेल' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                {np ? 'पासवर्ड' : 'Password'}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPwd ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="text-right mt-1.5">
                <Link to="/forgot-password" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                  {np ? 'पासवर्ड बिर्सनुभयो?' : 'Forgot password?'}
                </Link>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {np ? 'साइन इन हुँदैछ...' : 'Signing in...'}</>
              ) : (
                <>{np ? 'साइन इन गर्नुस्' : 'Sign In'} <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Admin hint removed for production */}

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            {np ? 'खाता छैन?' : "Don't have an account?"}{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
              {np ? 'दर्ता गर्नुस्' : 'Create one free'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
