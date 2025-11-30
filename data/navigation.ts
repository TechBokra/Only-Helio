
import React from 'react';
import { Permission, Role } from '../types';
import {
  HomeIcon, ChartBarIcon, UserPlusIcon, ClipboardDocumentListIcon, SearchIcon,
  InboxIcon, WrenchScrewdriverIcon, UsersIcon, CubeIcon, BuildingIcon, QuoteIcon,
  CogIcon, PhotoIcon, SparklesIcon, ShieldCheckIcon, FileDownloadIcon, PhoneIcon,
  AdjustmentsHorizontalIcon, BellIcon, BanknotesIcon, ListIcon
} from '../components/ui/Icons';

export interface NavLinkItem {
  name: (t: any) => string;
  href: string;
  icon: React.FC<{ className?: string }>;
  exact?: boolean;
  group: string;
  permission: Permission;
  roles?: Role[];
}

export const adminNavLinks: NavLinkItem[] = [
  // --- Group: Overview ---
  { name: t => t.adminDashboard.nav.dashboard, href: '/admin', icon: HomeIcon, permission: Permission.VIEW_ADMIN_DASHBOARD, exact: true, group: 'Overview' },
  { name: t => t.adminDashboard.nav.analytics, href: '/admin/analytics', icon: ChartBarIcon, permission: Permission.VIEW_ANALYTICS, group: 'Overview' },
  { name: t => t.adminDashboard.nav.finance, href: '/admin/finance', icon: BanknotesIcon, permission: Permission.MANAGE_PLANS, group: 'Overview' },
  { name: t => t.notifications.title, href: '/admin/notifications', icon: BellIcon, permission: Permission.VIEW_ADMIN_DASHBOARD, group: 'Overview' },
  { name: t => t.adminDashboard.nav.reports, href: '/admin/reports', icon: FileDownloadIcon, permission: Permission.VIEW_ANALYTICS, group: 'Overview' },
  
  // ... (Rest of existing links)
  { name: t => t.adminDashboard.requestsTriage.allRequests, href: '/admin/requests', icon: InboxIcon, permission: Permission.MANAGE_USERS, group: 'Request Triage' },
  { name: t => t.adminDashboard.nav.propertyRequests, href: '/admin/requests?type=PROPERTY_LISTING_REQUEST', icon: ClipboardDocumentListIcon, permission: Permission.MANAGE_PROPERTY_REQUESTS, group: 'Real Estate Market' },
  { name: t => t.adminDashboard.nav.propertyInquiries, href: '/admin/requests?type=PROPERTY_INQUIRY', icon: SearchIcon, permission: Permission.MANAGE_PROPERTY_INQUIRIES, group: 'Real Estate Market' },
  { name: t => t.adminDashboard.nav.contactRequests, href: '/admin/requests?type=CONTACT_MESSAGE', icon: PhoneIcon, permission: Permission.MANAGE_CONTACT_REQUESTS, group: 'Real Estate Market' },
  { name: t => t.adminDashboard.nav.platformProperties, href: '/admin/platform-properties', icon: BuildingIcon, permission: Permission.MANAGE_PLATFORM_PROPERTIES, group: 'Platform Operations' },
  { name: t => t.adminDashboard.nav.platformFinishing, href: '/admin/platform-finishing', icon: WrenchScrewdriverIcon, permission: Permission.MANAGE_PLATFORM_FINISHING_PACKAGES, group: 'Platform Operations' },
  { name: t => t.adminDashboard.nav.platformDecorations, href: '/admin/platform-decorations', icon: SparklesIcon, permission: Permission.MANAGE_DECORATIONS_CONTENT, group: 'Platform Operations' },
  { name: t => t.adminDashboard.nav.partners, href: '/admin/partners', icon: UsersIcon, permission: Permission.MANAGE_ALL_PARTNERS, group: 'Partner Relations' },
  { name: t => t.adminDashboard.nav.partnerRequests, href: '/admin/requests?type=PARTNER_APPLICATION', icon: UserPlusIcon, permission: Permission.MANAGE_PARTNER_REQUESTS, group: 'Partner Relations' },
  { name: t => t.adminDashboard.nav.properties, href: '/admin/properties', icon: BuildingIcon, permission: Permission.MANAGE_ALL_PROPERTIES, group: 'Content & Listings' },
  { name: t => t.adminDashboard.nav.projects, href: '/admin/projects', icon: CubeIcon, permission: Permission.MANAGE_ALL_PROJECTS, group: 'Content & Listings' },
  { name: t => t.adminDashboard.nav.banners, href: '/admin/banners', icon: PhotoIcon, permission: Permission.MANAGE_BANNERS, group: 'Content & Listings' },
  { name: t => t.adminDashboard.nav.siteContent, href: '/admin/content', icon: ClipboardDocumentListIcon, permission: Permission.MANAGE_SITE_CONTENT, group: 'Content & Listings' },
  
  // System Group
  { name: t => t.adminDashboard.nav.forms, href: '/admin/forms', icon: ListIcon, permission: Permission.MANAGE_FORMS, group: 'System' },
  { name: t => t.adminDashboard.nav.users, href: '/admin/users', icon: UsersIcon, permission: Permission.MANAGE_USERS, group: 'System' },
  { name: t => t.adminDashboard.nav.automationRules, href: '/admin/automation', icon: AdjustmentsHorizontalIcon, permission: Permission.MANAGE_AUTOMATION, group: 'System' },
  { name: t => t.adminDashboard.nav.rolesAndPermissions, href: '/admin/roles', icon: ShieldCheckIcon, permission: Permission.MANAGE_ROLES_PERMISSIONS, group: 'System' },
  { name: t => t.adminDashboard.nav.settings, href: '/admin/settings', icon: CogIcon, permission: Permission.MANAGE_SETTINGS, group: 'System' },
  { name: t => t.dashboard.nav.profile, href: '/admin/profile', icon: UserPlusIcon, permission: Permission.VIEW_ADMIN_DASHBOARD, group: 'System' },
];

