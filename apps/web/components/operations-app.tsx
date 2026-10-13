'use client';

import { LogIn } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ApiError, getCurrentUser, getDashboard, getModules, login, logout } from './api';
import { AppShell } from './app-shell';
import { ModulesView } from './modules-view';
import { OverviewView } from './overview-view';
import { RecordsWorkspace } from './records-workspace';
import { ErrorBanner, ErrorState, LoadingState } from './shared-ui';
import { StaffLanguageSwitcher, StaffLocaleProvider, useStaffMessages } from './staff-locale';
import type { CurrentUser, DashboardData, ModuleDefinition } from './types';

type View = 'overview' | 'modules';

function LoginScreen({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const m = useStaffMessages();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onLogin(email, password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : m.login.genericError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <aside className="login-aside" aria-label={m.login.identityLabel}>
        <div className="login-logo">
          <img alt="Prachi Dham logo" src="/brand/logo.png" />
          <div><strong>Prachi Dham</strong><span>Gir Somnath, Gujarat</span></div>
        </div>
        <div>
          <h1>{m.login.asideTitle}</h1>
          <p>{m.login.asideBody}</p>
        </div>
        <p className="login-footnote">{m.login.footnote}</p>
      </aside>
      <main className="login-main">
        <section aria-labelledby="login-heading" className="login-card">
          <StaffLanguageSwitcher className="staff-language staff-language--login" />
          <p className="eyebrow">{m.login.eyebrow}</p>
          <h2 id="login-heading">{m.login.title}</h2>
          <p>{m.login.body}</p>
          <form className="login-form" onSubmit={submit}>
            {error ? <ErrorBanner>{error}</ErrorBanner> : null}
            <div className="field">
              <label htmlFor="email">{m.login.emailLabel}</label>
              <input autoComplete="email" id="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
            </div>
            <div className="field">
              <label htmlFor="password">{m.login.passwordLabel}</label>
              <input autoComplete="current-password" id="password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
            </div>
            <button className="button button-primary" disabled={isSubmitting} type="submit">
              <LogIn aria-hidden="true" size={17} /> {isSubmitting ? m.login.signingIn : m.login.signIn}
            </button>
            <p className="form-help">{m.login.help}</p>
          </form>
        </section>
      </main>
    </div>
  );
}

function StaffApp() {
  const m = useStaffMessages();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeView, setActiveView] = useState<View>('overview');
  const [activeModule, setActiveModule] = useState<ModuleDefinition | null>(null);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [modules, setModules] = useState<ModuleDefinition[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const loadSession = useCallback(async () => {
    setIsCheckingSession(true);
    setSessionError(null);

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null);
      } else {
        setSessionError(error instanceof Error ? error.message : m.session.checkError);
      }
    } finally {
      setIsCheckingSession(false);
    }
  }, [m.session.checkError]);

  const loadOperationalData = useCallback(async () => {
    setIsLoadingData(true);
    setDataError(null);

    try {
      const [moduleDefinitions, dashboardData] = await Promise.all([getModules(), getDashboard()]);
      setModules(moduleDefinitions);
      setDashboard(dashboardData);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : m.session.dataError);
    } finally {
      setIsLoadingData(false);
    }
  }, [m.session.dataError]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (user) void loadOperationalData();
  }, [loadOperationalData, user]);

  async function handleLogin(email: string, password: string) {
    await login(email, password);
    await loadSession();
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setUser(null);
      setModules([]);
      setDashboard(null);
      setActiveModule(null);
      setActiveView('overview');
      setIsLoggingOut(false);
    }
  }

  function openModule(module: ModuleDefinition) {
    setActiveModule(module);
    setActiveView('modules');
    setMobileNavigationOpen(false);
  }

  if (isCheckingSession) return <LoadingState label={m.session.checking} />;

  if (sessionError) {
    return (
      <main className="login-main" style={{ minHeight: '100vh' }}>
        <ErrorState message={sessionError} onRetry={() => void loadSession()} title={m.session.errorTitle} />
      </main>
    );
  }

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <AppShell
      activeView={activeView}
      isLoggingOut={isLoggingOut}
      mobileNavigationOpen={mobileNavigationOpen}
      onChangeView={(view) => { setActiveView(view); setActiveModule(null); }}
      onLogout={() => void handleLogout()}
      onMobileNavigationChange={setMobileNavigationOpen}
      user={user}
    >
      {activeModule ? (
        <RecordsWorkspace module={activeModule} onBack={() => setActiveModule(null)} onDataChanged={() => void loadOperationalData()} user={user} />
      ) : activeView === 'overview' ? (
        <OverviewView dashboard={dashboard} error={dataError} isLoading={isLoadingData} modules={modules} onOpenModules={() => setActiveView('modules')} onRetry={() => void loadOperationalData()} canUseAI={user.role !== 'viewer'} />
      ) : (
        <ModulesView dashboard={dashboard} error={dataError} isLoading={isLoadingData} modules={modules} onOpenModule={openModule} onRetry={() => void loadOperationalData()} />
      )}
    </AppShell>
  );
}

export function OperationsApp() {
  return (
    <StaffLocaleProvider>
      <StaffApp />
    </StaffLocaleProvider>
  );
}
