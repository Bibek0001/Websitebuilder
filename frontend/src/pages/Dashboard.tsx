import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import {
  User, Briefcase, Code2, Clock, BookOpen, Image, MessageSquare,
  LogOut, Moon, Sun, Globe, ExternalLink, Plus, Trash2, Edit2,
  Save, X, Upload, Download, Shield, LayoutDashboard, Eye, Loader2,
  CheckCircle, AlertTriangle, Palette, Settings, Heart
} from 'lucide-react';
import Logo from '../components/Logo';
import { applyColorToDOM } from '../context/PrimaryColorContext';
import {
  profileService, projectService, skillService, timelineService,
  blogService, galleryService, testimonialService, landingService, authService, getMediaUrl
} from '../services/api';
import { Profile, Project, Skill, TimelineItem, BlogPost, GalleryItem, Testimonial, SiteTemplate } from '../types';

type Tab = 'overview' | 'profile' | 'about' | 'template' | 'projects' | 'skills' | 'timeline' | 'blog' | 'gallery' | 'testimonials' | 'account';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',     label: 'Overview',      icon: <LayoutDashboard size={17}/> },
  { id: 'profile',      label: 'Profile',       icon: <User size={17}/> },
  { id: 'about',        label: 'About',         icon: <Heart size={17}/> },
  { id: 'template',     label: 'Template',      icon: <Palette size={17}/> },
  { id: 'projects',     label: 'Projects',      icon: <Briefcase size={17}/> },
  { id: 'skills',       label: 'Skills',        icon: <Code2 size={17}/> },
  { id: 'timeline',     label: 'Timeline',      icon: <Clock size={17}/> },
  { id: 'blog',         label: 'Blog',          icon: <BookOpen size={17}/> },
  { id: 'gallery',      label: 'Gallery',       icon: <Image size={17}/> },
  { id: 'testimonials', label: 'Testimonials',  icon: <MessageSquare size={17}/> },
  { id: 'account',      label: 'Account',       icon: <Settings size={17}/> },
];

// Shared input classes
const inputCls = "w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all";
const textareaCls = `${inputCls} resize-none`;

// Shared label
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{children}</label>
);

// Shared form field
const Field: React.FC<{ label: string; children: React.ReactNode; span2?: boolean }> = ({ label, children, span2 }) => (
  <div className={span2 ? 'col-span-2' : ''}>
    <Label>{label}</Label>
    {children}
  </div>
);

// Shared loading spinner
const Spinner: React.FC = () => (
  <div className="flex items-center justify-center py-16">
    <Loader2 size={32} className="animate-spin text-primary-600" />
  </div>
);

// Shared empty state
const EmptyState: React.FC<{ icon?: React.ReactNode; msg: string; onAdd?: () => void; addLabel?: string }> = ({ icon, msg, onAdd, addLabel }) => (
  <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
    <div className="text-4xl mb-3">{icon || '📭'}</div>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{msg}</p>
    {onAdd && (
      <button onClick={onAdd} className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700">
        <Plus size={15}/> {addLabel || 'Add Now'}
      </button>
    )}
  </div>
);

// ── Site Color Picker (for user's personal site accent color) ─────────────────
const SITE_COLORS = [
  '#2563eb','#3b82f6','#0ea5e9','#6366f1','#7c3aed','#a855f7',
  '#ec4899','#ef4444','#f97316','#f59e0b','#eab308','#16a34a',
  '#059669','#0d9488','#0891b2','#374151','#1e293b','#111827',
  '#6b7280','#9ca3af',
];

const SiteColorPicker: React.FC<{ value: string; onChange: (c: string) => void }> = ({ value, onChange }) => {
  const [custom, setCustom] = useState(value);

  const handleSelect = (c: string) => { onChange(c); setCustom(c); applyColorToDOM(c); };
  const handleCustom = (c: string) => {
    setCustom(c);
    if (/^#[0-9A-Fa-f]{6}$/.test(c)) { onChange(c); applyColorToDOM(c); }
  };

  return (
    <div className="space-y-3">
      {/* Preset swatches */}
      <div className="flex flex-wrap gap-2">
        {SITE_COLORS.map(c => (
          <button key={c} type="button" title={c} onClick={() => handleSelect(c)}
            className={`w-8 h-8 rounded-xl transition-all hover:scale-110 ${value === c ? 'ring-2 ring-offset-2 ring-primary-600 scale-110' : ''}`}
            style={{ backgroundColor: c }} />
        ))}
      </div>
      {/* Custom hex */}
      <div className="flex items-center gap-2">
        <input type="color" value={custom} onChange={e => handleSelect(e.target.value)}
          className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer flex-shrink-0 p-0.5" />
        <input type="text" value={custom} maxLength={7} placeholder="#2563eb"
          onChange={e => handleCustom(e.target.value)}
          className="flex-1 px-3 py-2 text-sm font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
        <div className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex-shrink-0" style={{ backgroundColor: value }} />
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { tab: tabParam } = useParams<{ tab?: Tab }>();
  const [activeTab, setActiveTab] = useState<Tab>((tabParam as Tab) || 'overview');

  const handleLogout = () => { logout(); navigate('/login'); };
  const changeTab = (id: Tab) => {
    setActiveTab(id);
    navigate(id === 'overview' ? '/dashboard' : `/dashboard/${id}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* ── Sidebar ── */}
      <aside className="w-60 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col fixed h-full z-10 shadow-sm">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <Logo size={30} showText={true} />
          <div className="flex items-center gap-2 mt-3">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username||'U')}&background=2563eb&color=fff&size=28&bold=true`}
              className="w-7 h-7 rounded-full flex-shrink-0" alt="" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user?.username}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => changeTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
          {isSuperAdmin && (
            <Link to="/admin"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors mt-2">
              <Shield size={17}/> Admin Panel
            </Link>
          )}
        </nav>

        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
          <Link to={`/site/${user?.username}`} target="_blank"
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors font-semibold">
            <Eye size={14}/> {t('View My Site', 'मेरो साइट हेर्नुस्')}
          </Link>
          <div className="flex items-center gap-1 px-1">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {isDark ? <Sun size={14}/> : <Moon size={14}/>}
            </button>
            <button onClick={toggleLanguage} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-extrabold transition-colors">
              {language === 'en' ? 'EN' : 'NP'}
            </button>
            <button onClick={handleLogout} className="ml-auto flex items-center gap-1 text-xs text-red-500 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium">
              <LogOut size={13}/> {t('Logout','बाहिर')}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ml-60 flex-1 p-8 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'overview'     && <OverviewTab user={user} onNavigate={changeTab} />}
          {activeTab === 'profile'      && <ProfileTab />}
          {activeTab === 'about'        && <AboutTab />}
          {activeTab === 'template'     && <TemplateTab />}
          {activeTab === 'projects'     && <ProjectsTab />}
          {activeTab === 'skills'       && <SkillsTab />}
          {activeTab === 'timeline'     && <TimelineTab />}
          {activeTab === 'blog'         && <BlogTab />}
          {activeTab === 'gallery'      && <GalleryTab />}
          {activeTab === 'testimonials' && <TestimonialsTab />}
          {activeTab === 'account'      && <AccountTab />}
        </div>
      </main>
    </div>
  );
};

