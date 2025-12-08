const API_URL = 'https://el-refugio-api-server.onrender.com';

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint}`);
    if (!res.ok) throw new Error(`Error GET ${endpoint}`);
    return res.json();
  },
  post: async (endpoint: string, data: any) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Error POST ${endpoint}`);
    return res.json();
  },
  // ESTA ES LA FUNCIÓN QUE FALTABA:
  put: async (endpoint: string, data: any) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Error PUT ${endpoint}`);
    return res.json();
  }
};