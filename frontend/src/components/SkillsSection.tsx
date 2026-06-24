import React from 'react';
import { Code2, MonitorSmartphone, Network, Cloud, Cpu, ClipboardList, Globe2, Shield, BarChart2, Palette } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Profile, Skill } from '../types';
import SectionWrapper from './SectionWrapper';

interface SkillsSectionProps { skills: Skill[]; profile?: Profile | null; }

const iconMap: Record<string, React.ReactNode> = {
  Code2: <Code2 size={26} />, MonitorSmartphone: <MonitorSmartphone size={26} />,
  Network: <Network size={26} />, Cloud: <Cloud size={26} />,
  Cpu: <Cpu size={26} />, ClipboardList: <ClipboardList size={26} />,
  Globe2: <Globe2 size={26} />, Shield: <Shield size={26} />,
  BarChart2: <BarChart2 size={26} />, Palette: <Palette size={26} />,
};

const colorPalette = [
  'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600',
  'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600',
  'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 group-hover:bg-green-600',
  'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 group-hover:bg-orange-600',
  'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 group-hover:bg-pink-600',
  'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600',
  'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 group-hover:bg-teal-600',
  'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 group-hover:bg-red-600',
  'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 group-hover:bg-yellow-600',
];

const defaultSkills: Skill[] = [
  { id: 1, icon: 'Code2', title: 'Software Development', description: 'Building robust web and mobile applications using modern frameworks and best practices.', userId: 1 },
  { id: 2, icon: 'MonitorSmartphone', title: 'IT Consulting', description: 'Strategic technology consulting to help organizations achieve their digital goals.', userId: 1 },
  { id: 3, icon: 'Network', title: 'Network & Infrastructure', description: 'Designing and managing secure, scalable network infrastructure solutions.', userId: 1 },
  { id: 4, icon: 'Cloud', title: 'Cloud Solutions', description: 'Cloud architecture, migration strategies, and hosting platform management.', userId: 1 },
  { id: 5, icon: 'Cpu', title: 'Digital Transformation', description: 'Leading digital transformation initiatives for governments and enterprises.', userId: 1 },
  { id: 6, icon: 'ClipboardList', title: 'Project Management', description: 'End-to-end project delivery with agile and traditional methodologies.', userId: 1 },
];

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, profile }) => {
  const { t } = useLanguage();
  const display = skills.length > 0 ? skills : defaultSkills;

  const badge    = profile?.skillsBadge    || t('Expertise', 'विशेषज्ञता');
  const title    = profile?.skillsTitle    || t('What I Do', 'म के गर्छु');
  const subtitle = profile?.skillsSubtitle || t('My expertise spans across multiple domains of technology and business strategy.', 'मेरो विशेषज्ञता प्रविधि र व्यापार रणनीतिका धेरै क्षेत्रहरूमा फैलिएको छ।');

  return (
    <SectionWrapper
      id="skills"
      badge={badge}
      title={title}
      subtitle={subtitle}
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {display.map((skill, i) => {
          const colorClass = colorPalette[i % colorPalette.length];
          return (
            <div key={skill.id}
              className="group card-hover p-6 cursor-default">
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:text-white group-hover:shadow-lg ${colorClass}`}>
                {iconMap[skill.icon] || <Code2 size={26} />}
              </div>

              {/* Content */}
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {skill.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {skill.description}
              </p>

              {/* Bottom accent */}
              <div className="mt-4 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-500" />
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
};

export default SkillsSection;
