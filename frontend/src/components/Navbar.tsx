import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Globe, Menu, X, LayoutDashboard } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Profile } from '../types';
import logoSite from '../assets/logosite.png';

interface NavbarProps {
  profile?: Profile | null;
}

const Navbar: React.FC<NavbarProps> = ({ profile }) => {
  const { isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { isAuthenticated, user, logout, isSuperAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const sections = ['hero','about','skills','projects','timeline','blog','gallery','testimonials','contact'];
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) { setActiveSection(id); break; }
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#hero',     label: t('Home', 'गृहपृष्ठ') },
    { href: '#about',    label: t('About', 'बारे') },
    { href: '#skills',   label: t('Skills', 'सीपहरू') },
    { href: '#projects', label: t('Projects', 'परियोजना') },
    { href: '#timeline', label: t('Journey', 'यात्रा') },
    { href: '#blog',     label: t('Blog', 'ब्लग') },
    { href: '#gallery',  label: t('Gallery', 'ग्यालेरी') },
    { href: '#contact',  label: t('Contact', 'सम्पर्क') },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'glass shadow-lg shadow-black/5 border-b border-white/20 dark:border-white/5'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo — shows site logo + user's name on their personal site */}
          <Link to="#hero" className="flex items-center gap-2.5 group">
            <img
              src={logoSite}
              alt="logo"
              className="w-9 h-9 object-contain flex-shrink-0 transition-transform group-hover:scale-105"
            />
            <span className="font-extrabold text-base text-gray-900 dark:text-white hidden sm:block leading-tight">
              {profile?.fullName || 'PersonalSite'}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => {
              const sectionId = link.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <a key={link.href} href={link.href}
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}>
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full" />
                  )}
                </a>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <button onClick={toggleLanguage} title="Toggle Language"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700">
              <Globe size={13} /> {language === 'en' ? 'EN' : 'NP'}
            </button>

            <button onClick={toggleTheme} title="Toggle Theme"
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link to={isSuperAdmin ? '/admin' : '/dashboard'}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 px-3 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                  <LayoutDashboard size={14} /> {t('Dashboard', 'डेशबोर्ड')}
                </Link>
                <button onClick={logout}
                  className="text-xs font-medium text-gray-500 hover:text-red-500 px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  {t('Logout', 'बाहिर')}
                </button>
              </div>
            ) : (
              <Link to="/login"
                className="hidden sm:flex items-center text-sm font-semibold bg-primary-600 text-white px-4 py-1.5 rounded-lg hover:bg-primary-700 transition-colors">
                {t('Login', 'लगइन')}
              </Link>
            )}

            <button className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-3 rounded-b-2xl shadow-xl">
            {navLinks.map(link => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg mx-2 transition-colors">
                {link.label}
              </a>
            ))}
            <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2 px-4 flex gap-2">
              {isAuthenticated ? (
                <Link to={isSuperAdmin ? '/admin' : '/dashboard'} onClick={() => setMenuOpen(false)} className="flex-1 bg-primary-600 text-white text-sm font-bold py-2 rounded-lg text-center hover:bg-primary-700 transition-colors">
                  {t('Dashboard', 'डेशबोर्ड')}
                </Link>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 bg-primary-600 text-white text-sm font-bold py-2 rounded-lg text-center hover:bg-primary-700 transition-colors">
                  {t('Login', 'लगइन')}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
