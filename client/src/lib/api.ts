const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body && typeof options.body === 'string') headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  register: (data: { email: string; password: string; name: string }) =>
    request<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/auth/me'),

  // Workflows
  listWorkflows: () => request<any[]>('/workflows'),
  getWorkflow: (id: string) => request<any>(`/workflows/${id}`),
  createWorkflow: (data: any) => request<any>('/workflows', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkflow: (id: string, data: any) => request<any>(`/workflows/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWorkflow: (id: string) => request<any>(`/workflows/${id}`, { method: 'DELETE' }),
  runWorkflow: (id: string, input: string) =>
    request<any>(`/workflows/${id}/run`, { method: 'POST', body: JSON.stringify({ input }) }),
  getWorkflowRuns: (id: string) => request<any[]>(`/workflows/${id}/runs`),

  // Templates
  listTemplates: () => request<any[]>('/workflows/templates/list'),
  cloneTemplate: (id: string) => request<any>(`/workflows/templates/${id}/clone`, { method: 'POST' }),

  // API Keys
  listKeys: () => request<any[]>('/keys'),
  addKey: (data: { provider: string; key: string; label?: string }) =>
    request<any>('/keys', { method: 'POST', body: JSON.stringify(data) }),
  deleteKey: (id: string) => request<any>(`/keys/${id}`, { method: 'DELETE' }),

  // Models
  listModels: () => request<any[]>('/models'),

  // Billing
  getPlans: () => request<any[]>('/billing/plans'),
  createCheckout: (planId: string) =>
    request<{ url: string }>('/billing/checkout', { method: 'POST', body: JSON.stringify({ planId }) }),
  createPortal: () => request<{ url: string }>('/billing/portal', { method: 'POST' }),
};
