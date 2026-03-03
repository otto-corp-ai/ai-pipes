import { callAI } from './ai-providers';
import { estimateCost, getProviderForModel } from '../lib/costs';
import { decrypt } from '../lib/encryption';
import { db } from '../db';
import { apiKeys } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { processFile, transcribeAudio } from './file-processor';

interface FlowNode {
  id: string;
  type: string;
  data: Record<string, any>;
  position: { x: number; y: number };
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

interface NodeResult {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: 'success' | 'error' | 'skipped';
  input: string;
  output: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  durationMs: number;
  error?: string;
}

interface ExecutionResult {
  status: 'completed' | 'failed';
  nodeResults: NodeResult[];
  totalTokens: number;
  totalCost: number;
  durationMs: number;
  output: string;
  errorMessage?: string;
  errorNodeId?: string;
}

function topologicalSort(nodes: FlowNode[], edges: FlowEdge[]): string[] {
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  
  for (const node of nodes) {
    graph.set(node.id, []);
    inDegree.set(node.id, 0);
  }
  
  for (const edge of edges) {
    graph.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }
  
  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }
  
  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    for (const neighbor of graph.get(current) || []) {
      const newDegree = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }
  
  return sorted;
}

function resolveVariables(text: string, outputs: Map<string, string>, input: string): string {
  if (!text) return '';
  let resolved = text.replace(/\{\{input\}\}/g, input);
  resolved = resolved.replace(/\{\{(\w+)\.output\}\}/g, (_, nodeId) => {
    return outputs.get(nodeId) || `{{${nodeId}.output}}`;
  });
  resolved = resolved.replace(/\{\{(\w+)\.output\.(\w+)\}\}/g, (_, nodeId, field) => {
    const out = outputs.get(nodeId);
    if (!out) return `{{${nodeId}.output.${field}}}`;
    try {
      const parsed = JSON.parse(out);
      return String(parsed[field] ?? '');
    } catch {
      return out;
    }
  });
  resolved = resolved.replace(/\{\{run\.timestamp\}\}/g, new Date().toISOString());
  return resolved;
}

async function getUserApiKey(userId: string, provider: string): Promise<string> {
  const keys = await db.select().from(apiKeys)
    .where(and(eq(apiKeys.userId, userId), eq(apiKeys.provider, provider), eq(apiKeys.isActive, true)))
    .limit(1);
  if (keys.length === 0) {
    throw new Error(`No ${provider} API key found. Add one in Settings → API Keys.`);
  }
  return decrypt(keys[0].encryptedKey);
}

function executeTransform(operation: string, input: string, config: Record<string, any>): string {
  switch (operation) {
    case 'extract_json': {
      try {
        const parsed = JSON.parse(input);
        const field = config.field || '';
        return field ? JSON.stringify(parsed[field]) : input;
      } catch {
        const match = input.match(/```json\s*([\s\S]*?)\s*```/);
        return match ? match[1] : input;
      }
    }
    case 'split': {
      const delimiter = config.delimiter || '\n';
      return JSON.stringify(input.split(delimiter));
    }
    case 'combine': {
      return input; // input already combined from resolved variables
    }
    case 'format': {
      const template = config.template || '{{value}}';
      return template.replace(/\{\{value\}\}/g, input);
    }
    case 'replace': {
      const find = config.find || '';
      const replaceWith = config.replaceWith || '';
      return input.replaceAll(find, replaceWith);
    }
    case 'uppercase':
      return input.toUpperCase();
    case 'lowercase':
      return input.toLowerCase();
    case 'trim':
      return input.trim();
    default:
      return input;
  }
}

function evaluateRouterCondition(condition: Record<string, any>, input: string): boolean {
  const { type, value } = condition;
  switch (type) {
    case 'contains':
      return input.toLowerCase().includes((value || '').toLowerCase());
    case 'equals':
      return input.trim() === (value || '').trim();
    case 'length_gt':
      return input.length > (Number(value) || 0);
    case 'length_lt':
      return input.length < (Number(value) || 0);
    case 'json_field': {
      try {
        const parsed = JSON.parse(input);
        return String(parsed[condition.field]) === value;
      } catch {
        return false;
      }
    }
    default:
      return true;
  }
}

