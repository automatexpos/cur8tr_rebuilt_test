# CUR8tr Design Guidelines

## Design Approach

**Neo-Brutalist Minimalism with Soft Palette**
Drawing inspiration from platforms like Linear's precision, Notion's clarity, and Pinterest's visual discovery, while applying neo-brutalist principles: bold borders, high contrast typography, geometric shapes, and unapologetic use of space.

## Typography System

**Font Stack:**
- Primary: "Space Grotesk" (headings, titles, navigation) - geometric, brutalist feel
- Secondary: "Inter" (body text, descriptions, UI elements) - highly legible

**Hierarchy:**
- Page Titles: text-5xl font-bold (Space Grotesk)
- Section Headers: text-3xl font-bold (Space Grotesk)
- Card Titles: text-xl font-semibold (Space Grotesk)
- Card Subtitles: text-sm font-medium (Inter)
- Body Text: text-base font-normal (Inter)
- UI Labels: text-xs font-medium uppercase tracking-wide (Inter)

## Layout System

**Spacing Primitives:** Consistent use of Tailwind units: 2, 4, 6, 8, 12, 16, 20, 24
- Micro spacing (within cards): 2, 4
- Component spacing: 6, 8, 12
- Section spacing: 16, 20, 24

**Grid System:**
- Landing page sections: max-w-7xl mx-auto px-6
- Card grids: grid gap-6 for desktop, gap-4 for mobile
- Recent Recs: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 (8 cards, 4 columns)
- Pro Tips: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 (4 cards)
- Featured CUR8trs: grid-cols-1 md:grid-cols-3 (3 user cards)
- CUR8tr Recs: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 (4-8 cards)

## Component Library

### Navigation
- Fixed top navigation: border-b-4 (thick neo-brutalist border)
- Logo: Bold, geometric wordmark
- Right section: Search icon, Profile dropdown, "Create Rec" button
- Mobile: Hamburger menu with full-screen overlay

### Recommendation Cards (Core Component)
- Image container: aspect-[4/5] with border-4 (thick border)
- Hover state: translate-y-[-4px] with matching border offset for 3D effect
- Image: object-cover w-full h-full
- Content overlay: Absolute positioned at bottom with backdrop-blur-md background
- Title: Truncate to 2 lines with text-ellipsis
- Subtitle: Truncate to 1 line
- Pro Tip badge: Absolute top-right, border-2, px-3 py-1, text-xs uppercase

### User Profile Cards
- Circular avatar: w-20 h-20 border-4 mx-auto
- Username: text-lg font-bold text-center mt-4
- Stats row: flex justify-center gap-4 text-sm
- Follow button: Full width, border-2, py-2

### Dashboard Stats
- Four stat boxes in grid-cols-2 md:grid-cols-4
- Each box: border-4, p-6, hover effect
- Number: text-4xl font-bold
- Label: text-sm uppercase tracking-wide mt-2

### Forms (Create/Edit Recommendation)
- Full-width layout with max-w-3xl
- Input groups with thick borders (border-2)
- Labels: text-sm font-medium uppercase tracking-wide mb-2
- Star rating: Large clickable stars with border-2 outline style
- Tag input: Pill-style tags with border-2, px-3 py-1, removable X
- Category dropdown: border-2 with chevron icon
- Image upload: Drag-and-drop zone with 4:5 aspect ratio preview, border-4 dashed
- Submit button: Large, full-width on mobile, border-4 with 3D offset effect

### Public Profile Page
- Hero section: User avatar (large, border-4), name, bio, stats, QR code icon
- QR code modal: Centered with generated QR code, downloadable
- Share link: Copy-to-clipboard input with border-2
- Recommendation grid: Same card style as landing page
- Category filters: Pill-style buttons with border-2, active state with filled background

### Search & Discovery
- Global search bar: Large, prominent, border-4, w-full max-w-2xl
- Tag cloud: Varying sizes for popular tags, border-2, hover states
- Category browse: Grid of category cards with icons, border-4, large tap targets

### Admin Interface
- Toggle switches for "Pro Tip" and "CUR8tr Rec" flags
- Simple checkboxes with thick borders
- Admin badge: Small pill on cards, border-2

## Landing Page Structure

**Section 1: Hero**
- Full-width banner with large heading: "Discover & Share Recommendations"
- Subheading explaining the platform
- Two CTA buttons: "Sign Up" (primary, border-4, 3D effect) and "Explore" (secondary, border-2)
- No background image - pure typographic statement with geometric shapes

**Section 2: Recent Recommendations**
- Section header with "Recent Recommendations" title
- 8-card grid as specified
- py-20 section spacing

**Section 3: Pro Tips**
- Distinctive section header with badge indicator
- 4-card grid with enhanced Pro Tip styling
- py-20 section spacing

**Section 4: Featured CUR8trs**
- Section header: "Featured CUR8trs"
- 3 user profile cards with follow buttons
- py-20 section spacing

**Section 5: CUR8tr Recs**
- Section header: "CUR8tr Recommends"
- 4-8 card grid with external link indicators (↗︎ icon)
- Cards have subtle different treatment showing they're curated picks
- py-20 section spacing

**Footer**
- Three-column layout: About, Quick Links, Social
- Newsletter signup with border-2 input and button
- Thick top border (border-t-4)
- py-16 spacing

## Interaction Patterns

**Buttons:**
- Primary: border-4, px-6 py-3, font-bold, shadow offset effect (shadow-[4px_4px_0px_0px])
- Secondary: border-2, px-6 py-3, font-medium
- Icon buttons: border-2, w-10 h-10 or w-12 h-12, centered icons

**Cards:**
- All cards use border-4 for strong definition
- Hover: Subtle lift with translate-y-[-4px] and shadow adjustment
- Click: Brief scale-down (scale-[0.98]) for tactile feedback

**Overlays & Modals:**
- Full-screen backdrop with backdrop-blur-sm
- Modal content: border-4, max-w-2xl, p-8
- Close button: Large X in top-right, border-2

## Images

**Hero Section:** No large hero image - typographic hero with geometric background shapes/patterns

**Recommendation Cards:**
- Primary visual focus of the entire platform
- 4:5 aspect ratio strictly enforced
- High-quality images required
- Buttons overlaid on images use backdrop-blur-md for readability

**User Avatars:**
- Circular with thick border-4
- Default avatar: Geometric pattern or initials with bold typography

**Empty States:**
- Illustrated empty states with bold line art
- Encouraging messages in large typography

## Responsive Behavior

**Mobile (< 768px):**
- All card grids collapse to single column
- Navigation becomes hamburger menu
- Sticky "Create Rec" FAB button (border-4, bottom-right)
- Reduced spacing: py-12 instead of py-20

**Tablet (768px - 1024px):**
- 2-column layouts for most grids
- Maintained thick borders and spacing

**Desktop (> 1024px):**
- Full multi-column layouts as specified
- Enhanced hover states with more pronounced 3D effects

## Accessibility

- All interactive elements have min-height of 44px
- Focus states: Thick focus ring (ring-4) matching neo-brutalist aesthetic
- High contrast maintained throughout
- Alt text required for all images
- Keyboard navigation for all interactive elements