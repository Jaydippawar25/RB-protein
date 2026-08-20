export default function Loader({ full = false, label = 'Loading' }) {
  return (
    <div className={full ? 'min-h-[60vh] flex items-center justify-center' : 'flex items-center justify-center py-10'}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 rounded-full border-2 border-brand-green-500/30 border-t-brand-green-500 animate-spin" />
        <span className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">{label}</span>
      </div>
    </div>
  );
}
