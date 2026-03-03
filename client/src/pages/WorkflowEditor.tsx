import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState,
  type Connection, type Edge, type Node,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { api } from '../lib/api';
import AIModelNode from '../components/nodes/AIModelNode';
import TextInputNode from '../components/nodes/TextInputNode';
import TransformNode from '../components/nodes/TransformNode';
import RouterNode from '../components/nodes/RouterNode';
import OutputNode from '../components/nodes/OutputNode';
import FileInputNode from '../components/nodes/FileInputNode';
import NodeConfigPanel from '../components/NodeConfigPanel';
import { ArrowLeft, Save, Play, Brain, FileText, Shuffle, GitBranch, Download, Clock, ChevronDown, ChevronUp, X, Sparkles, Paperclip } from 'lucide-react';

const nodeTypes = {
  ai_model: AIModelNode,
  text_input: TextInputNode,
  transform: TransformNode,
  router: RouterNode,
  output: OutputNode,
  file_input: FileInputNode,
};

const PALETTE = [
  { type: 'text_input', label: 'Text Input', icon: FileText, color: 'text-blue-400' },
  { type: 'file_input', label: 'File Input', icon: Paperclip, color: 'text-teal-400' },
  { type: 'ai_model', label: 'AI Model', icon: Brain, color: 'text-purple-400' },
  { type: 'transform', label: 'Transform', icon: Shuffle, color: 'text-amber-400' },
  { type: 'router', label: 'Router', icon: GitBranch, color: 'text-green-400' },
  { type: 'output', label: 'Output', icon: Download, color: 'text-cyan-400' },
];

let nodeIdCounter = 0;

