import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from '@google/genai';

export type ActiveTab = 'preview' | 'generate' | 'style' | 'export';

export interface TextStyle {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  letterSpacing: number;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textAlign: 'left' | 'center' | 'right';
  offsetX: number;
  offsetY: number;
  rotation: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  autoWrap: boolean;
}

export interface HistoryItem {
  id: string;
  image: string;
  caption: string;
  label: string;
}

export interface AppState {
  originalImage: string | null;
  cropImageSrc: string | null;
  characterBase64: string | null;
  selectedMood: string;
  customMood: string;
  showCaption: boolean;
  caption: string;
  tone: string;
  customTone: string;
  isProcessing: boolean;
  processingType: 'characterizing' | 'stickerizing' | 'analyzing' | 'processing_image' | null;
  error: string | null;
  textStyle: TextStyle;
  stickerStyle: {
    scale: number;
    offsetX: number;
    offsetY: number;
    rotation: number;
  };
  addOutline: boolean;
  extraOutlineWhiteSize: number;
  extraOutlineBlackSize: number;
  settings: {
    characterizePrompt: string;
    stickerizePrompt: string;
    magicIdeasPrompt: string;
  };
  showSettings: boolean;
  magicIdeas: string[];
  history: HistoryItem[];
  activeTab: ActiveTab;
}

export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontSize: 80,
  fontFamily: '"Luckiest Guy", cursive',
  lineHeight: 1.1,
  letterSpacing: 0,
  textTransform: 'none',
  textAlign: 'center',
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  color: '#ffffff',
  strokeColor: '#000000',
  strokeWidth: 12,
  autoWrap: true,
};

export const DEFAULT_STICKER_STYLE = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
};

const INITIAL_STATE: AppState = {
  originalImage: null,
  cropImageSrc: null,
  characterBase64: null,
  selectedMood: 'Happy',
  customMood: '',
  showCaption: true,
  caption: '',
  tone: 'fun',
  customTone: '',
  isProcessing: false,
  processingType: null,
  error: null,
  textStyle: DEFAULT_TEXT_STYLE,
  stickerStyle: DEFAULT_STICKER_STYLE,
  addOutline: false,
  extraOutlineWhiteSize: 8,
  extraOutlineBlackSize: 4,
  settings: {
    characterizePrompt:
      "Transform this image into a vibrant, high-quality sticker character. Use a modern cel-shaded style with subtle depth and contrasted gradients, but keep the bold sticker aesthetic. Add a thick white border (around 10px) around the character, followed by a fine, thin 2px black line outline around the white border. Preserve the original details and recognizable features. Style: clean 2D vector-like cartoon with contrasted shadows. IMPORTANT: The background MUST be a single solid color #ffffff.",
    stickerizePrompt:
      "Using the provided character image as a strict base, make MINOR adjustments to the facial expression and body language to match this mood: '{mood}'. DO NOT reinvent the character it's recognizable features or change the art style. The background MUST be pure solid white (#FFFFFF).",
    magicIdeasPrompt:
      'You are a hilarious sticker caption generator. Generate 4 VERY SHORT, punchy, and creative sticker captions for the provided image. Tone: {tone}. Maximum 4 words per caption. Return ONLY a valid JSON array of strings, e.g. ["Caption 1", "Caption 2"].',
  },
  showSettings: false,
  magicIdeas: [],
  history: [],
  activeTab: 'preview',
};

const looseSafetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

