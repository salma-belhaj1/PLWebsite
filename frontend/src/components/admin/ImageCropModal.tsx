import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Crop } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  aspectRatio?: '1:1' | '4:5' | 'free';
  onCropComplete: (croppedDataUrl: string, croppedFile?: File) => void;
  onCancel: () => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  aspectRatio = '1:1',
  onCropComplete,
  onCancel,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedAspect, setSelectedAspect] = useState<'1:1' | '4:5' | 'free'>(aspectRatio);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset controls when imageSrc changes
  useEffect(() => {
    if (imageSrc) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;
      img.onload = () => {
        imageRef.current = img;
        drawCanvas();
      };
    }
  }, [imageSrc, selectedAspect]);

  useEffect(() => {
    drawCanvas();
  }, [zoom, rotation, position, selectedAspect]);

  const getTargetDimensions = () => {
    if (selectedAspect === '1:1') return { width: 500, height: 500 };
    if (selectedAspect === '4:5') return { width: 400, height: 500 };
    return { width: 500, height: 400 };
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width: targetW, height: targetH } = getTargetDimensions();
    canvas.width = targetW;
    canvas.height = targetH;

    ctx.clearRect(0, 0, targetW, targetH);
    ctx.save();

    // Move to center of canvas
    ctx.translate(targetW / 2 + position.x, targetH / 2 + position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate aspect fill
    const scale = Math.max(targetW / img.width, targetH / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleApplyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      if (imageSrc) onCropComplete(imageSrc);
      return;
    }

    const croppedDataUrl = canvas.toDataURL('image/webp', 0.92);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `product-${Date.now()}.webp`, { type: 'image/webp' });
          onCropComplete(croppedDataUrl, file);
        } else {
          onCropComplete(croppedDataUrl);
        }
      },
      'image/webp',
      0.92
    );
  };

  if (!isOpen || !imageSrc) return null;

  const { width: targetW, height: targetH } = getTargetDimensions();
  const aspectRatioStyle = `${targetW} / ${targetH}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col font-sans ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-stone-200 text-zinc-900'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Crop className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Crop & Adjust Image</h3>
                <p className="text-[11px] text-zinc-400">Position and frame your boutique product photo</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="px-4 pt-3 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedAspect('1:1')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                selectedAspect === '1:1'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : isDark
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-zinc-700 hover:bg-stone-200'
              }`}
            >
              1:1 Square (Shop Standard)
            </button>
            <button
              type="button"
              onClick={() => setSelectedAspect('4:5')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                selectedAspect === '4:5'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : isDark
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-zinc-700 hover:bg-stone-200'
              }`}
            >
              4:5 Portrait (Fashion)
            </button>
          </div>

          {/* Crop Viewport */}
          <div
            ref={containerRef}
            className="p-4 flex items-center justify-center overflow-hidden select-none bg-stone-950/20 dark:bg-black/40"
          >
            <div
              style={{ aspectRatio: aspectRatioStyle }}
              className="relative w-full max-w-[340px] max-h-[340px] rounded-2xl overflow-hidden border-2 border-rose-500/80 shadow-inner bg-zinc-950 flex items-center justify-center cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            >
              <canvas ref={canvasRef} className="w-full h-full object-contain pointer-events-none" />

              {/* Grid overlay for alignment */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30 border border-rose-500/30">
                <div className="border-r border-b border-rose-500/30"></div>
                <div className="border-r border-b border-rose-500/30"></div>
                <div className="border-b border-rose-500/30"></div>
                <div className="border-r border-b border-rose-500/30"></div>
                <div className="border-r border-b border-rose-500/30"></div>
                <div className="border-b border-rose-500/30"></div>
                <div className="border-r border-rose-500/30"></div>
                <div className="border-r border-rose-500/30"></div>
                <div></div>
              </div>
            </div>
          </div>

          {/* Controls: Zoom & Rotate */}
          <div className="px-5 py-3 border-t border-stone-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <ZoomOut className="w-4 h-4" />
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-36 sm:w-48 accent-rose-500 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
                />
                <ZoomIn className="w-4 h-4" />
                <span className="text-xs font-mono text-zinc-400 w-8">{Math.round(zoom * 100)}%</span>
              </div>

              <button
                type="button"
                onClick={handleRotate}
                title="Rotate 90°"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                  isDark
                    ? 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                    : 'border-stone-200 bg-stone-100 text-zinc-800 hover:bg-stone-200'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4 border-t border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900/80">
            <button
              type="button"
              onClick={() => onCropComplete(imageSrc)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition underline"
            >
              Skip & Use Original
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                  isDark
                    ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                    : 'border-stone-200 text-zinc-700 hover:bg-stone-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:opacity-95 shadow-md shadow-rose-500/20 active:scale-95 transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Crop & Apply</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
