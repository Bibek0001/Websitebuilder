import React from 'react';
import { MapPin, Calendar, Target, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Profile } from '../types';
import SectionWrapper from './SectionWrapper';
import { getMediaUrl } from '../services/api';

interface AboutSectionProps { profile: Profile | null; }

const AboutSection: React.FC<AboutSectionProps> = ({ profile }) => {
  const { t } = useLanguage();

  // Info cards — fully from DB profile
  const cards = [
    {
      icon: <MapPin size={20} />,
      title: t('Where I\'m From', 'म कहाँबाट हुँ'),
      text: profile?.whereImFrom || t(
        'Based in Nepal, working with clients globally across technology and governance sectors.',
        'नेपालमा आधारित, विश्वभर प्रविधि र शासन क्षेत्रमा काम गर्दैछु।'
      ),
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    },
    {
      icon: <Calendar size={20} />,
      title: t('Currently Doing', 'हाल गरिरहेको काम'),
      text: profile?.currentlyDoing || t(
        'Building software solutions, consulting for IT projects, and advocating for digital transformation in local governance.',
        'सफ्टवेयर समाधान निर्माण, IT परियोजना परामर्श र स्थानीय शासनमा डिजिटल रूपान्तरण।'
      ),
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    },
    {
      icon: <Target size={20} />,
      title: t('My Goals', 'मेरा लक्ष्यहरू'),
      text: profile?.myGoals || t(
        'Empowering communities through technology, building sustainable digital ecosystems, and mentoring the next generation of tech leaders.',
        'प्रविधिमार्फत समुदायलाई सशक्त बनाउने र डिजिटल पारिस्थितिकी प्रणाली निर्माण।'
      ),
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    },
    {
      icon: <Heart size={20} />,
      title: t('My Passion', 'मेरो जुनुन'),
      text: profile?.myPassion || t(
        'I love solving real-world problems with elegant code, bridging the gap between technology and government services.',
        'वास्तविक समस्याहरू कोडसँग समाधान गर्न र प्रविधि र सरकारी सेवाबीच सेतु बन्न मन पर्छ।'
      ),
      color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
    },
  ];

  // Stats from profile DB fields
  const stats = [
    { value: profile?.statOneValue || '10+',   label: profile?.statOneLabel || t('Years Experience', 'वर्षको अनुभव') },
    { value: profile?.statTwoValue || '50+',   label: profile?.statTwoLabel || t('Projects Completed', 'सम्पन्न परियोजनाहरू') },
    { value: profile?.statThreeValue || '100+',label: profile?.statThreeLabel || t('Happy Clients', 'सन्तुष्ट ग्राहकहरू') },
    { value: profile?.statFourValue || '15+',  label: profile?.statFourLabel || t('Certifications', 'प्रमाणपत्रहरू') },
  ];

  return (
    <SectionWrapper
      id="about"
      badge={t('About', 'बारे')}
      title={t('About Me', 'मेरो बारे')}
      subtitle={t('Get to know who I am, where I come from, and what drives me every day.', 'म को हुँ, कहाँबाट आएको हुँ र मलाई के प्रेरित गर्छ भनी जान्नुहोस्।')}
      dark
    >
      <div className="grid lg:grid-cols-2 gap-16 items-center">

        {/* Left — Photo + stats overlay */}
        <div className="relative">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={getMediaUrl(profile?.photoUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || 'User')}&size=600&background=2563eb&color=fff&bold=true`}
              alt={profile?.fullName || 'Profile'}
              className="w-full h-[460px] object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Stats grid over photo — all from DB */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="grid grid-cols-4 gap-2">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/20">
                    <div className="text-xl font-extrabold text-white">{stat.value}</div>
                    <div className="text-xs text-white/70 mt-0.5 leading-tight">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Decorative corners */}
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-2xl -z-10 rotate-6" />
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-100 dark:bg-purple-900/30 rounded-2xl -z-10 -rotate-6" />
        </div>

        {/* Right — Story + info cards */}
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4">
            {t('My Story', 'मेरो कथा')}
          </h3>
          <div className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8 space-y-3">
            <p>
              {profile?.bio || t(
                'I am a passionate Software Developer, Entrepreneur, and Technology Enthusiast with over a decade of experience building digital solutions that matter.',
                'म एक उत्साही सफ्टवेयर डेभलपर, उद्यमी र प्रविधि उत्साही हुँ।'
              )}
            </p>
          </div>

          {/* Info cards — 2x2 grid, all from DB */}
          <div className="grid sm:grid-cols-2 gap-4">
            {cards.map((card, i) => (
              <div key={i} className="card p-5 hover:shadow-md transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                  {card.icon}
                </div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{card.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default AboutSection;
