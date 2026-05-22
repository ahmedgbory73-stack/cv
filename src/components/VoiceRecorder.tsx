import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, AlertCircle, Play, Pause } from "lucide-react";

interface VoiceRecorderProps {
  onAudioReady: (audioUrl: string, durationSec: number) => void;
  isRecordingActive: boolean;
  setIsRecordingActive: (active: boolean) => void;
}

export default function VoiceRecorder({
  onAudioReady,
  isRecordingActive,
  setIsRecordingActive,
}: VoiceRecorderProps) {
  const [seconds, setSeconds] = useState(0);
  const [realAudioSupport, setRealAudioSupport] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Check audio media permissions on mount
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setRealAudioSupport(true);
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      stopInterval();
    };
  }, []);

  const startInterval = () => {
    setSeconds(0);
    startTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  const stopInterval = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const startRecording = async () => {
    setIsRecordingActive(true);
    startInterval();
    audioChunksRef.current = [];

    if (realAudioSupport) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const audioUrl = URL.createObjectURL(audioBlob);
          const finalDuration = Math.max(1, seconds);
          onAudioReady(audioUrl, finalDuration);

          // Stop all stream tracks
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
      } catch (err) {
        console.warn("Real mic record failed or denied, using simulated audio flow:", err);
        setRealAudioSupport(false);
      }
    }
  };

  const stopRecording = () => {
    stopInterval();
    setIsRecordingActive(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      // Return beautiful simulated audio URL to maintain functionality
      const simulatedDuration = Math.max(1, seconds);
      // We can use a standard short base64 silence click or sound generator URL, or empty string to indicate simulated vocal payload
      onAudioReady("simulated_vocal", simulatedDuration);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3">
      {isRecordingActive ? (
        <div className="flex items-center gap-3 bg-red-950/40 border border-red-500/20 px-3 py-1.5 rounded-full animate-pulse transition-all">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
          <span className="text-red-400 font-mono text-sm font-medium">
            {formatTimer(seconds)}
          </span>
          <span className="text-gray-400 text-xs font-sans select-none">
            {realAudioSupport ? "جاري تسجيل المايك..." : "جاري تسجيل صوتي محاكى..."}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              stopRecording();
            }}
            className="p-1 rounded-full bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            title="إيقاف وحفظ"
          >
            <Square className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            startRecording();
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            stopRecording();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            startRecording();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopRecording();
          }}
          className="p-3 rounded-full bg-[#182533] text-[#2EA6DE] hover:bg-[#203040] hover:scale-105 active:scale-95 transition-all text-sm cursor-pointer border border-[#2ea6de]/15"
          title="اضغط مطولاً للتسجيل الفوري للرسالة الصوتية عبر المايكروفون"
        >
          <Mic className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

// Inline audio visualizer/player component for messages feed
export function AudioPlayerMessage({ audioUrl, duration }: { audioUrl: string; duration: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (audioUrl === "simulated_vocal") return;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
    };
  }, [audioUrl]);

  const togglePlayback = () => {
    if (audioUrl === "simulated_vocal") {
      // Simulate playback
      setIsPlaying(!isPlaying);
      if (!isPlaying) {
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += 10;
          setProgress(currentProgress);
          if (currentProgress >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            setProgress(0);
          }
        }, 300);
      }
      return;
    }

    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.warn("Audio play prevented:", err));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-3 bg-[#1C2C3E] rounded-xl p-3 border border-blue-900/40 w-64 max-w-full font-sans select-none">
      <button
        onClick={togglePlayback}
        className="w-10 h-10 rounded-full bg-[#2EA6DE] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
      </button>

      <div className="flex-1 space-y-1">
        <div className="h-1.5 w-full bg-gray-700/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
          <span>{duration}</span>
          <span>رسالة صوتية</span>
        </div>
      </div>
    </div>
  );
}
