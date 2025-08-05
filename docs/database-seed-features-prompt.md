# Database Seed Data - Default Project Features

## Prompt for Database Assistant

Create comprehensive seed data for the Visual Prompt Builder's default component library. These features represent common web application components that users can drag and drop to build their applications.

## Database Tables to Populate

### 1. `component_library` Table
Create a master library of reusable components organized by category.

### 2. `feature_templates` Table
Pre-configured feature sets that combine multiple components.

## Component Categories & Features to Seed

### 🔐 Authentication & Authorization
```sql
-- Authentication Components
('auth-login', 'Email/Password Login', 'authentication', {
  "description": "Standard login form with email and password",
  "requirements": ["form validation", "password visibility toggle", "remember me"],
  "defaultConfig": {
    "showSocialLogin": true,
    "enableBiometric": false,
    "passwordRules": "min8chars"
  }
}),
('auth-signup', 'User Registration', 'authentication', {
  "description": "Complete signup flow with validation",
  "requirements": ["email verification", "password strength", "terms acceptance"],
  "defaultConfig": {
    "requireEmailVerification": true,
    "captchaEnabled": true
  }
}),
('auth-oauth', 'Social Login', 'authentication', {
  "description": "OAuth providers integration",
  "providers": ["google", "github", "facebook", "twitter"],
  "defaultConfig": {
    "autoLinkAccounts": true
  }
}),
('auth-2fa', 'Two-Factor Authentication', 'authentication', {
  "description": "SMS/TOTP based 2FA",
  "methods": ["sms", "authenticator", "email"]
}),
('auth-passwordless', 'Magic Link Login', 'authentication', {
  "description": "Email-based passwordless authentication"
}),
('auth-rbac', 'Role-Based Access Control', 'authentication', {
  "description": "User roles and permissions system",
  "defaultRoles": ["admin", "user", "moderator"]
})
```

### 🧭 Navigation & Layout
```sql
-- Navigation Components
('nav-navbar', 'Navigation Bar', 'navigation', {
  "description": "Responsive top navigation",
  "variants": ["fixed", "sticky", "static"],
  "features": ["mega-menu", "search", "notifications"]
}),
('nav-sidebar', 'Sidebar Navigation', 'navigation', {
  "description": "Collapsible side navigation",
  "variants": ["fixed", "floating", "push"],
  "features": ["nested-menus", "tooltips"]
}),
('nav-breadcrumb', 'Breadcrumb Navigation', 'navigation', {
  "description": "Hierarchical navigation path"
}),
('nav-footer', 'Footer', 'navigation', {
  "description": "Site footer with links and info",
  "sections": ["links", "social", "newsletter", "copyright"]
}),
('nav-tabs', 'Tab Navigation', 'navigation', {
  "description": "Tabbed content interface"
})
```

### 📊 Data Display
```sql
-- Data Display Components
('data-table', 'Data Table', 'data-display', {
  "description": "Advanced data grid with sorting, filtering, pagination",
  "features": ["sort", "filter", "search", "export", "column-resize"],
  "variants": ["basic", "advanced", "virtualized"]
}),
('data-cards', 'Card Grid', 'data-display', {
  "description": "Responsive card layout",
  "layouts": ["grid", "masonry", "list"]
}),
('data-list', 'List View', 'data-display', {
  "description": "Vertical list with actions",
  "features": ["infinite-scroll", "drag-reorder", "multi-select"]
}),
('data-timeline', 'Timeline', 'data-display', {
  "description": "Chronological event display"
}),
('data-kanban', 'Kanban Board', 'data-display', {
  "description": "Drag-and-drop task board",
  "features": ["drag-drop", "swimlanes", "wip-limits"]
})
```

### 📝 Forms & Input
```sql
-- Form Components
('form-contact', 'Contact Form', 'forms', {
  "description": "Standard contact form",
  "fields": ["name", "email", "subject", "message"],
  "features": ["captcha", "file-upload"]
}),
('form-multi-step', 'Multi-Step Form', 'forms', {
  "description": "Wizard-style form with progress",
  "features": ["progress-bar", "validation", "save-draft"]
}),
('form-builder', 'Dynamic Form Builder', 'forms', {
  "description": "Drag-and-drop form creator",
  "fieldTypes": ["text", "number", "date", "select", "checkbox", "radio", "file"]
}),
('form-survey', 'Survey Form', 'forms', {
  "description": "Questionnaire with various input types",
  "features": ["conditional-logic", "scoring", "analytics"]
}),
('form-checkout', 'Checkout Form', 'forms', {
  "description": "E-commerce checkout process",
  "steps": ["shipping", "payment", "review", "confirmation"]
})
```

