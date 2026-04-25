import { TypeOutline, Sticker, Sparkles, AlignLeft, AlignCenter, AlignRight, Eye, EyeOff, Move, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Slider, FONTS, TONES, COLORS } from './shared';
import { DEFAULT_TEXT_STYLE, DEFAULT_STICKER_STYLE, type AppState } from '../hooks/useAppState';

type StyleState = Pick<
  AppState,
  | 'caption'
  | 'showCaption'
  | 'tone'
  | 'customTone'
  | 'textStyle'
  | 'stickerStyle'
  | 'magicIdeas'
  | 'isProcessing'
  | 'characterBase64'
  | 'originalImage'
>;

export function StyleCard({
  state,
  setState,
  onMagicIdeas,
}: {
  state: StyleState;
  setState: React.Dispatch<React.SetStateAction<any>>;
  onMagicIdeas: () => void;
}) {
  const setTextStyle = (patch: Partial<AppState['textStyle']>) =>
    setState((s: any) => ({ ...s, textStyle: { ...s.textStyle, ...patch } }));
  const setStickerStyle = (patch: Partial<AppState['stickerStyle']>) =>
    setState((s: any) => ({ ...s, stickerStyle: { ...s.stickerStyle, ...patch } }));

  const hasContent = state.characterBase64 || state.originalImage;

  return (
    <Card title="Adjust Sticker & Text" icon={TypeOutline}>
      <div className="space-y-6">
        {/* Sticker Transform */}
        <details open>
          <summary className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2 cursor-pointer select-none list-none">
            <Sticker className="w-4 h-4 text-indigo-500" aria-hidden="true" />
            Sticker Transform
          </summary>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <Slider
              label="Scale"
              value={state.stickerStyle.scale}
              min={0.1}
              max={3}
              step={0.05}
              displayValue={`${state.stickerStyle.scale.toFixed(2)}x`}
              onChange={(v) => setStickerStyle({ scale: v })}
              onReset={() => setStickerStyle({ scale: DEFAULT_STICKER_STYLE.scale })}
            />
            <Slider
              label="Rotation"
              value={state.stickerStyle.rotation}
              min={-180}
              max={180}
              displayValue={`${state.stickerStyle.rotation}°`}
              onChange={(v) => setStickerStyle({ rotation: v })}
              onReset={() => setStickerStyle({ rotation: DEFAULT_STICKER_STYLE.rotation })}
              icon={<RotateCw className="w-3 h-3" />}
            />
            <Slider
              label="X Offset"
              value={state.stickerStyle.offsetX}
              min={-500}
              max={500}
              displayValue={`${state.stickerStyle.offsetX}px`}
              onChange={(v) => setStickerStyle({ offsetX: v })}
              onReset={() => setStickerStyle({ offsetX: DEFAULT_STICKER_STYLE.offsetX })}
              icon={<Move className="w-3 h-3" />}
            />
            <Slider
              label="Y Offset"
              value={state.stickerStyle.offsetY}
              min={-500}
              max={500}
              displayValue={`${state.stickerStyle.offsetY}px`}
              onChange={(v) => setStickerStyle({ offsetY: v })}
              onReset={() => setStickerStyle({ offsetY: DEFAULT_STICKER_STYLE.offsetY })}
              icon={<Move className="w-3 h-3" />}
            />
          </div>
        </details>

        <hr className="border-slate-200" />

        {/* Caption & Magic Ideas */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              Sticker Text
              <button
                onClick={() => setState((s: any) => ({ ...s, showCaption: !s.showCaption }))}
                aria-label={state.showCaption ? 'Hide caption' : 'Show caption'}
                className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors"
              >
                {state.showCaption ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </label>
            <button
              onClick={onMagicIdeas}
              disabled={state.isProcessing || !hasContent}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white rounded-lg text-xs font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-fuchsia-500/30 animate-pulse"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Magic Ideas
            </button>
          </div>

          <textarea
            value={state.caption}
            onChange={(e) => setState((s: any) => ({ ...s, caption: e.target.value }))}
            placeholder="Enter text here..."
            className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none resize-none font-medium text-base transition-all"
            rows={2}
          />

          <AnimatePresence>
            {state.magicIdeas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 pt-1"
              >
                {state.magicIdeas.map((idea, i) => (
                  <button
                    key={i}
                    onClick={() => setState((s: any) => ({ ...s, caption: idea }))}
                    className="px-3 py-1.5 bg-white border-2 border-indigo-100 text-indigo-700 rounded-lg text-xs font-bold hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left shadow-sm"
                  >
                    "{idea}"
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tone Selector */}
          <div className="pt-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              Magic Tone
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setState((s: any) => ({ ...s, tone: t.value }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    state.tone === t.value
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              ))}
            </div>
            {state.tone === 'custom' && (
              <input
                type="text"
                value={state.customTone}
                onChange={(e) => setState((s: any) => ({ ...s, customTone: e.target.value }))}
                placeholder="e.g., passive aggressive corporate"
                className="w-full p-3 mt-2 text-sm bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium transition-colors"
              />
            )}
          </div>
        </div>

        <div className="h-px bg-slate-100 w-full" />

        {/* Text Styling Controls */}
        <details open>
          <summary className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2 cursor-pointer select-none list-none">
            <TypeOutline className="w-4 h-4 text-indigo-500" aria-hidden="true" />
            Text Appearance
          </summary>
          <div className="mt-3 space-y-4">
            {/* Font size & Transform */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Slider
                label="Size"
                value={state.textStyle.fontSize}
                min={40}
                max={200}
                displayValue={`${state.textStyle.fontSize}px`}
                onChange={(v) => setTextStyle({ fontSize: v })}
                onReset={() => setTextStyle({ fontSize: DEFAULT_TEXT_STYLE.fontSize })}
                icon={<TypeOutline className="w-3 h-3" />}
              />
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transform</label>
                <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border-2 border-slate-200">
                  {(['none', 'uppercase', 'lowercase', 'capitalize'] as const).map((transform) => (
                    <button
                      key={transform}
                      onClick={() => setTextStyle({ textTransform: transform })}
                      className={`flex-1 py-1.5 flex justify-center rounded-lg transition-all text-xs font-bold ${
                        state.textStyle.textTransform === transform
                          ? 'bg-white shadow-sm text-indigo-600'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {transform === 'none' ? 'Aa' : transform === 'uppercase' ? 'AA' : transform === 'lowercase' ? 'aa' : 'Aa'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Line height & Letter spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Slider
                label="Line Height"
                value={state.textStyle.lineHeight}
                min={0.5}
                max={2.5}
                step={0.1}
                displayValue={`${state.textStyle.lineHeight}`}
                onChange={(v) => setTextStyle({ lineHeight: v })}
                onReset={() => setTextStyle({ lineHeight: DEFAULT_TEXT_STYLE.lineHeight })}
              />
              <Slider
                label="Letter Spacing"
                value={state.textStyle.letterSpacing}
                min={-10}
                max={50}
                displayValue={`${state.textStyle.letterSpacing}px`}
                onChange={(v) => setTextStyle({ letterSpacing: v })}
                onReset={() => setTextStyle({ letterSpacing: DEFAULT_TEXT_STYLE.letterSpacing })}
              />
            </div>

            {/* Font & Alignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Font Family</label>
                  <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-slate-500 normal-case">
                    <input
                      type="checkbox"
                      checked={state.textStyle.autoWrap}
                      onChange={(e) => setTextStyle({ autoWrap: e.target.checked })}
                      className="w-3 h-3 accent-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    Auto-wrap
                  </label>
                </div>
                <select
                  value={state.textStyle.fontFamily}
                  onChange={(e) => setTextStyle({ fontFamily: e.target.value })}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
                >
                  {FONTS.map((f) => (
                    <option key={f.name} value={f.value} style={{ fontFamily: f.value }}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alignment</label>
                <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border-2 border-slate-200">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => setTextStyle({ textAlign: align })}
                      aria-label={`Align ${align}`}
                      className={`flex-1 py-1.5 flex justify-center rounded-lg transition-all ${
                        state.textStyle.textAlign === align
                          ? 'bg-white shadow-sm text-indigo-600'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                      }`}
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
        </details>

        <details open>
          <summary className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2 cursor-pointer select-none list-none">
            Colors & Stroke
          </summary>
          <div className="mt-3 space-y-4">
            {/* Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Text Color</label>
                <div className="flex flex-wrap gap-1.5 items-center">
                  <input
                    type="color"
                    value={state.textStyle.color}
                    onChange={(e) => setTextStyle({ color: e.target.value })}
                    aria-label="Custom text color"
                    className="w-8 h-8 rounded cursor-pointer p-0 border-0"
                  />
                  <div className="w-px h-6 bg-slate-200 mx-1" />
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setTextStyle({ color: c })}
                      aria-label={`Set text color to ${c}`}
                      className={`w-8 h-8 rounded-full border-4 transition-all ${
                        state.textStyle.color === c ? 'border-slate-400 scale-110 shadow-md' : 'border-slate-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stroke Color</label>
                <div className="flex flex-wrap gap-1.5 items-center">
                  <input
                    type="color"
                    value={state.textStyle.strokeColor}
                    onChange={(e) => setTextStyle({ strokeColor: e.target.value })}
                    aria-label="Custom stroke color"
                    className="w-8 h-8 rounded cursor-pointer p-0 border-0"
                  />
                  <div className="w-px h-6 bg-slate-200 mx-1" />
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setTextStyle({ strokeColor: c })}
                      aria-label={`Set stroke color to ${c}`}
                      className={`w-8 h-8 rounded-full border-4 transition-all ${
                        state.textStyle.strokeColor === c ? 'border-slate-400 scale-110 shadow-md' : 'border-slate-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Stroke Width & Tilt */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Slider
                label="Stroke Width"
                value={state.textStyle.strokeWidth}
                min={0}
                max={40}
                displayValue={`${state.textStyle.strokeWidth}px`}
                onChange={(v) => setTextStyle({ strokeWidth: v })}
                onReset={() => setTextStyle({ strokeWidth: DEFAULT_TEXT_STYLE.strokeWidth })}
              />
              <Slider
                label="Tilt"
                value={state.textStyle.rotation}
                min={-45}
                max={45}
                displayValue={`${state.textStyle.rotation}°`}
                onChange={(v) => setTextStyle({ rotation: v })}
                onReset={() => setTextStyle({ rotation: DEFAULT_TEXT_STYLE.rotation })}
                icon={<RotateCw className="w-3 h-3" />}
              />
            </div>
          </div>
        </details>

        <details open>
          <summary className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2 cursor-pointer select-none list-none">
            <Move className="w-4 h-4 text-indigo-500" aria-hidden="true" />
            Text Position
          </summary>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Slider
              label="X Offset"
              value={state.textStyle.offsetX}
              min={-400}
              max={400}
              displayValue={`${state.textStyle.offsetX}px`}
              onChange={(v) => setTextStyle({ offsetX: v })}
              onReset={() => setTextStyle({ offsetX: DEFAULT_TEXT_STYLE.offsetX })}
              icon={<Move className="w-3 h-3" />}
            />
            <Slider
              label="Y Offset"
              value={state.textStyle.offsetY}
              min={-500}
              max={500}
              displayValue={`${state.textStyle.offsetY}px`}
              onChange={(v) => setTextStyle({ offsetY: v })}
              onReset={() => setTextStyle({ offsetY: DEFAULT_TEXT_STYLE.offsetY })}
              icon={<Move className="w-3 h-3" />}
            />
          </div>
        </details>
      </div>
    </Card>
  );
}
