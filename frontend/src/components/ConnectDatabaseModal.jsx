
import React, { useState } from 'react';
import { X, Cloud, Database, Server, ArrowRight, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { connectCloudDB, testConnection } from '../services/api';

const PROVIDERS = [
    {
        id: 'azure',
        name: 'Azure',
        subtitle: 'Azure SQL Database',
        color: '#0078D4',
        gradient: 'from-[#0078D4] to-[#00BCF2]',
        dbTypes: ['mssql', 'postgresql', 'mysql'],
    },
    {
        id: 'aws',
        name: 'AWS',
        subtitle: 'Amazon RDS',
        color: '#FF9900',
        gradient: 'from-[#FF9900] to-[#FFB84D]',
        dbTypes: ['postgresql', 'mysql', 'mssql'],
    },
    {
        id: 'gcp',
        name: 'GCP',
        subtitle: 'Cloud SQL',
        color: '#4285F4',
        gradient: 'from-[#4285F4] to-[#34A853]',
        dbTypes: ['postgresql', 'mysql', 'mssql'],
    },
    {
        id: 'snowflake',
        name: 'Snowflake',
        subtitle: 'Data Cloud',
        color: '#29B5E8',
        gradient: 'from-[#29B5E8] to-[#008BE1]',
        dbTypes: ['snowflake'],
    },
];

const DB_TYPES = {
    postgresql: { name: 'PostgreSQL', defaultPort: 5432, color: '#336791' },
    mysql: { name: 'MySQL', defaultPort: 3306, color: '#4479A1' },
    mssql: { name: 'SQL Server', defaultPort: 1433, color: '#CC2927' },
    snowflake: { name: 'Snowflake', defaultPort: 443, color: '#29B5E8' },
};

const STEPS = ['Provider', 'Database Type', 'Credentials', 'Connect'];

const ConnectDatabaseModal = ({ isOpen, onClose, onConnected }) => {
    const [step, setStep] = useState(0);
    const [provider, setProvider] = useState(null);
    const [dbType, setDbType] = useState(null);
    const [form, setForm] = useState({
        host: '',
        port: '',
        database: '',
        username: '',
        password: '',
        display_name: '',
        encrypt: true,
        trust_server_certificate: false,
        warehouse: '',
        role: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [testStatus, setTestStatus] = useState(null); // null | 'testing' | 'success' | 'failed'
    const [testError, setTestError] = useState('');
    const [connecting, setConnecting] = useState(false);
    const [connectError, setConnectError] = useState('');

    const resetModal = () => {
        setStep(0);
        setProvider(null);
        setDbType(null);
        setForm({
            host: '', port: '', database: '', username: '', password: '',
            display_name: '', encrypt: true, trust_server_certificate: false,
            warehouse: '', role: '',
        });
        setShowPassword(false);
        setTestStatus(null);
        setTestError('');
        setConnecting(false);
        setConnectError('');
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    const selectProvider = (p) => {
        setProvider(p);
        setStep(1);
    };

    const selectDbType = (type) => {
        setDbType(type);
        setForm(prev => ({ ...prev, port: String(DB_TYPES[type].defaultPort) }));
        setStep(2);
    };

    const handleFormChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setTestStatus(null);
        setConnectError('');
    };

    const buildParams = () => ({
        provider: provider.id,
        db_type: dbType,
        host: form.host,
        port: parseInt(form.port, 10),
        database: form.database,
        username: form.username,
        password: form.password,
        display_name: form.display_name || undefined,
        encrypt: form.encrypt,
        trust_server_certificate: form.trust_server_certificate,
        warehouse: form.warehouse || undefined,
        role: form.role || undefined,
    });

    const handleTest = async () => {
        setTestStatus('testing');
        setTestError('');
        try {
            await testConnection(buildParams());
            setTestStatus('success');
        } catch (err) {
            setTestStatus('failed');
            setTestError(err.response?.data?.detail || err.message || 'Connection test failed');
        }
    };

    const handleConnect = async () => {
        setConnecting(true);
        setConnectError('');
        try {
            const result = await connectCloudDB(buildParams());
            setStep(3);
            setTimeout(() => {
                onConnected(result);
                handleClose();
            }, 1500);
        } catch (err) {
            setConnectError(err.response?.data?.detail || err.message || 'Connection failed');
            setConnecting(false);
        }
    };

    const isFormValid = form.host && form.port && form.database && form.username && form.password;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={handleClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-2xl mx-4 bg-surface border border-surfaceHighlight rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-surfaceHighlight">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Cloud className="text-primary" size={22} />
                            Connect Cloud Database
                        </h2>
                        <p className="text-sm text-textMuted mt-1">
                            {STEPS[step]}
                            <span className="text-textMuted/50"> — Step {step + 1} of {STEPS.length}</span>
                        </p>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-lg hover:bg-surfaceHighlight transition-colors text-textMuted hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Step Indicator */}
                <div className="px-6 pt-4">
                    <div className="flex gap-1">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-primary' : 'bg-surfaceHighlight'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 min-h-[320px]">

                    {/* Step 0: Provider Selection */}
                    {step === 0 && (
                        <div className="space-y-4 animate-fade-in">
                            <p className="text-textMuted text-sm mb-4">Select your cloud provider:</p>
                            <div className="grid grid-cols-3 gap-4">
                                {PROVIDERS.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => selectProvider(p)}
                                        className="group relative p-6 rounded-xl border-2 border-surfaceHighlight hover:border-primary/50 bg-background/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center mb-4 mx-auto shadow-lg`}>
                                            <Cloud size={24} className="text-white" />
                                        </div>
                                        <h3 className="text-white font-semibold text-lg">{p.name}</h3>
                                        <p className="text-textMuted text-xs mt-1">{p.subtitle}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 1: Database Type */}
                    {step === 1 && provider && (
                        <div className="space-y-4 animate-fade-in">
                            <p className="text-textMuted text-sm mb-4">
                                Select database engine for <span className="text-primary font-medium">{provider.name}</span>:
                            </p>
                            <div className="grid grid-cols-3 gap-4">
                                {provider.dbTypes.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => selectDbType(type)}
                                        className="group p-5 rounded-xl border-2 border-surfaceHighlight hover:border-primary/50 bg-background/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
                                    >
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 mx-auto" style={{ backgroundColor: DB_TYPES[type].color + '20' }}>
                                            <Database size={20} style={{ color: DB_TYPES[type].color }} />
                                        </div>
                                        <h3 className="text-white font-medium">{DB_TYPES[type].name}</h3>
                                        <p className="text-textMuted text-xs mt-1">Port {DB_TYPES[type].defaultPort}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Credentials Form */}
                    {step === 2 && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm text-textMuted mb-1.5">Server Host</label>
                                    <div className="relative">
                                        <Server size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                                        <input
                                            type="text"
                                            value={form.host}
                                            onChange={e => handleFormChange('host', e.target.value)}
                                            placeholder={dbType === 'snowflake' ? "e.g. xy12345.us-east-1.aws" : "e.g. myserver.database.windows.net"}
                                            className="w-full input-field pl-10"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-textMuted mb-1.5">Port</label>
                                    <input
                                        type="number"
                                        value={form.port}
                                        onChange={e => handleFormChange('port', e.target.value)}
                                        className="w-full input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-textMuted mb-1.5">Database Name</label>
                                    <input
                                        type="text"
                                        value={form.database}
                                        onChange={e => handleFormChange('database', e.target.value)}
                                        placeholder="e.g. northwind"
                                        className="w-full input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-textMuted mb-1.5">Username</label>
                                    <input
                                        type="text"
                                        value={form.username}
                                        onChange={e => handleFormChange('username', e.target.value)}
                                        placeholder="admin"
                                        className="w-full input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-textMuted mb-1.5">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={form.password}
                                            onChange={e => handleFormChange('password', e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full input-field pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm text-textMuted mb-1.5">Display Name <span className="text-textMuted/50">(optional)</span></label>
                                    <input
                                        type="text"
                                        value={form.display_name}
                                        onChange={e => handleFormChange('display_name', e.target.value)}
                                        placeholder="e.g. Northwind Production"
                                        className="w-full input-field"
                                    />
                                </div>

                                {/* Azure SQL specific options */}
                                {dbType === 'mssql' && (
                                    <div className="col-span-2 flex gap-6 p-3 rounded-lg bg-background/30 border border-surfaceHighlight/50">
                                        <label className="flex items-center gap-2 text-sm text-textMuted cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.encrypt}
                                                onChange={e => handleFormChange('encrypt', e.target.checked)}
                                                className="w-4 h-4 rounded text-primary"
                                            />
                                            <Shield size={14} />
                                            Encrypt Connection
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-textMuted cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.trust_server_certificate}
                                                onChange={e => handleFormChange('trust_server_certificate', e.target.checked)}
                                                className="w-4 h-4 rounded text-primary"
                                            />
                                            Trust Server Certificate
                                        </label>
                                    </div>
                                )}

                                {/* Snowflake specific options */}
                                {dbType === 'snowflake' && (
                                    <>
                                        <div>
                                            <label className="block text-sm text-textMuted mb-1.5">Warehouse <span className="text-textMuted/50">(optional)</span></label>
                                            <input
                                                type="text"
                                                value={form.warehouse || ''}
                                                onChange={e => handleFormChange('warehouse', e.target.value)}
                                                placeholder="e.g. COMPUTE_WH"
                                                className="w-full input-field"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-textMuted mb-1.5">Role <span className="text-textMuted/50">(optional)</span></label>
                                            <input
                                                type="text"
                                                value={form.role || ''}
                                                onChange={e => handleFormChange('role', e.target.value)}
                                                placeholder="e.g. ACCOUNTADMIN"
                                                className="w-full input-field"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Test Connection Result */}
                            {testStatus === 'success' && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/30 text-accent text-sm animate-fade-in">
                                    <CheckCircle2 size={18} />
                                    Connection test successful!
                                </div>
                            )}
                            {testStatus === 'failed' && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <span>{testError}</span>
                                </div>
                            )}
                            {connectError && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <span>{connectError}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Success */}
                    {step === 3 && (
                        <div className="flex flex-col items-center justify-center h-full py-12 animate-fade-in">
                            <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                                <CheckCircle2 size={40} className="text-accent" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Connected!</h3>
                            <p className="text-textMuted">Database schema loaded successfully.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step < 3 && (
                    <div className="flex items-center justify-between p-6 border-t border-surfaceHighlight bg-background/30">
                        <button
                            onClick={() => step > 0 ? setStep(step - 1) : handleClose()}
                            className="flex items-center gap-2 text-textMuted hover:text-white transition-colors text-sm"
                        >
                            <ArrowLeft size={16} />
                            {step > 0 ? 'Back' : 'Cancel'}
                        </button>

                        {step === 2 && (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleTest}
                                    disabled={!isFormValid || testStatus === 'testing'}
                                    className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-40"
                                >
                                    {testStatus === 'testing' ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Database size={16} />
                                    )}
                                    Test Connection
                                </button>
                                <button
                                    onClick={handleConnect}
                                    disabled={!isFormValid || connecting}
                                    className="btn-primary flex items-center gap-2 text-sm disabled:opacity-40"
                                >
                                    {connecting ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <ArrowRight size={16} />
                                    )}
                                    Connect
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConnectDatabaseModal;
