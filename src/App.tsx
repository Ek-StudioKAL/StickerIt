import { useState } from 'react';
import { Settings, Sticker, AlertCircle, Download, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { useAppState } from './hooks/useAppState';
import { useTheme } from './hooks/useTheme';

import { MobileNav }           from './components/MobileNav';
import { CanvasPanel }          from './components/CanvasPanel';
import { HistoryStrip }         from './components/HistoryStrip';
import { CharacterizeCard }     from './components/CharacterizeCard';
import { MoodCard }             from './components/MoodCard';
import { StyleCard }            from './components/StyleCard';
import { StickerTransformCard } from './components/StickerTransformCard';
import { ExportModal }          from './components/ExportModal';
import { SettingsModal }        from './components/SettingsModal';
import { CropModal }            from './components/CropModal';
import { StepIndicator }        from './components/StepIndicator';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const {
    state,
    setState,
    hasKey,
    canvasRef,
    fileInputRef,
    handleFileUpload,
    handleDrop,
    handleCharacterize,
    handleStickerize,
    loadFromHistory,
    handleMagicIdeas,
    exportImage,
  } = useAppState();

  const { theme, toggle: toggleTheme } = useTheme();
  const [showExport, setShowExport] = useState(false);

  const setTab = (tab: typeof state.activeTab) =>
    setState((s: any) => ({ ...s, activeTab: tab }));

  const openFilePicker = () => fileInputRef.current?.click();

  const handleCropConfirm = (croppedDataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      setState((s: any) => ({
        ...s,
        originalImage: croppedDataUrl,
        cropImageSrc: null,
        history: [{ id: Date.now().toString(), image: croppedDataUrl, caption: '', label: 'Original' }],
      }));
    };
    img.src = croppedDataUrl;
  };

  /* ── No API key screen ── */
  if (hasKey === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg p-6">
        <div className="bg-accent/10 p-5 rounded-3xl mb-6">
          <Sticker className="w-12 h-12 text-accent" />
        </div>
        <h1 className="text-3xl font-bold mb-3 text-ink">API Key Required</h1>
        <p className="text-ink-2 mb-8 text-center max-w-md text-base leading-relaxed">
          Please select a Google Cloud project with billing enabled to use the Gemini Image models.
        </p>
        <button
          onClick={() => window.aistudio.openSelectKey()}
          className="px-8 py-4 bg-accent hover:bg-accent-h text-white rounded-2xl font-semibold text-base transition-all active:scale-95"
        >
          Select API Key
        </button>
      </div>
    );
  }

  /* ── Main app ── */
  return (
    <div className="min-h-screen bg-bg text-ink font-sans selection:bg-accent/20">

      {/* ── Header ── */}
      <header
        className="bg-surface/90 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3 flex justify-between items-center sticky top-0 z-50"
        style={{ boxShadow: 'var(--c-shadow)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="bg-accent p-2 rounded-xl">
            <Sticker className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-ink">StickerIt</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Export */}
          <button
            onClick={() => setShowExport(true)}
            disabled={!state.originalImage}
            aria-label="Export sticker"
            className="
              flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold
              bg-accent hover:bg-accent-h text-white
              active:scale-95 transition-all
              disabled:opacity-40 disabled:pointer-events-none
            "
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-xl hover:bg-surface-2 text-ink-3 hover:text-ink transition-colors"
          >
            {theme === 'dark'
              ? <Sun className="w-5 h-5" />
              : <Moon className="w-5 h-5" />
            }
          </button>

          {/* Settings */}
          <button
            onClick={() => setState((s: any) => ({ ...s, showSettings: true }))}
            aria-label="Open settings"
            className="p-2 rounded-xl hover:bg-surface-2 text-ink-3 hover:text-ink transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-[1400px] mx-auto p-4 pb-24 lg:pb-10">

        {/* Error banner */}
        <AnimatePresence>
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{state.error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">

          {/* ── Left column: canvas + preview controls ── */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20 h-fit">

            {/* Step indicator (desktop only) */}
            <StepIndicator
              hasImage={!!state.originalImage}
              hasCharacter={!!state.characterBase64}
              hasCaption={!!state.caption}
            />

            {/*
              Canvas singleton — one element, always mounted.
              Never use conditional rendering here; use CSS hide/show only.
              This ensures canvasRef.current stays valid regardless of active tab.
            */}
            <CanvasPanel
              canvasRef={canvasRef}
              originalImage={state.originalImage}
              isProcessing={state.isProcessing}
              processingType={state.processingType}
              onUploadClick={openFilePicker}
              onDrop={handleDrop}
            />

            {/*
              Preview tab extras:
              - Mobile: visible only when activeTab === 'preview'
              - Desktop: always visible (lg:block overrides hidden)
            */}
            <div className={`space-y-3 ${state.activeTab === 'preview' ? '' : 'hidden'} lg:block lg:space-y-4`}>
              <StickerTransformCard
                stickerStyle={state.stickerStyle}
                setState={setState}
              />
              <HistoryStrip
                history={state.history}
                currentImage={state.originalImage}
                currentCharacter={state.characterBase64}
                onLoad={loadFromHistory}
              />
            </div>

            {/* Characterize card — desktop only in left column */}
            <div className="hidden lg:block">
              <CharacterizeCard
                isProcessing={state.isProcessing}
                hasImage={!!state.originalImage}
                onCharacterize={handleCharacterize}
                onUploadClick={openFilePicker}
              />
            </div>
          </div>

          {/* ── Right column: control panels ── */}
          <div className="lg:col-span-7 space-y-4">

            {/*
              Create tab:
              - Mobile: visible only when activeTab === 'create'
              - Desktop: always visible
            */}
            <div className={`space-y-4 ${state.activeTab === 'create' ? '' : 'hidden'} lg:block`}>
              {/* CharacterizeCard: mobile only (desktop is in left column above) */}
              <div className="lg:hidden">
                <CharacterizeCard
                  isProcessing={state.isProcessing}
                  hasImage={!!state.originalImage}
                  onCharacterize={handleCharacterize}
                  onUploadClick={openFilePicker}
                />
              </div>
              <MoodCard
                state={state}
                setState={setState}
                onApplyMood={handleStickerize}
              />
            </div>

            {/*
              Style tab:
              - Mobile: visible only when activeTab === 'style'
              - Desktop: always visible
            */}
            <div className={`space-y-4 ${state.activeTab === 'style' ? '' : 'hidden'} lg:block`}>
              <StyleCard
                state={state}
                setState={setState}
                onMagicIdeas={handleMagicIdeas}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*, image/heic, image/heif"
        className="hidden"
      />

      {/* Export modal (header button → bottom sheet on mobile / centered on desktop) */}
      <ExportModal
        show={showExport}
        state={state}
        setState={setState}
        onExport={exportImage}
        onClose={() => setShowExport(false)}
      />

      {/* Crop modal */}
      {state.cropImageSrc && (
        <CropModal
          imageSrc={state.cropImageSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setState((s: any) => ({ ...s, cropImageSrc: null }))}
        />
      )}

      {/* Settings modal */}
      <SettingsModal
        settings={state.settings}
        show={state.showSettings}
        onClose={() => setState((s: any) => ({ ...s, showSettings: false }))}
        onChange={(patch) =>
          setState((s: any) => ({ ...s, settings: { ...s.settings, ...patch } }))
        }
      />

      {/* Mobile bottom tab bar */}
      <MobileNav activeTab={state.activeTab} onChange={setTab} />
    </div>
  );
}
