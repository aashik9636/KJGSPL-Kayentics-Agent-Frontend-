import React, { useEffect, useState } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { useWorkspaceStore } from '../store/workspaceStore';
import { Sparkles, Layers, Cpu, ArrowRight, Check, X, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

export default function PricingPlans() {
  const { organizationId } = useWorkspaceStore();
  const [plans, setPlans] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [taskRules, setTaskRules] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('INDIA_INR');
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  useEffect(() => {
    fetchPlans();
    if (organizationId) {
      fetchCurrentSubscription();
    }
  }, [region, organizationId]);

  const fetchCurrentSubscription = async () => {
    try {
      const data = await subscriptionService.getOrganizationSubscription(organizationId);
      setCurrentSubscription(data?.subscription || null);
    } catch {
      console.log('No active subscription found');
    }
  };

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
      if (scriptLoaded && window.Razorpay && order?.keyId) {
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Kaynetics AI',
          description: `${order.planName} Plan (${billingCycle})`,
          ...(order?.razorpayOrderId ? { order_id: order.razorpayOrderId } : {}),
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
              fetchCurrentSubscription();
            } catch {
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
        toast.error('Payment gateway key is not configured properly.');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      toast.error(err.response?.data?.message || 'Subscription upgrade failed.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  // Format Entitlements Dynamically & Cleanly
  const renderEntitlementText = (ent) => {
    const val = ent.value;
    const desc = ent.description || ent.key?.replace(/_/g, ' ') || '';
    
    if (val === true || val === 'true') {
      return desc;
    }
    if (val === false || val === 'false') {
      return desc;
    }
    // Avoid duplicate words like "Custom Custom workforce"
    if (typeof val === 'string' && desc.toLowerCase().startsWith(val.toLowerCase())) {
      return desc;
    }
    return `${val} ${desc}`;
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 font-sans space-y-8">
      
      {/* ── Header & Selectors ────────────────────────────────────────────── */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-[#6c48ff] text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Plans & Pricing</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Flexible Pricing for Your AI Team
        </h1>
        <p className="text-gray-500 text-sm">
          Scale workspace seats, active agents, and AI task units with zero hidden fees.
        </p>

        {/* Region & Billing Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          
          {/* Region Switcher */}
          <div className="bg-gray-100 p-1 rounded-2xl flex items-center border border-gray-200/60 shadow-inner">
            <button
              onClick={() => setRegion('INDIA_INR')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                region === 'INDIA_INR' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              🇮🇳 India (INR ₹)
            </button>
            <button
              onClick={() => setRegion('GLOBAL_USD')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                region === 'GLOBAL_USD' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              🌐 Global (USD $)
            </button>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="bg-gray-100 p-1 rounded-2xl flex items-center border border-gray-200/60 shadow-inner">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'MONTHLY' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'ANNUAL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>Annual</span>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded-md font-extrabold">
                Save ~20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Dynamic Plan Cards Grid ───────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#6c48ff] border-t-transparent"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">No subscription plans currently available for this region.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => {
            const priceRecord = plan.prices?.find((p) => p.billingCycle === billingCycle) || plan.prices?.[0];
            const displayPrice = priceRecord ? priceRecord.price : 0;
            const dynamicCurrencySymbol = priceRecord?.currency === 'INR' || region === 'INDIA_INR' ? '₹' : '$';
            const isPopular = plan.code === 'TEAM';
            const isCurrentPlan = currentSubscription?.planCode === plan.code;

            return (
              <div
                key={plan.id}
                className={`relative rounded-[32px] p-6 flex flex-col justify-between transition-all duration-300 ${
                  isCurrentPlan
                    ? 'bg-white border-2 border-emerald-500 shadow-lg ring-4 ring-emerald-500/10'
                    : isPopular
                    ? 'bg-white border-2 border-[#6c48ff] shadow-xl shadow-purple-500/10'
                    : 'bg-white border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-lg'
                }`}
              >
                {/* Popular / Active Badges */}
                {isCurrentPlan ? (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md whitespace-nowrap z-10">
                    Active Plan
                  </div>
                ) : isPopular ? (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#6c48ff] text-white text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md z-10">
                    Most Popular
                  </div>
                ) : null}

                {/* Card Top Section */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 font-['Space_Grotesk']">{plan.name}</h3>
                  <p className="text-xs text-gray-500 mb-5 min-h-[32px] leading-relaxed">{plan.description}</p>

                  {/* Price Section */}
                  <div className="mb-6 pb-5 border-b border-gray-100">
                    {plan.code === 'ENTERPRISE' ? (
                      <div className="text-2xl font-black text-gray-900">Custom Pricing</div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-gray-900 tracking-tight">
                          {dynamicCurrencySymbol}{displayPrice.toLocaleString()}
                        </span>
                        <span className="text-gray-400 text-xs font-semibold">
                          {billingCycle === 'ANNUAL' ? '/yr' : '/mo'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Features / Entitlements List */}
                  {plan.entitlements && plan.entitlements.length > 0 && (
                    <div className="space-y-3 mb-6">
                      <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
                        Included Features
                      </span>

                      <div className="space-y-2.5">
                        {plan.entitlements.map((ent) => {
                          const isExcluded = ent.value === false || ent.value === 'false' || ent.value === 0;
                          const featureText = renderEntitlementText(ent);

                          return (
                            <div key={ent.key} className="flex items-start gap-2.5 text-xs">
                              {isExcluded ? (
                                <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 mt-0.5">
                                  <X className="w-2.5 h-2.5" />
                                </div>
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                              )}

                              <span className={`leading-tight ${isExcluded ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
                                {featureText}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Call to Action Button */}
                <div className="pt-4 mt-auto">
                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-2xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Current Active Plan</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan.code)}
                      disabled={checkoutLoading === plan.code}
                      className={`w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                        isPopular
                          ? 'bg-[#6c48ff] hover:bg-[#5b3adb] text-white shadow-purple-500/25'
                          : 'bg-gray-900 hover:bg-black text-white'
                      }`}
                    >
                      {checkoutLoading === plan.code ? (
                        <span>Processing Order...</span>
                      ) : (
                        <>
                          <span>{plan.code === 'ENTERPRISE' ? 'Contact Sales' : 'Upgrade Plan'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ── Add-ons Section ──────────────────────────────────────────────── */}
      {addOns && addOns.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-purple-50 text-[#6c48ff]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-['Space_Grotesk']">Available Capacity Add-Ons</h2>
              <p className="text-xs text-gray-500">Add extra user seats and task top-ups on demand</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addOns.map((addon) => {
              const price = region === 'INDIA_INR' ? `₹${addon.priceInr?.toLocaleString()}` : `$${addon.priceUsd}`;
              return (
                <div key={addon.id} className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4.5 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-center mb-1.5">
                    <h4 className="font-bold text-gray-900 text-xs">{addon.name}</h4>
                    <span className="text-[#6c48ff] font-extrabold text-xs bg-purple-50 px-2 py-0.5 rounded-full">{price}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-normal">{addon.notes || addon.deliveryCondition || 'Prepaid top-up'}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Task Usage Rules Table ───────────────────────────────────────── */}
      {taskRules && taskRules.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-['Space_Grotesk']">Task Consumption Rates</h2>
              <p className="text-xs text-gray-500">Transparent task unit deduction schedule by AI action type</p>
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-3.5">Activity Type</th>
                  <th className="p-3.5">Task Deduction</th>
                  <th className="p-3.5">Customer Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {taskRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50/60 transition">
                    <td className="p-3.5 font-bold text-gray-900">{rule.activityType}</td>
                    <td className="p-3.5 font-black text-[#6c48ff]">{rule.taskUnits} Units</td>
                    <td className="p-3.5 text-gray-500">{rule.customerExplanation}</td>
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
