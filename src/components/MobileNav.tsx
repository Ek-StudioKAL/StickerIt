import { Sticker, Sparkles, TypeOutline, Download } from 'lucide-react';
import type { ActiveTab } from '../hooks/useAppState';

const TABS: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'preview', label: 'Preview', icon: Sticker },
  { id: 'generate', label: 'Generate', icon: Sparkles },
  { id: 'style', label: 'Style', icon: TypeOutline },
  { id: 'export', label: 'Export', icon: Download },
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
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200/80 shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            aria-label={label}
            aria-current={activeTab === id ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
              activeTab === id
                ? 'text-indigo-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon className={`w-5 h-5 ${activeTab === id ? 'drop-shadow-sm' : ''}`} />
            <span className={`text-[10px] font-bold tracking-wide ${activeTab === id ? 'text-indigo-600' : 'text-slate-400'}`}>
              {label}
            </span>
            {activeTab === id && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
