import React, { useState } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { GalleryItem } from '../types';
import SectionWrapper from './SectionWrapper';
import { getMediaUrl } from '../services/api';

interface GallerySectionProps { items: GalleryItem[]; }

const categories = ['All', 'Office', 'Training', 'Conference', 'Community', 'Travel'];

const defaultItems: GalleryItem[] = [
  { id: 1, imageUrl: 'https://picsum.photos/seed/gal1/500/400', caption: 'Office Activities', category: 'Office', userId: 1 },
  { id: 2, imageUrl: 'https://picsum.photos/seed/gal2/500/600', caption: 'Training Workshop 2024', category: 'Training', userId: 1 },
  { id: 3, imageUrl: 'https://picsum.photos/seed/gal3/600/400', caption: 'National Tech Conference', category: 'Conference', userId: 1 },
  { id: 4, imageUrl: 'https://picsum.photos/seed/gal4/400/500', caption: 'Community Program', category: 'Community', userId: 1 },
  { id: 5, imageUrl: 'https://picsum.photos/seed/gal5/600/500', caption: 'Team Building', category: 'Office', userId: 1 },
  { id: 6, imageUrl: 'https://picsum.photos/seed/gal6/500/400', caption: 'Travel Experience', category: 'Travel', userId: 1 },
  { id: 7, imageUrl: 'https://picsum.photos/seed/gal7/400/400', caption: 'Digital Nepal Forum', category: 'Conference', userId: 1 },
  { id: 8, imageUrl: 'https://picsum.photos/seed/gal8/500/600', caption: 'Skills Training', category: 'Training', userId: 1 },
];

const GallerySection: React.FC<GallerySectionProps> = ({ items }) => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const display = items.length > 0 ? items : defaultItems;
  const filtered = activeCategory === 'All' ? display : display.filter(i => i.category === activeCategory);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => setLightboxIndex(i => i !== null ? (i - 1 + filtered.length) % filtered.length : null);
  const nextImage = () => setLightboxIndex(i => i !== null ? (i + 1) % filtered.length : null);

  return (
    <SectionWrapper
      id="gallery"
      badge={t('Gallery', 'ग्यालेरी')}
      title={t('My Gallery', 'मेरो ग्यालेरी')}
      subtitle={t('Moments from conferences, workshops, community programs, and everyday work life.', 'सम्मेलन, कार्यशाला, सामुदायिक कार्यक्रम र दैनिक कार्य जीवनका क्षणहरू।')}
    >
      {/* Category filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300 dark:hover:border-primary-600'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry-style grid */}
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
        {filtered.map((item, index) => (
          <div key={item.id}
            className="group relative break-inside-avoid rounded-2xl overflow-hidden cursor-pointer mb-3"
            onClick={() => openLightbox(index)}>
            <img src={getMediaUrl(item.imageUrl)} alt={item.caption || ''}
              className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              {item.caption && <p className="text-white text-xs font-medium">{item.caption}</p>}
              <span className="text-white/70 text-xs mt-1">{item.category}</span>
            </div>
            <div className="absolute top-3 right-3 bg-black/40 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn size={14} />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 rounded-full p-2 transition-colors">
            <X size={22} />
          </button>
          <button onClick={e => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 text-white/70 hover:text-white bg-white/10 rounded-full p-2 transition-colors">
            <ChevronLeft size={22} />
          </button>
          <button onClick={e => { e.stopPropagation(); nextImage(); }}
            className="absolute right-14 text-white/70 hover:text-white bg-white/10 rounded-full p-2 transition-colors">
            <ChevronRight size={22} />
          </button>

          <div className="max-w-4xl max-h-[85vh] p-4" onClick={e => e.stopPropagation()}>
            <img src={getMediaUrl(filtered[lightboxIndex].imageUrl)} alt={filtered[lightboxIndex].caption || ''}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl" />
            {filtered[lightboxIndex].caption && (
              <p className="text-white/80 text-center mt-3 text-sm">{filtered[lightboxIndex].caption}</p>
            )}
            <p className="text-white/40 text-center text-xs mt-1">{lightboxIndex + 1} / {filtered.length}</p>
          </div>
        </div>
      )}
    </SectionWrapper>
  );
};

export default GallerySection;
