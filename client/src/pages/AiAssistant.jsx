import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Lightbulb,
  Boxes,
  Truck,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

const AiAssistant = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text:
        i18n.language === 'fr'
          ? `Bonjour ${user?.fullName?.latin || ''} ! Je suis l'Assistant LogiNaft IA connecté en direct à votre base de données opérationnelle. Comment puis-je vous aider aujourd'hui ?`
          : `مرحباً بك يا ${user?.fullName?.ar || ''}! أنا المساعد الذكي لمنظومة LogiNaft، متصل مباشرة بقاعدة البيانات اللوجستية لمتابعة المخزون، الشحنات، وتحسين العمليات. كيف يمكنني مساعدتك؟`,
      suggestions: [
        i18n.language === 'fr' ? 'Quel est le stock aujourd\'hui ?' : 'كم حجم المخزون اليوم؟',
        i18n.language === 'fr' ? 'Quelles expéditions sont en retard ?' : 'أي شحنة متأخرة عن موعدها؟',
        i18n.language === 'fr' ? 'Suggestions d\'optimisation logistique' : 'اقتراحات لتحسين التوزيع وإدارة العمليات',
      ],
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageToSend) => {
    const query = messageToSend || input;
    if (!query || query.trim() === '') return;

    const userMsg = {
      sender: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai-assistant/chat', {
        message: query,
        language: i18n.language,
      });

      if (res.data?.success) {
        const botReply = {
          sender: 'bot',
          text: res.data.data.reply,
          suggestions: res.data.data.suggestions || [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botReply]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'عذراً، حدث خطأ أثناء الاتصال بنظام الذكاء الاصطناعي. يرجى إعادة المحاولة.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 w-full min-w-0 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 min-w-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 shrink-0">
            <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex flex-wrap items-center gap-2">
              <span>{t('nav.aiAssistant')}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20 shrink-0">
                AI Engine
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              استعلام حي باللغة الطبيعية عن المخزون والشحنات واقتراحات إعادة الموازنة
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                sender: 'bot',
                text: 'تمت إعادة تهيئة جلسة المحادثة. تفضل بطرح سؤالك اللوجستي:',
                suggestions: ['كم حجم المخزون اليوم؟', 'أي شحنة متأخرة عن موعدها؟'],
                timestamp: new Date(),
              },
            ])
          }
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0 self-end sm:self-auto"
          title="محادثة جديدة"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Box */}
      <div className="bg-white dark:bg-[#111C30] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[560px] overflow-hidden">
        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, idx) => {
            const isBot = msg.sender === 'bot';
            return (
              <div
                key={idx}
                className={`flex items-start gap-2.5 sm:gap-3 ${isBot ? 'justify-start' : 'flex-row-reverse'}`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white flex-shrink-0 text-xs font-bold shadow-sm ${
                    isBot ? 'bg-gradient-to-tr from-cyan-600 to-blue-600' : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                  }`}
                >
                  {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>

                <div
                  className={`max-w-xl p-4 sm:p-5 rounded-2xl sm:rounded-3xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-sm border ${
                    isBot
                      ? 'bg-slate-100 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-tr-none'
                      : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white border-transparent rounded-tl-none font-medium shadow-md shadow-cyan-600/20'
                  }`}
                >
                  <div className="text-slate-900 dark:text-white font-medium leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Suggestions pills if bot */}
                  {isBot && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-700/80 flex flex-wrap gap-2">
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1.5 w-full">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>اقتراحات سريعة:</span>
                      </span>
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(sug)}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0B1120] text-xs font-bold text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-cyan-800/80 hover:border-cyan-500 dark:hover:border-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 shadow-sm transition-all text-start"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    className={`text-[10px] font-mono mt-1.5 text-end ${
                      isBot ? 'text-slate-400 dark:text-slate-400' : 'text-cyan-100'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center">
                <Bot className="w-5 h-5 animate-bounce" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                <span>المساعد الذكي يقوم بفحص بيانات المستودعات والشحنات الحية...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat input box */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-[#0E172A] border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اطرح سؤالك اللوجستي (مثال: كم المخزون اليوم؟ أي شحنة متأخرة؟ اقتراحات التوزيع...)"
              className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold shadow-md shadow-cyan-600/25 disabled:opacity-50 transition-all shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
