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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                Advanced Settings
              </h2>
              <button
                onClick={onClose}
                aria-label="Close settings"
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
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
                <div key={key} className="space-y-3">
                  <label className="text-sm font-bold text-slate-700">{label}</label>
                  <textarea
                    value={settings[key]}
                    onChange={(e) => onChange({ [key]: e.target.value })}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-colors min-h-[120px]"
                  />
                  <p className="text-xs text-slate-500 font-medium">{hint}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end sticky bottom-0">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
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
