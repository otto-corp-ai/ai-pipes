import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { api } from '../lib/api';
import { FileText, Mail, Calendar, Target, ClipboardList, Copy } from 'lucide-react';

const BUILT_IN_TEMPLATES = [
  {
    name: 'Blog Post Pipeline',
    description: 'Enter a topic, auto-research key points, draft a blog post, then polish with an editor. Fully connected — just type and run.',
    icon: FileText, category: 'content', nodes: 5,
    canvasData: {
      nodes: [
        { id: 'topic', type: 'text_input', position: { x: 50, y: 200 }, data: { label: 'Topic', text: '{{input}}' } },
        { id: 'researcher', type: 'ai_model', position: { x: 300, y: 100 }, data: { label: 'Researcher', model: 'gpt-4o', systemPrompt: 'You are a research assistant. Provide 5 key points about the topic with supporting facts.', userPrompt: 'Research this topic thoroughly: {{topic.output}}', temperature: 0.3, maxTokens: 2048 } },
        { id: 'writer', type: 'ai_model', position: { x: 550, y: 200 }, data: { label: 'Writer', model: 'claude-3-5-sonnet-20241022', systemPrompt: 'You are a professional blog writer. Write engaging, SEO-friendly content.', userPrompt: 'Write a 1000-word blog post about {{topic.output}} using this research:\n\n{{researcher.output}}', temperature: 0.7, maxTokens: 4096 } },
        { id: 'editor', type: 'ai_model', position: { x: 800, y: 200 }, data: { label: 'Editor', model: 'gpt-4o-mini', systemPrompt: 'You are a copy editor. Fix grammar, improve clarity, add compelling headers.', userPrompt: 'Edit and polish this blog post:\n\n{{writer.output}}', temperature: 0.2, maxTokens: 4096 } },
        { id: 'output', type: 'output', position: { x: 1050, y: 200 }, data: { label: 'Final Post', displayType: 'display' } },
      ],
      edges: [
        { id: 'e1', source: 'topic', target: 'researcher', animated: true },
        { id: 'e2', source: 'topic', target: 'writer', animated: true },
        { id: 'e3', source: 'researcher', target: 'writer', animated: true },
        { id: 'e4', source: 'writer', target: 'editor', animated: true },
        { id: 'e5', source: 'editor', target: 'output', animated: true },
      ],
    },
  },
  {
    name: 'Email Campaign Generator',
    description: 'Describe your audience and goal, then AI generates subject lines and persuasive body copy automatically.',
    icon: Mail, category: 'marketing', nodes: 4,
    canvasData: {
      nodes: [
        { id: 'audience', type: 'text_input', position: { x: 50, y: 200 }, data: { label: 'Audience & Goal', text: '{{input}}' } },
        { id: 'subjects', type: 'ai_model', position: { x: 300, y: 100 }, data: { label: 'Subject Lines', model: 'gpt-4o', systemPrompt: 'You are an email marketing expert. Generate compelling subject lines.', userPrompt: 'Generate 5 email subject lines for this campaign:\n\n{{audience.output}}', temperature: 0.9, maxTokens: 1024 } },
        { id: 'body', type: 'ai_model', position: { x: 550, y: 200 }, data: { label: 'Email Body', model: 'claude-3-5-sonnet-20241022', systemPrompt: 'You are a persuasive copywriter. Write email body copy that converts.', userPrompt: 'Write the email body for this campaign. Use the best subject line from:\n{{subjects.output}}\n\nCampaign details: {{audience.output}}', temperature: 0.7, maxTokens: 2048 } },
        { id: 'output', type: 'output', position: { x: 800, y: 200 }, data: { label: 'Campaign', displayType: 'display' } },
      ],
      edges: [
        { id: 'e1', source: 'audience', target: 'subjects', animated: true },
        { id: 'e2', source: 'audience', target: 'body', animated: true },
        { id: 'e3', source: 'subjects', target: 'body', animated: true },
        { id: 'e4', source: 'body', target: 'output', animated: true },
      ],
    },
  },
  {
    name: 'Social Media Calendar',
    description: 'Provide your brand topic and get a full 30-day posting calendar across Twitter, LinkedIn, and Instagram.',
    icon: Calendar, category: 'content', nodes: 3,
    canvasData: {
      nodes: [
        { id: 'topic', type: 'text_input', position: { x: 50, y: 200 }, data: { label: 'Topic & Brand', text: '{{input}}' } },
        { id: 'generator', type: 'ai_model', position: { x: 350, y: 200 }, data: { label: 'Generate 30 Posts', model: 'gpt-4o', systemPrompt: 'You are a social media content strategist. Create varied, engaging posts.', userPrompt: 'Create a 30-day social media content calendar for:\n\n{{topic.output}}\n\nFor each day, provide:\n- Day number\n- Platform (Twitter/LinkedIn/Instagram)\n- Post text\n- Hashtags\n- Best time to post', temperature: 0.8, maxTokens: 8192 } },
        { id: 'output', type: 'output', position: { x: 650, y: 200 }, data: { label: 'Calendar', displayType: 'display' } },
      ],
      edges: [
        { id: 'e1', source: 'topic', target: 'generator', animated: true },
        { id: 'e2', source: 'generator', target: 'output', animated: true },
      ],
    },
  },
  {
    name: 'Lead Qualifier',
    description: 'Paste lead info, AI researches the company, scores fit, and drafts a personalized outreach email.',
    icon: Target, category: 'sales', nodes: 4,
    canvasData: {
      nodes: [
        { id: 'lead', type: 'text_input', position: { x: 50, y: 200 }, data: { label: 'Lead Info', text: '{{input}}' } },
        { id: 'research', type: 'ai_model', position: { x: 300, y: 100 }, data: { label: 'Research', model: 'gpt-4o', systemPrompt: 'You are a sales research analyst. Analyze lead information and provide insights.', userPrompt: 'Research this lead and provide key insights:\n\n{{lead.output}}\n\nInclude: company size, industry, likely pain points, recent news.', temperature: 0.3, maxTokens: 2048 } },
        { id: 'score', type: 'ai_model', position: { x: 550, y: 200 }, data: { label: 'Score & Outreach', model: 'claude-3-5-sonnet-20241022', systemPrompt: 'You are a sales development expert. Score leads and write personalized outreach.', userPrompt: 'Based on this research:\n{{research.output}}\n\n1. Score this lead 1-10 (with reasoning)\n2. Write a personalized outreach email\n3. Suggest 3 talking points', temperature: 0.6, maxTokens: 2048 } },
        { id: 'output', type: 'output', position: { x: 800, y: 200 }, data: { label: 'Qualified Lead', displayType: 'display' } },
      ],
      edges: [
        { id: 'e1', source: 'lead', target: 'research', animated: true },
        { id: 'e2', source: 'research', target: 'score', animated: true },
        { id: 'e3', source: 'score', target: 'output', animated: true },
      ],
    },
  },
  {
    name: 'Meeting Notes → Action Items',
    description: 'Paste raw meeting notes and get structured action items with owners, deadlines, and a ready-to-send email summary.',
    icon: ClipboardList, category: 'operations', nodes: 4,
    canvasData: {
      nodes: [
        { id: 'notes', type: 'text_input', position: { x: 50, y: 200 }, data: { label: 'Meeting Notes', text: '{{input}}' } },
        { id: 'extract', type: 'ai_model', position: { x: 300, y: 150 }, data: { label: 'Extract Actions', model: 'gpt-4o', systemPrompt: 'You extract action items from meeting notes. Be thorough and specific.', userPrompt: 'Extract all action items from these meeting notes. For each item include: task, assigned to, deadline, priority.\n\n{{notes.output}}', temperature: 0.2, maxTokens: 2048 } },
        { id: 'format', type: 'ai_model', position: { x: 550, y: 200 }, data: { label: 'Format Email', model: 'gpt-4o-mini', systemPrompt: 'You format action items into a clear, professional email summary.', userPrompt: 'Format these action items into a professional email to send to the team:\n\n{{extract.output}}', temperature: 0.3, maxTokens: 2048 } },
        { id: 'output', type: 'output', position: { x: 800, y: 200 }, data: { label: 'Email Summary', displayType: 'display' } },
      ],
      edges: [
        { id: 'e1', source: 'notes', target: 'extract', animated: true },
        { id: 'e2', source: 'extract', target: 'format', animated: true },
        { id: 'e3', source: 'format', target: 'output', animated: true },
      ],
    },
  },
];

