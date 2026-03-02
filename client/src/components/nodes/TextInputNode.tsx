import { Handle, Position, type NodeProps } from '@xyflow/react';
import { FileText } from 'lucide-react';

export default function TextInputNode({ data, selected }: NodeProps) {
  return (
    <div className={`bg-navy-800 border-2 rounded-xl px-4 py-3 min-w-[180px] shadow-lg transition-colors ${
      selected ? 'border-brand-500 shadow-brand-500/20' : 'border-navy-600 hover:border-navy-500'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <FileText className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Text Input</span>
      </div>
      <div className="font-medium text-sm text-navy-100">{(data as any).label || 'Text Input'}</div>
      {(data as any).text && <div className="text-xs text-navy-500 mt-1 truncate max-w-[180px]">{(data as any).text}</div>}
      <Handle type="source" position={Position.Right} className="!bg-brand-500" />
    </div>
  );
}
