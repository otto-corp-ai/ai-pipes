import { X } from 'lucide-react';
import type { Node } from '@xyflow/react';

const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
];

const TRANSFORM_OPS = [
  { id: 'extract_json', name: 'Extract JSON' },
  { id: 'split', name: 'Split Text' },
  { id: 'combine', name: 'Combine' },
  { id: 'format', name: 'Format Template' },
  { id: 'replace', name: 'Find & Replace' },
  { id: 'uppercase', name: 'Uppercase' },
  { id: 'lowercase', name: 'Lowercase' },
  { id: 'trim', name: 'Trim' },
];

const ROUTER_CONDITIONS = [
  { id: 'contains', name: 'Contains' },
  { id: 'equals', name: 'Equals' },
  { id: 'length_gt', name: 'Length Greater Than' },
  { id: 'length_lt', name: 'Length Less Than' },
  { id: 'json_field', name: 'JSON Field Equals' },
];

interface Props {
  node: Node;
  onUpdate: (nodeId: string, data: any) => void;
  onClose: () => void;
}

export default function NodeConfigPanel({ node, onUpdate, onClose }: Props) {
  const data = node.data as Record<string, any>;
  const update = (key: string, value: any) => onUpdate(node.id, { ...data, [key]: value });

  return (
    <div className="w-80 bg-navy-800 border-l border-navy-700 h-full overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-navy-700">
        <h3 className="font-semibold text-sm">Node Settings</h3>
        <button onClick={onClose} className="text-navy-400 hover:text-navy-100"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-4 space-y-4">
        {/* Label - all nodes */}
        <div>
          <label className="block text-xs font-medium text-navy-400 mb-1">Label</label>
          <input value={data.label || ''} onChange={e => update('label', e.target.value)}
            className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-500" />
        </div>

        {/* Text Input */}
        {node.type === 'text_input' && (
          <div>
            <label className="block text-xs font-medium text-navy-400 mb-1">Text Content</label>
            <textarea value={data.text || ''} onChange={e => update('text', e.target.value)} rows={6}
              placeholder="Enter text or use {{input}} for workflow input..."
              className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-500 resize-none" />
            <p className="text-xs text-navy-500 mt-1">Use {'{{input}}'} for workflow input, {'{{nodeId.output}}'} for node outputs</p>
          </div>
        )}

        {/* AI Model */}
        {node.type === 'ai_model' && (
          <>
            <div>
              <label className="block text-xs font-medium text-navy-400 mb-1">Model</label>
              <select value={data.model || 'gpt-4o'} onChange={e => update('model', e.target.value)}
                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-500">
                {MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-400 mb-1">System Prompt</label>
              <textarea value={data.systemPrompt || ''} onChange={e => update('systemPrompt', e.target.value)} rows={3}
                placeholder="You are a helpful assistant..."
                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-400 mb-1">User Prompt</label>
              <textarea value={data.userPrompt || ''} onChange={e => update('userPrompt', e.target.value)} rows={4}
                placeholder="Use {{input}} or {{nodeId.output}} variables..."
                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-400 mb-1">Temperature: {data.temperature ?? 0.7}</label>
              <input type="range" min="0" max="2" step="0.1" value={data.temperature ?? 0.7}
                onChange={e => update('temperature', parseFloat(e.target.value))}
                className="w-full accent-brand-500" />
              <div className="flex justify-between text-xs text-navy-500">
                <span>Precise</span><span>Creative</span><span>Wild</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-400 mb-1">Max Tokens</label>
              <input type="number" value={data.maxTokens ?? 2048} onChange={e => update('maxTokens', parseInt(e.target.value))}
                min={1} max={16384}
                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-500" />
            </div>
          </>
        )}

        {/* Transform */}
        {node.type === 'transform' && (
          <>
            <div>
              <label className="block text-xs font-medium text-navy-400 mb-1">Operation</label>
              <select value={data.operation || 'format'} onChange={e => update('operation', e.target.value)}
                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-500">
                {TRANSFORM_OPS.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
              </select>
            </div>
            {(data.operation === 'format') && (
              <div>
                <label className="block text-xs font-medium text-navy-400 mb-1">Template</label>
                <textarea value={data.template || ''} onChange={e => update('template', e.target.value)} rows={3}
                  placeholder="Use {{value}} for the input text..."
                  className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-500 resize-none" />
              </div>
            )}
            {(data.operation === 'replace') && (
              <>
                <div>
                  <label className="block text-xs font-medium text-navy-400 mb-1">Find</label>
                  <input value={data.find || ''} onChange={e => update('find', e.target.value)}
                    className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-400 mb-1">Replace With</label>
                  <input value={data.replaceWith || ''} onChange={e => update('replaceWith', e.target.value)}
                    className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-500" />
                </div>
              </>
            )}
            {(data.operation === 'extract_json') && (
              <div>
                <label className="block text-xs font-medium text-navy-400 mb-1">JSON Field (optional)</label>
                <input value={data.field || ''} onChange={e => update('field', e.target.value)}
                  placeholder="Leave empty to extract all"
                  className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-500" />
              </div>
            )}
            {(data.operation === 'split') && (
              <div>
                <label className="block text-xs font-medium text-navy-400 mb-1">Delimiter</label>
                <input value={data.delimiter || '\\n'} onChange={e => update('delimiter', e.target.value)}
                  className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-500" />
              </div>
            )}
          </>
        )}

        {/* Router */}
        {node.type === 'router' && (
          <>
            <div>
              <label className="block text-xs font-medium text-navy-400 mb-1">Condition Type</label>
              <select value={data.condition?.type || 'contains'}
                onChange={e => update('condition', { ...data.condition, type: e.target.value })}
                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-500">
                {ROUTER_CONDITIONS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {data.condition?.type === 'json_field' && (
              <div>
                <label className="block text-xs font-medium text-navy-400 mb-1">JSON Field Name</label>
                <input value={data.condition?.field || ''} onChange={e => update('condition', { ...data.condition, field: e.target.value })}
                  className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-500" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-navy-400 mb-1">Value</label>
              <input value={data.condition?.value || ''} onChange={e => update('condition', { ...data.condition, value: e.target.value })}
                placeholder={data.condition?.type === 'length_gt' ? 'e.g. 100' : 'e.g. urgent'}
                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-500" />
            </div>
            <div className="flex items-center gap-4 text-xs text-navy-400">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-success-500" /> True branch</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-error-500" /> False branch</div>
            </div>
          </>
        )}

        {/* Output */}
        {node.type === 'output' && (
          <div>
            <label className="block text-xs font-medium text-navy-400 mb-1">Display Type</label>
            <select value={data.displayType || 'display'} onChange={e => update('displayType', e.target.value)}
              className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-500">
              <option value="display">Display in UI</option>
              <option value="download_txt">Download as TXT</option>
              <option value="download_md">Download as Markdown</option>
              <option value="download_csv">Download as CSV</option>
              <option value="clipboard">Copy to Clipboard</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
