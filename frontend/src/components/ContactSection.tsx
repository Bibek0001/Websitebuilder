import React, { useState } from 'react';
import { Mail, Phone, Globe, Link2, ArrowRight, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Profile } from '../types';
import SectionWrapper from './SectionWrapper';
import { contactService } from '../services/api';

interface ContactSectionProps { profile: Profile | null; }

const ContactSection: React.FC<ContactSectionProps> = ({ profile }) => {
  const { t } = useLanguage();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await contactService.send({ ...form, recipientSlug: profile?.slug });
      setSent(true);
      toast.success(t('Message sent!', 'सन्देश पठाइयो!'), t('I will get back to you within 24 hours.', 'म २४ घण्टाभित्र जवाफ दिनेछु।'));
      setTimeout(() => { setSent(false); setForm({ name: '', email: '', message: '' }); }, 5000);
    } catch {
      toast.error(t('Failed to send', 'पठाउन असफल'), t('Please try again or contact directly.', 'फेरि प्रयास गर्नुस् वा प्रत्यक्ष सम्पर्क गर्नुस्।'));
    } finally { setSending(false); }
  };

  const contacts = [
    {
      icon: <Mail size={20} />,
      label: 'Email',
      value: profile?.email || 'ram@example.com',
      href: `mailto:${profile?.email || 'ram@example.com'}`,
      color: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    },
    {
      icon: <Link2 size={20} />,
      label: 'LinkedIn',
      value: profile?.linkedin ? 'LinkedIn Profile' : 'linkedin.com/in/rambhandari',
      href: profile?.linkedin || '#',
      color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    },
    {
      icon: <Link2 size={20} />,
      label: 'GitHub',
      value: profile?.github ? 'GitHub Profile' : 'github.com/rambhandari',
      href: profile?.github || '#',
      color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    },
    {
      icon: <Link2 size={20} />,
      label: 'Facebook',
      value: profile?.facebook ? 'Facebook Profile' : 'facebook.com/rambhandari',
      href: profile?.facebook || '#',
      color: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    },
    {
      icon: <Phone size={20} />,
      label: 'WhatsApp',
      value: profile?.whatsapp || '+977 98XXXXXXXX',
      href: `https://wa.me/${(profile?.whatsapp || '').replace(/\D/g, '')}`,
      color: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    },
    {
      icon: <Globe size={20} />,
      label: t('Company', 'कम्पनी'),
      value: profile?.companyWebsite || 'www.company.com',
      href: profile?.companyWebsite || '#',
      color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <SectionWrapper
      id="contact"
      badge={t('Contact', 'सम्पर्क')}
      title={t("Let's Work Together", 'सँगै काम गरौँ')}
      subtitle={t('Have a project in mind or want to collaborate? I would love to hear from you.', 'कुनै परियोजना छ वा सहकार्य गर्न चाहनुहुन्छ? म तपाईंबाट सुन्न चाहन्छु।')}
    >
      <div className="grid lg:grid-cols-2 gap-12">

        {/* Left — contact info */}
        <div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">{t('Get in touch', 'सम्पर्कमा रहनुस्')}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
            {t('I am always open to discussing new projects, creative ideas, or opportunities to be part of an inspiring vision.', 'म सधैं नयाँ परियोजना, नवाचारी विचार वा प्रेरणादायी दृष्टिकोणको हिस्सा बन्ने अवसरहरूबारे छलफल गर्न खुला छु।')}
          </p>

          <div className="space-y-3">
            {contacts.filter(c => c.href !== '#').map(contact => (
              <a key={contact.label} href={contact.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 card hover:shadow-md transition-all group">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${contact.color}`}>
                  {contact.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{contact.label}</p>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{contact.value}</p>
                </div>
                <ArrowRight size={16} className="ml-auto text-gray-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {/* Right — contact form */}
        <div>
          <div className="card p-8">
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6">{t('Send a Message', 'सन्देश पठाउनुस्')}</h3>

            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle size={48} className="text-green-500 mb-4" />
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">{t('Message Sent!', 'सन्देश पठाइयो!')}</h4>
                <p className="text-sm text-gray-500">{t('I will get back to you within 24 hours.', 'म २४ घण्टाभित्र तपाईंलाई जवाफ दिनेछु।')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t('Your Name', 'तपाईंको नाम')}</label>
                  <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder={t('Ram Bhandari', 'राम भण्डारी')} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t('Email Address', 'इमेल')}</label>
                  <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t('Message', 'सन्देश')}</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder={t('Tell me about your project...', 'आफ्नो परियोजनाबारे बताउनुस्...')} />
                </div>
                <button type="submit" disabled={sending}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-60">
                  {sending ? <><Loader2 size={16} className="animate-spin"/> {t('Sending...', 'पठाउँदैछ...')}</> : <><Send size={16} /> {t('Send Message', 'सन्देश पठाउनुस्')}</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} <span className="font-semibold text-gray-600 dark:text-gray-400">{profile?.fullName || 'Ram Bhandari'}</span>.
          {' '}{t('All rights reserved.', 'सर्वाधिकार सुरक्षित।')}
        </p>
        <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
          © {new Date().getFullYear()} PersonalSite
        </p>
      </div>
    </SectionWrapper>
  );
};

export default ContactSection;
