import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Slider, Label } from './shared';
import type { AppState } from '../hooks/useAppState';

export function ExportModal({
  show,
  state,
  setState,
  onExport,
  onClose,
}: {
  show: boolean;
  state: Pick<AppState, 'addOutline' | 'extraOutlineWhiteSize' | 'extraOutlineBlackSize'>;
  setState: React.Dispatch<React.SetStateAction<any>>;
  onExport: (size: number, suffix: string) => void;
  onClose: () => void;
}) {
  const sizes = [
    { label: 'High-Res', sub: '1024 px', size: 1024, suffix: 'highres', primary: false },
    { label: 'Sticker',  sub: '512 px',  size: 512,  suffix: 'sticker', primary: true  },
    { label: 'Emoji',    sub: '100 px',  size: 100,  suffix: 'emoji',   primary: false },
  ];

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          {/* Sheet: slides up on mobile, centered modal on desktop */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="
              fixed bottom-0 left-0 right-0 z-[61]
              lg:bottom-auto lg:left-1/2 lg:top-1/2
              lg:-translate-x-1/2 lg:-translate-y-1/2
              lg:w-[420px]
              bg-surface rounded-t-2xl lg:rounded-2xl
              border-t lg:border border-border
              overflow-hidden
            "
            style={{ boxShadow: 'var(--c-shadow-lg)' }}
          >
            {/* Handle (mobile only) */}
            <div className="lg:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-border-2 rounded-full" />
            </div>

            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink flex items-center gap-2">
                <Download className="w-4 h-4 text-accent" />
                Export Sticker
              </h3>
              <button
                onClick={onClose}
                aria-label="Close export"
                className="p-1.5 rounded-lg hover:bg-surface-2 text-ink-3 hover:text-ink transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Size buttons */}
              <div className="grid grid-cols-3 gap-3">
                {sizes.map(({ label, sub, size, suffix, primary }) => (
                  <button
                    key={suffix}
                    onClick={() => { onExport(size, suffix); onClose(); }}
                    className={`
                      p-4 rounded-xl border-2 flex flex-col items-center gap-1
                      font-semibold transition-all active:scale-95
                      ${primary
                        ? 'bg-accent border-accent text-white'
                        : 'bg-surface-2 border-border text-ink hover:border-accent hover:text-accent'
                      }
                    `}
                  >
                    <span className="text-sm font-bold">{label}</span>
                    <span className={`text-[11px] ${primary ? 'text-white/70' : 'text-ink-3'}`}>{sub}</span>
                  </button>
                ))}
              </div>

              {/* Outline options */}
              <div className="border border-border rounded-xl overflow-hidden">
                <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-2 transition-colors">
                  <input
                    type="checkbox"
                    checked={state.addOutline}
                    onChange={(e) => setState((s: any) => ({ ...s, addOutline: e.target.checked }))}
                    className="w-4 h-4 accent-[--c-accent] rounded"
                  />
                  <span className="text-sm font-semibold text-ink">Add Cutout Outline</span>
                </label>

                <AnimatePresence>
                  {state.addOutline && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-2 border-t border-border space-y-3">
                        <Slider
                          label="White Outline"
                          value={state.extraOutlineWhiteSize}
                          min={0} max={30}
                          displayValue={`${state.extraOutlineWhiteSize}px`}
                          onChange={(v) => setState((s: any) => ({ ...s, extraOutlineWhiteSize: v }))}
                          onReset={() => setState((s: any) => ({ ...s, extraOutlineWhiteSize: 8 }))}
                        />
                        <Slider
                          label="Black Outline"
                          value={state.extraOutlineBlackSize}
                          min={0} max={20}
                          displayValue={`${state.extraOutlineBlackSize}px`}
                          onChange={(v) => setState((s: any) => ({ ...s, extraOutlineBlackSize: v }))}
                          onReset={() => setState((s: any) => ({ ...s, extraOutlineBlackSize: 4 }))}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
