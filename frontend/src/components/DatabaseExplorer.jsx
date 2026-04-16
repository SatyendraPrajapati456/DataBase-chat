import React, { useState } from 'react';
import { ChevronRight, Table, Eye, Database, Columns3, KeyRound, Hash, Type, Calendar, ToggleLeft } from 'lucide-react';

const TYPE_STYLES = {
    'INTEGER': { color: '#60A5FA', bg: '#60A5FA15', icon: Hash },
    'INT': { color: '#60A5FA', bg: '#60A5FA15', icon: Hash },
    'BIGINT': { color: '#60A5FA', bg: '#60A5FA15', icon: Hash },
    'SMALLINT': { color: '#60A5FA', bg: '#60A5FA15', icon: Hash },
    'TINYINT': { color: '#60A5FA', bg: '#60A5FA15', icon: Hash },
    'FLOAT': { color: '#A78BFA', bg: '#A78BFA15', icon: Hash },
    'REAL': { color: '#A78BFA', bg: '#A78BFA15', icon: Hash },
    'DECIMAL': { color: '#A78BFA', bg: '#A78BFA15', icon: Hash },
    'NUMERIC': { color: '#A78BFA', bg: '#A78BFA15', icon: Hash },
    'MONEY': { color: '#A78BFA', bg: '#A78BFA15', icon: Hash },
    'SMALLMONEY': { color: '#A78BFA', bg: '#A78BFA15', icon: Hash },
    'VARCHAR': { color: '#34D399', bg: '#34D39915', icon: Type },
    'NVARCHAR': { color: '#34D399', bg: '#34D39915', icon: Type },
    'TEXT': { color: '#34D399', bg: '#34D39915', icon: Type },
    'NTEXT': { color: '#34D399', bg: '#34D39915', icon: Type },
    'CHAR': { color: '#34D399', bg: '#34D39915', icon: Type },
    'NCHAR': { color: '#34D399', bg: '#34D39915', icon: Type },
    'DATETIME': { color: '#FBBF24', bg: '#FBBF2415', icon: Calendar },
    'DATETIME2': { color: '#FBBF24', bg: '#FBBF2415', icon: Calendar },
    'DATE': { color: '#FBBF24', bg: '#FBBF2415', icon: Calendar },
    'TIME': { color: '#FBBF24', bg: '#FBBF2415', icon: Calendar },
    'TIMESTAMP': { color: '#FBBF24', bg: '#FBBF2415', icon: Calendar },
    'SMALLDATETIME': { color: '#FBBF24', bg: '#FBBF2415', icon: Calendar },
    'BIT': { color: '#F472B6', bg: '#F472B615', icon: ToggleLeft },
    'BOOLEAN': { color: '#F472B6', bg: '#F472B615', icon: ToggleLeft },
    'IMAGE': { color: '#FB923C', bg: '#FB923C15', icon: Columns3 },
    'BINARY': { color: '#FB923C', bg: '#FB923C15', icon: Columns3 },
    'VARBINARY': { color: '#FB923C', bg: '#FB923C15', icon: Columns3 },
    'UNIQUEIDENTIFIER': { color: '#38BDF8', bg: '#38BDF815', icon: KeyRound },
};

const getTypeStyle = (typeStr) => {
    const baseType = typeStr.replace(/\(.*\)/, '').trim().toUpperCase();
    return TYPE_STYLES[baseType] || { color: '#94A3B8', bg: '#94A3B815', icon: Columns3 };
};

