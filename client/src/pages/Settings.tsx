import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import { api } from '../lib/api';
import { useAuth } from '../lib/store';
import { Key, Plus, Trash2, User, CreditCard, ExternalLink } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<any[]>([]);
  const [showAddKey, setShowAddKey] = useState(false);
  const [newKey, setNewKey] = useState({ provider: 'openai', key: '', label: '' });
  const [addingKey, setAddingKey] = useState(false);

  useEffect(() => { loadKeys(); }, []);

  async function loadKeys() {
    try { setKeys(await api.listKeys()); } catch (err) { console.error(err); }
  }

  async function addKey() {
    setAddingKey(true);
    try {
      await api.addKey(newKey);
      setNewKey({ provider: 'openai', key: '', label: '' });
      setShowAddKey(false);
      await loadKeys();
    } catch (err: any) {
      alert('Failed: ' + err.message);
    } finally {
      setAddingKey(false);
    }
  }

  async function deleteKey(id: string) {
    if (!confirm('Delete this API key?')) return;
    try { await api.deleteKey(id); await loadKeys(); } catch (err: any) { alert(err.message); }
  }

  async function openBillingPortal() {
    try {
      const { url } = await api.createPortal();
      window.open(url, '_blank');
    } catch {
      alert('No billing account yet. Subscribe to a plan first.');
    }
  }

  return (
    <AppShell>
      <div className="p-6 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {/* Profile */}
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4"><User className="w-5 h-5 text-brand-500" /> Profile</h2>
          <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-navy-400">Name</span>
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-navy-400">Email</span>
              <span className="text-sm font-medium">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-navy-400">Plan</span>
              <span className="text-sm font-medium capitalize">{user?.tier}</span>
            </div>
          </div>
        </section>

        {/* API Keys */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Key className="w-5 h-5 text-brand-500" /> API Keys</h2>
            <button onClick={() => setShowAddKey(true)}
              className="flex items-center gap-1.5 text-sm bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> Add Key
            </button>
          </div>

          {showAddKey && (
            <div className="bg-navy-800 border border-navy-700 rounded-xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-navy-400 mb-1">Provider</label>
                  <select value={newKey.provider} onChange={e => setNewKey({ ...newKey, provider: e.target.value })}
                    className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-500">
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="google">Google</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-navy-400 mb-1">Label (optional)</label>
                  <input value={newKey.label} onChange={e => setNewKey({ ...newKey, label: e.target.value })}
                    placeholder="e.g. Personal OpenAI"
                    className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-navy-400 mb-1">API Key</label>
                <input type="password" value={newKey.key} onChange={e => setNewKey({ ...newKey, key: e.target.value })}
                  placeholder="sk-..."
                  className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-brand-500" />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAddKey(false)} className="text-sm text-navy-400 hover:text-navy-100 px-3 py-1.5">Cancel</button>
                <button onClick={addKey} disabled={addingKey || !newKey.key}
                  className="text-sm bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg transition-colors">
                  {addingKey ? 'Adding...' : 'Add Key'}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {keys.length === 0 ? (
              <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-6 text-center">
                <Key className="w-8 h-8 text-navy-600 mx-auto mb-2" />
                <p className="text-sm text-navy-400">No API keys added yet. Add one to start running workflows.</p>
              </div>
            ) : keys.map(k => (
              <div key={k.id} className="flex items-center justify-between bg-navy-800/50 border border-navy-700 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    k.provider === 'openai' ? 'bg-green-500/10 text-green-400' :
                    k.provider === 'anthropic' ? 'bg-orange-500/10 text-orange-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>{k.provider}</span>
                  <span className="text-sm">{k.label}</span>
                </div>
                <button onClick={() => deleteKey(k.id)} className="text-navy-500 hover:text-error-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Billing */}
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4"><CreditCard className="w-5 h-5 text-brand-500" /> Billing</h2>
          <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium capitalize">{user?.tier} Plan</div>
                <div className="text-xs text-navy-500">
                  {user?.tier === 'free' ? 'Upgrade to unlock more workflows and runs' : 'Manage your subscription'}
                </div>
              </div>
              {user?.tier === 'free' ? (
                <a href="/pricing" className="text-sm bg-brand-500 hover:bg-brand-600 text-white px-4 py-1.5 rounded-lg transition-colors">
                  Upgrade
                </a>
              ) : (
                <button onClick={openBillingPortal}
                  className="flex items-center gap-1.5 text-sm border border-navy-600 hover:border-navy-500 text-navy-300 px-3 py-1.5 rounded-lg transition-colors">
                  Manage Billing <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
