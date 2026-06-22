const CryptoField = ({ label, value, subMetric }: { label: string, value: string, subMetric?: number }) => (
  <div tabIndex={0} className="bg-white/10 border-b-2 border-r-2 border-neutral-200/70 shadow-md p-4 md:p-4 rounded-md font-bold tracking-wide md:tracking-tight transition-[background-color,transform,box-shadow] duration-300 ease-in-out hover:bg-white/30 hover:scale-115 focus:bg-white/30 focus:scale-115">
    <div className="text-sm md:text-[14px] text-slate-300 uppercase mb-1">{label}</div>
    <div className="text-sm md:text-base font-bold text-slate-700/80 font-mono">{value}</div>
    {subMetric !== undefined && (
      <div  className={`text-[11px] md:text-sm ${subMetric >= 0 ? 'text-emerald-400' : 'text-red-600'}`}>
        {subMetric >= 0 ? '▲' : '▼'} {Math.abs(subMetric)}
      </div>
    )}
  </div>
);

export default CryptoField;