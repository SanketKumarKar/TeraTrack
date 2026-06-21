import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, Globe, Wind, Droplets, Send, Bot, User, Loader2 } from "lucide-react";
import Markdown from "react-markdown";

/** Maximum number of turns (user + model pairs) to keep in memory. */
const MAX_HISTORY_TURNS = 20;

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
  isError?: boolean;
}

/** Static educational tips — defined outside the component to avoid re-creation per render. */
const TIPS = [
  { title: "Switch to a renewable energy provider", content: "Switching to wind or solar energy can reduce your household emissions by up to 1.5 tonnes of CO2 per year." },
  { title: "Eat plant-based meals more often", content: "Replacing meat with plant-based alternatives just two days a week can save around 0.4 tonnes of CO2 annually." },
  { title: "Walk, cycle, or use public transit", content: "Leaving the car at home for short trips cuts down on direct tailpipe emissions significantly." },
  { title: "Reduce food waste", content: "Plan meals and freeze leftovers. Food waste in landfills produces methane, a potent greenhouse gas." },
  { title: "Improve home insulation", content: "Draft-proofing your home minimizes the energy needed to heat or cool it, saving money and emissions." },
  { title: "Buy locally sourced food", content: "Purchasing local produce reduces the transportation emissions associated with getting food to your plate." },
  { title: "Switch to LEDs", content: "LED bulbs use up to 85% less energy than traditional incandescent bulbs and last much longer." },
  { title: "Wash clothes on cold", content: "Heating water accounts for about 90% of the energy used by a washing machine. Wash on cold to save energy." },
  { title: "Reduce air travel", content: "A single round-trip long-haul flight can produce more CO2 than an average person in some countries produces in a year." },
  { title: "Consume less, buy second-hand", content: "Manufacturing new products consumes energy and resources. Extending the life of items reduces this hidden footprint." },
];


