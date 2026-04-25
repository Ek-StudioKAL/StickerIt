import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { 
  Upload, Sparkles, Download, RefreshCw, Settings, Sticker, Palette, 
  Ghost, Smile, Zap, Wand2, Move, RotateCw, TypeOutline,
  History, AlertCircle, AlignLeft, AlignCenter, AlignRight, X, Check, Eye, EyeOff, Crop
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface TextStyle {
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

interface HistoryItem {
  id: string;
  image: string;
  caption: string;
  label: string;
}

interface AppState {
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
}

const FONTS = [
  { name: 'Inter', value: '"Inter", sans-serif' },
  { name: 'Luckiest Guy', value: '"Luckiest Guy", cursive' },
  { name: 'Bungee', value: '"Bungee", cursive' },
  { name: 'Comic Neue', value: '"Comic Neue", cursive' },
  { name: 'Fredoka One', value: '"Fredoka One", cursive' },
  { name: 'Anton', value: '"Anton", sans-serif' },
  { name: 'Bebas Neue', value: '"Bebas Neue", sans-serif' },
  { name: 'Montserrat', value: '"Montserrat", sans-serif' },
  { name: 'Oswald', value: '"Oswald", sans-serif' },
  { name: 'Poppins', value: '"Poppins", sans-serif' },
];

const MOODS = [
  'Happy', 'Angry', 'Sad', 'Surprised', 'Cool', 'Suspicious', 'Laughing', 
  'Wholesome', 'Edgy', 'Annoyed', 'Sassy', 'Naughty', 'Mad', 'Savage', 'Exhausted', 'Bored'
];

const TONES = [
  { value: 'fun', label: 'Fun', icon: Smile },
  { value: 'silly', label: 'Silly', icon: Ghost },
  { value: 'sarcastic', label: 'Sarcastic', icon: Zap },
  { value: 'savage', label: 'Savage', icon: Zap },
  { value: 'wholesome', label: 'Wholesome', icon: Smile },
  { value: 'edgy', label: 'Edgy', icon: Zap },
  { value: 'custom', label: 'Custom...', icon: Wand2 },
];

const COLORS = ['#ffffff', '#000000', '#facc15', '#f87171', '#60a5fa', '#34d399', '#c084fc', '#fb923c'];

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const Card = ({ title, icon: Icon, children, className = "" }: any) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden ${className}`}>
    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
      <div className="p-2 bg-indigo-50 rounded-lg">
        <Icon className="w-4 h-4 text-indigo-600" />
      </div>
      <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
    </div>
    <div className="p-4">
      {children}
    </div>
  </div>
);

export default function App() {
  const [state, setState] = useState<AppState>({
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
    textStyle: {
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
    },
    stickerStyle: {
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
    },
    addOutline: false,
    extraOutlineWhiteSize: 8,
    extraOutlineBlackSize: 4,
    settings: {
      characterizePrompt: "Transform this image into a vibrant, high-quality sticker character. Use a modern cel-shaded style with subtle depth and contrasted gradients, but keep the bold sticker aesthetic. Add a thick white border (around 10px) around the character, followed by a fine, thin 2px black line outline around the white border. Preserve the original details and recognizable features. Style: clean 2D vector-like cartoon with contrasted shadows. IMPORTANT: The background MUST be a single solid color #ffffff.",
      stickerizePrompt: "Using the provided character image as a strict base, make MINOR adjustments to the facial expression and body language to match this mood: '{mood}'. DO NOT reinvent the character it's recognizable features or change the art style. The background MUST be pure solid white (#FFFFFF).",
      magicIdeasPrompt: "You are a hilarious sticker caption generator. Generate 4 VERY SHORT, punchy, and creative sticker captions for the provided image. Tone: {tone}. Maximum 4 words per caption. Return ONLY a valid JSON array of strings, e.g. [\"Caption 1\", \"Caption 2\"]."
    },
    showSettings: false,
    magicIdeas: [],
    history: []
  });

  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 80, height: 80, x: 10, y: 10 });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [cropAspect, setCropAspect] = useState<number | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const cropImgRef = useRef<HTMLImageElement>(null);

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

  const getCroppedImg = async (imageSrc: string, pixelCrop: Crop): Promise<string> => {
    const image = cropImgRef.current;
    if (!image) return '';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    let cropX = pixelCrop.x;
    let cropY = pixelCrop.y;
    let cropW = pixelCrop.width;
    let cropH = pixelCrop.height;
    
    if (pixelCrop.unit === '%') {
      cropX = (pixelCrop.x / 100) * image.naturalWidth;
      cropY = (pixelCrop.y / 100) * image.naturalHeight;
      cropW = (pixelCrop.width / 100) * image.naturalWidth;
      cropH = (pixelCrop.height / 100) * image.naturalHeight;
    } else {
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      cropX *= scaleX;
      cropY *= scaleY;
      cropW *= scaleX;
      cropH *= scaleY;
    }

    canvas.width = cropW;
    canvas.height = cropH;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropW,
      cropH,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas.toDataURL('image/jpeg');
  };

  const handleCropConfirm = async () => {
    if (!state.cropImageSrc || !completedCrop || completedCrop.width === 0 || completedCrop.height === 0) {
      // If no crop is made, just use the original image
      if (state.cropImageSrc) {
         const img = new Image();
         img.onload = () => {
           originalImgRef.current = img;
           setState(s => ({ 
             ...s, 
             originalImage: s.cropImageSrc,
             cropImageSrc: null,
             history: [{ id: Date.now().toString(), image: s.cropImageSrc!, caption: '', label: 'Original' }]
           }));
         };
         img.src = state.cropImageSrc;
      }
      return;
    }
    try {
      const croppedImage = await getCroppedImg(state.cropImageSrc, completedCrop);
      const img = new Image();
      img.onload = () => {
        originalImgRef.current = img;
        setState(s => ({ 
          ...s, 
          originalImage: croppedImage,
          cropImageSrc: null,
          history: [{ id: Date.now().toString(), image: croppedImage, caption: '', label: 'Original' }]
        }));
      };
      img.src = croppedImage;
    } catch (e) {
      console.error(e);
    }
  };

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
        const stack = [];
        
        for (let x = 0; x < width; x++) { stack.push(x); stack.push((height - 1) * width + x); }
        for (let y = 0; y < height; y++) { stack.push(y * width); stack.push(y * width + width - 1); }
        
        const tolerance = 20;
        const isWhite = (r: number, g: number, b: number) => r > (255 - tolerance) && g > (255 - tolerance) && b > (255 - tolerance);
        
        while (stack.length > 0) {
          const idx = stack.pop()!;
          if (mask[idx]) continue;
          
          const pIdx = idx * 4;
          if (isWhite(data[pIdx], data[pIdx+1], data[pIdx+2])) {
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
            let sum = 0, count = 0;
            for (let dy = -blurRadius; dy <= blurRadius; dy++) {
              for (let dx = -blurRadius; dx <= blurRadius; dx++) {
                const nx = x + dx, ny = y + dy;
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
          const maxWidth = width - 100; // 50px padding on each side
          const rawLines = state.caption.split('\n');
          rawLines.forEach(rawLine => {
            const words = rawLine.split(' ');
            let currentLine = words[0] || '';
            for (let i = 1; i < words.length; i++) {
              const word = words[i];
              let testLine = currentLine + " " + word;
              if (state.textStyle.textTransform === 'uppercase') testLine = testLine.toUpperCase();
              else if (state.textStyle.textTransform === 'lowercase') testLine = testLine.toLowerCase();
              else if (state.textStyle.textTransform === 'capitalize') testLine = testLine.replace(/\b\w/g, l => l.toUpperCase());
              
              const metrics = tempCtx.measureText(testLine);
              if (metrics.width < maxWidth) {
                currentLine += " " + word;
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
        const startY = -(totalHeight / 2) + (lineHeight / 2);

        tempCtx.lineJoin = 'round';
        tempCtx.miterLimit = 2;

        lines.forEach((line, i) => {
          let transformedLine = line;
          if (state.textStyle.textTransform === 'uppercase') transformedLine = line.toUpperCase();
          else if (state.textStyle.textTransform === 'lowercase') transformedLine = line.toLowerCase();
          else if (state.textStyle.textTransform === 'capitalize') transformedLine = line.replace(/\b\w/g, l => l.toUpperCase());

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
  }, [state.caption, state.textStyle, state.addOutline, state.extraOutlineWhiteSize, state.extraOutlineBlackSize, state.showCaption, state.stickerStyle]);

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

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setState(s => ({ 
        ...s, 
        cropImageSrc: result,
        characterBase64: null, 
        magicIdeas: [],
        history: [],
        stickerStyle: { scale: 1, offsetX: 0, offsetY: 0, rotation: 0 }
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const getAiInstance = () => {
    const key = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!key) throw new Error("API Key missing");
    return new GoogleGenAI({ apiKey: key });
  };

  const looseSafetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ];

  const handleCharacterize = async () => {
    if (!state.originalImage) return;
    setState(s => ({ ...s, isProcessing: true, processingType: 'characterizing', error: null }));
    try {
      const ai = getAiInstance();
      
      const prepareImage = async (dataUrl: string): Promise<{ data: string, ratioStr: string }> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const ratios = [
              { str: "1:1", val: 1 },
              { str: "3:4", val: 3/4 },
              { str: "4:3", val: 4/3 },
              { str: "9:16", val: 9/16 },
              { str: "16:9", val: 16/9 }
            ];
            const imgRatio = img.width / img.height;
            const closest = ratios.reduce((prev, curr) => Math.abs(curr.val - imgRatio) < Math.abs(prev.val - imgRatio) ? curr : prev);
            
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
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } }
          ]
        },
        config: {
          imageConfig: { aspectRatio: ratioStr as any }
        }
      });

      const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        const newImage = `data:image/png;base64,${imagePart.inlineData.data}`;
        const isolatedCanvas = await processImageToTransparent(newImage);
        const transparentImage = isolatedCanvas.toDataURL('image/png');
        
        isolatedCharRef.current = isolatedCanvas;
        setState(s => ({ 
          ...s, 
          characterBase64: transparentImage,
          history: [
            { id: Date.now().toString() + '_cut', image: transparentImage, caption: s.caption, label: 'Cutout' },
            { id: Date.now().toString() + '_raw', image: newImage, caption: s.caption, label: 'AI Raw' },
            ...s.history
          ],
          isProcessing: false, processingType: null
        }));
      } else {
        throw new Error("No image generated");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to characterize";
      const displayMessage = errorMessage.includes("Forbidden") || errorMessage.includes("403") 
        ? "The image or prompt was blocked by the AI's safety filters. Please try a different image." 
        : errorMessage;
      setState(s => ({ ...s, error: displayMessage, isProcessing: false, processingType: null }));
    }
  };

  const handleStickerize = async (mood: string) => {
    if (!state.characterBase64) return;
    setState(s => ({ ...s, isProcessing: true, processingType: 'stickerizing', error: null }));
    try {
      const ai = getAiInstance();
      // Use the raw image if available in history, otherwise use the transparent one
      // It's better to use the transparent one as base to keep consistency
      const base64Data = state.characterBase64.split(',')[1];
      const prompt = state.settings.stickerizePrompt.replace('{mood}', mood);
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { data: base64Data, mimeType: 'image/png' } }
          ]
        },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        const newImage = `data:image/png;base64,${imagePart.inlineData.data}`;
        const isolatedCanvas = await processImageToTransparent(newImage);
        const transparentImage = isolatedCanvas.toDataURL('image/png');

        isolatedCharRef.current = isolatedCanvas;
        setState(s => ({ 
          ...s, 
          characterBase64: transparentImage,
          history: [
            { id: Date.now().toString() + '_cut', image: transparentImage, caption: s.caption, label: 'Cutout' },
            { id: Date.now().toString() + '_raw', image: newImage, caption: s.caption, label: 'AI Raw' },
            ...s.history
          ],
          isProcessing: false, processingType: null
        }));
      } else {
        throw new Error("No image generated");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to stickerize";
      const displayMessage = errorMessage.includes("Forbidden") || errorMessage.includes("403") 
        ? "This mood was blocked by the AI's safety filters. Please try a different mood." 
        : errorMessage;
      setState(s => ({ ...s, error: displayMessage, isProcessing: false, processingType: null }));
    }
  };

  const loadFromHistory = async (item: HistoryItem) => {
    if (item.label === 'Original') {
      setState(s => ({ ...s, originalImage: item.image, characterBase64: null }));
      isolatedCharRef.current = null;
    } else {
      // Cutout or AI Raw
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024; canvas.height = 1024;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, 1024, 1024);
        isolatedCharRef.current = canvas;
        setState(s => ({ ...s, characterBase64: item.image, caption: item.caption }));
      };
      img.src = item.image;
    }
  };

  const handleMagicIdeas = async () => {
    if (!state.characterBase64 && !state.originalImage) return;
    setState(s => ({ ...s, isProcessing: true, processingType: 'analyzing', error: null }));
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
            { inlineData: { data: base64Data, mimeType: 'image/png' } }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          safetySettings: looseSafetySettings
        }
      });

      const ideas = JSON.parse(response.text || "[]");
      setState(s => ({ ...s, magicIdeas: ideas, isProcessing: false, processingType: null }));
    } catch (err: any) {
      setState(s => ({ ...s, error: err.message || "Failed to generate ideas", isProcessing: false, processingType: null }));
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
          await navigator.share({
            files: [file],
            title: 'My Sticker',
          });
          return; // Successfully shared
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            console.error('Share failed:', err);
          }
          if (err.name === 'AbortError') return; // User cancelled share
        }
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = url;
      document.body.appendChild(link); // Append to body (required for Firefox / some older iOS)
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }, 'image/png');
  };

  if (hasKey === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-sans">
        <Sticker className="w-20 h-20 text-indigo-600 mb-6" />
        <h1 className="text-3xl font-black mb-3 text-slate-900">API Key Required</h1>
        <p className="text-slate-600 mb-8 text-center max-w-md text-lg">Please select a Google Cloud project with billing enabled to use the Gemini Image models.</p>
        <button 
          onClick={() => window.aistudio.openSelectKey()}
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
        >
          Select API Key
        </button>
      </div>
    );
  }

  const renderCharacterizeCard = (className: string) => (
    <Card title="Characterize" icon={Palette} className={className}>
      <p className="text-slate-500 mb-3 text-sm font-medium">Turn your photo into a clean, vibrant vector sticker.</p>
      <div className="flex gap-2">
        <button onClick={handleCharacterize} disabled={state.isProcessing || !state.originalImage} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-md hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 disabled:hover:bg-slate-900 disabled:active:scale-100">
          Generate Character
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">
          <Upload className="w-5 h-5" />
        </button>
      </div>
    </Card>
  );

  const renderExportCard = (className: string) => (
    <Card title="Export" icon={Download} className={className}>
      <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={state.addOutline} 
            onChange={(e) => setState(s => ({ ...s, addOutline: e.target.checked }))}
            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
          />
          <span className="text-sm font-bold text-slate-700">Add Extra Cutout Outline</span>
        </label>
        {state.addOutline && (
          <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>White Outline Size</span>
                <span className="text-slate-600">{state.extraOutlineWhiteSize}px</span>
              </label>
              <input type="range" min="0" max="30" value={state.extraOutlineWhiteSize} onChange={(e) => setState(s => ({ ...s, extraOutlineWhiteSize: parseInt(e.target.value) }))} className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Black Outline Size</span>
                <span className="text-slate-600">{state.extraOutlineBlackSize}px</span>
              </label>
              <input type="range" min="0" max="20" value={state.extraOutlineBlackSize} onChange={(e) => setState(s => ({ ...s, extraOutlineBlackSize: parseInt(e.target.value) }))} className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => exportImage(1024, 'highres')} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 flex flex-col items-center gap-1 transition-all group active:scale-95">
          <span className="font-black text-slate-800 group-hover:text-indigo-600 text-base">High-Res</span>
          <span className="text-xs font-bold text-slate-400">1024px</span>
        </button>
        <button onClick={() => exportImage(512, 'sticker')} className="p-4 bg-indigo-600 border-2 border-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex flex-col items-center gap-1 transition-all shadow-lg shadow-indigo-200 active:scale-95">
          <span className="font-black text-base">Sticker</span>
          <span className="text-xs font-bold opacity-80">512px</span>
        </button>
        <button onClick={() => exportImage(100, 'emoji')} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 flex flex-col items-center gap-1 transition-all group active:scale-95">
          <span className="font-black text-slate-800 group-hover:text-indigo-600 text-base">Emoji</span>
          <span className="text-xs font-bold text-slate-400">100px</span>
        </button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-200 pb-24 lg:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/60 px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-md">
            <Sticker className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">StickerIt</h1>
        </div>
        <button onClick={() => setState(s => ({ ...s, showSettings: true }))} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
          <Settings className="w-5 h-5 text-slate-700" />
        </button>
      </header>

      <main className="max-w-[1400px] mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Canvas */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20 h-fit">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`aspect-square rounded-2xl shadow-xl border-8 ${isDragging ? 'border-indigo-500' : 'border-white'} overflow-hidden relative bg-slate-100 transition-colors duration-200`}
          >
            {/* Checkered background pattern */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            }}></div>
            
            <canvas ref={canvasRef} width={1024} height={1024} className={`w-full h-full object-contain relative z-10 ${isDragging ? 'opacity-50' : 'drop-shadow-2xl'} transition-opacity duration-200`} />
            
            {(isDragging || !state.originalImage) && (
              <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 backdrop-blur-md transition-all duration-200 ${isDragging ? 'bg-indigo-50/90' : 'bg-white/60'}`}>
                <div className={`rounded-full flex items-center justify-center shadow-xl mb-4 transition-all ${isDragging ? 'bg-indigo-100 scale-110 w-24 h-24' : 'bg-white w-20 h-20'}`}>
                  <Upload className={`w-8 h-8 ${isDragging ? 'text-indigo-700' : 'text-indigo-600'}`} />
                </div>
                <h3 className="text-2xl font-black mb-2 text-slate-800 tracking-tight">
                  {isDragging ? 'Drop Image Here' : 'Upload a Photo'}
                </h3>
                <p className="text-slate-600 mb-6 max-w-xs text-base font-medium">
                  {isDragging ? 'Release to replace current image' : 'Faces, pets, or objects work best! We\'ll turn it into a premium sticker.'}
                </p>
                {!isDragging && !state.originalImage && (
                  <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0 transition-all">
                    Choose Image
                  </button>
                )}
              </div>
            )}

            {state.isProcessing && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-30">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-30 animate-pulse rounded-full"></div>
                  <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin relative z-10" />
                </div>
                <p className="mt-4 font-bold text-lg text-slate-800 tracking-tight">
                  {state.processingType === 'characterizing' && "Crafting your character..."}
                  {state.processingType === 'stickerizing' && "Adjusting the mood..."}
                  {state.processingType === 'analyzing' && "Brainstorming magic ideas..."}
                  {state.processingType === 'processing_image' && "Cutting out sticker..."}
                </p>
              </div>
            )}
          </div>

          {/* History */}
          {state.history.length > 0 && (
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200/60 flex gap-2 overflow-x-auto scrollbar-hide items-center">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-slate-100 rounded-full ml-1">
                <History className="w-4 h-4 text-slate-500" />
              </div>
              {state.history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className={`relative shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${state.characterBase64 === item.image || state.originalImage === item.image ? 'border-indigo-500 shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100 bg-slate-50 hover:bg-slate-100'}`}
                >
                  <img src={item.image} alt="History" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-bold py-0.5 text-center">{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Desktop Only: Characterize and Export */}
          {renderCharacterizeCard("hidden lg:block")}
          {renderExportCard("hidden lg:block")}
        </div>

        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*, image/heic, image/heif" className="hidden" />

        {/* Cropper Modal */}
        {state.cropImageSrc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[80vh] shadow-2xl">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Crop className="w-5 h-5 text-indigo-600" /> Crop Image</h3>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-600">
                    <input 
                      type="checkbox" 
                      checked={cropAspect === 1} 
                      onChange={(e) => setCropAspect(e.target.checked ? 1 : undefined)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    Lock 1:1 Ratio
                  </label>
                  <button onClick={() => setState(s => ({ ...s, cropImageSrc: null }))} className="p-2 hover:bg-slate-200 rounded-lg transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                </div>
              </div>
              <div className="relative flex-1 bg-slate-900 flex items-center justify-center overflow-auto p-4">
                <ReactCrop
                  crop={crop}
                  aspect={cropAspect}
                  onChange={(c) => setCrop(c)}
                  onComplete={(_, percentCrop) => setCompletedCrop(percentCrop)}
                  className="max-h-full max-w-full flex justify-center items-center"
                >
                  <img 
                    ref={cropImgRef}
                    src={state.cropImageSrc} 
                    alt="Crop me" 
                    className="max-h-[60vh] w-auto max-w-full block"
                    onLoad={(e) => {
                      const { width, height } = e.currentTarget;
                      const size = Math.min(width, height) * 0.8;
                      const x = (width - size) / 2;
                      const y = (height - size) / 2;
                      setCrop({ unit: 'px', width: size, height: size, x, y });
                    }}
                  />
                </ReactCrop>
              </div>
              <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                <button className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors" onClick={() => setState(s => ({ ...s, cropImageSrc: null }))}>Cancel</button>
                <button className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-colors" onClick={handleCropConfirm}>Confirm Crop</button>
              </div>
            </div>
          </div>
        )}

        {/* Right: Controls */}
        <div className="lg:col-span-7 space-y-4">
          {state.error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold flex items-start gap-2 shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{state.error}</p>
            </motion.div>
          )}

          {/* Mobile Only: Characterize */}
          {renderCharacterizeCard("block lg:hidden")}

          <Card title="Adjust Mood" icon={Smile}>
            <div className="flex flex-wrap gap-2 mb-4">
              {MOODS.map(mood => (
                <button
                  key={mood}
                  onClick={() => setState(s => ({ ...s, selectedMood: mood }))}
                  disabled={state.isProcessing || !state.characterBase64}
                  className={`px-3 py-1.5 border-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                    state.selectedMood === mood 
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-white'
                  }`}
                >
                  {mood}
                </button>
              ))}
              <button
                onClick={() => setState(s => ({ ...s, selectedMood: 'Custom' }))}
                disabled={state.isProcessing || !state.characterBase64}
                className={`px-3 py-1.5 border-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                  state.selectedMood === 'Custom' 
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' 
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-white'
                }`}
              >
                Custom...
              </button>
            </div>
            {state.selectedMood === 'Custom' && (
              <input 
                type="text" 
                value={state.customMood} 
                onChange={(e) => setState(s => ({ ...s, customMood: e.target.value }))} 
                placeholder="Enter custom mood..." 
                className="w-full p-3 mb-4 text-sm bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium transition-colors" 
              />
            )}
            <button 
              onClick={() => handleStickerize(state.selectedMood === 'Custom' ? state.customMood : state.selectedMood)}
              disabled={state.isProcessing || !state.characterBase64 || !state.selectedMood || (state.selectedMood === 'Custom' && !state.customMood)}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 disabled:active:scale-100"
            >
              Apply Mood
            </button>
          </Card>

          <Card title="Adjust Sticker & Text" icon={TypeOutline}>
            <div className="space-y-6">
              {/* Sticker Transform Controls */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Sticker className="w-4 h-4 text-indigo-500"/> Sticker Transform</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Scale</span>
                      <span className="text-slate-600">{state.stickerStyle.scale.toFixed(2)}x</span>
                    </label>
                    <input type="range" min="0.1" max="3" step="0.05" value={state.stickerStyle.scale} onChange={(e) => setState(s => ({ ...s, stickerStyle: { ...s.stickerStyle, scale: parseFloat(e.target.value) } }))} className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Rotation</span>
                      <span className="text-slate-600">{state.stickerStyle.rotation}°</span>
                    </label>
                    <input type="range" min="-180" max="180" value={state.stickerStyle.rotation} onChange={(e) => setState(s => ({ ...s, stickerStyle: { ...s.stickerStyle, rotation: parseInt(e.target.value) } }))} className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>X Offset</span>
                      <span className="text-slate-600">{state.stickerStyle.offsetX}px</span>
                    </label>
                    <input type="range" min="-500" max="500" value={state.stickerStyle.offsetX} onChange={(e) => setState(s => ({ ...s, stickerStyle: { ...s.stickerStyle, offsetX: parseInt(e.target.value) } }))} className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Y Offset</span>
                      <span className="text-slate-600">{state.stickerStyle.offsetY}px</span>
                    </label>
                    <input type="range" min="-500" max="500" value={state.stickerStyle.offsetY} onChange={(e) => setState(s => ({ ...s, stickerStyle: { ...s.stickerStyle, offsetY: parseInt(e.target.value) } }))} className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                  </div>
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Caption Input & Magic Ideas */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    Sticker Text
                    <button onClick={() => setState(s => ({ ...s, showCaption: !s.showCaption }))} className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors" title={state.showCaption ? "Hide Caption" : "Show Caption"}>
                      {state.showCaption ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </label>
                  <button onClick={handleMagicIdeas} disabled={state.isProcessing || (!state.characterBase64 && !state.originalImage)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white rounded-lg text-xs font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-fuchsia-500/30 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                    Magic Ideas
                  </button>
                </div>
                <textarea
                  value={state.caption}
                  onChange={(e) => setState(s => ({ ...s, caption: e.target.value }))}
                  placeholder="Enter text here..."
                  className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none resize-none font-medium text-base transition-all"
                  rows={2}
                />
                
                {/* Magic Ideas Results */}
                <AnimatePresence>
                  {state.magicIdeas.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-2 pt-1">
                      {state.magicIdeas.map((idea, i) => (
                        <button key={i} onClick={() => setState(s => ({ ...s, caption: idea }))} className="px-3 py-1.5 bg-white border-2 border-indigo-100 text-indigo-700 rounded-lg text-xs font-bold hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left shadow-sm">
                          "{idea}"
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tone Selector */}
                <div className="pt-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Magic Tone</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TONES.map(t => (
                      <button key={t.value} onClick={() => setState(s => ({ ...s, tone: t.value }))} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${state.tone === t.value ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        <t.icon className="w-3.5 h-3.5" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {state.tone === 'custom' && (
                    <input type="text" value={state.customTone} onChange={(e) => setState(s => ({ ...s, customTone: e.target.value }))} placeholder="e.g., passive aggressive corporate" className="w-full p-3 mt-2 text-sm bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium transition-colors" />
                  )}
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full" />

              {/* Styling Controls */}
              <div className="space-y-4">
                {/* 1. Font Size & Transform */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1"><TypeOutline className="w-3 h-3"/> Size</span>
                      <span className="text-slate-600">{state.textStyle.fontSize}px</span>
                    </label>
                    <input type="range" min="40" max="200" value={state.textStyle.fontSize} onChange={(e) => setState(s => ({ ...s, textStyle: { ...s.textStyle, fontSize: parseInt(e.target.value) } }))} className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transform</label>
                    <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border-2 border-slate-200">
                      {(['none', 'uppercase', 'lowercase', 'capitalize'] as const).map(transform => (
                        <button key={transform} onClick={() => setState(s => ({ ...s, textStyle: { ...s.textStyle, textTransform: transform } }))} className={`flex-1 py-1.5 flex justify-center rounded-lg transition-all text-xs font-bold ${state.textStyle.textTransform === transform ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
                          {transform === 'none' ? 'Aa' : transform === 'uppercase' ? 'AA' : transform === 'lowercase' ? 'aa' : 'Aa'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Line Height & Letter Spacing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1">Line Height</span>
                      <span className="text-slate-600">{state.textStyle.lineHeight}</span>
                    </label>
                    <input type="range" min="0.5" max="2.5" step="0.1" value={state.textStyle.lineHeight} onChange={(e) => setState(s => ({ ...s, textStyle: { ...s.textStyle, lineHeight: parseFloat(e.target.value) } }))} className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1">Letter Spacing</span>
                      <span className="text-slate-600">{state.textStyle.letterSpacing}px</span>
                    </label>
                    <input type="range" min="-10" max="50" value={state.textStyle.letterSpacing} onChange={(e) => setState(s => ({ ...s, textStyle: { ...s.textStyle, letterSpacing: parseInt(e.target.value) } }))} className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                  </div>
                </div>

                {/* 3. Font Family & Alignment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Font Family</span>
                      <label className="flex items-center gap-1 cursor-pointer normal-case text-slate-600">
                        <input type="checkbox" checked={state.textStyle.autoWrap} onChange={(e) => setState(s => ({ ...s, textStyle: { ...s.textStyle, autoWrap: e.target.checked } }))} className="w-3 h-3 accent-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                        Auto-wrap
                      </label>
                    </label>
                    <select value={state.textStyle.fontFamily} onChange={(e) => setState(s => ({ ...s, textStyle: { ...s.textStyle, fontFamily: e.target.value } }))} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer">
                      {FONTS.map(f => <option key={f.name} value={f.value} style={{ fontFamily: f.value }}>{f.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alignment</label>
                    <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border-2 border-slate-200">
                      {(['left', 'center', 'right'] as const).map(align => (
                        <button key={align} onClick={() => setState(s => ({ ...s, textStyle: { ...s.textStyle, textAlign: align } }))} className={`flex-1 py-1.5 flex justify-center rounded-lg transition-all ${state.textStyle.textAlign === align ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
                          {align === 'left' && <AlignLeft className="w-4 h-4" />}
                          {align === 'center' && <AlignCenter className="w-4 h-4" />}
                          {align === 'right' && <AlignRight className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Colors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Text Color</label>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <input type="color" value={state.textStyle.color} onChange={(e) => setState(s => ({ ...s, textStyle: { ...s.textStyle, color: e.target.value } }))} className="w-8 h-8 rounded cursor-pointer p-0 border-0" />
                      <div className="w-px h-6 bg-slate-200 mx-1"></div>
                      {COLORS.map(c => (
                        <button key={c} onClick={() => setState(s => ({ ...s, textStyle: { ...s.textStyle, color: c } }))} className={`w-8 h-8 rounded-full border-4 transition-all ${state.textStyle.color === c ? 'border-slate-400 scale-110 shadow-md' : 'border-slate-100 hover:scale-105'}`} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stroke Color</label>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <input type="color" value={state.textStyle.strokeColor} onChange={(e) => setState(s => ({ ...s, textStyle: { ...s.textStyle, strokeColor: e.target.value } }))} className="w-8 h-8 rounded cursor-pointer p-0 border-0" />
                      <div className="w-px h-6 bg-slate-200 mx-1"></div>
                      {COLORS.map(c => (
                        <button key={c} onClick={() => setState(s => ({ ...s, textStyle: { ...s.textStyle, strokeColor: c } }))} className={`w-8 h-8 rounded-full border-4 transition-all ${state.textStyle.strokeColor === c ? 'border-slate-400 scale-110 shadow-md' : 'border-slate-100 hover:scale-105'}`} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. Stroke Width & Tilt */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1">Stroke Width</span>
                      <span className="text-slate-600">{state.textStyle.strokeWidth}px</span>
                    </label>
                    <input type="range" min="0" max="40" value={state.textStyle.strokeWidth} onChange={(e) => setState(s => ({ ...s, textStyle: { ...s.textStyle, strokeWidth: parseInt(e.target.value) } }))} className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1"><RotateCw className="w-3 h-3"/> Tilt</span>
                      <span className="text-slate-600">{state.textStyle.rotation}°</span>
                    </label>
                    <input type="range" min="-45" max="45" value={state.textStyle.rotation} onChange={(e) => setState(s => ({ ...s, textStyle: { ...s.textStyle, rotation: parseInt(e.target.value) } }))} className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                  </div>
                </div>

                {/* 6. Offsets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1"><Move className="w-3 h-3"/> X Offset</span>
                      <span className="text-slate-600">{state.textStyle.offsetX}px</span>
                    </label>
                    <input type="range" min="-400" max="400" value={state.textStyle.offsetX} onChange={(e) => setState(s => ({ ...s, textStyle: { ...s.textStyle, offsetX: parseInt(e.target.value) } }))} className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1"><Move className="w-3 h-3"/> Y Offset</span>
                      <span className="text-slate-600">{state.textStyle.offsetY}px</span>
                    </label>
                    <input type="range" min="-500" max="500" value={state.textStyle.offsetY} onChange={(e) => setState(s => ({ ...s, textStyle: { ...s.textStyle, offsetY: parseInt(e.target.value) } }))} className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Mobile Only: Export */}
          {renderExportCard("block lg:hidden")}
        </div>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {state.showSettings && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  Advanced Settings
                </h2>
                <button onClick={() => setState(s => ({ ...s, showSettings: false }))} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700">Characterize Prompt</label>
                  <textarea 
                    value={state.settings.characterizePrompt}
                    onChange={(e) => setState(s => ({ ...s, settings: { ...s.settings, characterizePrompt: e.target.value } }))}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-colors min-h-[120px]"
                  />
                  <p className="text-xs text-slate-500 font-medium">The prompt used to generate the initial vector sticker from the photo.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700">Stickerize (Mood) Prompt</label>
                  <textarea 
                    value={state.settings.stickerizePrompt}
                    onChange={(e) => setState(s => ({ ...s, settings: { ...s.settings, stickerizePrompt: e.target.value } }))}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-colors min-h-[120px]"
                  />
                  <p className="text-xs text-slate-500 font-medium">Use {'{mood}'} as a placeholder for the selected mood.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700">Magic Ideas Prompt</label>
                  <textarea 
                    value={state.settings.magicIdeasPrompt}
                    onChange={(e) => setState(s => ({ ...s, settings: { ...s.settings, magicIdeasPrompt: e.target.value } }))}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-colors min-h-[120px]"
                  />
                  <p className="text-xs text-slate-500 font-medium">Use {'{tone}'} as a placeholder for the selected tone. Must request a JSON array of strings.</p>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end sticky bottom-0">
                <button onClick={() => setState(s => ({ ...s, showSettings: false }))} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