export async function executeWorkflow(
  userId: string,
  canvasData: { nodes: FlowNode[]; edges: FlowEdge[] },
  input: string
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const { nodes, edges } = canvasData;
  const sortedIds = topologicalSort(nodes, edges);
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const outputs = new Map<string, string>();
  const nodeResults: NodeResult[] = [];
  let totalTokens = 0;
  let totalCost = 0;
  let finalOutput = '';
  
  // Build parent map for variable resolution
  const parentMap = new Map<string, string[]>();
  for (const edge of edges) {
    const parents = parentMap.get(edge.target) || [];
    parents.push(edge.source);
    parentMap.set(edge.target, parents);
  }
  
  // Track which router branches are active
  const skippedNodes = new Set<string>();

  for (const nodeId of sortedIds) {
    const node = nodeMap.get(nodeId);
    if (!node) continue;
    if (skippedNodes.has(nodeId)) {
      nodeResults.push({
        nodeId, nodeName: node.data.label || nodeId, nodeType: node.type,
        status: 'skipped', input: '', output: '', inputTokens: 0, outputTokens: 0, cost: 0, durationMs: 0,
      });
      continue;
    }
    
    const nodeStart = Date.now();
    
    // Get input from parent nodes
    const parents = parentMap.get(nodeId) || [];
    const parentOutputs = parents.map(p => outputs.get(p) || '').filter(Boolean);
    const nodeInput = parentOutputs.length > 0 ? parentOutputs.join('\n\n') : input;
    
    try {
      let output = '';
      let inputTokens = 0;
      let outputTokens = 0;
      let cost = 0;
      
      switch (node.type) {
        case 'file_input': {
          const filePath = node.data.filePath;
          if (!filePath) {
            output = '[No file uploaded]';
            break;
          }
          const result = await processFile(filePath, node.data.fileName || 'file', node.data.fileMimeType || 'text/plain');
          // Audio transcription if we have an OpenAI key
          if (result.type === 'audio') {
            try {
              const key = await getUserApiKey(userId, 'openai');
              result.text = await transcribeAudio(filePath, key);
            } catch {
              result.text = '[Audio transcription failed - no OpenAI API key configured]';
            }
          }
          // CSV loop mode: output JSON array of rows
          if (result.rows && node.data.loopMode) {
            output = JSON.stringify(result.rows);
          } else if (result.base64) {
            // Images: output base64 for downstream vision models
            output = result.base64;
          } else {
            output = result.text;
          }
          break;
        }
        case 'text_input': {
          output = resolveVariables(node.data.text || node.data.content || input, outputs, input);
          break;
        }
        case 'ai_model': {
          const model = node.data.model || 'gpt-4o-mini';
          const provider = getProviderForModel(model);
          const apiKey = await getUserApiKey(userId, provider);
          const systemPrompt = resolveVariables(node.data.systemPrompt || 'You are a helpful assistant.', outputs, input);
          const userPrompt = resolveVariables(node.data.userPrompt || nodeInput, outputs, input);
          
          const result = await callAI(provider, apiKey, {
            model,
            systemPrompt,
            userPrompt,
            temperature: node.data.temperature ?? 0.7,
            maxTokens: node.data.maxTokens ?? 2048,
          });
          
          output = result.output;
          inputTokens = result.inputTokens;
          outputTokens = result.outputTokens;
          cost = estimateCost(model, inputTokens, outputTokens);
          break;
        }
        case 'transform': {
          const operation = node.data.operation || 'format';
          output = executeTransform(operation, resolveVariables(node.data.inputText || nodeInput, outputs, input), node.data);
          break;
        }
        case 'router': {
          const condition = node.data.condition || { type: 'contains', value: '' };
          const testInput = resolveVariables(node.data.inputText || nodeInput, outputs, input);
          const result = evaluateRouterCondition(condition, testInput);
          output = testInput;
          
          // Find edges from this router and skip false branch
          const routerEdges = edges.filter(e => e.source === nodeId);
          for (const edge of routerEdges) {
            const isTrue = edge.sourceHandle === 'true' || edge.sourceHandle === 'a';
            const isFalse = edge.sourceHandle === 'false' || edge.sourceHandle === 'b';
            if ((isTrue && !result) || (isFalse && result)) {
              // Mark downstream nodes as skipped
              const toSkip = [edge.target];
              while (toSkip.length > 0) {
                const skip = toSkip.pop()!;
                skippedNodes.add(skip);
                edges.filter(e => e.source === skip).forEach(e => toSkip.push(e.target));
              }
            }
          }
          break;
        }
        case 'output': {
          output = resolveVariables(node.data.inputText || nodeInput, outputs, input);
          finalOutput = output;
          break;
        }
        default: {
          output = nodeInput;
        }
      }
      
      outputs.set(nodeId, output);
      totalTokens += inputTokens + outputTokens;
      totalCost += cost;
      
      nodeResults.push({
        nodeId,
        nodeName: node.data.label || nodeId,
        nodeType: node.type,
        status: 'success',
        input: nodeInput.slice(0, 2000),
        output: output.slice(0, 5000),
        inputTokens,
        outputTokens,
        cost,
        durationMs: Date.now() - nodeStart,
      });
    } catch (error: any) {
      nodeResults.push({
        nodeId,
        nodeName: node.data.label || nodeId,
        nodeType: node.type,
        status: 'error',
        input: nodeInput.slice(0, 2000),
        output: '',
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
        durationMs: Date.now() - nodeStart,
        error: error.message,
      });
      
      return {
        status: 'failed',
        nodeResults,
        totalTokens,
        totalCost,
        durationMs: Date.now() - startTime,
        output: '',
        errorMessage: error.message,
        errorNodeId: nodeId,
      };
    }
  }
  
  // If no output node, use last node's output
  if (!finalOutput && nodeResults.length > 0) {
    finalOutput = nodeResults[nodeResults.length - 1].output;
  }
  
  return {
    status: 'completed',
    nodeResults,
    totalTokens,
    totalCost,
    durationMs: Date.now() - startTime,
    output: finalOutput,
  };
}
