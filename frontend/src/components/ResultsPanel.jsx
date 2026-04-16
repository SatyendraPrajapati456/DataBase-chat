import React, { useState } from 'react';
import { Terminal, DatabaseZap, Code, Table as TableIcon, Activity } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ResultsPanel = ({ currentResult }) => {
    const [showSql, setShowSql] = useState(false);

    if (!currentResult) {
        return (
            <div className="flex-1 bg-background flex flex-col items-center justify-center text-textMuted/50 p-8">
                <DatabaseZap size={64} className="mb-4 opacity-50 text-surfaceHighlight" />
                <p className="text-xl font-medium">No results to display</p>
                <p className="text-sm mt-2 text-center max-w-sm">
                    Select a database and tables, then ask a question to see the analytical results here.
                </p>
            </div>
        );
    }

    const { sql_generated, data, chart_type } = currentResult;
    const hasData = data && data.data && data.data.length > 0;

    return (
        <div className="flex-1 flex flex-col bg-background h-full overflow-hidden">
            {/* Header / Tabs */}
            <div className="h-16 border-b border-surfaceHighlight flex items-center justify-between px-6 bg-surface/50">
                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowSql(false)}
                        className={`font-semibold flex items-center gap-2 pb-1 border-b-2 transition-all ${!showSql ? 'text-primary border-primary' : 'text-textMuted border-transparent hover:text-textMain'}`}
                    >
                        <Activity size={18} />
                        Visualization
                    </button>
                    <button 
                        onClick={() => setShowSql(true)}
                        className={`font-semibold flex items-center gap-2 pb-1 border-b-2 transition-all ${showSql ? 'text-primary border-primary' : 'text-textMuted border-transparent hover:text-textMain'}`}
                    >
                        <Code size={18} />
                        Generated SQL
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-background custom-scrollbar">
                {showSql ? (
                    <div className="animate-fade-in glass-panel p-6">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-surfaceHighlight/50 text-accent font-medium">
                            <Terminal size={20} />
                            <span>Safe SQL Query Execution</span>
                        </div>
                        <pre className="font-mono text-sm text-textMain bg-black/30 p-4 rounded-lg overflow-x-auto border border-surfaceHighlight">
                            <code className="text-primary">{sql_generated}</code>
                        </pre>
                        <p className="mt-4 text-sm text-textMuted">
                            Note: Safety filters like SELECT-only and LIMIT have been automatically applied.
                        </p>
                    </div>
                ) : (
                    <div className="h-full flex flex-col gap-6 animate-fade-in">
                        {/* Chart Area */}
                        {hasData && (chart_type === 'bar' || chart_type === 'line') && (
                            <div className="glass-panel p-6 flex-1 min-h-[300px] flex flex-col">
                                <h3 className="text-lg font-medium text-textMain mb-4">Chart View</h3>
                                <div className="flex-1 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        {chart_type === 'bar' ? (
                                            <BarChart data={data.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                                <XAxis dataKey={data.columns[0]} stroke="#94A3B8" tick={{fill: '#94A3B8'}} />
                                                <YAxis stroke="#94A3B8" tick={{fill: '#94A3B8'}} />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px' }}
                                                    itemStyle={{ color: '#F1F5F9' }}
                                                />
                                                <Bar dataKey={data.columns[1]} fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        ) : (
                                            <LineChart data={data.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                                <XAxis dataKey={data.columns[0]} stroke="#94A3B8" tick={{fill: '#94A3B8'}} />
                                                <YAxis stroke="#94A3B8" tick={{fill: '#94A3B8'}} />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px' }}
                                                    itemStyle={{ color: '#F1F5F9' }}
                                                />
                                                <Line type="monotone" dataKey={data.columns[1]} stroke="#10B981" strokeWidth={3} dot={{r: 4, fill: '#10B981'}} />
                                            </LineChart>
                                        )}
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Table Area */}
                        {hasData && (
                            <div className="glass-panel overflow-hidden flex flex-col shadow-lg">
                                <div className="p-4 border-b border-surfaceHighlight bg-surface/50 flex items-center gap-2">
                                     <TableIcon size={18} className="text-primary"/>
                                     <h3 className="font-medium text-textMain">Raw Data</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-textMuted uppercase bg-black/20">
                                            <tr>
                                                {data.columns.map(col => (
                                                    <th key={col} className="px-6 py-3 font-semibold tracking-wider">
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.data.map((row, i) => (
                                                <tr key={i} className="border-b border-surfaceHighlight/30 hover:bg-surfaceHighlight/20 transition-colors">
                                                    {data.columns.map(col => (
                                                        <td key={col} className="px-6 py-4 text-textMain">
                                                            {row[col]}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        
                        {!hasData && (
                            <div className="p-6 text-center text-textMuted">
                                No data rows returned for this query.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultsPanel;
