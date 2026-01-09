
import React, { forwardRef } from 'react';

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const RecordingCanvas = forwardRef<HTMLCanvasElement, Props>(({ canvasRef, videoRef }, ref) => {
  return (
    <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden border-2 border-slate-700 shadow-2xl">
      {/* Use absolute + invisible instead of hidden to prevent some browsers from throttling the video track */}
      <video 
        ref={videoRef} 
        className="absolute inset-0 w-full h-full object-cover invisible pointer-events-none" 
        muted 
        playsInline 
        autoPlay
      />
      <canvas 
        ref={canvasRef} 
        width={1280} 
        height={720}
        className="w-full h-full object-contain relative z-0"
      />
      <div className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded text-xs font-bold animate-pulse flex items-center gap-2 z-10">
        <div className="w-2 h-2 rounded-full bg-white"></div>
        SECURE CHANNEL ACTIVE
      </div>
    </div>
  );
});

RecordingCanvas.displayName = 'RecordingCanvas';

export default RecordingCanvas;
