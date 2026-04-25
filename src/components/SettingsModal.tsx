import { Settings, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { AppState } from '../hooks/useAppState';

export function SettingsModal({
  settings,
  show,
  onClose,
  onChange,
}: {
  settings: AppState['settings'];
  show: boolean;
  onClose: () => void;
  onChange: (patch: Partial<AppState['settings']>) => void;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="bg-surface rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border"
            style={{ boxShadow: 'var(--c-shadow-lg)' }}
          >
            <div className="px-5 py-4 border-b border-border flex justify-between items-center sticky top-0 bg-surface/95 backdrop-blur-md z-10">
              <h2 className="text-base font-semibold text-ink flex items-center gap-2">
                <Settings className="w-4 h-4 text-accent" />
                Advanced Settings
              </h2>
              <button
                onClick={onClose}
                aria-label="Close settings"
                className="p-1.5 hover:bg-surface-2 rounded-lg transition-colors text-ink-3 hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {[
                {
                  key: 'characterizePrompt' as const,
                  label: 'Characterize Prompt',
                  hint: 'The prompt used to generate the initial vector sticker from the photo.',
                },
                {
                  key: 'stickerizePrompt' as const,
                  label: 'Stickerize (Mood) Prompt',
                  hint: "Use {'{mood}'} as a placeholder for the selected mood.",
                },
                {
                  key: 'magicIdeasPrompt' as const,
                  label: 'Magic Ideas Prompt',
                  hint: "Use {'{tone}'} as a placeholder for the selected tone. Must request a JSON array of strings.",
                },
              ].map(({ key, label, hint }) => (
                <div key={key} className="space-y-2">
                  <label className="text-xs font-bold text-ink-2 uppercase tracking-widest">{label}</label>
                  <textarea
                    value={settings[key]}
                    onChange={(e) => onChange({ [key]: e.target.value })}
                    className="
                      w-full p-3 bg-surface-2 border border-border rounded-xl text-sm text-ink
                      outline-none focus:border-accent focus:ring-2 focus:ring-accent/20
                      transition-colors min-h-[120px] resize-y placeholder:text-ink-3
                    "
                  />
                  <p className="text-xs text-ink-3">{hint}</p>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-border bg-surface-2 flex justify-end sticky bottom-0">
              <button
                onClick={onClose}
                className="
                  px-5 py-2.5 bg-accent hover:bg-accent-h text-white rounded-xl font-semibold text-sm
                  transition-all active:scale-95 flex items-center gap-2
                "
              >
                <Check className="w-4 h-4" />
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
