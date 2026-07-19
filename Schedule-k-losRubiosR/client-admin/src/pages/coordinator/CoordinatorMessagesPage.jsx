import { useEffect, useState } from 'react';
import { ChatBubbleLeftRightIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../features/auth/store/authStore.js';
import { BackButton } from '../../shared/components/ui/BackButton.jsx';
import { showSuccess } from '../../shared/utils/toast.js';
import { createNotification, getMyNotifications } from '../../services/adminApi.js';
import mascotImg from '../../assets/img/DENTRO_mg.png';

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
      <section className='admin-hero p-6 sm:p-8'>
        <div className='admin-reference-copy'>
          <span className='admin-kicker'>Mensaje general</span>
          <h1 className='admin-display admin-display--admin' style={{ fontSize: 'clamp(2.2rem,4vw,3.4rem)' }}>
            Comunicar a todos
          </h1>
          <p className='admin-hero-copy'>Envía un mensaje general a todas las personas que usan la aplicación.</p>
        </div>
      </section>

      <section className='admin-panel p-6 sm:p-8'>
        <div className='admin-mini-panel'>
          <span className='portal-mascot-bubble h-14 w-14 flex-shrink-0'>
            <img src={mascotImg} alt='Schedulito' />
          </span>
          <div className='min-w-0 flex-1'>
            <p className='text-sm font-bold text-[#202020]'>Escribe aquí tu mensaje</p>
            <textarea
              rows={8}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder='Escribe un anuncio que verán todos los padres y coordinadores...'
              className='admin-input mt-4 w-full px-4 py-3 text-sm'
            />
            <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <p className='text-sm text-[#5e5e5e]'>Este mensaje se guarda localmente y será visible para padres y coordinadores en su vista.</p>
              <button type='button' onClick={saveMessage} className='admin-button-primary px-6 text-sm'>
                <MegaphoneIcon className='h-5 w-5' />
                Guardar mensaje
              </button>
            </div>
          </div>
        </div>

        {savedMessage?.text && (
          <div className='admin-card mt-6 p-6'>
            <div className='flex items-center gap-2'>
              <ChatBubbleLeftRightIcon className='h-5 w-5 text-[#5648e7]' />
              <p className='text-sm font-bold uppercase tracking-[0.2em] text-[#5648e7]'>Mensaje actual</p>
            </div>
            <p className='mt-3 text-sm text-[#202020]'>{savedMessage.text}</p>
            {savedMessage.author && (
              <p className='mt-2 text-sm text-[#5e5e5e]'>Publicado por: {savedMessage.author}</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
