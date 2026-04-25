import {
  TypeOutline, Sparkles, AlignLeft, AlignCenter, AlignRight,
  Eye, EyeOff, Move, RotateCw, ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Label, Slider, FONTS, TONES, COLORS } from './shared';
import { DEFAULT_TEXT_STYLE, type AppState } from '../hooks/useAppState';

type StyleState = Pick<
  AppState,
  | 'caption' | 'showCaption' | 'tone' | 'customTone'
  | 'textStyle' | 'magicIdeas' | 'isProcessing' | 'characterBase64' | 'originalImage'
>;

function Section({ title, defaultOpen = true, children }: {
  title: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface-2 hover:bg-surface-3 transition-colors"
      >
        <span className="text-xs font-semibold text-ink-2 uppercase tracking-wider">{title}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-ink-3 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function StyleCard({
  state,
  setState,
  onMagicIdeas,
}: {
  state: StyleState;
  setState: React.Dispatch<React.SetStateAction<any>>;
  onMagicIdeas: () => void;
}) {
  const set = (patch: Partial<AppState['textStyle']>) =>
    setState((s: any) => ({ ...s, textStyle: { ...s.textStyle, ...patch } }));

  const hasContent = !!(state.characterBase64 || state.originalImage);

  return (
    <Card title="Text & Caption" icon={TypeOutline}>
      <div className="space-y-4">
        {/* Caption row */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Label>Sticker Text</Label>
              <button
                onClick={() => setState((s: any) => ({ ...s, showCaption: !s.showCaption }))}
                aria-label={state.showCaption ? 'Hide caption' : 'Show caption'}
                className="p-1 rounded hover:bg-surface-2 text-ink-3 hover:text-ink transition-colors"
              >
                {state.showCaption ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>
            <button
              onClick={onMagicIdeas}
              disabled={state.isProcessing || !hasContent}
              className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                bg-gradient-to-r from-fuchsia-600 to-accent text-white
                hover:opacity-90 active:scale-95 transition-all
                disabled:opacity-40 disabled:pointer-events-none
                shadow-sm
              "
            >
              <Sparkles className="w-3.5 h-3.5" />
              Magic Ideas
            </button>
          </div>

          <textarea
            value={state.caption}
            onChange={(e) => setState((s: any) => ({ ...s, caption: e.target.value }))}
            placeholder="Enter caption…"
            rows={2}
            className="
              w-full p-3 bg-surface-2 border border-border rounded-xl resize-none
              text-sm text-ink placeholder:text-ink-3
              outline-none focus:border-accent focus:ring-2 focus:ring-accent/20
              transition-colors
            "
          />

          {/* Magic ideas chips */}
          <AnimatePresence>
            {state.magicIdeas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-1.5 mt-2"
              >
                {state.magicIdeas.map((idea, i) => (
                  <button
                    key={i}
                    onClick={() => setState((s: any) => ({ ...s, caption: idea }))}
                    className="
                      px-3 py-1.5 text-xs font-semibold rounded-lg
                      bg-accent-subtle border border-accent/30 text-accent
                      hover:bg-accent hover:text-white transition-all
                    "
                  >
                    {idea}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tone selector */}
          <div className="mt-3">
            <Label>Magic Tone</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setState((s: any) => ({ ...s, tone: t.value }))}
                  aria-pressed={state.tone === t.value}
                  className={`
                    px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all min-h-[36px]
                    ${state.tone === t.value
                      ? 'bg-ink text-surface'
                      : 'bg-surface-2 text-ink-2 hover:bg-surface-3'
                    }
                  `}
                >
                  <t.icon className="w-3 h-3" />
                  {t.label}
                </button>
              ))}
            </div>
            {state.tone === 'custom' && (
              <input
                type="text"
                value={state.customTone}
                onChange={(e) => setState((s: any) => ({ ...s, customTone: e.target.value }))}
                placeholder="e.g. passive-aggressive corporate"
                className="
                  w-full p-3 mt-2 text-sm bg-surface-2 border border-border rounded-xl
                  outline-none focus:border-accent text-ink placeholder:text-ink-3 transition-colors
                "
              />
            )}
          </div>
        </div>

        {/* Typography section */}
        <Section title="Typography">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Slider
                label="Size"
                value={state.textStyle.fontSize}
                min={40} max={200}
                displayValue={`${state.textStyle.fontSize}px`}
                onChange={(v) => set({ fontSize: v })}
                onReset={() => set({ fontSize: DEFAULT_TEXT_STYLE.fontSize })}
                icon={<TypeOutline className="w-3 h-3" />}
              />
              <div className="space-y-1.5">
                <Label>Transform</Label>
                <div className="flex gap-1 bg-surface-2 p-1 rounded-lg border border-border mt-1">
                  {(['none', 'uppercase', 'lowercase', 'capitalize'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => set({ textTransform: t })}
                      aria-label={`Text transform: ${t}`}
                      aria-pressed={state.textStyle.textTransform === t}
                      className={`
                        flex-1 py-2 rounded text-xs font-bold transition-all min-h-[36px]
                        ${state.textStyle.textTransform === t
                          ? 'bg-surface text-accent shadow-sm'
                          : 'text-ink-3 hover:text-ink'
                        }
                      `}
                    >
                      {t === 'none' ? 'Aa' : t === 'uppercase' ? 'AA' : t === 'lowercase' ? 'aa' : 'Ab'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Slider
                label="Line Height"
                value={state.textStyle.lineHeight}
                min={0.5} max={2.5} step={0.1}
                displayValue={`${state.textStyle.lineHeight}`}
                onChange={(v) => set({ lineHeight: v })}
                onReset={() => set({ lineHeight: DEFAULT_TEXT_STYLE.lineHeight })}
              />
              <Slider
                label="Spacing"
                value={state.textStyle.letterSpacing}
                min={-10} max={50}
                displayValue={`${state.textStyle.letterSpacing}px`}
                onChange={(v) => set({ letterSpacing: v })}
                onReset={() => set({ letterSpacing: DEFAULT_TEXT_STYLE.letterSpacing })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Font</Label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.textStyle.autoWrap}
                      onChange={(e) => set({ autoWrap: e.target.checked })}
                      className="w-3 h-3 accent-[--c-accent]"
                    />
                    <span className="text-[10px] font-semibold text-ink-3">Wrap</span>
                  </label>
                </div>
                <select
                  value={state.textStyle.fontFamily}
                  onChange={(e) => set({ fontFamily: e.target.value })}
                  className="
                    w-full p-2.5 bg-surface-2 border border-border rounded-xl text-sm
                    text-ink outline-none focus:border-accent transition-colors
                    appearance-none cursor-pointer
                  "
                >
                  {FONTS.map((f) => (
                    <option key={f.name} value={f.value} style={{ fontFamily: f.value }}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Alignment</Label>
                <div className="flex gap-1 bg-surface-2 p-1 rounded-lg border border-border mt-1">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => set({ textAlign: align })}
                      aria-label={`Align ${align}`}
                      aria-pressed={state.textStyle.textAlign === align}
                      className={`
                        flex-1 py-2 flex justify-center rounded transition-all min-h-[36px]
                        ${state.textStyle.textAlign === align
                          ? 'bg-surface text-accent shadow-sm'
                          : 'text-ink-3 hover:text-ink'
                        }
                      `}
                    >
                      {align === 'left' && <AlignLeft className="w-4 h-4" />}
                      {align === 'center' && <AlignCenter className="w-4 h-4" />}
                      {align === 'right' && <AlignRight className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Color & Stroke section */}
        <Section title="Color & Stroke">
          <div className="space-y-4">
            {(['color', 'strokeColor'] as const).map((key) => (
              <div key={key} className="space-y-1.5">
                <Label>{key === 'color' ? 'Text Color' : 'Stroke Color'}</Label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <input
                    type="color"
                    value={state.textStyle[key]}
                    onChange={(e) => set({ [key]: e.target.value })}
                    aria-label={`Custom ${key}`}
                    className="w-8 h-8 rounded-lg cursor-pointer p-0 border border-border"
                  />
                  <div className="w-px h-6 bg-border" />
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => set({ [key]: c })}
                      aria-label={`Set to ${c}`}
                      className={`
                        w-7 h-7 rounded-full border-2 transition-all
                        ${state.textStyle[key] === c
                          ? 'border-accent scale-110 shadow-sm'
                          : 'border-border hover:scale-105'
                        }
                      `}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              <Slider
                label="Stroke Width"
                value={state.textStyle.strokeWidth}
                min={0} max={40}
                displayValue={`${state.textStyle.strokeWidth}px`}
                onChange={(v) => set({ strokeWidth: v })}
                onReset={() => set({ strokeWidth: DEFAULT_TEXT_STYLE.strokeWidth })}
              />
              <Slider
                label="Tilt"
                value={state.textStyle.rotation}
                min={-45} max={45}
                displayValue={`${state.textStyle.rotation}°`}
                onChange={(v) => set({ rotation: v })}
                onReset={() => set({ rotation: DEFAULT_TEXT_STYLE.rotation })}
                icon={<RotateCw className="w-3 h-3" />}
              />
            </div>
          </div>
        </Section>

        {/* Position section */}
        <Section title="Text Position" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-3">
            <Slider
              label="X Offset"
              value={state.textStyle.offsetX}
              min={-400} max={400}
              displayValue={`${state.textStyle.offsetX}px`}
              onChange={(v) => set({ offsetX: v })}
              onReset={() => set({ offsetX: DEFAULT_TEXT_STYLE.offsetX })}
              icon={<Move className="w-3 h-3" />}
            />
            <Slider
              label="Y Offset"
              value={state.textStyle.offsetY}
              min={-500} max={500}
              displayValue={`${state.textStyle.offsetY}px`}
              onChange={(v) => set({ offsetY: v })}
              onReset={() => set({ offsetY: DEFAULT_TEXT_STYLE.offsetY })}
              icon={<Move className="w-3 h-3" />}
            />
          </div>
        </Section>
      </div>
    </Card>
  );
}
