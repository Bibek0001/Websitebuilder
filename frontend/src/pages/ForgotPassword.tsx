import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import Logo from '../components/Logo';

const ForgotPassword: React.FC = () => {
  const { language } = useLanguage();
  const np = language === 'np';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.forgotPassword(email, window.location.origin);
      setSent(true);
    } catch {
      setError(np ? 'केही गलत भयो। फेरि प्रयास गर्नुस्।' : 'Something went wrong. Please try again.');
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
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle size={52} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
                {np ? 'इमेल पठाइयो!' : 'Email sent!'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {np
                  ? 'यदि त्यो इमेल अवस्थित छ भने, हामीले रिसेट लिंक पठाएका छौं। आफ्नो इनबक्स जाँच गर्नुस्।'
                  : 'If that email exists in our system, we have sent a reset link. Check your inbox.'}
              </p>
              <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline text-sm">
                {np ? 'लगइनमा फिर्ता' : 'Back to login'}
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">
                {np ? 'पासवर्ड बिर्सनुभयो?' : 'Forgot your password?'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                {np
                  ? 'आफ्नो इमेल ठेगाना प्रविष्ट गर्नुस् र हामी रिसेट लिंक पठाउनेछौं।'
                  : 'Enter your email address and we will send you a reset link.'}
              </p>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    {np ? 'इमेल' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary-700 transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {np ? 'पठाउँदैछ...' : 'Sending...'}</>
                  ) : (
                    np ? 'रिसेट लिंक पठाउनुस्' : 'Send Reset Link'
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                <Link to="/login" className="flex items-center justify-center gap-1 text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                  <ArrowLeft size={14} /> {np ? 'लगइनमा फिर्ता' : 'Back to login'}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
