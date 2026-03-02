import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Brain, GitBranch, BarChart3, Clock, ChevronDown, Workflow, Sparkles, DollarSign } from 'lucide-react';
import { useState } from 'react';

const features = [
  { icon: Brain, title: 'Multi-Model AI', desc: 'Chain Claude, GPT-4o, Gemini, and more in a single workflow. Use the best model for each step.' },
  { icon: Workflow, title: 'Visual Canvas', desc: 'Drag-and-drop interface to build complex AI pipelines. No coding required — ever.' },
  { icon: GitBranch, title: 'Smart Routing', desc: 'Conditional branching based on AI outputs. Build intelligent workflows that adapt.' },
  { icon: Zap, title: 'One-Click Templates', desc: 'Start with pre-built templates for content, marketing, sales, and more. Customize in minutes.' },
  { icon: Clock, title: 'Scheduled Runs', desc: 'Automate on a schedule. Generate content, process data, or run reports automatically.' },
  { icon: BarChart3, title: 'Cost Tracking', desc: 'See exactly what each run costs. Per-node breakdowns help you optimize spending.' },
];

const howItWorks = [
  { step: '1', title: 'Add Your API Keys', desc: 'Bring your own OpenAI, Anthropic, or Google keys. You control your spend.' },
  { step: '2', title: 'Build Your Pipeline', desc: 'Drag AI models, transforms, and routers onto the visual canvas. Connect them.' },
  { step: '3', title: 'Run & Automate', desc: 'Test with one click, then schedule to run automatically. Watch costs in real-time.' },
];

const plans = [
  { name: 'Free', price: '$0', period: '/forever', features: ['3 workflows', '50 runs/month', 'GPT-4o-mini', 'Manual triggers'], cta: 'Get Started', popular: false },
  { name: 'Starter', price: '$29', period: '/month', features: ['15 workflows', '500 runs/month', 'All AI models', '3 integrations', 'Email support'], cta: 'Start Free Trial', popular: false },
  { name: 'Pro', price: '$49', period: '/month', features: ['50 workflows', '2,000 runs/month', 'All AI models', 'All integrations', '3 team members', 'Priority support'], cta: 'Start Free Trial', popular: true },
  { name: 'Business', price: '$79', period: '/month', features: ['Unlimited workflows', '10,000 runs/month', 'All AI models', 'All + API access', '10 team members', 'Dedicated support'], cta: 'Contact Sales', popular: false },
];

const faqs = [
  { q: 'What API keys do I need?', a: 'You bring your own keys from OpenAI, Anthropic, or Google. This means you pay AI providers directly at their rates — no markup from us.' },
  { q: 'How is this different from Zapier?', a: 'AI Pipes is built specifically for AI workflows. Zapier bolted AI onto an automation tool. We designed every feature around chaining AI models together.' },
  { q: 'Can I use multiple AI models in one workflow?', a: 'Yes! That\'s the whole point. Use GPT-4o for research, Claude for writing, and Gemini for formatting — all in one pipeline.' },
  { q: 'What happens if an AI call fails?', a: 'Failed nodes show clear error messages. You can configure retry logic and fallback models. Run history lets you debug any issue.' },
  { q: 'Is my data secure?', a: 'API keys are encrypted with AES-256 at rest. We never log your keys or AI outputs beyond your configured retention period.' },
  { q: 'Can I cancel anytime?', a: 'Yes, all plans are month-to-month. Cancel anytime from your settings page. Your workflows are yours to export.' },
];

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-navy-700 rounded-lg">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left hover:bg-navy-800/50 transition-colors">
        <span className="font-medium text-navy-100">{q}</span>
        <ChevronDown className={`w-5 h-5 text-navy-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4 text-navy-400">{a}</div>}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-brand-500" />
          <span className="text-xl font-bold">AI Pipes</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-navy-400">
          <a href="#features" className="hover:text-navy-100 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-navy-100 transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-navy-100 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-navy-100 transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-navy-300 hover:text-navy-100 transition-colors">Log in</Link>
          <Link to="/register" className="text-sm bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-24 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 text-brand-400 text-sm px-4 py-1.5 rounded-full mb-6 border border-brand-500/20">
          <Zap className="w-4 h-4" /> Visual AI Workflow Builder
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          Chain AI Models Into
          <span className="text-brand-500"> Automated Pipelines</span>
        </h1>
        <p className="text-xl text-navy-400 mb-8 max-w-2xl mx-auto">
          Drag-and-drop interface to connect Claude, GPT-4o, and Gemini into powerful workflows. No coding required. Like Zapier, but built for AI.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/register" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors">
            Start Building Free <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#how-it-works" className="inline-flex items-center gap-2 text-navy-300 hover:text-navy-100 px-6 py-3 rounded-lg border border-navy-700 hover:border-navy-600 transition-colors">
            See How It Works
          </a>
        </div>
        <p className="text-sm text-navy-500 mt-4">Free tier available • No credit card required</p>

        {/* Canvas Preview */}
        <div className="mt-16 bg-navy-800 border border-navy-700 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-error-500/60" />
              <div className="w-3 h-3 rounded-full bg-warning-500/60" />
              <div className="w-3 h-3 rounded-full bg-success-500/60" />
            </div>
            <span className="text-sm text-navy-500">Blog Post Pipeline — AI Pipes Editor</span>
          </div>
          <div className="flex items-center justify-center gap-4 py-8">
            {['📝 Topic Input', '🤖 Researcher (GPT-4o)', '🤖 Writer (Claude)', '🤖 Editor (GPT-4o-mini)', '📤 Output'].map((label, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="bg-navy-900 border border-navy-600 rounded-lg px-4 py-3 text-sm font-medium whitespace-nowrap">
                  {label}
                </div>
                {i < 4 && <ArrowRight className="w-4 h-4 text-brand-500 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need to Automate AI</h2>
          <p className="text-navy-400 max-w-2xl mx-auto">Built from the ground up for AI workflows. Not another general automation tool with AI bolted on.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-navy-800/50 border border-navy-700 rounded-xl p-6 hover:border-brand-500/30 transition-colors">
              <f.icon className="w-10 h-10 text-brand-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-navy-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-20 bg-navy-800/30">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Up and Running in 3 Steps</h2>
          <p className="text-navy-400">From zero to automated AI pipeline in minutes.</p>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {howItWorks.map((s, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">{s.step}</div>
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-navy-400 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-navy-400">AI API costs are separate — you pay providers directly. No markup.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div key={i} className={`rounded-xl p-6 border ${plan.popular ? 'border-brand-500 bg-brand-500/5 ring-1 ring-brand-500/20' : 'border-navy-700 bg-navy-800/50'}`}>
              {plan.popular && <div className="text-brand-400 text-xs font-semibold mb-2 uppercase tracking-wider">Most Popular</div>}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-navy-500 text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-navy-300">
                    <div className="w-1.5 h-1.5 bg-brand-500 rounded-full shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className={`block text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                plan.popular ? 'bg-brand-500 hover:bg-brand-600 text-white' : 'border border-navy-600 hover:border-navy-500 text-navy-300 hover:text-navy-100'
              }`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-20 bg-navy-800/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => <FAQ key={i} {...faq} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <DollarSign className="w-12 h-12 text-brand-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Stop Doing AI Tasks Manually</h2>
          <p className="text-navy-400 mb-8">Join thousands automating their AI workflows. Free to start, pay as you grow.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
            Start Building Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-800 px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-navy-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>AI Pipes © {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-navy-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-navy-300 transition-colors">Terms</a>
            <a href="mailto:help@aipipes.com" className="hover:text-navy-300 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
