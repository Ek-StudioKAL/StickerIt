import { Sticker, Sparkles, Palette } from 'lucide-react';
import type { ActiveTab } from '../hooks/useAppState';

const TABS: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'preview', label: 'Preview', icon: Sticker   },
  { id: 'create',  label: 'Create',  icon: Sparkles  },
  { id: 'style',   label: 'Style',   icon: Palette   },
];

export function MobileNav({
  activeTab,
  onChange,
}: {
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
}) {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative transition-colors"
            >
              {/* Active pill indicator */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-b-full" />
              )}
              <Icon
                className={`w-5 h-5 transition-all ${
                  active ? 'text-accent scale-110' : 'text-ink-3'
                }`}
              />
              <span
                className={`text-[10px] font-semibold tracking-wide transition-colors ${
                  active ? 'text-accent' : 'text-ink-3'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
