
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
*   **Database:** PostgreSQL via Supabase, managed with Prisma ORM.

---

## 📂 Database Schema (27 Tables)

The database structure is optimized for scalability and relational integrity.

### 1. Core Entities
*   **User:** Partners, Admins, and Internal Managers.
*   **Project:** Real estate compounds/malls.
*   **Property:** Individual units (Apartments, Villas).
*   **PortfolioItem:** Gallery items for finishing/decor partners.

### 2. CRM & Communications
*   **Lead:** Main customer tracking entity.
*   **LeadMessage:** Conversation history.
*   **Notification:** In-app alerts for users.
*   **ContactRequest:** General inquiries.
*   **PropertyInquiry:** Specific buyer requests.
*   **PartnerRequest:** Application forms for new partners.
*   **PropertyListingRequest:** Listing submission forms.

### 3. System Configuration
*   **SystemSetting:** Global key-value store (e.g., AI configs, Contact info).
*   **FormDefinition:** Dynamic form schemas.
*   **RoutingRule:** Automation rules for lead assignment.
*   **PlanConfiguration:** Subscription tiers and pricing.
*   **Banner:** Promotional sliders and ads.

### 4. Lookups & Relations
*   **PropertyType:** (Apartment, Villa, etc.)
*   **FinishingStatus:** (Core & Shell, Finished, etc.)
*   **Amenity:** Property features.
*   **DecorationCategory:** Portfolio categorization.
*   **AmenitiesOnProperties:** Many-to-many relation table.

### 5. Finance & Content
*   **Transaction:** Payment records.
*   **Quote:** Wisdom quotes for the Quiet Zone.
*   **StaticPage:** CMS for pages like Privacy Policy.
*   **NewsletterSubscriber:** Email subscriptions.
*   **AuditLog:** System activity tracking.
*   **SavedSearch:** User preferences.

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

*   **Dynamic Form Engine:** Located in `components/shared/DynamicForm.tsx`. It renders forms based on JSON configurations managed in the Admin Panel (`FormDefinition` table).
*   **Database Health:** Admin Settings includes a "Database Monitor" tracking all 27 tables.
*   **Error Handling:** A global `ErrorBoundary` wraps the app to catch runtime errors.

---

**© 2025 ONLY HELIO. Built for excellence.**
