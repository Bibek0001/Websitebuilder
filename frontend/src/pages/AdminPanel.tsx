import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService, getMediaUrl } from '../services/api';
import { LandingContent, SiteTemplate, PlatformStat, PlatformTestimonial, PlatformFeature, PlatformSettingItem, AdminUser } from '../types';
import {
  LogOut, FileText, Layout, BarChart2, MessageSquare, Users,
  Save, Trash2, Plus, ExternalLink, Shield, Eye, EyeOff,
  Edit2, X, Globe, Check, TrendingUp, Star, Palette, Settings
} from 'lucide-react';
import Logo from '../components/Logo';
import { applyColorToDOM } from '../context/PrimaryColorContext';

type AdminTab = 'overview' | 'content' | 'features' | 'templates' | 'stats' | 'testimonials' | 'users' | 'settings';

const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',      label: 'Overview',         icon: <TrendingUp size={17}/> },
  { id: 'content',       label: 'Landing Content',  icon: <FileText size={17}/> },
  { id: 'features',      label: 'Features',         icon: <Star size={17}/> },
  { id: 'templates',     label: 'Templates',        icon: <Layout size={17}/> },
  { id: 'stats',         label: 'Platform Stats',   icon: <BarChart2 size={17}/> },
  { id: 'testimonials',  label: 'Testimonials',     icon: <MessageSquare size={17}/> },
  { id: 'users',         label: 'Users',            icon: <Users size={17}/> },
  { id: 'settings',      label: 'Settings',         icon: <Settings size={17}/> },
];

const inputCls = "w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all";
const textareaCls = `${inputCls} resize-none`;

const AdminPanel: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { tab: tabParam } = useParams<{ tab?: AdminTab }>();
  const [activeTab, setActiveTab] = useState<AdminTab>((tabParam as AdminTab) || 'overview');
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    adminService.getUsers().then(r => setUserCount(r.data.length)).catch(() => {});
  }, []);

  const changeTab = (id: AdminTab) => {
    setActiveTab(id);
    navigate(id === 'overview' ? '/admin' : `/admin/${id}`, { replace: true });
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col fixed h-full z-10">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <Logo size={30} showText />
          <div className="flex items-center gap-2 mt-3">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-primary-600 rounded-md flex items-center justify-center flex-shrink-0">
              <Shield size={13} className="text-white" />
            </div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">SuperAdmin</span>
          </div>
          <p className="text-xs text-gray-400 truncate mt-1">{user?.email}</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => changeTab(t.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === t.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
          <Link to="/" target="_blank"
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors font-medium">
            <Globe size={14} /> View Public Site
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1 p-8 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'overview'     && <AdminOverview userCount={userCount} onNavigate={changeTab} />}
          {activeTab === 'content'      && <ContentManager />}
          {activeTab === 'features'     && <FeaturesManager />}
          {activeTab === 'templates'    && <TemplateManager />}
          {activeTab === 'stats'        && <StatsManager />}
          {activeTab === 'testimonials' && <TestimonialManager />}
          {activeTab === 'users'        && <UserManager />}
          {activeTab === 'settings'     && <SettingsManager />}
        </div>
      </main>
    </div>
  );
};

