import { useCallback, useMemo } from 'react';
import { useNodes } from '@xyflow/react';
import VariablePicker from './VariablePicker';
import VariablePill from './VariablePill';

const NODE_EMOJI: Record<string, string> = {
  ai_model: '🤖',
  text_input: '📝',
  transform: '🔀',
  router: '🔀',
  output: '📤',
  file_input: '📎',
};

interface Props {
  value: string;
  onChange: (value: string) => void;
  currentNodeId: string;
  placeholder?: string;
  rows?: number;
  lastRunResults?: Record<string, string>;
}

/**
 * A textarea that shows variable pills above the raw text editor.
 * Variables in the text ({{nodeId.output}}) are rendered as pills in a preview bar.
 * The actual value is always the raw {{}} syntax for execution.
 */
export default function SmartTextarea({ value, onChange, currentNodeId, placeholder, rows = 4, lastRunResults }: Props) {
  const nodes = useNodes();
  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  // Extract variables from text
  const variables = useMemo(() => {
    const matches: { nodeId: string; full: string }[] = [];
    const regex = /\{\{(\w+)\.output\}\}/g;
    let m;
    while ((m = regex.exec(value)) !== null) {
      matches.push({ nodeId: m[1], full: m[0] });
    }
    return matches;
  }, [value]);

  const handleInsert = useCallback((nodeId: string, _label: string, _emoji: string) => {
    const variable = `{{${nodeId}.output}}`;
    if (!value.includes(variable)) {
      onChange(value ? value + ' ' + variable : variable);
    }
  }, [value, onChange]);

  const handleRemoveVariable = useCallback((full: string) => {
    onChange(value.replace(full, '').replace(/\s{2,}/g, ' ').trim());
  }, [value, onChange]);

  return (
    <div>
      {/* Variable pills */}
      {variables.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5 p-2 bg-navy-900/50 border border-navy-700 rounded-lg">
          {variables.map((v, i) => {
            const node = nodeMap.get(v.nodeId);
            const label = node ? ((node.data as any).label || v.nodeId) : v.nodeId;
            const emoji = node ? (NODE_EMOJI[node.type || ''] || '⚡') : '⚡';
            return (
              <VariablePill
                key={i}
                nodeId={v.nodeId}
                label={label}
                emoji={emoji}
                lastOutput={lastRunResults?.[v.nodeId]}
                onRemove={() => handleRemoveVariable(v.full)}
              />
            );
          })}
        </div>
      )}

      {/* Picker + textarea */}
      <div className="flex items-center gap-1 mb-1">
        <VariablePicker currentNodeId={currentNodeId} onInsert={handleInsert} />
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-500 resize-none"
      />
    </div>
  );
}
