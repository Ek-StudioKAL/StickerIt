import { Settings, Sticker, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { useAppState } from './hooks/useAppState';

import { MobileNav } from './components/MobileNav';
import { MiniPreview } from './components/MiniPreview';
import { MobilePreviewTab } from './components/MobilePreviewTab';
import { MobileGenerateTab } from './components/MobileGenerateTab';
import { MobileStyleTab } from './components/MobileStyleTab';
import { MobileExportTab } from './components/MobileExportTab';

import { CanvasPanel } from './components/CanvasPanel';
import { HistoryStrip } from './components/HistoryStrip';
import { CharacterizeCard } from './components/CharacterizeCard';
import { MoodCard } from './components/MoodCard';
import { StyleCard } from './components/StyleCard';
import { ExportCard } from './components/ExportCard';
import { SettingsModal } from './components/SettingsModal';
import { CropModal } from './components/CropModal';
import { StepIndicator } from './components/StepIndicator';

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

  if (hasKey === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-sans">
        <Sticker className="w-20 h-20 text-indigo-600 mb-6" />
        <h1 className="text-3xl font-black mb-3 text-slate-900">API Key Required</h1>
        <p className="text-slate-600 mb-8 text-center max-w-md text-lg">
          Please select a Google Cloud project with billing enabled to use the Gemini Image models.
        </p>
        <button
          onClick={() => window.aistudio.openSelectKey()}
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
        >
          Select API Key
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-200">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/60 px-4 sm:px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-md">
            <Sticker className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">StickerIt</h1>
        </div>
        <button
          onClick={() => setState((s: any) => ({ ...s, showSettings: true }))}
          aria-label="Open settings"
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
        >
          <Settings className="w-5 h-5 text-slate-700" />
        </button>
      </header>

      {/* Floating mini-preview on non-Preview tabs (mobile only) */}
      {state.activeTab !== 'preview' && state.originalImage && (
        <MiniPreview canvasRef={canvasRef} onClick={() => setTab('preview')} />
      )}

      <main className="max-w-[1400px] mx-auto p-4 pb-24 lg:pb-6">
        {/* Error banner */}
        <AnimatePresence>
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold flex items-start gap-2 shadow-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{state.error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mobile: tab-based layout ── */}
        <div className="lg:hidden space-y-4">
          {state.activeTab === 'preview' && (
            <MobilePreviewTab
              state={state}
              canvasRef={canvasRef}
              onUploadClick={openFilePicker}
              onDrop={handleDrop}
              onLoadHistory={loadFromHistory}
            />
          )}
          {state.activeTab === 'generate' && (
            <MobileGenerateTab
              state={state}
              setState={setState}
              onCharacterize={handleCharacterize}
              onUploadClick={openFilePicker}
              onApplyMood={handleStickerize}
            />
          )}
          {state.activeTab === 'style' && (
            <MobileStyleTab
              state={state}
              setState={setState}
              onMagicIdeas={handleMagicIdeas}
            />
          )}
          {state.activeTab === 'export' && (
            <MobileExportTab
              state={state}
              setState={setState}
              onExport={exportImage}
            />
          )}
        </div>

        {/* ── Desktop: two-column layout ── */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-4">
          {/* Left: sticky canvas panel */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20 h-fit">
            <StepIndicator
              hasImage={!!state.originalImage}
              hasCharacter={!!state.characterBase64}
              hasCaption={!!state.caption}
            />
            <CanvasPanel
              canvasRef={canvasRef}
              originalImage={state.originalImage}
              isProcessing={state.isProcessing}
              processingType={state.processingType}
              onUploadClick={openFilePicker}
              onDrop={handleDrop}
            />
            <HistoryStrip
              history={state.history}
              currentImage={state.originalImage}
              currentCharacter={state.characterBase64}
              onLoad={loadFromHistory}
            />
            <CharacterizeCard
              isProcessing={state.isProcessing}
              hasImage={!!state.originalImage}
              onCharacterize={handleCharacterize}
              onUploadClick={openFilePicker}
            />
            <ExportCard
              state={state}
              setState={setState}
              onExport={exportImage}
            />
          </div>

          {/* Right: controls */}
          <div className="lg:col-span-7 space-y-4">
            <MoodCard
              state={state}
              setState={setState}
              onApplyMood={handleStickerize}
            />
            <StyleCard
              state={state}
              setState={setState}
              onMagicIdeas={handleMagicIdeas}
            />
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

      {/* Mobile bottom nav */}
      <MobileNav activeTab={state.activeTab} onChange={setTab} />
    </div>
  );
}
