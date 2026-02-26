"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface CameraScannerProps {
  onCapture: (file: File) => void;
  disabled?: boolean;
}

export function CameraScanner({ onCapture, disabled }: CameraScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Erreur caméra:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `receipt-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
        setIsOpen(false);
      }
    }, "image/jpeg", 0.95);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} disabled={disabled}>
        <Camera className="mr-2 h-4 w-4" />
        Scanner
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Scanner un reçu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-2">
              <Button onClick={capturePhoto} className="flex-1">
                <Camera className="mr-2 h-4 w-4" />
                Capturer
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
