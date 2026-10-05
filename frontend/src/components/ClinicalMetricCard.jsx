import { Activity, AlertTriangle, Package, Pill } from 'lucide-react';

const metricIcons = {
  catalog: Pill,
  volume: Package,
  low_stock: AlertTriangle,
  expiring: Activity,
};

const metricTones = {
  catalog: 'bg-blue-50 text-blue-600',
  volume: 'bg-emerald-50 text-emerald-600',
  low_stock: 'bg-amber-50 text-amber-600',
  expiring: 'bg-rose-50 text-rose-600',
};

const ClinicalMetricCard = ({ title, value, unit, type = 'catalog' }) => {
  const Icon = metricIcons[type] || Activity;
  const tone = metricTones[type] || 'bg-stone-50 text-stone-600';

  return (
    <article className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400">
            {title}
          </p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-stone-900">
            {value}
            {unit && <span className="ml-1 text-xs font-medium text-stone-400">{unit}</span>}
          </p>
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone}`}>
          <Icon size={19} />
        </span>
      </div>
    </article>
  );
};

export default ClinicalMetricCard;
