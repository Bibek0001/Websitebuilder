import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Clock } from 'lucide-react';
import { blogService, getMediaUrl } from '../services/api';
import { BlogPost as BlogPostType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Logo from '../components/Logo';

const BlogPostPage: React.FC = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const { language } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const np = language === 'np';

  useEffect(() => {
    if (!id) return;
    blogService.getOne(parseInt(id))
      .then(r => {
        if (!r.data) { setNotFound(true); return; }
        setPost(r.data);
        const title = np && r.data.titleNp ? r.data.titleNp : r.data.title;
        document.title = `${title} | PersonalSite`;
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
    return () => { document.title = 'PersonalSite'; };
  }, [id, np]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound || !post) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-center px-4">
      <div>
        <p className="text-6xl font-black text-gray-200 dark:text-gray-800 mb-4">404</p>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Post not found</h1>
        <button onClick={() => navigate(-1)} className="text-primary-600 hover:underline flex items-center gap-1 mx-auto">
          <ArrowLeft size={16} /> Go back
        </button>
      </div>
    </div>
  );

  const title = np && post.titleNp ? post.titleNp : post.title;
  const content = np && post.contentNp ? post.contentNp : post.content;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Simple top bar */}
      <header className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Logo size={28} showText />
          <Link
            to={slug ? `/site/${slug}#blog` : '/'}
            className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={16} /> {np ? 'फिर्ता' : 'Back'}
          </Link>
        </div>
      </header>

      {/* Post content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Cover image */}
        {post.imageUrl && (
          <img src={getMediaUrl(post.imageUrl)} alt={title}
            className="w-full h-64 sm:h-80 object-cover rounded-2xl mb-8 shadow-sm" />
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-6">
          <span className="flex items-center gap-1"><Calendar size={13} /> {new Date(post.createdAt).toLocaleDateString()}</span>
          <span className="flex items-center gap-1"><Clock size={13} /> {Math.max(1, Math.ceil(content.split(' ').length / 200))} min read</span>
          {post.tags && post.tags.split(',').map(tag => (
            <span key={tag} className="flex items-center gap-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full font-medium">
              <Tag size={10} /> {tag.trim()}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight">
          {title}
        </h1>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
          {content ? (
            content.split('\n').map((para, i) =>
              para.trim() ? <p key={i} className="mb-4">{para}</p> : <br key={i} />
            )
          ) : (
            <p className="text-gray-400 italic">{np ? 'सामग्री उपलब्ध छैन।' : 'No content available.'}</p>
          )}
        </div>

        {/* Back button */}
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
          <Link
            to={slug ? `/site/${slug}#blog` : '/'}
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:gap-3 transition-all"
          >
            <ArrowLeft size={16} /> {np ? 'ब्लगमा फिर्ता' : 'Back to Blog'}
          </Link>
        </div>
      </main>
    </div>
  );
};

export default BlogPostPage;
