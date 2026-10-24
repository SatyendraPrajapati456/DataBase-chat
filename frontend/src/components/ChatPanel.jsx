import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, Settings } from 'lucide-react';
import { AI_PROVIDERS } from './AISettingsModal';

const ChatPanel = ({ history, onSendMessage, isProcessing, activeAIConfig, onOpenAISettings, onQuickChangeModel }) => {
    const [input, setInput] = useState("");
    const endOfMessagesRef = useRef(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isProcessing]);

    const handleSend = () => {
        if (!input.trim() || isProcessing) return;
        onSendMessage(input);
        setInput("");
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const currentProviderId = activeAIConfig?.provider || 'gemini';
    const providerObj = AI_PROVIDERS.find(p => p.id === currentProviderId) || AI_PROVIDERS[0];
    const providerName = providerObj.name;
    const modelName = activeAIConfig?.model || providerObj.defaultModel;
    const availableModels = providerObj.models || [];

    return (
        <div className="flex flex-col h-full bg-surface border-r border-surfaceHighlight relative">
            {/* Header */}
            <div className="h-16 border-b border-surfaceHighlight flex items-center justify-between px-6 bg-surface/80 backdrop-blur-sm z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-white">Chat</h2>
                </div>

                {/* AI Provider & Quick Model Selector */}
                <div className="flex items-center gap-2">
                    {/* Provider Button to open full settings */}
                    <button
                        onClick={onOpenAISettings}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surfaceHighlight/50 hover:bg-surfaceHighlight border border-surfaceHighlight text-xs transition-all active:scale-95 group shadow-sm"
                        title="Click to configure AI Provider & API Key"
                    >
                        <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <Sparkles size={12} />
                        </div>
                        <span className="font-semibold text-textMain text-xs">{providerName}</span>
                        <Settings size={12} className="text-textMuted group-hover:text-white transition-transform group-hover:rotate-45" />
                    </button>

                    {/* Quick Model Selector Dropdown */}
                    <div className="relative">
                        <select
                            value={modelName}
                            onChange={(e) => onQuickChangeModel && onQuickChangeModel(e.target.value)}
                            className="bg-background/80 hover:bg-background border border-surfaceHighlight/80 hover:border-primary/50 rounded-xl px-2.5 py-1.5 text-xs text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer transition-all shadow-inner"
                            title="Switch Model on the fly"
                        >
                            {availableModels.map((m) => (
                                <option key={m.id} value={m.id} className="bg-surface text-textMain font-sans">
                                    {m.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                {history.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-textMuted space-y-4 opacity-75">
                        <div className="w-16 h-16 rounded-2xl bg-surfaceHighlight/40 flex items-center justify-center text-primary">
                            <Bot size={36} />
                        </div>
                        <p className="text-lg font-medium text-textMain">Ask me anything about your database</p>
                        <p className="text-xs text-textMuted max-w-sm text-center">
                            Powered by <span className="text-primary font-semibold">{providerName} ({modelName})</span>. Questions will be converted into safe SQL queries automatically.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center max-w-md mt-4 text-xs">
                            <button
                                onClick={() => onSendMessage("Show me total sales?")}
                                className="bg-surfaceHighlight/50 px-3 py-1.5 rounded-full hover:bg-surfaceHighlight text-textMain transition-colors"
                            >
                                Show me total sales?
                            </button>
                            <button
                                onClick={() => onSendMessage("What is the top region?")}
                                className="bg-surfaceHighlight/50 px-3 py-1.5 rounded-full hover:bg-surfaceHighlight text-textMain transition-colors"
                            >
                                What is the top region?
                            </button>
                            <button
                                onClick={() => onSendMessage("List the top 5 customers by revenue")}
                                className="bg-surfaceHighlight/50 px-3 py-1.5 rounded-full hover:bg-surfaceHighlight text-textMain transition-colors"
                            >
                                Top 5 customers by revenue
                            </button>
                        </div>
                    </div>
                ) : (
                    history.map((msg, idx) => {
                        const isError = msg.text?.startsWith("Error:");
                        const isAuthError = isError && (
                            msg.text.includes("API key") ||
                            msg.text.includes("401") ||
                            msg.text.includes("Unauthorized") ||
                            msg.text.includes("AI Settings")
                        );

                        return (
                            <div key={idx} className={`flex gap-4 animate-slide-up ${msg.role === 'user' ? 'min-h-[50px]' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                    msg.role === 'user' 
                                        ? 'bg-primary text-white shadow-sm' 
                                        : isError 
                                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                                            : 'bg-accent text-white shadow-sm shadow-accent/50'
                                }`}>
                                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                                </div>
                                <div className="flex-1 space-y-1.5 mt-0.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">
                                            {msg.role === 'user' ? 'You' : 'Data Assistant'}
                                        </p>
                                        {msg.role !== 'user' && !isError && (
                                            <span className="text-[10px] text-textMuted font-mono">
                                                via {providerName}
                                            </span>
                                        )}
                                    </div>
                                    <div className={`text-md leading-relaxed whitespace-pre-wrap ${
                                        isError ? 'text-rose-300 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20' : 'text-textMain'
                                    }`}>
                                        {msg.text}
                                    </div>

                                    {isAuthError && (
                                        <div className="pt-2">
                                            <button
                                                onClick={onOpenAISettings}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primaryHover text-white text-xs font-semibold shadow-md transition-all active:scale-95"
                                            >
                                                <Sparkles size={13} />
                                                <span>Configure {providerName} API Key in AI Settings</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                
                {isProcessing && (
                    <div className="flex gap-4 animate-fade-in">
                        <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shrink-0 shadow-sm shadow-accent/50">
                            <Bot size={18} />
                        </div>
                        <div className="flex-1 flex items-center h-8">
                             <Loader2 size={18} className="animate-spin text-primary" />
                             <span className="ml-2 text-sm text-textMuted">Compiling SQL query with {providerName}...</span>
                        </div>
                    </div>
                )}
                
                <div ref={endOfMessagesRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-surface border-t border-surfaceHighlight">
                <div className="relative glass-panel group flex items-end">
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Ask questions about your data (using ${providerName})...`}
                        className="w-full bg-transparent text-textMain border-none focus:ring-0 resize-none p-4 max-h-32 min-h-[56px] custom-scrollbar focus:outline-none"
                        rows={1}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={isProcessing || !input.trim()}
                        className="mb-3 mr-3 p-2 rounded-lg bg-primary hover:bg-primaryHover disabled:bg-surfaceHighlight disabled:text-textMuted disabled:cursor-not-allowed text-white transition-all shadow-md active:scale-95"
                        title="Send query"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;
