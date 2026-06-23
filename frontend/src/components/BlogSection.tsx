import React, { useState } from 'react';
import { Search, Calendar, Tag, ArrowRight, Clock } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { BlogPost } from '../types';
import SectionWrapper from './SectionWrapper';
import { getMediaUrl } from '../services/api';

interface BlogSectionProps { posts: BlogPost[]; slug?: string; }

const defaultPosts: BlogPost[] = [
  { id: 1, title: 'Digital Transformation in Local Government', titleNp: 'स्थानीय सरकारमा डिजिटल रूपान्तरण', content: '', contentNp: '', excerpt: 'How emerging technology is revolutionizing public service delivery at the local government level in Nepal.', tags: 'Digital Transformation,Government,Technology', imageUrl: 'https://picsum.photos/seed/blog1/600/400', published: true, createdAt: '2024-01-15', userId: 1 },
  { id: 2, title: 'Cloud Solutions for Small Businesses', titleNp: 'साना व्यवसायका लागि क्लाउड समाधान', content: '', contentNp: '', excerpt: 'A practical guide to adopting cloud technology without breaking the budget. Real lessons from the field.', tags: 'Cloud,Business,AWS', imageUrl: 'https://picsum.photos/seed/blog2/600/400', published: true, createdAt: '2024-02-20', userId: 1 },
  { id: 3, title: 'Lessons from Building a Tech Startup in Nepal', titleNp: 'नेपालमा टेक स्टार्टअप बनाउँदाका पाठहरू', content: '', contentNp: '', excerpt: 'Personal experiences and key lessons learned from founding and scaling a technology company in a developing market.', tags: 'Entrepreneurship,Startup,Leadership', imageUrl: 'https://picsum.photos/seed/blog3/600/400', published: true, createdAt: '2024-03-10', userId: 1 },
  { id: 4, title: 'Why Every Professional Needs a Personal Website', titleNp: 'किन प्रत्येक पेशेवरलाई व्यक्तिगत वेबसाइट चाहिन्छ', content: '', contentNp: '', excerpt: 'In the digital age, your online presence is your first impression. Here is why a personal website is non-negotiable.', tags: 'Career,Personal Branding,Web', imageUrl: 'https://picsum.photos/seed/blog4/600/400', published: true, createdAt: '2024-04-05', userId: 1 },
];

const BlogSection: React.FC<BlogSectionProps> = ({ posts, slug }) => {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const display = posts.length > 0 ? posts : defaultPosts;
  const allTags = [...new Set(display.flatMap(p => p.tags.split(',').map(s => s.trim())))];

  const filtered = display.filter(p => {
    const title = language === 'np' && p.titleNp ? p.titleNp : p.title;
    const matchSearch = !search || title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchTag = !activeTag || p.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  return (
    <SectionWrapper
      id="blog"
      badge={t('Articles', 'लेखहरू')}
      title={t('Blog & Insights', 'ब्लग र विचारहरू')}
      subtitle={t('Sharing knowledge about technology, entrepreneurship, and digital transformation.', 'प्रविधि, उद्यमशीलता र डिजिटल रूपान्तरणबारे ज्ञान साझा गर्दैछु।')}
      dark
    >
      {/* Search + tag filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('Search articles...', 'लेखहरू खोज्नुस्...')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveTag(null)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${!activeTag ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300'}`}>
            {t('All', 'सबै')}
          </button>
          {allTags.slice(0, 6).map(tag => (
            <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${activeTag === tag ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300'}`}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Posts grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {filtered.map(post => (
          <article key={post.id} className="group card-hover overflow-hidden">
            {post.imageUrl && (
              <div className="relative overflow-hidden h-48">
                <img src={getMediaUrl(post.imageUrl)} alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            )}
            <div className="p-6">
              {/* Meta */}
              <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {t('5 min read', '५ मिनेट पढाइ')}</span>
              </div>

              {/* Title */}
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                {language === 'np' && post.titleNp ? post.titleNp : post.title}
              </h3>

              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {post.tags.split(',').slice(0, 3).map(tag => (
                  <span key={tag} className="flex items-center gap-1 tag text-xs">
                    <Tag size={9} /> {tag.trim()}
                  </span>
                ))}
              </div>

              <Link
                to={slug ? `/site/${slug}/blog/${post.id}` : '#'}
                className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 text-sm font-semibold group-hover:gap-2.5 transition-all">
                {t('Read More', 'थप पढ्नुस्')} <ArrowRight size={14} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Search size={32} className="mx-auto mb-3 opacity-40" />
          <p>{t('No articles found for your search.', 'तपाईंको खोजका लागि कुनै लेख फेला परेन।')}</p>
        </div>
      )}
    </SectionWrapper>
  );
};

export default BlogSection;