export default function Templates() {
  const navigate = useNavigate();
  const [cloning, setCloning] = useState<string | null>(null);

  async function cloneTemplate(template: typeof BUILT_IN_TEMPLATES[0]) {
    setCloning(template.name);
    try {
      const wf = await api.createWorkflow({
        name: template.name,
        description: template.description,
        canvasData: template.canvasData,
        tags: [template.category],
      });
      navigate(`/workflow/${wf.id}`);
    } catch (err: any) {
      alert('Failed to clone: ' + err.message);
    } finally {
      setCloning(null);
    }
  }

  return (
    <AppShell>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-navy-400 text-sm mt-1">Pre-built AI workflows — clone and customize in minutes.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BUILT_IN_TEMPLATES.map(t => (
            <div key={t.name} className="bg-navy-800/50 border border-navy-700 rounded-xl p-5 hover:border-navy-600 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <t.icon className="w-8 h-8 text-brand-400" />
                <span className="text-xs bg-navy-700 text-navy-300 px-2 py-0.5 rounded-full">{t.category}</span>
              </div>
              <h3 className="font-semibold mb-2">{t.name}</h3>
              <p className="text-sm text-navy-400 mb-4">{t.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-navy-500">{t.nodes} nodes</span>
                <button onClick={() => cloneTemplate(t)} disabled={cloning === t.name}
                  className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50">
                  <Copy className="w-3.5 h-3.5" /> {cloning === t.name ? 'Cloning...' : 'Use Template'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
