import React, { useEffect, useState, useRef } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { useWorkspaceStore } from '../store/workspaceStore';
import { 
  Sparkles, ArrowRight, Layers, Cpu, ChevronDown, ChevronUp, CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import gsap from 'gsap';

export default function PricingPlans() {
  const { organizationId } = useWorkspaceStore();
  const [plans, setPlans] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [taskRules, setTaskRules] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('INDIA_INR'); // 'INDIA_INR' | 'GLOBAL_USD'
  const [billingCycle, setBillingCycle] = useState('MONTHLY'); // 'MONTHLY' | 'ANNUAL'
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [expandedPlans, setExpandedPlans] = useState({});

  const containerRef = useRef(null);

  const toggleExpandPlan = (planCode) => {
    setExpandedPlans((prev) => ({
      ...prev,
      [planCode]: !prev[planCode],
    }));
  };

  // Fallback plans matching subscription-billing.html design specs
  const fallbackPlans = [
    {
      code: 'STARTER',
      name: 'Starter Plan',
      desc: 'Essential agentic tools for small teams and solo builders.',
      inr: { m: 4999, a: 3999 },
      usd: { m: 79, a: 65 },
      feats: [
        '2 Included user seats',
        '1 Included workspace',
        '1 Selectable workforce bundle',
        '4 Maximum active agents',
        '300 Monthly task unit allowance',
        '1 Knowledge base vector storage',
        '10 Knowledge sources allowed',
        '3 Active automated workflows',
        '100 Scheduled post & publishing runs',
        '3 Standard platform integrations',
        '20 Standard image generations'
      ],
      off: ['API & Webhooks', 'BYO model keys', 'Advanced analytics']
    },
    {
      code: 'TEAM',
      name: 'Team Plan',
      desc: 'Advanced multi-agent workflows, higher task limits and team collaboration.',
      popular: true,
      inr: { m: 14999, a: 11999 },
      usd: { m: 249, a: 199 },
      feats: [
        '5 Included user seats',
        '1 Included workspace',
        '2 Selectable workforce bundles',
        '8 Maximum active agents',
        '1000 Monthly task unit allowance',
        '5 Knowledge base vector storage',
        '50 Knowledge sources allowed',
        '15 Active automated workflows',
        '500 Scheduled post & publishing runs',
        '10 Standard platform integrations',
        '75 Standard image generations',
        'Advanced analytics'
      ],
      off: ['API & Webhooks', 'BYO model keys']
    },
    {
      code: 'BUSINESS',
      name: 'Business Plan',
      desc: 'Full organizational AI workforce, high volume tasks, custom workflows and priority support.',
      highlight: true,
      inr: { m: 39999, a: 31999 },
      usd: { m: 599, a: 479 },
      feats: [
        '15 Included user seats',
        '3 Included workspaces',
        '5 All standard workforce bundles',
        '20 Maximum active agents',
        '3000 Monthly task unit allowance',
        '25 Knowledge base vector storage',
        '250 Knowledge sources allowed',
        '50 Active automated workflows',
        '2000 Scheduled post & publishing runs',
        '25 Standard platform integrations',
        '250 Standard image generations',
        'API & Webhooks',
        'BYO model keys',
        'Advanced analytics'
      ],
      off: []
    },
    {
      code: 'ENTERPRISE',
      name: 'Enterprise Plan',
      desc: 'Dedicated AI infrastructure, custom integrations, SLAs and white-glove onboarding.',
      custom: true,
      inr: { m: null, a: null },
      usd: { m: null, a: null },
      feats: [
        'Custom Unlimited user seats',
        'Custom Unlimited workspaces',
        'Custom workforce bundles',
        'Custom active agent limit',
        'Custom high-volume task allowance',
        'Custom Dedicated vector storage',
        'Custom Unlimited knowledge sources',
        'Custom Unlimited automated workflows',
        'Custom Unlimited scheduled runs',
        'Custom integrations & SLAs'
      ],
      off: []
    }
  ];

  useEffect(() => {
    fetchPlans();
    if (organizationId) {
      fetchCurrentSubscription();
    }
  }, [region, organizationId]);

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.animate-gsap'),
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
      );
    }
  }, [loading, region, billingCycle]);

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
      setPlans(data.plans && data.plans.length > 0 ? data.plans : []);
      setAddOns(data.addOns || []);
      setTaskRules(data.taskRules || []);
    } catch (err) {
      console.error('Failed to load plans:', err);
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
          description: `${order.planName || planCode} Plan (${billingCycle})`,
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
              toast.success(`Subscribed to ${order.planName || planCode}!`);
              fetchPlans();
              fetchCurrentSubscription();
            } catch {
              toast.error('Payment verification failed.');
            }
          },
          theme: {
            color: '#4F46E5',
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

  // Helper to extract & format features cleanly for simple, sensible taxonomy
  const getPlanFeatures = (p) => {
    if (p.entitlements && Array.isArray(p.entitlements) && p.entitlements.length > 0) {
      const included = [];
      const excluded = [];

      p.entitlements.forEach((ent) => {
        const val = ent.value;
        const isFalse = val === false || val === 'false' || val === 0 || val === '0';

        let text = '';
        const desc = ent.description || '';
        const key = ent.key || '';

        if (val === true || val === 'true') {
          text = desc || key.replace(/_/g, ' ');
        } else if (typeof val === 'number' || (typeof val === 'string' && !isNaN(val))) {
          if (desc && desc.toLowerCase().includes(String(val))) {
            text = desc;
          } else {
            const cleanKey = (desc || key).replace(/_/g, ' ');
            text = `${val} ${cleanKey}`;
          }
        } else if (val) {
          if (desc && desc.toLowerCase().includes(String(val).toLowerCase())) {
            text = desc;
          } else {
            text = `${val} ${desc || key.replace(/_/g, ' ')}`;
          }
        } else {
          text = desc || key.replace(/_/g, ' ');
        }

        // Clean sensible taxonomy
        text = text
          .replace(/tasks_per_month/gi, 'Monthly Tasks')
          .replace(/active_agents/gi, 'Active Agents')
          .replace(/users/gi, 'User Seats')
          .replace(/vector_storage_gb/gi, 'Vector Storage (GB)')
          .replace(/scheduled_runs/gi, 'Scheduled Runs')
          .replace(/image_generations/gi, 'Image Generations')
          .replace(/standard_integrations/gi, 'Integrations');

        if (isFalse) {
          excluded.push(text);
        } else {
          included.push(text);
        }
      });

      if (included.length > 0 || excluded.length > 0) {
        return { included, excluded };
      }
    }

    if ((p.feats && p.feats.length > 0) || (p.off && p.off.length > 0)) {
      return {
        included: p.feats || [],
        excluded: p.off || []
      };
    }

    const code = (p.code || p.name || '').toUpperCase();
    if (code.includes('STARTER')) {
      return {
        included: [
          '2 Included user seats',
          '1 Included workspace',
          '1 Selectable workforce bundle',
          '4 Maximum active agents',
          '300 Monthly task unit allowance',
          '1 Knowledge base vector storage',
          '10 Knowledge sources allowed',
          '3 Active automated workflows',
          '100 Scheduled post & publishing runs',
          '3 Standard platform integrations',
          '20 Standard image generations'
        ],
        excluded: ['API & Webhooks', 'BYO model keys', 'Advanced analytics']
      };
    }
    if (code.includes('TEAM')) {
      return {
        included: [
          '5 Included user seats',
          '1 Included workspace',
          '2 Selectable workforce bundles',
          '8 Maximum active agents',
          '1000 Monthly task unit allowance',
          '5 Knowledge base vector storage',
          '50 Knowledge sources allowed',
          '15 Active automated workflows',
          '500 Scheduled post & publishing runs',
          '10 Standard platform integrations',
          '75 Standard image generations',
          'Advanced analytics'
        ],
        excluded: ['API & Webhooks', 'BYO model keys']
      };
    }
    if (code.includes('BUSINESS')) {
      return {
        included: [
          '15 Included user seats',
          '3 Included workspaces',
          '5 All standard workforce bundles',
          '20 Maximum active agents',
          '3000 Monthly task unit allowance',
          '25 Knowledge base vector storage',
          '250 Knowledge sources allowed',
          '50 Active automated workflows',
          '2000 Scheduled post & publishing runs',
          '25 Standard platform integrations',
          '250 Standard image generations',
          'API & Webhooks',
          'BYO model keys',
          'Advanced analytics'
        ],
        excluded: []
      };
    }
    if (code.includes('ENTERPRISE')) {
      return {
        included: [
          'Custom Unlimited user seats',
          'Custom Unlimited workspaces',
          'Custom workforce bundles',
          'Custom active agent limit',
          'Custom high-volume task allowance',
          'Custom Dedicated vector storage',
          'Custom Unlimited knowledge sources',
          'Custom Unlimited automated workflows',
          'Custom Unlimited scheduled runs',
          'Custom integrations & SLAs'
        ],
        excluded: []
      };
    }

    return { included: [], excluded: [] };
  };

  const activePlanCode = currentSubscription?.planCode || 'TEAM';

  return (
    <div ref={containerRef} className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-8 pt-2 font-sans space-y-6">
      
      {/* Page Header - Clean White Aesthetic */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center lg:text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-[#6c48ff] text-xs font-semibold border border-purple-100">
            <Sparkles className="w-4 h-4 text-[#6c48ff]" />
            <span>Plans & Subscription Pricing</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
            Flexible Pricing Built for Your AI Team
          </h1>
          
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
            Scale workspace seats, active agents, and AI task units with zero hidden fees. Upgrade or adjust anytime.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>No credit card required to start</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Cancel or switch plans anytime</span>
            </div>
          </div>
        </div>

        {/* Currency & Billing Controls */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-3 w-full lg:w-auto shrink-0">
          <div className="text-center lg:text-left">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Customize Billing</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            {/* Currency Switcher */}
            <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-xs flex items-center w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setRegion('INDIA_INR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  region === 'INDIA_INR' ? 'bg-[#6c48ff] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🇮🇳 India (INR ₹)
              </button>
              <button
                type="button"
                onClick={() => setRegion('GLOBAL_USD')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  region === 'GLOBAL_USD' ? 'bg-[#6c48ff] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🌐 Global (USD $)
              </button>
            </div>

            {/* Billing Cycle Switcher */}
            <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-xs flex items-center w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === 'MONTHLY' ? 'bg-[#6c48ff] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('ANNUAL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  billingCycle === 'ANNUAL' ? 'bg-[#6c48ff] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>Annual</span>
                <span className="text-[9.5px] px-1.5 py-0.5 rounded font-black bg-emerald-500 text-white">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Compare Plans Grid Section (Collapsible Features, Small Sleek Cards) ─ */}
      <div className="animate-gsap">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#4F46E5] border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {(plans && plans.length > 0 ? plans : fallbackPlans).map((p, idx) => {
              const isCurrent = activePlanCode === p.code;
              const isPopular = p.popular || p.code === 'TEAM';
              const isHighlight = p.highlight || p.code === 'BUSINESS';
              const isEnterprise = p.custom || p.code === 'ENTERPRISE';
              const isExpanded = !!expandedPlans[p.code || idx];

              // Price Calculation
              let displayPrice = null;
              if (!isEnterprise) {
                if (p.prices && p.prices.length > 0) {
                  const matched = p.prices.find((pr) => pr.billingCycle === billingCycle) || p.prices[0];
                  displayPrice = matched ? matched.price : 0;
                } else if (p.inr && p.usd) {
                  const src = region === 'INDIA_INR' ? p.inr : p.usd;
                  displayPrice = billingCycle === 'MONTHLY' ? src.m : src.a;
                }
              }

              const symbol = region === 'INDIA_INR' ? '₹' : '$';

              return (
                <div 
                  key={p.code || idx}
                  className={`relative rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 ${
                    isCurrent 
                      ? 'bg-white border-2 border-[#4F46E5] shadow-lg ring-2 ring-indigo-500/10'
                      : isHighlight
                      ? 'bg-white border border-indigo-200 shadow-md'
                      : 'bg-white border border-gray-200/90 shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Card Header Badge */}
                  {isCurrent ? (
                    <div className="absolute -top-3 left-5 bg-[#4F46E5] text-white text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm z-10 whitespace-nowrap">
                      CURRENT PLAN
                    </div>
                  ) : isPopular ? (
                    <div className="absolute -top-3 left-5 bg-purple-600 text-white text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm z-10 whitespace-nowrap">
                      MOST POPULAR
                    </div>
                  ) : null}

                  <div>
                    <h4 className="text-base font-bold text-gray-900 mb-1 font-['Space_Grotesk']">{p.name || p.code}</h4>
                    <p className="text-[11.5px] text-gray-500 leading-normal min-h-[36px] mb-3">{p.desc || p.description}</p>

                    {/* Price Section */}
                    <div className="mb-4 pb-3 border-b border-gray-100">
                      {isEnterprise ? (
                        <div className="text-xl font-bold text-gray-900 font-['Space_Grotesk']">Custom Pricing</div>
                      ) : (
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight font-['Space_Grotesk']">
                              {symbol}{displayPrice !== null ? displayPrice.toLocaleString() : '0'}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">/mo</span>
                          </div>

                          {billingCycle === 'ANNUAL' && displayPrice && (
                            <p className="text-[10.5px] font-semibold text-emerald-600 mt-0.5">
                              Billed {symbol}{(displayPrice * 12).toLocaleString()} / year
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <div className="mb-4">
                      {isCurrent ? (
                        <button disabled className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-400 text-xs font-bold cursor-default">
                          Current plan
                        </button>
                      ) : isEnterprise ? (
                        <button 
                          onClick={() => window.open('mailto:sales@kaynetics.com', '_blank')}
                          className="w-full py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-900 text-xs font-bold transition-all"
                        >
                          Contact sales
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleSubscribe(p.code)}
                          disabled={checkoutLoading === p.code}
                          className="w-full py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730B8] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                        >
                          {checkoutLoading === p.code ? (
                            <span>Processing...</span>
                          ) : (
                            <>
                              <span>{p.code === 'STARTER' ? 'Downgrade' : 'Upgrade'} to {p.name || p.code}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Included Features with Expand/Collapse */}
                    {(() => {
                      const { included, excluded } = getPlanFeatures(p);
                      const maxInitial = 5;
                      const visibleIncluded = isExpanded ? included : included.slice(0, maxInitial);
                      const visibleExcluded = isExpanded 
                        ? excluded 
                        : (included.length < maxInitial ? excluded.slice(0, maxInitial - included.length) : []);
                      
                      const totalCount = included.length + excluded.length;
                      const hasMore = totalCount > maxInitial;

                      return (
                        <div className="space-y-2 pt-3 border-t border-gray-100">
                          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1.5">
                            INCLUDED FEATURES
                          </span>
                          
                          <div className="space-y-2">
                            {visibleIncluded.map((feat, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-2 text-[11.5px] text-gray-700 font-medium">
                                <span className="w-4 h-4 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center text-[9.5px] font-black shrink-0">
                                  ✓
                                </span>
                                <span className="leading-snug">{feat}</span>
                              </div>
                            ))}

                            {visibleExcluded.map((offFeat, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-2 text-[11.5px] text-gray-400">
                                <span className="w-4 h-4 rounded bg-gray-100 text-gray-400 flex items-center justify-center text-[9.5px] font-black shrink-0">
                                  –
                                </span>
                                <span className="leading-snug line-through">{offFeat}</span>
                              </div>
                            ))}
                          </div>

                          {/* Expand / Collapse Button */}
                          {hasMore && !isExpanded && (
                            <button
                              onClick={() => toggleExpandPlan(p.code || idx)}
                              className="w-full mt-2.5 pt-2 border-t border-dashed border-gray-200 text-left text-[11px] font-bold text-[#4F46E5] hover:text-[#3730B8] flex items-center justify-between transition-colors group"
                            >
                              <span>Show all features ({totalCount})</span>
                              <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                            </button>
                          )}

                          {isExpanded && (
                            <button
                              onClick={() => toggleExpandPlan(p.code || idx)}
                              className="w-full mt-2.5 pt-2 border-t border-dashed border-gray-200 text-left text-[11px] font-bold text-gray-500 hover:text-gray-800 flex items-center justify-between transition-colors"
                            >
                              <span>Show fewer features</span>
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })()}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Capacity Add-ons Section ────────────────────────────────────────── */}
      {addOns && addOns.length > 0 && (
        <div className="animate-gsap bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-indigo-50 text-[#4F46E5]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 font-['Space_Grotesk']">Available Capacity Add-Ons</h3>
              <p className="text-xs text-gray-500">Add extra user seats and task top-ups on demand</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {addOns.map((addon) => {
              const price = region === 'INDIA_INR' ? `₹${addon.priceInr?.toLocaleString()}` : `$${addon.priceUsd}`;
              return (
                <div key={addon.id} className="bg-gray-50/70 border border-gray-200/60 rounded-xl p-3.5 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-gray-900 text-xs">{addon.name}</h4>
                    <span className="text-[#4F46E5] font-extrabold text-xs bg-indigo-50 px-2 py-0.5 rounded-full">{price}</span>
                  </div>
                  <p className="text-[11px] text-gray-500">{addon.notes || addon.deliveryCondition || 'Prepaid top-up'}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}


    </div>
  );
}
