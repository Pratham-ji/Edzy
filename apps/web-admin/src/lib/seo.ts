const SITE_ORIGIN = 'https://edzy-admin.pages.dev';

interface RouteSeoMeta {
  title: string;
  description: string;
  robots: 'index, follow' | 'noindex, nofollow';
  canonicalPath: string;
}

const PUBLIC_HOME_META: RouteSeoMeta = {
  title: 'EDZY: Education Made Easy | AI School ERP, 3D Visual Labs & Study Roadmaps for Indian Schools',
  description:
    "Replace evening tuitions with your school's own AI study roadmaps and 3D visual science labs, while running hybrid UPI fees, marks, and attendance on one strictly isolated Indian K-12 campus OS.",
  robots: 'index, follow',
  canonicalPath: '/',
};

const PRIVACY_META: RouteSeoMeta = {
  title: 'Privacy Policy & DPDP Data Safety | EDZY: Education Made Easy',
  description:
    'India DPDP Act 2023 and Google Play Data Safety disclosures for Edzy Campus OS and parent mobile apps.',
  robots: 'index, follow',
  canonicalPath: '/privacy-policy',
};

const PORTAL_META: RouteSeoMeta = {
  title: 'School Staff Portal | EDZY Campus OS',
  description: 'Encrypted staff sign-in for Principals, Class Teachers, and Accounts Officers.',
  robots: 'noindex, nofollow',
  canonicalPath: '/portal',
};

const SUPER_ADMIN_META: RouteSeoMeta = {
  title: 'Founder Ecosystem Console | EDZY',
  description: 'Private platform governance console.',
  robots: 'noindex, nofollow',
  canonicalPath: '/super-admin',
};

function upsertMeta(selector: string, createAttrs: Record<string, string>, content: string) {
  if (typeof document === 'undefined') return;
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    Object.entries(createAttrs).forEach(([k, v]) => el!.setAttribute(k, v));
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  if (typeof document === 'undefined') return;
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
}

export function applyRouteSeo(pathname: string, isAuthenticated = false, schoolName?: string): void {
  if (typeof document === 'undefined') return;

  let meta: RouteSeoMeta = PUBLIC_HOME_META;
  const cleanPath = pathname === '/pitch' ? '/' : pathname;

  if (cleanPath === '/privacy-policy') {
    meta = PRIVACY_META;
  } else if (cleanPath === '/super-admin') {
    meta = SUPER_ADMIN_META;
  } else if (cleanPath === '/portal' || cleanPath === '/login') {
    meta =
      isAuthenticated && schoolName
        ? {
            ...PORTAL_META,
            title: `${schoolName} | EDZY School ERP`,
          }
        : PORTAL_META;
  }

  document.title = meta.title;
  upsertMeta('meta[name="robots"]', { name: 'robots' }, meta.robots);
  upsertMeta('meta[name="description"]', { name: 'description' }, meta.description);
  upsertCanonical(`${SITE_ORIGIN}${meta.canonicalPath}`);
}
