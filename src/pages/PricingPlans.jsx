import React, { useEffect, useState } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { useWorkspaceStore } from '../store/workspaceStore';
import { Sparkles, Layers, Cpu, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function PricingPlans() {
  const { organizationId } = useWorkspaceStore();
  const [plans, setPlans] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [taskRules, setTaskRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('INDIA_INR');
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
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
      toast.error('Failed to load subscription plans.');
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
      const order = await subscriptionService.createRazorpayOrder(
        organizationId,
        planCode,
        region,
        billingCycle
      );

      const scriptLoaded = await loadRazorpayScript();
      if (scriptLoaded && window.Razorpay && order.keyId && order.keyId !== 'rzp_test_REPLACE_WITH_YOUR_KEY') {
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Kaynetics AI',
          description: `${order.planName} Plan (${billingCycle})`,
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
              toast.success(`Subscribed to ${order.planName}!`);
              fetchPlans();
            } catch (e) {
              toast.error('Payment verification failed.');
            }
          },
          theme: {
            color: '#6c48ff',
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
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
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 animate-fade-in space-y-10">
      {/* Simple Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-[#6c48ff] text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Plans & Pricing</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
          Choose the Right Plan for Your Team
        </h1>
        <p className="text-gray-500 text-sm">
          Simple, transparent pricing to power your AI agent workflows.
        </p>

        {/* Region & Billing Toggles */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <div className="bg-gray-100 p-1 rounded-xl flex items-center border border-gray-200/60">
            <button
              onClick={() => setRegion('INDIA_INR')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                region === 'INDIA_INR' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              🇮🇳 India (INR ₹)
            </button>
            <button
              onClick={() => setRegion('GLOBAL_USD')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                region === 'GLOBAL_USD' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              🌐 Global (USD $)
            </button>
          </div>

          <div className="bg-gray-100 p-1 rounded-xl flex items-center border border-gray-200/60">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                billingCycle === 'MONTHLY' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'ANNUAL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>Annual</span>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                Save ~20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Plan Cards Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6c48ff]"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm">No subscription plans available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const priceRecord = plan.prices?.find((p) => p.billingCycle === billingCycle) || plan.prices?.[0];
            const displayPrice = priceRecord ? priceRecord.price : 0;
            const isPopular = plan.code === 'TEAM';

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 ${
                  isPopular
                    ? 'bg-white border-2 border-[#6c48ff] shadow-md'
                    : 'bg-white border border-gray-100 shadow-sm hover:shadow-md'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6c48ff] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-xs text-gray-500 mb-4 min-h-[32px]">{plan.description}</p>

                  <div className="mb-5 pb-4 border-b border-gray-100">
                    {plan.code === 'ENTERPRISE' ? (
                      <div className="text-xl font-bold text-gray-900">Custom Pricing</div>
                    ) : (
                      <div>
                        <span className="text-3xl font-extrabold text-gray-900">
                          {currencySymbol}{displayPrice.toLocaleString()}
                        </span>
                        <span className="text-gray-400 text-xs font-medium">
                          {billingCycle === 'ANNUAL' ? ' /yr' : ' /mo'}
                        </span>
                      </div>
                    )}
                  </div>

                  {plan.entitlements && plan.entitlements.length > 0 && (
                    <div className="space-y-2.5 mb-6">
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Features
                      </div>
                      {plan.entitlements.map((ent) => (
                        <div key={ent.key} className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-gray-600">
                            <strong className="font-bold text-gray-900">{ent.value}</strong>{' '}
                            {ent.description || ent.key.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleSubscribe(plan.code)}
                  disabled={checkoutLoading === plan.code}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                    isPopular
                      ? 'bg-[#6c48ff] hover:bg-[#5b3adb] text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {checkoutLoading === plan.code ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <span>{plan.code === 'ENTERPRISE' ? 'Contact Sales' : 'Select Plan'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add-ons Section (Rendered ONLY if addOns exist dynamically) */}
      {addOns && addOns.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 rounded-xl bg-purple-50 text-[#6c48ff]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Available Add-Ons</h2>
              <p className="text-xs text-gray-500">Expand capacity with additional credits & seats</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addOns.map((addon) => {
              const price = region === 'INDIA_INR' ? `₹${addon.priceInr?.toLocaleString()}` : `$${addon.priceUsd}`;
              return (
                <div key={addon.id} className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 transition-all">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-gray-900 text-xs">{addon.name}</h4>
                    <span className="text-[#6c48ff] font-bold text-xs">{price}</span>
                  </div>
                  <p className="text-[11px] text-gray-500">{addon.notes || addon.deliveryCondition || 'Prepaid top-up'}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Rules Table (Rendered ONLY if taskRules exist dynamically) */}
      {taskRules && taskRules.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Task Usage Rates</h2>
              <p className="text-xs text-gray-500">Task consumption details by AI activity</p>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-3">Activity</th>
                  <th className="p-3">Cost (Tasks)</th>
                  <th className="p-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {taskRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-3 font-bold text-gray-900">{rule.activityType}</td>
                    <td className="p-3 font-extrabold text-[#6c48ff]">{rule.taskUnits} Tasks</td>
                    <td className="p-3 text-gray-500">{rule.customerExplanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


