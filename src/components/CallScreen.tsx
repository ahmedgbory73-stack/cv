import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PhoneOff, Mic, MicOff, Volume2, Video, VideoOff, Lock, CheckCircle2 } from "lucide-react";

interface CallScreenProps {
  developerName: string;
  callType: "صوتية" | "فيديو";
  onHangup: () => void;
}

export default function CallScreen({ developerName, callType, onHangup }: CallScreenProps) {
  const [status, setStatus] = useState<"connecting" | "ringing" | "connected">("connecting");
  const [timer, setTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Status simulation timers
  useEffect(() => {
    const statusTimeout1 = setTimeout(() => {
      setStatus("ringing");
    }, 1500);

    const statusTimeout2 = setTimeout(() => {
      setStatus("connected");
    }, 3500);

    return () => {
      clearTimeout(statusTimeout1);
      clearTimeout(statusTimeout2);
    };
  }, []);

  // Connected Timer loop
  useEffect(() => {
    if (status !== "connected") return;

    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const secsLeft = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${secsLeft.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-[#0E1621]/95 text-white flex flex-col justify-between items-center p-6 backdrop-blur-md"
    >
      {/* Top Encryption Seal */}
      <div className="flex items-center gap-2 bg-[#17212B]/90 border border-green-500/20 px-4 py-2 rounded-full mt-4 text-xs font-sans text-green-400">
        <Lock className="w-3.5 h-3.5 fill-current" />
        <span>تشفير فوري تام للاتصال (End-to-End Encrypted)</span>
        <CheckCircle2 className="w-4.5 h-4.5 text-green-500 animate-pulse" />
      </div>

      {/* Main Calling Profile Card */}
      <div className="flex flex-col items-center flex-1 justify-center max-w-md w-full gap-5">
        <div className="relative">
          {/* Wave Ripple Animation */}
          {status === "connected" ? (
            <div className="absolute inset-0 bg-[#2ea6de]/20 rounded-full animate-ping pointer-events-none scale-150" />
          ) : (
            <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse scale-125" />
          )}

          <div className="w-28 h-28 rounded-full bg-[#2EA6DE] flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-[#17212B] relative z-10">
            {developerName[0] || "D"}
          </div>
        </div>

        <div className="text-center z-10 space-y-2">
          <h2 className="text-2xl font-bold font-sans">{developerName}</h2>
          <p className="text-sm font-sans text-gray-400">
            {status === "connecting" && "جاري الاتصال الآمن بالمطور..."}
            {status === "ringing" && "يرن الآن..."}
            {status === "connected" && (
              <span className="text-[#2ea6de] font-mono font-medium text-lg leading-none">
                {formatTimer(timer)}
              </span>
            )}
          </p>
        </div>

        {/* Video stream container simulation */}
        {callType === "فيديو" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-48 rounded-xl bg-[#17212B] border border-gray-800 relative overflow-hidden flex items-center justify-center"
          >
            {isVideoOff ? (
              <div className="text-gray-500 flex flex-col items-center gap-1 font-sans text-xs">
                <VideoOff className="w-8 h-8 text-gray-600 mb-1" />
                <span>الكاميرا مغلقة</span>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col justify-between p-3 select-none">
                <div className="flex justify-between items-center">
                  <span className="bg-[#0E1621]/80 px-2 py-1 text-[10px] rounded font-mono">
                    HD LIVE
                  </span>
                  <div className="bg-green-500 w-2 h-2 rounded-full animate-ping" />
                </div>
                {/* Audio waves graph simulator */}
                <div className="flex items-end justify-center h-20 gap-1 opacity-70">
                  <div className="w-1.5 bg-[#2EA6DE] animate-[bounce_1.2s_infinite_100ms] rounded-full h-8" />
                  <div className="w-1.5 bg-blue-400 animate-[bounce_1.5s_infinite_400ms] rounded-full h-14" />
                  <div className="w-1.5 bg-emerald-400 animate-[bounce_1s_infinite_200ms] rounded-full h-6" />
                  <div className="w-1.5 bg-cyan-400 animate-[bounce_1.3s_infinite_500ms] rounded-full h-16" />
                  <div className="w-1.5 bg-[#2EA6DE] animate-[bounce_1.1s_infinite_300ms] rounded-full h-10" />
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-sans">
                  <span>تم استقرار تدفق البيانات بنسبة ٩٩.٩٪</span>
                  <span>{developerName}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Control Buttons Panel */}
      <div className="w-full max-w-sm flex items-center justify-around bg-[#17212B] rounded-2xl border border-gray-800 p-5 mb-6 shadow-xl gap-4">
        {/* Mute button */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full transition-all cursor-pointer ${
            isMuted
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-[#0E1621] text-gray-300 hover:text-white"
          }`}
          title={isMuted ? "تفعيل الصوت" : "كتم الصوت"}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* Hang up call */}
        <button
          id="hangup-call-btn"
          onClick={onHangup}
          className="p-5 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-red-900 shadow-sm"
          title="إنهاء المكالمة"
        >
          <PhoneOff className="w-7 h-7" />
        </button>

        {/* Video toggle toggle */}
        <button
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`p-4 rounded-full transition-all cursor-pointer ${
            isVideoOff
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-[#0E1621] text-gray-300 hover:text-white"
          }`}
          title={isVideoOff ? "تشغيل الكاميرا" : "إيقاف الكاميرا"}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>
      </div>
    </motion.div>
  );
}