### 🎛️ Dashboard & Analytics
```sql
-- Dashboard Components
('dash-stats', 'Statistics Cards', 'dashboard', {
  "description": "KPI metric cards",
  "variants": ["simple", "trend", "comparison"],
  "animations": ["counter", "progress"]
}),
('dash-charts', 'Charts & Graphs', 'dashboard', {
  "description": "Data visualization components",
  "types": ["line", "bar", "pie", "donut", "area", "scatter"],
  "library": "recharts"
}),
('dash-activity', 'Activity Feed', 'dashboard', {
  "description": "Real-time activity stream",
  "features": ["filters", "notifications", "actions"]
}),
('dash-calendar', 'Calendar Widget', 'dashboard', {
  "description": "Event calendar interface",
  "views": ["month", "week", "day", "agenda"]
}),
('dash-map', 'Map Integration', 'dashboard', {
  "description": "Interactive maps",
  "providers": ["google", "mapbox", "leaflet"]
})
```

### 🛍️ E-commerce
```sql
-- E-commerce Components
('ecom-product-card', 'Product Card', 'ecommerce', {
  "description": "Product display card",
  "features": ["quick-view", "wishlist", "compare", "ratings"]
}),
('ecom-cart', 'Shopping Cart', 'ecommerce', {
  "description": "Cart management interface",
  "features": ["mini-cart", "save-later", "promocode"]
}),
('ecom-product-gallery', 'Product Gallery', 'ecommerce', {
  "description": "Image gallery with zoom",
  "features": ["zoom", "360-view", "video"]
}),
('ecom-reviews', 'Product Reviews', 'ecommerce', {
  "description": "Rating and review system",
  "features": ["ratings", "photos", "helpful-votes"]
}),
('ecom-filters', 'Product Filters', 'ecommerce', {
  "description": "Advanced filtering sidebar",
  "filterTypes": ["price", "category", "brand", "rating", "attributes"]
})
```

### 💬 Communication
```sql
-- Communication Components
('comm-chat', 'Chat Interface', 'communication', {
  "description": "Real-time messaging",
  "features": ["1-on-1", "group", "file-sharing", "voice-notes"],
  "variants": ["popup", "fullscreen", "embedded"]
}),
('comm-comments', 'Comment System', 'communication', {
  "description": "Threaded comments",
  "features": ["nested", "voting", "mentions", "moderation"]
}),
('comm-notifications', 'Notification Center', 'communication', {
  "description": "In-app notifications",
  "types": ["toast", "bell", "email", "push"],
  "features": ["grouping", "actions", "settings"]
}),
('comm-inbox', 'Message Inbox', 'communication', {
  "description": "Email-style messaging",
  "features": ["folders", "search", "filters", "bulk-actions"]
})
```

### 👤 User Management
```sql
-- User Components
('user-profile', 'User Profile', 'user-management', {
  "description": "Complete user profile page",
  "sections": ["info", "avatar", "bio", "social", "activity"]
}),
('user-settings', 'Account Settings', 'user-management', {
  "description": "User preferences and settings",
  "categories": ["profile", "privacy", "notifications", "security"]
}),
('user-list', 'User Directory', 'user-management', {
  "description": "User listing with search",
  "features": ["search", "filters", "bulk-actions", "export"]
}),
('user-teams', 'Team Management', 'user-management', {
  "description": "Team creation and management",
  "features": ["invites", "roles", "permissions"]
})
```

### 🔍 Search & Discovery
```sql
-- Search Components
('search-global', 'Global Search', 'search', {
  "description": "Site-wide search with suggestions",
  "features": ["autocomplete", "recent", "filters", "voice"]
}),
('search-advanced', 'Advanced Search', 'search', {
  "description": "Complex search interface",
  "features": ["boolean", "date-range", "categories", "save-search"]
}),
('search-filters', 'Filter Panel', 'search', {
  "description": "Faceted search filters",
  "filterTypes": ["checkbox", "range", "tags", "date"]
})
```

### 📱 Mobile-First Components
```sql
-- Mobile Components
('mobile-bottomnav', 'Bottom Navigation', 'mobile', {
  "description": "Mobile bottom tab bar",
  "maxTabs": 5
}),
('mobile-drawer', 'Drawer Menu', 'mobile', {
  "description": "Slide-out mobile menu",
  "positions": ["left", "right", "bottom"]
}),
('mobile-action-sheet', 'Action Sheet', 'mobile', {
  "description": "iOS-style action menu"
}),
('mobile-pull-refresh', 'Pull to Refresh', 'mobile', {
  "description": "Swipe down refresh pattern"
})
```

