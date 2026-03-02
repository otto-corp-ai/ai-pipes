import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { api } from '../lib/api';
import { Plus, Play, Trash2, Clock, Zap } from 'lucide-react';

export default function Dashboard() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadWorkflows(); }, []);

  async function loadWorkflows() {
    try {
      const data = await api.listWorkflows();
      setWorkflows(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function createWorkflow() {
    try {
      const wf = await api.createWorkflow({
        name: 'Untitled Workflow',
        canvasData: { nodes: [], edges: [] },
      });
      navigate(`/workflow/${wf.id}`);
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function deleteWorkflow(id: string) {
    if (!confirm('Delete this workflow?')) return;
    try {
      await api.deleteWorkflow(id);
      setWorkflows(w => w.filter(wf => wf.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <AppShell>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Workflows</h1>
            <p className="text-navy-400 text-sm mt-1">{workflows.length} workflow{workflows.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={createWorkflow}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> New Workflow
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
          </div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-20 bg-navy-800/50 border border-navy-700 rounded-xl">
            <Zap className="w-12 h-12 text-navy-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No workflows yet</h3>
            <p className="text-navy-400 text-sm mb-6">Create your first AI pipeline or start from a template.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={createWorkflow} className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Create Workflow
              </button>
              <Link to="/templates" className="border border-navy-600 hover:border-navy-500 text-navy-300 px-4 py-2 rounded-lg text-sm transition-colors">
                Browse Templates
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {workflows.map(wf => (
              <div key={wf.id} className="bg-navy-800/50 border border-navy-700 rounded-xl p-4 hover:border-navy-600 transition-colors group">
                <div className="flex items-center justify-between">
                  <Link to={`/workflow/${wf.id}`} className="flex-1">
                    <h3 className="font-medium hover:text-brand-400 transition-colors">{wf.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-navy-500">
                      <span className={`px-2 py-0.5 rounded-full ${
                        wf.status === 'active' ? 'bg-success-500/10 text-success-500' :
                        wf.status === 'draft' ? 'bg-navy-700 text-navy-400' : 'bg-warning-500/10 text-warning-500'
                      }`}>{wf.status}</span>
                      {wf.lastRunAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last run: {new Date(wf.lastRunAt).toLocaleDateString()}
                        </span>
                      )}
                      <span>{wf.runCount || 0} runs</span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/workflow/${wf.id}/runs`} className="text-navy-400 hover:text-navy-100 p-1.5 rounded-lg hover:bg-navy-700 transition-colors" title="Run history">
                      <Play className="w-4 h-4" />
                    </Link>
                    <button onClick={() => deleteWorkflow(wf.id)} className="text-navy-400 hover:text-error-500 p-1.5 rounded-lg hover:bg-navy-700 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
