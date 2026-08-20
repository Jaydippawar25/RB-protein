export default function StatCard({ label, value, delta, deltaPositive = true }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="font-display font-bold text-2xl">{value}</p>
      {delta && <p className={`text-xs mt-1 ${deltaPositive ? 'text-brand-green-500' : 'text-red-500'}`}>{delta}</p>}
    </div>
  );
}
