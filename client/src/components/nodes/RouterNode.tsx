import { Handle, Position, type NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export default function RouterNode({ data, selected }: NodeProps) {
  return (
    <div className={`bg-navy-800 border-2 rounded-xl px-4 py-3 min-w-[180px] shadow-lg transition-colors ${
      selected ? 'border-brand-500 shadow-brand-500/20' : 'border-navy-600 hover:border-navy-500'
    }`}>
      <Handle type="target" position={Position.Left} className="!bg-brand-500" />
      <div className="flex items-center gap-2 mb-1">
        <GitBranch className="w-4 h-4 text-green-400" />
        <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Router</span>
      </div>
      <div className="font-medium text-sm text-navy-100">{(data as any).label || 'Router'}</div>
      <div className="text-xs text-navy-500 mt-1">{(data as any).condition?.type || 'contains'}</div>
      <Handle type="source" position={Position.Right} id="true" style={{ top: '35%' }} className="!bg-success-500" />
      <Handle type="source" position={Position.Right} id="false" style={{ top: '65%' }} className="!bg-error-500" />
    </div>
  );
}
