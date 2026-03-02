import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { api } from '../lib/api';
import { ArrowLeft, Clock, DollarSign, Zap, ChevronDown, ChevronRight } from 'lucide-react';

export default function RunHistory() {
  const { id } = useParams<{ id: string }>();
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { loadRuns(); }, [id]);

  async function loadRuns() {
    try {
      const data = await api.getWorkflowRuns(id!);
      setRuns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Link to={`/workflow/${id}`} className="text-navy-400 hover:text-navy-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Run History</h1>
            <p className="text-navy-400 text-sm">{runs.length} run{runs.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
          </div>
        ) : runs.length === 0 ? (
          <div className="text-center py-20 bg-navy-800/50 border border-navy-700 rounded-xl">
            <Clock className="w-12 h-12 text-navy-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No runs yet</h3>
            <p className="text-navy-400 text-sm">Run your workflow to see history here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {runs.map(run => (
              <div key={run.id} className="bg-navy-800/50 border border-navy-700 rounded-xl overflow-hidden">
                <button onClick={() => setExpanded(expanded === run.id ? null : run.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-navy-800 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className={`text-lg ${run.status === 'completed' ? '' : ''}`}>
                      {run.status === 'completed' ? '✅' : run.status === 'failed' ? '❌' : '⏳'}
                    </span>
                    <div className="text-left">
                      <div className="text-sm font-medium">{run.status}</div>
                      <div className="text-xs text-navy-500">{new Date(run.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 text-xs text-navy-400">
                      {run.durationMs && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{(run.durationMs / 1000).toFixed(1)}s</span>}
                      {run.totalCost > 0 && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${run.totalCost.toFixed(4)}</span>}
                      {run.totalTokens > 0 && <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{run.totalTokens} tok</span>}
                    </div>
                    {expanded === run.id ? <ChevronDown className="w-4 h-4 text-navy-400" /> : <ChevronRight className="w-4 h-4 text-navy-400" />}
                  </div>
                </button>
                {expanded === run.id && (
                  <div className="border-t border-navy-700 p-4 space-y-2">
                    {run.inputData?.input && (
                      <div className="bg-navy-900 rounded-lg p-3">
                        <div className="text-xs font-medium text-navy-400 mb-1">Input</div>
                        <div className="text-sm text-navy-300 whitespace-pre-wrap">{run.inputData.input}</div>
                      </div>
                    )}
                    {(run.nodeResults || []).map((nr: any, i: number) => (
                      <div key={i} className={`rounded-lg border p-3 text-sm ${
                        nr.status === 'error' ? 'border-error-500/30 bg-error-500/5' : 'border-navy-700 bg-navy-900'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">
                            {nr.status === 'success' ? '✅' : nr.status === 'error' ? '❌' : '⏭️'} {nr.nodeName}
                          </span>
                          <span className="text-xs text-navy-500">{nr.durationMs}ms {nr.cost > 0 && `• $${nr.cost.toFixed(4)}`}</span>
                        </div>
                        {nr.error && <div className="text-error-500 text-xs">{nr.error}</div>}
                        {nr.output && <div className="text-navy-300 text-xs mt-1 whitespace-pre-wrap max-h-32 overflow-auto font-mono bg-navy-800 rounded p-2">{nr.output}</div>}
                      </div>
                    ))}
                    {run.outputData?.output && (
                      <div className="bg-brand-500/5 border border-brand-500/20 rounded-lg p-3">
                        <div className="text-xs font-medium text-brand-400 mb-1">Final Output</div>
                        <div className="text-sm text-navy-200 whitespace-pre-wrap">{run.outputData.output}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
