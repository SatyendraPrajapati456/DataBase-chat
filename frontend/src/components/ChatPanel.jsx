import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';

const ChatPanel = ({ history, onSendMessage, isProcessing }) => {
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

    return (
        <div className="flex flex-col h-full bg-surface border-r border-surfaceHighlight relative">
            {/* Header */}
            <div className="h-16 border-b border-surfaceHighlight flex items-center px-6 bg-surface/80 backdrop-blur-sm z-10 shadow-sm">
                <h2 className="text-xl font-semibold text-white">Chat</h2>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                {history.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-textMuted space-y-4 opacity-70">
                        <Bot size={48} />
                        <p className="text-lg">Ask me anything about your data</p>
                        <div className="flex gap-2 mt-4 text-sm">
                            <span className="bg-surfaceHighlight/50 px-3 py-1 rounded-full cursor-pointer hover:bg-surfaceHighlight">Show me total sales?</span>
                            <span className="bg-surfaceHighlight/50 px-3 py-1 rounded-full cursor-pointer hover:bg-surfaceHighlight">What is the top region?</span>
                        </div>
                    </div>
                ) : (
                    history.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 animate-slide-up ${msg.role === 'user' ? 'min-h-[60px]' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-accent text-white shadow-sm shadow-accent/50'}`}>
                                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                            </div>
                            <div className="flex-1 space-y-2 mt-1">
                                <p className="text-sm font-semibold text-textMuted uppercase tracking-wide">
                                    {msg.role === 'user' ? 'You' : 'Data Assistant'}
                                </p>
                                <div className="text-textMain text-md leading-relaxed whitespace-pre-wrap">
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                
                {isProcessing && (
                    <div className="flex gap-4 animate-fade-in">
                        <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shrink-0 shadow-sm shadow-accent/50">
                            <Bot size={18} />
                        </div>
                        <div className="flex-1 flex items-center h-8">
                             <Loader2 size={18} className="animate-spin text-primary" />
                             <span className="ml-2 text-sm text-textMuted">Compiling query...</span>
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
                        placeholder="Type a message (e.g. show sales by region)..."
                        className="w-full bg-transparent text-textMain border-none focus:ring-0 resize-none p-4 max-h-32 min-h-[56px] custom-scrollbar focus:outline-none"
                        rows={1}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={isProcessing || !input.trim()}
                        className="mb-3 mr-3 p-2 rounded-lg bg-primary hover:bg-primaryHover disabled:bg-surfaceHighlight disabled:text-textMuted disabled:cursor-not-allowed text-white transition-all shadow-md active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;
