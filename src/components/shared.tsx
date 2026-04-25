import { Ghost, Smile, Zap, Wand2 } from 'lucide-react';

export const FONTS = [
  { name: 'Inter', value: '"Inter", sans-serif' },
  { name: 'Luckiest Guy', value: '"Luckiest Guy", cursive' },
  { name: 'Bungee', value: '"Bungee", cursive' },
  { name: 'Comic Neue', value: '"Comic Neue", cursive' },
  { name: 'Fredoka One', value: '"Fredoka One", cursive' },
  { name: 'Anton', value: '"Anton", sans-serif' },
  { name: 'Bebas Neue', value: '"Bebas Neue", sans-serif' },
  { name: 'Montserrat', value: '"Montserrat", sans-serif' },
  { name: 'Oswald', value: '"Oswald", sans-serif' },
  { name: 'Poppins', value: '"Poppins", sans-serif' },
];

export const MOODS = [
  'Happy', 'Angry', 'Sad', 'Surprised', 'Cool', 'Suspicious', 'Laughing',
  'Wholesome', 'Edgy', 'Annoyed', 'Sassy', 'Naughty', 'Mad', 'Savage', 'Exhausted', 'Bored',
];

export const TONES = [
  { value: 'fun', label: 'Fun', icon: Smile },
  { value: 'silly', label: 'Silly', icon: Ghost },
  { value: 'sarcastic', label: 'Sarcastic', icon: Zap },
  { value: 'savage', label: 'Savage', icon: Zap },
  { value: 'wholesome', label: 'Wholesome', icon: Smile },
  { value: 'edgy', label: 'Edgy', icon: Zap },
  { value: 'custom', label: 'Custom...', icon: Wand2 },
];

export const COLORS = ['#ffffff', '#000000', '#facc15', '#f87171', '#60a5fa', '#34d399', '#c084fc', '#fb923c'];

export const Card = ({ title, icon: Icon, children, className = '' }: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden ${className}`}>
    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
      <div className="p-2 bg-indigo-50 rounded-lg">
        <Icon className="w-4 h-4 text-indigo-600" />
      </div>
      <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

/** A slider with a larger 40px touch target and a visible value badge */
export const Slider = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  displayValue,
  onReset,
  icon,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  displayValue?: string;
  onReset?: () => void;
  icon?: React.ReactNode;
}) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
        {icon}
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-bold text-slate-600 tabular-nums">{displayValue ?? value}</span>
        {onReset && (
          <button
            onClick={onReset}
            aria-label={`Reset ${label}`}
            title="Reset to default"
            className="text-slate-300 hover:text-indigo-500 transition-colors text-xs leading-none"
          >
            ↺
          </button>
        )}
      </div>
    </div>
    {/* h-10 wrapper gives a 40px touch target while the visual track stays thin */}
    <div className="flex items-center h-10">
      <input
        type="range"
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(step && step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  </div>
);
