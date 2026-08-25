import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, Check, Crop as CropIcon } from 'lucide-react';

const ASPECTS = [
  { label: 'Carré 1:1', value: 1 },
  { label: 'Paysage 4:3', value: 4 / 3 },
  { label: 'Large 16:9', value: 16 / 9 },
  { label: 'Portrait 3:4', value: 3 / 4 },
];

async function getCroppedImg(src, area) {
  const image = await new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
  const canvas = document.createElement('canvas');
  canvas.width = area.width;
  canvas.height = area.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
  return canvas.toDataURL('image/jpeg', 0.9);
}

const ImageCropperModal = ({ src, onCancel, onDone }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(4 / 3);
  const [areaPixels, setAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);

  const onComplete = useCallback((_, px) => setAreaPixels(px), []);

  const confirm = async () => {
    if (!areaPixels) return;
    setSaving(true);
    const dataUrl = await getCroppedImg(src, areaPixels);
    onDone(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4">
      <div className="bg-[#141416] border border-white/10 rounded-xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <h3 className="flex items-center gap-2 font-heading text-white"><CropIcon size={17} className="text-gold" /> Recadrer l'image</h3>
          <button onClick={onCancel} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="relative h-80 bg-black">
          <Cropper image={src} crop={crop} zoom={zoom} aspect={aspect} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onComplete} />
        </div>
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {ASPECTS.map((a) => (
              <button key={a.label} onClick={() => setAspect(a.value)} className={`text-xs font-heading px-3 py-1.5 rounded-full border ${aspect === a.value ? 'bg-gold text-white border-gold' : 'border-white/20 text-white/60'}`}>{a.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <ZoomIn size={16} className="text-white/50" />
            <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-[#E11D2E]" />
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 border border-white/15 text-white font-heading py-3 rounded-sm">Annuler</button>
            <button onClick={confirm} disabled={saving} className="flex-[2] flex items-center justify-center gap-2 gold-gradient text-white font-heading py-3 rounded-sm disabled:opacity-60"><Check size={16} /> {saving ? 'Traitement...' : 'Valider le recadrage'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
