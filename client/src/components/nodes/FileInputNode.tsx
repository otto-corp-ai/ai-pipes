import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Paperclip } from 'lucide-react';

export default function FileInputNode({ data, selected }: NodeProps) {
  const d = data as Record<string, any>;
  return (
    <div className={`bg-navy-800 border-2 rounded-xl px-4 py-3 min-w-[180px] shadow-lg transition-colors ${
      selected ? 'border-brand-500 shadow-brand-500/20' : 'border-navy-600 hover:border-navy-500'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <Paperclip className="w-4 h-4 text-teal-400" />
        <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">File Input</span>
      </div>
      <div className="font-medium text-sm text-navy-100">{d.label || 'File Input'}</div>
      {d.fileName ? (
        <div className="text-xs text-navy-400 mt-1 truncate max-w-[180px]">
          📄 {d.fileName} <span className="text-navy-500">({(d.fileSize / 1024).toFixed(1)}KB)</span>
        </div>
      ) : (
        <div className="text-xs text-navy-500 mt-1">No file uploaded</div>
      )}
      <Handle type="source" position={Position.Right} className="!bg-brand-500" />
    </div>
  );
}
