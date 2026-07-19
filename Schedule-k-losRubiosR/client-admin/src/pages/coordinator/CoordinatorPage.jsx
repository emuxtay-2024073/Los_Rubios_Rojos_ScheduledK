import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ListBulletIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { getAppointments } from '../../services/adminApi.js';
import { getAllUsers } from '../../shared/apis/auth.js';
import mascotHero from '../../assets/img/admin-coordinator-hero-v1.png';

const actions = [
  {
    step: '1',
    to: '/coordinador/citas',
    label: 'Asignar citas',
    title: 'Programar cita',
    description: 'Selecciona al padre, define fecha/hora y asigna la reunión.',
    icon: CalendarDaysIcon,
  },
  {
    step: '2',
    to: '/coordinador/parents',
    label: 'Listado de padres',
    title: 'Ver familias',
    description: 'Revisa los padres de familia registrados y su información de contacto.',
    icon: UserGroupIcon,
  },
  {
    step: '3',
    to: '/coordinador/citas',
    label: 'Listado de citas',
    title: 'Ver citas',
    description: 'Accede al listado de citas programadas y su estado.',
    icon: ListBulletIcon,
  },
  {
    step: '4',
    to: '/coordinador/messages',
    label: 'Mensaje general',
    title: 'Enviar notificación',
    description: 'Envía un mensaje general a todas las personas que usan la app.',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    step: '5',
    to: '/coordinador/calendar',
    label: 'Calendario personal',
    title: 'Mi agenda',
    description: 'Consulta tu calendario personal con citas y horarios asignados.',
    icon: ClipboardDocumentCheckIcon,
  },
];

export const CoordinatorPage = () => {
  const [appointmentsToday, setAppointmentsToday] = useState(0);
  const [activeFamilies, setActiveFamilies] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Obtener citas
        const appointmentsData = await getAppointments();
        const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
        
        // Filtrar citas de hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayAppointments = appointments.filter((apt) => {
          const aptDate = new Date(apt.date);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate.getTime() === today.getTime();
        });
        
        setAppointmentsToday(todayAppointments.length);

        // Obtener usuarios y contar padres
        const usersResponse = await getAllUsers();
        const users = usersResponse?.users || usersResponse?.data?.users || [];
        const padres = users.filter((user) => (user.role || '').toUpperCase() === 'PADRE');
        setActiveFamilies(padres.length);
      } catch (error) {
        console.error('Error fetching coordinator data:', error);
        setAppointmentsToday(0);
        setActiveFamilies(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className='space-y-8'>
      <section className='admin-hero admin-section-anchor p-6 sm:p-8 lg:p-10'>
        <div className='admin-reference-grid lg:grid-cols-[1.05fr_0.95fr]'>
          <div className='admin-reference-copy'>
            <span className='admin-kicker'>Portal coordinador</span>
            <h1 className='admin-display admin-display--admin'>
              Hola de nuevo,
              <br />
              coordinador
            </h1>
            <p className='admin-hero-copy admin-hero-copy--narrow'>
              Gestiona reuniones con familias, supervisa el estado de las citas y mantén al día
              los seguimientos institucionales. Schedulito te ayuda a no perder ningún pendiente.
            </p>
            <div className='flex flex-wrap items-center gap-3 pt-1'>
              <Link to='/coordinador/citas' className='admin-button-primary px-6 text-sm'>
                <SparklesIcon className='h-5 w-5' />
                Programar una cita
              </Link>
              <span className='admin-soft-pill'>Seguimiento activo</span>
            </div>
          </div>

          <div className='admin-reference-stage'>
            <span className='admin-reference-wave' aria-hidden='true' />
            <span className='admin-reference-pill admin-reference-pill--top'>
              <span className='block text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#5e5e5e]'>Hoy</span>
              <span className='block text-lg font-black text-[#202020]'>{loading ? '-' : appointmentsToday} citas</span>
            </span>
            <span className='admin-reference-pill admin-reference-pill--bottom'>
              <span className='block text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#5e5e5e]'>Familias</span>
              <span className='block text-lg font-black text-[#202020]'>{loading ? '-' : activeFamilies} activas</span>
            </span>
            <img src={mascotHero} alt='Schedulito, tu asistente de coordinación' className='admin-reference-penguin' />
          </div>
        </div>
      </section>

      <section className='grid gap-5 sm:grid-cols-3'>
        {[
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className='admin-card admin-stat-card p-6'>
              <span className={`admin-stat-icon ${stat.tone}`}>
                <Icon className='h-6 w-6' />
              </span>
              <p className='mt-4 text-3xl font-black text-[#202020]'>{stat.value}</p>
              <p className='mt-1 text-sm font-bold uppercase tracking-[0.14em] text-[#5e5e5e]'>{stat.title}</p>
              <p className='mt-2 text-sm text-[#5e5e5e]'>{stat.description}</p>
            </div>
          );
        })}
      </section>

      <section className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} to={action.to} className='admin-card p-6'>
              <div className='flex items-start justify-between gap-3'>
                <span className='admin-stat-icon violet'>
                  <Icon className='h-6 w-6' />
                </span>
                <span className='inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(86,72,231,0.14)] bg-white text-xs font-black text-[#5648e7] shadow-sm'>
                  {action.step}
                </span>
              </div>
              <p className='mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#5648e7]'>{action.label}</p>
              <h3 className='mt-2 text-xl font-black text-[#202020]'>{action.title}</h3>
              <p className='mt-3 text-sm text-[#5e5e5e]'>{action.description}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
};
