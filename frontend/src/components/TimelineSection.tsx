import React from 'react';
import { GraduationCap, Briefcase, Trophy, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TimelineItem } from '../types';
import SectionWrapper from './SectionWrapper';

interface TimelineSectionProps { items: TimelineItem[]; }

const defaultItems: TimelineItem[] = [
  { id: 1, title: 'Bachelor in Computer Science', organization: 'Tribhuvan University', description: 'Graduated with distinction in Computer Science and Information Technology.', startDate: '2005', endDate: '2009', type: 'education', userId: 1 },
  { id: 2, title: 'Software Developer', organization: 'Tech Company Nepal', description: 'Developed enterprise applications for government and corporate clients.', startDate: '2010', endDate: '2014', type: 'career', userId: 1 },
  { id: 3, title: 'Founded IT Company', organization: 'Dailo Tech Pvt. Ltd.', description: 'Established a technology company focused on digital transformation solutions.', startDate: '2015', type: 'achievement', userId: 1 },
  { id: 4, title: 'AWS Certified Solutions Architect', organization: 'Amazon Web Services', description: 'Achieved professional-level AWS Solutions Architect certification.', startDate: '2018', type: 'certification', userId: 1 },
  { id: 5, title: 'IT Director', organization: 'Government of Nepal', description: 'Led digital transformation initiatives across multiple government departments.', startDate: '2019', type: 'career', userId: 1 },
];

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  education:    { icon: <GraduationCap size={18}/>, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-600',    border: 'border-blue-200 dark:border-blue-800' },
  career:       { icon: <Briefcase size={18}/>,    color: 'text-green-600 dark:text-green-400', bg: 'bg-green-600',  border: 'border-green-200 dark:border-green-800' },
  achievement:  { icon: <Trophy size={18}/>,       color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-200 dark:border-yellow-800' },
  certification:{ icon: <Award size={18}/>,        color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-600', border: 'border-purple-200 dark:border-purple-800' },
};

const TimelineSection: React.FC<TimelineSectionProps> = ({ items }) => {
  const { t } = useLanguage();
  const display = items.length > 0 ? items : defaultItems;

  return (
    <SectionWrapper
      id="timeline"
      badge={t('Journey', 'यात्रा')}
      title={t('Professional Journey', 'व्यावसायिक यात्रा')}
      subtitle={t('A visual story of my education, career milestones, achievements, and certifications.', 'मेरो शिक्षा, क्यारियर माइलस्टोन, उपलब्धि र प्रमाणपत्रहरूको दृश्य कथा।')}
    >
      <div className="relative max-w-3xl mx-auto">
        {/* Center line */}
        <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-purple-500 to-transparent dark:from-primary-600 dark:via-purple-600 sm:-translate-x-1/2" />

        <div className="space-y-8">
          {display.map((item, index) => {
            const cfg = typeConfig[item.type] || typeConfig.career;
            const isRight = index % 2 === 0;

            return (
              <div key={item.id} className={`relative flex items-start gap-4 sm:gap-0 group ${isRight ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>

                {/* Card */}
                <div className={`ml-16 sm:ml-0 sm:w-[46%] ${isRight ? 'sm:pr-8 sm:text-right' : 'sm:pl-8'}`}>
                  <div className="card p-5 group-hover:shadow-lg transition-all duration-300 border-l-4 sm:border-l-0 sm:border-t-4 dark:border-t dark:border-l-0" style={{ borderLeftColor: cfg.bg.replace('bg-', ''), borderTopColor: 'transparent' }}>
                    <div className={`flex items-center gap-2 mb-2 ${isRight ? 'sm:flex-row-reverse sm:justify-end' : ''}`}>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.border} border ${cfg.color} bg-opacity-10`}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {item.startDate}{item.endDate ? ` – ${item.endDate}` : ` – ${t('Present', 'हाल')}`}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-sm mb-1">{item.title}</h3>
                    <p className={`text-xs font-semibold mb-2 ${cfg.color}`}>{item.organization}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                {/* Center icon */}
                <div className="absolute left-3 sm:left-1/2 sm:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full text-white shadow-lg transition-transform group-hover:scale-110 z-10"
                  style={{ top: '20px' }}>
                  <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center text-white shadow-md`}>
                    {cfg.icon}
                  </div>
                </div>

                {/* Spacer */}
                <div className="hidden sm:block sm:w-[46%]" />
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default TimelineSection;
