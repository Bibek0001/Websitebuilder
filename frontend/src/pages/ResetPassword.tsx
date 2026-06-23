import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import Logo from '../components/Logo';

const ResetPassword: React.FC = () => {
  const { language } = useLanguage();
  const np = language === 'np';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !email) {
      setError(np ? 'अमान्य रिसेट लिंक।' : 'Invalid reset link.');
    }
  }, [token, email, np]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError(np ? 'पासवर्डहरू मेल खाँदैनन्।' : 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError(np ? 'पासवर्ड कम्तीमा ६ वर्ण हुनुपर्छ।' : 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(email, token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || (np ? 'रिसेट लिंक अमान्य वा म्याद सकिएको छ।' : 'Invalid or expired reset link.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size={36} showText />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle size={52} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
                {np ? 'पासवर्ड रिसेट भयो!' : 'Password reset!'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {np ? 'तपाईंको पासवर्ड सफलतापूर्वक परिवर्तन भयो।' : 'Your password has been changed successfully.'}
              </p>
              <p className="text-xs text-gray-400">{np ? 'लगइनमा पुनर्निर्देशित गर्दै...' : 'Redirecting to login...'}</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">
                {np ? 'नयाँ पासवर्ड सेट गर्नुस्' : 'Set new password'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                {np ? 'तलको इमेलको लागि नयाँ पासवर्ड सेट गर्नुस्:' : 'Setting new password for:'}{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-300">{email}</span>
              </p>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
                  <AlertCircle size={16} className="flex-shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    {np ? 'नयाँ पासवर्ड' : 'New Password'}
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    {np ? 'पासवर्ड पुष्टि गर्नुस्' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none ${
                        confirm && password !== confirm
                          ? 'border-red-300 dark:border-red-700'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !token || !email}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary-700 transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {np ? 'रिसेट गर्दैछ...' : 'Resetting...'}</>
                  ) : (
                    np ? 'पासवर्ड रिसेट गर्नुस्' : 'Reset Password'
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                  {np ? 'लगइनमा फिर्ता' : 'Back to login'}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
