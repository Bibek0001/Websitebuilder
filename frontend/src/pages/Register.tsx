import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, User, Mail, Lock, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/api';
import Logo from '../components/Logo';

const Register: React.FC = () => {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { toggleLanguage, language } = useLanguage();
  const navigate = useNavigate();
  const np = language === 'np';

  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };
  const strength = passwordStrength(form.password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError(np ? 'पासवर्डहरू मेल खाँदैनन्' : 'Passwords do not match');
      return;
    }
    setError(''); setLoading(true);
    try {
      const res = await authService.register({ username: form.username, email: form.email, password: form.password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || (np ? 'दर्ता असफल भयो' : 'Registration failed'));
    } finally { setLoading(false); }
  };

  const features = [
    np ? 'सम्पूर्ण व्यक्तिगत वेबसाइट' : 'Full personal website',
    np ? 'EN/NP भाषा समर्थन' : 'EN/NP bilingual support',
    np ? 'सबै सेक्सनहरू (९ सेक्सन)' : 'All 9 content sections',
    np ? 'डार्क/लाइट मोड' : 'Dark & light mode',
    np ? 'CV/रिज्युमे डाउनलोड' : 'CV/Resume download',
    np ? 'क्लाउड होस्टिङ' : 'Cloud hosting included',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-purple-700 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative">
          <Logo size={38} showText dark to="/" />
        </div>
        <div className="relative space-y-6">
          <h2 className="text-4xl font-extrabold text-white leading-tight">
            {np ? 'मिनेटमा आफ्नो वेबसाइट बनाउनुस्' : 'Launch your personal website in minutes'}
          </h2>
          <div className="space-y-2.5">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-white" />
                </div>
                <span className="text-primary-100 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-primary-200 text-sm">© {new Date().getFullYear()} PersonalSite</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <Logo size={32} showText to="/" />
            <div className="flex gap-2">
              <button onClick={toggleLanguage} className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">{np ? 'EN' : 'NP'}</button>
              <button onClick={toggleTheme} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500">{isDark ? '☀️' : '🌙'}</button>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
            {np ? 'खाता बनाउनुस्' : 'Create your account'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            {np ? 'आफ्नो निःशुल्क व्यक्तिगत वेबसाइट बनाउन सुरु गर्नुस्' : 'Start building your free personal website today'}
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
              <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                {np ? 'प्रयोगकर्ता नाम' : 'Username'}
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input required value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value.toLowerCase().replace(/\s/g, '') }))}
                  placeholder="rambhandari"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
              </div>
              {form.username && (
                <p className="text-xs text-gray-400 mt-1.5">
                  {np ? 'तपाईंको साइट:' : 'Your site:'} /site/<span className="text-primary-600 font-semibold">{form.username}</span>
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                {np ? 'इमेल' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                {np ? 'पासवर्ड' : 'Password'}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPwd ? 'text' : 'password'} required minLength={6} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min 6 characters"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">{strengthLabels[strength]}</p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                {np ? 'पासवर्ड पुष्टि गर्नुस्' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPwd ? 'text' : 'password'} required value={form.confirmPassword}
                  onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-white dark:bg-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden ${
                    form.confirmPassword && form.password !== form.confirmPassword
                      ? 'border-red-300 dark:border-red-700'
                      : 'border-gray-200 dark:border-gray-700'
                  }`} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-60">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {np ? 'बनाउँदैछ...' : 'Creating account...'}</>
                : <>{np ? 'निःशुल्क खाता बनाउनुस्' : 'Create Free Account'} <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            {np ? 'पहिले नै खाता छ?' : 'Already have an account?'}{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
              {np ? 'साइन इन गर्नुस्' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
