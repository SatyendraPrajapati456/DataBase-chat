import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Globe,
  Zap,
  Bot,
  Brain,
  Flame,
  Layers,
  Terminal,
  Cpu,
  Sliders,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { testAIProvider } from '../services/api';

export const AI_PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Generous limits, multimodal intelligence & high speed',
    badge: 'Recommended',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    category: 'cloud',
    icon: Sparkles,
    requiresKey: true,
    keyPlaceholder: 'AIzaSy...',
    keyHelpUrl: 'https://aistudio.google.com/app/apikey',
    keyHelpText: 'Get free API key at Google AI Studio',
    defaultModel: 'gemini-2.5-flash',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Ultra Fast & State-of-the-art)', badge: 'Default' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Deep Reasoning & Complex SQL Synthesis)', badge: 'Reasoning' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Proven Production Grade)', badge: 'Stable' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (2M Token Context & Exhaustive Schema Analysis)', badge: '2M Context' },
      { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B (Lightweight High Throughput)', badge: '8B' },
    ],
    defaultBaseUrl: '',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Industry benchmark GPT-4o and reasoning models',
    badge: 'Popular',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    category: 'cloud',
    icon: Globe,
    requiresKey: true,
    keyPlaceholder: 'sk-proj-...',
    keyHelpUrl: 'https://platform.openai.com/api-keys',
    keyHelpText: 'Get API key from OpenAI Platform',
    defaultModel: 'gpt-4o-mini',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast & Cost Efficient)' },
      { id: 'gpt-4o', name: 'GPT-4o (Flagship Omni Model)' },
      { id: 'o3-mini', name: 'o3-mini (Advanced Reasoning & SQL)' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    ],
    defaultBaseUrl: 'https://api.openai.com/v1',
  },
  {
    id: 'grok',
    name: 'xAI Grok',
    description: 'State of the art reasoning & real-time analytics from xAI',
    badge: 'xAI',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    category: 'cloud',
    icon: Zap,
    requiresKey: true,
    keyPlaceholder: 'xai-...',
    keyHelpUrl: 'https://console.x.ai/',
    keyHelpText: 'Get API key from xAI Console',
    defaultModel: 'grok-2-latest',
    models: [
      { id: 'grok-2-latest', name: 'Grok 2 Latest (Flagship frontier model)' },
      { id: 'grok-beta', name: 'Grok Beta' },
      { id: 'grok-2-vision-latest', name: 'Grok 2 Vision' },
    ],
    defaultBaseUrl: 'https://api.x.ai/v1',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude 3.5 Sonnet known for exceptional coding and SQL precision',
    badge: 'Claude',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    category: 'cloud',
    icon: Bot,
    requiresKey: true,
    keyPlaceholder: 'sk-ant-api03-...',
    keyHelpUrl: 'https://console.anthropic.com/settings/keys',
    keyHelpText: 'Get API key from Anthropic Console',
    defaultModel: 'claude-3-5-sonnet-20241022',
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Best Coding & SQL)' },
      { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet (Hybrid Reasoning)' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (Fast & Lightweight)' },
    ],
    defaultBaseUrl: '',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'High-performance DeepSeek-V3 and R1 reasoning models',
    badge: 'Economical',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    category: 'cloud',
    icon: Brain,
    requiresKey: true,
    keyPlaceholder: 'sk-...',
    keyHelpUrl: 'https://platform.deepseek.com/api_keys',
    keyHelpText: 'Get API key from DeepSeek Platform',
    defaultModel: 'deepseek-chat',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek-V3 (Chat & SQL)' },
      { id: 'deepseek-reasoner', name: 'DeepSeek-R1 (Deep Reasoning)' },
    ],
    defaultBaseUrl: 'https://api.deepseek.com',
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    description: 'Blazing fast inference speed running on LPUs',
    badge: 'Lightning Fast',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    category: 'cloud',
    icon: Flame,
    requiresKey: true,
    keyPlaceholder: 'gsk_...',
    keyHelpUrl: 'https://console.groq.com/keys',
    keyHelpText: 'Get free API key at Groq Console',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
    ],
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access 200+ models from all top providers with a single key',
    badge: 'Multi-Model',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    category: 'cloud',
    icon: Layers,
    requiresKey: true,
    keyPlaceholder: 'sk-or-v1-...',
    keyHelpUrl: 'https://openrouter.ai/keys',
    keyHelpText: 'Get API key from OpenRouter.ai',
    defaultModel: 'openai/gpt-4o-mini',
    models: [
      { id: 'openai/gpt-4o-mini', name: 'OpenAI GPT-4o Mini' },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Meta Llama 3.3 70B' },
      { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (via OpenRouter)' },
    ],
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    description: 'Run private open-weights models offline on your machine with 0 cost',
    badge: 'Local / Offline',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    category: 'local',
    icon: Terminal,
    requiresKey: false,
    keyPlaceholder: 'Not needed (leave blank)',
    keyHelpText: 'Make sure Ollama is running (`ollama run llama3.2` or `ollama serve`)',
    defaultModel: 'llama3.2',
    models: [
      { id: 'llama3.2', name: 'Llama 3.2 (Default)' },
      { id: 'qwen2.5-coder', name: 'Qwen 2.5 Coder (Exceptional SQL)' },
      { id: 'mistral', name: 'Mistral 7B' },
      { id: 'deepseek-r1:8b', name: 'DeepSeek R1 8B' },
      { id: 'codellama', name: 'CodeLlama' },
    ],
    defaultBaseUrl: 'http://localhost:11434/v1',
  },
  {
    id: 'lmstudio',
    name: 'LM Studio (Local)',
    description: 'Connect to LM Studio local server with GPU acceleration and GUI',
    badge: 'Local / Offline',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    category: 'local',
    icon: Cpu,
    requiresKey: false,
    keyPlaceholder: 'Not needed (leave blank)',
    keyHelpText: 'Start the Local Server on port 1234 in LM Studio Developer tab',
    defaultModel: 'default',
    models: [
      { id: 'default', name: 'Currently Loaded Model in LM Studio' },
    ],
    defaultBaseUrl: 'http://localhost:1234/v1',
  },
  {
    id: 'custom',
    name: 'Custom OpenAI-Compatible',
    description: 'vLLM, LocalAI, TGI, or custom corporate AI proxy endpoint',
    badge: 'Self-Hosted',
    badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    category: 'local',
    icon: Sliders,
    requiresKey: false,
    keyPlaceholder: 'Bearer token or custom key (optional)',
    keyHelpText: 'Endpoint providing standard /v1/chat/completions',
    defaultModel: 'default',
    models: [
      { id: 'default', name: 'Default Model' },
    ],
    defaultBaseUrl: 'http://localhost:8080/v1',
  },
];

