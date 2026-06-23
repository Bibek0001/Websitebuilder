# PersonalSite.io — SaaS Personal Website Builder

A full-stack SaaS platform where professionals build their own personal website.
Built with **React + TypeScript** frontend and **ASP.NET Core 8** backend, connected to **SQL Server Express**.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  http://localhost:3000/              → Public Landing     │
│  http://localhost:3000/site/:slug   → User's Live Site   │
│  http://localhost:3000/dashboard    → User Dashboard     │
│  http://localhost:3000/admin        → SuperAdmin Panel   │
│  http://localhost:5283/api          → .NET Web API       │
│  SQL Server Express → PersonalWebsiteDB                  │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, TypeScript, Tailwind CSS  |
| Backend   | ASP.NET Core 8 Web API              |
| Database  | Microsoft SQL Server Express        |
| Auth      | JWT Bearer Tokens                   |
| Passwords | BCrypt                              |

---

## Features

### Public Landing Page (Wix-style)
- Animated hero with gradient background
- Live stats from database
- Feature highlights (9 features)
- Template gallery with category filter + hover preview
- How It Works (4-step process)
- Platform testimonials (from DB)
- Pricing comparison (Free / Pro)
- FAQ accordion
- Full footer with EN/NP toggle

### User Personal Website (`/site/:username`)
- Hero with typewriter role animation
- About Me with story + stats overlay on photo
- Skills/What I Do (6+ cards with icon + hover effect)
- Projects with filter, expandable problem/solution/results
- Interactive career timeline (education/career/achievement/certification)
- Searchable blog with tag filters (EN + NP content)
- Masonry gallery with lightbox
- Testimonials carousel + grid
- Contact section with form + all social links

### User Dashboard (`/dashboard`)
- Overview with quick links
- Profile (photo upload, CV upload, all social links)
- Projects CRUD
- Skills CRUD
- Timeline CRUD
- Blog CRUD (EN + NP)
- Gallery (upload + delete)
- Testimonials CRUD

### SuperAdmin Panel (`/admin`)
- Landing content editor (every text key, EN + NP)
- Template manager (create/edit/delete/toggle)
- Platform stats manager
- Platform testimonials manager
- User management (enable/disable/delete/view site)

### Global Features
- Dark / Light mode (persisted)
- English / Nepali language toggle (persisted)
- Fully responsive (mobile + tablet + desktop)
- Active nav section highlighting
- Scroll-triggered animations
- Skeleton loading states
- 404 not-found state for missing profiles

---

## Getting Started

### Prerequisites
- Node.js 18+
- .NET 8 SDK
- SQL Server Express (`Bibek\SQLEXPRESS`)

### Run Backend
```bash
cd backend
dotnet ef database update
dotnet run --launch-profile http
# Starts at http://localhost:5283
```

### Run Frontend
```bash
cd frontend
npm install
npm start
# Opens at http://localhost:3000
```

---

## Default Credentials

| Role       | Email                     | Password   |
|------------|---------------------------|------------|
| SuperAdmin | admin@personalsite.com    | Admin@123  |

SuperAdmin is auto-seeded on first run. After login, you are redirected to `/admin`.

---

## Database Tables

| Table                 | Purpose                              |
|-----------------------|--------------------------------------|
| Users                 | Auth + roles (user/superadmin)       |
| Profiles              | Personal info, photo, CV, social     |
| Projects              | Portfolio projects                   |
| Skills                | Skills/services cards                |
| TimelineItems         | Career history                       |
| BlogPosts             | Articles (EN + NP)                   |
| GalleryItems          | Photos                               |
| Testimonials          | Client feedback                      |
| LandingContents       | Landing page text (SuperAdmin only)  |
| SiteTemplates         | Template gallery (SuperAdmin only)   |
| PlatformStats         | Hero stats (SuperAdmin only)         |
| PlatformTestimonials  | Landing testimonials (SuperAdmin)    |

---

## Project Structure

```
/
├── frontend/src/
│   ├── components/        # All 10 personal site sections + SectionWrapper
│   ├── pages/             # LandingPage, PublicProfile, Dashboard, AdminPanel, Login, Register
│   ├── context/           # ThemeContext, AuthContext, LanguageContext
│   ├── services/          # api.ts (all API calls)
│   └── types/             # TypeScript interfaces
├── backend/
│   ├── Controllers/       # Auth, Profile, Content, Landing, Admin
│   ├── Data/              # EF Core DbContext
│   ├── Models/            # All entity models
│   ├── Services/          # JwtService
│   └── Migrations/        # EF Core migrations
└── database/              # SQL setup scripts
```