export const partnerNavLinks: NavLinkItem[] = [
  { name: t => t.dashboard.nav.home, href: '/dashboard', icon: HomeIcon, permission: Permission.VIEW_PARTNER_DASHBOARD, exact: true, group: 'Partner' },
  { name: t => t.notifications.title, href: '/dashboard/notifications', icon: BellIcon, permission: Permission.VIEW_PARTNER_DASHBOARD, group: 'Partner' },
  { name: t => t.dashboard.nav.analytics, href: '/dashboard/analytics', icon: ChartBarIcon, permission: Permission.VIEW_PARTNER_DASHBOARD, roles: [Role.DEVELOPER_PARTNER, Role.AGENCY_PARTNER], group: 'Partner' },
  { name: t => t.dashboard.nav.projects, href: '/dashboard/projects', icon: CubeIcon, permission: Permission.MANAGE_OWN_PROJECTS, roles: [Role.DEVELOPER_PARTNER], group: 'Partner' },
  { name: t => t.dashboard.nav.properties, href: '/dashboard/properties', icon: BuildingIcon, permission: Permission.MANAGE_OWN_PROPERTIES, roles: [Role.AGENCY_PARTNER], group: 'Partner' },
  { name: t => t.dashboard.nav.portfolio, href: '/dashboard/portfolio', icon: PhotoIcon, permission: Permission.MANAGE_OWN_PORTFOLIO, roles: [Role.FINISHING_PARTNER], group: 'Partner' },
  { name: t => t.dashboard.nav.leads, href: '/dashboard/leads', icon: QuoteIcon, permission: Permission.VIEW_OWN_LEADS, roles: [Role.DEVELOPER_PARTNER, Role.FINISHING_PARTNER, Role.AGENCY_PARTNER], group: 'Partner' },
  { name: t => t.adminDashboard.nav.finance, href: '/dashboard/finance', icon: BanknotesIcon, permission: Permission.MANAGE_OWN_SUBSCRIPTION, roles: [Role.DEVELOPER_PARTNER, Role.FINISHING_PARTNER, Role.AGENCY_PARTNER], group: 'Partner' },
  { name: t => t.dashboard.nav.subscription, href: '/dashboard/subscription', icon: ClipboardDocumentListIcon, permission: Permission.MANAGE_OWN_SUBSCRIPTION, roles: [Role.DEVELOPER_PARTNER, Role.FINISHING_PARTNER, Role.AGENCY_PARTNER], group: 'Partner' },
  { name: t => t.dashboard.nav.profile, href: '/dashboard/profile', icon: UserPlusIcon, permission: Permission.MANAGE_OWN_PROFILE, roles: [Role.DEVELOPER_PARTNER, Role.FINISHING_PARTNER, Role.AGENCY_PARTNER], group: 'Partner' },
];
