import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Moon, Sun, Globe, ArrowRight, Check, Star, Users, Layout, Shield,
  Smartphone, Search, Eye, ChevronDown, Play, Globe2, BarChart2, Palette,
  Clock, Award, Network, Cloud, Cpu, ClipboardList, Code2, MonitorSmartphone,
  MapPin, Map, BookOpen, Image, MessageSquare, TrendingUp, Lock, Wifi, Zap
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { landingService, getMediaUrl } from '../services/api';
import { LandingContent, SiteTemplate, PlatformStat, PlatformTestimonial, PlatformFeature } from '../types';
import Logo from '../components/Logo';

// ── Helpers ───────────────────────────────────────────────────────────────────
const getContent = (contents: LandingContent[], key: string, lang: string, fallback: string) => {
  const item = contents.find(x => x.key === key);
  if (!item) return fallback;
  return lang === 'np' && item.valueNp ? item.valueNp : item.value;
};

// Full lucide icon map — no emojis
const iconMap: Record<string, React.ReactNode> = {
  Palette: <Palette size={24} />, Globe2: <Globe2 size={24} />, Moon: <Moon size={24} />,
  Smartphone: <Smartphone size={24} />, Search: <Search size={24} />, BarChart2: <BarChart2 size={24} />,
  Clock: <Clock size={24} />, Award: <Award size={24} />, Shield: <Shield size={24} />,
  Code2: <Code2 size={24} />, Network: <Network size={24} />, Cloud: <Cloud size={24} />,
  Cpu: <Cpu size={24} />, ClipboardList: <ClipboardList size={24} />, Layout: <Layout size={24} />,
  MonitorSmartphone: <MonitorSmartphone size={24} />, Zap: <Zap size={24} />, Users: <Users size={24} />,
  BookOpen: <BookOpen size={24} />, Image: <Image size={24} />, MessageSquare: <MessageSquare size={24} />,
  TrendingUp: <TrendingUp size={24} />, Lock: <Lock size={24} />, Wifi: <Wifi size={24} />,
  Map: <Map size={24} />, MapPin: <MapPin size={24} />, Globe: <Globe size={24} />,
};