export function useAppState() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isolatedCharRef = useRef<HTMLCanvasElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (isolatedCharRef.current) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d')!;

      tempCtx.save();
      tempCtx.translate(width / 2 + state.stickerStyle.offsetX, height / 2 + state.stickerStyle.offsetY);
      tempCtx.rotate((state.stickerStyle.rotation * Math.PI) / 180);
      tempCtx.scale(state.stickerStyle.scale, state.stickerStyle.scale);
      tempCtx.drawImage(isolatedCharRef.current, -width / 2, -height / 2, width, height);
      tempCtx.restore();

      if (state.caption && state.showCaption) {
        tempCtx.save();
        const x = width / 2 + state.textStyle.offsetX;
        const y = height - 120 + state.textStyle.offsetY;
        tempCtx.translate(x, y);
        tempCtx.rotate((state.textStyle.rotation * Math.PI) / 180);
        tempCtx.font = `${state.textStyle.fontSize}px ${state.textStyle.fontFamily}`;
        (tempCtx as any).letterSpacing = `${state.textStyle.letterSpacing}px`;
        tempCtx.textAlign = state.textStyle.textAlign;
        tempCtx.textBaseline = 'middle';

        let lines: string[] = [];
        if (state.textStyle.autoWrap) {
          const maxWidth = width - 100;
          const rawLines = state.caption.split('\n');
          rawLines.forEach((rawLine) => {
            const words = rawLine.split(' ');
            let currentLine = words[0] || '';
            for (let i = 1; i < words.length; i++) {
              const word = words[i];
              let testLine = currentLine + ' ' + word;
              if (state.textStyle.textTransform === 'uppercase') testLine = testLine.toUpperCase();
              else if (state.textStyle.textTransform === 'lowercase') testLine = testLine.toLowerCase();
              else if (state.textStyle.textTransform === 'capitalize')
                testLine = testLine.replace(/\b\w/g, (l) => l.toUpperCase());

              const metrics = tempCtx.measureText(testLine);
              if (metrics.width < maxWidth) {
                currentLine += ' ' + word;
              } else {
                lines.push(currentLine);
                currentLine = word;
              }
            }
            lines.push(currentLine);
          });
        } else {
          lines = state.caption.split('\n');
        }

        const lineHeight = state.textStyle.fontSize * state.textStyle.lineHeight;
        const totalHeight = lines.length * lineHeight;
        const startY = -(totalHeight / 2) + lineHeight / 2;

        tempCtx.lineJoin = 'round';
        tempCtx.miterLimit = 2;

        lines.forEach((line, i) => {
          let transformedLine = line;
          if (state.textStyle.textTransform === 'uppercase') transformedLine = line.toUpperCase();
          else if (state.textStyle.textTransform === 'lowercase') transformedLine = line.toLowerCase();
          else if (state.textStyle.textTransform === 'capitalize')
            transformedLine = line.replace(/\b\w/g, (l) => l.toUpperCase());

          const lineY = startY + i * lineHeight;
          tempCtx.lineWidth = state.textStyle.strokeWidth;
          tempCtx.strokeStyle = state.textStyle.strokeColor;
          tempCtx.strokeText(transformedLine, 0, lineY);
          tempCtx.fillStyle = state.textStyle.color;
          tempCtx.fillText(transformedLine, 0, lineY);
        });
        tempCtx.restore();
      }

      if (state.addOutline) {
        const silCanvas = document.createElement('canvas');
        silCanvas.width = width;
        silCanvas.height = height;
        const silCtx = silCanvas.getContext('2d')!;
        silCtx.drawImage(tempCanvas, 0, 0);
        silCtx.globalCompositeOperation = 'source-in';
        silCtx.fillStyle = 'white';
        silCtx.fillRect(0, 0, width, height);

        const steps = 32;
        ctx.save();

        if (state.extraOutlineBlackSize > 0) {
          const blackRadius = state.extraOutlineWhiteSize + state.extraOutlineBlackSize;
          const blackSilCanvas = document.createElement('canvas');
          blackSilCanvas.width = width;
          blackSilCanvas.height = height;
          const blackSilCtx = blackSilCanvas.getContext('2d')!;
          blackSilCtx.drawImage(silCanvas, 0, 0);
          blackSilCtx.globalCompositeOperation = 'source-in';
          blackSilCtx.fillStyle = 'black';
          blackSilCtx.fillRect(0, 0, width, height);

          for (let i = 0; i < steps; i++) {
            const angle = (i / steps) * Math.PI * 2;
            ctx.drawImage(blackSilCanvas, Math.cos(angle) * blackRadius, Math.sin(angle) * blackRadius);
          }
        }

        if (state.extraOutlineWhiteSize > 0) {
          for (let i = 0; i < steps; i++) {
            const angle = (i / steps) * Math.PI * 2;
            ctx.drawImage(silCanvas, Math.cos(angle) * state.extraOutlineWhiteSize, Math.sin(angle) * state.extraOutlineWhiteSize);
          }
        }

        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();
      } else {
        ctx.drawImage(tempCanvas, 0, 0);
      }
    } else if (originalImgRef.current) {
      const img = originalImgRef.current;
      const ratio = Math.min(width / img.width, height / img.height);
      const nw = img.width * ratio;
      const nh = img.height * ratio;

      ctx.save();
      ctx.translate(width / 2 + state.stickerStyle.offsetX, height / 2 + state.stickerStyle.offsetY);
      ctx.rotate((state.stickerStyle.rotation * Math.PI) / 180);
      ctx.scale(state.stickerStyle.scale, state.stickerStyle.scale);
      ctx.drawImage(img, -nw / 2, -nh / 2, nw, nh);
      ctx.restore();
    }
  }, [
    state.caption,
    state.textStyle,
    state.addOutline,
    state.extraOutlineWhiteSize,
    state.extraOutlineBlackSize,
    state.showCaption,
    state.stickerStyle,
  ]);

  useEffect(() => {
    document.fonts.ready.then(() => {
      renderCanvas();
    });
  }, [renderCanvas]);

  useEffect(() => {
    if (state.originalImage) {
      const img = new Image();
      img.onload = () => {
        originalImgRef.current = img;
        renderCanvas();
      };
      img.src = state.originalImage;
    } else {
      originalImgRef.current = null;
      renderCanvas();
    }
  }, [state.originalImage, renderCanvas]);

  useEffect(() => {
    renderCanvas();
  }, [state.characterBase64, renderCanvas]);

  const processImageToTransparent = async (base64Image: string): Promise<HTMLCanvasElement> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const width = 1024;
        const height = 1024;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);

        const ratio = Math.min(width / img.width, height / img.height);
        const nw = img.width * ratio;
        const nh = img.height * ratio;
        const nx = (width - nw) / 2;
        const ny = (height - nh) / 2;
        ctx.drawImage(img, nx, ny, nw, nh);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        const mask = new Uint8Array(width * height);
        const stack: number[] = [];

        for (let x = 0; x < width; x++) {
          stack.push(x);
          stack.push((height - 1) * width + x);
        }
        for (let y = 0; y < height; y++) {
          stack.push(y * width);
          stack.push(y * width + width - 1);
        }

        const tolerance = 20;
        const isWhite = (r: number, g: number, b: number) =>
          r > 255 - tolerance && g > 255 - tolerance && b > 255 - tolerance;

        while (stack.length > 0) {
          const idx = stack.pop()!;
          if (mask[idx]) continue;

          const pIdx = idx * 4;
          if (isWhite(data[pIdx], data[pIdx + 1], data[pIdx + 2])) {
            mask[idx] = 1;
            const x = idx % width;
            const y = Math.floor(idx / width);
            if (x > 0) stack.push(idx - 1);
            if (x < width - 1) stack.push(idx + 1);
            if (y > 0) stack.push(idx - width);
            if (y < height - 1) stack.push(idx + width);
          }
        }

        const expandedMask = new Uint8Array(width * height);
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            if (mask[idx]) {
              expandedMask[idx] = 1;
              expandedMask[idx - 1] = 1;
              expandedMask[idx + 1] = 1;
              expandedMask[idx - width] = 1;
              expandedMask[idx + width] = 1;
            }
          }
        }

        const blurredMask = new Float32Array(width * height);
        const blurRadius = 2;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let sum = 0,
              count = 0;
            for (let dy = -blurRadius; dy <= blurRadius; dy++) {
              for (let dx = -blurRadius; dx <= blurRadius; dx++) {
                const nx = x + dx,
                  ny = y + dy;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                  sum += expandedMask[ny * width + nx];
                  count++;
                }
              }
            }
            blurredMask[y * width + x] = sum / count;
          }
        }

        for (let i = 0; i < width * height; i++) {
          data[i * 4 + 3] = (1 - blurredMask[i]) * 255;
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas);
      };
      img.src = base64Image;
    });
  };

  const getAiInstance = () => {
    const key = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!key) throw new Error('API Key missing');
    return new GoogleGenAI({ apiKey: key });
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setState((s) => ({
        ...s,
        cropImageSrc: result,
        characterBase64: null,
        magicIdeas: [],
        history: [],
        stickerStyle: DEFAULT_STICKER_STYLE,
        activeTab: 'preview',
      }));
      isolatedCharRef.current = null;
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (file: File) => {
    processFile(file);
  };

  const handleCharacterize = async () => {
    if (!state.originalImage) return;
    setState((s) => ({ ...s, isProcessing: true, processingType: 'characterizing', error: null }));
    try {
      const ai = getAiInstance();

      const prepareImage = async (dataUrl: string): Promise<{ data: string; ratioStr: string }> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const ratios = [
              { str: '1:1', val: 1 },
              { str: '3:4', val: 3 / 4 },
              { str: '4:3', val: 4 / 3 },
              { str: '9:16', val: 9 / 16 },
              { str: '16:9', val: 16 / 9 },
            ];
            const imgRatio = img.width / img.height;
            const closest = ratios.reduce((prev, curr) =>
              Math.abs(curr.val - imgRatio) < Math.abs(prev.val - imgRatio) ? curr : prev
            );

            let targetW = img.width;
            let targetH = img.height;

            if (imgRatio > closest.val) {
              targetH = img.width / closest.val;
            } else {
              targetW = img.height * closest.val;
            }

            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, targetW, targetH);
            ctx.drawImage(img, (targetW - img.width) / 2, (targetH - img.height) / 2);
            resolve({ data: canvas.toDataURL('image/jpeg').split(',')[1], ratioStr: closest.str });
          };
          img.onerror = reject;
          img.src = dataUrl;
        });
      };

      const { data: base64Data, ratioStr } = await prepareImage(state.originalImage);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: state.settings.characterizePrompt },
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          ],
        },
        config: {
          imageConfig: { aspectRatio: ratioStr as any },
        },
      });

      const imagePart = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (imagePart?.inlineData) {
        const newImage = `data:image/png;base64,${imagePart.inlineData.data}`;
        const isolatedCanvas = await processImageToTransparent(newImage);
        const transparentImage = isolatedCanvas.toDataURL('image/png');

        isolatedCharRef.current = isolatedCanvas;
        setState((s) => ({
          ...s,
          characterBase64: transparentImage,
          history: [
            { id: Date.now().toString() + '_cut', image: transparentImage, caption: s.caption, label: 'Cutout' },
            { id: Date.now().toString() + '_raw', image: newImage, caption: s.caption, label: 'AI Raw' },
            ...s.history,
          ],
          isProcessing: false,
          processingType: null,
        }));
      } else {
        throw new Error('No image generated');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to characterize';
      const displayMessage =
        errorMessage.includes('Forbidden') || errorMessage.includes('403')
          ? "The image or prompt was blocked by the AI's safety filters. Please try a different image."
          : errorMessage;
      setState((s) => ({ ...s, error: displayMessage, isProcessing: false, processingType: null }));
    }
  };

  const handleStickerize = async (mood: string) => {
    if (!state.characterBase64) return;
    setState((s) => ({ ...s, isProcessing: true, processingType: 'stickerizing', error: null }));
    try {
      const ai = getAiInstance();
      const base64Data = state.characterBase64.split(',')[1];
      const prompt = state.settings.stickerizePrompt.replace('{mood}', mood);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { data: base64Data, mimeType: 'image/png' } },
          ],
        },
        config: {
          imageConfig: { aspectRatio: '1:1' },
        },
      });

      const imagePart = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (imagePart?.inlineData) {
        const newImage = `data:image/png;base64,${imagePart.inlineData.data}`;
        const isolatedCanvas = await processImageToTransparent(newImage);
        const transparentImage = isolatedCanvas.toDataURL('image/png');

        isolatedCharRef.current = isolatedCanvas;
        setState((s) => ({
          ...s,
          characterBase64: transparentImage,
          history: [
            { id: Date.now().toString() + '_cut', image: transparentImage, caption: s.caption, label: 'Cutout' },
            { id: Date.now().toString() + '_raw', image: newImage, caption: s.caption, label: 'AI Raw' },
            ...s.history,
          ],
          isProcessing: false,
          processingType: null,
        }));
      } else {
        throw new Error('No image generated');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to stickerize';
      const displayMessage =
        errorMessage.includes('Forbidden') || errorMessage.includes('403')
          ? "This mood was blocked by the AI's safety filters. Please try a different mood."
          : errorMessage;
      setState((s) => ({ ...s, error: displayMessage, isProcessing: false, processingType: null }));
    }
  };

  const loadFromHistory = async (item: HistoryItem) => {
    if (item.label === 'Original') {
      setState((s) => ({ ...s, originalImage: item.image, characterBase64: null }));
      isolatedCharRef.current = null;
    } else {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, 1024, 1024);
        isolatedCharRef.current = canvas;
        setState((s) => ({ ...s, characterBase64: item.image, caption: item.caption }));
      };
      img.src = item.image;
    }
  };

  const handleMagicIdeas = async () => {
    if (!state.characterBase64 && !state.originalImage) return;
    setState((s) => ({ ...s, isProcessing: true, processingType: 'analyzing', error: null }));
    try {
      const ai = getAiInstance();
      const base64Data = (state.characterBase64 || state.originalImage)!.split(',')[1];
      const actualTone = state.tone === 'custom' ? state.customTone : state.tone;
      const prompt = state.settings.magicIdeasPrompt.replace('{tone}', actualTone);

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { data: base64Data, mimeType: 'image/png' } },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          safetySettings: looseSafetySettings,
        },
      });

      const ideas = JSON.parse(response.text || '[]');
      setState((s) => ({ ...s, magicIdeas: ideas, isProcessing: false, processingType: null }));
    } catch (err: any) {
      setState((s) => ({ ...s, error: err.message || 'Failed to generate ideas', isProcessing: false, processingType: null }));
    }
  };

  const exportImage = async (size: number, suffix: string) => {
    if (!canvasRef.current) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size;
    tempCanvas.height = size;
    const ctx = tempCanvas.getContext('2d')!;

    ctx.drawImage(canvasRef.current, 0, 0, size, size);

    tempCanvas.toBlob(async (blob) => {
      if (!blob) return;
      const fileName = `sticker_${new Date().getTime()}_${suffix}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'My Sticker' });
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') return;
          console.error('Share failed:', err);
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }, 'image/png');
  };

  return {
    state,
    setState,
    hasKey,
    canvasRef,
    fileInputRef,
    isolatedCharRef,
    handleFileUpload,
    handleDrop,
    handleCharacterize,
    handleStickerize,
    loadFromHistory,
    handleMagicIdeas,
    exportImage,
  };
}
