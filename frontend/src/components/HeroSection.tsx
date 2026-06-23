import React, { useState, useEffect } from 'react';
import { Download, ChevronDown, MapPin, Mail, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Profile } from '../types';
import { getMediaUrl } from '../services/api';

interface HeroSectionProps { profile: Profile | null; }

const TypewriterText: React.FC<{ texts: string[] }> = ({ texts }) => {
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[idx];
    const speed = deleting ? 40 : 80;
    const timer = setTimeout(() => {
      if (!deleting && charIdx === current.length) {
        setTimeout(() => setDeleting(true), 1800);
        return;
      }
      if (deleting && charIdx === 0) {
        setDeleting(false);
        setIdx(i => (i + 1) % texts.length);
        return;
      }
      setCharIdx(c => deleting ? c - 1 : c + 1);
    }, speed);
    return () => clearTimeout(timer);
  }, [charIdx, deleting, idx, texts]);

  return (
    <span className="gradient-text">
      {texts[idx].slice(0, charIdx)}
      <span className="animate-pulse">|</span>
    </span>
  );
};

const HeroSection: React.FC<HeroSectionProps> = ({ profile }) => {
  const { t, language } = useLanguage();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const roles = language === 'np'
    ? ['सफ्टवेयर डेभलपर', 'उद्यमी', 'प्रविधि उत्साही', 'डिजिटल रूपान्तरणका पैरवीकार']
    : ['Software Developer', 'Entrepreneur', 'Technology Enthusiast', 'Digital Transformation Advocate'];

  const displayName = profile?.fullName || 'Ram Bhandari';
  const displayBio = profile?.bio || t(
    'Passionate about building innovative technology solutions that drive digital transformation and empower communities across Nepal and beyond.',
    'नेपाल र विश्वभर डिजिटल रूपान्तरण गर्ने र समुदायलाई सशक्त पार्ने नवाचारी प्रविधि समाधान निर्माणमा उत्साही।'
  );

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 to-purple-50/40 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-50/60 dark:from-primary-950/20 to-transparent" />
      
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-80 h-80 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-200/20 dark:bg-primary-900/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      {/* Dot grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]"
        style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className={`relative z-10 container-max section-padding pt-28 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left — text */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 border border-primary-200 dark:border-primary-800 rounded-full px-4 py-2 mb-6 shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {t('Available for opportunities', 'अवसरका लागि उपलब्ध')}
              </span>
            </div>

            {/* Name */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-4">
              {t('Hi, I\'m', 'नमस्ते, म')}{' '}
              <span className="gradient-text block sm:inline">{displayName}</span>
            </h1>

            {/* Typewriter role */}
            <div className="text-xl sm:text-2xl font-bold text-gray-600 dark:text-gray-300 mb-6 min-h-[36px]">
              <TypewriterText texts={roles} />
            </div>

            {/* Bio */}
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-base max-w-xl mx-auto lg:mx-0 mb-10">
              {displayBio}
            </p>

            {/* Socials row */}
            <div className="flex items-center gap-3 justify-center lg:justify-start mb-8">
              {profile?.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-600 transition-colors">
                  <Mail size={14} /> {profile.email}
                </a>
              )}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <a href="#projects" className="btn-primary flex items-center gap-2 text-sm">
                {t('View My Work', 'मेरो काम हेर्नुस्')} <ArrowRight size={16} />
              </a>
              <a href="#contact" className="btn-outline flex items-center gap-2 text-sm">
                {t('Get In Touch', 'सम्पर्क गर्नुस्')}
              </a>
              {profile?.cvUrl && (
                <a href={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5283'}${profile.cvUrl}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all active:scale-95 shadow-sm">
                  <Download size={15} /> {t('Download CV', 'CV डाउनलोड')}
                </a>
              )}
            </div>

            {/* Quick stats */}
            <div className="flex gap-8 mt-10 justify-center lg:justify-start">
              {[
                { val: '10+', label: t('Years Exp.', 'वर्षको अनुभव') },
                { val: '50+', label: t('Projects', 'परियोजनाहरू') },
                { val: '100+', label: t('Clients', 'ग्राहकहरू') },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">{stat.val}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — photo */}
          <div className="relative flex-shrink-0">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80">
              {/* Rings */}
              <div className="absolute inset-0 rounded-full border-2 border-primary-200 dark:border-primary-800 animate-ping opacity-20" />
              <div className="absolute inset-4 rounded-full border-2 border-purple-200 dark:border-purple-800 opacity-40" />
              
              {/* Photo */}
              <img
                src={getMediaUrl(profile?.photoUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=320&background=2563eb&color=fff&bold=true`}
                alt={displayName}
                className="absolute inset-6 w-[calc(100%-48px)] h-[calc(100%-48px)] rounded-full object-cover shadow-2xl border-4 border-white dark:border-gray-800"
              />

              {/* Floating badge */}
              <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-3 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('Open to work', 'काममा खुला')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-400 animate-bounce">
          <span className="text-xs">{t('Scroll', 'तल जानुस्')}</span>
          <ChevronDown size={18} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
