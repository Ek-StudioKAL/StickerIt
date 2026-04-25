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
  'Happy','Angry','Sad','Surprised','Cool','Suspicious','Laughing',
  'Wholesome','Edgy','Annoyed','Sassy','Naughty','Mad','Savage','Exhausted','Bored',
];

export const TONES = [
  { value: 'fun',       label: 'Fun',       icon: Smile },
  { value: 'silly',     label: 'Silly',     icon: Ghost },
  { value: 'sarcastic', label: 'Sarcastic', icon: Zap   },
  { value: 'savage',    label: 'Savage',    icon: Zap   },
  { value: 'wholesome', label: 'Wholesome', icon: Smile },
  { value: 'edgy',      label: 'Edgy',      icon: Zap   },
  { value: 'custom',    label: 'Custom…',   icon: Wand2 },
];

export const COLORS = [
  '#ffffff','#000000','#facc15','#f87171',
  '#60a5fa','#34d399','#c084fc','#fb923c',
];

/* ── Card ─────────────────────────────────────────────────────── */
export function Card({
  title,
  icon: Icon,
  children,
  className = '',
  action,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={`bg-surface rounded-2xl border border-border overflow-hidden ${className}`}
      style={{ boxShadow: 'var(--c-shadow)' }}
    >
      <div className="px-4 py-3 border-b border-border flex items-center gap-2.5">
        <Icon className="w-4 h-4 text-accent flex-shrink-0" />
        <h2 className="text-sm font-semibold text-ink tracking-tight flex-1">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* ── Section label ────────────────────────────────────────────── */
export function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-bold text-ink-3 uppercase tracking-widest">
      {children}
    </span>
  );
}

/* ── Slider ───────────────────────────────────────────────────── */
export function Slider({
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
}) {
  const isFloat = step !== undefined && step < 1;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>
          <span className="flex items-center gap-1">
            {icon}
            {label}
          </span>
        </Label>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-ink-2 tabular-nums">
            {displayValue ?? value}
          </span>
          {onReset && (
            <button
              onClick={onReset}
              aria-label={`Reset ${label}`}
              title="Reset to default"
              className="text-ink-3 hover:text-accent transition-colors text-xs leading-none"
            >
              ↺
            </button>
          )}
        </div>
      </div>
      {/* 40px touch target wrapper */}
      <div className="flex items-center h-10">
        <input
          type="range"
          min={min}
          max={max}
          step={step ?? 1}
          value={value}
          onChange={(e) =>
            onChange(isFloat ? parseFloat(e.target.value) : parseInt(e.target.value))
          }
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          className="w-full"
        />
      </div>
    </div>
  );
}

/* ── Primary button ───────────────────────────────────────────── */
export function PrimaryBtn({
  children,
  onClick,
  disabled,
  fullWidth,
  size = 'md',
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClass = size === 'sm' ? 'py-2 px-4 text-sm' : size === 'lg' ? 'py-4 px-8 text-base' : 'py-3 px-5 text-sm';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${fullWidth ? 'w-full' : ''}
        ${sizeClass}
        bg-accent hover:bg-accent-h text-white font-semibold rounded-xl
        active:scale-[0.97] transition-all
        disabled:opacity-40 disabled:pointer-events-none
        ${className}
      `}
    >
      {children}
    </button>
  );
}

/* ── Ghost button ─────────────────────────────────────────────── */
export function GhostBtn({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-semibold text-ink-2 hover:text-ink
        bg-surface-2 hover:bg-surface-3 rounded-xl transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
