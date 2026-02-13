import { useEffect, useState } from 'react';
import { StoreProvider, useStore } from '@/store';
import { LoginPage } from '@/pages/Login';
import { RegisterPage } from '@/pages/Register';
import { OnboardingPage } from '@/pages/Onboarding';
import { HomePage } from '@/pages/Home';
import { CalendarPage } from '@/pages/Calendar';
import { PeersPage } from '@/pages/Peers';
import { AccountPage } from '@/pages/Account';
import { WorkspacePage } from '@/pages/Workspace';
import { CreateWorkspaceModal } from '@/components/modals/CreateWorkspaceModal';
import { CreateEventModal } from '@/components/modals/CreateEventModal';
import { PremiumUpsellModal } from '@/components/modals/PremiumUpsellModal';
import { Toaster } from '@/components/ui/sonner';
import type { User } from '@/types';

// App Content Component
function AppContent() {
  const { state, dispatch } = useStore();
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'onboarding' | 'home' | 'calendar' | 'peers' | 'account' | 'workspace'>('login');

  // Initialize on mount
  useEffect(() => {
    // Simulate auth check
    const isLoggedIn = localStorage.getItem('studblud_auth') === 'true';
    if (isLoggedIn) {
      // Load user from localStorage if available
      const savedUser = localStorage.getItem('studblud_user');
      if (savedUser) {
        dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) });
      }
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      
      const hasOnboarded = localStorage.getItem('studblud_onboarded') === 'true';
      setCurrentPage(hasOnboarded ? 'home' : 'onboarding');
    }
  }, [dispatch]);

  // Handle navigation
  const navigate = (page: typeof currentPage) => {
    setCurrentPage(page);
  };

  // Handle login
  const handleLogin = () => {
    localStorage.setItem('studblud_auth', 'true');
    // Create a basic user
    const user: User = {
      id: 'user-' + Date.now(),
      name: 'Student User',
      email: 'student@example.com',
      school: 'University',
      status: 'online',
      isPremium: false,
      workspaceLimit: 3,
    };
    localStorage.setItem('studblud_user', JSON.stringify(user));
    dispatch({ type: 'SET_USER', payload: user });
    dispatch({ type: 'SET_AUTHENTICATED', payload: true });
    setCurrentPage('onboarding');
  };

  // Handle register
  const handleRegister = () => {
    localStorage.setItem('studblud_auth', 'true');
    const user: User = {
      id: 'user-' + Date.now(),
      name: 'New Student',
      email: 'newstudent@example.com',
      school: 'University',
      status: 'online',
      isPremium: false,
      workspaceLimit: 3,
    };
    localStorage.setItem('studblud_user', JSON.stringify(user));
    dispatch({ type: 'SET_USER', payload: user });
    dispatch({ type: 'SET_AUTHENTICATED', payload: true });
    setCurrentPage('onboarding');
  };

  // Handle onboarding complete
  const handleOnboardingComplete = () => {
    localStorage.setItem('studblud_onboarded', 'true');
    setCurrentPage('home');
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('studblud_auth');
    localStorage.removeItem('studblud_onboarded');
    localStorage.removeItem('studblud_user');
    dispatch({ type: 'RESET_STATE' });
    setCurrentPage('login');
  };

  // Handle workspace selection
  const handleWorkspaceSelect = (workspaceId: string) => {
    const workspace = state.workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      dispatch({ type: 'SET_CURRENT_WORKSPACE', payload: workspace });
      setCurrentPage('workspace');
    }
  };

  // Handle back to home from workspace
  const handleBackToHome = () => {
    dispatch({ type: 'SET_CURRENT_WORKSPACE', payload: null });
    setCurrentPage('home');
  };

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <LoginPage 
            onLogin={handleLogin} 
            onNavigateToRegister={() => navigate('register')} 
          />
        );
      case 'register':
        return (
          <RegisterPage 
            onRegister={handleRegister} 
            onNavigateToLogin={() => navigate('login')} 
          />
        );
      case 'onboarding':
        return <OnboardingPage onComplete={handleOnboardingComplete} />;
      case 'home':
        return (
          <HomePage 
            onNavigate={navigate}
            onWorkspaceSelect={handleWorkspaceSelect}
            onLogout={handleLogout}
          />
        );
      case 'calendar':
        return (
          <CalendarPage 
            onNavigate={navigate}
            onLogout={handleLogout}
          />
        );
      case 'peers':
        return (
          <PeersPage 
            onNavigate={navigate}
            onLogout={handleLogout}
          />
        );
      case 'account':
        return (
          <AccountPage 
            onNavigate={navigate}
            onLogout={handleLogout}
          />
        );
      case 'workspace':
        return (
          <WorkspacePage 
            onBack={handleBackToHome}
          />
        );
      default:
        return <LoginPage onLogin={handleLogin} onNavigateToRegister={() => navigate('register')} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderPage()}
      
      {/* Global Modals */}
      <CreateWorkspaceModal 
        isOpen={state.modals.createWorkspace}
        onClose={() => dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'createWorkspace', open: false } })}
        onSuccess={(workspace) => {
          dispatch({ type: 'ADD_WORKSPACE', payload: workspace });
          dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'createWorkspace', open: false } });
          handleWorkspaceSelect(workspace.id);
        }}
      />
      
      <CreateEventModal
        isOpen={state.modals.createEvent}
        onClose={() => dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'createEvent', open: false } })}
        onSuccess={(event) => {
          dispatch({ type: 'ADD_EVENT', payload: event });
          dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'createEvent', open: false } });
        }}
      />
      
      <PremiumUpsellModal
        isOpen={state.modals.premiumUpsell}
        onClose={() => dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'premiumUpsell', open: false } })}
      />
      
      <Toaster position="top-right" richColors />
    </div>
  );
}

// Main App
function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

export default App;