### 🎨 UI Elements
```sql
-- UI Components
('ui-modal', 'Modal Dialog', 'ui-elements', {
  "description": "Popup modal window",
  "sizes": ["sm", "md", "lg", "fullscreen"],
  "features": ["nested", "draggable", "backdrop"]
}),
('ui-toast', 'Toast Notifications', 'ui-elements', {
  "description": "Temporary notifications",
  "positions": ["top", "bottom", "corner"],
  "types": ["success", "error", "warning", "info"]
}),
('ui-carousel', 'Image Carousel', 'ui-elements', {
  "description": "Image/content slider",
  "features": ["autoplay", "dots", "arrows", "thumbnails"]
}),
('ui-accordion', 'Accordion/Collapse', 'ui-elements', {
  "description": "Expandable content sections"
}),
('ui-stepper', 'Progress Stepper', 'ui-elements', {
  "description": "Step progress indicator",
  "variants": ["horizontal", "vertical"]
})
```

### 🔧 Admin & Management
```sql
-- Admin Components
('admin-dashboard', 'Admin Dashboard', 'admin', {
  "description": "Complete admin panel layout",
  "sections": ["metrics", "users", "content", "settings"]
}),
('admin-crud', 'CRUD Interface', 'admin', {
  "description": "Create/Read/Update/Delete UI",
  "features": ["inline-edit", "bulk-ops", "import-export"]
}),
('admin-logs', 'Activity Logs', 'admin', {
  "description": "System activity tracking",
  "features": ["filters", "export", "details"]
}),
('admin-settings', 'System Settings', 'admin', {
  "description": "Application configuration",
  "categories": ["general", "email", "api", "security"]
})
```

### 🔌 Integrations
```sql
-- Integration Components
('int-payment', 'Payment Gateway', 'integrations', {
  "description": "Payment processing integration",
  "providers": ["stripe", "paypal", "square"],
  "features": ["cards", "wallets", "subscriptions"]
}),
('int-analytics', 'Analytics Dashboard', 'integrations', {
  "description": "Analytics integration",
  "providers": ["google", "mixpanel", "segment"]
}),
('int-email', 'Email Service', 'integrations', {
  "description": "Email sending integration",
  "providers": ["sendgrid", "mailgun", "ses"],
  "features": ["templates", "tracking", "automation"]
}),
('int-storage', 'File Storage', 'integrations', {
  "description": "Cloud storage integration",
  "providers": ["s3", "cloudinary", "supabase"],
  "features": ["upload", "preview", "management"]
})
```

### 🛡️ Security & Compliance
```sql
-- Security Components
('sec-captcha', 'CAPTCHA', 'security', {
  "description": "Bot protection",
  "providers": ["recaptcha", "hcaptcha", "custom"]
}),
('sec-consent', 'Cookie Consent', 'security', {
  "description": "GDPR cookie banner",
  "features": ["categories", "preferences", "analytics"]
}),
('sec-audit', 'Security Audit Log', 'security', {
  "description": "Security event tracking"
}),
('sec-encryption', 'Data Encryption', 'security', {
  "description": "End-to-end encryption UI"
})
```

## Feature Template Combinations

Create pre-configured feature sets that combine multiple components:

### 1. **SaaS Starter Pack**
- Authentication (login, signup, OAuth)
- Dashboard with stats
- User profile & settings
- Billing/subscription management
- Admin panel

### 2. **E-commerce Bundle**
- Product catalog with filters
- Shopping cart
- Checkout process
- Order management
- Customer reviews

### 3. **Social Platform Kit**
- User profiles
- Activity feed
- Comments & reactions
- Chat/messaging
- Notifications

### 4. **Business Dashboard**
- Analytics charts
- Data tables
- Reports generation
- Team management
- Activity logs

### 5. **Content Management**
- WYSIWYG editor
- Media library
- Categories/tags
- Publishing workflow
- SEO tools

## Implementation Notes

1. Each component should include:
   - Unique identifier
   - Display name and description
   - Category classification
   - Default configuration
   - Required dependencies
   - Estimated complexity score

2. Add metadata for:
   - Browser compatibility
   - Mobile responsiveness
   - Accessibility compliance
   - Performance impact
   - Security considerations

3. Include relationships between components:
   - Dependencies
   - Incompatibilities
   - Recommended combinations

4. Version tracking for updates and migrations

This seed data will provide users with a comprehensive library of common web application features they can use to quickly build their projects in the Visual Prompt Builder.