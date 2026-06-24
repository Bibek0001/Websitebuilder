import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Testimonial } from '../types';
import SectionWrapper from './SectionWrapper';
import { getMediaUrl } from '../services/api';

interface TestimonialsSectionProps { testimonials: Testimonial[]; }

const defaultTestimonials: Testimonial[] = [
  { id: 1, name: 'Bikash Sharma', role: 'Mayor', organization: 'Pokhara Metropolitan City', content: "Ram's digital transformation work has significantly improved how we deliver services to citizens. His technical expertise combined with deep understanding of governance is truly remarkable.", photoUrl: '', userId: 1 },
  { id: 2, name: 'Sunita Thapa', role: 'IT Manager', organization: 'Nepal Telecom', content: 'Working with Ram on our infrastructure modernization project was exceptional. Professional, knowledgeable, results-oriented, and always ahead of schedule.', photoUrl: '', userId: 1 },
  { id: 3, name: 'Rajesh Pradhan', role: 'CEO', organization: 'Digital Nepal Foundation', content: "Ram's vision for a digitally empowered Nepal is inspiring. He understands both the technical and social dimensions of transformation like no one else I've worked with.", photoUrl: '', userId: 1 },
  { id: 4, name: 'Priya Adhikari', role: 'Director', organization: 'Ministry of IT', content: 'The e-governance solutions developed by Ram have transformed our service delivery. Citizens are much happier and our processes are now paperless and transparent.', photoUrl: '', userId: 1 },
];

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  const { t } = useLanguage();
  const display = testimonials.length > 0 ? testimonials : defaultTestimonials;
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % display.length), 5000);
    return () => clearInterval(timer);
  }, [autoplay, display.length]);

  const prev = () => { setAutoplay(false); setCurrent(c => (c - 1 + display.length) % display.length); };
  const next = () => { setAutoplay(false); setCurrent(c => (c + 1) % display.length); };

  return (
    <SectionWrapper
      id="testimonials"
      badge={t('Testimonials', 'प्रशंसापत्र')}
      title={t('What People Say', 'मान्छेहरू के भन्छन्')}
      subtitle={t('Feedback from clients, colleagues, and government organizations I have had the privilege to work with.', 'मैले काम गर्ने अवसर पाएका ग्राहकहरू, सहकर्मीहरू र सरकारी संस्थाहरूको प्रतिक्रिया।')}
      dark
    >
      {/* Featured testimonial (carousel) */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="relative card p-8 md:p-12 overflow-hidden">
          {/* Large quote */}
          <Quote size={80} className="absolute top-4 left-4 text-primary-100 dark:text-primary-900/40 -rotate-6" />

          <div className="relative z-10">
            {/* Stars */}
            <div className="flex gap-1 mb-6 justify-center">
              {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" className="text-yellow-400" />)}
            </div>

            {/* Quote text */}
            <blockquote className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed text-center italic mb-8">
              "{display[current].content}"
            </blockquote>

            {/* Author */}
            <div className="flex flex-col items-center gap-2">
              <img
                src={getMediaUrl(display[current].photoUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(display[current].name)}&background=2563eb&color=fff&size=64&bold=true`}
                alt={display[current].name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-primary-100 dark:ring-primary-900/40"
              />
              <div className="text-center">
                <p className="font-extrabold text-gray-900 dark:text-white">{display[current].name}</p>
                <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{display[current].role}</p>
                <p className="text-xs text-gray-500">{display[current].organization}</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center mt-8">
            <button onClick={prev} className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {display.map((_, i) => (
                <button key={i} onClick={() => { setAutoplay(false); setCurrent(i); }}
                  className={`transition-all rounded-full ${i === current ? 'w-6 h-2 bg-primary-600' : 'w-2 h-2 bg-gray-300 dark:bg-gray-600'}`} />
              ))}
            </div>
            <button onClick={next} className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* All cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {display.map((item, i) => (
          <div key={item.id}
            onClick={() => { setAutoplay(false); setCurrent(i); }}
            className={`card p-5 cursor-pointer transition-all duration-300 ${i === current ? 'ring-2 ring-primary-500 shadow-lg' : 'hover:shadow-md'}`}>
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, s) => <Star key={s} size={12} fill="currentColor" className="text-yellow-400" />)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-4 line-clamp-3">"{item.content}"</p>
            <div className="flex items-center gap-2.5">
              <img
                src={getMediaUrl(item.photoUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=2563eb&color=fff&size=36&bold=true`}
                alt={item.name}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="font-bold text-xs text-gray-900 dark:text-white truncate">{item.name}</p>
                <p className="text-xs text-gray-500 truncate">{item.organization}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default TestimonialsSection;
