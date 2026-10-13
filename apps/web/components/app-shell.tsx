import { LayoutDashboard, LogOut, Menu, Package, PanelsTopLeft, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { StaffLanguageSwitcher, useStaffLocale } from './staff-locale';
import type { CurrentUser } from './types';

type View = 'overview' | 'modules';

interface AppShellProps {
  activeView: View;
  children: ReactNode;
  isLoggingOut: boolean;
  mobileNavigationOpen: boolean;
  onChangeView: (view: View) => void;
  onLogout: () => void;
  onMobileNavigationChange: (open: boolean) => void;
  user: CurrentUser;
}

export function AppShell({
  activeView,
  children,
  isLoggingOut,
  mobileNavigationOpen,
  onChangeView,
  onLogout,
  onMobileNavigationChange,
  user,
}: AppShellProps) {
  const { locale, messages: m } = useStaffLocale();

  function selectView(view: View) {
    onChangeView(view);
    onMobileNavigationChange(false);
  }

  return (
    <div className="app-frame" lang={locale}>
      <a className="skip-link" href="#main-content">{m.shell.skip}</a>
      <header className="mobile-header">
        <div className="mobile-brand">
          <img alt="Prachi Dham logo" src="/brand/logo.png" />
          <span>Prachi Dham</span>
        </div>
        <button aria-label={m.shell.openNavigation} className="icon-button" onClick={() => onMobileNavigationChange(true)} type="button">
          <Menu aria-hidden="true" size={21} />
        </button>
      </header>
      <aside aria-label={m.shell.sidebarLabel} className="sidebar" data-open={mobileNavigationOpen}>
        <a className="brand-lockup" href="#main-content" onClick={() => onMobileNavigationChange(false)}>
          <img alt="Prachi Dham logo" className="brand-mark" src="/brand/logo.png" />
          <span>
            <span className="brand-name">Prachi Dham</span>
            <span className="brand-caption">{m.shell.brandCaption}</span>
          </span>
        </a>
        <button aria-label={m.shell.closeNavigation} className="icon-button close-mobile" onClick={() => onMobileNavigationChange(false)} type="button">
          <X aria-hidden="true" size={21} />
        </button>
        <span className="nav-label">{m.shell.brandCaption}</span>
        <nav aria-label={m.shell.primaryNavigation} className="primary-nav">
          <button aria-current={activeView === 'overview' ? 'page' : undefined} className="nav-button" onClick={() => selectView('overview')} type="button">
            <LayoutDashboard aria-hidden="true" size={18} />
            {m.shell.navOverview}
          </button>
          <button aria-current={activeView === 'modules' ? 'page' : undefined} className="nav-button" onClick={() => selectView('modules')} type="button">
            <PanelsTopLeft aria-hidden="true" size={18} />
            {m.shell.navWorkspaces}
          </button>
          {['owner', 'admin'].includes(user.role) && <a className="nav-button" href="/staff/catalog">
            <Package aria-hidden="true" size={18} />
            {m.shell.navCatalog}
          </a>}
        </nav>
        <div className="sidebar-footer">
          <StaffLanguageSwitcher className="staff-language" />
          <div className="identity">
            <div className="identity-name">{user.displayName}</div>
            <div className="identity-meta">{user.organizationName}</div>
          </div>
          <button className="sign-out" disabled={isLoggingOut} onClick={onLogout} type="button">
            <LogOut aria-hidden="true" size={16} />
            {isLoggingOut ? m.shell.signingOut : m.shell.signOut}
          </button>
        </div>
      </aside>
      <div className="content-shell">
        <div className="topbar" aria-label={m.shell.orgContextLabel}>
          <div>
            <p className="eyebrow">{m.shell.orgEyebrow}</p>
            <div className="context-name">{user.organizationName}</div>
          </div>
          <div className="live-indicator"><span aria-hidden="true" className="live-dot" />{m.shell.liveApiData}</div>
        </div>
        <main className="main-content" id="main-content">{children}</main>
      </div>
    </div>
  );
}
