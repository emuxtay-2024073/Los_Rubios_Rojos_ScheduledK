import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../../shared/components/ui/BackButton.jsx';
import { showSuccess } from '../../shared/utils/toast.js';
import { createCalendarNote, getAppointments, getCalendarNotes } from '../../services/adminApi.js';

const STORAGE_NOTES_PREFIX = 'coordinator-day-notes-';
const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
const monthLabel = today.toLocaleString('es-GT', { month: 'long', year: 'numeric' });

const getMonthDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });
  return { daysInMonth, firstWeekday, cells };
};

const parseAppointmentDate = (appointment) => {
  if (!appointment?.date) return null;
  const date = new Date(appointment.date);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseAppointmentTime = (appointment, field) => {
  const value = appointment?.[field];
  if (!value) return null;

  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct;

  const baseDate = parseAppointmentDate(appointment);
  if (!baseDate) return null;

  const normalizedDate = `${baseDate.getFullYear().toString().padStart(4, '0')}-${String(baseDate.getMonth() + 1).padStart(2, '0')}-${String(baseDate.getDate()).padStart(2, '0')}`;
  const combined = new Date(`${normalizedDate}T${value}`);
  return Number.isNaN(combined.getTime()) ? null : combined;
};

const parseStoredNotes = (raw) => {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    return Object.entries(parsed).reduce((acc, [day, value]) => {
      const texts = Array.isArray(value) ? value : [String(value)];
      const filtered = texts.map((item) => String(item).trim()).filter(Boolean);
      if (filtered.length) {
        acc[Number(day)] = filtered;
      }
      return acc;
    }, {});
  } catch {
    return {};
  }
};

const loadLocalNotesFromStorage = () => {
  if (typeof window === 'undefined') return [];

  return Object.keys(window.localStorage)
    .filter((key) => key.startsWith(STORAGE_NOTES_PREFIX))
    .map((key) => {
      const raw = window.localStorage.getItem(key);
      const monthPart = key.replace(STORAGE_NOTES_PREFIX, '');
      const [year, month] = monthPart.split('-').map(Number);
      return {
        key,
        year,
        month,
        notesByDay: parseStoredNotes(raw),
      };
    })
    .filter((entry) => entry.year && entry.month && Object.keys(entry.notesByDay).length > 0);
};