// ── Overview ─────────────────────────────────────────────────────────────────
const AdminOverview: React.FC<{ userCount: number; onNavigate: (t: AdminTab) => void }> = ({ userCount, onNavigate }) => (
  <div>
    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Admin Overview</h1>
    <p className="text-gray-500 text-sm mb-8">Manage every aspect of the platform.</p>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {[
        { icon: <Users size={20}/>, label: 'Total Users', value: `${userCount}`, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600', tab: 'users' as AdminTab },
        { icon: <Layout size={20}/>, label: 'Templates', value: 'Manage', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600', tab: 'templates' as AdminTab },
        { icon: <FileText size={20}/>, label: 'Landing Content', value: 'Edit', color: 'bg-green-50 dark:bg-green-900/20 text-green-600', tab: 'content' as AdminTab },
        { icon: <BarChart2 size={20}/>, label: 'Platform Stats', value: 'Update', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600', tab: 'stats' as AdminTab },
        { icon: <Star size={20}/>, label: 'Features Cards', value: 'Manage', color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600', tab: 'features' as AdminTab },
        { icon: <MessageSquare size={20}/>, label: 'Testimonials', value: 'Manage', color: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600', tab: 'testimonials' as AdminTab },
      ].map(card => (
        <button key={card.label} onClick={() => card.tab && onNavigate(card.tab)}
          className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all text-left group">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>{card.icon}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
          <p className="font-extrabold text-xl text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{card.value}</p>
        </button>
      ))}
    </div>
    <div className="bg-gradient-to-r from-primary-600 to-purple-700 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-3 mb-2">
        <Logo size={22} showText={false} dark noLink />
        <h3 className="font-bold">Quick Tip</h3>
      </div>
      <p className="text-primary-100 text-sm">Edit the Landing Content tab to change hero text, features, and pricing shown on the public homepage. All changes are live immediately.</p>
    </div>
  </div>
);

// ── Content Manager ───────────────────────────────────────────────────────────
const ContentManager: React.FC = () => {
  const [items, setItems] = useState<LandingContent[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => { adminService.getAllContent().then(r => setItems(r.data)).catch(() => {}); }, []);

  const sections = [...new Set(items.map(i => i.section))];

  const handleSave = async (item: LandingContent) => {
    setSaving(item.key);
    try {
      await adminService.upsertContent(item.key, { value: item.value, valueNp: item.valueNp, section: item.section });
      setSaved(item.key);
      setTimeout(() => setSaved(null), 2000);
    } finally { setSaving(null); }
  };

  const update = (key: string, field: 'value' | 'valueNp', val: string) =>
    setItems(prev => prev.map(i => i.key === key ? { ...i, [field]: val } : i));

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Landing Content</h1>
      <p className="text-gray-500 text-sm mb-8">Edit every text block shown on the public landing page. Changes go live immediately.</p>

      <div className="space-y-6">
        {sections.map(section => (
          <div key={section} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary-600 dark:text-primary-400">{section}</h3>
            </div>
            <div className="p-6 space-y-5">
              {items.filter(i => i.section === section).map(item => (
                <div key={item.key}>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 font-mono">{item.key}</label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">🇬🇧 English</label>
                      <input value={item.value} onChange={e => update(item.key, 'value', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">🇳🇵 Nepali</label>
                      <div className="flex gap-2">
                        <input value={item.valueNp || ''} onChange={e => update(item.key, 'valueNp', e.target.value)} className={`${inputCls} flex-1`} />
                        <button onClick={() => handleSave(item)} disabled={saving === item.key}
                          className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                            saved === item.key ? 'bg-green-600 text-white' : 'bg-primary-600 hover:bg-primary-700 text-white'
                          } disabled:opacity-50`}>
                          {saved === item.key ? <Check size={13}/> : <Save size={13}/>}
                          {saving === item.key ? 'Saving...' : saved === item.key ? 'Saved!' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Template Manager ──────────────────────────────────────────────────────────
const TemplateManager: React.FC = () => {
  const blank = { name: '', description: '', previewImageUrl: '', category: 'Professional', isActive: true, sortOrder: 0 };
  const [templates, setTemplates] = useState<SiteTemplate[]>([]);
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => adminService.getTemplates().then(r => setTemplates(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId !== null) await adminService.updateTemplate(editId, form);
    else await adminService.createTemplate(form);
    setShowForm(false); setEditId(null); setForm(blank); load();
  };

  const startEdit = (t: SiteTemplate) => {
    setForm({ name: t.name, description: t.description, previewImageUrl: t.previewImageUrl, category: t.category, isActive: t.isActive, sortOrder: t.sortOrder });
    setEditId(t.id); setShowForm(true);
  };

  const del = async (id: number) => { if (window.confirm('Delete template?')) { await adminService.deleteTemplate(id); load(); } };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Templates</h1>
          <p className="text-gray-500 text-sm mt-0.5">{templates.length} templates available</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(blank); }}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors shadow-sm">
          <Plus size={16}/> Add Template
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">{editId ? 'Edit Template' : 'New Template'}</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18}/></button>
          </div>
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Name</label><input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className={inputCls} /></div>
            <div><label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className={inputCls}>
                {['Professional','Creative','Minimal','Corporate'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2"><label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Description</label><input required value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className={inputCls} /></div>
            <div className="sm:col-span-2"><label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Preview Image URL</label><input required value={form.previewImageUrl} onChange={e => setForm(p => ({...p, previewImageUrl: e.target.value}))} className={inputCls} placeholder="https://..." /></div>
            <div className="flex items-center gap-2.5 mt-5">
              <input type="checkbox" id="tActive" checked={form.isActive} onChange={e => setForm(p => ({...p, isActive: e.target.checked}))} className="w-4 h-4 accent-primary-600" />
              <label htmlFor="tActive" className="text-sm text-gray-600 dark:text-gray-400">Active (visible on landing page)</label>
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button type="submit" className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700">{editId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(t => (
          <div key={t.id} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 group">
            <div className="relative overflow-hidden h-40">
              <img src={t.previewImageUrl} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute top-2 right-2 flex gap-1.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {t.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.category}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => startEdit(t)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"><Edit2 size={14}/></button>
                  <button onClick={() => del(t.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Stats Manager ─────────────────────────────────────────────────────────────
const StatsManager: React.FC = () => {
  const blank = { label: '', labelNp: '', value: '', icon: 'Users', sortOrder: 0 };
  const [stats, setStats] = useState<PlatformStat[]>([]);
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState<number | null>(null);

  const load = () => adminService.getStats().then(r => setStats(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId !== null) await adminService.updateStat(editId, form);
    else await adminService.createStat(form);
    setForm(blank); setEditId(null); load();
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Platform Stats</h1>
      <p className="text-gray-500 text-sm mb-8">These numbers appear in the hero section of the landing page.</p>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
        <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-4">{editId ? 'Edit Stat' : 'Add New Stat'}</h3>
        <form onSubmit={submit} className="grid sm:grid-cols-4 gap-3">
          {[['label','Label (EN)'],['labelNp','Label (NP)'],['value','Value (e.g. 500+)']].map(([k, l]) => (
            <div key={k}>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">{l}</label>
              <input required value={(form as any)[k]} onChange={e => setForm(p => ({...p,[k]:e.target.value}))} className={inputCls} />
            </div>
          ))}
          <div className="flex items-end gap-2">
            <button type="submit" className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 flex items-center justify-center gap-1">
              <Plus size={14}/> {editId ? 'Update' : 'Add'}
            </button>
            {editId && <button type="button" onClick={() => { setEditId(null); setForm(blank); }} className="px-3 py-2.5 rounded-xl border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"><X size={14}/></button>}
          </div>
        </form>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.id} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-3xl font-black text-primary-600 dark:text-primary-400">{s.value}</p>
            <p className="font-semibold text-sm text-gray-900 dark:text-white mt-1">{s.label}</p>
            <p className="text-xs text-gray-400">{s.labelNp}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => { setForm({ label: s.label, labelNp: s.labelNp, value: s.value, icon: s.icon, sortOrder: s.sortOrder }); setEditId(s.id); }}
                className="flex items-center gap-1 text-xs text-primary-600 hover:underline"><Edit2 size={12}/> Edit</button>
              <button onClick={async () => { await adminService.deleteStat(s.id); load(); }}
                className="flex items-center gap-1 text-xs text-red-500 hover:underline"><Trash2 size={12}/> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Testimonial Manager ───────────────────────────────────────────────────────
const TestimonialManager: React.FC = () => {
  const blank = { name: '', role: '', content: '', photoUrl: '', isActive: true };
  const [items, setItems] = useState<PlatformTestimonial[]>([]);
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => adminService.getPlatformTestimonials().then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId !== null) await adminService.updatePlatformTestimonial(editId, form);
    else await adminService.createPlatformTestimonial(form);
    setShowForm(false); setEditId(null); setForm(blank); load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Platform Testimonials</h1>
          <p className="text-gray-500 text-sm mt-0.5">Shown on the public landing page</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(blank); }}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700">
          <Plus size={16}/> Add
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
            {[['name','Name'],['role','Role / Title'],['photoUrl','Photo URL (optional)']].map(([k,l]) => (
              <div key={k}>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">{l}</label>
                <input className={inputCls} required={k !== 'photoUrl'} value={(form as any)[k]} onChange={e => setForm(p => ({...p,[k]:e.target.value}))} />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Testimonial Content</label>
              <textarea required rows={3} className={textareaCls} value={form.content} onChange={e => setForm(p => ({...p, content: e.target.value}))} />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700">{editId ? 'Update' : 'Add'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm border dark:border-gray-700">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-sm italic text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">"{item.content}"</p>
            <div className="flex items-center gap-3 mb-4">
              <img src={getMediaUrl(item.photoUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=2563eb&color=fff&size=40`} alt={item.name} className="w-9 h-9 rounded-full" />
              <div><p className="font-bold text-sm">{item.name}</p><p className="text-xs text-gray-500">{item.role}</p></div>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {item.isActive ? <><Eye size={10} className="inline mr-1"/>Live</> : <><EyeOff size={10} className="inline mr-1"/>Hidden</>}
              </span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setForm({ name: item.name, role: item.role, content: item.content, photoUrl: item.photoUrl||'', isActive: item.isActive }); setEditId(item.id); setShowForm(true); }}
                className="flex items-center gap-1 text-xs text-primary-600 hover:underline"><Edit2 size={12}/> Edit</button>
              <button onClick={async () => { await adminService.deletePlatformTestimonial(item.id); load(); }}
                className="flex items-center gap-1 text-xs text-red-500 hover:underline"><Trash2 size={12}/> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── User Manager ──────────────────────────────────────────────────────────────
const UserManager: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const load = () => adminService.getUsers().then(r => setUsers(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const toggle = async (id: number) => { await adminService.toggleUser(id); load(); };
  const del = async (id: number) => { if (window.confirm('Delete this user and all their website data permanently?')) { await adminService.deleteUser(id); load(); } };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">{users.length} registered users</p>
        </div>
        <div className="relative w-full sm:w-64">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
            className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-5 py-3.5 text-left">User</th>
                <th className="px-5 py-3.5 text-left">Email</th>
                <th className="px-5 py-3.5 text-left">Joined</th>
                <th className="px-5 py-3.5 text-left">Status</th>
                <th className="px-5 py-3.5 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=2563eb&color=fff&size=32&bold=true`} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{u.username}</p>
                        <p className="text-xs text-gray-400">{u.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{u.email}</td>
                  <td className="px-5 py-3.5 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold ${u.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggle(u.id)} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${u.isActive ? 'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100' : 'bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100'}`}>
                        {u.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <Link to={`/site/${u.username}`} target="_blank" className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="View site">
                        <ExternalLink size={14}/>
                      </Link>
                      <button onClick={() => del(u.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete user">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

// ── Features Manager ──────────────────────────────────────────────────────────
const iconOptions = ['Palette','Globe2','Moon','Smartphone','Search','BarChart2','Clock','Award','Shield','Code2','Network','Cloud','Cpu','ClipboardList','Layout','Zap','Users','BookOpen','Image','TrendingUp','Lock'];
const colorOptions = ['blue','green','purple','orange','pink','indigo','teal','yellow','red'];

const FeaturesManager: React.FC = () => {
  const blank = { title:'', titleNp:'', description:'', descriptionNp:'', icon:'Palette', iconColor:'blue', isActive:true, sortOrder:0 };
  const [items, setItems] = useState<PlatformFeature[]>([]);
  const [form, setForm] = useState<Partial<PlatformFeature>>(blank);
  const [editId, setEditId] = useState<number|null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => adminService.getFeatures().then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId !== null) await adminService.updateFeature(editId, form);
    else await adminService.createFeature(form);
    setShowForm(false); setEditId(null); setForm(blank); load();
  };

  const startEdit = (item: PlatformFeature) => {
    setForm({ title: item.title, titleNp: item.titleNp, description: item.description, descriptionNp: item.descriptionNp, icon: item.icon, iconColor: item.iconColor, isActive: item.isActive, sortOrder: item.sortOrder });
    setEditId(item.id); setShowForm(true);
  };

  const colorPreview: Record<string, string> = {
    blue:'bg-blue-100 text-blue-600', green:'bg-green-100 text-green-600', purple:'bg-purple-100 text-purple-600',
    orange:'bg-orange-100 text-orange-600', pink:'bg-pink-100 text-pink-600', indigo:'bg-indigo-100 text-indigo-600',
    teal:'bg-teal-100 text-teal-600', yellow:'bg-yellow-100 text-yellow-600', red:'bg-red-100 text-red-600',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Features Cards</h1>
          <p className="text-gray-500 text-sm mt-0.5">These cards appear in the Features section of the landing page. {items.length} features</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(blank); }}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 shadow-sm">
          <Plus size={16}/> Add Feature
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-gray-900 dark:text-white">{editId ? 'Edit Feature Card' : 'New Feature Card'}</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"><X size={18}/></button>
          </div>
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Title (English)</label>
              <input required className={inputCls} value={form.title||''} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Beautiful Templates" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Title (Nepali)</label>
              <input className={inputCls} value={form.titleNp||''} onChange={e=>setForm(p=>({...p,titleNp:e.target.value}))} placeholder="सुन्दर टेम्प्लेटहरू" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Description (English)</label>
              <textarea required rows={2} className={textareaCls} value={form.description||''} onChange={e=>setForm(p=>({...p,description:e.target.value}))} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Description (Nepali)</label>
              <textarea rows={2} className={textareaCls} value={form.descriptionNp||''} onChange={e=>setForm(p=>({...p,descriptionNp:e.target.value}))} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Icon (Lucide name)</label>
              <select className={inputCls} value={form.icon||'Palette'} onChange={e=>setForm(p=>({...p,icon:e.target.value}))}>
                {iconOptions.map(i=><option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Icon Color</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {colorOptions.map(col => (
                  <button key={col} type="button" onClick={()=>setForm(p=>({...p,iconColor:col}))}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${colorPreview[col]?.split(' ')[0]} ${form.iconColor===col ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`}
                    title={col} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2.5 mt-4">
              <input type="checkbox" id="fActive" checked={!!form.isActive} onChange={e=>setForm(p=>({...p,isActive:e.target.checked}))} className="w-4 h-4 accent-primary-600" />
              <label htmlFor="fActive" className="text-sm text-gray-600 dark:text-gray-400 font-medium">Active (visible on landing page)</label>
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-4 border-t dark:border-gray-700">
              <button type="submit" className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700">{editId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Preview grid — exactly like the landing page */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => {
          const colors = colorPreview[item.iconColor] || colorPreview.blue;
          return (
            <div key={item.id} className={`bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 ${!item.isActive ? 'opacity-50' : ''}`}>
              {/* Icon preview */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${colors.split(' ')[0]}`}>
                <span className={colors.split(' ')[1]}><Palette size={20}/></span>
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.titleNp}</p>
              <p className="text-xs text-gray-400 line-clamp-2 mb-3">{item.description}</p>
              <div className="flex items-center gap-2 justify-between">
                <div className="flex gap-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.isActive ? 'Active' : 'Hidden'}
                  </span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                    {item.icon}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"><Edit2 size={13}/></button>
                  <button onClick={async () => { if (window.confirm('Delete this feature card?')) { await adminService.deleteFeature(item.id); load(); } }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={13}/></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <Star size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">No features yet. Add your first feature card.</p>
        </div>
      )}
    </div>
  );
};

// ── Color Picker Component ─────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { hex: '#2563eb', name: 'Primary Blue' },
  { hex: '#3b82f6', name: 'Sky Blue' },
  { hex: '#0ea5e9', name: 'Cyan' },
  { hex: '#6366f1', name: 'Indigo' },
  { hex: '#7c3aed', name: 'Violet' },
  { hex: '#a855f7', name: 'Purple' },
  { hex: '#d946ef', name: 'Fuchsia' },
  { hex: '#ec4899', name: 'Pink' },
  { hex: '#16a34a', name: 'Green' },
  { hex: '#059669', name: 'Emerald' },
  { hex: '#0d9488', name: 'Teal' },
  { hex: '#65a30d', name: 'Lime' },
  { hex: '#dc2626', name: 'Red' },
  { hex: '#ea580c', name: 'Orange' },
  { hex: '#d97706', name: 'Amber' },
  { hex: '#ca8a04', name: 'Yellow' },
  { hex: '#374151', name: 'Dark Gray' },
  { hex: '#6b7280', name: 'Gray' },
  { hex: '#1e293b', name: 'Slate' },
  { hex: '#0f172a', name: 'Near Black' },
];

const ColorPicker: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(value);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const handleOpen = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + window.scrollY + 6, left: r.left + window.scrollX, width: Math.max(r.width, 320) });
    }
    setOpen(o => !o);
  };

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.closest('[data-colorpicker]')?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = (hex: string) => {
    onChange(hex); setCustom(hex); setOpen(false);
  };

  const handleCustomInput = (v: string) => {
    setCustom(v);
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) onChange(v);
  };

  return (
    <div data-colorpicker="true" className="relative w-full">
      {/* Trigger */}
      <button ref={btnRef} type="button" onClick={handleOpen}
        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-400 transition-all text-left group">
        <span className="w-6 h-6 rounded-lg flex-shrink-0 shadow-sm ring-1 ring-black/10" style={{ backgroundColor: value }} />
        <span className="text-sm font-mono text-gray-700 dark:text-gray-200 flex-1">{value}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {/* Portal-style fixed dropdown */}
      {open && (
        <div
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: Math.max(pos.width, 340), zIndex: 9999 }}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-5">

          {/* Preset grid */}
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Preset Colors</p>
          <div className="grid grid-cols-10 gap-2 mb-5">
            {COLOR_PRESETS.map(preset => (
              <button key={preset.hex} type="button" title={preset.name}
                onClick={() => handleSelect(preset.hex)}
                className={`w-7 h-7 rounded-lg transition-all hover:scale-110 ring-offset-1 ${
                  value === preset.hex
                    ? 'ring-2 ring-primary-600 scale-110 shadow-md'
                    : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-500'
                }`}
                style={{ backgroundColor: preset.hex }}
              />
            ))}
          </div>

          {/* Custom input row */}
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Custom</p>
          <div className="flex items-center gap-2 mb-4">
            <input type="color" value={custom} onChange={e => handleSelect(e.target.value)}
              className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer flex-shrink-0 bg-white p-0.5" />
            <input type="text" value={custom} onChange={e => handleCustomInput(e.target.value)}
              placeholder="#000000" maxLength={7}
              className="flex-1 px-3 py-2.5 text-sm font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
            <button type="button" onClick={() => { onChange(custom); setOpen(false); }}
              className="px-4 py-2.5 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition-colors">
              Apply
            </button>
          </div>

          {/* Preview bar */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="w-8 h-8 rounded-lg shadow flex-shrink-0" style={{ backgroundColor: value }} />
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">Selected</p>
              <p className="text-xs font-mono text-gray-400">{value}</p>
            </div>
            {/* Light/dark preview */}
            <div className="flex gap-1">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shadow-sm" title="On light bg">
                <div className="w-4 h-4 rounded-md" style={{ backgroundColor: value }} />
              </div>
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center shadow-sm" title="On dark bg">
                <div className="w-4 h-4 rounded-md" style={{ backgroundColor: value }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Settings Manager ──────────────────────────────────────────────────────────
const groupLabels: Record<string, { label: string; desc: string; color: string }> = {
  general:    { label: 'General',    desc: 'Basic platform configuration',         color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
  appearance: { label: 'Appearance', desc: 'Theme and visual defaults',             color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
  security:   { label: 'Security',   desc: 'Authentication and access controls',   color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
  smtp:       { label: 'SMTP / Email', desc: 'Email server configuration',         color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
};

const SettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettingItem[]>([]);
  const [localVals, setLocalVals] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getSettings()
      .then(r => {
        setSettings(r.data);
        const map: Record<string, string> = {};
        r.data.forEach((s: PlatformSettingItem) => { map[s.key] = s.value; });
        setLocalVals(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setLocalVals(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveGroup = async (group: string) => {
    setSaving(true);
    try {
      const updates = settings
        .filter(s => s.group === group)
        .map(s => ({ key: s.key, value: localVals[s.key] ?? s.value }));
      await adminService.saveAllSettings(updates);

      // If appearance group saved, apply primary color immediately to DOM
      if (group === 'appearance') {
        const colorVal = localVals['appearance.primaryColor'];
        if (colorVal && /^#[0-9A-Fa-f]{6}$/.test(colorVal)) {
          applyColorToDOM(colorVal);
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {}
    finally { setSaving(false); }
  };

  const groups = [...new Set(settings.map(s => s.group))];

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Settings</h1>
      <p className="text-gray-500 text-sm mb-8">Configure platform-wide settings. Changes are saved per group.</p>

      <div className="space-y-6">
        {groups.map(group => {
          const cfg = groupLabels[group] || { label: group, desc: '', color: 'text-gray-600 bg-gray-50' };
          const groupItems = settings.filter(s => s.group === group);
          return (
            <div key={group} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              {/* Group header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  <span className="text-xs text-gray-400">{cfg.desc}</span>
                </div>
                <button
                  onClick={() => handleSaveGroup(group)}
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex-shrink-0">
                  {saved ? <Check size={13}/> : <Save size={13}/>}
                  {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Group'}
                </button>
              </div>

              {/* Settings rows */}
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {groupItems.map(setting => {
                  const val = localVals[setting.key] ?? setting.value;
                  const isBool = val === 'true' || val === 'false';
                  const isColor = setting.key.includes('Color');
                  const isPassword = setting.key.includes('password') || setting.key.includes('Password');

                  return (
                    <div key={setting.key} className="px-6 py-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{setting.key.split('.').pop()}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{setting.key}</p>
                        {setting.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{setting.description}</p>
                        )}
                      </div>

                      <div className="flex-shrink-0 w-64">
                        {isBool ? (
                          /* Toggle switch for boolean values */
                          <button
                            onClick={() => handleChange(setting.key, val === 'true' ? 'false' : 'true')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              val === 'true' ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              val === 'true' ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        ) : isColor ? (
                          /* Multi-color selection with presets + custom */
                          <ColorPicker
                            value={val || '#2563eb'}
                            onChange={v => handleChange(setting.key, v)}
                          />
                        ) : (
                          /* Text / number / password input */
                          <input
                            type={isPassword ? 'password' : 'text'}
                            value={val}
                            onChange={e => handleChange(setting.key, e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
