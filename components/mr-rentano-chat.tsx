"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Sparkles, Globe } from "lucide-react";
import Image from "next/image";
import { useLocale } from "@/lib/locale-context";
import { localeNames, type Locale } from "@/lib/i18n";

interface Message {
  id: number;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface MrRentanoChatProps {
  onBack: () => void;
}

export function MrRentanoChat({ onBack }: MrRentanoChatProps) {
  const { t, locale } = useLocale();
  
  const quickReplies = [
    t("rentano.ask_insurance"),
    t("rentano.ask_extend"),
    t("rentano.ask_report"),
    t("rentano.ask_suggest"),
  ];

  const initialMessages: Message[] = [
    {
      id: 1,
      type: "assistant",
      content: t("rentano.greeting"),
      timestamp: new Date(Date.now() - 60000),
    },
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update initial message when locale changes
  useEffect(() => {
    setMessages([{
      id: 1,
      type: "assistant",
      content: t("rentano.greeting"),
      timestamp: new Date(Date.now() - 60000),
    }]);
  }, [locale, t]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response based on locale
    setTimeout(() => {
      const responses: Record<string, Record<Locale, string>> = {
        insurance: {
          en: "Great question! Every rental on AllByRent comes with automatic insurance coverage at no extra cost. This protects both you and the owner against accidental damage up to the item's full value. You don't need to do anything — it's activated the moment you check in with the QR code.",
          ru: "Отличный вопрос! Каждая аренда на AllByRent включает автоматическую страховку без дополнительной платы. Это защищает и вас, и владельца от случайного ущерба до полной стоимости вещи. Вам не нужно ничего делать — страховка активируется в момент регистрации по QR-коду.",
          es: "¡Excelente pregunta! Cada alquiler en AllByRent incluye seguro automático sin costo adicional. Esto protege tanto a ti como al propietario contra daños accidentales hasta el valor total del artículo.",
          zh: "好问题！AllByRent上的每笔租赁都包含自动保险，无需额外付费。这可以保护您和物主免受意外损坏，最高可达物品全额价值。",
          hi: "बढ़िया सवाल! AllByRent पर हर किराये में बिना किसी अतिरिक्त लागत के स्वचालित बीमा शामिल है।",
          ar: "سؤال رائع! كل إيجار على AllByRent يأتي مع تغطية تأمينية تلقائية بدون تكلفة إضافية.",
          pt: "Ótima pergunta! Todo aluguel no AllByRent vem com cobertura de seguro automática sem custo adicional.",
          fr: "Excellente question ! Chaque location sur AllByRent comprend une couverture d'assurance automatique sans frais supplémentaires.",
          de: "Gute Frage! Jede Miete bei AllByRent beinhaltet automatischen Versicherungsschutz ohne zusätzliche Kosten.",
          ja: "素晴らしい質問です！AllByRentのすべてのレンタルには、追加費用なしで自動保険が含まれています。",
          ko: "좋은 질문입니다! AllByRent의 모든 대여에는 추가 비용 없이 자동 보험이 포함됩니다.",
        },
        extend: {
          en: "Absolutely! You can extend your rental directly from the Active Rental screen. Simply tap 'Extend' and select your new return date. I'll notify the owner and update your insurance coverage automatically.",
          ru: "Конечно! Вы можете продлить аренду прямо с экрана активной аренды. Просто нажмите 'Продлить' и выберите новую дату возврата. Я уведомлю владельца и автоматически обновлю страховку.",
          es: "¡Por supuesto! Puedes extender tu alquiler directamente desde la pantalla de Alquiler Activo.",
          zh: "当然可以！您可以直接从活动租赁屏幕延长租期。",
          hi: "बिल्कुल! आप सक्रिय किराया स्क्रीन से सीधे अपना किराया बढ़ा सकते हैं।",
          ar: "بالتأكيد! يمكنك تمديد إيجارك مباشرة من شاشة الإيجار النشط.",
          pt: "Claro! Você pode estender seu aluguel diretamente da tela de Aluguel Ativo.",
          fr: "Absolument ! Vous pouvez prolonger votre location directement depuis l'écran Location Active.",
          de: "Absolut! Sie können Ihre Miete direkt vom Bildschirm Aktive Miete verlängern.",
          ja: "もちろんです！アクティブレンタル画面から直接レンタルを延長できます。",
          ko: "물론이죠! 활성 대여 화면에서 직접 대여를 연장할 수 있습니다.",
        },
        default: {
          en: "I'd be happy to help with that! Could you tell me a bit more about what you're looking for? I can help you find items, explain how our platform works, or assist with an active rental.",
          ru: "Буду рад помочь! Расскажите подробнее, что вы ищете? Я могу помочь найти вещи, объяснить как работает платформа или помочь с активной арендой.",
          es: "¡Estaré encantado de ayudarte! ¿Podrías contarme un poco más sobre lo que buscas?",
          zh: "我很乐意帮忙！您能告诉我更多关于您在寻找什么吗？",
          hi: "मुझे मदद करके खुशी होगी! क्या आप मुझे बता सकते हैं कि आप क्या खोज रहे हैं?",
          ar: "يسعدني المساعدة! هل يمكنك إخباري المزيد عما تبحث عنه؟",
          pt: "Ficarei feliz em ajudar! Você poderia me contar um pouco mais sobre o que está procurando?",
          fr: "Je serais ravi de vous aider ! Pourriez-vous m'en dire un peu plus sur ce que vous recherchez ?",
          de: "Ich helfe gerne! Könnten Sie mir etwas mehr darüber erzählen, wonach Sie suchen?",
          ja: "喜んでお手伝いします！何をお探しかもう少し教えていただけますか？",
          ko: "기꺼이 도와드리겠습니다! 무엇을 찾고 계신지 조금 더 ���려주시겠어요?",
        },
      };

      let responseKey = "default";
      const lowerInput = inputValue.toLowerCase();
      if (lowerInput.includes("insurance") || lowerInput.includes("страхов") || lowerInput.includes("seguro") || lowerInput.includes("保险")) {
        responseKey = "insurance";
      } else if (lowerInput.includes("extend") || lowerInput.includes("продл") || lowerInput.includes("extender") || lowerInput.includes("延长")) {
        responseKey = "extend";
      }

      const assistantMessage: Message = {
        id: Date.now(),
        type: "assistant",
        content: responses[responseKey][locale] || responses[responseKey].en,
        timestamp: new Date(),
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1500);
  };

  const handleQuickReply = (reply: string) => {
    setInputValue(reply);
  };

  return (
    <div className="flex flex-col h-screen bg-background screen-transition">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary">
              <Image
                src="/mr-rentano.png"
                alt={t("rentano.name")}
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-card" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-foreground">{t("rentano.name")}</h1>
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {t("rentano.speaks_your_language")} · {localeNames[locale]}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex mb-4 ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.type === "assistant" && (
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mr-2 mt-1">
                <Image
                  src="/mr-rentano.png"
                  alt={t("rentano.name")}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.type === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card border border-border text-foreground rounded-bl-md"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p
                className={`text-[10px] mt-1.5 ${
                  message.type === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {message.timestamp.toLocaleTimeString(locale, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex mb-4 justify-start">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mr-2 mt-1">
              <Image
                src="/mr-rentano.png"
                alt={t("rentano.name")}
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                <div
                  className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              onClick={() => handleQuickReply(reply)}
              className="flex-shrink-0 px-3 py-2 rounded-full border border-border bg-card text-sm text-foreground hover:bg-secondary transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-card border-t border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={t("rentano.type_message")}
            className="flex-1 h-12 px-4 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            <Send className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
