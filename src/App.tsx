import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageCircle,
  Megaphone,
  User,
  Plus,
  Send,
  Phone,
  Video,
  Search,
  Sparkles,
  Cpu,
  Check,
  CheckCheck,
  FileCode,
  Trash2,
  Settings,
  Activity,
  LogOut,
  Globe,
  Lock,
  X,
  ChevronLeft,
  BookOpen,
  Info,
  Calendar,
  Layers,
  Heart,
  MessageSquare,
  BadgeAlert,
  Terminal,
  Play,
  Smartphone
} from "lucide-react";

import { Developer, Channel, UserProfile, Message, ChannelPost } from "./types";
import { INITIAL_DEVELOPERS, INITIAL_CHANNELS, INITIAL_USER } from "./data";
import LoginScreen from "./components/LoginScreen";
import CallScreen from "./components/CallScreen";
import VoiceRecorder, { AudioPlayerMessage } from "./components/VoiceRecorder";

export default function App() {
  // Authentication State
  const [userPhone, setUserPhone] = useState<string>(() => {
    const cached = localStorage.getItem("telegram_studio_user_phone");
    if (!cached || cached === "+964 770 123 4567") {
      localStorage.setItem("telegram_studio_user_phone", "+964 770 836 7890");
      return "+964 770 836 7890";
    }
    return cached;
  });
  const [userName, setUserName] = useState<string>(() => {
    const cached = localStorage.getItem("telegram_studio_user_name");
    if (!cached || cached === "Fahim Sadat") {
      localStorage.setItem("telegram_studio_user_name", "أبو وطن");
      return "أبو وطن";
    }
    return cached;
  });

  // Main UI Navigation
  const [activeTab, setActiveTab] = useState<"chats" | "channels" | "profile">("chats");
  const [showAndroidGuideModal, setShowAndroidGuideModal] = useState<boolean>(false);
  
  // Data States
  const [developers, setDevelopers] = useState<Developer[]>(INITIAL_DEVELOPERS);
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER);

  // Active Selections
  const [selectedDevId, setSelectedDevId] = useState<string | null>("dev-1");
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>("chan-1");
  const [openedPostId, setOpenedPostId] = useState<string | null>(null);

  // Search queries
  const [chatSearch, setChatSearch] = useState("");
  const [channelSearch, setChannelSearch] = useState("");

  // Chat input states
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState<string | null>(null); // Id of the dev currently typing

  // Dynamic Chat Histories
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({
    "dev-1": [
      { id: "m1", sender: "bot", text: "أهلاً بك! أنا المهندس سمير، خبير تصميم الواجهات وتجربة المستخدم. هل ترغب في مراجعة كفاءة تصاميمك البرمجية أو الاستعلام عن أحدث معايير التوافقية؟", time: "١٠:١٠ ص" },
      { id: "m2", sender: "me", text: "أهلاً سمير، أعمل حالياً على واجهة سحابية سريعة التجاوب لتطبيق المطورين.", time: "١٠:١٤ ص" },
      { id: "m3", sender: "bot", text: "رائع جداً! تم استلام ملفات المحاكاة بنجاح لمراجعة تباين الألوان البرمجية وأوقات التصيير.", time: "١٠:١٥ ص" }
    ],
    "dev-2": [
      { id: "m4", sender: "bot", text: "أهلاً يا زميلي! أنا رانيا مستشارة قواعد البيانات. كيف يمكنني تحسين استعلامات Firestore أو SQL الخاصة بمشروعك الآن؟", time: "٠٩:٤٠ ص" },
      { id: "m5", sender: "bot", text: "ألقيت نظرة على هيكلة الجداول السحابية وتبدو ممتازة ومثالية!", time: "٠٩:٤٥ ص" }
    ],
    "dev-3": [
      { id: "m6", sender: "bot", text: "مرحباً بك. المهندس طارق معك. قمت بمراجعة الشيفرة البرمجية واقترحت بعض التعديلات لرفع كفاءة الخوارزميات وتفادي التكرار.", time: "٠٨:٢٥ ص" },
      { id: "m7", sender: "bot", text: "تم تقليص حجم المكونات وتفادي تكرار التصيير غير المبرر لضمان تجاوبية قصوى.", time: "٠٨:٣٠ ص" }
    ],
    "dev-4": [
      { id: "m8", sender: "bot", text: "أهلاً بك في فضاء الذكاء الاصطناعي الخاص بـ Google! أنا ممثل نماذج Gemini 3.5. جاهز لكتابة المخططات، تفكيك الشفرات، أو بناء الموجهات المتينة. اسألني عن أي ميزة تقنية محددة سنقوم بها!", time: "١٢:٠٠ م" }
    ]
  });

  // Channel Comments Database Simulator
  const [channelComments, setChannelComments] = useState<Record<string, { id: string; author: string; text: string; time: string }[]>>({
    "p-1": [
      { id: "c1", author: "المهندس سمير", text: "خطوة مذهلة! سرعة الاستجابة لـ gemini-3.5-flash ستجعل محاكاة الأكواد فورية وخالية من التأخير بكثير.", time: "١٠:٣٥ ص" },
      { id: "c2", author: "فراس مطور أندرويد", text: "جربت صياغته بالأكواد وهو يعطي استجابات مرتبة وخالية من الهلوسات التقنية.", time: "١٠:٤٢ ص" }
    ],
    "p-2": [
      { id: "c3", author: "رانيا مستشارة قواعد البيانات", text: "تأمين الجلسات هو الخطوة الصخرية لضمان سلامة الكود من التعارض المتكرر.", time: "٠٥:٠٠ م" }
    ],
    "p-3": [
      { id: "c4", author: "إياد مخطط الهويات", text: "أعتقد أن دمج ألوان Slate مع لمسة Cyan يقلل من إجهاد شبكية العين بنسبة ٣٠٪.", time: "قبل ساعة" }
    ]
  });

  // Post Comment text input
  const [newCommentText, setNewCommentText] = useState("");

  // Calling overlay states
  const [activeCall, setActiveCall] = useState<{ developer: Developer; type: "صوتية" | "فيديو" } | null>(null);

  // Modals management
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [newChannelIcon, setNewChannelIcon] = useState("campaign");

  // API checking diagnostic
  const [apiConnectionStatus, setApiConnectionStatus] = useState<"unchecked" | "checking" | "connected" | "simulated">("unchecked");
  const [apiLogs, setApiLogs] = useState<string[]>([]);

  // Mobile navigation helper: active pane
  // "list" shows sidebar panel list, "detail" shows full-screen detail chat room / comments pane under mobile mode
  const [mobilePane, setMobilePane] = useState<"list" | "detail">("list");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroller for active message histories
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistories, selectedDevId, isTyping]);

  // Sync session authentication to localstorage
  const handleLoginSuccess = (phone: string, name: string) => {
    setUserPhone(phone);
    setUserName(name);
    localStorage.setItem("telegram_studio_user_phone", phone);
    localStorage.setItem("telegram_studio_user_name", name);
    
    // Quick starter info log
    const welcomeMsg: Message = {
      id: "welcome-system",
      sender: "info",
      text: "🔒 تشفير فوري آمن نشط للجلسة الحالية بموجب بروتوكول Google Developer Studio.",
      time: "الآن"
    };

    // Update first dev conversation with system info
    setChatHistories(prev => ({
      ...prev,
      "dev-1": prev["dev-1"] ? [welcomeMsg, ...prev["dev-1"]] : [welcomeMsg]
    }));
  };

  const handleLogout = () => {
    setUserPhone("+964 770 836 7890");
    setUserName("أبو وطن");
    localStorage.setItem("telegram_studio_user_phone", "+964 770 836 7890");
    localStorage.setItem("telegram_studio_user_name", "أبو وطن");
    alert("تم إعادة تعيين بيانات الجلسة الافتراضية بنجاح!");
  };

  // Google API Key connectivity diagnostics test
  const testApiDiagnostics = async () => {
    setApiConnectionStatus("checking");
    setApiLogs(["[SYSTEM] جاري فحص تكوين نظام الخدمة السحابية...", "[SYSTEM] إرسال طلب ترحيبي ترحيلي لـ /api/chat..."]);
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ sender: "me", text: "اختبار" }],
          developerRole: "فاحص آلي",
          developerName: "نظام الفحص"
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.text && data.text.includes("[وضع المحاكاة النشط]")) {
          setApiConnectionStatus("simulated");
          setApiLogs(prev => [
            ...prev,
            "⚠️ [تنبيه] يعمل الخادم في وضع المحاكاة الذكية المدمجة.",
            "💡 نصيحة: لم يتوفر مفتاح GEMINI_API_KEY حقيقي في Secrets، الردود تعمل بخوارزمية المحاكاة العربية الترحيبية الدقيقة.",
            "[تم التوصيل] منصة المحاكاة جاهزة بنسبة ١٠٠٪."
          ]);
        } else {
          setApiConnectionStatus("connected");
          setApiLogs(prev => [
            ...prev,
            "✅ [نجاح] تم التأكد من ربط مفتاح الـ API الحقيقي بمستودع Google AI الرئيسي!",
            `💬 رد الخادم الفعلي: "${data.text.slice(0, 60)}..."`,
            "[متصل بالكامل] الاتصال السحابي الحقيقي نشط بنجاح."
          ]);
        }
      } else {
        throw new Error(data.error || "خطأ مجهول في تصاريح الخادم");
      }
    } catch (err: any) {
      setApiConnectionStatus("simulated");
      setApiLogs(prev => [
        ...prev,
        `❌ فشل الاتصال المباشر بالخادم السحابي: ${err.message || err}`,
        "🔄 تم تفعيل وضع التجاوب المحلي الذكي لضمان استمرارية تجربة المحادثات بسلاسة تامة."
      ]);
    }
  };

  // Chat message submit handler
  const handleSendMessage = async (textToSend?: string, isAudio = false, audioDuration?: string) => {
    const textMsg = textToSend || messageText;
    if (!textMsg.trim() && !isAudio) return;
    if (!selectedDevId) return;

    const currentDev = developers.find(d => d.id === selectedDevId);
    if (!currentDev) return;

    // Create message object
    const newMsgId = `m-${Date.now()}`;
    const timeNow = new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
    
    const userMessage: Message = {
      id: newMsgId,
      sender: "me",
      text: isAudio ? "🎤 رسالة صوتية مرسلة" : textMsg,
      time: timeNow,
      isAudio,
      audioDuration
    };

    // Update histories state
    const currentHistory = chatHistories[selectedDevId] || [];
    const updatedHistory = [...currentHistory, userMessage];
    
    setChatHistories(prev => ({
      ...prev,
      [selectedDevId]: updatedHistory
    }));

    if (!isAudio) {
      setMessageText("");
    }

    // Set dynamic typing indicator
    setIsTyping(selectedDevId);

    // Update developer's last message and active time in list preview
    setDevelopers(prev => prev.map(dev => {
      if (dev.id === selectedDevId) {
        return {
          ...dev,
          lastMessage: isAudio ? `🎤 رسالة صوتية (${audioDuration})` : (textMsg.length > 40 ? textMsg.substring(0, 40) + "..." : textMsg),
          lastActive: "الآن"
        };
      }
      return dev;
    }));

    // Trigger backend Gemini API response
    try {
      // Map existing local history to format expected by API
      const apiMessages = updatedHistory.slice(-6).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          developerRole: currentDev.role,
          developerName: currentDev.name
        })
      });

      if (!response.ok) {
        throw new Error("API call returned negative status");
      }

      const data = await response.json();
      
      // Append bot response
      const botMessage: Message = {
        id: `m-bot-${Date.now()}`,
        sender: "bot",
        text: data.text,
        time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
      };

      setChatHistories(prev => ({
        ...prev,
        [selectedDevId]: [...(prev[selectedDevId] || []), botMessage]
      }));

      // Update developer's last message item status
      setDevelopers(prev => prev.map(dev => {
        if (dev.id === selectedDevId) {
          return {
            ...dev,
            lastMessage: data.text.length > 45 ? data.text.substring(0, 45) + "..." : data.text,
            lastActive: "الآن"
          };
        }
        return dev;
      }));

    } catch (error) {
      console.error("Failed to query developer bot:", error);
      
      // Fallback simulated bot replies to never keep user hanging
      setTimeout(() => {
        const fallbacks: Record<string, string> = {
          "dev-1": "أهلاً بك! لقد استلمت فكرتك حول الواجهة، من الأفضل استخدام فئات Flexbox المتناسقة مع `gap-4` لتحقيق تدفق ناعم ومريح للمبرمج ليلاً.",
          "dev-2": "هيكلة رائعة وصحيحة لقاعدة البيانات! أوصيك بعمل فهرس مركب للمستندات السحابية ذات الاستعلامات المتعددة لتفادي بطء التصدير.",
          "dev-3": "لقد راجعت مصفوفة أداء الذاكرة المتطايرة، تبدو جيدة جداً. تأكد من تفعيل الكاش المؤقت لتقليل حمولة الاتصالات المباشرة.",
          "dev-4": "مرحباً! أنا جاهز تماماً لصياغة كود استثنائي. تأكد من إعداد مفتاح API الخاص بك لتوليف الردود المباشرة من غوغل بشكل تام.",
          "dev-5": "الأمان يبدو مستقراً. لقد قمت بتحديث فوارز التشهير لتكون الجلسة الحالية آمنة مائة بالمائة.",
          "dev-6": "أنهيت تشغيل الفحوصات الوحدوية، كل المسارات البرمجية في وضع أخضر مثالي وخالٍ تماماً من الحلقات اللا نهائية.",
          "dev-7": "تم توليف حزمة خطوط رائعة تتوافق تماماً مع الواجهات الهندسية التقنية المعروضة.",
          "dev-8": "الجدول الزمني يسير على قدم وساق. أنت تقوم بعمل رائع اليوم!"
        };

        const BotReply = fallbacks[selectedDevId] || `أهلاً بك، أنا متصل الآن وجاهز لمساعدتك بكامل الستوديو المطور!`;
        
        const botMessage: Message = {
          id: `m-bot-fallback-${Date.now()}`,
          sender: "bot",
          text: `📍 [وضع الاستجابة الذاتية للمحاكاة]: ${BotReply}`,
          time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
        };

        setChatHistories(prev => ({
          ...prev,
          [selectedDevId]: [...(prev[selectedDevId] || []), botMessage]
        }));
      }, 1000);
    } finally {
      setIsTyping(null);
    }
  };

  // Helper inside active conversation to send simulated system events (like call logs)
  const addSystemLogMessage = (devId: string, logText: string) => {
    const systemLog: Message = {
      id: `sys-${Date.now()}`,
      sender: "info",
      text: logText,
      time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
    };
    setChatHistories(prev => ({
      ...prev,
      [devId]: [...(prev[devId] || []), systemLog]
    }));
  };

  // Create Channel Action
  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    const newChan: Channel = {
      id: `chan-${Date.now()}`,
      name: newChannelName,
      description: newChannelDesc || "لا يوجد وصف لهذه القناة بعد.",
      subscribersCount: 1, // The creator is the first
      icon: newChannelIcon,
      posts: [
        {
          id: `p-new-${Date.now()}`,
          author: userName,
          text: `📢 مرحباً بكم في قناتنا الجديدة لتبادل الخبرات وتطوير البرمجيات! يسعدنا بدء هذا المجتمع معاً.`,
          time: "الآن",
          likes: 0,
          comments: 0
        }
      ]
    };

    setChannels(prev => [newChan, ...prev]);
    setSelectedChannelId(newChan.id);
    setNewChannelName("");
    setNewChannelDesc("");
    setShowCreateChannelModal(false);
  };

  // Like Channel Post Activity
  const handleLikePost = (channelId: string, postId: string) => {
    setChannels(prev => prev.map(chan => {
      if (chan.id === channelId) {
        return {
          ...chan,
          posts: chan.posts.map(post => {
            if (post.id === postId) {
              return { ...post, likes: post.likes + 1 };
            }
            return post;
          })
        };
      }
      return chan;
    }));
  };

  // Submits a comment inside a post
  const handleAddComment = (postId: string) => {
    if (!newCommentText.trim()) return;

    const commentObj = {
      id: `comment-${Date.now()}`,
      author: userName,
      text: newCommentText,
      time: "الآن"
    };

    setChannelComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), commentObj]
    }));

    // Update comment counter in post
    setChannels(prev => prev.map(chan => {
      if (chan.id === selectedChannelId) {
        return {
          ...chan,
          posts: chan.posts.map(post => {
            if (post.id === postId) {
              return { ...post, comments: post.comments + 1 };
            }
            return post;
          })
        };
      }
      return chan;
    }));

    setNewCommentText("");
  };

  // Filters developers based on search query
  const filteredDevs = developers.filter(d => 
    d.name.toLowerCase().includes(chatSearch.toLowerCase()) || 
    d.role.toLowerCase().includes(chatSearch.toLowerCase())
  );

  // Filters channels based on search query
  const filteredChannels = channels.filter(c => 
    c.name.toLowerCase().includes(channelSearch.toLowerCase()) || 
    c.description.toLowerCase().includes(channelSearch.toLowerCase())
  );

  const activeChannel = channels.find(c => c.id === selectedChannelId);
  const activeDev = developers.find(d => d.id === selectedDevId);

  return (
    <div className="min-h-screen bg-[#0E1621] text-white flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* Dynamic Voice Call Overlay */}
      <AnimatePresence>
        {activeCall && (
          <CallScreen
            developerName={activeCall.developer.name}
            callType={activeCall.type}
            onHangup={() => {
              addSystemLogMessage(
                activeCall.developer.id,
                `📞 تمت مكالمة ${activeCall.type} آمنة ومغلقة وتأكيد صحية الجلسة المتبادلة.`
              );
              setActiveCall(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="flex flex-1 h-screen overflow-hidden">
        
        {/* Desktop Left Nav / Controls Panel */}
        <aside className="hidden md:flex flex-col w-20 bg-[#17212B] border-l border-gray-800 items-center py-6 justify-between relative z-20">
          <div className="flex flex-col items-center gap-7">
            {/* Soft Branding Logo */}
            <div className="w-12 h-12 bg-[#2EA6DE]/15 rounded-xl flex items-center justify-center border border-[#2ea6de]/40 text-[#2EA6DE] select-none" title="Google Studio Telegram">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>

            {/* Nav icons */}
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => { setActiveTab("chats"); setMobilePane("list"); }}
                className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                  activeTab === "chats"
                    ? "bg-[#2EA6DE] text-white shadow-lg shadow-sky-950/40"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/40"
                }`}
                title="الدردشات النشطة"
              >
                <MessageCircle className="w-5.5 h-5.5" />
                <span className="text-[9px] mt-1 font-sans">الدردشات</span>
              </button>

              <button
                onClick={() => { setActiveTab("channels"); setMobilePane("list"); }}
                className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                  activeTab === "channels"
                    ? "bg-[#2EA6DE] text-white shadow-lg shadow-sky-950/40"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/40"
                }`}
                title="القنوات البرمجية"
              >
                <Megaphone className="w-5.5 h-5.5" />
                <span className="text-[9px] mt-1 font-sans">القنوات</span>
              </button>

              <button
                onClick={() => { setActiveTab("profile"); setMobilePane("list"); }}
                className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                  activeTab === "profile"
                    ? "bg-[#2EA6DE] text-white shadow-lg shadow-sky-950/40"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/40"
                }`}
                title="الملف الشخصي"
              >
                <User className="w-5.5 h-5.5" />
                <span className="text-[9px] mt-1 font-sans">الملف</span>
              </button>
            </nav>
          </div>

          {/* Quick Exit/Settings */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-700/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400" title="تشفير مفعل">
              <Lock className="w-4 h-4" />
            </div>

            <button
              onClick={handleLogout}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-950/20 cursor-pointer transition-all"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5.5 h-5.5" />
            </button>
          </div>
        </aside>

        {/* Master Column (Lists & Chats Area) */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

          {/* List Sidebar Area (Responsive width & hide/show patterns) */}
          <section className={`w-full md:w-[350px] shrink-0 bg-[#0E1621] md:bg-[#17212B]/95 md:border-l border-gray-800 flex flex-col h-full ${
            mobilePane === "detail" ? "hidden md:flex" : "flex"
          }`}>
            <div className="p-4 border-b border-gray-800/60 bg-[#17212B] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <h2 className="text-lg font-bold font-sans tracking-wide">
                  {activeTab === "chats" && "محادثات المطورين"}
                  {activeTab === "channels" && "بث القنوات"}
                  {activeTab === "profile" && "إعدادات الهوية"}
                </h2>
              </div>
              
              {/* Mobile Quick Tab Navigation inside top navbar for seamless navigation without big sidebar layout */}
              <div className="md:hidden flex items-center bg-[#0E1621] p-1 rounded-xl border border-gray-800 gap-1">
                <button
                  onClick={() => setActiveTab("chats")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all ${activeTab === 'chats' ? 'bg-[#2EA6DE] text-white' : 'text-gray-400'}`}
                >
                  الدردشات
                </button>
                <button
                  onClick={() => setActiveTab("channels")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all ${activeTab === 'channels' ? 'bg-[#2EA6DE] text-white' : 'text-gray-400'}`}
                >
                  القنوات
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all ${activeTab === 'profile' ? 'bg-[#2EA6DE] text-white' : 'text-gray-400'}`}
                >
                  بروفايل
                </button>
              </div>
            </div>

            {/* TAB CONTENT: CHATS */}
            {activeTab === "chats" && (
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Search query box */}
                <div className="p-3 bg-[#17212B]/90 border-b border-gray-800/40">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="ابحث عن مطور أو تخصص..."
                      value={chatSearch}
                      onChange={(e) => setChatSearch(e.target.value)}
                      className="w-full bg-[#0E1621] text-xs font-sans rounded-xl py-2 px-3 pr-9 border border-gray-800 focus:outline-none focus:ring-1 focus:ring-[#2EA6DE] text-right"
                      dir="rtl"
                    />
                    <Search className="w-4 h-4 text-gray-500 absolute top-1/2 right-3 -translate-y-1/2" />
                  </div>
                </div>

                {/* Developers list */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-800/30 scrollbar-thin">
                  {filteredDevs.length > 0 ? (
                    filteredDevs.map(dev => {
                      const isActive = selectedDevId === dev.id;
                      const initials = dev.name.split(" ").slice(1, 3).map(n => n[0]).join("") || dev.name[0];
                      return (
                        <div
                          key={dev.id}
                          onClick={() => {
                            setSelectedDevId(dev.id);
                            setMobilePane("detail");
                          }}
                          className={`p-4 flex gap-3 cursor-pointer transition-all border-r-4 ${
                            isActive
                              ? "bg-[#2EA6DE]/10 border-[#2EA6DE] text-white"
                              : "border-transparent hover:bg-gray-800/20 text-gray-300 hover:text-white"
                          }`}
                        >
                          {/* Avatar with dynamic initials background */}
                          <div className={`w-11 h-11 shrink-0 rounded-full ${dev.avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-md relative`}>
                            {initials}
                            {dev.status === "متصل الآن" && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#17212B] rounded-full" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between text-right">
                            <div className="flex justify-between items-baseline gap-1">
                              <span className="text-[10px] text-gray-500 font-mono shrink-0">{dev.lastActive}</span>
                              <h4 className="font-bold text-sm font-sans truncate">{dev.name}</h4>
                            </div>
                            <p className="text-xs text-gray-400 font-sans truncate mt-0.5">{dev.role}</p>
                            <p className="text-[11px] text-gray-500 font-sans truncate italic mt-1 bg-[#0E1621]/45 px-2 py-0.5 rounded border border-gray-800/10">
                              {dev.id === isTyping ? (
                                <span className="text-green-400 font-medium animate-pulse flex items-center gap-1 justify-end">
                                  <span>...يكتب الآن</span>
                                  <Sparkles className="w-3 h-3" />
                                </span>
                              ) : (
                                dev.lastMessage
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-gray-500 text-xs font-sans">
                      لا يوجد أي مطور يطابق هذا البحث
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: CHANNELS */}
            {activeTab === "channels" && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="p-3 bg-[#17212B]/90 border-b border-gray-800/40">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="ابحث عن مجتمعات أو قنوات بث..."
                      value={channelSearch}
                      onChange={(e) => setChannelSearch(e.target.value)}
                      className="w-full bg-[#0E1621] text-xs font-sans rounded-xl py-2 px-3 pr-9 border border-gray-800 focus:outline-none focus:ring-1 focus:ring-[#2EA6DE] text-right"
                      dir="rtl"
                    />
                    <Search className="w-4 h-4 text-gray-500 absolute top-1/2 right-3 -translate-y-1/2" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-gray-800/30">
                  {filteredChannels.map(chan => {
                    const isActive = selectedChannelId === chan.id;
                    return (
                      <div
                        key={chan.id}
                        onClick={() => {
                          setSelectedChannelId(chan.id);
                          setOpenedPostId(null);
                          setMobilePane("detail");
                        }}
                        className={`p-4 flex gap-3 cursor-pointer transition-all border-r-4 ${
                          isActive
                            ? "bg-[#2EA6DE]/10 border-[#2EA6DE] text-white"
                            : "border-transparent hover:bg-gray-800/20 text-gray-300 hover:text-white"
                        }`}
                      >
                        <div className="w-11 h-11 shrink-0 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {chan.icon === "campaign" ? <Megaphone className="w-5.5 h-5.5" /> : <Layers className="w-5.5 h-5.5" />}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center text-right">
                          <div className="flex justify-between items-baseline gap-1">
                            <span className="text-[10px] text-gray-500 font-mono">{(chan.subscribersCount / 1000).toFixed(1)}K مشترك</span>
                            <h4 className="font-bold text-sm font-sans truncate">{chan.name}</h4>
                          </div>
                          <p className="text-xs text-gray-400 truncate mt-1">{chan.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Floating Create Channel Button */}
                <div className="p-4 bg-[#17212B] border-t border-gray-800/60">
                  <button
                    onClick={() => setShowCreateChannelModal(true)}
                    className="w-full bg-[#2EA6DE] hover:bg-[#208aba] cursor-pointer text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-sans font-medium transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إنشاء قناة بث برمجية جديدة</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PROFILE DETAILS PREVIEW */}
            {activeTab === "profile" && (
              <div className="flex flex-col flex-1 overflow-y-auto p-4 space-y-5">
                <div className="bg-[#1C2936] rounded-2xl p-5 border border-gray-800 text-center relative overflow-hidden">
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500/15 border border-green-500/30 rounded-full px-2 py-0.5 text-[9px] text-green-400">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span>نشط</span>
                  </div>
                  
                  <div className="w-20 h-20 bg-[#2EA6DE] mx-auto rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-lg mb-3">
                    {userProfile.name[0] || "F"}
                  </div>
                  
                  <h3 className="font-bold text-base">{userProfile.name}</h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5" dir="ltr">@{userProfile.username}</p>
                  
                  <p className="text-[11px] text-gray-400 mt-3 border-t border-gray-800/60 pt-3 text-right font-sans leading-relaxed">
                    {userProfile.bio}
                  </p>
                </div>

                {/* API Key Status Center widget */}
                <div className="bg-[#111C27] border border-blue-900/35 rounded-2xl p-5 space-y-3.5">
                  <div className="flex justify-between items-center border-b border-gray-800/60 pb-2">
                    <div className="flex gap-1.5 items-center text-cyan-400 text-xs font-sans hover:underline cursor-pointer" onClick={testApiDiagnostics}>
                      <Activity className="w-4 h-4 text-cyan-500" />
                      <span>فحص الاتصال</span>
                    </div>
                    <span className="text-xs font-bold font-sans text-right">منصة Google API</span>
                  </div>

                  <p className="text-[11px] text-gray-400 text-right leading-relaxed font-sans">
                    يمكن للمشروع استدعاء ذكاء <strong>gemini-3.5-flash</strong> الفعلي بمجرد تفعيل مفتاح الـ API.
                  </p>

                  <div className="flex justify-between items-center bg-[#17212B] rounded-xl p-3 border border-gray-800/40">
                    {apiConnectionStatus === "connected" && (
                      <span className="bg-green-500/10 text-green-400 text-[10px] px-2 py-1 rounded-md border border-green-500/30">
                        متصل بالـ API الحقيقي
                      </span>
                    )}
                    {apiConnectionStatus === "simulated" && (
                      <span className="bg-amber-500/10 text-amber-400 text-[10px] px-2 py-1 rounded-md border border-amber-500/30">
                        وضع محاكاة محلي
                      </span>
                    )}
                    {apiConnectionStatus === "checking" && (
                      <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-1 rounded-md border border-blue-500/30 animate-pulse">
                        جاري الفحص السحابي...
                      </span>
                    )}
                    {apiConnectionStatus === "unchecked" && (
                      <span className="text-gray-500 text-[10px]">لم يتم الفحص بعد</span>
                    )}
                    <span className="text-xs text-gray-500 font-sans">حالة الجلسة</span>
                  </div>

                  {apiLogs.length > 0 && (
                    <div className="bg-[#050C14] rounded-xl p-3 border border-gray-900 font-mono text-[9px] text-green-500 space-y-1 overflow-x-auto text-left" dir="ltr">
                      {apiLogs.map((log, idx) => (
                        <div key={idx} className="truncate">{log}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border border-gray-800 rounded-xl divide-y divide-gray-800 bg-[#17212B]">
                  <div className="p-3 text-right text-xs text-gray-400 font-sans">
                    سجل البريد الإلكتروني:<br /> <span className="font-mono text-white text-xs select-text">{userProfile.email}</span>
                  </div>
                  <div className="p-3 text-right text-xs text-gray-400 font-sans">
                    رقم الهاتف الفعال:<br /> <span className="font-mono text-white text-xs select-text">{userProfile.phone}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowAndroidGuideModal(true)}
                  className="w-full bg-[#2EA6DE]/15 hover:bg-[#2EA6DE]/25 border border-[#2EA6DE]/40 text-[#2EA6DE] py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs font-bold transition-all mt-3 font-sans"
                >
                  <Smartphone className="w-4.5 h-4.5" />
                  <span>تصدير التطبيق إلى Android 📱</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full bg-red-950/20 hover:bg-red-950/45 border border-red-900/40 text-red-300 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs transition-all mt-2 font-sans"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل خروج السحب الآمن</span>
                </button>
              </div>
            )}
            
            {/* Quick footer containing info */}
            <div className="p-3 text-center text-[9px] text-gray-600 font-mono border-t border-gray-800/40 bg-[#121B25]">
              TELEG_STUDIO • VER_1.1.2 • AI_READY
            </div>
          </section>

          {/* ACTIVE WORKSPACE ZONE (Message Area or Channels Area details) */}
          <section className={`flex-1 flex flex-col h-full bg-[#0E1621] relative overflow-hidden ${
            mobilePane === "detail" ? "flex" : "hidden md:flex"
          }`}>
            
            {/* DECORATIVE BACKGROUND */}
            <div className="absolute top-[30%] left-[25%] w-96 h-96 bg-[#2ea6de]/5 blur-[160px] rounded-full pointer-events-none" />

            {/* LAYOUT DETAILS FOR ACTIVE TAB: "CHATS" */}
            {activeTab === "chats" && (
              activeDev ? (
                <div className="flex flex-col flex-1 h-full overflow-hidden relative z-10">
                  
                  {/* Active Chat Top Header */}
                  <div className="p-4 bg-[#17212B] border-b border-gray-800/80 flex items-center justify-between shadow-md">
                    
                    {/* Actions panel */}
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => setActiveCall({ developer: activeDev, type: "صوتية" })}
                        className="p-2.5 rounded-full hover:bg-green-500/10 border border-green-500/20 text-green-400 cursor-pointer transition-all hover:scale-105"
                        title="بدء مكالمة مشفرة صوتية"
                      >
                        <Phone className="w-4.5 h-4.5" />
                      </button>

                      <button
                        onClick={() => setActiveCall({ developer: activeDev, type: "فيديو" })}
                        className="p-2.5 rounded-full hover:bg-blue-500/10 border border-blue-500/20 text-blue-400 cursor-pointer transition-all hover:scale-105"
                        title="بدء تواصل مرئي مشفر"
                      >
                        <Video className="w-4.5 h-4.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`هل ترغب فعلاً بمسح سجل المحادثات مع ${activeDev.name}؟`)) {
                            setChatHistories(prev => ({ ...prev, [activeDev.id]: [] }));
                          }
                        }}
                        className="p-2.5 rounded-full hover:bg-red-500/10 border border-red-500/20 text-red-400 cursor-pointer transition-all hover:scale-105"
                        title="تدمير السجل البرمجي"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    {/* Developer Metadata */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-sm tracking-wide font-sans">{activeDev.name}</div>
                        <div className="text-[10px] text-green-400 mt-0.5 font-sans">
                          {activeDev.id === isTyping ? "يكتب رسالة جديدة بذكاء..." : activeDev.status}
                        </div>
                      </div>

                      <div className={`w-11 h-11 rounded-full ${activeDev.avatarColor} flex items-center justify-center text-white text-xs font-bold shadow`}>
                        {activeDev.name.split(" ").slice(1, 3).map(n => n[0]).join("") || activeDev.name[0]}
                      </div>

                      {/* Mobile Exit button */}
                      <button
                        onClick={() => setMobilePane("list")}
                        className="p-2 mr-1 rounded-xl bg-gray-800/50 hover:bg-gray-800 text-gray-300 md:hidden flex items-center justify-center cursor-pointer"
                        title="الرجوع للقائمة"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Specialty alert banner */}
                  <div className="p-3.5 bg-[#17212B]/90 border-b border-gray-800/40 text-xs text-gray-400 flex justify-between items-center gap-3 font-sans">
                    <span className="bg-blue-950 text-blue-300 border border-blue-900/40 px-3 py-1 rounded-full shrink-0 font-sans tracking-wide">
                      تخصص المطور المساعد
                    </span>
                    <p className="text-right select-all">{activeDev.roleDescription}</p>
                  </div>

                  {/* Messaging Panel Messages Feed */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin">
                    
                    {/* Encryption Header indicator */}
                    <div className="mx-auto max-w-sm bg-[#111C27] border border-green-500/10 rounded-2xl p-4 text-center text-xs space-y-2 mb-6">
                      <div className="flex justify-center text-green-500 mb-1">
                        <Lock className="w-4 h-4 fill-current animate-pulse" />
                      </div>
                      <div className="font-bold text-gray-200">التشفير الثنائي المتبادل مفعل</div>
                      <p className="text-gray-500 text-[10px] leading-relaxed">
                        كل الرسائل والمقاطع الصوتية مشفرة ببروتوكول Telegram المطور ولا تقبل القراءة من أي عارض خارجي.
                      </p>
                    </div>

                    {(chatHistories[activeDev.id] || []).length > 0 ? (
                      (chatHistories[activeDev.id] || []).map((msg) => {
                        const isMe = msg.sender === "me";
                        const isSystem = msg.sender === "info";

                        if (isSystem) {
                          return (
                            <div key={msg.id} className="flex justify-center">
                              <div className="bg-[#111C27] border border-[#1C2C3E] rounded-xl px-4 py-2 text-center text-xs text-gray-400 max-w-md my-1 font-sans shadow-sm">
                                {msg.text}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2.5 my-2`}
                          >
                            {!isMe && (
                              <div className={`w-8 h-8 rounded-full ${activeDev.avatarColor} text-[10px] flex items-center justify-center font-bold text-white shadow-inner mb-1`}>
                                {activeDev.name[0]}
                              </div>
                            )}

                            <div className="flex flex-col max-w-[80%] md:max-w-[70%] space-y-1">
                              {/* Bubble */}
                              <div
                                style={{ direction: "rtl" }}
                                className={`p-3.5 rounded-2xl text-sm leading-relaxed text-right break-words font-sans relative group selection:bg-sky-500 ${
                                  isMe
                                    ? "bg-[#2B5278] text-white rounded-br-none border-l border-sky-800/30 shadow-md"
                                    : "bg-[#182533] text-gray-100 rounded-bl-none border-r border-[#2B3C4F]/30 shadow-md"
                                }`}
                              >
                                {msg.isAudio ? (
                                  <AudioPlayerMessage
                                    audioUrl={msg.text === "🎤 رسالة صوتية مرسلة" ? "simulated_vocal" : msg.text}
                                    duration={msg.audioDuration || "0:05"}
                                  />
                                ) : (
                                  <div className="whitespace-pre-line text-sm antialiased select-text">
                                    {/* Render markdown format if it includes code tags */}
                                    {msg.text.includes("```") ? (
                                      <div className="space-y-2 mt-1 font-mono text-xs">
                                        {msg.text.split("```").map((chunk, i) => {
                                          if (i % 2 === 1) {
                                            // Extract actual code or language label
                                            const lines = chunk.trim().split("\n");
                                            const lang = lines[0].length < 10 ? lines[0] : "";
                                            const codeContent = lang ? lines.slice(1).join("\n") : chunk;
                                            return (
                                              <div key={i} className="bg-black/40 text-rose-300 p-3 rounded-lg border border-gray-800 my-2 overflow-x-auto text-left" dir="ltr">
                                                {lang && <div className="text-[9px] text-gray-500 uppercase font-sans mb-1">{lang}</div>}
                                                <code className="block select-all whitespace-pre font-mono">{codeContent}</code>
                                              </div>
                                            );
                                          }
                                          return <span key={i} className="font-sans select-text">{chunk}</span>;
                                        })}
                                      </div>
                                    ) : (
                                      msg.text
                                    )}
                                  </div>
                                )}

                                {/* Bottom Time Indicator inside bubble */}
                                <div className="flex items-center justify-end gap-1 mt-1.5 text-[9px] text-gray-400 font-mono">
                                  <span>{msg.time}</span>
                                  {isMe && (
                                    <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-44 flex flex-col items-center justify-center text-gray-500 gap-2 font-sans">
                        <Terminal className="w-10 h-10 text-gray-600 mb-1" />
                        <span>سجل المحادثات فارغ للتو.</span>
                        <p className="text-[11px] text-gray-600">اكتب استفسارك البرمجي بالأسفل لبدء فحص الردود الفورية.</p>
                      </div>
                    )}

                    {/* Dynamic typing indicator box inside feed */}
                    {isTyping === activeDev.id && (
                      <div className="flex justify-start items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${activeDev.avatarColor} text-[10px] flex items-center justify-center font-bold text-white animate-pulse`}>
                          {activeDev.name[0]}
                        </div>
                        <div className="bg-[#182533] text-gray-300 rounded-2xl rounded-bl-none px-4 py-3 text-xs flex items-center gap-1.5 shadow border-r border-[#2B3C4F]/30">
                          <span className="w-1.5 h-1.5 bg-[#2EA6DE] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 bg-[#2EA6DE] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 bg-[#2EA6DE] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          <span className="mr-1 text-gray-500 font-sans">{activeDev.name} يكتب الآن...</span>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input controls box */}
                  <div className="p-3 bg-[#17212B] border-t border-gray-800/80 flex flex-col md:flex-row gap-3 items-center">
                    
                    {/* Voice recording system integration */}
                    <div className="shrink-0 flex items-center">
                      <VoiceRecorder
                        isRecordingActive={false}
                        setIsRecordingActive={() => {}}
                        onAudioReady={(audioUrl, durationSec) => {
                          const min = Math.floor(durationSec / 60);
                          const sec = durationSec % 60;
                          const formattedDuration = `${min}:${sec.toString().padStart(2, "0")}`;
                          handleSendMessage(audioUrl, true, formattedDuration);
                        }}
                      />
                    </div>

                    {/* Standard text input field */}
                    <div className="flex-1 w-full relative flex items-center bg-[#0E1621] rounded-xl border border-gray-800/70 p-1">
                      <input
                        type="text"
                        placeholder="اكتب رسالتك الآمنة أو اسحب الكود البرمجي هنا..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendMessage();
                        }}
                        className="flex-1 bg-transparent py-2.5 px-4 focus:outline-none text-right text-xs md:text-sm text-white"
                        dir="rtl"
                      />
                      
                      <button
                        id="submit-message-btn"
                        onClick={() => handleSendMessage()}
                        className="p-2.5 rounded-lg bg-[#2EA6DE] hover:bg-sky-500 hover:scale-105 active:scale-95 text-white transition-all cursor-pointer ml-1"
                        title="إرسال"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500 gap-4 font-sans relative z-10">
                  <div className="w-20 h-20 rounded-full bg-[#17212B]/90 border border-[#2EA6DE]/30 flex items-center justify-center">
                    <MessageCircle className="w-10 h-10 text-[#2EA6DE] animate-bounce" />
                  </div>
                  <h3 className="font-bold text-lg text-white">ابدأ تشفير جلسة مطور</h3>
                  <p className="max-w-md text-xs leading-relaxed text-gray-400">
                    الرجاء تحديد أحد كبار المهندسين المساعدين من القائمة الجانبية لبدء المحادثة ومحاكاة الحلول البرمجية الفردية بالذكاء الاصطناعي.
                  </p>
                </div>
              )
            )}

            {/* LAYOUT DETAILS FOR ACTIVE TAB: "CHANNELS" */}
            {activeTab === "channels" && (
              activeChannel ? (
                <div className="flex flex-1 flex-col h-full overflow-hidden relative z-10">
                  {/* Channels Top Header */}
                  <div className="p-4 bg-[#17212B] border-b border-gray-800/80 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-[#111C27] text-gray-400 rounded-full px-3 py-1 text-xs font-sans">
                        {(activeChannel.subscribersCount).toLocaleString("ar-EG")} مشترك
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <h3 className="font-bold text-sm tracking-wide font-sans">{activeChannel.name}</h3>
                        <p className="text-[10px] text-gray-400 truncate max-w-xs">{activeChannel.description}</p>
                      </div>
                      <div className="w-11 h-11 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white">
                        {activeChannel.icon === "campaign" ? <Megaphone className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                      </div>

                      {/* Mobile Exit button */}
                      <button
                        onClick={() => setMobilePane("list")}
                        className="p-2 mr-1 rounded-xl bg-gray-800/50 hover:bg-gray-800 text-gray-300 md:hidden flex items-center justify-center cursor-pointer"
                        title="الرجوع للقائمة"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin">
                    {/* Loop Posts */}
                    {activeChannel.posts.map((post) => {
                      const commentsList = channelComments[post.id] || [];
                      const isCommentsOpen = openedPostId === post.id;

                      return (
                        <div key={post.id} className="bg-[#17212B] rounded-2xl border border-gray-800 shadow-xl overflow-hidden relative">
                          <div className="p-5 space-y-3">
                            <div className="flex justify-between items-center border-b border-gray-800/60 pb-2.5">
                              <span className="text-[10px] text-gray-500 font-mono">{post.time}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold font-sans text-amber-400">{post.author}</span>
                               <span className="bg-amber-600/15 text-amber-400 text-[9px] px-2 py-0.5 rounded border border-amber-500/20">ناشر</span>
                              </div>
                            </div>

                            {/* Broadcast Content Body */}
                            <p className="text-sm font-sans leading-relaxed text-right text-gray-200 select-text whitespace-pre-line">
                              {post.text}
                            </p>

                            {/* Engagement Control Panel */}
                            <div className="flex justify-between items-center border-t border-gray-800/50 pt-3">
                              
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => handleLikePost(activeChannel.id, post.id)}
                                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-all font-sans cursor-pointer group"
                                  title="أعجبني منشور المطورين"
                                >
                                  <Heart className="w-4 h-4 fill-rose-500/10 group-hover:scale-110 active:scale-95 transition-all text-rose-500" />
                                  <span className="font-mono bg-[#0E1621] px-2 py-0.5 rounded text-[10px]">{post.likes}</span>
                                </button>

                                <button
                                  onClick={() => setOpenedPostId(isCommentsOpen ? null : post.id)}
                                  className={`flex items-center gap-1.5 text-xs transition-all font-sans cursor-pointer ${
                                    isCommentsOpen ? "text-[#2EA6DE]" : "text-gray-400 hover:text-white"
                                  }`}
                                  title="التعليقات والمناقشات"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  <span>مناقشات</span>
                                  <span className="font-mono bg-[#0E1621] px-2 py-0.5 rounded text-[10px]">{post.comments}</span>
                                </button>
                              </div>

                              <span className="text-[10px] text-gray-500 font-sans italic flex items-center gap-1">
                                <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                                <span>تم البث لكل الجلسات المفتوحة</span>
                              </span>
                            </div>
                          </div>

                          {/* COMMENTS EXPANSION PANEL */}
                          <AnimatePresence>
                            {isCommentsOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-[#0E1621]/70 border-t border-gray-800/80"
                              >
                                <div className="p-4 space-y-4">
                                  <h4 className="text-xs font-bold text-gray-400 font-sans border-b border-gray-800 pb-1 text-right">
                                    المناقشات والحلول المفتوحة ({commentsList.length})
                                  </h4>

                                  {/* List comments */}
                                  <div className="space-y-3 max-h-48 overflow-y-auto">
                                    {commentsList.length > 0 ? (
                                      commentsList.map((comm) => (
                                        <div key={comm.id} className="bg-[#17212B]/60 rounded-xl p-3 border border-gray-800 text-right space-y-1">
                                          <div className="flex justify-between items-baseline">
                                            <span className="text-[9px] text-gray-500 font-mono">{comm.time}</span>
                                            <span className="text-xs font-bold font-sans text-cyan-400">{comm.author}</span>
                                          </div>
                                          <p className="text-xs text-gray-300 font-sans select-all leading-relaxed">{comm.text}</p>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="p-4 text-center text-[11px] text-gray-600 font-sans">
                                        لا توجد مناقشات تحت هذا التحديث بعد، كن أول من يكتب تعليقاً برمجياً!
                                      </div>
                                    )}
                                  </div>

                                  {/* Add comment area */}
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleAddComment(post.id)}
                                      className="px-4 py-2 bg-[#2EA6DE] hover:bg-sky-500 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer"
                                    >
                                      تعليق
                                    </button>
                                    <input
                                      type="text"
                                      placeholder="أضف تعليقاً أو استفساراً حول التحديث..."
                                      value={newCommentText}
                                      onChange={(e) => setNewCommentText(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleAddComment(post.id);
                                      }}
                                      className="flex-1 bg-[#17212B] border border-gray-800 rounded-xl py-2 px-3 text-xs text-right focus:outline-none focus:ring-1 focus:ring-[#2EA6DE]"
                                      dir="rtl"
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500 gap-4 font-sans relative z-10">
                  <div className="w-20 h-20 rounded-full bg-[#17212B]/90 border border-amber-500/30 flex items-center justify-center">
                    <Megaphone className="w-10 h-10 text-amber-500" />
                  </div>
                  <h3 className="font-bold text-lg text-white">اختر قنوات البث البرمجية</h3>
                  <p className="max-w-md text-xs leading-relaxed text-gray-400">
                    انقر فوق إحدى قنوات المطورين لعرض الإعلانات العادية وتحديث مكتبات Google Studio ومناقشة التحديثات بشكل حي معنا.
                  </p>
                </div>
              )
            )}

            {/* LAYOUT DETAILS FOR ACTIVE TAB: "PROFILE" (Tablet/Mobile fallback display for active list selection pane) */}
            {activeTab === "profile" && (
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 relative z-10 md:flex md:flex-col md:justify-center max-w-2xl mx-auto w-full">
                
                {/* Header Profile Info Title */}
                <div className="text-center space-y-2 mb-6 md:block hidden">
                  <h2 className="text-xl font-bold font-sans">تحديث وتوثيق الملف الشخصي للمطور</h2>
                  <p className="text-xs text-gray-500 font-sans">قم بمطابقة الهوية وتحديث الجلسات النشطة لتطبيق غوغل ستوديو تيليجرام</p>
                </div>

                <div className="bg-[#17212B] rounded-2xl border border-gray-800 p-6 md:p-8 space-y-6 shadow-xl">
                  {/* Two columns Edit profile inputs form */}
                  <form onSubmit={(e) => { e.preventDefault(); alert("✓ تم تجديد وتحديث الهوية بنجاح بالجلسة السحابية الحالية!"); }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-xs text-right mb-1.5 font-sans">الاسم الكامل للمطور</label>
                        <input
                          type="text"
                          value={userProfile.name}
                          onChange={(e) => {
                            setUserName(e.target.value);
                            setUserProfile({ ...userProfile, name: e.target.value });
                          }}
                          className="w-full bg-[#0E1621] border border-gray-800 rounded-xl py-2.5 px-4 text-sm text-right focus:outline-none focus:ring-1 focus:ring-[#2EA6DE]"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 text-xs text-right mb-1.5 font-sans">معرف المطور الفريد (Username)</label>
                        <input
                          type="text"
                          value={userProfile.username}
                          onChange={(e) => setUserProfile({ ...userProfile, username: e.target.value })}
                          className="w-full bg-[#0E1621] border border-gray-800 rounded-xl py-2.5 px-4 text-xs font-mono text-left focus:outline-none focus:ring-1 focus:ring-[#2EA6DE]"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-xs text-right mb-1.5 font-sans">رقم هاتف الاتصال الآمن</label>
                        <input
                          type="text"
                          value={userProfile.phone}
                          onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                          className="w-full bg-[#0E1621] border border-gray-800 rounded-xl py-2.5 px-4 text-xs font-mono text-left focus:outline-none focus:ring-1 focus:ring-[#2EA6DE]"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 text-xs text-right mb-1.5 font-sans">البريد الإلكتروني الداخلي</label>
                        <input
                          type="email"
                          value={userProfile.email}
                          onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                          className="w-full bg-[#0E1621] border border-gray-800 rounded-xl py-2.5 px-4 text-xs font-mono text-left focus:outline-none focus:ring-1 focus:ring-[#2EA6DE]"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-xs text-right mb-1.5 font-sans">السيرة الذاتية ورسالة المطور المعتمدة (Bio)</label>
                      <textarea
                        rows={3}
                        value={userProfile.bio}
                        onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                        className="w-full bg-[#0E1621] border border-gray-800 rounded-xl py-2.5 px-4 text-xs text-right focus:outline-none focus:ring-1 focus:ring-[#2EA6DE] leading-relaxed"
                      />
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#2EA6DE] hover:bg-[#208aba] cursor-pointer text-white text-xs font-bold rounded-xl transition-all"
                      >
                        حفظ ومزامنة بيانات الهوية
                      </button>
                    </div>
                  </form>

                  {/* Encryption policy banner info block */}
                  <div className="bg-[#111C27] border border-cyan-950 rounded-xl p-4 flex gap-3 text-right text-xs text-gray-400 items-start font-sans">
                    <div className="p-1 rounded bg-[#2EA6DE]/10 text-[#2EA6DE]">
                      <Info className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-200 mb-1">خصوصية المطورين وأمن المعلومات</h4>
                      <p className="leading-relaxed">
                        نحن لا نشارك أي بيانات أو نصوص أو استعلامات برمجية للذكاء الاصطناعي مع أي أطراف ثالثة. كل السجلات تديرها خوادم Google Cloud Platform الآمنة والمنعزلة بالكامل.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </section>

        </main>

      </div>

      {/* ANDROID EXPORT GUIDE MODAL */}
      <AnimatePresence>
        {showAndroidGuideModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex justify-center items-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl bg-[#17212B] border border-cyan-500/30 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-amber-500" />
              
              <button
                onClick={() => setShowAndroidGuideModal(false)}
                className="absolute top-4 left-4 text-gray-400 hover:text-white cursor-pointer p-1.5 hover:bg-[#0E1621] rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 items-center justify-center mb-2 text-cyan-400">
                  <Smartphone className="w-6 h-6 animate-bounce" />
                </div>
                <h3 className="font-bold text-xl text-white font-sans">تصدير TelegStudio إلى تطبيق Android (.APK)</h3>
                <p className="text-xs text-gray-400 font-sans mt-1">دليل المطورين المتكامل لبناء وتغليف تطبيقات الويب لتعمل على الهواتف الذكية</p>
              </div>

              <div className="space-y-5 overflow-y-auto max-h-[60vh] pr-1" dir="rtl">
                
                {/* Auto Cloud Build Announcement */}
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 bg-cyan-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-br-lg uppercase font-sans tracking-wider">
                    Cloud Compile 🚀
                  </div>
                  <h4 className="font-bold text-xs text-cyan-400 font-sans flex items-center gap-1.5 pt-1">
                    <span>👑 مبرمج وجاهز: التجميع السحابي التلقائي مفعل!</span>
                  </h4>
                  <p className="text-xs text-gray-200 leading-relaxed font-sans">
                    لقد قمنا بإعداد <strong>GitHub Actions Setup (.yml)</strong> تلقائي بالكامل ومدمج في شيفرتك البرمجية الحالية. وبجرد تصدير الكود إلى مستودعك الجديد في GitHub ومزامنته، سيقوم غيت هاب تلقائياً ببناء ملف الـ <strong>APK</strong> بأيقونة التاج الفضية الإمبراطورية الفاخرة التي اخترتها للتو!
                  </p>
                  <p className="text-[11px] text-gray-400 font-sans">
                    💡 يمكنك تحميل الـ APK الجاهز من علامة تبويب <strong className="text-cyan-400">"Actions"</strong> مباشرة في مستودعك بمجرد انتهاء البناء التلقائي في غضون دقيقتين.
                  </p>
                </div>

                {/* Step 1 */}
                <div className="bg-[#0E1621]/80 rounded-xl p-4 border border-gray-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-sans font-bold">الخطوة الأولى</span>
                    <h4 className="font-bold text-sm text-cyan-400 font-sans">1. تصدير الشيفرة البرمجية عبر GitHub</h4>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    لتتمكن من بناء أي تطبيق أندرويد تلقائياً أو يدوياً، تحتاج أولاً لنقل الكود والملفات الحالية إلى حسابك الشخصي في GitHub:
                  </p>
                  <ul className="text-xs text-gray-400 list-disc list-inside space-y-1.5 font-sans pr-2">
                    <li>اضغط على <strong>أيقونة التصدير أو الإعدادات</strong> في شريط أدوات Google AI Studio بأعلى الصفحة.</li>
                    <li>اختر <strong>Export to GitHub</strong> لربط مستودعك ونقل المشروع مباشرة بضغطة زر.</li>
                    <li>أو اختر <strong>Download ZIP</strong> لتحميل الملفات بالكامل مضغوطة ومن ثم فك ضغطها على جهازك.</li>
                  </ul>
                </div>

                {/* Step 2 */}
                <div className="bg-[#0E1621]/80 rounded-xl p-4 border border-gray-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full font-sans font-bold">الخطوة الثانية</span>
                    <h4 className="font-bold text-sm text-cyan-400 font-sans">2. دمج وتفعيل محرك Capacitor الذكي</h4>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    افتح نافذة الأوامر (Terminal) في مجلد مشروعك الذي قمت بتحميله، ثم قم بلصق الأوامر التالية خطوة بخطوة (انقر على السطر لنسخه مباشرة):
                  </p>
                  
                  <div className="space-y-2 pt-1 font-mono text-xs">
                    <div 
                      onClick={() => {
                        navigator.clipboard.writeText("npm install @capacitor/core @capacitor/cli");
                        alert("تم نسخ الأمر بنجاح!");
                      }}
                      className="bg-[#050C14] border border-cyan-950 hover:bg-cyan-950/20 p-2.5 rounded-xl flex justify-between items-center text-left cursor-pointer group transition-all"
                      dir="ltr"
                    >
                      <span className="text-cyan-400 font-medium">npm install @capacitor/core @capacitor/cli</span>
                      <span className="text-[10px] text-gray-500 group-hover:text-cyan-400">انسخ 📋</span>
                    </div>

                    <div 
                      onClick={() => {
                        navigator.clipboard.writeText('npx cap init "TelegStudio" "com.watan.telegstudio" --web-dir=dist');
                        alert("تم نسخ الأمر بنجاح!");
                      }}
                      className="bg-[#050C14] border border-cyan-950 hover:bg-cyan-950/20 p-2.5 rounded-xl flex justify-between items-center text-left cursor-pointer group transition-all"
                      dir="ltr"
                    >
                      <span className="text-amber-400 font-medium">npx cap init "TelegStudio" "com.watan.telegstudio" --web-dir=dist</span>
                      <span className="text-[10px] text-gray-500 group-hover:text-amber-400">انسخ 📋</span>
                    </div>

                    <div 
                      onClick={() => {
                        navigator.clipboard.writeText("npm install @capacitor/android && npx cap add android");
                        alert("تم نسخ الأمر بنجاح!");
                      }}
                      className="bg-[#050C14] border border-cyan-950 hover:bg-cyan-950/20 p-2.5 rounded-xl flex justify-between items-center text-left cursor-pointer group transition-all"
                      dir="ltr"
                    >
                      <span className="text-emerald-400 font-medium font-bold">npm install @capacitor/android && npx cap add android</span>
                      <span className="text-[10px] text-gray-500 group-hover:text-emerald-400">انسخ 📋</span>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-[#0E1621]/80 rounded-xl p-4 border border-gray-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-sans font-bold">الخطوة الثالثة</span>
                    <h4 className="font-bold text-sm text-cyan-400 font-sans">3. المزامنة واستخراج ملف APK</h4>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    الآن قم ببناء واجهة الويب النهائية ومزامنتها على الهاتف ثم افتحها باستخدام برنامج Android Studio لبناء النسخة:
                  </p>

                  <div className="space-y-2 pt-1 font-mono text-xs">
                    <div 
                      onClick={() => {
                        navigator.clipboard.writeText("npm run build && npx cap sync");
                        alert("تم نسخ أمر التجميع والمزامنة بنجاح!");
                      }}
                      className="bg-[#050C14] border border-cyan-950 hover:bg-cyan-950/20 p-2.5 rounded-xl flex justify-between items-center text-left cursor-pointer group transition-all"
                      dir="ltr"
                    >
                      <span className="text-indigo-400 font-medium">npm run build && npx cap sync</span>
                      <span className="text-[10px] text-gray-500 group-hover:text-indigo-400">انسخ 📋</span>
                    </div>

                    <div 
                      onClick={() => {
                        navigator.clipboard.writeText("npx cap open android");
                        alert("تم نسخ أمر فتح مشغل أندرويد بنجاح!");
                      }}
                      className="bg-[#050C14] border border-cyan-950 hover:bg-cyan-950/20 p-2.5 rounded-xl flex justify-between items-center text-left cursor-pointer group transition-all"
                      dir="ltr"
                    >
                      <span className="text-pink-400 font-medium">npx cap open android</span>
                      <span className="text-[10px] text-gray-500 group-hover:text-pink-400">انسخ 📋</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed font-sans pt-1">
                    💡 بعد تشغيل <code className="text-white">npx cap open android</code> سيفتح برنامج <strong>Android Studio</strong> تلقائياً. اذهب إلى القائمة العلوية واضغط على <strong>Build</strong> ثم <strong>Build Bundle(s) / APK(s)</strong> ثم اختر <strong>Build APK</strong>. سيتم توليد تطبيقك الفعلي بنجاح!
                  </p>
                </div>

              </div>

              <div className="flex justify-center pt-5 mt-2 border-t border-gray-800">
                <button
                  onClick={() => setShowAndroidGuideModal(false)}
                  className="px-8 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-sans font-bold text-xs rounded-xl cursor-pointer transition-all shadow-md hover:scale-[1.02]"
                >
                  حسناً، فهمت الطريقة!
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE CHANNEL MODAL POPUP DIALOG */}
      <AnimatePresence>
        {showCreateChannelModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#17212B] border border-gray-800 rounded-2xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowCreateChannelModal(false)}
                className="absolute top-4 left-4 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-bold text-lg text-center mb-5 font-sans">توليد قناة بث برمجية جديدة</h3>
              
              <form onSubmit={handleCreateChannel} className="space-y-4 text-right">
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-sans">اسم القناة</label>
                  <input
                    type="text"
                    placeholder="مثال: خبراء Flutter والذكاء الاصطناعي"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className="w-full bg-[#0E1621] border border-gray-800 rounded-xl py-2 px-3 text-xs text-right focus:outline-none focus:ring-1 focus:ring-[#2EA6DE]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-sans">وصف القناة وأهداف البث</label>
                  <textarea
                    rows={3}
                    placeholder="اكتب نبذة تلخص نوع المنشورات البرمجية والأفكار..."
                    value={newChannelDesc}
                    onChange={(e) => setNewChannelDesc(e.target.value)}
                    className="w-full bg-[#0E1621] border border-gray-800 rounded-xl py-2 px-3 text-xs text-right focus:outline-none focus:ring-1 focus:ring-[#2EA6DE] leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-sans">نمط أيقونة البث</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewChannelIcon("campaign")}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        newChannelIcon === "campaign"
                          ? "bg-amber-600/10 border-amber-500 text-amber-400"
                          : "bg-[#0E1621] border-gray-800 text-gray-400 hover:text-white"
                      }`}
                    >
                      <Megaphone className="w-4 h-4" />
                      <span className="text-[11px] font-sans">قناة عامة</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewChannelIcon("groups")}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        newChannelIcon === "groups"
                          ? "bg-amber-600/10 border-amber-500 text-amber-400"
                          : "bg-[#0E1621] border-gray-800 text-gray-400 hover:text-white"
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span className="text-[11px] font-sans">مجتمع تطوير</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateChannelModal(false)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-xl text-xs font-sans transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#2EA6DE] hover:bg-sky-500 text-white rounded-xl text-xs font-bold font-sans transition-all cursor-pointer"
                  >
                    تأكيد وتأسيس القناة
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
