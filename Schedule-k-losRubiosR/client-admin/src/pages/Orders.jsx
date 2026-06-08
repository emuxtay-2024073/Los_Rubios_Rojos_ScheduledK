import { useEffect, useMemo, useState } from 'react';
import { getOrders, getRestaurants, updateOrderStatus } from '../services/adminApi.js';
import { Spinner } from '../features/auth/components/Spinner.jsx';
import { showError, showSuccess } from '../shared/utils/toast.js';
import {
  ArrowPathIcon,
  ClipboardDocumentListIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';

const formatDate = (value) => new Date(value).toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' });
const formatCurrency = (value) =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(Number(value || 0));
const statusOptions = ['pendiente', 'preparacion', 'entregado'];
const PAGE_SIZE = 8;

const getStatusClass = (status = '') => {
  const normalized = status.toLowerCase();
  if (normalized.includes('entregado') || normalized.includes('complet')) return 'admin-status-success';
  if (normalized.includes('prepar')) return 'admin-status-warning';
  if (normalized.includes('cancel')) return 'admin-status-danger';
  return 'admin-status-neutral';
};

export const Orders = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await getRestaurants();
      const items = Array.isArray(data) ? data : [];
      setRestaurants(items);
      if (items[0]?._id) {
        setSelectedRestaurantId(items[0]._id);
      }
      if (items.length === 0) {
        setOrders([]);
      }
    } catch (error) {
      console.error(error);
      showError('No se pudieron cargar los restaurantes');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      showError('No se pudieron cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([loadRestaurants(), loadOrders()]);
    };
    load();
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase();

    return orders.filter((order) => {
      const restaurantId = order.table?.restaurant?._id ?? order.table?.restaurant;
      const matchesRestaurant = !selectedRestaurantId || String(restaurantId) === selectedRestaurantId;
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      const matchesSearch =
        order._id?.toLowerCase().includes(query) ||
        order.table?.number?.toString().includes(query) ||
        order.items?.some((item) => item.menuItem?.name?.toLowerCase().includes(query));

      return matchesRestaurant && matchesStatus && matchesSearch;
    });
  }, [orders, selectedRestaurantId, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredOrders]);

  const totals = useMemo(() => ({
    active: filteredOrders.filter((order) => ['pendiente', 'preparacion'].includes(order.status)).length,
    delivered: filteredOrders.filter((order) => order.status === 'entregado').length,
    income: filteredOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
  }), [filteredOrders]);

  const handleStatusChange = async (orderId, status) => {
    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders((current) => current.map((order) => (order._id === updated._id ? updated : order)));
      showSuccess('Estado de la orden actualizado');
    } catch (error) {
      console.error(error);
      showError('No se pudo actualizar el estado de la orden');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className='admin-page space-y-8'>
      <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
        <div>
          <p className='admin-kicker'>Órdenes del restaurante</p>
          <h1 className='admin-title mt-2'>Gestión de pedidos</h1>
          <p className='admin-subtitle mt-2 text-sm'>Seguimiento operativo con filtros, estados visuales y acciones rápidas.</p>
        </div>
        <select
          value={selectedRestaurantId}
          onChange={(event) => {
            setSelectedRestaurantId(event.target.value);
            setPage(1);
          }}
          className='admin-input px-4 py-3 text-sm font-semibold'
        >
          {restaurants.map((restaurant) => (
            <option key={restaurant._id} value={restaurant._id}>
              {restaurant.name}
            </option>
          ))}
        </select>
      </div>

      <section className='grid gap-4 sm:grid-cols-3'>
        <article className='admin-card p-5'>
          <ShoppingBagIcon className='h-7 w-7 text-[#DC2626]' />
          <p className='mt-3 text-sm font-bold text-[#6B7280]'>Pedidos activos</p>
          <p className='mt-2 text-3xl font-black text-[#1F2937]'>{totals.active}</p>
        </article>
        <article className='admin-card p-5'>
          <ClipboardDocumentListIcon className='h-7 w-7 text-[#DC2626]' />
          <p className='mt-3 text-sm font-bold text-[#6B7280]'>Pedidos entregados</p>
          <p className='mt-2 text-3xl font-black text-[#1F2937]'>{totals.delivered}</p>
        </article>
        <article className='admin-card p-5'>
          <ArrowPathIcon className='h-7 w-7 text-[#DC2626]' />
          <p className='mt-3 text-sm font-bold text-[#6B7280]'>Total filtrado</p>
          <p className='mt-2 text-3xl font-black text-[#1F2937]'>{formatCurrency(totals.income)}</p>
        </article>
      </section>

      <section className='admin-panel overflow-hidden'>
        <div className='border-b border-[#7C2D12]/10 p-5'>
          <div className='grid gap-3 md:grid-cols-[1fr_220px]'>
            <label className='relative block'>
              <MagnifyingGlassIcon className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]' />
              <input
                type='search'
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder='Buscar orden, mesa o platillo'
                className='admin-input w-full px-11 py-3 text-sm'
              />
            </label>
            <label className='relative block'>
              <FunnelIcon className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]' />
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
                className='admin-input w-full px-11 py-3 text-sm font-semibold'
              >
                <option value='ALL'>Todos los estados</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='admin-table min-w-full text-left text-sm'>
            <thead>
              <tr>
                <th className='px-5 py-4'>Orden</th>
                <th className='px-5 py-4'>Mesa</th>
                <th className='px-5 py-4'>Total</th>
                <th className='px-5 py-4'>Fecha</th>
                <th className='px-5 py-4'>Estado</th>
                <th className='px-5 py-4'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order._id} className='border-t border-[#7C2D12]/10'>
                  <td className='px-5 py-4 font-extrabold text-[#1F2937]'>#{order._id.slice(-6)}</td>
                  <td className='px-5 py-4 text-[#6B7280]'>Mesa {order.table?.number ?? 'N/A'}</td>
                  <td className='px-5 py-4 font-bold text-[#1F2937]'>{formatCurrency(order.total)}</td>
                  <td className='px-5 py-4 text-[#6B7280]'>{formatDate(order.createdAt)}</td>
                  <td className='px-5 py-4'>
                    <span className={`admin-status ${getStatusClass(order.status)}`}>{order.status}</span>
                  </td>
                  <td className='px-5 py-4'>
                    <select
                      value={order.status}
                      onChange={(event) => handleStatusChange(order._id, event.target.value)}
                      className='admin-input px-3 py-2 text-sm font-semibold'
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan='6' className='px-5 py-10 text-center text-sm text-[#6B7280]'>
                    No hay órdenes registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className='flex flex-col gap-3 border-t border-[#7C2D12]/10 bg-[#FFF7ED]/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-xs font-bold text-[#6B7280]'>
            Mostrando {(currentPage - 1) * PAGE_SIZE + (paginatedOrders.length ? 1 : 0)} - {(currentPage - 1) * PAGE_SIZE + paginatedOrders.length} de {filteredOrders.length}
          </p>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
              className='admin-button-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50'
            >
              Anterior
            </button>
            <span className='rounded-full bg-white px-3 py-2 text-sm font-black text-[#1F2937] ring-1 ring-[#7C2D12]/10'>
              {currentPage} / {totalPages}
            </span>
            <button
              type='button'
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={currentPage === totalPages}
              className='admin-button-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50'
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>

      <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
        {paginatedOrders.map((order) => (
          <article key={`details-${order._id}`} className='admin-card p-5'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-xs font-black uppercase tracking-[0.14em] text-[#7C2D12]'>Orden</p>
                <h2 className='mt-1 text-xl font-black text-[#1F2937]'>#{order._id.slice(-6)}</h2>
              </div>
              <span className={`admin-status ${getStatusClass(order.status)}`}>{order.status}</span>
            </div>
            <div className='mt-4 space-y-2 text-sm text-[#6B7280]'>
              {order.items?.map((item, index) => (
                <div key={`${order._id}-${index}`} className='rounded-2xl border border-[#7C2D12]/10 bg-[#FFF7ED]/70 p-3'>
                  <p className='font-extrabold text-[#1F2937]'>{item.menuItem?.name ?? 'Item'}</p>
                  <p>Cantidad: {item.quantity} · Unitario: {formatCurrency(item.price)}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