export default function AwarenessPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const toggleAccordion = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg: ChatMessage = { role: "user", parts: [{ text: chatMessage }] };
    // Only send non-error messages to the API; cap history depth to avoid token overuse
    const cleanHistory = chatHistory
      .filter((msg) => !msg.isError)
      .slice(-MAX_HISTORY_TURNS);

    setChatHistory((prev) => [...prev, userMsg]);
    setChatMessage("");
    setIsChatLoading(true);

    // Abort any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.parts[0].text, history: cleanHistory }),
        signal: controller.signal,
      });
      const data = await res.json();
      
      if (!res.ok) {
         throw new Error(data.error || "Failed to get response");
      }
      
      const modelMsg: ChatMessage = {
        role: "model",
        parts: [{ text: data.response || "Sorry, I could not understand that." }],
      };
      setChatHistory((prev) => [...prev, modelMsg]);
    } catch (error) {
      if ((error as { name?: string }).name === "AbortError") return;
      console.error("Chat error:", error);
      const errMsg: ChatMessage = {
        role: "model",
        parts: [{ text: `_Error: ${error instanceof Error ? error.message : "Unknown error"}_` }],
        isError: true,
      };
      setChatHistory((prev) => [...prev, errMsg]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatMessage, chatHistory]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);


  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-black text-natural-700 tracking-tight">Understanding Your Carbon Footprint</h1>
        <p className="text-xl text-natural-800 opacity-60 max-w-2xl mx-auto">
          Every action we take has an impact. Learn why carbon footprints matter and how you can make a difference.
        </p>
      </header>

      <section className="bg-white rounded-[40px] shadow-sm border border-natural-200 p-8 md:p-14" aria-labelledby="what-is">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-8 h-8 text-natural-500" aria-hidden="true" />
          <h2 id="what-is" className="text-3xl font-bold text-natural-800">What is a Carbon Footprint?</h2>
        </div>
        <div className="prose prose-lg text-natural-800 opacity-80 max-w-none">
          <p>
            Your carbon footprint is the total amount of greenhouse gases (including carbon dioxide and methane) that are generated by your actions.
            The average carbon footprint for a person in the United States is roughly <strong>16 tonnes</strong>, one of the highest rates in the world. Globally, the average is closer to <strong>4.8 tonnes</strong>.
          </p>
          <p className="mt-4">
            To have the best chance of avoiding a 2℃ rise in global temperatures, the average global carbon footprint per year needs to drop to under <strong>2 tonnes by 2050</strong>.
          </p>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-natural-100 rounded-[32px] p-10 border border-natural-300">
          <Wind className="w-8 h-8 text-natural-600 mb-4" aria-hidden="true" />
          <h3 className="text-xl font-bold text-natural-800 mb-2">Direct Emissions</h3>
          <p className="text-natural-800 opacity-70">
            Emissions directly created by you, such as driving a gas-powered car or burning natural gas for heating your home.
          </p>
        </div>
        <div className="bg-natural-700 rounded-[32px] p-10 border border-natural-800">
          <Droplets className="w-8 h-8 text-natural-200 mb-4" aria-hidden="true" />
          <h3 className="text-xl font-bold text-white mb-2">Indirect Emissions</h3>
          <p className="text-natural-100 opacity-80">
            Emissions caused by the things you buy and use, like the energy used to manufacture your phone or grow your food.
          </p>
        </div>
      </div>

      <section className="bg-white rounded-[40px] shadow-sm border border-natural-200 p-8 md:p-14 mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Bot className="w-8 h-8 text-natural-500" aria-hidden="true" />
          <h2 className="text-3xl font-bold text-natural-800">Ask the Sustainability Guide</h2>
        </div>
        <p className="text-natural-800 opacity-70 mb-8">
          Have questions about carbon emissions, footprint reduction, or eco-friendly alternatives? Chat with our AI sustainability expert.
        </p>

        <div className="border border-natural-200 rounded-3xl overflow-hidden flex flex-col h-[500px] bg-natural-100/50">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <Bot className="w-16 h-16 mb-4 text-natural-400" />
                <p className="text-lg font-medium text-natural-600">Start a conversation!</p>
                <p className="text-sm text-natural-500 mt-2">Example: "How can I reduce emissions from food?"</p>
              </div>
            ) : (
              chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-natural-200 text-natural-700" : "bg-natural-600 text-white"}`}>
                    {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`px-6 py-4 rounded-3xl max-w-[85%] ${msg.role === "user" ? "bg-white border border-natural-200 rounded-tr-sm" : "bg-natural-200 rounded-tl-sm"}`}>
                    {msg.role === "model" ? (
                       <div className="prose prose-sm md:prose-base prose-natural max-w-none text-natural-800">
                         <Markdown>{msg.parts[0].text}</Markdown>
                       </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-natural-800">{msg.parts[0].text}</p>
                    )}
                  </div>
                </div>
              ))
            )}
            {isChatLoading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center bg-natural-600 text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="px-6 py-4 rounded-3xl max-w-[85%] bg-natural-200 rounded-tl-sm flex items-center">
                  <Loader2 className="w-5 h-5 text-natural-600 animate-spin" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 bg-white border-t border-natural-200">
            <form onSubmit={handleSendMessage} className="flex gap-3 relative">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask about sustainability..."
                aria-label="Chat message"
                disabled={isChatLoading}
                className="w-full pl-6 pr-14 py-4 rounded-2xl bg-natural-100 border-none outline-none focus:ring-2 focus:ring-natural-300 transition-shadow disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatMessage.trim()}
                className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-natural-800 text-white rounded-xl hover:bg-natural-700 disabled:opacity-50 transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <section aria-labelledby="top-10">
        <h2 id="top-10" className="text-3xl font-bold text-natural-800 mb-8 text-center mt-8">Top 10 Easiest Ways to Reduce</h2>
        <div className="bg-white rounded-[32px] shadow-sm border border-natural-200 divide-y divide-natural-100 overflow-hidden">
          {TIPS.map((tip, index) => (
            <div key={index} className="px-8">
              <button
                className="w-full py-6 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-inset focus:ring-natural-700"
                onClick={() => toggleAccordion(index)}
                aria-expanded={openIndex === index}
                aria-controls={`tip-content-${index}`}
              >
                <div className="flex items-center text-left">
                  <span className="flex-shrink-0 w-8 text-natural-500 font-bold">{index + 1}.</span>
                  <span className="text-lg font-bold text-natural-800">{tip.title}</span>
                </div>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-natural-500" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-natural-500" aria-hidden="true" />
                )}
              </button>
              <div
                id={`tip-content-${index}`}
                className={`pb-8 pl-8 text-natural-800 opacity-70 transition-all ${openIndex === index ? 'block' : 'hidden'}`}
              >
                {tip.content}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
