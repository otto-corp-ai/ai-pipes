import { useState, useRef, useEffect } from 'react';
import { useNodes, useEdges } from '@xyflow/react';
import { Plus } from 'lucide-react';

const NODE_EMOJI: Record<string, string> = {
  ai_model: '🤖',
  text_input: '📝',
  transform: '🔀',
  router: '🔀',
  output: '📤',
  file_input: '📎',
};

interface Props {
  currentNodeId: string;
  onInsert: (nodeId: string, label: string, emoji: string) => void;
}

export default function VariablePicker({ currentNodeId, onInsert }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const nodes = useNodes();
  const edges = useEdges();

  // Find all upstream nodes (ancestors) of currentNodeId
  const upstreamIds = new Set<string>();
  function findUpstream(nodeId: string) {
    for (const edge of edges) {
      if (edge.target === nodeId && !upstreamIds.has(edge.source)) {
        upstreamIds.add(edge.source);
        findUpstream(edge.source);
      }
    }
  }
  findUpstream(currentNodeId);

  // Also include all other nodes as potential sources (for flexibility)
  const upstreamNodes = nodes.filter(n => n.id !== currentNodeId && upstreamIds.has(n.id));
  const otherNodes = nodes.filter(n => n.id !== currentNodeId && !upstreamIds.has(n.id));

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as HTMLElement)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors px-1.5 py-0.5 rounded hover:bg-brand-500/10"
        title="Insert variable from another node"
      >
        <Plus className="w-3.5 h-3.5" /> Variable
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-56 bg-navy-800 border border-navy-600 rounded-lg shadow-xl overflow-hidden">
          {upstreamNodes.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-navy-500 uppercase tracking-wider bg-navy-900/50">
                Connected Nodes
              </div>
              {upstreamNodes.map(n => {
                const emoji = NODE_EMOJI[n.type || ''] || '⚡';
                const label = (n.data as any).label || n.id;
                return (
                  <button key={n.id} type="button"
                    onClick={() => { onInsert(n.id, label, emoji); setOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-navy-200 hover:bg-navy-700 transition-colors text-left">
                    <span>{emoji}</span>
                    <span>{label}</span>
                    <span className="text-navy-500 text-xs ml-auto">.output</span>
                  </button>
                );
              })}
            </>
          )}
          {otherNodes.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-navy-500 uppercase tracking-wider bg-navy-900/50 border-t border-navy-700">
                Other Nodes
              </div>
              {otherNodes.map(n => {
                const emoji = NODE_EMOJI[n.type || ''] || '⚡';
                const label = (n.data as any).label || n.id;
                return (
                  <button key={n.id} type="button"
                    onClick={() => { onInsert(n.id, label, emoji); setOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-navy-400 hover:bg-navy-700 transition-colors text-left">
                    <span>{emoji}</span>
                    <span>{label}</span>
                    <span className="text-navy-500 text-xs ml-auto">.output</span>
                  </button>
                );
              })}
            </>
          )}
          {upstreamNodes.length === 0 && otherNodes.length === 0 && (
            <div className="px-3 py-3 text-xs text-navy-500 text-center">
              No other nodes to reference. Add more nodes to your workflow.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
