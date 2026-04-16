import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import ResultsPanel from './components/ResultsPanel';
import ConnectDatabaseModal from './components/ConnectDatabaseModal';
import TablePreviewModal from './components/TablePreviewModal';
import { disconnectDB, chatWithData } from './services/api';

function App() {
  // Database state
  const [databases, setDatabases] = useState([]);
  const [selectedTables, setSelectedTables] = useState({}); // {db_id: ["table1", ...]}
  
  // UI state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [previewTarget, setPreviewTarget] = useState(null); // {dbId, tableName}
  
  // Chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);

  // Determine the active database for chat (first one with selected tables, or first connected)
  const getActiveDatabaseId = () => {
    // Prefer DB with selected tables
    for (const [dbId, tables] of Object.entries(selectedTables)) {
      if (tables.length > 0 && databases.find(d => d.db_id === dbId)) {
        return dbId;
      }
    }
    // Fallback to first connected
    return databases.length > 0 ? databases[0].db_id : null;
  };

  const handleConnected = (result) => {
    // result has: db_id, display_name, provider, db_type, tables, message
    setDatabases(prev => [...prev, {
      db_id: result.db_id,
      display_name: result.display_name,
      provider: result.provider,
      db_type: result.db_type,
      tables: result.tables,
    }]);
  };

  const handleDisconnect = async (dbId) => {
    try {
      await disconnectDB(dbId);
      setDatabases(prev => prev.filter(d => d.db_id !== dbId));
      setSelectedTables(prev => {
        const next = { ...prev };
        delete next[dbId];
        return next;
      });
    } catch (error) {
      console.error("Disconnect failed", error);
    }
  };

  const handleSelectTable = (dbId, tableName) => {
    setSelectedTables(prev => {
      const current = prev[dbId] || [];
      const updated = current.includes(tableName)
        ? current.filter(t => t !== tableName)
        : [...current, tableName];
      return { ...prev, [dbId]: updated };
    });
  };

  const handlePreviewTable = (dbId, tableName) => {
    setPreviewTarget({ dbId, tableName });
  };

  const handleSendMessage = async (userQuery) => {
    const activeDbId = getActiveDatabaseId();
    if (!activeDbId) {
      alert("Please connect a database first.");
      return;
    }

    const activeSelected = selectedTables[activeDbId] || [];

    // Optimistic UI update
    setChatHistory(prev => [...prev, { role: 'user', text: userQuery }]);
    setIsProcessing(true);

    try {
      const response = await chatWithData(userQuery, activeDbId, activeSelected);
      setChatHistory(prev => [...prev, { role: 'bot', text: response.explanation }]);
      setCurrentResult(response);
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || "An error occurred";
      setChatHistory(prev => [...prev, { role: 'bot', text: `Error: ${errorMsg}` }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const activeDbId = getActiveDatabaseId();
  const activeDb = databases.find(d => d.db_id === activeDbId);
  const activeSelectedCount = activeDbId ? (selectedTables[activeDbId] || []).length : 0;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar
        databases={databases}
        selectedTables={selectedTables}
        onSelectTable={handleSelectTable}
        onPreviewTable={handlePreviewTable}
        onOpenConnectModal={() => setShowConnectModal(true)}
        onDisconnect={handleDisconnect}
      />
      <div className="flex-1 flex flex-col" style={{ width: 'calc(100% - 288px)' }}>
        {/* Active DB indicator bar */}
        {activeDb && (
          <div className="h-10 bg-surface/50 border-b border-surfaceHighlight flex items-center px-6 gap-4 text-xs shrink-0">
            <span className="text-textMuted">Active:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-textMain font-medium">{activeDb.display_name}</span>
            </span>
            {activeSelectedCount > 0 && (
              <span className="text-textMuted">
                · {activeSelectedCount} table{activeSelectedCount !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
        )}
        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 min-w-[400px]">
            <ChatPanel
              history={chatHistory}
              onSendMessage={handleSendMessage}
              isProcessing={isProcessing}
            />
          </div>
          <ResultsPanel currentResult={currentResult} />
        </div>
      </div>

      {/* Modals */}
      <ConnectDatabaseModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnected={handleConnected}
      />
      <TablePreviewModal
        isOpen={!!previewTarget}
        dbId={previewTarget?.dbId}
        tableName={previewTarget?.tableName}
        onClose={() => setPreviewTarget(null)}
      />
    </div>
  );
}

export default App;
