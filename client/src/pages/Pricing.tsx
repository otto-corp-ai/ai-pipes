import { Link } from 'react-router-dom';
import { Sparkles, Check } from 'lucide-react';

const plans = [
  { name: 'Free', price: '$0', period: '/forever', features: ['3 workflows', '50 runs/month', 'GPT-4o-mini only', 'Manual triggers', 'Community support', '7-day run history'], cta: 'Get Started', popular: false },
  { name: 'Starter', price: '$29', period: '/month', features: ['15 workflows', '500 runs/month', 'All AI models', '3 integrations', 'Email support', '30-day run history'], cta: 'Start Free Trial', popular: false },
  { name: 'Pro', price: '$49', period: '/month', features: ['50 workflows', '2,000 runs/month', 'All AI models', 'All integrations', '3 team members', 'Priority support', '90-day run history'], cta: 'Start Free Trial', popular: true },
  { name: 'Business', price: '$79', period: '/month', features: ['Unlimited workflows', '10,000 runs/month', 'All AI models', 'All + API access', '10 team members', 'Dedicated support', '1-year run history', 'Custom templates'], cta: 'Contact Sales', popular: false },
];

export default function Pricing() {
  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-brand-500" />
          <span className="text-xl font-bold">AI Pipes</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-navy-300 hover:text-navy-100">Log in</Link>
          <Link to="/register" className="text-sm bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg">Get Started</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-navy-400 text-lg">AI API costs are separate — you pay providers directly. Zero markup from us.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <div key={i} className={`rounded-xl p-6 border ${plan.popular ? 'border-brand-500 bg-brand-500/5 ring-1 ring-brand-500/20 scale-105' : 'border-navy-700 bg-navy-800/50'}`}>
              {plan.popular && <div className="text-brand-400 text-xs font-semibold mb-3 uppercase tracking-wider">Most Popular</div>}
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <div className="mt-2 mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-navy-500">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-navy-300">
                    <Check className="w-4 h-4 text-brand-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                plan.popular ? 'bg-brand-500 hover:bg-brand-600 text-white' : 'border border-navy-600 hover:border-navy-500 text-navy-300 hover:text-navy-100'
              }`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
