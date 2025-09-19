import { NextResponse } from "next/server";

export const runtime = "edge"; // fast cold starts

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      prompt = "",
      language = "en",
      context = {}
    } = body || {};

    const trimmed = String(prompt || "").trim();
    if (!trimmed) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    // If OpenAI key exists, call OpenAI. Otherwise, return a mock answer.
    if (OPENAI_API_KEY) {
      // Minimal, robust call to Chat Completions
      const sys = language === "ml"
        ? "നിങ്ങൾ ഒരു സഹായകരമായ കാർഷിക ഉപദേഷ്ടാവാണ്. ചുരുക്കമായി, വ്യക്തമായി പ്രതികരിക്കുക."
        : language === "hi"
        ? "आप एक सहायक कृषि सलाहकार हैं। संक्षिप्त और स्पष्ट उत्तर दें।"
        : "You are a helpful agricultural advisor. Respond concisely and clearly.";

      const messages = [
        { role: "system", content: sys },
        { role: "user", content: trimmed }
      ];

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ error: err || "LLM error" }, { status: 502 });
      }

      const data = await res.json();
      const answer = data?.choices?.[0]?.message?.content || "";
      return NextResponse.json({ answer });
    }

    // Mock fallback answer
    const mock = language === "ml"
      ? "ഇതൊരു മാതൃക മറുപടിയാണ്. നിങ്ങളുടെ വിള സംബന്ധിച്ച പ്രശ്നങ്ങൾക്ക് നിലവിലുള്ള കാലാവസ്ഥയും രോഗലക്ഷണങ്ങളും പരിഗണിച്ച് നടപടി സ്വീകരിക്കുക."
      : language === "hi"
      ? "यह एक नमूना उत्तर है। अपने फसल संबंधी मुद्दों के लिए मौसम और लक्षणों के आधार पर उचित कदम उठाएँ।"
      : "This is a sample answer. For your crop issue, consider the weather and symptoms and take appropriate action.";

    return NextResponse.json({ answer: mock, mocked: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}