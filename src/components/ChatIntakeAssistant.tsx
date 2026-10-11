import React, { useState, useRef, useEffect } from 'react';
import { 
  ChatMessage, 
  PatientProfile 
} from '../types';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Stethoscope,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface ChatIntakeAssistantProps {
  onTriageSubmit: (profile: PatientProfile) => void;
  isLoading: boolean;
}

export const ChatIntakeAssistant: React.FC<ChatIntakeAssistantProps> = ({
  onTriageSubmit,
  isLoading,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      role: 'assistant',
      content:
        "Hello, I am your Triage intake assistant. Please tell me in your own words what is bothering you today, when it started, and how severe it feels.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        "Sudden chest discomfort & sweating",
        "Severe migraine with nausea since morning",
        "Fever & sore throat for 3 days",
        "Sprained ankle from sports injury",
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          currentDraft: { text },
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "Thank you for explaining. Have you noticed any other symptoms such as fever, breathing changes, or numbness?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: data.suggestedQuickReplies || [
          "No other symptoms",
          "Yes, mild fever",
          "Pain is getting worse",
        ],
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        content: "Understood. When did this first begin, and would you rate the pain closer to mild (1-4), moderate (5-7), or severe (8-10)?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: ["Mild (around 3/10)", "Moderate (around 6/10)", "Severe (8/10 or higher)"],
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTriggerAnalysisFromChat = () => {
    // Consolidate user dialogue into patient profile
    const userInputs = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join('. ');

    const lower = userInputs.toLowerCase();
    const isEmergencyKeywords =
      lower.includes('chest') ||
      lower.includes('stroke') ||
      lower.includes('heart') ||
      lower.includes('breath') ||
      lower.includes('blood');

    const profile: PatientProfile = {
      symptoms: userInputs || 'Reported symptoms during intake chat',
      duration: 'Derived from conversational intake',
      severity: isEmergencyKeywords ? 8 : 5,
      age: 35,
      gender: 'Patient',
      medicalHistory: [],
      currentMedications: 'None stated in chat',
      language: 'English',
      redFlagChecklist: {
        chestPainPressure: lower.includes('chest'),
        shortnessOfBreath: lower.includes('breath'),
        facialDroopSpeechSlur: lower.includes('speech') || lower.includes('face') || lower.includes('stroke'),
        suddenSevereHeadache: lower.includes('thunderclap') || lower.includes('worst headache'),
        coughingVomitingBlood: lower.includes('blood'),
        anaphylaxisSigns: lower.includes('throat') && lower.includes('swelling'),
      },
    };

    onTriageSubmit(profile);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[560px] overflow-hidden">
      
      {/* Top Header */}
      <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700 flex items-center justify-center text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Conversational Intake Assistant
            </h4>
            <span className="text-[11px] text-slate-400">
              Interactive clinical history gathering
            </span>
          </div>
        </div>

        {/* Analyze Now Shortcut Button */}
        {messages.filter((m) => m.role === 'user').length >= 1 && (
          <button
            onClick={handleTriggerAnalysisFromChat}
            disabled={isLoading}
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md transition"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Classify Urgency Now</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-950/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-2 max-w-[85%]">
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-700 flex items-center justify-center text-indigo-400 text-xs shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                }`}
              >
                <p>{msg.content}</p>
                <span className="text-[9px] text-slate-400 block text-right mt-1 opacity-80">
                  {msg.timestamp}
                </span>
              </div>

              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-cyan-900 border border-cyan-600 flex items-center justify-center text-cyan-200 text-xs shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Quick reply buttons if latest assistant message */}
            {msg.role === 'assistant' && msg.quickReplies && (
              <div className="flex flex-wrap gap-1.5 mt-2 ml-8">
                {msg.quickReplies.map((qr, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(qr)}
                    className="text-[11px] bg-slate-800/90 hover:bg-slate-750 text-cyan-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 transition shadow-sm text-left"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 ml-8">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Assistant is evaluating clinical details...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Type your symptoms or answer questions..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