const STORAGE_KEY = 'dataChat_ai_settings_v1';

export const getStoredAISettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse AI settings from localStorage', err);
  }

  // Sensible defaults
  return {
    activeProvider: 'gemini',
    keys: {},
    models: {
      gemini: 'gemini-2.5-flash',
      openai: 'gpt-4o-mini',
      grok: 'grok-2-latest',
      anthropic: 'claude-3-5-sonnet-20241022',
      deepseek: 'deepseek-chat',
      groq: 'llama-3.3-70b-versatile',
      openrouter: 'openai/gpt-4o-mini',
      ollama: 'llama3.2',
      lmstudio: 'default',
      custom: 'default',
    },
    baseUrls: {
      ollama: 'http://localhost:11434/v1',
      lmstudio: 'http://localhost:1234/v1',
      custom: 'http://localhost:8080/v1',
    },
  };
};

const AISettingsModal = ({ isOpen, onClose, onSave, activeConfig }) => {
  const [settings, setSettings] = useState(getStoredAISettings);
  const [selectedProviderId, setSelectedProviderId] = useState(settings.activeProvider || 'gemini');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'cloud', 'local'

  // Test state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: bool, message: str, latency: num }
  const [saveToast, setSaveToast] = useState(false);

  // Sync state when provider changes
  useEffect(() => {
    const p = AI_PROVIDERS.find((item) => item.id === selectedProviderId) || AI_PROVIDERS[0];
    const savedKey = settings.keys?.[selectedProviderId] || '';
    const savedModel = settings.models?.[selectedProviderId] || p.defaultModel;
    const isPresetModel = p.models.some((m) => m.id === savedModel);

    setApiKey(savedKey);
    if (isPresetModel) {
      setSelectedModel(savedModel);
      setCustomModel('');
    } else {
      setSelectedModel('__custom__');
      setCustomModel(savedModel);
    }

    const savedBaseUrl = settings.baseUrls?.[selectedProviderId] || p.defaultBaseUrl || '';
    setBaseUrl(savedBaseUrl);
    setTestResult(null);
  }, [selectedProviderId, settings]);

  if (!isOpen) return null;

  const currentProvider = AI_PROVIDERS.find((p) => p.id === selectedProviderId) || AI_PROVIDERS[0];
  const IconComponent = currentProvider.icon;

  const effectiveModel = selectedModel === '__custom__' ? customModel.trim() : selectedModel;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const testPayload = {
      provider: selectedProviderId,
      api_key: apiKey.trim() || undefined,
      model: effectiveModel || undefined,
      base_url: baseUrl.trim() || undefined,
    };

    try {
      const res = await testAIProvider(testPayload);
      setTestResult({
        success: res.success,
        message: res.message,
        latency: res.latency_ms,
      });
    } catch (err) {
      const errDetail = err.response?.data?.detail || err.message || 'Verification failed';
      setTestResult({
        success: false,
        message: errDetail,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const finalModel = selectedModel === '__custom__' ? (customModel.trim() || currentProvider.defaultModel) : selectedModel;

    const newSettings = {
      ...settings,
      activeProvider: selectedProviderId,
      keys: {
        ...settings.keys,
        [selectedProviderId]: apiKey.trim(),
      },
      models: {
        ...settings.models,
        [selectedProviderId]: finalModel,
      },
      baseUrls: {
        ...settings.baseUrls,
        [selectedProviderId]: baseUrl.trim() || currentProvider.defaultBaseUrl || '',
      },
    };

    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }

    const exportedConfig = {
      provider: selectedProviderId,
      api_key: apiKey.trim() || undefined,
      model: finalModel,
      base_url: baseUrl.trim() || currentProvider.defaultBaseUrl || undefined,
    };

    if (onSave) {
      onSave(exportedConfig);
    }

    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 400);
  };

  const filteredProviders = AI_PROVIDERS.filter((p) => {
    if (categoryFilter === 'all') return true;
    return p.category === categoryFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-surface border border-surfaceHighlight rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-surfaceHighlight flex items-center justify-between bg-surface/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                AI Provider & Model Settings
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  BYOK & Local Models
                </span>
              </h2>
              <p className="text-xs text-textMuted mt-0.5">
                Choose your AI engine, enter your private API key, or connect to local models (Ollama, LM Studio).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-textMuted hover:text-white hover:bg-surfaceHighlight transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body (Two columns) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Provider List */}
          <div className="w-72 border-r border-surfaceHighlight flex flex-col bg-background/30 shrink-0">
            {/* Filter Tabs */}
            <div className="p-3 border-b border-surfaceHighlight/50 flex gap-1.5 shrink-0">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-surfaceHighlight text-white'
                    : 'text-textMuted hover:text-textMain'
                }`}
              >
                All ({AI_PROVIDERS.length})
              </button>
              <button
                onClick={() => setCategoryFilter('cloud')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                  categoryFilter === 'cloud'
                    ? 'bg-surfaceHighlight text-white'
                    : 'text-textMuted hover:text-textMain'
                }`}
              >
                Cloud AI
              </button>
              <button
                onClick={() => setCategoryFilter('local')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                  categoryFilter === 'local'
                    ? 'bg-surfaceHighlight text-white'
                    : 'text-textMuted hover:text-textMain'
                }`}
              >
                Local Models
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {filteredProviders.map((provider) => {
                const ItemIcon = provider.icon;
                const isSelected = provider.id === selectedProviderId;
                const hasConfiguredKey = !!settings.keys?.[provider.id];
                const isLocal = provider.category === 'local';

                return (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedProviderId(provider.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 border ${
                      isSelected
                        ? 'bg-primary/10 border-primary/40 text-white shadow-sm'
                        : 'border-transparent hover:bg-surface/60 text-textMuted hover:text-textMain'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-primary text-white shadow-md shadow-primary/30'
                          : 'bg-surfaceHighlight/50 text-textMuted'
                      }`}
                    >
                      <ItemIcon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-xs truncate text-textMain">{provider.name}</span>
                        {hasConfiguredKey && !isLocal && (
                          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" title="API Key configured" />
                        )}
                      </div>
                      <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded border mt-1 ${provider.badgeColor}`}>
                        {provider.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Security note */}
            <div className="p-3 border-t border-surfaceHighlight/50 text-[10px] text-textMuted flex items-center gap-1.5 bg-surface/30">
              <ShieldCheck size={14} className="text-accent shrink-0" />
              <span>Keys stored strictly in your browser (LocalStorage)</span>
            </div>
          </div>

          {/* Right Column: Configuration Form */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-surface/50">
            {/* Provider Banner */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-surfaceHighlight">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner">
                <IconComponent size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{currentProvider.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${currentProvider.badgeColor}`}>
                    {currentProvider.badge}
                  </span>
                </div>
                <p className="text-xs text-textMuted mt-1 leading-relaxed">{currentProvider.description}</p>
              </div>
            </div>

            {/* API Key Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-textMain uppercase tracking-wider flex items-center gap-1.5">
                  <span>API Key</span>
                  {!currentProvider.requiresKey ? (
                    <span className="text-[10px] font-normal text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                      Not Required (Local)
                    </span>
                  ) : (
                    <span className="text-[10px] font-normal text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded border border-rose-400/20">
                      Required
                    </span>
                  )}
                </label>

                {currentProvider.keyHelpUrl && (
                  <a
                    href={currentProvider.keyHelpUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <span>{currentProvider.keyHelpText}</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={currentProvider.keyPlaceholder}
                  className="w-full bg-background border border-surfaceHighlight rounded-xl px-4 py-2.5 text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-white p-1"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {currentProvider.keyHelpText && !currentProvider.keyHelpUrl && (
                <p className="text-[11px] text-textMuted">{currentProvider.keyHelpText}</p>
              )}
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-textMain uppercase tracking-wider">
                Select Model
              </label>

              <div className="grid grid-cols-1 gap-2">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-background border border-surfaceHighlight rounded-xl px-4 py-2.5 text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                >
                  {currentProvider.models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                  <option value="__custom__">⚙️ Custom / Other Model...</option>
                </select>

                {selectedModel === '__custom__' && (
                  <div className="pt-2 animate-slide-up">
                    <label className="text-[11px] text-textMuted block mb-1">Enter custom model identifier</label>
                    <input
                      type="text"
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                      placeholder="e.g. deepseek-ai/DeepSeek-V3 or qwen2.5-coder:14b"
                      className="w-full bg-background border border-surfaceHighlight rounded-xl px-4 py-2 text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Base URL (For Local Models, Grok, or Custom) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-textMain uppercase tracking-wider flex items-center justify-between">
                <span>API Endpoint / Base URL</span>
                <span className="text-[10px] font-normal text-textMuted">
                  {currentProvider.category === 'local' ? 'Required for local host' : 'Optional override'}
                </span>
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={currentProvider.defaultBaseUrl || 'Default provider URL'}
                className="w-full bg-background border border-surfaceHighlight rounded-xl px-4 py-2 text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all font-mono text-xs"
              />
              <p className="text-[11px] text-textMuted">
                {currentProvider.id === 'ollama' && 'Default Ollama endpoint is http://localhost:11434/v1.'}
                {currentProvider.id === 'lmstudio' && 'Default LM Studio endpoint is http://localhost:1234/v1.'}
                {currentProvider.category === 'cloud' && 'Leave blank to use the official cloud API endpoint.'}
              </p>
            </div>

            {/* Test Connection Button & Result Alert */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || (currentProvider.requiresKey && !apiKey.trim())}
                  className="px-4 py-2 rounded-xl bg-surfaceHighlight hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-2 transition-all active:scale-95 border border-surfaceHighlight"
                >
                  {isTesting ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-primary" />
                      <span>Verifying Provider...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={14} className="text-amber-400" />
                      <span>Test Provider Connection</span>
                    </>
                  )}
                </button>

                <span className="text-[11px] text-textMuted">
                  Sends a lightweight test ping to ensure your key and model are responsive.
                </span>
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-3 animate-slide-up ${
                    testResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs flex-1">
                    <p className="font-semibold">{testResult.message}</p>
                    {testResult.latency && (
                      <p className="text-[11px] opacity-80 mt-0.5">Response Latency: {testResult.latency} ms</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surfaceHighlight flex items-center justify-between bg-surface/90 shrink-0">
          <div className="flex items-center gap-2 text-xs text-textMuted">
            <span>Active:</span>
            <span className="font-semibold text-textMain capitalize">{currentProvider.name}</span>
            <span>·</span>
            <span className="font-mono text-primary text-[11px]">{effectiveModel || currentProvider.defaultModel}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-textMuted hover:text-white hover:bg-surfaceHighlight text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl btn-primary text-xs font-semibold flex items-center gap-2 shadow-lg shadow-primary/25"
            >
              {saveToast ? (
                <>
                  <Check size={14} />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save & Apply Settings</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISettingsModal;
