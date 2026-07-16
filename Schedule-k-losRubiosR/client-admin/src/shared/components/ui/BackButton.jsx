import { useNavigate } from 'react-router-dom';

export const BackButton = ({ label = 'Regresar' }) => {
  const navigate = useNavigate();

  return (
    <button
      type='button'
      onClick={() => navigate(-1)}
      className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50'
    >
      <span className='text-lg'>←</span>
      {label}
    </button>
  );
};
