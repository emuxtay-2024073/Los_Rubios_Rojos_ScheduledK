import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx';
import { DashboardPage } from '../layouts/DashboardPage.jsx';
import { ProtectedRoutes } from './ProtectedRoutes.jsx';
import { UnauthorizedPage } from '../../features/auth/pages/UnauthorizedPage.jsx';
import { RoleGuard } from './RoleGuard.jsx';
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage.jsx';
import { Dashboard } from '../../pages/Dashboard.jsx';
import { Restaurants } from '../../pages/Restaurants.jsx';
import { Tables } from '../../pages/Tables.jsx';
import { Menus } from '../../pages/Menus.jsx';
import { Orders } from '../../pages/Orders.jsx';
import { Users } from '../../features/users/components/Users.jsx';
import { Reservations } from '../../pages/Reservations.jsx';
import { Reviews } from '../../pages/Reviews.jsx';
import { ClientPage } from '../../pages/client/ClientPage.jsx';
import { LandingPage } from '../../pages/LandingPage.jsx';
import { ClientRestaurantsPage } from '../../pages/client/ClientRestaurantsPage.jsx';
import { ClientMenuPage } from '../../pages/client/ClientMenuPage.jsx';
import { ClientReservationsPage } from '../../pages/client/ClientReservationsPage.jsx';
import { ClientOrdersPage } from '../../pages/client/ClientOrdersPage.jsx';
import { ClientReviewsPage } from '../../pages/client/ClientReviewsPage.jsx';
import { ClientLayout } from '../layouts/ClientLayout.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />

      {/* Public client routes */}
      <Route path='/cliente' element={<ClientLayout />}>
        <Route index element={<ClientPage />} />
        <Route path='restaurants' element={<ClientRestaurantsPage />} />
        <Route path='menu/:restaurantId' element={<ClientMenuPage />} />
        <Route path='reservations' element={<ClientReservationsPage />} />
        <Route path='orders' element={<ClientOrdersPage />} />
        <Route path='reviews' element={<ClientReviewsPage />} />
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
        <Route path='restaurants' element={<Restaurants />} />
        <Route path='tables' element={<Tables />} />
        <Route path='menus' element={<Menus />} />
        <Route path='orders' element={<Orders />} />
        <Route path='reservations' element={<Reservations />} />
        <Route path='users' element={
          <RoleGuard allowedRoles={['SUPER_ADMIN']}>
            <Users />
          </RoleGuard>
        } />
        <Route path='reviews' element={<Reviews />} />
        <Route path='*' element={<Navigate to='/dashboard' replace />} />
      </Route>
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
};
