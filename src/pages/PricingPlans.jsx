import React, { useEffect, useState } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { useWorkspaceStore } from '../store/workspaceStore';
import { 
  Zap, Check, Shield, Globe, Award, Sparkles, HelpCircle, 
  ArrowRight, CreditCard, Layers, Cpu, Database, Users, CheckCircle2 
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function PricingPlans() {
  const { organizationId } = useWorkspaceStore();
  const [plans, setPlans] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [taskRules, setTaskRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('INDIA_INR'); // 'INDIA_INR' or 'GLOBAL_USD'
  const [billingCycle, setBillingCycle] = useState('MONTHLY'); // 'MONTHLY' or 'ANNUAL'
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, [region]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await subscriptionService.getPlans(region);
      setPlans(data.plans || []);
      setAddOns(data.addOns || []);
      setTaskRules(data.taskRules || []);
    } catch (err) {
      console.error('Failed to load plans:', err);
      toast.error('Failed to load dynamic subscription plans.');
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (planCode) => {
    if (!organizationId) {
      toast.error('Please select an active organization first.');
      return;
    }

    setCheckoutLoading(planCode);
    try {
      // 1. Create Razorpay order via backend
      const order = await subscriptionService.createRazorpayOrder(
        organizationId,
        planCode,
        region,
        billingCycle
      );

      // 2. Load script if needed & open Razorpay modal
      const scriptLoaded = await loadRazorpayScript();
      if (scriptLoaded && window.Razorpay && order.keyId && order.keyId !== 'rzp_test_REPLACE_WITH_YOUR_KEY') {
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Kaynetics AI Platform',
          description: `Subscription to ${order.planName} (${billingCycle})`,
          order_id: order.razorpayOrderId,
          handler: async (response) => {
            try {
              await subscriptionService.verifyRazorpayPayment(
                organizationId,
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature,
                planCode,
                region,
                billingCycle
              );
              toast.success(`Successfully subscribed to ${order.planName}!`);
              fetchPlans();
            } catch (e) {
              toast.error('Payment verification failed.');
            }
          },
          theme: {
            color: '#6366f1',
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback for dev mode / direct plan update when test keys are set
        await subscriptionService.subscribe(organizationId, planCode, region, billingCycle);
        toast.success(`Subscribed to ${planCode} plan successfully!`);
        fetchPlans();
      }
    } catch (err) {
      console.error('Subscription error:', err);
      toast.error(err.response?.data?.message || 'Subscription upgrade failed.');
    } finally {
      setCheckoutLoading(null);
    }
  };


  const currencySymbol = region === 'INDIA_INR' ? '₹' : '$';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Kaynetics SaaS Pricing Strategy</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 mb-4">
          Outcome-Based AI Workforce Subscriptions
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Scale your enterprise with autonomous multi-agent teams. Dynamic task metering, regional pricing books, and transparent credit allowances.
        </p>

        {/* Toggles */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
          {/* Region Toggle */}
          <div className="bg-slate-900/80 p-1 rounded-xl border border-slate-800 flex items-center">
            <button
              onClick={() => setRegion('INDIA_INR')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                region === 'INDIA_INR'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇮🇳 India (INR ₹)
            </button>
            <button
              onClick={() => setRegion('GLOBAL_USD')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                region === 'GLOBAL_USD'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🌐 Global (USD $)
            </button>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="bg-slate-900/80 p-1 rounded-xl border border-slate-800 flex items-center">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                billingCycle === 'MONTHLY'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                billingCycle === 'ANNUAL'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Contract</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-bold">
                Save ~20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {plans.map((plan) => {
          const priceRecord = plan.prices.find((p) => p.billingCycle === billingCycle) || plan.prices[0];
          const displayPrice = priceRecord ? priceRecord.price : 0;
          const isPopular = plan.code === 'TEAM';
          const isBusiness = plan.code === 'BUSINESS';

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 ${
                isPopular
                  ? 'bg-slate-900/90 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/10 scale-105'
                  : isBusiness
                  ? 'bg-slate-900/90 border border-purple-500/50 shadow-xl'
                  : 'bg-slate-900/50 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  Most Popular Team Choice
                </div>
              )}

              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-slate-400 mb-6 min-h-[40px]">{plan.description}</p>

                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-slate-800">
                  {plan.code === 'ENTERPRISE' ? (
                    <div className="text-3xl font-extrabold text-white">Custom Pricing</div>
                  ) : (
                    <div>
                      <span className="text-4xl font-extrabold text-white">
                        {currencySymbol}{displayPrice.toLocaleString()}
                      </span>
                      <span className="text-slate-400 text-sm font-medium">
                        {billingCycle === 'ANNUAL' ? ' /year' : ' /month'}
                      </span>
                      {billingCycle === 'ANNUAL' && priceRecord?.annualEquivalentMonthly && (
                        <div className="text-xs text-emerald-400 mt-1">
                          Equivalent to {currencySymbol}{priceRecord.annualEquivalentMonthly.toLocaleString()}/mo billed upfront
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Core Entitlements Checklist */}
                <div className="space-y-3 mb-8">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Core Entitlements
                  </div>

                  {plan.entitlements.map((ent) => (
                    <div key={ent.key} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-slate-200">
                        <strong className="font-semibold text-white">{ent.value}</strong>{' '}
                        {ent.description || ent.key.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleSubscribe(plan.code)}
                disabled={checkoutLoading === plan.code}
                className={`w-full py-3.5 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isPopular
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/25'
                    : isBusiness
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/25'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                {checkoutLoading === plan.code ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>{plan.code === 'ENTERPRISE' ? 'Contact Sales' : 'Subscribe via Razorpay'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Add-ons Price Book Section */}
      <div className="max-w-7xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-8 mb-16">
        <div className="flex items-center gap-3 mb-6">
          <Layers className="w-6 h-6 text-indigo-400" />
          <h2 className="text-2xl font-bold text-white">Add-On Price Book & Top-Up Packs</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addOns.map((addon) => {
            const price = region === 'INDIA_INR' ? `₹${addon.priceInr?.toLocaleString()}` : `$${addon.priceUsd}`;
            return (
              <div key={addon.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white">{addon.name}</h4>
                  <span className="text-indigo-400 font-extrabold text-sm">{price}</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{addon.notes || addon.deliveryCondition || 'Prepaid top-up pack'}</p>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-900">
                  <span>Basis: {addon.billingBasis}</span>
                  <span className="text-emerald-400">Available</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Consumption Rules Section */}
      <div className="max-w-7xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Cpu className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Dynamic Task Metering Rules</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
              <tr>
                <th className="p-4 rounded-l-lg">AI Activity</th>
                <th className="p-4">Task Units Metered</th>
                <th className="p-4">Premium Depth?</th>
                <th className="p-4 rounded-r-lg">Customer Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {taskRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-850/50">
                  <td className="p-4 font-semibold text-white">{rule.activityType}</td>
                  <td className="p-4 font-extrabold text-indigo-400">{rule.taskUnits} Tasks</td>
                  <td className="p-4">
                    {rule.isPremium ? (
                      <span className="bg-purple-500/20 text-purple-300 text-xs px-2.5 py-1 rounded-full font-bold">Premium</span>
                    ) : (
                      <span className="text-slate-500">Standard</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-400">{rule.customerExplanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