// ── Overview ──────────────────────────────────────────────────────────────────
const OverviewTab: React.FC<{ user: any; onNavigate: (t: Tab) => void }> = ({ user, onNavigate }) => {
  const { t } = useLanguage();
  const cards = [
    { id: 'profile' as Tab,      icon: <User size={20}/>,         label: 'Profile',       desc: 'Photo, bio, social links, CV', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
    { id: 'about' as Tab,        icon: <Heart size={20}/>,        label: 'About',         desc: 'Story, stats, info cards',     color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' },
    { id: 'template' as Tab,     icon: <Palette size={20}/>,      label: 'Template',      desc: 'Choose your site design',      color: 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600' },
    { id: 'projects' as Tab,     icon: <Briefcase size={20}/>,    label: 'Projects',      desc: 'Showcase your work',           color: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
    { id: 'skills' as Tab,       icon: <Code2 size={20}/>,        label: 'Skills',        desc: 'Your expertise and services',  color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
    { id: 'timeline' as Tab,     icon: <Clock size={20}/>,        label: 'Timeline',      desc: 'Career milestones',            color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' },
    { id: 'blog' as Tab,         icon: <BookOpen size={20}/>,     label: 'Blog',          desc: 'Write and publish articles',   color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600' },
    { id: 'gallery' as Tab,      icon: <Image size={20}/>,        label: 'Gallery',       desc: 'Photos and events',            color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' },
    { id: 'testimonials' as Tab, icon: <MessageSquare size={20}/>,label: 'Testimonials',  desc: 'Client feedback',              color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600' },
  ];
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          {t(`Welcome back, ${user?.username}!`, `फिर्ता स्वागत छ, ${user?.username}!`)}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {t('Click any section to start editing your personal website.', 'आफ्नो व्यक्तिगत वेबसाइट सम्पादन गर्न कुनै पनि सेक्सनमा क्लिक गर्नुस्।')}
        </p>
      </div>

      <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl flex items-center gap-3">
        <ExternalLink size={18} className="text-primary-600 flex-shrink-0"/>
        <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
          {t('Your site is live at', 'तपाईंको साइट लाइभ छ:')}{' '}
          <Link to={`/site/${user?.username}`} target="_blank" className="text-primary-600 font-bold hover:underline">
            /site/{user?.username}
          </Link>
        </p>
        <Link to={`/site/${user?.username}`} target="_blank"
          className="flex-shrink-0 bg-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors">
          View →
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(card => (
          <button key={card.id} onClick={() => onNavigate(card.id)}
            className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 border border-transparent hover:border-primary-200 dark:hover:border-primary-800 group text-left">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>{card.icon}</div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{card.label}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Profile Tab ───────────────────────────────────────────────────────────────
const ProfileTab: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const [form, setForm] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [cvLoading, setCvLoading] = useState(false);

  useEffect(() => {
    profileService.getMine()
      .then(r => setForm(r.data))
      .catch((err) => {
        // SuperAdmin may not have a profile — that's OK
        if (err?.response?.status !== 404) {
          toast.error('Failed to load profile');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const f = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileService.update(form);
      toast.success(t('Profile saved!', 'प्रोफाइल सुरक्षित!'), t('Your changes are live on your site.', 'तपाईंका परिवर्तनहरू साइटमा लाइभ छन्।'));
    } catch (err: any) {
      toast.error(t('Save failed', 'सुरक्षित असफल'), err.response?.data?.message);
    } finally { setSaving(false); }
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setPhotoLoading(true);
    try {
      const res = await profileService.uploadPhoto(e.target.files[0]);
      setForm(prev => ({ ...prev, photoUrl: res.data.url }));
      toast.success(t('Photo uploaded!', 'फोटो अपलोड भयो!'));
    } catch { toast.error(t('Photo upload failed', 'फोटो अपलोड असफल')); }
    finally { setPhotoLoading(false); }
  };

  const handleCV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setCvLoading(true);
    try {
      const res = await profileService.uploadCV(e.target.files[0]);
      setForm(prev => ({ ...prev, cvUrl: res.data.url }));
      toast.success(t('CV uploaded!', 'CV अपलोड भयो!'));
    } catch { toast.error(t('CV upload failed', 'CV अपलोड असफल')); }
    finally { setCvLoading(false); }
  };

  const handleRemoveCV = async () => {
    try {
      await profileService.removeCV();
      setForm(prev => ({ ...prev, cvUrl: undefined }));
      toast.success(t('CV removed', 'CV हटाइयो'));
    } catch { toast.error(t('Failed to remove CV', 'CV हटाउन असफल')); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">{t('My Profile', 'मेरो प्रोफाइल')}</h1>
      <form onSubmit={handleSave} className="space-y-5">

        {/* Photo + basic info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-5 uppercase tracking-wide">Basic Info</h3>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="relative">
                <img
                  src={getMediaUrl(form.photoUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username||'U')}&background=2563eb&color=fff&size=100&bold=true`}
                  alt="profile" className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-100 dark:border-gray-700 shadow" />
                {photoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                    <Loader2 size={20} className="animate-spin text-white" />
                  </div>
                )}
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline">
                <Upload size={12}/> {t('Change Photo', 'फोटो बदल्नुस्')}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} disabled={photoLoading} />
              </label>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              <Field label={t('Full Name', 'पूरा नाम')} span2><input className={inputCls} value={form.fullName||''} onChange={f('fullName')} placeholder="Ram Bhandari" required /></Field>
              <Field label={t('Tagline', 'ट्यागलाइन')} span2><input className={inputCls} value={form.tagline||''} onChange={f('tagline')} placeholder="Software Developer | Entrepreneur" /></Field>
              <div className="col-span-2">
                <Label>{t('Public URL', 'सार्वजनिक URL')}</Label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-sm">
          <span className="text-gray-400">/site/</span>
                  <span className="text-primary-600 font-bold">{form.slug || user?.username}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-5 uppercase tracking-wide">About</h3>
          <Field label={t('Bio / Your Story', 'परिचय / तपाईंको कथा')}>
            <textarea className={textareaCls} rows={5} value={form.bio||''} onChange={f('bio')}
              placeholder={t('Tell your story, background, and what drives you...', 'आफ्नो कथा, पृष्ठभूमि र के प्रेरित गर्छ बताउनुस्...')} />
          </Field>
        </div>

        {/* Contact & Social */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-5 uppercase tracking-wide">Contact & Social</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email"><input type="email" className={inputCls} value={form.email||''} onChange={f('email')} placeholder="you@example.com" /></Field>
            <Field label="WhatsApp"><input className={inputCls} value={form.whatsapp||''} onChange={f('whatsapp')} placeholder="+977 98XXXXXXXX" /></Field>
            <Field label="LinkedIn URL"><input className={inputCls} value={form.linkedin||''} onChange={f('linkedin')} placeholder="https://linkedin.com/in/..." /></Field>
            <Field label="GitHub URL"><input className={inputCls} value={form.github||''} onChange={f('github')} placeholder="https://github.com/..." /></Field>
            <Field label="Facebook URL"><input className={inputCls} value={form.facebook||''} onChange={f('facebook')} placeholder="https://facebook.com/..." /></Field>
            <Field label={t('Company Website', 'कम्पनी वेबसाइट')}><input className={inputCls} value={form.companyWebsite||''} onChange={f('companyWebsite')} placeholder="https://yourcompany.com" /></Field>
            <div className="col-span-2">
              <Label>{t('Site Accent Color', 'साइट रंग')}</Label>
              <p className="text-xs text-gray-400 mb-2">{t('This color is used for buttons, links, and highlights on your personal site.', 'यो रंग तपाईंको साइटमा बटन, लिंक र हाइलाइटमा प्रयोग हुन्छ।')}</p>
              <SiteColorPicker
                value={form.accentColor || '#2563eb'}
                onChange={color => setForm(p => ({ ...p, accentColor: color }))}
              />
            </div>
          </div>
        </div>

        {/* CV Upload */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download size={18} className="text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-gray-900 dark:text-white">CV / Resume</p>
            {form.cvUrl
              ? <a href={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5283'}${form.cvUrl}`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 flex items-center gap-1 hover:underline"><CheckCircle size={12}/> {t('CV uploaded, click to preview', 'CV अपलोड भयो, प्रिभ्यू गर्न क्लिक')}</a>
              : <p className="text-xs text-gray-400">{t('No CV uploaded yet', 'अझै CV अपलोड भएको छैन')}</p>
            }
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {form.cvUrl && (
              <button type="button" onClick={handleRemoveCV}
                className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-red-200 dark:border-red-800">
                <Trash2 size={13}/> {t('Remove', 'हटाउनुस्')}
              </button>
            )}
            <label className={`flex items-center gap-2 cursor-pointer text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors ${cvLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}>
              {cvLoading ? <Loader2 size={13} className="animate-spin"/> : <Upload size={13}/>}
              {cvLoading ? t('Uploading...', 'अपलोड हुँदैछ...') : t('Upload CV', 'CV अपलोड')}
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCV} disabled={cvLoading} />
            </label>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-60">
          {saving ? <><Loader2 size={15} className="animate-spin"/> {t('Saving...', 'सुरक्षित हुँदैछ...')}</> : <><Save size={15}/> {t('Save All Changes', 'सबै परिवर्तन सुरक्षित')}</>}
        </button>
      </form>
    </div>
  );
};

// ── Projects Tab ──────────────────────────────────────────────────────────────
const ProjectsTab: React.FC = () => {
  const { t } = useLanguage();
  const toast = useToast();
  const blank: Partial<Project> = { title:'', problem:'', solution:'', technologies:'', results:'', imageUrl:'', featured:false };
  const [items, setItems] = useState<Project[]>([]);
  const [form, setForm] = useState<Partial<Project>>(blank);
  const [editId, setEditId] = useState<number|null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const r = await projectService.getMine(); setItems(r.data); }
    catch (err: any) { if (err?.response?.status !== 401 && err?.response?.status !== 404) toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const f = (k: keyof Project) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => setForm(p=>({...p,[k]:e.target.value}));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId !== null) { await projectService.update(editId, form); toast.success(t('Project updated!','परियोजना अद्यावधिक!')); }
      else { await projectService.create(form); toast.success(t('Project created!','परियोजना सिर्जना भयो!')); }
      setShowForm(false); setEditId(null); setForm(blank); load();
    } catch (err: any) { toast.error(t('Save failed','सुरक्षित असफल'), err.response?.data?.message); }
    finally { setSaving(false); }
  };

  const handleEdit = (item: Project) => { setForm(item); setEditId(item.id); setShowForm(true); window.scrollTo({top:0,behavior:'smooth'}); };
  const handleDelete = async (id: number) => {
    if (!window.confirm(t('Delete this project?','यो परियोजना मेट्ने?'))) return;
    try { await projectService.delete(id); toast.success(t('Project deleted','परियोजना मेटियो')); load(); }
    catch { toast.error(t('Delete failed','मेट्न असफल')); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{t('Projects','परियोजनाहरू')}</h1>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(blank); }}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 shadow-sm">
          <Plus size={16}/> {t('Add Project','परियोजना थप्नुस्')}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">{editId ? t('Edit Project','परियोजना सम्पादन') : t('New Project','नयाँ परियोजना')}</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"><X size={18}/></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <Field label={t('Title','शीर्षक')}><input required className={inputCls} value={form.title||''} onChange={f('title')} placeholder="Revenue Management System" /></Field>
            <Field label={t('Technologies','प्रविधिहरू')}><input required className={inputCls} value={form.technologies||''} onChange={f('technologies')} placeholder="React, .NET, SQL Server" /></Field>
            <Field label={t('Problem Statement','समस्या')} span2><textarea required rows={2} className={textareaCls} value={form.problem||''} onChange={f('problem')} placeholder="What problem did you solve?" /></Field>
            <Field label={t('Solution','समाधान')} span2><textarea required rows={2} className={textareaCls} value={form.solution||''} onChange={f('solution')} /></Field>
            <Field label={t('Results & Impact','नतिजाहरू')} span2><textarea required rows={2} className={textareaCls} value={form.results||''} onChange={f('results')} placeholder="70% faster processing, 50k users..." /></Field>
            <Field label={t('Image URL (optional)','छवि URL')}><input className={inputCls} value={form.imageUrl||''} onChange={f('imageUrl')} placeholder="https://..." /></Field>
            <div className="flex items-center gap-2.5 mt-4">
              <input type="checkbox" id="feat" checked={!!form.featured} onChange={e=>setForm(p=>({...p,featured:e.target.checked}))} className="w-4 h-4 accent-primary-600 rounded" />
              <label htmlFor="feat" className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('Mark as featured','विशेष रूपमा चिह्नित गर्नुस्')}</label>
            </div>
            <div className="col-span-2 flex gap-3 pt-2 border-t dark:border-gray-700">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-60">
                {saving ? <><Loader2 size={14} className="animate-spin"/> Saving...</> : editId ? t('Update','अद्यावधिक') : t('Create','सिर्जना गर्नुस्')}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <Spinner /> : items.length === 0
        ? <EmptyState msg={t('No projects yet.','अझै परियोजना छैन।')} onAdd={() => setShowForm(true)} addLabel={t('Add First Project','पहिलो परियोजना थप्नुस्')} />
        : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-start gap-4 hover:shadow-md transition-shadow">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">{item.title}</h3>
                    {item.featured && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">⭐ Featured</span>}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-1">{item.problem}</p>
                  <div className="flex flex-wrap gap-1">
                    {item.technologies.split(',').map(tech => (
                      <span key={tech} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md">{tech.trim()}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleEdit(item)} title="Edit" className="p-2 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"><Edit2 size={15}/></button>
                  <button onClick={() => handleDelete(item.id)} title="Delete" className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={15}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

// ── Skills Tab ────────────────────────────────────────────────────────────────
const iconOptions = ['Code2','MonitorSmartphone','Network','Cloud','Cpu','ClipboardList','Globe2','Shield','BarChart2','Palette'];

const SkillsTab: React.FC = () => {
  const { t } = useLanguage(); const toast = useToast();
  const blank: Partial<Skill> = { title:'', description:'', icon:'Code2', sortOrder:0 };
  const [items, setItems] = useState<Skill[]>([]); const [form, setForm] = useState<Partial<Skill>>(blank);
  const [editId, setEditId] = useState<number|null>(null); const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [heading, setHeading] = useState({ skillsBadge: 'Expertise', skillsTitle: 'What I Do', skillsSubtitle: 'My expertise spans across multiple domains of technology and business strategy.' });
  const [headingSaving, setHeadingSaving] = useState(false);

  const load = async () => { try { const r = await skillService.getMine(); setItems(r.data); } catch { } finally { setLoading(false); } };
  useEffect(() => {
    load();
    profileService.getMine().then(r => {
      setHeading({
        skillsBadge:    r.data.skillsBadge    || 'Expertise',
        skillsTitle:    r.data.skillsTitle    || 'What I Do',
        skillsSubtitle: r.data.skillsSubtitle || 'My expertise spans across multiple domains of technology and business strategy.',
      });
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId !== null) { await skillService.update(editId, form); toast.success(t('Skill updated!','सीप अद्यावधिक!')); }
      else { await skillService.create(form); toast.success(t('Skill added!','सीप थपियो!')); }
      setShowForm(false); setEditId(null); setForm(blank); load();
    } catch { toast.error(t('Save failed','सुरक्षित असफल')); } finally { setSaving(false); }
  };

  const handleSaveHeading = async (e: React.FormEvent) => {
    e.preventDefault(); setHeadingSaving(true);
    try {
      await profileService.update(heading);
      toast.success(t('Section heading saved!', 'शीर्षक सुरक्षित भयो!'));
    } catch { toast.error(t('Save failed', 'सुरक्षित असफल')); }
    finally { setHeadingSaving(false); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{t('Skills & Services','सीप र सेवाहरू')}</h1>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(blank); }} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 shadow-sm"><Plus size={16}/> {t('Add Skill','सीप थप्नुस्')}</button>
      </div>

      {/* Section Heading card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
        <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">{t('Section Heading', 'सेक्सन शीर्षक')}</h3>
        <form onSubmit={handleSaveHeading} className="grid grid-cols-2 gap-4">
          <Field label={t('Badge (e.g. EXPERTISE)', 'ब्याज')}>
            <input className={inputCls} value={heading.skillsBadge} onChange={e => setHeading(p => ({ ...p, skillsBadge: e.target.value }))} placeholder="Expertise" />
          </Field>
          <Field label={t('Title (e.g. What I Do)', 'शीर्षक')}>
            <input className={inputCls} value={heading.skillsTitle} onChange={e => setHeading(p => ({ ...p, skillsTitle: e.target.value }))} placeholder="What I Do" />
          </Field>
          <Field label={t('Subtitle', 'उपशीर्षक')} span2>
            <input className={inputCls} value={heading.skillsSubtitle} onChange={e => setHeading(p => ({ ...p, skillsSubtitle: e.target.value }))} placeholder="My expertise spans..." />
          </Field>
          <div className="col-span-2">
            <button type="submit" disabled={headingSaving}
              className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-60">
              {headingSaving ? <><Loader2 size={14} className="animate-spin"/> {t('Saving...','सुरक्षित हुँदैछ...')}</> : <><Save size={14}/> {t('Save Heading','शीर्षक सुरक्षित')}</>}
            </button>
          </div>
        </form>
      </div>
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <Field label={t('Title','शीर्षक')}><input required className={inputCls} value={form.title||''} onChange={e=>setForm(p=>({...p,title:e.target.value}))} /></Field>
            <Field label={t('Icon','आइकन')}>
              <select className={inputCls} value={form.icon||'Code2'} onChange={e=>setForm(p=>({...p,icon:e.target.value}))}>
                {iconOptions.map(i=><option key={i}>{i}</option>)}
              </select>
            </Field>
            <Field label={t('Description','विवरण')} span2><textarea required rows={2} className={textareaCls} value={form.description||''} onChange={e=>setForm(p=>({...p,description:e.target.value}))} /></Field>
            <div className="col-span-2 flex gap-3 pt-2 border-t dark:border-gray-700">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin"/> : null}{editId ? t('Update','अद्यावधिक') : t('Add','थप्नुस्')}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm border dark:border-gray-700">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {loading ? <Spinner /> : items.length === 0
        ? <EmptyState msg={t('No skills yet.','अझै सीप छैन।')} onAdd={() => setShowForm(true)} addLabel={t('Add First Skill','पहिलो सीप थप्नुस्')} />
        : <div className="grid sm:grid-cols-2 gap-3">{items.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0 mr-3"><p className="font-bold text-sm text-gray-900 dark:text-white">{item.title}</p><p className="text-xs text-gray-500 truncate mt-0.5">{item.description}</p></div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => { setForm(item); setEditId(item.id); setShowForm(true); }} className="p-2 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"><Edit2 size={14}/></button>
                <button onClick={async () => { if(!window.confirm('Delete?')) return; try { await skillService.delete(item.id); toast.success('Deleted'); load(); } catch { toast.error('Delete failed'); } }} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}</div>
      }
    </div>
  );
};

// ── Timeline Tab ──────────────────────────────────────────────────────────────
const TimelineTab: React.FC = () => {
  const { t } = useLanguage(); const toast = useToast();
  const blank: Partial<TimelineItem> = { title:'', organization:'', description:'', startDate:'', endDate:'', type:'career', sortOrder:0 };
  const [items, setItems] = useState<TimelineItem[]>([]); const [form, setForm] = useState<Partial<TimelineItem>>(blank);
  const [editId, setEditId] = useState<number|null>(null); const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const typeColors: Record<string,string> = { education:'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', career:'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', achievement:'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', certification:'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' };

  const load = async () => { try { const r = await timelineService.getMine(); setItems(r.data); } catch { } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId !== null) { await timelineService.update(editId, form); toast.success(t('Updated!','अद्यावधिक!')); }
      else { await timelineService.create(form); toast.success(t('Added!','थपियो!')); }
      setShowForm(false); setEditId(null); setForm(blank); load();
    } catch { toast.error(t('Save failed','सुरक्षित असफल')); } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{t('Career Timeline','क्यारियर टाइमलाइन')}</h1>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(blank); }} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 shadow-sm"><Plus size={16}/> {t('Add Milestone','माइलस्टोन थप्नुस्')}</button>
      </div>
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <Field label={t('Title','शीर्षक')}><input required className={inputCls} value={form.title||''} onChange={e=>setForm(p=>({...p,title:e.target.value}))} /></Field>
            <Field label={t('Organization','संस्था')}><input required className={inputCls} value={form.organization||''} onChange={e=>setForm(p=>({...p,organization:e.target.value}))} /></Field>
            <Field label={t('Type','प्रकार')}>
              <select className={inputCls} value={form.type||'career'} onChange={e=>setForm(p=>({...p,type:e.target.value as any}))}>
                {['education','career','achievement','certification'].map(v=><option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
              </select>
            </Field>
            <Field label={t('Start Year','सुरु वर्ष')}><input required className={inputCls} value={form.startDate||''} onChange={e=>setForm(p=>({...p,startDate:e.target.value}))} placeholder="2020" /></Field>
            <Field label={t('End Year (leave blank for present)','समाप्ति वर्ष')}><input className={inputCls} value={form.endDate||''} onChange={e=>setForm(p=>({...p,endDate:e.target.value}))} placeholder="2024 or leave blank" /></Field>
            <Field label={t('Description','विवरण')} span2><textarea required rows={2} className={textareaCls} value={form.description||''} onChange={e=>setForm(p=>({...p,description:e.target.value}))} /></Field>
            <div className="col-span-2 flex gap-3 pt-2 border-t dark:border-gray-700">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin"/> : null}{editId ? t('Update','अद्यावधिक') : t('Add','थप्नुस्')}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm border dark:border-gray-700">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {loading ? <Spinner /> : items.length === 0
        ? <EmptyState msg={t('No timeline entries yet.','अझै टाइमलाइन छैन।')} onAdd={() => setShowForm(true)} addLabel={t('Add First Entry','पहिलो प्रविष्टि थप्नुस्')} />
        : <div className="space-y-3">{items.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-start gap-4 hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${typeColors[item.type]||typeColors.career}`}>{item.type}</span>
                  <span className="text-xs text-gray-400">{item.startDate}{item.endDate ? ` – ${item.endDate}` : ' – Present'}</span>
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{item.organization}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => { setForm(item); setEditId(item.id); setShowForm(true); }} className="p-2 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"><Edit2 size={14}/></button>
                <button onClick={async () => { if(!window.confirm('Delete?')) return; try { await timelineService.delete(item.id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); } }} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}</div>
      }
    </div>
  );
};

// ── Blog Tab ──────────────────────────────────────────────────────────────────
const BlogTab: React.FC = () => {
  const { t } = useLanguage(); const toast = useToast();
  const blank: Partial<BlogPost> = { title:'', titleNp:'', content:'', contentNp:'', excerpt:'', tags:'', published:false };
  const [items, setItems] = useState<BlogPost[]>([]); const [form, setForm] = useState<Partial<BlogPost>>(blank);
  const [editId, setEditId] = useState<number|null>(null); const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);

  const load = async () => { try { const r = await blogService.getMine(); setItems(r.data); } catch { } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId !== null) { await blogService.update(editId, form); toast.success(t('Post updated!','पोस्ट अद्यावधिक!')); }
      else { await blogService.create(form); toast.success(t('Post created!','पोस्ट सिर्जना भयो!')); }
      setShowForm(false); setEditId(null); setForm(blank); load();
    } catch { toast.error(t('Save failed','सुरक्षित असफल')); } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{t('Blog Posts','ब्लग पोस्टहरू')}</h1>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(blank); }} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 shadow-sm"><Plus size={16}/> {t('New Post','नयाँ पोस्ट')}</button>
      </div>
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <Field label={t('Title (English)','शीर्षक (EN)')}><input required className={inputCls} value={form.title||''} onChange={e=>setForm(p=>({...p,title:e.target.value}))} /></Field>
            <Field label={t('Title (Nepali)','शीर्षक (NP)')}><input className={inputCls} value={form.titleNp||''} onChange={e=>setForm(p=>({...p,titleNp:e.target.value}))} /></Field>
            <Field label={t('Excerpt (Short summary)','संक्षेप')} span2><textarea required rows={2} className={textareaCls} value={form.excerpt||''} onChange={e=>setForm(p=>({...p,excerpt:e.target.value}))} /></Field>
            <Field label={t('Content (English)','सामग्री (EN)')} span2><textarea required rows={6} className={textareaCls} value={form.content||''} onChange={e=>setForm(p=>({...p,content:e.target.value}))} /></Field>
            <Field label={t('Content (Nepali)','सामग्री (NP)')} span2><textarea rows={6} className={textareaCls} value={form.contentNp||''} onChange={e=>setForm(p=>({...p,contentNp:e.target.value}))} /></Field>
            <Field label={t('Tags (comma-separated)','ट्यागहरू')}><input className={inputCls} value={form.tags||''} onChange={e=>setForm(p=>({...p,tags:e.target.value}))} placeholder="Technology, Nepal, Cloud" /></Field>
            <div className="flex items-center gap-2.5 mt-4">
              <input type="checkbox" id="pub" checked={!!form.published} onChange={e=>setForm(p=>({...p,published:e.target.checked}))} className="w-4 h-4 accent-primary-600" />
              <label htmlFor="pub" className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('Publish now (visible on your site)','अहिले प्रकाशित गर्नुस्')}</label>
            </div>
            <div className="col-span-2 flex gap-3 pt-2 border-t dark:border-gray-700">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin"/> : null}{editId ? t('Update Post','पोस्ट अद्यावधिक') : t('Create Post','पोस्ट सिर्जना')}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm border dark:border-gray-700">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {loading ? <Spinner /> : items.length === 0
        ? <EmptyState msg={t('No posts yet.','अझै पोस्ट छैन।')} onAdd={() => setShowForm(true)} addLabel={t('Write First Post','पहिलो पोस्ट लेख्नुस्')} />
        : <div className="space-y-3">{items.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-start gap-4 hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${item.published ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                    {item.published ? t('Published','प्रकाशित') : t('Draft','मस्यौदा')}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.excerpt}</p>
                {item.tags && <div className="flex flex-wrap gap-1 mt-1.5">{item.tags.split(',').map(tag=><span key={tag} className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 px-2 py-0.5 rounded-full">{tag.trim()}</span>)}</div>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => { setForm(item); setEditId(item.id); setShowForm(true); }} className="p-2 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"><Edit2 size={14}/></button>
                <button onClick={async () => { if(!window.confirm('Delete this post?')) return; try { await blogService.delete(item.id); toast.success('Post deleted'); load(); } catch { toast.error('Delete failed'); } }} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}</div>
      }
    </div>
  );
};

// ── Gallery Tab ────────────────────────────────────────────────────────────────
const galleryCats = ['Office','Training','Conference','Community','Travel','Other'];
const GalleryTab: React.FC = () => {
  const { t } = useLanguage(); const toast = useToast();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [caption, setCaption] = useState(''); const [category, setCategory] = useState('Office');
  const [uploading, setUploading] = useState(false); const [loading, setLoading] = useState(true);

  const load = async () => { try { const r = await galleryService.getMine(); setItems(r.data); } catch { } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    try {
      await galleryService.upload(e.target.files[0], caption, category);
      toast.success(t('Photo uploaded!','फोटो अपलोड भयो!')); setCaption(''); load();
    } catch { toast.error(t('Upload failed','अपलोड असफल')); } finally { setUploading(false); e.target.value = ''; }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('Delete this photo?','यो फोटो मेट्ने?'))) return;
    try { await galleryService.delete(id); toast.success(t('Photo deleted','फोटो मेटियो')); load(); }
    catch { toast.error(t('Delete failed','मेट्न असफल')); }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">{t('Gallery','ग्यालेरी')}</h1>
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
        <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-4">{t('Upload New Photo','नयाँ फोटो अपलोड')}</h3>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1"><Label>{t('Caption (optional)','क्याप्शन (वैकल्पिक)')}</Label><input className={inputCls} value={caption} onChange={e=>setCaption(e.target.value)} placeholder={t('Describe this photo...','यो फोटो वर्णन गर्नुस्...')} /></div>
          <div><Label>{t('Category','श्रेणी')}</Label><select className={inputCls} value={category} onChange={e=>setCategory(e.target.value)}>{galleryCats.map(c=><option key={c}>{c}</option>)}</select></div>
          <label className={`flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer flex-shrink-0 ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}>
            {uploading ? <Loader2 size={15} className="animate-spin"/> : <Upload size={15}/>}
            {uploading ? t('Uploading...','अपलोड हुँदैछ...') : t('Choose & Upload','रोज्नुस् र अपलोड')}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>
      {loading ? <Spinner /> : items.length === 0
        ? <EmptyState msg={t('No photos yet. Upload your first image!','अझै फोटो छैन।')} />
        : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">{items.map(item => (
            <div key={item.id} className="relative group rounded-2xl overflow-hidden aspect-square bg-gray-100 dark:bg-gray-800">
              <img src={getMediaUrl(item.imageUrl)} alt={item.caption||''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                {item.caption && <p className="text-white text-xs text-center line-clamp-2">{item.caption}</p>}
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{item.category}</span>
                <button onClick={() => handleDelete(item.id)} className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 mt-1"><Trash2 size={13}/></button>
              </div>
            </div>
          ))}</div>
      }
    </div>
  );
};

// ── Testimonials Tab ──────────────────────────────────────────────────────────
const TestimonialsTab: React.FC = () => {
  const { t } = useLanguage(); const toast = useToast();
  const blank: Partial<Testimonial> = { name:'', role:'', organization:'', content:'', photoUrl:'' };
  const [items, setItems] = useState<Testimonial[]>([]); const [form, setForm] = useState<Partial<Testimonial>>(blank);
  const [editId, setEditId] = useState<number|null>(null); const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);

  const load = async () => { try { const r = await testimonialService.getMine(); setItems(r.data); } catch { } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId !== null) { await testimonialService.update(editId, form); toast.success(t('Updated!','अद्यावधिक!')); }
      else { await testimonialService.create(form); toast.success(t('Added!','थपियो!')); }
      setShowForm(false); setEditId(null); setForm(blank); load();
    } catch { toast.error(t('Save failed','सुरक्षित असफल')); } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{t('Testimonials','प्रशंसापत्र')}</h1>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(blank); }} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 shadow-sm"><Plus size={16}/> {t('Add Testimonial','प्रशंसापत्र थप्नुस्')}</button>
      </div>
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <Field label={t('Name','नाम')}><input required className={inputCls} value={form.name||''} onChange={e=>setForm(p=>({...p,name:e.target.value}))} /></Field>
            <Field label={t('Role / Title','भूमिका')}><input required className={inputCls} value={form.role||''} onChange={e=>setForm(p=>({...p,role:e.target.value}))} /></Field>
            <Field label={t('Organization','संस्था')}><input className={inputCls} value={form.organization||''} onChange={e=>setForm(p=>({...p,organization:e.target.value}))} /></Field>
            <Field label={t('Photo URL (optional)','फोटो URL')}><input className={inputCls} value={form.photoUrl||''} onChange={e=>setForm(p=>({...p,photoUrl:e.target.value}))} placeholder="https://..." /></Field>
            <Field label={t('Testimonial Content','सामग्री')} span2><textarea required rows={4} className={textareaCls} value={form.content||''} onChange={e=>setForm(p=>({...p,content:e.target.value}))} placeholder={t('What did they say about you?','उनीहरूले तपाईंबारे के भने?')} /></Field>
            <div className="col-span-2 flex gap-3 pt-2 border-t dark:border-gray-700">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin"/> : null}{editId ? t('Update','अद्यावधिक') : t('Add','थप्नुस्')}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm border dark:border-gray-700">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {loading ? <Spinner /> : items.length === 0
        ? <EmptyState msg={t('No testimonials yet.','अझै प्रशंसापत्र छैन।')} onAdd={() => setShowForm(true)} addLabel={t('Add First Testimonial','पहिलो प्रशंसापत्र थप्नुस्')} />
        : <div className="grid sm:grid-cols-2 gap-4">{items.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
              <p className="text-sm italic text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">"{item.content}"</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={getMediaUrl(item.photoUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=2563eb&color=fff&size=36&bold=true`} alt={item.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  <div className="min-w-0"><p className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.name}</p><p className="text-xs text-gray-500 truncate">{item.role}{item.organization ? `, ${item.organization}` : ''}</p></div>
                </div>
                <div className="flex gap-1 flex-shrink-0 ml-2">
                  <button onClick={() => { setForm(item); setEditId(item.id); setShowForm(true); }} className="p-2 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50"><Edit2 size={14}/></button>
                  <button onClick={async () => { if(!window.confirm('Delete?')) return; try { await testimonialService.delete(item.id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); } }} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={14}/></button>
                </div>
              </div>
            </div>
          ))}</div>
      }
    </div>
  );
};

export default Dashboard;

// ── Template Tab ──────────────────────────────────────────────────────────────
const TemplateTab: React.FC = () => {
  const { t } = useLanguage();
  const toast = useToast();
  const [templates, setTemplates] = useState<SiteTemplate[]>([]);
  const [selected, setSelected] = useState<string>('default');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      landingService.getTemplates(),
      profileService.getMine(),
    ]).then(([tmplResult, profileResult]) => {
      if (tmplResult.status === 'fulfilled') setTemplates(tmplResult.value.data);
      else toast.error('Failed to load templates');
      if (profileResult.status === 'fulfilled') {
        setSelected(profileResult.value.data.selectedTemplate || 'default');
      }
      // If profile 404 (superadmin) just use default — no error shown
    }).finally(() => setLoading(false));
  }, []);

  const handleApply = async (templateName: string) => {
    if (saving) return;
    // Optimistically update UI immediately
    setSelected(templateName);
    setSaving(true);
    try {
      const profileRes = await profileService.getMine();
      await profileService.update({ ...profileRes.data, selectedTemplate: templateName });
      toast.success(t('Template applied!', 'टेम्प्लेट लागू भयो!'));
    } catch {
      // Revert on failure
      const profileRes = await profileService.getMine().catch(() => null);
      setSelected(profileRes?.data?.selectedTemplate || 'default');
      toast.error(t('Failed to apply template', 'टेम्प्लेट लागू असफल'));
    } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  const defaultTemplate: SiteTemplate = {
    id: 0,
    name: 'Default',
    description: 'The standard professional layout included with every account.',
    previewImageUrl: 'https://picsum.photos/seed/default/600/400',
    category: 'Professional',
    isActive: true,
    sortOrder: 0,
  };

  const allTemplates = [defaultTemplate, ...templates];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">
        {t('Choose Your Template', 'आफ्नो टेम्प्लेट रोज्नुस्')}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
        {t('Select a design for your personal site. Changes apply instantly.', 'आफ्नो व्यक्तिगत साइटको लागि डिजाइन रोज्नुस्। परिवर्तन तुरुन्तै लागू हुन्छ।')}
      </p>

      {/* Currently active banner */}
      <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl flex items-center gap-3">
        <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0" />
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {t('Currently active:', 'हाल सक्रिय:')}{' '}
          <span className="font-bold text-primary-600 dark:text-primary-400">{selected || 'Default'}</span>
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {allTemplates.map(tmpl => {
          const isActive = (tmpl.name === 'Default' && (!selected || selected === 'default'))
            || tmpl.name === selected;

          return (
            <div key={tmpl.id}
              className={`rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                isActive
                  ? 'border-primary-500 shadow-xl shadow-primary-100 dark:shadow-primary-900/30'
                  : 'border-gray-100 dark:border-gray-800 hover:border-primary-200 hover:shadow-md'
              }`}>

              {/* Preview image */}
              <div className="relative overflow-hidden h-44">
                <img src={tmpl.previewImageUrl} alt={tmpl.name}
                  className="w-full h-full object-cover" />

                {/* Active badge */}
                {isActive && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                    <CheckCircle size={12} /> {t('Active', 'सक्रिय')}
                  </div>
                )}

                {/* Category badge */}
                <span className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {tmpl.category}
                </span>
              </div>

              {/* Info + action */}
              <div className="p-4 bg-white dark:bg-gray-900">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">{tmpl.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{tmpl.description}</p>

                <button
                  onClick={() => handleApply(tmpl.name)}
                  disabled={isActive || saving}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 cursor-default'
                      : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.98] shadow-sm hover:shadow-md disabled:opacity-60'
                  }`}>
                  {isActive
                    ? t('Currently Applied', 'हाल लागू')
                    : saving
                      ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin"/> {t('Applying...', 'लागू हुँदैछ...')}</span>
                      : t('Apply This Template', 'यो टेम्प्लेट लागू गर्नुस्')
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Account Settings Tab ──────────────────────────────────────────────────────
const AccountTab: React.FC = () => {
  const { user, login, token } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();

  // Change password
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  // Change email
  const [emailForm, setEmailForm] = useState({ newEmail: '', password: '' });
  const [emailLoading, setEmailLoading] = useState(false);

  const handleChangePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdForm.newPwd !== pwdForm.confirm) {
      toast.error(t('Passwords do not match', 'पासवर्डहरू मेल खाँदैनन्'));
      return;
    }
    setPwdLoading(true);
    try {
      await authService.changePassword(pwdForm.current, pwdForm.newPwd);
      toast.success(t('Password changed!', 'पासवर्ड परिवर्तन भयो!'));
      setPwdForm({ current: '', newPwd: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('Failed', 'असफल'));
    } finally { setPwdLoading(false); }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    try {
      const res = await authService.updateEmail(emailForm.newEmail, emailForm.password);
      // Update stored user email
      if (user && token) {
        login({ ...user, email: res.data.email }, token);
      }
      toast.success(t('Email updated!', 'इमेल अद्यावधिक भयो!'));
      setEmailForm({ newEmail: '', password: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('Failed', 'असफल'));
    } finally { setEmailLoading(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">
        {t('Account Settings', 'खाता सेटिङ')}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
        {t('Manage your login credentials.', 'आफ्नो लगइन प्रमाणपत्रहरू व्यवस्थापन गर्नुस्।')}
      </p>

      <div className="space-y-6">
        {/* Current account info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
            {t('Current Account', 'हालको खाता')}
          </h3>
          <div className="flex items-center gap-4">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'U')}&background=2563eb&color=fff&size=56&bold=true`}
              className="w-14 h-14 rounded-2xl"
              alt=""
            />
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{user?.username}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-5 uppercase tracking-wide">
            {t('Change Password', 'पासवर्ड परिवर्तन')}
          </h3>
          <form onSubmit={handleChangePwd} className="space-y-4 max-w-md">
            <div>
              <Label>{t('Current Password', 'हालको पासवर्ड')}</Label>
              <input
                type="password"
                required
                value={pwdForm.current}
                onChange={e => setPwdForm(p => ({ ...p, current: e.target.value }))}
                className={`${inputCls} [&::-ms-reveal]:hidden`}
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label>{t('New Password', 'नयाँ पासवर्ड')}</Label>
              <input
                type="password"
                required
                minLength={6}
                value={pwdForm.newPwd}
                onChange={e => setPwdForm(p => ({ ...p, newPwd: e.target.value }))}
                className={`${inputCls} [&::-ms-reveal]:hidden`}
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <Label>{t('Confirm New Password', 'नयाँ पासवर्ड पुष्टि')}</Label>
              <input
                type="password"
                required
                value={pwdForm.confirm}
                onChange={e => setPwdForm(p => ({ ...p, confirm: e.target.value }))}
                className={`${inputCls} [&::-ms-reveal]:hidden ${
                  pwdForm.confirm && pwdForm.newPwd !== pwdForm.confirm
                    ? 'border-red-300 dark:border-red-700'
                    : ''
                }`}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={pwdLoading}
              className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-60 transition-colors"
            >
              {pwdLoading ? <><Loader2 size={14} className="animate-spin"/> {t('Saving...', 'सुरक्षित हुँदैछ...')}</> : <><Save size={14}/> {t('Update Password', 'पासवर्ड अद्यावधिक')}</>}
            </button>
          </form>
        </div>

        {/* Change Email */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-5 uppercase tracking-wide">
            {t('Change Email', 'इमेल परिवर्तन')}
          </h3>
          <form onSubmit={handleChangeEmail} className="space-y-4 max-w-md">
            <div>
              <Label>{t('New Email Address', 'नयाँ इमेल')}</Label>
              <input
                type="email"
                required
                value={emailForm.newEmail}
                onChange={e => setEmailForm(p => ({ ...p, newEmail: e.target.value }))}
                className={inputCls}
                placeholder="new@example.com"
              />
            </div>
            <div>
              <Label>{t('Confirm with Password', 'पासवर्डसँग पुष्टि')}</Label>
              <input
                type="password"
                required
                value={emailForm.password}
                onChange={e => setEmailForm(p => ({ ...p, password: e.target.value }))}
                className={`${inputCls} [&::-ms-reveal]:hidden`}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={emailLoading}
              className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-60 transition-colors"
            >
              {emailLoading ? <><Loader2 size={14} className="animate-spin"/> {t('Saving...', 'सुरक्षित हुँदैछ...')}</> : <><Save size={14}/> {t('Update Email', 'इमेल अद्यावधिक')}</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── About Tab ─────────────────────────────────────────────────────────────────
const AboutTab: React.FC = () => {
  const { t } = useLanguage();
  const toast = useToast();
  const [form, setForm] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profileService.getMine()
      .then(r => setForm(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const f = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileService.update(form);
      toast.success(t('About section saved!', 'About सेक्सन सुरक्षित!'));
    } catch {
      toast.error(t('Save failed', 'सुरक्षित असफल'));
    } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">{t('About Section', 'About सेक्सन')}</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
        {t('Edit your story, info cards, and stats shown on your personal site.', 'आफ्नो कथा, जानकारी कार्ड र तथ्याङ्क सम्पादन गर्नुस्।')}
      </p>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Info cards */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-5 uppercase tracking-wide">{t('Info Cards', 'जानकारी कार्डहरू')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('Where I\'m From', 'म कहाँबाट हुँ')}>
              <textarea className={textareaCls} rows={3} value={form.whereImFrom ?? ''} onChange={f('whereImFrom')}
                placeholder="Based in Nepal, working with clients globally..." />
            </Field>
            <Field label={t('Currently Doing', 'हाल गरिरहेको')}>
              <textarea className={textareaCls} rows={3} value={form.currentlyDoing ?? ''} onChange={f('currentlyDoing')}
                placeholder="Building software solutions, consulting..." />
            </Field>
            <Field label={t('My Goals', 'मेरा लक्ष्यहरू')}>
              <textarea className={textareaCls} rows={3} value={form.myGoals ?? ''} onChange={f('myGoals')}
                placeholder="Empowering communities through technology..." />
            </Field>
            <Field label={t('My Passion', 'मेरो जुनुन')}>
              <textarea className={textareaCls} rows={3} value={form.myPassion ?? ''} onChange={f('myPassion')}
                placeholder="I love solving real-world problems..." />
            </Field>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">{t('Stats on Photo', 'फोटोमा तथ्याङ्क')}</h3>
          <p className="text-xs text-gray-400 mb-5">{t('These 4 stats appear over your profile photo in the About section.', 'यी ४ तथ्याङ्क About सेक्सनमा तपाईंको फोटोमाथि देखिन्छन्।')}</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { valKey: 'statOneValue' as keyof Profile,   lblKey: 'statOneLabel' as keyof Profile,   defVal: '10+',  defLbl: 'Years Experience' },
              { valKey: 'statTwoValue' as keyof Profile,   lblKey: 'statTwoLabel' as keyof Profile,   defVal: '50+',  defLbl: 'Projects Completed' },
              { valKey: 'statThreeValue' as keyof Profile, lblKey: 'statThreeLabel' as keyof Profile, defVal: '100+', defLbl: 'Happy Clients' },
              { valKey: 'statFourValue' as keyof Profile,  lblKey: 'statFourLabel' as keyof Profile,  defVal: '15+',  defLbl: 'Certifications' },
            ].map((s, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">Stat {i + 1}</p>
                <div className="flex gap-3">
                  <div className="w-24">
                    <Label>{t('Value', 'मान')}</Label>
                    <input className={inputCls}
                      value={form[s.valKey] !== undefined && form[s.valKey] !== null ? String(form[s.valKey]) : s.defVal}
                      onChange={e => setForm(p => ({ ...p, [s.valKey]: e.target.value }))}
                      placeholder={s.defVal} />
                  </div>
                  <div className="flex-1">
                    <Label>{t('Label', 'लेबल')}</Label>
                    <input className={inputCls}
                      value={form[s.lblKey] !== undefined && form[s.lblKey] !== null ? String(form[s.lblKey]) : s.defLbl}
                      onChange={e => setForm(p => ({ ...p, [s.lblKey]: e.target.value }))}
                      placeholder={s.defLbl} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary-700 disabled:opacity-60">
          {saving ? <><Loader2 size={15} className="animate-spin"/> {t('Saving...', 'सुरक्षित हुँदैछ...')}</> : <><Save size={15}/> {t('Save About Section', 'About सेक्सन सुरक्षित')}</>}
        </button>
      </form>
    </div>
  );
};