function Editor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [, setWorkflow] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [runInput, setRunInput] = useState('');
  const [showRunInput, setShowRunInput] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadWorkflow();
  }, [id]);

  async function loadWorkflow() {
    try {
      const wf = await api.getWorkflow(id!);
      setWorkflow(wf);
      setWorkflowName(wf.name);
      if (wf.canvasData?.nodes) {
        setNodes(wf.canvasData.nodes);
        nodeIdCounter = wf.canvasData.nodes.length;
      }
      if (wf.canvasData?.edges) setEdges(wf.canvasData.edges);
    } catch {
      navigate('/dashboard');
    }
  }

  const onConnect = useCallback((params: Connection) => {
    setEdges(eds => addEdge({ ...params, animated: true, style: { stroke: '#6366f1' } }, eds));

    // Auto-wire: if target is an AI Model node, append variable reference to user prompt
    if (params.source && params.target) {
      setNodes(nds => {
        const targetNode = nds.find(n => n.id === params.target);
        const sourceNode = nds.find(n => n.id === params.source);
        if (targetNode?.type === 'ai_model' && sourceNode) {
          const currentPrompt = (targetNode.data as any).userPrompt || '';
          const variable = `{{${sourceNode.id}.output}}`;
          if (!currentPrompt.includes(variable)) {
            return nds.map(n => n.id === params.target ? {
              ...n,
              data: { ...n.data, userPrompt: currentPrompt ? `${currentPrompt}\n\n${variable}` : variable }
            } : n);
          }
        }
        return nds;
      });
    }
  }, []);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  function onDragOver(event: React.DragEvent) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type || !reactFlowWrapper.current) return;

    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = {
      x: event.clientX - bounds.left - 100,
      y: event.clientY - bounds.top - 30,
    };

    const defaults: Record<string, any> = {
      ai_model: { label: 'AI Model', model: 'gpt-4o', temperature: 0.7, maxTokens: 2048, systemPrompt: '', userPrompt: '' },
      text_input: { label: 'Text Input', text: '{{input}}' },
      file_input: { label: 'File Input', filePath: '', fileName: '', fileSize: 0, fileType: '', loopMode: false },
      transform: { label: 'Transform', operation: 'format' },
      router: { label: 'Router', condition: { type: 'contains', value: '' } },
      output: { label: 'Output', displayType: 'display' },
    };

    const newNode: Node = {
      id: `node_${++nodeIdCounter}_${Date.now()}`,
      type,
      position,
      data: defaults[type] || { label: type },
    };

    setNodes(nds => [...nds, newNode]);
  }

  function updateNodeData(nodeId: string, data: any) {
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data } : n));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(prev => prev ? { ...prev, data } : null);
    }
  }

  async function save() {
    setSaving(true);
    try {
      await api.updateWorkflow(id!, {
        name: workflowName,
        canvasData: { nodes, edges },
      });
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function run() {
    if (!showRunInput) {
      setShowRunInput(true);
      return;
    }
    setRunning(true);
    setShowRunInput(false);
    try {
      // Save first
      await api.updateWorkflow(id!, { name: workflowName, canvasData: { nodes, edges } });
      const result = await api.runWorkflow(id!, runInput);
      setRunResult(result);
      setShowResults(true);
    } catch (err: any) {
      alert('Run failed: ' + err.message);
    } finally {
      setRunning(false);
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); run(); }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [nodes, edges, workflowName, runInput]);

  return (
    <div className="h-screen flex flex-col bg-navy-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-navy-700 bg-navy-800 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-navy-400 hover:text-navy-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Sparkles className="w-5 h-5 text-brand-500" />
          <input value={workflowName} onChange={e => setWorkflowName(e.target.value)}
            className="bg-transparent border-none text-lg font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 rounded px-1 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/workflow/${id}/runs`} className="flex items-center gap-1.5 text-navy-400 hover:text-navy-100 text-sm px-3 py-1.5 rounded-lg hover:bg-navy-700 transition-colors">
            <Clock className="w-4 h-4" /> History
          </Link>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-1.5 text-navy-300 hover:text-navy-100 text-sm px-3 py-1.5 rounded-lg border border-navy-600 hover:border-navy-500 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={run} disabled={running}
            className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm px-4 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50">
            <Play className="w-4 h-4" /> {running ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      {/* Run Input Modal */}
      {showRunInput && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setShowRunInput(false)}>
          <div className="bg-navy-800 border border-navy-700 rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold mb-3">Workflow Input</h3>
            <textarea value={runInput} onChange={e => setRunInput(e.target.value)} rows={4}
              placeholder="Enter the input for your workflow..."
              className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 resize-none mb-4" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowRunInput(false)} className="px-4 py-2 text-sm text-navy-400 hover:text-navy-100 transition-colors">Cancel</button>
              <button onClick={run} className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Play className="w-4 h-4 inline mr-1" /> Run Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Node Palette */}
        <div className="w-48 bg-navy-800/80 border-r border-navy-700 p-3 shrink-0">
          <div className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-3">Nodes</div>
          <div className="space-y-2">
            {PALETTE.map(item => (
              <div key={item.type}
                draggable
                onDragStart={e => { e.dataTransfer.setData('application/reactflow', item.type); e.dataTransfer.effectAllowed = 'move'; }}
                className="flex items-center gap-2 px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg cursor-grab active:cursor-grabbing hover:border-navy-500 transition-colors text-sm">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-navy-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[16, 16]}
            deleteKeyCode={['Backspace', 'Delete']}
            className="bg-navy-900"
          >
            <Background color="#334155" gap={16} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(n) => {
                const colors: Record<string, string> = { ai_model: '#a855f7', text_input: '#60a5fa', file_input: '#2dd4bf', transform: '#fbbf24', router: '#34d399', output: '#22d3ee' };
                return colors[n.type || ''] || '#64748b';
              }}
              maskColor="rgba(15, 23, 42, 0.8)"
            />
          </ReactFlow>
        </div>

        {/* Config Panel */}
        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={updateNodeData}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>

      {/* Run Results Panel */}
      {runResult && (
        <div className={`border-t border-navy-700 bg-navy-800 transition-all ${showResults ? 'h-72' : 'h-10'}`}>
          <button onClick={() => setShowResults(!showResults)}
            className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium hover:bg-navy-700/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className={runResult.status === 'completed' ? 'text-success-500' : 'text-error-500'}>
                {runResult.status === 'completed' ? '✅' : '❌'} Run {runResult.status}
              </span>
              <span className="text-navy-500">
                {runResult.durationMs ? `${(runResult.durationMs / 1000).toFixed(1)}s` : ''} • ${runResult.totalCost?.toFixed(4) || '0.0000'}
                {runResult.totalTokens ? ` • ${runResult.totalTokens} tokens` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); setRunResult(null); }} className="text-navy-500 hover:text-navy-300">
                <X className="w-4 h-4" />
              </button>
              {showResults ? <ChevronDown className="w-4 h-4 text-navy-400" /> : <ChevronUp className="w-4 h-4 text-navy-400" />}
            </div>
          </button>
          {showResults && (
            <div className="overflow-auto h-[calc(100%-40px)] px-4 pb-4">
              <div className="space-y-2">
                {(runResult.nodeResults || []).map((nr: any, i: number) => (
                  <div key={i} className={`rounded-lg border p-3 text-sm ${
                    nr.status === 'success' ? 'border-navy-700 bg-navy-900' :
                    nr.status === 'error' ? 'border-error-500/30 bg-error-500/5' :
                    'border-navy-700/50 bg-navy-900/50 opacity-50'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">
                        {nr.status === 'success' ? '✅' : nr.status === 'error' ? '❌' : '⏭️'} {nr.nodeName}
                        <span className="text-navy-500 ml-2 text-xs">{nr.nodeType}</span>
                      </span>
                      <span className="text-xs text-navy-500">
                        {nr.durationMs}ms {nr.cost > 0 ? `• $${nr.cost.toFixed(4)}` : ''} {nr.inputTokens + nr.outputTokens > 0 ? `• ${nr.inputTokens + nr.outputTokens} tok` : ''}
                      </span>
                    </div>
                    {nr.error && <div className="text-error-500 text-xs mt-1">{nr.error}</div>}
                    {nr.output && <div className="text-navy-300 text-xs mt-1 whitespace-pre-wrap max-h-24 overflow-auto font-mono bg-navy-800 rounded p-2">{nr.output}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WorkflowEditor() {
  return (
    <ReactFlowProvider>
      <Editor />
    </ReactFlowProvider>
  );
}
