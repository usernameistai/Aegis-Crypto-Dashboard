import { themeConfig } from "@/config/themeConfig";

const CryptoField = (
  { label,
    value,
    subMetric,
    currentIndex
  }: { 
    label: string,
    value: string, 
    subMetric?: number, 
    currentIndex?: number }
) => {
  const theme = themeConfig[currentIndex ?? 0];

  return (
    <div 
      tabIndex={0}
      className="relative
        bg-neutral-400/20 border border-white/20 
        shadow-md p-4 rounded-md font-black tracking-wider 
        transition-all duration-300 ease-in-out
        brightness-125 contrast-150 saturate-150
        hover:bg-neutral-400/5 hover:scale-110
        focus:bg-neutral-400/5 focus:scale-110"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-white/20" />

      <div className="text-[11px] md:text-[12px] lg:text-sm text-slate-100/80 uppercase mb-1 tracking-widest">
        {label}
      </div>
      <div className={`text-sm md:text-base font-semibold font-mono 
        ${theme.label === 'Night' ? 'text-slate-200/70' : 'text-slate-800/70'}`}
      >
        {value}
      </div>
      {subMetric !== undefined && (
        <div  className={`text-[11px] md:text-sm tracking-normal ${subMetric >= 0 ? 'text-emerald-400' : 'text-red-600'}`}>
          {subMetric >= 0 ? '▲' : '▼'} {Math.abs(subMetric)}
        </div>
      )}
    </div>
  )
};

export default CryptoField;