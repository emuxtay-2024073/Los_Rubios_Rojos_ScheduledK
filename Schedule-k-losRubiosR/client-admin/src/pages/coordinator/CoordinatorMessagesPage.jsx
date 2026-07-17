import { useEffect, useState } from 'react';
import { useAuthStore } from '../../features/auth/store/authStore.js';
import { BackButton } from '../../shared/components/ui/BackButton.jsx';
import { showSuccess } from '../../shared/utils/toast.js';
import { createNotification, getMyNotifications } from '../../services/adminApi.js';

export const CoordinatorMessagesPage = () => {
  const user = useAuthStore((state) => state.user);
  const [message, setMessage] = useState('');
  const [savedMessage, setSavedMessage] = useState({ text: '', author: '' });

  useEffect(() => {
    const loadSavedMessage = async () => {
      try {
        const notifications = await getMyNotifications();
        if (Array.isArray(notifications) && notifications.length > 0) {
          const latest = notifications[0];
          setSavedMessage({ text: latest.message || '', author: latest.coordinatorName || user?.username || user?.email || 'Coordinador' });
        }
      } catch (error) {
        console.error('No se pudo cargar el mensaje general:', error);
      }
    };

    loadSavedMessage();
  }, [user]);

  const saveMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    const author = user?.username || user?.email || 'Coordinador';
    const payload = { title: 'Mensaje general', message: trimmed };

    try {
      const saved = await createNotification(payload);
      setSavedMessage({ text: saved.message || trimmed, author: saved.coordinatorName || author });
      setMessage('');
      showSuccess('Mensaje general guardado. Ahora todos pueden verlo.');
    } catch (error) {
      console.error('Error guardando mensaje general:', error);
      showSuccess('No se pudo guardar el mensaje general. Intenta de nuevo.');
    }

    try {
      const channel = new BroadcastChannel('general-app-message');
      channel.postMessage({ text: trimmed, author });
      channel.close();
    } catch (e) {
      // BroadcastChannel may not be available in some environments — ignore
    }
  };

  return (
    <div className='space-y-6'>
      <BackButton />
      <section className='rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-xl sm:p-8'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700'>Mensaje general</p>
          <h1 className='mt-4 text-3xl font-black text-gray-900'>Comunicar a todos</h1>
          <p className='mt-3 text-sm text-gray-600'>Envía un mensaje general a todas las personas que usan la aplicación.</p>
        </div>
      </section>

      <section className='rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='rounded-3xl bg-slate-50 p-6'>
          <p className='text-sm font-semibold text-slate-900'>Escribe aquí tu mensaje</p>
          <textarea
            rows={8}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder='Escribe un anuncio que verán todos los padres y coordinadores...'
            className='mt-4 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
          />
          <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-sm text-slate-500'>Este mensaje se guarda localmente y será visible para padres y coordinadores en su vista.</p>
            <button
              type='button'
              onClick={saveMessage}
              className='rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700'
            >
              Guardar mensaje
            </button>
          </div>
        </div>

        {savedMessage?.text && (
          <div className='mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700'>Mensaje actual</p>
            <p className='mt-3 text-sm text-slate-700'>{savedMessage.text}</p>
            {savedMessage.author && (
              <p className='mt-2 text-sm text-slate-500'>Publicado por: {savedMessage.author}</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
