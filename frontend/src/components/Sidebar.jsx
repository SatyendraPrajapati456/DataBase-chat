import React from 'react';
import { Database, Plus, Unplug, Sparkles } from 'lucide-react';
import DatabaseExplorer from './DatabaseExplorer';

const Sidebar = ({
    databases,
    selectedTables,
    onSelectTable,
    onPreviewTable,
    onOpenConnectModal,
    onDisconnect,
    onOpenAISettings,
    activeAIConfig,
}) => {
    const totalTables = databases.reduce((sum, db) => sum + (db.tables?.length || 0), 0);
    const providerName = (activeAIConfig?.provider || 'gemini').toUpperCase();

    return (
        <div className="w-72 border-r border-surfaceHighlight bg-surface flex flex-col h-full overflow-hidden shadow-lg z-10">
            {/* Header */}
            <div className="p-4 border-b border-surfaceHighlight shrink-0">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                        <Database size={16} className="text-white" />
                    </div>
                    DataChat
                </h2>
                <p className="text-[10px] text-textMuted mt-1 uppercase tracking-widest">Cloud Database Intelligence</p>
            </div>

            {/* Actions Section */}
            <div className="px-4 pt-4 pb-2 shrink-0 space-y-2">
                <button
                    onClick={onOpenConnectModal}
                    className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 text-sm"
                >
                    <Plus size={18} />
                    Connect Database
                </button>

                <button
                    onClick={onOpenAISettings}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-background/50 hover:bg-surfaceHighlight/50 border border-surfaceHighlight/70 text-xs transition-all active:scale-95 group shadow-sm"
                    title="Choose AI Provider (Gemini, OpenAI, Grok, Claude, Ollama, etc.)"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <Sparkles size={12} />
                        </div>
                        <span className="font-medium text-textMain">AI Model Engine</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-semibold">
                        {providerName}
                    </span>
                </button>
            </div>

            {/* Stats bar */}
            {databases.length > 0 && (
                <div className="px-4 py-2 flex items-center gap-3 text-[10px] text-textMuted uppercase tracking-wider shrink-0 border-b border-surfaceHighlight/50">
                    <span>{databases.length} database{databases.length !== 1 ? 's' : ''}</span>
                    <span className="text-surfaceHighlight">·</span>
                    <span>{totalTables} object{totalTables !== 1 ? 's' : ''}</span>
                </div>
            )}

            {/* Database Explorer Tree */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                <DatabaseExplorer
                    databases={databases}
                    selectedTables={selectedTables}
                    onSelectTable={onSelectTable}
                    onPreviewTable={onPreviewTable}
                />
            </div>

            {/* Disconnect Section */}
            {databases.length > 0 && (
                <div className="p-3 border-t border-surfaceHighlight shrink-0 space-y-1.5">
                    {databases.map(db => (
                        <div
                            key={db.db_id}
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-background/30 border border-surfaceHighlight/30"
                        >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                                <span className="text-xs text-textMain truncate">{db.display_name}</span>
                            </div>
                            <button
                                onClick={() => onDisconnect(db.db_id)}
                                className="text-textMuted hover:text-red-400 transition-colors p-1 rounded hover:bg-red-400/10 shrink-0"
                                title="Disconnect"
                            >
                                <Unplug size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Sidebar;
