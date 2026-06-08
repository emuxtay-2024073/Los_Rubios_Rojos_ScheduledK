import { useEffect, useMemo, useState } from 'react';
import {
  getMenuItems,
  getOrders,
  getReservationsForRestaurant,
  getRestaurants,
  getTablesForRestaurant,
} from '../services/adminApi.js';
import { Spinner } from '../features/auth/components/Spinner.jsx';
import { useAuthStore } from '../features/auth/store/authStore.js';
import { useUserManagementStore } from '../features/auth/store/useUserManagementStore.js';
import {
  BanknotesIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  FireIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  TableCellsIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' });
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(Number(value || 0));

const isSameDay = (value, date) => {
  if (!value) return false;
  const current = new Date(value);
  return (
    current.getFullYear() === date.getFullYear() &&
    current.getMonth() === date.getMonth() &&
    current.getDate() === date.getDate()
  );
};

const isSameMonth = (value, date) => {
  if (!value) return false;
  const current = new Date(value);
  return current.getFullYear() === date.getFullYear() && current.getMonth() === date.getMonth();
};

const normalizeStatus = (status = '') => status.toString().toLowerCase();

export const Dashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role?.toUpperCase() === 'SUPER_ADMIN';
  const { users, getAllUsers } = useUserManagementStore();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [restaurantsData, menuItemsData, ordersData] = await Promise.all([
          getRestaurants(),
          getMenuItems(),
          getOrders(),
        ]);
        const restaurantsList = Array.isArray(restaurantsData)
          ? restaurantsData
          : restaurantsData?.restaurants || [];
        setRestaurants(restaurantsList);
        setMenuItems(Array.isArray(menuItemsData) ? menuItemsData : menuItemsData?.menuItems || []);
        setOrders(Array.isArray(ordersData) ? ordersData : ordersData?.orders || []);

        if (restaurantsList.length > 0) {
          const restaurantId = restaurantsList[0]._id;
          const [tablesData, reservationsData] = await Promise.all([
            getTablesForRestaurant(restaurantId),
            getReservationsForRestaurant(restaurantId),
          ]);
          setTables(Array.isArray(tablesData) ? tablesData : []);
          setReservations(Array.isArray(reservationsData) ? reservationsData : []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    if (isSuperAdmin) {
      getAllUsers();
    }
  }, [getAllUsers, isSuperAdmin]);

  const analytics = useMemo(() => {
    const today = new Date();
    const dailySales = orders
      .filter((order) => isSameDay(order.createdAt, today))
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
    const monthlyIncome = orders
      .filter((order) => isSameMonth(order.createdAt, today))
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
    const activeOrders = orders.filter((order) =>
      ['pendiente', 'preparacion', 'preparación'].includes(normalizeStatus(order.status)),
    ).length;
    const deliveredOrders = orders.filter((order) =>
      ['entregado', 'entregada', 'completado', 'completada'].includes(normalizeStatus(order.status)),
    ).length;
    const soldMap = new Map();
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const name = item.menuItem?.name || 'Producto sin nombre';
        soldMap.set(name, (soldMap.get(name) || 0) + Number(item.quantity || 0));
      });
    });
    const topProducts = [...soldMap.entries()]
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return { activeOrders, dailySales, deliveredOrders, monthlyIncome, topProducts };
  }, [orders]);

  const activeUsers = users.filter((item) => Boolean(item.verified ?? item.emailConfirmed)).length;
  const auditEvents = [
    ...orders.slice(0, 3).map((order) => ({
      id: `order-${order._id}`,
      title: `Orden #${order._id?.slice(-6) || 'N/A'}`,
      meta: `${order.status || 'Sin estado'} · ${formatCurrency(order.total)}`,
      date: order.createdAt,
    })),
    ...reservations.slice(0, 3).map((reservation) => ({
      id: `reservation-${reservation._id}`,
      title: reservation.customerName || 'Reservación',
      meta: `Mesa ${reservation.table?.number ?? reservation.table ?? 'N/A'} · ${reservation.status || 'Confirmada'}`,
      date: reservation.reservationDate,
    })),
  ].slice(0, 5);

  const metricCards = isSuperAdmin
    ? [
        { label: 'Restaurantes registrados', value: restaurants.length, icon: BuildingStorefrontIcon, helper: 'Locales activos en plataforma' },
        { label: 'Usuarios activos', value: activeUsers, icon: UserGroupIcon, helper: `${users.length} usuarios registrados` },
        { label: 'Reportes financieros', value: formatCurrency(analytics.monthlyIncome), icon: BanknotesIcon, helper: 'Ingresos del mes actual' },
        { label: 'Auditorías del sistema', value: auditEvents.length, icon: ShieldCheckIcon, helper: 'Eventos operativos recientes' },
      ]
    : [
        { label: 'Ventas del día', value: formatCurrency(analytics.dailySales), icon: BanknotesIcon, helper: 'Pedidos facturados hoy' },
        { label: 'Pedidos activos', value: analytics.activeOrders, icon: ShoppingBagIcon, helper: 'Pendientes y en preparación' },
        { label: 'Pedidos entregados', value: analytics.deliveredOrders, icon: ClipboardDocumentCheckIcon, helper: 'Órdenes completadas' },
        { label: 'Ingresos mensuales', value: formatCurrency(analytics.monthlyIncome), icon: ChartBarIcon, helper: 'Corte del mes actual' },
      ];

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className='admin-page space-y-8'>
      <section className='admin-panel overflow-hidden p-6 lg:p-8'>
        <div className='grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center'>
          <div>
            <p className='admin-kicker'>{isSuperAdmin ? 'Panel ejecutivo premium' : 'Panel de administración'}</p>
            <h1 className='admin-title mt-2'>
              {isSuperAdmin ? 'Centro de control corporativo' : 'Resumen operativo del restaurante'}
            </h1>
            <p className='admin-subtitle mt-4 max-w-2xl text-sm leading-6'>
              Métricas clave, señales de operación y actividad reciente para tomar decisiones rápidas sin perder contexto.
            </p>
          </div>
          <div className='rounded-3xl bg-gradient-to-br from-[#DC2626] via-[#7C2D12] to-[#1F2937] p-5 text-white shadow-2xl'>
            <div className='flex items-center gap-3'>
              <FireIcon className='h-9 w-9 text-[#F59E0B]' />
              <div>
                <p className='text-xs font-bold uppercase tracking-[0.16em] text-white/70'>Ritmo del día</p>
                <p className='text-2xl font-black'>{analytics.activeOrders} pedidos activos</p>
              </div>
            </div>
            <div className='mt-5 admin-progress bg-white/15'>
              <span style={{ width: `${Math.min(100, analytics.activeOrders * 18 + 24)}%` }} />
            </div>
            <p className='mt-3 text-sm text-white/75'>{formatCurrency(analytics.dailySales)} en ventas registradas hoy</p>
          </div>
        </div>
      </section>

      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <article
              key={metric.label}
              className='admin-card admin-metric p-5'
              style={{ animation: `adminRise 360ms ease ${index * 70}ms both` }}
            >
              <div className='relative flex items-start justify-between gap-4'>
                <div>
                  <p className='text-sm font-bold text-[#6B7280]'>{metric.label}</p>
                  <p className='mt-4 text-3xl font-black text-[#1F2937]'>{metric.value}</p>
                  <p className='mt-2 text-xs font-semibold text-[#6B7280]'>{metric.helper}</p>
                </div>
                <div className='rounded-2xl bg-[#FFF7ED] p-3 text-[#DC2626] ring-1 ring-[#7C2D12]/10'>
                  <Icon className='h-6 w-6' />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className='grid gap-6 xl:grid-cols-[1.05fr_0.95fr]'>
        <div className='admin-panel p-6'>
          <div className='flex items-center justify-between gap-4'>
            <div>
              <p className='admin-kicker'>Productos más vendidos</p>
              <h2 className='mt-1 text-xl font-black text-[#1F2937]'>Ranking de demanda</h2>
            </div>
            <span className='admin-status admin-status-warning'>{menuItems.length} productos</span>
          </div>
          <div className='mt-6 space-y-4'>
            {(analytics.topProducts.length ? analytics.topProducts : menuItems.slice(0, 5).map((item) => ({ name: item.name, quantity: 0 }))).map((item, index) => {
              const maxQuantity = Math.max(...analytics.topProducts.map((product) => product.quantity), 1);
              const width = item.quantity ? Math.max(14, (item.quantity / maxQuantity) * 100) : 12;
              return (
                <div key={`${item.name}-${index}`} className='rounded-2xl border border-[#7C2D12]/10 bg-[#FFF7ED]/60 p-4'>
                  <div className='flex items-center justify-between gap-3'>
                    <div>
                      <p className='font-extrabold text-[#1F2937]'>{index + 1}. {item.name}</p>
                      <p className='text-xs font-semibold text-[#6B7280]'>{item.quantity} unidades registradas</p>
                    </div>
                    <span className='admin-status admin-status-neutral'>{Math.round(width)}%</span>
                  </div>
                  <div className='mt-3 admin-progress'>
                    <span style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
            {menuItems.length === 0 && analytics.topProducts.length === 0 && (
              <p className='rounded-2xl border border-dashed border-[#7C2D12]/20 p-6 text-center text-sm text-[#6B7280]'>
                Aún no hay productos para destacar.
              </p>
            )}
          </div>
        </div>

        <div className='admin-panel p-6'>
          <div className='flex items-center justify-between gap-4'>
            <div>
              <p className='admin-kicker'>{isSuperAdmin ? 'Auditorías del sistema' : 'Reservaciones recientes'}</p>
              <h2 className='mt-1 text-xl font-black text-[#1F2937]'>Actividad relevante</h2>
            </div>
            <span className='admin-status admin-status-success'>{restaurants.length} locales</span>
          </div>
          <div className='mt-6 space-y-4'>
            {(isSuperAdmin ? auditEvents : reservations.slice(0, 5)).map((item) => (
              <article key={item.id || item._id} className='rounded-2xl border border-[#7C2D12]/10 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg'>
                <div className='flex items-start justify-between gap-4'>
                  <div>
                    <p className='font-extrabold text-[#1F2937]'>{item.title || item.customerName}</p>
                    <p className='mt-1 text-sm text-[#6B7280]'>
                      {item.meta || `Mesa ${item.table?.number ?? item.table ?? 'N/A'}`}
                    </p>
                  </div>
                  <span className='admin-status admin-status-neutral'>{formatDate(item.date || item.reservationDate)}</span>
                </div>
              </article>
            ))}
            {(isSuperAdmin ? auditEvents.length === 0 : reservations.length === 0) && (
              <p className='rounded-2xl border border-dashed border-[#7C2D12]/20 p-6 text-center text-sm text-[#6B7280]'>
                No hay actividad reciente disponible.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className='grid gap-6 lg:grid-cols-3'>
        <article className='admin-card p-5'>
          <BuildingStorefrontIcon className='h-7 w-7 text-[#DC2626]' />
          <p className='mt-4 text-sm font-bold text-[#6B7280]'>Restaurantes registrados</p>
          <p className='mt-2 text-3xl font-black text-[#1F2937]'>{restaurants.length}</p>
        </article>
        <article className='admin-card p-5'>
          <TableCellsIcon className='h-7 w-7 text-[#DC2626]' />
          <p className='mt-4 text-sm font-bold text-[#6B7280]'>Mesas registradas</p>
          <p className='mt-2 text-3xl font-black text-[#1F2937]'>{tables.length}</p>
        </article>
        <article className='admin-card p-5'>
          <ShoppingBagIcon className='h-7 w-7 text-[#DC2626]' />
          <p className='mt-4 text-sm font-bold text-[#6B7280]'>Órdenes totales</p>
          <p className='mt-2 text-3xl font-black text-[#1F2937]'>{orders.length}</p>
        </article>
      </section>
    </div>
  );
};
