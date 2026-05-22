import React, { useState } from "react";
import { motion } from "motion/react";
import { Bolt, Phone, ShieldCheck, Cpu, ArrowRightLeft } from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (phone: string, name: string) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError("يرجى إدخال رقم هاتف صحيح");
      return;
    }
    setError("");
    setLoading(true);

    // Simulate OTP sending
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 1200);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setError("الرجاء إدخال رمز التحقق المكون من 6 أرقام");
      return;
    }
    setError("");
    setLoading(true);

    // Simulate validation
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(phoneNumber, "أبو وطن");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0E1621] text-white flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans select-none">
      {/* Background Ambience decoration */}
      <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-[#2EA6DE] opacity-10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-80 h-80 bg-blue-600 opacity-5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-[#17212B] rounded-2xl border border-gray-800 p-8 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-[#2ea6de]/10 border border-[#2ea6de]/30 rounded-full flex items-center justify-center mb-4 relative">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <Cpu className="text-[#2ea6de] w-10 h-10" />
            </motion.div>
            <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1.5 border-2 border-[#17212B] text-white animate-pulse">
              <Bolt className="w-3.5 h-3.5" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-sans text-center mb-1 text-white">
            مطور ستوديو تيليجرام
          </h1>
          <p className="text-gray-400 text-sm font-sans text-center">
            بوابة المطورين والمحادثات الذكية المؤمنة
          </p>
        </div>

        {error && (
          <div className="bg-red-950/45 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-xs text-right mb-5 font-sans animate-bounce">
            {error}
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-400 text-xs text-right mb-2 font-sans">
                رقم الهاتف مع رمز الدولة
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="مثال: +964 770 123 4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-[#0E1621] border border-gray-800 rounded-xl px-4 py-3.5 pr-11 text-left text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2EA6DE] focus:border-transparent font-sans tracking-wide"
                  dir="ltr"
                />
                <div className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400">
                  <Phone className="w-5 h-5" />
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-right leading-relaxed font-sans">
              * سنرسل لك رمزاً آمناً فورياً للتحقق وتفعيل ربط منصة Google AI بجلسات التطوير الحالية.
            </p>

            <button
              id="login-btn-phone"
              type="submit"
              disabled={loading}
              className="w-full bg-[#2EA6DE] hover:bg-[#208aba] active:scale-[0.98] transition-all text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-sm font-sans"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>إرسال رمز التفعيل والربط</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span
                  onClick={() => setStep("phone")}
                  className="text-xs text-[#2EA6DE] hover:underline cursor-pointer flex items-center gap-1 dir-rtl"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  تعديل الرقم
                </span>
                <label className="block text-gray-400 text-xs text-right font-sans">
                  رمز التحقق المرسل لهاتفك
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="أدخل ٦ أرقام (مثال: 123456)"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-[#0E1621] border border-gray-800 rounded-xl px-4 py-3.5 pr-11 text-center text-white placeholder-gray-600 tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#2EA6DE] focus:border-transparent font-mono text-lg"
                  dir="ltr"
                />
                <div className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </div>

            <p className="text-xs text-amber-400 text-center font-sans">
              💡 للمحاكاة الفورية، أدخل أي رمز من ٦ أرقام للمتابعة
            </p>

            <button
              id="login-btn-otp"
              type="submit"
              disabled={loading}
              className="w-full bg-[#2EA6DE] hover:bg-[#208aba] active:scale-[0.98] transition-all text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-sm font-sans"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>طلب الدخول الآمن للجلسة</span>
              )}
            </button>
          </form>
        )}
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-6 text-gray-600 text-xs font-mono select-none">
        GOOGLE DEVELOPER STUDIO • TELEGRAM PROTOCOL • SECURED SESSION
      </div>
    </div>
  );
}
