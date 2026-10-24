import React, { useState } from 'react';
import { 
  CreditCard, 
  Check, 
  ShieldCheck, 
  Zap, 
  Users, 
  Layers, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { SAAS_PLANS } from '../data/mockData';
import { SaaSPlan } from '../types';

interface BillingPlansViewProps {
  currentPlanId: string;
  onSelectPlan: (plan: SaaSPlan) => void;
  executionsUsed: number;
}

export const BillingPlansView: React.FC<BillingPlansViewProps> = ({
  currentPlanId,
  onSelectPlan,
  executionsUsed,
}) => {
  const [calculatorSeats, setCalculatorSeats] = useState(15);
  const [calculatorExecutions, setCalculatorExecutions] = useState(25000);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const calculatePlanCost = (plan: SaaSPlan) => {
    let base = plan.monthlyBasePrice;
    if (billingCycle === 'annual') {
      base = base * 0.8; // 20% discount on annual
    }

    const extraSeats = Math.max(0, calculatorSeats - plan.includedSeats);
    const extraSeatsCost = extraSeats * plan.additionalSeatPrice;

    const extraExecs = Math.max(0, calculatorExecutions - plan.monthlyExecutionsIncluded);
    const extraExecsCost = Math.ceil(extraExecs / 1000) * plan.additionalExecutionPricePer1k;

    return Math.round(base + extraSeatsCost + extraExecsCost);
  };

  const getRecommendedPlanId = () => {
    if (calculatorExecutions > 50000 || calculatorSeats > 30) return 'enterprise';
    if (calculatorExecutions > 5000 || calculatorSeats > 5) return 'growth';
    return 'starter';
  };

  const recommendedId = getRecommendedPlanId();

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Subscription & Usage-Based Pricing
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Monthly plans scaling with your workflow execution volume and active team size.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual Billing (-20%)
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Interactive Usage & Team Size Calculator */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
              Interactive Revenue & Cost Modeler
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Calculate Monthly Plan by Team Size & Workflow Executions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            {/* Slider 1: Team Seats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Team Seats (Approvers & Admins):</span>
                </label>
                <span className="text-sm font-bold font-mono text-indigo-600 tabular-nums">
                  {calculatorSeats} seats
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={calculatorSeats}
                onChange={(e) => setCalculatorSeats(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>1 seat</span>
                <span>25 seats</span>
                <span>50+ seats</span>
              </div>
            </div>

            {/* Slider 2: Monthly Executions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span>Monthly Workflow Executions:</span>
                </label>
                <span className="text-sm font-bold font-mono text-indigo-600 tabular-nums">
                  {calculatorExecutions.toLocaleString()} runs/mo
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={150000}
                step={1000}
                value={calculatorExecutions}
                onChange={(e) => setCalculatorExecutions(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>1,000</span>
                <span>75,000</span>
                <span>150,000+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAAS_PLANS.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            const isRecommended = recommendedId === plan.id;
            const computedCost = calculatePlanCost(plan);

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-xl p-6 flex flex-col justify-between transition-all border relative ${
                  isCurrent
                    ? 'border-indigo-600 ring-2 ring-indigo-100 shadow-md'
                    : isRecommended
                    ? 'border-slate-800 shadow-sm'
                    : 'border-slate-200'
                }`}
              >
                {/* Header Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
                    {isCurrent ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                        Active Plan
                      </span>
                    ) : isRecommended ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">
                        Recommended
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                    {plan.targetAudience}
                  </p>

                  {/* Monthly Pricing Figure */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                        ${computedCost.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">/ month</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Base: ${plan.monthlyBasePrice}/mo ({plan.includedSeats} seats & {plan.monthlyExecutionsIncluded.toLocaleString()} execs incl.)
                    </div>
                  </div>

                  {/* Concrete Limits Comparison */}
                  <div className="mt-5 space-y-2.5 text-xs border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Included Team Seats:</span>
                      <span className="font-mono font-bold text-slate-900">{plan.includedSeats}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Monthly Executions:</span>
                      <span className="font-mono font-bold text-slate-900">{plan.monthlyExecutionsIncluded.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Max Scheduled Jobs:</span>
                      <span className="font-mono font-bold text-slate-900">{String(plan.maxScheduledJobs)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Support Tier:</span>
                      <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[140px] text-right">{plan.supportTier}</span>
                    </div>
                  </div>

                  {/* Feature Bullets */}
                  <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Platform Capabilities
                    </span>
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Selection Button */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => onSelectPlan(plan)}
                    disabled={isCurrent}
                    className={`w-full py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-500 cursor-default'
                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs active:scale-[0.98]'
                    }`}
                  >
                    {isCurrent ? 'Current Active Subscription' : `Switch to ${plan.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
