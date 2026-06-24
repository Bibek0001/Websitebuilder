import React, { useEffect, useRef, useState } from 'react';

interface SectionWrapperProps {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  centered?: boolean;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  id, title, subtitle, badge, children, className = '', dark = false, centered = true
}) => {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      className={`section-padding ${dark ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-950'} ${className}`}
    >
      <div className="container-max">
        {/* Section header */}
        <div className={`mb-14 ${centered ? 'text-center' : ''} ${visible ? 'animate-slide-up' : 'opacity-0'}`}>
          {badge && (
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-3">
              {badge}
            </span>
          )}
          <h2 className="section-title text-gray-900 dark:text-white">{title}</h2>
          <div className={`section-divider ${!centered ? 'ml-0' : ''}`} />
          {subtitle && (
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed text-base mt-2 mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content */}
        <div className={visible ? 'animate-fade-in' : 'opacity-0'}>
          {children}
        </div>
      </div>
    </section>
  );
};

export default SectionWrapper;
