export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'superadmin';
  token?: string;
}

export interface Profile {
  id: number;
  userId: number;
  fullName: string;
  tagline: string;
  bio: string;
  photoUrl?: string;
  cvUrl?: string;
  email?: string;
  linkedin?: string;
  github?: string;
  facebook?: string;
  whatsapp?: string;
  companyWebsite?: string;
  slug: string;
  selectedTemplate?: string;
  accentColor?: string;
  // About section
  whereImFrom?: string;
  currentlyDoing?: string;
  myGoals?: string;
  myPassion?: string;
  statOneValue?: string;
  statOneLabel?: string;
  statTwoValue?: string;
  statTwoLabel?: string;
  statThreeValue?: string;
  statThreeLabel?: string;
  statFourValue?: string;
  statFourLabel?: string;
  // Skills section heading
  skillsBadge?: string;
  skillsTitle?: string;
  skillsSubtitle?: string;
}

export interface Project {
  id: number;
  title: string;
  problem: string;
  solution: string;
  technologies: string;
  results: string;
  imageUrl?: string;
  featured: boolean;
  userId: number;
}

export interface Skill {
  id: number;
  title: string;
  description: string;
  icon: string;
  sortOrder?: number;
  userId: number;
}

export interface TimelineItem {
  id: number;
  title: string;
  organization: string;
  description: string;
  startDate: string;
  endDate?: string;
  type: 'education' | 'career' | 'achievement' | 'certification';
  sortOrder?: number;
  userId: number;
}

export interface BlogPost {
  id: number;
  title: string;
  titleNp?: string;
  content: string;
  contentNp?: string;
  excerpt: string;
  tags: string;
  imageUrl?: string;
  published: boolean;
  createdAt: string;
  userId: number;
}

export interface GalleryItem {
  id: number;
  imageUrl: string;
  caption?: string;
  category: string;
  userId: number;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  organization: string;
  content: string;
  photoUrl?: string;
  userId: number;
}

// Landing page types
export interface LandingContent {
  id: number;
  key: string;
  value: string;
  valueNp?: string;
  section: string;
}

export interface SiteTemplate {
  id: number;
  name: string;
  description: string;
  previewImageUrl: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
}

export interface PlatformStat {
  id: number;
  label: string;
  labelNp: string;
  value: string;
  icon: string;
  sortOrder: number;
}

export interface PlatformTestimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  photoUrl?: string;
  isActive: boolean;
}

export interface PlatformFeature {
  id: number;
  title: string;
  titleNp: string;
  description: string;
  descriptionNp: string;
  icon: string;
  iconColor: string;
  isActive: boolean;
  sortOrder: number;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface PlatformSettingItem {
  id: number;
  key: string;
  value: string;
  group: string;
  description: string;
  updatedAt: string;
}