const migrateLocalNotesToBackend = async () => {
  if (typeof window === 'undefined') return;

  const entries = loadLocalNotesFromStorage();
  if (!entries.length) return;

  for (const entry of entries) {
    try {
      const existingNotes = await getCalendarNotes(entry.year, entry.month);
      const existingMap = existingNotes.reduce((acc, item) => {
        const noteDate = new Date(item.date);
        if (!Number.isNaN(noteDate.getTime())) {
          const day = noteDate.getDate();
          acc[day] = new Set(
            Array.isArray(item.notes)
              ? item.notes.map((note) => String(note.text || '').trim()).filter(Boolean)
              : [],
          );
        }
        return acc;
      }, {});

      const pendingNotes = [];

      Object.entries(entry.notesByDay).forEach(([dayKey, noteTexts]) => {
        const day = Number(dayKey);
        const existingSet = existingMap[day] || new Set();
        noteTexts.forEach((text) => {
          if (text && !existingSet.has(text)) {
            const isoDate = `${String(entry.year).padStart(4, '0')}-${String(entry.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            pendingNotes.push(createCalendarNote({ date: isoDate, text }));
          }
        });
      });

      if (pendingNotes.length) {
        await Promise.all(pendingNotes);
      }

      window.localStorage.removeItem(entry.key);
    } catch (error) {
      console.error(`Error migrando notas desde ${entry.key}:`, error);
    }
  }
};

const formatAppointmentTime = (appointment, field) => {
  const date = parseAppointmentTime(appointment, field);
  return date ? date.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }) : null;
};

export const CoordinatorCalendarPage = () => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState({});

  const totalNotesCount = useMemo(
    () => Object.values(notes).reduce((count, value) => count + (Array.isArray(value) ? value.length : 0), 0),
    [notes],
  );

  useEffect(() => {
    setNoteText('');
  }, [selectedDay]);

  const loadData = async () => {
    setLoadingAppointments(true);
    try {
      await migrateLocalNotesToBackend();

      const [appointmentsData, notesData] = await Promise.all([
        getAppointments(),
        getCalendarNotes(currentYear, currentMonth + 1),
      ]);

      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);

      const notesByDay = (Array.isArray(notesData) ? notesData : []).reduce(
        (acc, item) => {
          const noteDate = new Date(item.date);
          if (!Number.isNaN(noteDate.getTime())) {
            const day = noteDate.getDate();
            const existing = acc[day] || [];
            const noteTexts = Array.isArray(item.notes)
              ? item.notes.map((noteItem) => String(noteItem.text || '')).filter(Boolean)
              : [];
            acc[day] = [...existing, ...noteTexts];
          }
          return acc;
        },
        {},
      );

      setNotes(notesByDay);
    } catch (error) {
      console.error('No se pudieron cargar datos del calendario:', error);
      setAppointments([]);
      setNotes({});
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const monthAppointments = useMemo(() => {
    return appointments
      .map((appointment) => {
        const dateValue = appointment.date || appointment.startTime;
        const date = new Date(dateValue);
        return {
          ...appointment,
          day: Number.isNaN(date.getTime()) ? null : date.getDate(),
          month: Number.isNaN(date.getTime()) ? null : date.getMonth(),
          year: Number.isNaN(date.getTime()) ? null : date.getFullYear(),
        };
      })
      .filter((appointment) => appointment.year === currentYear && appointment.month === currentMonth && appointment.day);
  }, [appointments]);

  const appointmentMap = useMemo(() => {
    const map = new Map();
    monthAppointments.forEach((appointment) => {
      if (appointment.day !== null) {
        map.set(appointment.day, appointment);
      }
    });
    return map;
  }, [monthAppointments]);

  const selectedAppointment = useMemo(() => appointmentMap.get(selectedDay) || null, [appointmentMap, selectedDay]);

  const selectedNotes = notes[selectedDay] || [];

  useEffect(() => {
    setNoteText('');
  }, [selectedDay]);

  const saveNote = async () => {
    const text = noteText.trim();
    if (!text) {
      return;
    }

    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

    try {
      const noteDoc = await createCalendarNote({ date: dateKey, text });
      const noteDate = new Date(noteDoc.date);
      const day = !Number.isNaN(noteDate.getTime()) ? noteDate.getDate() : selectedDay;
      const updatedNotes = {
        ...notes,
        [day]: [...(notes[day] || []), text],
      };
      setNotes(updatedNotes);
      setNoteText('');
      showSuccess('Apunte guardado en la base de datos. Solo tú puedes verlo.');
    } catch (error) {
      console.error('Error guardando apunte:', error);
      showSuccess('No se pudo guardar el apunte. Intenta de nuevo.');
    }
  };

  const handleGoToRescheduleInCitas = () => {
    if (!selectedAppointment) return;

    navigate('/coordinador/citas', {
      state: { rescheduleAppointmentId: selectedAppointment._id || selectedAppointment.id },
    });
  };

  return (
    <div className='space-y-8'>
      <BackButton />
      <section className='admin-hero p-8 sm:p-10'>
        <div className='admin-reference-copy max-w-5xl'>
          <span className='admin-kicker'>Calendario personal</span>
          <h1 className='admin-display admin-display--admin' style={{ fontSize: 'clamp(2.4rem,4.4vw,3.8rem)' }}>Agenda del coordinador</h1>
          <p className='admin-hero-copy'>Visualiza tus próximas citas y tu disponibilidad semanal en un calendario amplio.</p>
        </div>
      </section>

      <section className='admin-panel p-6 sm:p-8'>
        <div className='grid gap-6 lg:grid-cols-[1.18fr_0.82fr]'>
          <div className='rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-inner'>
            <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-500'>Mes actual</p>
                <h2 className='mt-3 text-2xl font-black text-slate-900'>Calendario de actividades</h2>
                <p className='mt-1 text-sm text-slate-500'>{monthLabel}</p>
              </div>
              <div className='grid gap-2 sm:grid-cols-3'>
                <div className='rounded-3xl bg-white px-4 py-3 text-sm shadow-sm'>
                  <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>Citas</p>
                  <p className='mt-2 text-xl font-black text-slate-900'>{loadingAppointments ? '...' : monthAppointments.length}</p>
                </div>
                <div className='rounded-3xl bg-white px-4 py-3 text-sm shadow-sm'>
                  <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>Días libres</p>
                  <p className='mt-2 text-xl font-black text-slate-900'>{loadingAppointments ? '...' : getMonthDays(currentYear, currentMonth).daysInMonth - new Set(monthAppointments.map((item) => item.day)).size}</p>
                </div>
                <div className='rounded-3xl bg-white px-4 py-3 text-sm shadow-sm'>
                  <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>Notas</p>
                  <p className='mt-2 text-xl font-black text-slate-900'>{totalNotesCount}</p>
                </div>
              </div>
            </div>

            <div className='grid gap-3 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm'>
              <div className='grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                {days.map((day) => (
                  <div key={day} className='py-2'>{day}</div>
                ))}
              </div>
              <div className='grid grid-cols-7 gap-1 text-sm text-slate-600'>
                {getMonthDays(currentYear, currentMonth).cells.map((day, index) => {
                  const appointment = day ? appointmentMap.get(day) : null;
                  const dayNotes = day ? notes[day] || [] : [];
                  const hasNotes = dayNotes.length > 0;
                  const isSelected = selectedDay === day;

                  const statusUpper = (appointment?.status || '').toString().trim().toUpperCase();
                  const statusLabel = statusUpper === 'CONFIRMED'
                    ? 'Confirmada'
                    : statusUpper === 'CANCELLED'
                    ? 'Cancelada'
                    : 'Pendiente';
                  const statusColor = statusUpper === 'CONFIRMED'
                    ? 'bg-green-100 text-green-700'
                    : statusUpper === 'CANCELLED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700';

                  return (
                    <button
                      key={index}
                      type='button'
                      onClick={() => day && setSelectedDay(day)}
                      className={`min-h-[6rem] overflow-hidden rounded-3xl border p-3 text-left transition focus:outline-none ${
                        day
                          ? isSelected
                            ? 'border-[#5648e7] bg-[rgba(86,72,231,0.08)] shadow-sm'
                            : 'border-slate-200 bg-white hover:border-[rgba(86,72,231,0.35)]'
                          : 'border-transparent bg-slate-100 cursor-default'
                      }`}
                      disabled={!day}
                    >
                      <div className='mb-2 flex items-center justify-between gap-2'>
                        <span className='text-sm font-semibold text-slate-900'>{day || ''}</span>
                        <div className='flex items-center gap-1'>
                          {hasNotes && <span className='h-2.5 w-2.5 rounded-full bg-sky-500' />}
                          {appointment && <span className='h-2.5 w-2.5 rounded-full bg-[#5648e7]' />}
                        </div>
                      </div>
                      {appointment ? (
                        <div className='space-y-1 rounded-3xl border border-slate-200 bg-white p-2'>
                          <p className='truncate text-sm font-bold text-slate-900'>Cita</p>
                          <span className={`inline-flex rounded-full px-2 py-1 text-[0.65rem] font-semibold ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </div>
                      ) : (
                        <div className='h-16 rounded-2xl bg-slate-100' />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            <div className='rounded-[2rem] border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 shadow-sm'>
              <p className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-500'>Día seleccionado</p>
              <h3 className='mt-3 text-2xl font-black text-slate-900'>Día {selectedDay}</h3>
              <p className='mt-2 text-sm text-slate-600'>Escribe tu apunte privado para este día. Solo tú lo verás.</p>

              {selectedAppointment ? (
                <div className='mt-5 space-y-4 rounded-3xl border border-slate-200 bg-white p-5'>
                  <p className='text-sm font-semibold text-slate-900'>Cita programada</p>
                  <div className='space-y-2'>
                    <p className='text-base font-bold text-slate-900'>{selectedAppointment.reason || 'Cita'}</p>
                    <p className='text-sm text-slate-600'>
                      {formatAppointmentTime(selectedAppointment, 'startTime') || 'Hora no disponible'}
                      {formatAppointmentTime(selectedAppointment, 'endTime') ? ` - ${formatAppointmentTime(selectedAppointment, 'endTime')}` : ''}
                    </p>
                    <p className='text-sm text-slate-600'>{selectedAppointment.location || selectedAppointment.service || selectedAppointment.description || ''}</p>
                  </div>
                  <span className={(() => {
                    const statusUpper = (selectedAppointment.status || '').toString().trim().toUpperCase();
                    const label = statusUpper === 'CONFIRMED' ? 'Confirmada' : statusUpper === 'CANCELLED' ? 'Cancelada' : 'Pendiente';
                    const color = statusUpper === 'CONFIRMED' ? 'bg-green-100 text-green-700' : statusUpper === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700';
                    return `inline-flex rounded-full px-3 py-1 text-[0.72rem] font-semibold ${color}`;
                  })()}>
                    {(() => {
                      const statusUpper = (selectedAppointment.status || '').toString().trim().toUpperCase();
                      return statusUpper === 'CONFIRMED' ? 'Confirmada' : statusUpper === 'CANCELLED' ? 'Cancelada' : 'Pendiente';
                    })()}
                  </span>

                  {selectedAppointment.status?.toString().trim().toUpperCase() === 'CANCELLED' && (
                    <div className='mt-6 rounded-3xl border border-red-200 bg-red-50 p-5'>
                      <p className='text-sm font-semibold text-red-700'>Reagendar cita cancelada</p>
                      <p className='mt-2 text-sm text-slate-600'>
                        Para reagendar esta cita, ve a la vista de Citas.
                      </p>
                      <button
                        type='button'
                        onClick={handleGoToRescheduleInCitas}
                        className='mt-4 w-full rounded-full bg-[#5648e7] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4438d8]'
                      >
                        Reagendar cita
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className='mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500'>
                  No hay cita agendada para este día.
                </div>
              )}
            </div>

            <div className='rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm'>
              <p className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-500'>Apunte privado</p>
              <textarea
                rows={6}
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                placeholder='Escribe aquí tu nota para este día...'
                className='mt-4 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-[#5648e7] focus:ring-2 focus:ring-[rgba(86,72,231,0.15)]'
              />
              <div className='mt-4 flex items-center justify-between gap-4'>
                <span className='text-sm text-slate-500'>
                  {selectedNotes.length > 0 ? `${selectedNotes.length} apunte${selectedNotes.length > 1 ? 's' : ''} guardado${selectedNotes.length > 1 ? 's' : ''}` : 'No hay apuntes guardados aún.'}
                </span>
                <button
                  type='button'
                  onClick={saveNote}
                  className='rounded-full bg-[#5648e7] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4438d8]'
                >
                  Guardar apunte
                </button>
              </div>

              {selectedNotes.length > 0 && (
                <div className='mt-6 space-y-3'>
                  <p className='text-sm font-semibold text-slate-900'>Apuntes de este día</p>
                  <div className='space-y-2'>
                    {selectedNotes.map((note, index) => (
                      <div key={`${selectedDay}-${index}`} className='rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700'>
                        <p>{note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
