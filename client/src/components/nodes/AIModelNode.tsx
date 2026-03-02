import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Brain } from 'lucide-react';

export default function AIModelNode({ data, selected }: NodeProps) {
  return (
    <div className={`bg-navy-800 border-2 rounded-xl px-4 py-3 min-w-[200px] shadow-lg transition-colors ${
      selected ? 'border-brand-500 shadow-brand-500/20' : 'border-navy-600 hover:border-navy-500'
    }`}>
      <Handle type="target" position={Position.Left} className="!bg-brand-500" />
      <div className="flex items-center gap-2 mb-1">
        <Brain className="w-4 h-4 text-purple-400" />
        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">AI Model</span>
      </div>
      <div className="font-medium text-sm text-navy-100">{(data as any).label || 'AI Model'}</div>
      <div className="text-xs text-navy-500 mt-1">{(data as any).model || 'gpt-4o'}</div>
      <Handle type="source" position={Position.Right} className="!bg-brand-500" />
    </div>
  );
}
