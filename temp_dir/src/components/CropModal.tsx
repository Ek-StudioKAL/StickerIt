import { useState, useRef } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Crop as CropIcon, X } from 'lucide-react';

export function CropModal({
  imageSrc,
  onConfirm,
  onCancel,
}: {
  imageSrc: string;
  onConfirm: (croppedDataUrl: string) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 80, height: 80, x: 10, y: 10 });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [cropAspect, setCropAspect] = useState<number | undefined>(undefined);
  const cropImgRef = useRef<HTMLImageElement>(null);

  const getCroppedImg = async (): Promise<string> => {
    const image = cropImgRef.current;
    if (!image || !completedCrop || completedCrop.width === 0) return imageSrc;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return imageSrc;

    let { x, y, width, height } = completedCrop;
    if (completedCrop.unit === '%') {
      x = (x / 100) * image.naturalWidth;
      y = (y / 100) * image.naturalHeight;
      width = (width / 100) * image.naturalWidth;
      height = (height / 100) * image.naturalHeight;
    } else {
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      x *= scaleX;
      y *= scaleY;
      width *= scaleX;
      height *= scaleY;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg');
  };

  const handleConfirm = async () => {
    const cropped = await getCroppedImg();
    onConfirm(cropped);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[80vh] shadow-2xl">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <CropIcon className="w-5 h-5 text-indigo-600" />
            Crop Image
          </h3>
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
            <button
              onClick={onCancel}
              aria-label="Close crop"
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
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
              src={imageSrc}
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
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-colors"
          >
            Confirm Crop
          </button>
        </div>
      </div>
    </div>
  );
}
