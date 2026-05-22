import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of GoogleGenAI to prevent crashes if key is omitted
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ Warning: GEMINI_API_KEY environment variable is not defined.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST route for chatting with specialized developers via Gemini API
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { messages, developerRole, developerName } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "الرسائل مطلوبة ويجب أن تكون مصفوفة." });
    }

    const ai = getAiClient();
    if (!process.env.GEMINI_API_KEY) {
      // Return beautiful mock responses in Arabic if the key is missing gracefully
      const lastMsg = messages[messages.length - 1]?.text || "";
      return res.json({
        text: `📍 [وضع المحاكاة النشط] أهلاً بك! لقد استلمت رسالتك: "${lastMsg}". يرجى تفعيل مفتاح GEMINI_API_KEY في الإعدادات لتفعيل ردود المطورين الذكية بالذكاء الاصطناعي الحقيقي! أنا ${developerName || "المطور الذكي"} ومستعد لمساعدتك.`,
      });
    }

    // Prepare system instruction depending on developerRole
    let systemInstruction = `أنت مطور برمجيات محترف وخبير ممتاز تعمل في منصة Google Telegram Studio.
اسمك هو "${developerName || "مطور جوجل الذكي"}".
تخصصك ودورك الحقيقي هو: "${developerRole || "مساعد مبرمجين عام"}".
كل إجاباتك يجب أن تكون باللغة العربية الفصحى المبسطة والمهنية والمرحة أحياناً.
حاول تقديم نصائح برمجية، شيفرات برمجية نظيفة باستخدام التنسيق المناسب للماركدوان (Markdown) مع لغة البرمجة المناسبة عند الضرورة.
أجب باختصار وبأسلوب دردشة فورية كأنك بريد تيليجرام تفاعلي وسريع.`;

    // Map the message history into GoogleGenAI contents structure
    // gemini-3.5-flash expects simple formats. Let's send the prompt history
    const contents = messages.map((m: any) => ({
      role: m.sender === "me" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    res.status(500).json({
      error: "فشل الاتصال بذكاء Google الاصطناعي",
      details: error.message || error,
    });
  }
});

// Start server utility with Vite support
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server runs successfully on http://localhost:${PORT}`);
  });
}

startServer();
