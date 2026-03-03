import { useState, useCallback } from 'react';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import type { Node } from '@xyflow/react';
import { useParams } from 'react-router-dom';
import SmartTextarea from './SmartTextarea';
import { api } from '../lib/api';

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

const ACCEPTED_FILE_TYPES = '.pdf,.docx,.csv,.txt,.md,.png,.jpg,.jpeg,.gif,.webp,.mp3,.wav,.m4a';

interface Props {
  node: Node;
  onUpdate: (nodeId: string, data: any) => void;
  onClose: () => void;
}

export default function NodeConfigPanel({ node, onUpdate, onClose }: Props) {
  const { id: workflowId } = useParams<{ id: string }>();
  const data = node.data as Record<string, any>;
  const update = (key: string, value: any) => onUpdate(node.id, { ...data, [key]: value });
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!workflowId) return;
    setUploading(true);
    try {
      const result = await api.uploadFile(workflowId, file);
      onUpdate(node.id, {
        ...data,
        filePath: result.path,
        fileName: result.originalName,
        fileSize: result.size,
        fileMimeType: result.mimeType,
        fileType: result.type,
        textPreview: result.textPreview,
        columns: result.columns,
        rowCount: result.rowCount,
        pages: result.pages,
      });
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }, [workflowId, node.id, data, onUpdate]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

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
            <SmartTextarea
              value={data.text || ''}
              onChange={v => update('text', v)}
              currentNodeId={node.id}
              placeholder="Enter text or use variables from other nodes..."
              rows={6}
            />
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
              <SmartTextarea
                value={data.systemPrompt || ''}
                onChange={v => update('systemPrompt', v)}
                currentNodeId={node.id}
                placeholder="You are a helpful assistant..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-400 mb-1">User Prompt</label>
              <SmartTextarea
                value={data.userPrompt || ''}
                onChange={v => update('userPrompt', v)}
                currentNodeId={node.id}
                placeholder="Click + Variable to reference other nodes..."
                rows={4}
              />
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
                <SmartTextarea
                  value={data.template || ''}
                  onChange={v => update('template', v)}
                  currentNodeId={node.id}
                  placeholder="Use {{value}} for the input text..."
                  rows={3}
                />
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

        {/* File Input */}
        {node.type === 'file_input' && (
          <>
            {/* Upload area */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                dragOver ? 'border-brand-500 bg-brand-500/10' : 'border-navy-600 hover:border-navy-500'
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2 text-navy-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-xs">Processing file...</span>
                </div>
              ) : data.fileName ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="w-6 h-6 text-teal-400" />
                  <div className="text-sm text-navy-200 font-medium">{data.fileName}</div>
                  <div className="text-xs text-navy-500">
                    {(data.fileSize / 1024).toFixed(1)}KB • {data.fileType?.toUpperCase()}
                    {data.pages ? ` • ${data.pages} pages` : ''}
                    {data.rowCount ? ` • ${data.rowCount} rows` : ''}
                  </div>
                  <label className="text-xs text-brand-400 hover:text-brand-300 cursor-pointer">
                    Replace file
                    <input type="file" accept={ACCEPTED_FILE_TYPES} className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 cursor-pointer text-navy-400 hover:text-navy-300">
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">Drop a file here or click to browse</span>
                  <span className="text-[10px] text-navy-500">PDF, DOCX, CSV, TXT, Images, Audio</span>
                  <input type="file" accept={ACCEPTED_FILE_TYPES} className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
                </label>
              )}
            </div>

            {/* Supported formats */}
            <div className="flex flex-wrap gap-1">
              {['PDF', 'DOCX', 'CSV', 'TXT', 'IMG', 'Audio'].map(f => (
                <span key={f} className="text-[10px] bg-navy-900 text-navy-500 px-1.5 py-0.5 rounded">{f}</span>
              ))}
            </div>

            {/* Text preview */}
            {data.textPreview && (
              <div>
                <label className="block text-xs font-medium text-navy-400 mb-1">Content Preview</label>
                <div className="bg-navy-900 border border-navy-700 rounded-lg p-2 text-xs text-navy-300 font-mono max-h-32 overflow-auto whitespace-pre-wrap">
                  {data.textPreview}
                </div>
              </div>
            )}

            {/* CSV options */}
            {data.fileType === 'csv' && (
              <>
                {data.columns && data.columns.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-navy-400 mb-1">Columns</label>
                    <div className="flex flex-wrap gap-1">
                      {data.columns.map((col: string) => (
                        <span key={col} className="text-[10px] bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded">{col}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="loopMode" checked={data.loopMode || false}
                    onChange={e => update('loopMode', e.target.checked)}
                    className="accent-brand-500" />
                  <label htmlFor="loopMode" className="text-xs text-navy-300">Process each row separately</label>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
