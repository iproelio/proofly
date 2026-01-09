
import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  RecorderState, 
  GPSCoord, 
  FailureFlags, 
  SessionContext 
} from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  MAX_RECORDING_DURATION, 
  WATERMARK_TEXT 
} from '../constants';
import { watchPosition } from '../services/gps';

interface RecorderConfig {
  session: SessionContext;
  onFinished: (blob: Blob, metadata: {
    gpsTimeline: GPSCoord[],
    failureFlags: FailureFlags,
    startedAt: number,
    endedAt: number
  }) => void;
}

export const useCanvasRecorder = ({ session, onFinished }: RecorderConfig) => {
  const [state, setState] = useState<RecorderState>(RecorderState.IDLE);
  const [duration, setDuration] = useState(0);
  const [currentGPS, setCurrentGPS] = useState<GPSCoord | null>(null);
  
  // Use a ref for the state to access inside the requestAnimationFrame loop without closure issues
  const stateRef = useRef<RecorderState>(RecorderState.IDLE);
  const currentGPSRef = useRef<GPSCoord | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const gpsWatcherRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // Compliance tracking
  const gpsTimelineRef = useRef<GPSCoord[]>([]);
  const failureFlagsRef = useRef<FailureFlags>({
    gpsLost: false,
    accuracyExceeded: false,
    visibilityChanged: false,
    backgrounded: false
  });
  const startTimeRef = useRef<number>(0);

  // Sync refs with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    currentGPSRef.current = currentGPS;
  }, [currentGPS]);

  const start = useCallback(async () => {
    try {
      setState(RecorderState.PREPARING);
      
      // 1. Acquire Media
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 }, 
          frameRate: { ideal: 30 } 
        },
        audio: true
      });
      streamRef.current = userStream;

      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
        // Wait for video to actually start playing
        await new Promise((resolve) => {
          if (!videoRef.current) return resolve(null);
          videoRef.current.onplaying = resolve;
          videoRef.current.play().catch(console.error);
        });
      }

      // 2. Setup Canvas Loop
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not found");
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get context");

      const draw = () => {
        const currentState = stateRef.current;
        const video = videoRef.current;

        if ((currentState === RecorderState.RECORDING || currentState === RecorderState.PREPARING) && video) {
          // Check readyState (4 = HAVE_ENOUGH_DATA)
          if (video.readyState >= 2) {
            ctx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            
            // Metadata Overlays
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, 120); // Top bar
            ctx.fillRect(0, CANVAS_HEIGHT - 60, CANVAS_WIDTH, 60); // Bottom bar

            ctx.fillStyle = 'white';
            ctx.font = '24px Inter, sans-serif';
            // Corrected to use session.business.name as User doesn't have companyName
            ctx.fillText(`${session.business.name} | Job: ${session.job.id}`, 20, 40);
            ctx.fillText(`Employee: ${session.employee.name} (${session.employee.id})`, 20, 75);
            
            ctx.font = 'bold 24px monospace';
            const now = new Date();
            ctx.fillText(now.toISOString().replace('T', ' ').substring(0, 19), CANVAS_WIDTH - 280, 40);
            
            const gps = currentGPSRef.current;
            if (gps) {
               ctx.fillText(`GPS: ${gps.lat.toFixed(6)}, ${gps.lng.toFixed(6)} (±${gps.accuracy.toFixed(1)}m)`, 20, CANVAS_HEIGHT - 20);
            } else {
               ctx.fillStyle = 'red';
               ctx.fillText('GPS SIGNAL LOST', 20, CANVAS_HEIGHT - 20);
            }

            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = 'italic 18px sans-serif';
            ctx.fillText(WATERMARK_TEXT, CANVAS_WIDTH - 200, CANVAS_HEIGHT - 20);

            // Recording Indicator
            if (currentState === RecorderState.RECORDING) {
              ctx.fillStyle = 'red';
              ctx.beginPath();
              ctx.arc(CANVAS_WIDTH - 40, 75, 10, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            // Video not ready, draw fallback
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = '#fff';
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Initializing Secure Feed...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            ctx.textAlign = 'left';
          }

          animationFrameRef.current = requestAnimationFrame(draw);
        }
      };
      animationFrameRef.current = requestAnimationFrame(draw);

      // 3. Setup Recorder
      const canvasStream = canvas.captureStream(30);
      const audioTrack = userStream.getAudioTracks()[0];
      if (audioTrack) {
        canvasStream.addTrack(audioTrack);
      }

      const recorder = new MediaRecorder(canvasStream, { mimeType: 'video/webm;codecs=vp8,opus' });
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        onFinished(blob, {
          gpsTimeline: gpsTimelineRef.current,
          failureFlags: failureFlagsRef.current,
          startedAt: startTimeRef.current,
          endedAt: Date.now()
        });
        setState(RecorderState.FINISHED);
      };

      // 4. GPS Tracking
      gpsWatcherRef.current = watchPosition(
        (coord) => {
          setCurrentGPS(coord);
          gpsTimelineRef.current.push(coord);
          if (coord.accuracy > 50) failureFlagsRef.current.accuracyExceeded = true;
        },
        (err) => {
          failureFlagsRef.current.gpsLost = true;
          setCurrentGPS(null);
        }
      );

      // 5. Visibility Tracking
      const onVisibilityChange = () => {
        if (document.hidden) {
          failureFlagsRef.current.visibilityChanged = true;
          failureFlagsRef.current.backgrounded = true;
        }
      };
      document.addEventListener('visibilitychange', onVisibilityChange);

      // Start actual recording
      recorder.start(1000);
      startTimeRef.current = Date.now();
      setState(RecorderState.RECORDING);

    } catch (err) {
      console.error('Recorder initialization error:', err);
      setState(RecorderState.ERROR);
    }
  }, [session, onFinished]);

  const stop = useCallback(() => {
    if (recorderRef.current && stateRef.current === RecorderState.RECORDING) {
      recorderRef.current.stop();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (gpsWatcherRef.current !== null) navigator.geolocation.clearWatch(gpsWatcherRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      setState(RecorderState.STOPPING);
    }
  }, []);

  // Handle timer
  useEffect(() => {
    let interval: number;
    if (state === RecorderState.RECORDING) {
      interval = window.setInterval(() => {
        setDuration(prev => {
          const next = prev + 1;
          if (next >= MAX_RECORDING_DURATION) {
            stop();
            return next;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state, stop]);

  return {
    start,
    stop,
    state,
    duration,
    currentGPS,
    canvasRef,
    videoRef
  };
};
