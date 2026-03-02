import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Shuffle } from 'lucide-react';

export default function TransformNode({ data, selected }: NodeProps) {
  return (
    <div className={`bg-navy-800 border-2 rounded-xl px-4 py-3 min-w-[180px] shadow-lg transition-colors ${
      selected ? 'border-brand-500 shadow-brand-500/20' : 'border-navy-600 hover:border-navy-500'
    }`}>
      <Handle type="target" position={Position.Left} className="!bg-brand-500" />
      <div className="flex items-center gap-2 mb-1">
        <Shuffle className="w-4 h-4 text-amber-400" />
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Transform</span>
      </div>
      <div className="font-medium text-sm text-navy-100">{(data as any).label || 'Transform'}</div>
      <div className="text-xs text-navy-500 mt-1">{(data as any).operation || 'format'}</div>
      <Handle type="source" position={Position.Right} className="!bg-brand-500" />
    </div>
  );
}
