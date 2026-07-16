import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx';
import { DashboardPage } from '../layouts/DashboardPage.jsx';
import { ProtectedRoutes } from './ProtectedRoutes.jsx';
import { UnauthorizedPage } from '../../features/auth/pages/UnauthorizedPage.jsx';
import { RoleGuard } from './RoleGuard.jsx';
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage.jsx';
import { Dashboard } from '../../pages/Dashboard.jsx';
import { Users } from '../../features/users/components/Users.jsx';
import { Reservations } from '../../pages/Reservations.jsx';
import { ClientPage } from '../../pages/client/ClientPage.jsx';
import { LandingPage } from '../../pages/LandingPage.jsx';
import { ClientReservationsPage } from '../../pages/client/ClientReservationsPage.jsx';
import { ClientLayout } from '../layouts/ClientLayout.jsx';
import { AdminPage } from '../../pages/admin/AdminPage.jsx';
import { ParentLayout } from '../../pages/parent/ParentLayout.jsx';
import { ParentPage } from '../../pages/parent/ParentPage.jsx';
import { CoordinatorLayout } from '../../pages/coordinator/CoordinatorLayout.jsx';
import { CoordinatorPage } from '../../pages/coordinator/CoordinatorPage.jsx';
import { CoordinatorParentsPage } from '../../pages/coordinator/CoordinatorParentsPage.jsx';
import { CoordinatorCalendarPage } from '../../pages/coordinator/CoordinatorCalendarPage.jsx';
import { CoordinatorMessagesPage } from '../../pages/coordinator/CoordinatorMessagesPage.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />

      {/* Public client routes */}
      <Route path='/cliente' element={<ClientLayout />}>
        <Route index element={<ClientPage />} />
        <Route path='reservations' element={<ClientReservationsPage />} />
      </Route>

      <Route
        path='/padre'
        element={
          <ProtectedRoutes>
            <RoleGuard allowedRoles={['PADRE']}>
              <ParentLayout />
            </RoleGuard>
          </ProtectedRoutes>
        }
      >
        <Route index element={<ParentPage />} />
        <Route path='reservations' element={<ClientReservationsPage />} />
      </Route>

      <Route
        path='/coordinador'
        element={
          <ProtectedRoutes>
            <RoleGuard allowedRoles={['COORDINADOR']}>
              <CoordinatorLayout />
            </RoleGuard>
          </ProtectedRoutes>
        }
      >
        <Route index element={<CoordinatorPage />} />
        <Route path='parents' element={<CoordinatorParentsPage />} />
        <Route path='citas' element={<Reservations />} />
        <Route path='messages' element={<CoordinatorMessagesPage />} />
        <Route path='calendar' element={<CoordinatorCalendarPage />} />
      </Route>

      <Route path='/login' element={<AuthPage />} />
      <Route path='/verify-email' element={<VerifyEmailPage />} />
      <Route path='/unauthorized' element={<UnauthorizedPage />} />
      <Route
        path='/dashboard/*'
        element={
          <ProtectedRoutes>
            <RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN', 'ADMIN_ROLE']}>
              <DashboardPage />
            </RoleGuard>
          </ProtectedRoutes>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path='admin-home' element={<AdminPage />} />
        <Route path='reservations' element={<Reservations />} />
        <Route path='users' element={
          <RoleGuard allowedRoles={['SUPER_ADMIN']}>
            <Users />
          </RoleGuard>
        } />
        <Route path='*' element={<Navigate to='/dashboard' replace />} />
      </Route>
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
};
