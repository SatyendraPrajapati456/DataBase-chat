import React, { useState, useEffect, useCallback } from 'react';
import { X, Table as TableIcon, Loader2, Hash, ChevronUp, ChevronDown } from 'lucide-react';
import { getTablePreview } from '../services/api';

const TablePreviewModal = ({ isOpen, dbId, tableName, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(null);
    const [sortCol, setSortCol] = useState(null);
    const [sortDir, setSortDir] = useState('asc');

    const fetchPreview = useCallback(async () => {
        if (!dbId || !tableName) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getTablePreview(dbId, tableName);
            setPreview(data);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to load preview');
        } finally {
            setLoading(false);
        }
    }, [dbId, tableName]);

    useEffect(() => {
        if (isOpen) {
            fetchPreview();
            setSortCol(null);
            setSortDir('asc');
        }
    }, [isOpen, fetchPreview]);

    // Close on ESC
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    const handleSort = (col) => {
        if (sortCol === col) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortCol(col);
            setSortDir('asc');
        }
    };

    const getSortedData = () => {
        if (!preview?.data || !sortCol) return preview?.data || [];
        return [...preview.data].sort((a, b) => {
            const valA = a[sortCol];
            const valB = b[sortCol];
            if (valA == null && valB == null) return 0;
            if (valA == null) return 1;
            if (valB == null) return -1;
            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortDir === 'asc' ? valA - valB : valB - valA;
            }
            const strA = String(valA);
            const strB = String(valB);
            return sortDir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div
                className="relative w-full max-w-5xl max-h-[85vh] mx-4 bg-surface border border-surfaceHighlight rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-surfaceHighlight shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <TableIcon size={20} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{tableName}</h2>
                            {preview && (
                                <p className="text-xs text-textMuted flex items-center gap-3 mt-0.5">
                                    <span className="flex items-center gap-1">
                                        <Hash size={10} />
                                        {preview.total_rows?.toLocaleString()} total rows
                                    </span>
                                    <span>·</span>
                                    <span>{preview.columns?.length} columns</span>
                                    <span>·</span>
                                    <span>Showing first {preview.data?.length || 0}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-surfaceHighlight transition-colors text-textMuted hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                    {loading && (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 size={32} className="animate-spin text-primary" />
                            <span className="ml-3 text-textMuted">Loading preview...</span>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center justify-center h-64 text-red-400 p-6 text-center">
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && !error && preview && (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-textMuted uppercase bg-background/50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-3 py-3 text-center w-12 font-semibold">#</th>
                                    {preview.columns.map((col, i) => (
                                        <th
                                            key={col}
                                            className="px-4 py-3 font-semibold cursor-pointer hover:text-primary transition-colors select-none whitespace-nowrap"
                                            onClick={() => handleSort(col)}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <span>{col}</span>
                                                {preview.column_types?.[i] && (
                                                    <span className="text-[9px] font-mono text-textMuted/40 normal-case">
                                                        {preview.column_types[i].length > 15
                                                            ? preview.column_types[i].slice(0, 15) + '…'
                                                            : preview.column_types[i]}
                                                    </span>
                                                )}
                                                {sortCol === col && (
                                                    sortDir === 'asc'
                                                        ? <ChevronUp size={12} className="text-primary" />
                                                        : <ChevronDown size={12} className="text-primary" />
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {getSortedData().map((row, rowIdx) => (
                                    <tr
                                        key={rowIdx}
                                        className="border-b border-surfaceHighlight/20 hover:bg-surfaceHighlight/15 transition-colors"
                                    >
                                        <td className="px-3 py-2.5 text-center text-textMuted/40 text-xs">{rowIdx + 1}</td>
                                        {preview.columns.map(col => {
                                            const val = row[col];
                                            const isNull = val === null || val === undefined;
                                            return (
                                                <td key={col} className="px-4 py-2.5 text-textMain max-w-[300px] truncate">
                                                    {isNull ? (
                                                        <span className="text-textMuted/30 italic text-xs">NULL</span>
                                                    ) : (
                                                        String(val)
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {!loading && !error && preview?.data?.length === 0 && (
                        <div className="flex items-center justify-center h-64 text-textMuted">
                            This table is empty.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TablePreviewModal;
