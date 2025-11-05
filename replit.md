# CUR8tr - Neo-Brutalist Recommendation Sharing Platform

## Overview
CUR8tr is a social recommendation platform for discovering, creating, curating, and sharing recommendations across various categories. It features a distinctive neo-brutalist design. The platform aims to provide a unique space for users to share curated content and engage with others' recommendations.

## User Preferences
I want to prioritize iterative development. Please ask before making major architectural changes or introducing new external dependencies. For code changes, I prefer detailed explanations of the "why" behind the "what." Ensure that all new features have comprehensive E2E tests.

## System Architecture

### UI/UX Decisions
The platform employs a neo-brutalist aesthetic characterized by thick borders, 3D shadow effects, and bold typography. Space Grotesk is used for headings and Inter for body text. Custom color palettes and utilities like `hover-elevate` and `active-elevate-2` define the interactive elements.

**Card Design Specifications:**
- **User-generated recommendation cards**: 4:5 aspect ratio with like buttons and like counts
- **Admin promotional cards (CUR8tr Recommends)**: 9:16 aspect ratio (portrait) with price badges, no like buttons
- **RecommendationCard component**: Uses explicit `isAdminCard` boolean prop to determine card type and styling

### Technical Implementations
- **Authentication**: Email/password authentication with email verification codes. Users register with email, password, and username. A 6-digit verification code is sent to their email (expires in 10 minutes). Uses passport-local strategy with bcrypt for password hashing. Sessions are stored in PostgreSQL. Email service is configurable (supports Resend, SendGrid, Gmail, Outlook, or custom SMTP).
- **User Profiles**: Include bio, stats (recommendations, followers, following), QR code generation, and social media links. Avatar upload is integrated with object storage. The edit profile dialog features a scrollable layout with compact avatar preview to ensure all form controls (Save/Cancel buttons) are accessible.
- **Recommendations**: Users can create, browse, filter, and search recommendations. Features include star ratings, image uploads, location tagging, external URLs, and a "Pro Tip" text field. Users can edit and delete their own recommendations. Public/private visibility controls allow users to create private recommendations that only they can see.
- **Social Features**: Follow/unfollow users, like/unlike recommendations with real-time updates, and an activity feed displaying a mix of followed users' and community recommendations. Share functionality allows users to share recommendations via multiple channels (SMS, WhatsApp, Facebook, Twitter) or copy the link directly. Uses Web Share API on mobile devices for native sharing, with custom popover menu on desktop. Share buttons appear on recommendation cards (bottom-right of image) and detail pages.
- **Commenting System**: Comprehensive commenting with nested replies, allowing recommenders to reply to comments.
- **Category Management**: Users can create and delete custom categories from their profile page, OR create custom categories inline while creating a recommendation (via radio toggle between "Select existing" and "Create new" with automatic save for future use). Admins can curate "CUR8tr Recommendations" with an 8-item limit displayed on the landing page and a dedicated page.
- **Section Management**: Admins can create and manage sections for organizing "CUR8tr Recs" page. Each section has a title, subtitle, and display order. Sections can hold up to 8 user-created recommendations with custom ordering. Additionally, CUR8tr Recommends (admin promotional cards) can be optionally assigned to sections, allowing them to appear on both the landing page and within a chosen section on the CUR8tr Recs page. Category filtering hides admin recommends since they don't have categories. **Important**: Admin promotional cards only appear on the landing page and CUR8tr Recs page - they do NOT appear in Explore or Activity pages.
- **App Settings**: Key-value settings system for managing configurable content, including editable subtitle for the landing page "CUR8tr Recommends" section.
- **Image & Avatar Upload**: Integrated with Replit's object storage (Google Cloud Storage backend) using presigned URLs, drag-and-drop UI with Uppy, and validation for file size and type.
- **Map Functionality**: Real location-based discovery with geocoding (OpenStreetMap Nominatim API) and 50-mile radius search. Users can search for any location (e.g., "San Francisco, CA") and see all recommendations within that area. Features include Haversine distance calculations, interactive map with markers, and result grid display.

### Feature Specifications
- **Admin Dashboard**: Functionality for admins to manage CUR8tr Recommendations.
- **Activity Feed**: Personalized feed showing a mix of followed users' and community recommendations, with category filtering. Displays user recommendations in a responsive grid layout using the same RecommendationCard component as the Explore page.
- **Recommendation Detail Page**: Full view of recommendations with all details, creator info, and interactive features.
- **Content Management**: Users can delete their own recommendations and categories from their profile page.
- **Location Map**: Interactive map at /map route allowing users to search for locations and discover nearby recommendations. Shows markers on map and displays up to 6 recommendations in a grid below.

### System Design Choices
- **Backend**: PostgreSQL database managed with Drizzle ORM. Express.js for REST API endpoints.
- **Frontend**: React with TypeScript, Wouter for routing, TanStack Query v5 for server state management, and Shadcn/ui components with Tailwind CSS.
- **API Patterns**: React Query with array-based `queryKeys` for hierarchical invalidation. Protected endpoints utilize `isAuthenticated` middleware, and guest-friendly endpoints return empty arrays. Aggressive cache invalidation is used for real-time updates.

## External Dependencies
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Passport.js with local strategy (email/password)
- **Password Hashing**: bcrypt
- **Email Service**: Nodemailer (supports Resend, SendGrid, Gmail, Outlook, custom SMTP). Note: Email service credentials must be configured via environment variables (RESEND_API_KEY, SENDGRID_API_KEY, EMAIL_USER + EMAIL_PASSWORD, or SMTP_HOST + SMTP_PORT)
- **Object Storage**: Replit's built-in object storage (Google Cloud Storage backend)
- **Geocoding**: OpenStreetMap Nominatim API (free, no API key required)
- **UI Components**: Shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query v5
- **Routing**: Wouter
- **Image Upload UI**: Uppy (integrated for drag-and-drop functionality)
- **Icons**: react-icons/si (for social media icons)