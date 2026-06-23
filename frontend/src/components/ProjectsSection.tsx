import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Star, Wrench, TrendingUp, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Project } from '../types';
import SectionWrapper from './SectionWrapper';
import { getMediaUrl } from '../services/api';

interface ProjectsSectionProps { projects: Project[]; }

const defaultProjects: Project[] = [
  { id: 1, title: 'Revenue Management System', problem: 'Manual revenue collection causing significant delays, errors, and lack of transparency in municipal operations.', solution: 'Developed a fully automated digital revenue management platform with real-time reporting and audit trails.', technologies: 'React, .NET Core, SQL Server, Azure', results: 'Reduced processing time by 70%, improved accuracy to 99.8%, serving 50,000+ taxpayers.', featured: true, imageUrl: 'https://picsum.photos/seed/proj1/600/400', userId: 1 },
  { id: 2, title: 'Digital Citizen Charter System', problem: 'Citizens were unaware of government service timelines, requirements, and their rights.', solution: 'Built an online portal displaying all citizen services with real-time status tracking and notifications.', technologies: 'Angular, .NET Core, PostgreSQL', results: 'Served 100,000+ citizens, improved satisfaction by 85%, reduced service time by 60%.', featured: true, imageUrl: 'https://picsum.photos/seed/proj2/600/400', userId: 1 },
  { id: 3, title: 'E-Governance Solutions', problem: 'Paper-based processes causing delays, corruption risks, and poor service delivery in local government.', solution: 'End-to-end digitization of government workflows with secure document management and approvals.', technologies: '.NET, React, SQL Server, Azure', results: '80% reduction in paperwork, faster service delivery, improved transparency.', featured: true, imageUrl: 'https://picsum.photos/seed/proj3/600/400', userId: 1 },
  { id: 4, title: 'Cloud Hosting Platform', problem: 'Local businesses lacked affordable, reliable hosting infrastructure with local support.', solution: 'Built a cloud hosting platform with automated deployment, monitoring, and 24/7 local support.', technologies: 'Docker, Kubernetes, .NET, React', results: '200+ businesses onboarded, 99.9% uptime, 40% cost reduction vs international providers.', featured: false, imageUrl: 'https://picsum.photos/seed/proj4/600/400', userId: 1 },
];

const ProjectCard: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLanguage();
  const techs = project.technologies.split(',').map(s => s.trim());

  return (
    <div className={`group card overflow-hidden hover:shadow-xl transition-all duration-300 ${project.featured ? 'ring-2 ring-primary-500/20' : ''}`}
      style={{ animationDelay: `${index * 100}ms` }}>

      {/* Image */}
      {project.imageUrl && (
        <div className="relative overflow-hidden h-48">
          <img src={getMediaUrl(project.imageUrl) || project.imageUrl} alt={project.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {project.featured && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-yellow-400/90 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full">
              <Star size={10} fill="currentColor" /> {t('Featured', 'विशेष')}
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {project.title}
        </h3>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {techs.map(tech => <span key={tech} className="tag text-xs">{tech}</span>)}
        </div>

        {/* Problem (always visible) */}
        <div className="flex gap-2.5 mb-3">
          <AlertCircle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{project.problem}</p>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex gap-2.5">
              <Wrench size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide block mb-1">{t('Solution', 'समाधान')}</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{project.solution}</p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <TrendingUp size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide block mb-1">{t('Results', 'नतिजाहरू')}</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{project.results}</p>
              </div>
            </div>
          </div>
        )}

        {/* Toggle */}
        <button onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center gap-1.5 text-primary-600 dark:text-primary-400 text-sm font-semibold hover:gap-2.5 transition-all">
          {expanded
            ? <><ChevronUp size={15} /> {t('Show less', 'कम देखाउनुस्')}</>
            : <><ChevronDown size={15} /> {t('View details', 'विवरण हेर्नुस्')}</>}
        </button>
      </div>
    </div>
  );
};

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'featured'>('all');
  const display = projects.length > 0 ? projects : defaultProjects;
  const filtered = filter === 'featured' ? display.filter(p => p.featured) : display;

  return (
    <SectionWrapper
      id="projects"
      badge={t('Portfolio', 'पोर्टफोलियो')}
      title={t('Featured Projects', 'विशेष परियोजनाहरू')}
      subtitle={t('A selection of my most impactful work, from government solutions to cloud platforms.', 'मेरो सबैभन्दा प्रभावशाली कामको चयन।')}
      dark
    >
      {/* Filter tabs */}
      <div className="flex justify-center gap-2 mb-10">
        {(['all', 'featured'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              filter === f ? 'bg-primary-600 text-white shadow-md' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
            }`}>
            {f === 'all' ? t('All Projects', 'सबै परियोजनाहरू') : t('Featured', 'विशेष')}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        {filtered.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </SectionWrapper>
  );
};

export default ProjectsSection;
