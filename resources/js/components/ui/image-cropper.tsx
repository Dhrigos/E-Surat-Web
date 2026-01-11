import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import getCroppedImg from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ImageCropperProps {
    image: string | null;
    open: boolean;
    onClose: () => void;
    onCropComplete: (croppedBlob: Blob) => void;
    aspect?: number;
}

export function ImageCropper({ image, open, onClose, onCropComplete, aspect = 1 }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!image || !croppedAreaPixels) return;
        setLoading(true);
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            if (croppedImage) {
                onCropComplete(croppedImage);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl w-[95vw] max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800 text-white p-4 md:p-6">
                <DialogHeader>
                    <DialogTitle>Crop Foto Profil</DialogTitle>
                </DialogHeader>
                <div className="relative w-full h-[300px] md:h-[400px] bg-black/50 rounded-lg overflow-hidden mt-4">
                    {image && (
                        <Cropper
                            image={image}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspect}
                            onCropChange={onCropChange}
                            onCropComplete={onCropCompleteHandler}
                            onZoomChange={onZoomChange}
                            cropShape="round"
                            showGrid={false}
                        />
                    )}
                </div>
                <div className="py-4 flex items-center gap-4">
                    <span className="text-sm font-medium">Zoom</span>
                    <Slider
                        value={[zoom]}
                        min={1}
                        max={3}
                        step={0.1}
                        onValueChange={(vals) => setZoom(vals[0])}
                        className="flex-1"
                    />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={loading} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                        Batal
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
