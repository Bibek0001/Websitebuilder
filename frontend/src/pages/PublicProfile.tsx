import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import SkillsSection from '../components/SkillsSection';
import ProjectsSection from '../components/ProjectsSection';
import TimelineSection from '../components/TimelineSection';
import BlogSection from '../components/BlogSection';
import GallerySection from '../components/GallerySection';
import TestimonialsSection from '../components/TestimonialsSection';
import ContactSection from '../components/ContactSection';
import {
  profileService, projectService, skillService,
  timelineService, blogService, galleryService, testimonialService, getMediaUrl
} from '../services/api';
import { Profile, Project, Skill, TimelineItem, BlogPost, GalleryItem, Testimonial } from '../types';
import { applyColorToDOM } from '../context/PrimaryColorContext';

const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton rounded-xl ${className}`} />
);

const LoadingState: React.FC = () => (
  <div className="min-h-screen bg-white dark:bg-gray-950">
    <div className="h-16 skeleton" />
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <div className="skeleton w-32 h-32 rounded-full" />
      <SkeletonBlock className="w-64 h-8" />
      <SkeletonBlock className="w-96 h-4" />
      <SkeletonBlock className="w-80 h-4" />
      <div className="flex gap-3 mt-4">
        <SkeletonBlock className="w-32 h-11" />
        <SkeletonBlock className="w-32 h-11" />
      </div>
    </div>
  </div>
);

const NotFoundState: React.FC<{ slug: string }> = ({ slug }) => (
  <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
    <div className="text-center px-4">
      <div className="text-6xl font-black text-gray-200 dark:text-gray-800 mb-4">404</div>
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Profile not found</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        No profile found for <span className="font-mono text-primary-600">@{slug}</span>
      </p>
      <Link to="/" className="btn-primary inline-flex">Back to Home</Link>
    </div>
  </div>
);

const PublicProfile: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const profileRes = await profileService.get(slug || 'ram-bhandari');
        const p: Profile = profileRes.data;
        setProfile(p);

        // Apply the user's chosen accent color to the site
        if (p.accentColor && /^#[0-9A-Fa-f]{6}$/.test(p.accentColor)) {
          applyColorToDOM(p.accentColor);
        }

        // Update page title and Open Graph meta tags dynamically
        document.title = `${p.fullName} | Personal Website`;
        const setMeta = (name: string, content: string) => {
          let el = document.querySelector(`meta[property="${name}"]`) as HTMLMetaElement
            || document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
          if (!el) {
            el = document.createElement('meta');
            el.setAttribute(name.startsWith('og:') || name.startsWith('twitter:') ? 'property' : 'name', name);
            document.head.appendChild(el);
          }
          el.setAttribute('content', content);
        };
        const siteUrl = window.location.href;
        const photo = getMediaUrl(p.photoUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.fullName)}&background=2563eb&color=fff&size=400&bold=true`;
        setMeta('og:title', p.fullName);
        setMeta('og:description', p.tagline || 'Personal Website');
        setMeta('og:image', photo);
        setMeta('og:url', siteUrl);
        setMeta('og:type', 'profile');
        setMeta('twitter:card', 'summary_large_image');
        setMeta('twitter:title', p.fullName);
        setMeta('twitter:description', p.tagline || 'Personal Website');
        setMeta('twitter:image', photo);

        const [projRes, skillRes, tlRes, blogRes, galRes, testRes] = await Promise.all([
          projectService.getAll(p.userId),
          skillService.getAll(p.userId),
          timelineService.getAll(p.userId),
          blogService.getAll(p.userId),
          galleryService.getAll(p.userId),
          testimonialService.getAll(p.userId),
        ]);

        setProjects(projRes.data);
        setSkills(skillRes.data);
        setTimeline(tlRes.data);
        setPosts(blogRes.data);
        setGallery(galRes.data);
        setTestimonials(testRes.data);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setNotFound(true);
        }
        // If API is not available, show with default content
        console.log('API not available — showing with default content.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    return () => {
      document.title = 'PersonalSite';
      // Reset to platform primary color when leaving a user's site
      applyColorToDOM('#2563eb');
    };
  }, [slug]);

  if (loading) return <LoadingState />;
  if (notFound) return <NotFoundState slug={slug || 'unknown'} />;

  // Map selectedTemplate to a CSS theme class applied to the root wrapper
  const templateClass = (() => {
    const t = profile?.selectedTemplate?.toLowerCase() || 'default';
    if (t.includes('dark') || t.includes('creative'))  return 'theme-dark';
    if (t.includes('minimal') || t.includes('white'))  return 'theme-minimal';
    if (t.includes('corporate') || t.includes('green')) return 'theme-corporate';
    if (t.includes('purple') || t.includes('tech'))    return 'theme-purple';
    if (t.includes('warm') || t.includes('personal'))  return 'theme-warm';
    return 'theme-default';
  })();

  return (
    <div className={`min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white ${templateClass}`}>
      <Navbar profile={profile} />
      <HeroSection profile={profile} />
      <AboutSection profile={profile} />
      <SkillsSection skills={skills} profile={profile} />
      <ProjectsSection projects={projects} />
      <TimelineSection items={timeline} />
      <BlogSection posts={posts} slug={slug} />
      <GallerySection items={gallery} />
      <TestimonialsSection testimonials={testimonials} />
      <ContactSection profile={profile} />
    </div>
  );
};

export default PublicProfile;
