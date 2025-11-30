
# 🌟 ONLY HELIO - The Integrated Real Estate Ecosystem

**ONLY HELIO** is a cutting-edge, bilingual (Arabic/English) digital platform designed specifically for the city of **New Heliopolis**. It serves as a comprehensive ecosystem connecting property seekers, real estate developers, finishing companies, and decoration experts in one seamless interface.

---

## 🚀 Project Status: High-Fidelity MVP Complete

The project has evolved from a basic listing site into a robust web application featuring advanced state management, dynamic routing, and a complete CRM/CMS administration system.

### 🛠 Tech Stack & Architecture

*   **Core:** React 19 (Vite), TypeScript.
*   **State Management:**
    *   **Server State:** TanStack Query v5 (Caching, Auto-refetching, Optimistic Updates).
    *   **Global Client State:** Zustand (Lightweight, persistent store for Auth & Favorites).
*   **Routing:** React Router v7 with Lazy Loading & Code Splitting.
*   **Styling:** Tailwind CSS with Dark/Light mode support.
*   **Forms & Validation:** 
    *   **React Hook Form** for performance.
    *   **Zod** for schema-based validation (`utils/validation.ts`).
    *   **Custom Dynamic Form Engine** configurable via JSON/Admin Panel.
*   **Localization:** Custom Context-based i18n system (AR/EN).
*   **Mock Backend:** Service-repository pattern simulating API calls with realistic delays (`/services`).

---

## ✨ Key Features

### 1. 🏢 Public Portal (User Experience)
*   **Advanced Property Search:** Filter by price, location, type, finishing status, and amenities.
*   **Interactive Map View:** Browse properties visually on a map.
*   **Service Requests:** Book finishing consultations or request custom decoration designs using dynamic forms.
*   **Favorites System:** Persisted wishlist for properties and portfolio items.
*   **Responsive Design:** Fully optimized for mobile, tablet, and desktop.

### 2. 🤝 Partner Dashboard (Developers & Agencies)
*   **Project & Unit Management:** Add, edit, and manage listings with a multi-step wizard.
*   **Lead CRM:** View incoming inquiries, update status (New -> Contacted -> Sold), and add internal notes.
*   **Analytics:** Visual charts for listing performance and lead conversion.
*   **Subscription Management:** View plan limits and upgrade options.
*   **Finance Center:** Track payments, invoices, and subscription status.

### 3. 🛡️ Super Admin Dashboard (CMS & Control)
*   **Dynamic Form Builder:** Create and modify forms (fields, validation rules, routing) without code changes. Includes advanced validation support (Regex, Min/Max, File Limits).
*   **Robust Validation:** Centralized validation logic (`utils/validation.ts`) ensures data integrity across all user inputs including file uploads.
*   **User & Partner Management:** Approve applications, manage roles/permissions, and toggle user access.
*   **Content Management:** Edit homepage sliders, banners, testimonials, and legal pages directly.
*   **Automation Rules:** Configure logic to automatically route leads to specific managers based on criteria.
*   **System Health:** Monitor error logs and system alerts via Error Boundaries.

---

## 📂 Project Structure

The codebase follows a clean, feature-first architecture:

```
src/
├── components/
│   ├── admin/          # Super Admin dashboard features (Forms, Users, Content)
│   ├── auth/           # Authentication logic & Protected Routes
│   ├── forms/          # Reusable form steps & wizards
│   ├── partner-dashboard/ # Partner-specific views
│   ├── properties/     # Property listing & detail components
│   ├── shared/         # Shared utilities (Header, Footer, ErrorBoundary, Loaders)
│   └── ui/             # Atomic UI components (Button, Card, Input, Modal)
├── services/           # Mock API layer (simulating DB calls)
├── hooks/              # Custom React Hooks (Data fetching, Logic)
├── store/              # Zustand stores (Auth, Favorites)
├── utils/              # Validation schemas, formatters, and constants
├── data/               # Static mock data
├── locales/            # Translation files (AR/EN)
└── types.ts            # TypeScript definitions
```

---

## 🔧 Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run Development Server:**
    ```bash
    npm run dev
    ```

3.  **Build for Production:**
    ```bash
    npm run build
    ```

---

## 🧪 Key Implementation Details

*   **Dynamic Form Engine:** Located in `components/shared/DynamicForm.tsx`. It renders forms based on JSON configurations managed in the Admin Panel, allowing for flexible data collection strategies with Zod validation integrated via `utils/validation.ts`.
*   **Centralized Validation:**  `utils/validation.ts` holds regex patterns (e.g., Egyptian phone numbers), Zod schemas, error messages, and file validation logic, ensuring consistent validation logic across the app.
*   **Error Handling:** A global `ErrorBoundary` wraps the app to catch runtime errors, while `ErrorState` components handle granular API failures within widgets.
*   **Performance:** Heavy components and routes are lazy-loaded using `React.lazy` and `Suspense` to ensure fast initial load times (`LoadingFallback`).

---

**© 2025 ONLY HELIO. Built for excellence.**
