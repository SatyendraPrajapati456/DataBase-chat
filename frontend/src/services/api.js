import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
});

// ── Connection ─────────────────────────────────────────────

export const connectCloudDB = async (params) => {
    const response = await api.post('/connect/cloud', params);
    return response.data;
};

export const testConnection = async (params) => {
    const response = await api.post('/connect/test', params);
    return response.data;
};

export const getActiveConnections = async () => {
    const response = await api.get('/connect/active');
    return response.data;
};

export const disconnectDB = async (dbId) => {
    const response = await api.delete(`/connect/${dbId}`);
    return response.data;
};

// ── Schema & Metadata ──────────────────────────────────────

export const getDatabases = async () => {
    const response = await api.get('/databases');
    return response.data;
};

export const getDatabaseSchema = async (dbId) => {
    const response = await api.get(`/databases/${dbId}/schema`);
    return response.data;
};

export const getTablePreview = async (dbId, tableName, limit = 50) => {
    const response = await api.get(`/databases/${dbId}/tables/${tableName}/preview`, {
        params: { limit }
    });
    return response.data;
};

export const getTableInfo = async (dbId, tableName) => {
    const response = await api.get(`/databases/${dbId}/tables/${tableName}/info`);
    return response.data;
};

export const refreshSchema = async (dbId) => {
    const response = await api.post(`/databases/${dbId}/refresh-schema`);
    return response.data;
};

// ── Chat ───────────────────────────────────────────────────

export const chatWithData = async (userQuery, dbId, selectedTables) => {
    const response = await api.post('/chat/', {
        user_query: userQuery,
        db_id: dbId,
        selected_tables: selectedTables,
    });
    return response.data;
};
