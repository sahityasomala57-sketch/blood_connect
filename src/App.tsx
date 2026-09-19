import React, { useState, useEffect } from 'react';
import { useCurrentRoute } from './services/router';
import { authService } from './services/auth';
import { SplashScreen } from './components/common/SplashScreen';
import { HospitalDashboard } from './pages/HospitalDashboard';
import { BloodBankDashboard } from './pages/BloodBankDashboard';
import { DonorDashboard } from './pages/DonorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { SimulationPage } from './pages/SimulationPage';
import { HospitalAuthPage } from './pages/HospitalAuthPage';
import { BloodBankAuthPage } from './pages/BloodBankAuthPage';
import { DonorAuthPage } from './pages/DonorAuthPage';
import { LoginPage } from './pages/LoginPage';
import { RoleAccessGuard } from './components/common/RoleAccessGuard';
import { AuthenticatedLayout } from './components/layout/AuthenticatedLayout';

export const App: React.FC = () => {
  const [currentRoute, navigate] = useCurrentRoute();
  const [user, setUser] = useState(authService.getCurrentUser());
  const [, setHasSeenSplash] = useState(false);

  useEffect(() => {
    const unsub = authService.subscribe(u => setUser(u));
    return unsub;
  }, []);

  // Determine if splash screen should be shown (accessible at /splash)
  const isSplashRoute = currentRoute === '/splash';

  // Handle legacy Live Map route redirects safely
  const isOldMapRoute = ['/network', '/live-map', '/map', '/spatial-map'].includes(currentRoute);

  useEffect(() => {
    if (isOldMapRoute) {
      if (user) {
        navigate(`/${user.role.toLowerCase().replace('_', '-')}/dashboard`);
      } else {
        navigate('/');
      }
    }
  }, [currentRoute, user, isOldMapRoute]);

  // Determine if login page should be shown as Home page (Clean Minimal Reference 1 Design)
  const isLoginRoute = [
    '/',
    '/login',
    '/sector-selection',
    '/hospital/login',
    '/blood-bank/login',
    '/donor/login',
    '/admin/login'
  ].includes(currentRoute);

  const handleSplashComplete = () => {
    setHasSeenSplash(true);
    navigate('/');
  };

  // 1. Splash Screen
  if (isSplashRoute) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // 2. Unauthenticated Home Page & Dedicated Login Screen (Reference 1 Design - NO sidebar/header)
  if (isLoginRoute) {
    return <LoginPage onNavigate={navigate} currentRoute={currentRoute} />;
  }

  // 3. Unauthenticated Sign-Up Screens
  if (currentRoute === '/hospital/signup') {
    return <HospitalAuthPage onNavigate={navigate} initialMode="signup" />;
  }
  if (currentRoute === '/blood-bank/signup') {
    return <BloodBankAuthPage onNavigate={navigate} initialMode="signup" />;
  }
  if (currentRoute === '/donor/signup') {
    return <DonorAuthPage onNavigate={navigate} initialMode="signup" />;
  }

  // 4. Authenticated Application Views Wrapped in AuthenticatedLayout (Sidebar + Minimal Header)
  const renderAuthenticatedContent = () => {
    // Hospital Routes
    if (currentRoute.startsWith('/hospital')) {
      const subView = currentRoute.replace('/hospital/', '') || 'dashboard';
      return (
        <RoleAccessGuard 
          requiredRole="HOSPITAL" 
          currentRole={user?.role} 
          onNavigate={navigate}
        >
          <HospitalDashboard currentSubView={subView} onNavigate={navigate} />
        </RoleAccessGuard>
      );
    }

    // Blood Bank Routes
    if (currentRoute.startsWith('/blood-bank')) {
      const subView = currentRoute.replace('/blood-bank/', '') || 'dashboard';
      return (
        <RoleAccessGuard 
          requiredRole="BLOOD_BANK" 
          currentRole={user?.role} 
          onNavigate={navigate}
        >
          <BloodBankDashboard currentSubView={subView} onNavigate={navigate} />
        </RoleAccessGuard>
      );
    }

    // Donor Routes
    if (currentRoute.startsWith('/donor')) {
      const subView = currentRoute.replace('/donor/', '') || 'dashboard';
      return (
        <RoleAccessGuard 
          requiredRole="DONOR" 
          currentRole={user?.role} 
          onNavigate={navigate}
        >
          <DonorDashboard currentSubView={subView} onNavigate={navigate} />
        </RoleAccessGuard>
      );
    }

    // Admin Routes
    if (currentRoute.startsWith('/admin')) {
      const subView = currentRoute.replace('/admin/', '') || 'dashboard';
      return (
        <RoleAccessGuard 
          requiredRole="ADMIN" 
          currentRole={user?.role} 
          onNavigate={navigate}
        >
          <AdminDashboard currentSubView={subView} onNavigate={navigate} />
        </RoleAccessGuard>
      );
    }

    // Shared Features: Emergency Response Simulation
    if (currentRoute === '/simulation') {
      return <SimulationPage />;
    }

    // Fallback: If logged in, go to role dashboard, else go to login
    if (user) {
      const defaultRolePath = `/${user.role.toLowerCase().replace('_', '-')}/dashboard`;
      return (
        <div className="text-center py-16 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs">
          <h2 className="text-lg font-bold text-[#0B1F3A] mb-2">View Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">The requested section is not available.</p>
          <button
            onClick={() => navigate(defaultRolePath)}
            className="px-5 py-2.5 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    return <LoginPage onNavigate={navigate} currentRoute="/" />;
  };

  return (
    <AuthenticatedLayout
      user={user}
      currentRoute={currentRoute}
      onNavigate={navigate}
    >
      {renderAuthenticatedContent()}
    </AuthenticatedLayout>
  );
};

export default App;