// Icon color map — matches the image exactly
const colorMap: Record<string, { bg: string; icon: string }> = {
  blue:   { bg: 'bg-blue-100 dark:bg-blue-900/30',   icon: 'text-blue-500 dark:text-blue-400' },
  green:  { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-500 dark:text-green-400' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-500 dark:text-purple-400' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-500 dark:text-orange-400' },
  pink:   { bg: 'bg-pink-100 dark:bg-pink-900/30',   icon: 'text-pink-500 dark:text-pink-400' },
  indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', icon: 'text-indigo-500 dark:text-indigo-400' },
  teal:   { bg: 'bg-teal-100 dark:bg-teal-900/30',   icon: 'text-teal-500 dark:text-teal-400' },
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-500 dark:text-yellow-400' },
  red:    { bg: 'bg-red-100 dark:bg-red-900/30',     icon: 'text-red-500 dark:text-red-400' },
};

// Fallback features while loading
const fallbackFeatures: PlatformFeature[] = [
  { id:1, title:'Beautiful Templates', titleNp:'सुन्दर टेम्प्लेटहरू', description:'Choose from professionally designed templates for every profession.', descriptionNp:'हरेक पेशाका लागि व्यावसायिक टेम्प्लेटहरू।', icon:'Palette', iconColor:'blue', isActive:true, sortOrder:1 },
  { id:2, title:'Bilingual EN/NP', titleNp:'द्विभाषी EN/NP', description:'Full English and Nepali support, every section, every page.', descriptionNp:'सम्पूर्ण अंग्रेजी र नेपाली समर्थन।', icon:'Globe2', iconColor:'green', isActive:true, sortOrder:2 },
  { id:3, title:'Dark and Light Mode', titleNp:'डार्क र लाइट मोड', description:'Visitors can switch themes. Looks great in both.', descriptionNp:'आगन्तुकहरू थिम स्विच गर्न सक्छन्।', icon:'Moon', iconColor:'purple', isActive:true, sortOrder:3 },
  { id:4, title:'Mobile Responsive', titleNp:'मोबाइल प्रतिक्रियाशील', description:'Perfect on every screen: phone, tablet, desktop.', descriptionNp:'हरेक स्क्रिनमा उत्तम।', icon:'Smartphone', iconColor:'orange', isActive:true, sortOrder:4 },
  { id:5, title:'Searchable Blog', titleNp:'खोज्न मिल्ने ब्लग', description:'Write and search blog posts in both languages.', descriptionNp:'दुवै भाषामा ब्लग पोस्टहरू।', icon:'Search', iconColor:'pink', isActive:true, sortOrder:5 },
  { id:6, title:'Project Showcase', titleNp:'परियोजना प्रदर्शन', description:'Dynamic portfolio with expandable project cards.', descriptionNp:'विस्तार गर्न मिल्ने परियोजना कार्डहरू।', icon:'BarChart2', iconColor:'indigo', isActive:true, sortOrder:6 },
  { id:7, title:'Career Timeline', titleNp:'क्यारियर टाइमलाइन', description:'Interactive visual timeline of your professional journey.', descriptionNp:'व्यावसायिक यात्राको टाइमलाइन।', icon:'Clock', iconColor:'teal', isActive:true, sortOrder:7 },
  { id:8, title:'CV Download', titleNp:'CV डाउनलोड', description:'Let visitors download your resume with one click.', descriptionNp:'एक क्लिकमा CV डाउनलोड।', icon:'Award', iconColor:'yellow', isActive:true, sortOrder:8 },
  { id:9, title:'Secure and Cloud', titleNp:'सुरक्षित र क्लाउड', description:'JWT auth, encrypted data, cloud-hosted infrastructure.', descriptionNp:'JWT प्रमाणीकरण, क्लाउड होस्टिङ।', icon:'Shield', iconColor:'red', isActive:true, sortOrder:9 },
];

// ── Testimonials Carousel ─────────────────────────────────────────────────────
const fallbackTestimonials: PlatformTestimonial[] = [
  { id:1, name:'Ram Bhandari', role:'Software Developer, Nepal', content:'This platform helped me showcase my work professionally. I got 3 new clients within a month of launching my site!', photoUrl:'', isActive:true },
  { id:2, name:'Sita Sharma', role:'IT Consultant, Kathmandu', content:'Setting up my personal site took less than 30 minutes. The bilingual EN/NP support is perfect for reaching both local and international clients.', photoUrl:'', isActive:true },
  { id:3, name:'Bikash Thapa', role:'Entrepreneur, Pokhara', content:'The dark mode and Nepali language toggle made my site stand out. Highly recommended for every Nepali professional.', photoUrl:'', isActive:true },
  { id:4, name:'Priya Adhikari', role:'Director, Ministry of IT', content:'The e-governance solutions built on this platform transformed our service delivery. Clean, fast and professional.', photoUrl:'', isActive:true },
  { id:5, name:'Anish Gurung', role:'Freelancer, Lalitpur', content:'I was able to build a portfolio site in under an hour. The career timeline feature impressed every client I showed it to.', photoUrl:'', isActive:true },
  { id:6, name:'Kavita Rai', role:'Teacher & Community Leader', content:'Even with no technical background, I built a beautiful personal site. The support and templates are excellent.', photoUrl:'', isActive:true },
];

const TestimonialsCarousel: React.FC<{ testimonials: PlatformTestimonial[]; np: boolean }> = ({ testimonials, np }) => {
  const items = testimonials.length > 0 ? testimonials : fallbackTestimonials;
  const perPage = 3;
  // Total number of slide positions
  const maxIndex = Math.max(0, items.length - perPage);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const prev = () => { setPaused(true); setIndex(i => Math.max(0, i - 1)); };
  const next = () => { setPaused(true); setIndex(i => Math.min(maxIndex, i + 1)); };

  const canPrev = index > 0;
  const canNext = index < maxIndex;

  // Auto-advance every 4s
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setIndex(i => {
        if (i >= maxIndex) { return 0; } // loop back
        return i + 1;
      });
    }, 4000);
    return () => clearInterval(t);
  }, [paused, maxIndex]);

  // Resume after 8s of manual interaction
  useEffect(() => {
    if (!paused) return;
    const t = setTimeout(() => setPaused(false), 8000);
    return () => clearTimeout(t);
  }, [paused, index]);

  // card width = 33.333% of container, gap = 24px
  const cardWidthPct = 100 / perPage;
  const translateX = `calc(-${index * cardWidthPct}% - ${index * 24 / perPage}px)`;

  return (
    <section className="py-24 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-3 block">
            {np ? 'प्रशंसापत्र' : 'Testimonials'}
          </span>
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            {np ? 'प्रयोगकर्ताहरू के भन्छन्' : 'Loved by professionals'}
          </h2>
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-primary-600 to-purple-600 mx-auto" />
        </div>

        {/* Slider viewport */}
        <div className="relative">
          {/* Overflow container */}
          <div className="overflow-hidden">
            {/* Track — slides by 1 card at a time */}
            <div
              className="flex gap-6 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(${translateX})` }}
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300"
                  style={{ width: `calc(${cardWidthPct}% - ${24 * (perPage - 1) / perPage}px)` }}
                >
                  {/* Stars */}
                  <div className="flex gap-1 text-yellow-400 mb-5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={15} fill="currentColor" />)}
                  </div>
                  {/* Quote */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed italic mb-6">
                    "{item.content}"
                  </p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-5 border-t border-gray-100 dark:border-gray-800">
                    <img
                      src={getMediaUrl(item.photoUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=2563eb&color=fff&size=44&bold=true`}
                      alt={item.name}
                      className="w-11 h-11 rounded-full ring-2 ring-primary-100 dark:ring-primary-900 object-cover flex-shrink-0"
                    />
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Left arrow */}
          <button
            onClick={prev}
            disabled={!canPrev}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 w-10 h-10 rounded-full flex items-center justify-center border shadow-md transition-all z-10 ${
              canPrev
                ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-primary-600 hover:border-primary-600 hover:text-white text-gray-700 dark:text-gray-300'
                : 'bg-gray-100 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <ChevronDown size={18} className="rotate-90" />
          </button>

          {/* Right arrow */}
          <button
            onClick={next}
            disabled={!canNext}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 w-10 h-10 rounded-full flex items-center justify-center border shadow-md transition-all z-10 ${
              canNext
                ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-primary-600 hover:border-primary-600 hover:text-white text-gray-700 dark:text-gray-300'
                : 'bg-gray-100 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <ChevronDown size={18} className="-rotate-90" />
          </button>
        </div>

        {/* Dot indicators — one per possible index */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setPaused(true); setIndex(i); }}
              className={`transition-all rounded-full ${
                i === index
                  ? 'w-7 h-2.5 bg-primary-600'
                  : 'w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 hover:bg-primary-400'
              }`}
            />
          ))}
        </div>

        {/* Auto-play progress bar */}
        {!paused && (
          <div className="max-w-xs mx-auto mt-4 h-0.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              key={index}
              className="h-full bg-primary-600 rounded-full"
              style={{ animation: 'testimonialProgress 4s linear forwards' }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes testimonialProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </section>
  );
};

// ── Animated stat counter ─────────────────────────────────────────────────────
const AnimatedStat: React.FC<{ value: string; label: string; visible: boolean; delay: number }> = ({ value, label, visible, delay }) => {
  const [displayed, setDisplayed] = useState('0');

  useEffect(() => {
    if (!visible) return;
    // Parse numeric part (e.g. "1,200+" → 1200, "500+" → 500, "10+" → 10)
    const numStr = value.replace(/,/g, '').replace(/[^0-9]/g, '');
    const suffix = value.replace(/[0-9,]/g, ''); // e.g. "+"
    const target = parseInt(numStr, 10);
    if (isNaN(target)) { setDisplayed(value); return; }

    const timer = setTimeout(() => {
      const duration = 1600;
      const startTime = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        setDisplayed(current.toLocaleString() + suffix);
        if (progress < 1) requestAnimationFrame(animate);
        else setDisplayed(value); // snap to exact final value
      };
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [visible, value, delay]);

  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-extrabold text-primary-600 dark:text-primary-400 tabular-nums">
        {visible ? displayed : '0'}
      </div>
      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-medium">{label}</div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const [contents, setContents] = useState<LandingContent[]>([]);
  const [features, setFeatures] = useState<PlatformFeature[]>([]);
  const [templates, setTemplates] = useState<SiteTemplate[]>([]);
  const [stats, setStats] = useState<PlatformStat[]>([]);
  const [testimonials, setTestimonials] = useState<PlatformTestimonial[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const np = language === 'np';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fetch all data + auto-refresh stats every 30s
  const fetchStats = useCallback(() => {
    landingService.getStats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([
      landingService.getContent(),
      landingService.getTemplates(),
      landingService.getStats(),
      landingService.getTestimonials(),
      landingService.getFeatures(),
    ]).then(([cont, tmpl, st, test, feat]) => {
      setContents(cont.data);
      setTemplates(tmpl.data);
      setStats(st.data);
      setTestimonials(test.data);
      setFeatures(feat.data.length > 0 ? feat.data : fallbackFeatures);
    }).catch(() => {
      setFeatures(fallbackFeatures);
    });

    // Auto-refresh stats every 30 seconds for real-time counts
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  // Trigger stat animations when section scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const t = (key: string, en: string, npText: string) =>
    getContent(contents, key, language, np ? npText : en);

  const displayStats = stats.length > 0 ? stats : [
    { id:1, label:'Active Users', labelNp:'सक्रिय प्रयोगकर्ता', value:'500+', icon:'Users', sortOrder:1 },
    { id:2, label:'Websites Built', labelNp:'बनाइएका वेबसाइट', value:'1,200+', icon:'Globe', sortOrder:2 },
    { id:3, label:'Templates', labelNp:'टेम्प्लेटहरू', value:'10+', icon:'Layout', sortOrder:3 },
    { id:4, label:'Countries', labelNp:'देशहरू', value:'25+', icon:'Map', sortOrder:4 },
  ];

  const displayTemplates = templates.length > 0 ? templates : [
    { id:1, name:'Professional Blue', description:'Clean corporate layout for developers and consultants.', previewImageUrl:'https://picsum.photos/seed/tmpl1/600/400', category:'Professional', isActive:true, sortOrder:1 },
    { id:2, name:'Creative Dark', description:'Bold dark theme for designers and creatives.', previewImageUrl:'https://picsum.photos/seed/tmpl2/600/400', category:'Creative', isActive:true, sortOrder:2 },
    { id:3, name:'Minimal White', description:'Clean minimalist design for everyone.', previewImageUrl:'https://picsum.photos/seed/tmpl3/600/400', category:'Minimal', isActive:true, sortOrder:3 },
    { id:4, name:'Corporate Green', description:'Professional green for executives.', previewImageUrl:'https://picsum.photos/seed/tmpl4/600/400', category:'Corporate', isActive:true, sortOrder:4 },
    { id:5, name:'Tech Purple', description:'Modern purple gradient for tech pros.', previewImageUrl:'https://picsum.photos/seed/tmpl5/600/400', category:'Professional', isActive:true, sortOrder:5 },
    { id:6, name:'Warm Personal', description:'Warm design for teachers and leaders.', previewImageUrl:'https://picsum.photos/seed/tmpl6/600/400', category:'Minimal', isActive:true, sortOrder:6 },
  ] as SiteTemplate[];

  const categories = ['All', ...new Set(displayTemplates.map(t => t.category))];
  const filteredTemplates = activeCategory === 'All' ? displayTemplates : displayTemplates.filter(t => t.category === activeCategory);

  const pricingPlans = [
    {
      name: t('pricing.free.name','Free','निःशुल्क'),
      price: t('pricing.free.price','$0/month','$०/महिना'),
      highlight: false,
      cta: np ? 'सुरु गर्नुस्' : 'Get Started',
      features: [
        np ? 'एउटा व्यक्तिगत वेबसाइट' : '1 Personal Website',
        np ? 'सबै ९ सेक्सनहरू' : 'All 9 Sections',
        np ? 'मूल टेम्प्लेटहरू' : 'Basic Templates',
        np ? 'Subdomain URL' : 'Free Subdomain',
        np ? 'EN/NP भाषा' : 'EN/NP Language Toggle',
        np ? 'डार्क/लाइट मोड' : 'Dark/Light Mode',
      ],
    },
    {
      name: t('pricing.pro.name','Pro','प्रो'),
      price: t('pricing.pro.price','$9/month','$९/महिना'),
      highlight: true,
      badge: 'POPULAR',
      cta: np ? 'प्रो अपग्रेड' : 'Upgrade to Pro',
      features: [
        np ? 'सबै निःशुल्क सुविधाहरू' : 'Everything in Free',
        np ? 'कस्टम डोमेन' : 'Custom Domain',
        np ? 'सबै टेम्प्लेटहरू' : 'All Templates',
        np ? 'CV डाउनलोड' : 'CV/Resume Download',
        np ? 'Analytics' : 'Visitor Analytics',
        np ? 'प्राथमिकता समर्थन' : 'Priority Support',
      ],
    },
  ];

  const faqs = [
    { q:'Is it really free?', qn:'के यो साँच्चै निःशुल्क छ?', a:'Yes! You can build and publish your full personal website completely free. Pro plan adds custom domain and analytics.', an:'हो! तपाईं सम्पूर्ण व्यक्तिगत वेबसाइट पूर्णतः निःशुल्क बनाउन सक्नुहुन्छ।' },
    { q:'Can I write in Nepali?', qn:'के म नेपालीमा लेख्न सक्छु?', a:'Absolutely. Every section supports both English and Nepali content with a simple language toggle.', an:'बिल्कुल। हरेक सेक्सनले अंग्रेजी र नेपाली दुवै भाषा समर्थन गर्छ।' },
    { q:'How do I change my template?', qn:'टेम्प्लेट कसरी परिवर्तन गर्ने?', a:'You can switch templates anytime from your dashboard without losing any content.', an:'तपाईं कुनै पनि सामग्री नगुमाई डेशबोर्डबाट जुनसुकै बेला टेम्प्लेट परिवर्तन गर्न सक्नुहुन्छ।' },
    { q:'Who can see my website?', qn:'मेरो वेबसाइट कसले देख्न सक्छ?', a:'Your personal site is publicly accessible at your unique URL.', an:'तपाईंको साइट तपाईंको unique URL मा सार्वजनिक रूपमा उपलब्ध छ।' },
  ];

  const steps = [
    { num:'01', en:'Create Free Account', np:'निःशुल्क खाता बनाउनुस्', den:'Sign up in seconds, no credit card required.', dnp:'सेकेन्डमा साइन अप गर्नुस्।' },
    { num:'02', en:'Choose a Template', np:'टेम्प्लेट रोज्नुस्', den:'Pick from professional templates and preview live.', dnp:'व्यावसायिक टेम्प्लेटबाट रोज्नुस्।' },
    { num:'03', en:'Add Your Content', np:'सामग्री थप्नुस्', den:'Fill in your profile, projects, blog from your dashboard.', dnp:'डेशबोर्डबाट सामग्री भर्नुस्।' },
    { num:'04', en:'Go Live', np:'प्रकाशित गर्नुस्', den:'Your site is instantly live at your unique URL.', dnp:'तपाईंको साइट तुरुन्तै लाइभ हुन्छ।' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={36} showText={true} />
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {[['#features', np?'विशेषताहरू':'Features'],['#templates',np?'टेम्प्लेटहरू':'Templates'],['#how',np?'कसरी':'How It Works'],['#pricing',np?'मूल्य':'Pricing']].map(([href,label]) => (
              <a key={href} href={href} className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">{label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggleLanguage} className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Globe size={13} /> {np ? 'नेपाली' : 'English'}
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link to="/login" className="hidden sm:block text-sm font-medium text-gray-600 dark:text-gray-300 px-3 py-1.5 hover:text-primary-600 transition-colors">
              {np ? 'लगइन' : 'Login'}
            </Link>
            <Link to="/register" className="text-sm font-bold bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors shadow-sm">
              {np ? 'सुरु गर्नुस्' : 'Get Started'}
            </Link>
            <button className="md:hidden p-2 text-gray-500" onClick={() => setMenuOpen(!menuOpen)}>
              <ChevronDown size={18} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-3 px-4 space-y-1">
            {[['#features', np?'विशेषताहरू':'Features'],['#templates',np?'टेम्प्लेटहरू':'Templates'],['#how',np?'कसरी':'How It Works'],['#pricing',np?'मूल्य':'Pricing']].map(([href,label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 rounded-lg px-2">{label}</a>
            ))}
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/40 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/20" />
        <div className="absolute top-20 left-10 w-80 h-80 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
            {t('hero.title','Build Your Personal','आफ्नो व्यक्तिगत')}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
              {np ? 'वेबसाइट मिनेटमा' : 'Website in Minutes'}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('hero.subtitle','A powerful SaaS platform to showcase your skills, projects, career journey, and more in English and Nepali.','आफ्नो सीप, परियोजना र यात्रा देखाउन शक्तिशाली SaaS प्लेटफर्म।')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link to="/register" className="flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]">
              {np ? 'निःशुल्क सुरु गर्नुस्' : 'Start for Free'} <ArrowRight size={18} />
            </Link>
            <a href="#templates" className="flex items-center justify-center gap-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 px-8 py-4 rounded-xl font-bold hover:border-primary-400 hover:shadow-md transition-all">
              <Play size={15} className="text-primary-600" /> {np ? 'टेम्प्लेटहरू हेर्नुस्' : 'Explore Templates'}
            </a>
          </div>
          {/* Stats — animated, live from DB */}
          <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {displayStats.map((stat, i) => (
              <AnimatedStat
                key={stat.id}
                value={stat.value}
                label={np ? stat.labelNp : stat.label}
                visible={statsVisible}
                delay={i * 150}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES — Dynamic from DB, icon boxes, no emojis ── */}
      <section id="features" className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-3 block">
              {np ? 'विशेषताहरू' : 'Features'}
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
              {t('features.title','Everything You Need','तपाईंलाई चाहिने सबै कुरा')}
            </h2>
            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-primary-600 to-purple-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              {t('features.subtitle','All the tools to build a standout professional personal website','व्यावसायिक व्यक्तिगत वेबसाइट बनाउन सबै उपकरणहरू')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(feature => {
              const colors = colorMap[feature.iconColor] || colorMap.blue;
              return (
                <div key={feature.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
                  {/* Icon box — matches image design exactly */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${colors.bg}`}>
                    <span className={colors.icon}>
                      {iconMap[feature.icon] || <Zap size={24} />}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                    {np && feature.titleNp ? feature.titleNp : feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {np && feature.descriptionNp ? feature.descriptionNp : feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TEMPLATES ── */}
      <section id="templates" className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-3 block">{np?'टेम्प्लेटहरू':'Templates'}</span>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
              {t('templates.title','Professional Templates','व्यावसायिक टेम्प्लेटहरू')}
            </h2>
            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-primary-600 to-purple-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              {t('templates.subtitle','Pick a template that fits your style, fully customizable','आफ्नो शैलीसँग मिल्ने टेम्प्लेट रोज्नुस्')}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === cat ? 'bg-primary-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-300'}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(tmpl => (
              <div key={tmpl.id} className="group rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="relative overflow-hidden h-52">
                  <img src={tmpl.previewImageUrl} alt={tmpl.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <Link to="/register" className="flex items-center gap-1.5 bg-white text-gray-900 text-sm font-bold px-4 py-2 rounded-xl hover:bg-primary-600 hover:text-white transition-colors">
                      <Eye size={14} /> {np?'यो प्रयोग गर्नुस्':'Use This Template'}
                    </Link>
                  </div>
                  <span className="absolute top-3 left-3 bg-white/95 dark:bg-gray-900/90 text-xs font-semibold px-3 py-1 rounded-full">{tmpl.category}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-base mb-1 group-hover:text-primary-600 transition-colors">{tmpl.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{tmpl.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/register" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:gap-3 transition-all text-sm">
              {np?'सबै टेम्प्लेटहरू':'Browse all templates after signup'} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-24 bg-gradient-to-br from-primary-600 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-200 mb-3 block">{np?'प्रक्रिया':'Process'}</span>
            <h2 className="text-4xl font-extrabold mb-3">{np?'कसरी काम गर्छ':'How It Works'}</h2>
            <p className="text-primary-100 max-w-lg mx-auto">{np?'४ सरल चरणमा आफ्नो वेबसाइट बनाउनुस्':'Build your personal website in 4 simple steps'}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                <div className="text-4xl font-black text-white/20 mb-3">{s.num}</div>
                <h3 className="font-bold text-lg mb-2">{np?s.np:s.en}</h3>
                <p className="text-sm text-primary-100 leading-relaxed">{np?s.dnp:s.den}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-bold hover:bg-primary-50 transition-colors shadow-xl">
              {np?'अहिले सुरु गर्नुस्':'Start Building Now'} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — Sliding carousel, always visible ── */}
      <TestimonialsCarousel testimonials={testimonials} np={np} />

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-3 block">{np?'मूल्य':'Pricing'}</span>
            <h2 className="text-4xl font-extrabold mb-3">
              {t('pricing.title','Simple, Transparent Pricing','सरल मूल्य निर्धारण')}
            </h2>
            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-primary-600 to-purple-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{np?'लुकेको शुल्क छैन। जुनसुकै बेला रद्द गर्नुस्।':'No hidden fees. Cancel anytime.'}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {pricingPlans.map(plan => (
              <div key={plan.name} className={`relative rounded-2xl p-8 transition-all ${plan.highlight ? 'bg-primary-600 text-white shadow-2xl scale-105' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg'}`}>
                {plan.highlight && 'badge' in plan && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-black px-4 py-1 rounded-full">{(plan as any).badge}</span>
                )}
                <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : ''}`}>{plan.name}</h3>
                <div className={`text-4xl font-black mb-6 ${plan.highlight ? 'text-white' : 'text-primary-600 dark:text-primary-400'}`}>{plan.price}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-primary-100' : 'text-gray-600 dark:text-gray-400'}`}>
                      <Check size={16} className={plan.highlight ? 'text-white' : 'text-green-500'} /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`block text-center py-3 rounded-xl font-bold transition-colors ${plan.highlight ? 'bg-white text-primary-600 hover:bg-primary-50' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold mb-3">{np?'बारम्बार सोधिने प्रश्नहरू':'Frequently Asked Questions'}</h2>
            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-primary-600 to-purple-600 mx-auto" />
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  {np ? faq.qn : faq.q}
                  <ChevronDown size={18} className={`text-gray-400 flex-shrink-0 ml-4 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{np ? faq.an : faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="relative max-w-2xl mx-auto px-4">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-4">{np?'आफ्नो डिजिटल पहिचान बनाउनुस्':'Build your digital identity'}</h2>
          <p className="text-gray-400 mb-10 text-lg">{np?'क्रेडिट कार्ड आवश्यक छैन। निःशुल्क सुरु गर्नुस्।':'No credit card required. Start free, upgrade anytime.'}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-500 transition-colors shadow-xl">
              {np?'आजै सुरु गर्नुस्':'Get Started Today'} <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-colors">
              {np?'लगइन गर्नुस्':'Sign In'}
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 text-gray-500 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid sm:grid-cols-4 gap-8 mb-10">
            <div className="sm:col-span-2">
              <Logo size={32} showText={true} dark className="mb-3" />
              <p className="text-sm leading-relaxed">{t('footer.tagline','Build your digital identity with confidence.','आत्मविश्वासका साथ आफ्नो डिजिटल पहिचान बनाउनुस्।')}</p>
            </div>
            <div>
              <p className="text-white text-sm font-semibold mb-3">{np?'उत्पाद':'Product'}</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">{np?'विशेषताहरू':'Features'}</a></li>
                <li><a href="#templates" className="hover:text-white transition-colors">{np?'टेम्प्लेटहरू':'Templates'}</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">{np?'मूल्य':'Pricing'}</a></li>
              </ul>
            </div>
            <div>
              <p className="text-white text-sm font-semibold mb-3">{np?'खाता':'Account'}</p>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-white transition-colors">{np?'लगइन':'Login'}</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">{np?'दर्ता':'Register'}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
            <p>© {new Date().getFullYear()} PersonalSite</p>
            <div className="flex gap-4">
              <button onClick={toggleLanguage} className="hover:text-white transition-colors flex items-center gap-1"><Globe size={12} /> {np?'English':'नेपाली'}</button>
              <button onClick={toggleTheme} className="hover:text-white transition-colors">{isDark?'Light Mode':'Dark Mode'}</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
