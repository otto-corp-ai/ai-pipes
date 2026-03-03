import { X } from 'lucide-react';

interface Props {
  nodeId: string;
  label: string;
  emoji: string;
  lastOutput?: string;
  onRemove?: () => void;
}

export default function VariablePill({ label, emoji, lastOutput, onRemove }: Props) {
  return (
    <span className="group relative inline-flex items-center gap-1 bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-full px-2 py-0.5 text-xs font-medium cursor-default mx-0.5">
      <span>{emoji}</span>
      <span>{label}</span>
      {onRemove && (
        <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 hover:text-brand-100">
          <X className="w-3 h-3" />
        </button>
      )}
      {/* Tooltip on hover */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-64 max-h-32 overflow-auto">
        <span className="block bg-navy-700 border border-navy-600 rounded-lg p-2 text-xs text-navy-200 font-mono whitespace-pre-wrap shadow-xl">
          {lastOutput
            ? lastOutput.slice(0, 300) + (lastOutput.length > 300 ? '…' : '')
            : 'No output yet — run the workflow first'}
        </span>
      </span>
    </span>
  );
}