const DatabaseExplorer = ({ databases, selectedTables, onSelectTable, onPreviewTable }) => {
    const [expandedDbs, setExpandedDbs] = useState({});
    const [expandedSections, setExpandedSections] = useState({});
    const [expandedTableCols, setExpandedTableCols] = useState({});

    const toggleDb = (dbId) => {
        setExpandedDbs(prev => ({ ...prev, [dbId]: !prev[dbId] }));
    };

    const toggleSection = (key) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleTableCols = (key) => {
        setExpandedTableCols(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (!databases || databases.length === 0) {
        return (
            <div className="p-4 text-center text-textMuted/60 text-sm">
                <Database size={32} className="mx-auto mb-3 opacity-30" />
                <p>No databases connected</p>
                <p className="text-xs mt-1">Click the button above to connect</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {databases.map(db => {
                const isExpanded = expandedDbs[db.db_id] !== false; // default expanded
                const tables = db.tables?.filter(t => t.type === 'table') || [];
                const views = db.tables?.filter(t => t.type === 'view') || [];
                const tablesKey = `${db.db_id}-tables`;
                const viewsKey = `${db.db_id}-views`;
                const isTablesExpanded = expandedSections[tablesKey] !== false;
                const isViewsExpanded = expandedSections[viewsKey] !== undefined ? expandedSections[viewsKey] : false;
                const dbSelected = selectedTables[db.db_id] || [];

                return (
                    <div key={db.db_id} className="rounded-xl overflow-hidden border border-surfaceHighlight/50 bg-background/30">
                        {/* Database Header */}
                        <button
                            className="w-full flex items-center gap-2 p-3 hover:bg-surfaceHighlight/30 transition-colors text-left"
                            onClick={() => toggleDb(db.db_id)}
                        >
                            <ChevronRight
                                size={14}
                                className={`text-textMuted transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                            />
                            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                            <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-textMain truncate block">{db.display_name}</span>
                                <span className="text-[10px] text-textMuted/60 uppercase tracking-wider">{db.provider} · {db.db_type}</span>
                            </div>
                            <span className="text-[10px] text-textMuted bg-surfaceHighlight/50 px-2 py-0.5 rounded-full">
                                {tables.length + views.length}
                            </span>
                        </button>

                        {isExpanded && (
                            <div className="pb-2 animate-fade-in">
                                {/* Tables Section */}
                                {tables.length > 0 && (
                                    <div>
                                        <button
                                            className="w-full flex items-center gap-2 px-4 py-1.5 text-xs text-textMuted hover:text-textMain transition-colors"
                                            onClick={() => toggleSection(tablesKey)}
                                        >
                                            <ChevronRight
                                                size={12}
                                                className={`transition-transform duration-200 ${isTablesExpanded ? 'rotate-90' : ''}`}
                                            />
                                            <Table size={12} />
                                            <span className="font-semibold uppercase tracking-wider">Tables</span>
                                            <span className="text-textMuted/50">({tables.length})</span>
                                        </button>

                                        {isTablesExpanded && (
                                            <div className="ml-4 space-y-0.5 animate-fade-in">
                                                {tables.map(table => {
                                                    const tKey = `${db.db_id}-${table.name}`;
                                                    const isColsExpanded = expandedTableCols[tKey];
                                                    const isSelected = dbSelected.includes(table.name);

                                                    return (
                                                        <div key={table.name}>
                                                            <div className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-surfaceHighlight/30 transition-colors group">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => onSelectTable(db.db_id, table.name)}
                                                                    className="w-3.5 h-3.5 rounded text-primary focus:ring-primary/30 bg-background border-surfaceHighlight cursor-pointer"
                                                                />
                                                                <button
                                                                    className="flex items-center gap-1 flex-1 min-w-0 text-left"
                                                                    onClick={() => toggleTableCols(tKey)}
                                                                >
                                                                    <ChevronRight
                                                                        size={10}
                                                                        className={`text-textMuted/50 transition-transform duration-200 shrink-0 ${isColsExpanded ? 'rotate-90' : ''}`}
                                                                    />
                                                                    <span className={`text-xs truncate ${isSelected ? 'text-primary font-medium' : 'text-textMain'}`}>
                                                                        {table.name}
                                                                    </span>
                                                                </button>
                                                                {table.row_count != null && (
                                                                    <span className="text-[9px] text-textMuted/40 mr-1">
                                                                        {table.row_count.toLocaleString()}
                                                                    </span>
                                                                )}
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); onPreviewTable(db.db_id, table.name); }}
                                                                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-primary/20 transition-all text-textMuted hover:text-primary"
                                                                    title="Preview data"
                                                                >
                                                                    <Eye size={12} />
                                                                </button>
                                                            </div>

                                                            {/* Column list */}
                                                            {isColsExpanded && table.columns && (
                                                                <div className="ml-8 py-1 space-y-0.5 animate-fade-in">
                                                                    {table.columns.map(col => {
                                                                        const style = getTypeStyle(col.type);
                                                                        const TypeIcon = style.icon;
                                                                        return (
                                                                            <div
                                                                                key={col.name}
                                                                                className="flex items-center gap-2 px-2 py-0.5 text-[11px] rounded hover:bg-surfaceHighlight/20 transition-colors"
                                                                            >
                                                                                {col.primary_key && (
                                                                                    <KeyRound size={10} className="text-amber-400 shrink-0" />
                                                                                )}
                                                                                <span className="text-textMain/80 truncate flex-1">{col.name}</span>
                                                                                <span
                                                                                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono shrink-0"
                                                                                    style={{ color: style.color, backgroundColor: style.bg }}
                                                                                >
                                                                                    <TypeIcon size={8} />
                                                                                    {col.type.length > 20 ? col.type.slice(0, 20) + '...' : col.type}
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Views Section */}
                                {views.length > 0 && (
                                    <div>
                                        <button
                                            className="w-full flex items-center gap-2 px-4 py-1.5 text-xs text-textMuted hover:text-textMain transition-colors"
                                            onClick={() => toggleSection(viewsKey)}
                                        >
                                            <ChevronRight
                                                size={12}
                                                className={`transition-transform duration-200 ${isViewsExpanded ? 'rotate-90' : ''}`}
                                            />
                                            <Eye size={12} />
                                            <span className="font-semibold uppercase tracking-wider">Views</span>
                                            <span className="text-textMuted/50">({views.length})</span>
                                        </button>

                                        {isViewsExpanded && (
                                            <div className="ml-4 space-y-0.5 animate-fade-in">
                                                {views.map(view => {
                                                    const vKey = `${db.db_id}-${view.name}`;
                                                    const isColsExpanded = expandedTableCols[vKey];
                                                    const isSelected = dbSelected.includes(view.name);

                                                    return (
                                                        <div key={view.name}>
                                                            <div className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-surfaceHighlight/30 transition-colors group">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => onSelectTable(db.db_id, view.name)}
                                                                    className="w-3.5 h-3.5 rounded text-primary focus:ring-primary/30 bg-background border-surfaceHighlight cursor-pointer"
                                                                />
                                                                <button
                                                                    className="flex items-center gap-1 flex-1 min-w-0 text-left"
                                                                    onClick={() => toggleTableCols(vKey)}
                                                                >
                                                                    <ChevronRight
                                                                        size={10}
                                                                        className={`text-textMuted/50 transition-transform duration-200 shrink-0 ${isColsExpanded ? 'rotate-90' : ''}`}
                                                                    />
                                                                    <span className={`text-xs truncate ${isSelected ? 'text-primary font-medium' : 'text-textMain'}`}>
                                                                        {view.name}
                                                                    </span>
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); onPreviewTable(db.db_id, view.name); }}
                                                                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-primary/20 transition-all text-textMuted hover:text-primary"
                                                                    title="Preview data"
                                                                >
                                                                    <Eye size={12} />
                                                                </button>
                                                            </div>

                                                            {isColsExpanded && view.columns && (
                                                                <div className="ml-8 py-1 space-y-0.5 animate-fade-in">
                                                                    {view.columns.map(col => {
                                                                        const style = getTypeStyle(col.type);
                                                                        const TypeIcon = style.icon;
                                                                        return (
                                                                            <div
                                                                                key={col.name}
                                                                                className="flex items-center gap-2 px-2 py-0.5 text-[11px] rounded hover:bg-surfaceHighlight/20 transition-colors"
                                                                            >
                                                                                <span className="text-textMain/80 truncate flex-1">{col.name}</span>
                                                                                <span
                                                                                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono shrink-0"
                                                                                    style={{ color: style.color, backgroundColor: style.bg }}
                                                                                >
                                                                                    <TypeIcon size={8} />
                                                                                    {col.type.length > 20 ? col.type.slice(0, 20) + '...' : col.type}
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default DatabaseExplorer;
