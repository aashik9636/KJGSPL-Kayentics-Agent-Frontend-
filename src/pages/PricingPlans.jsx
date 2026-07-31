import React, { useEffect, useState, useRef } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { useWorkspaceStore } from '../store/workspaceStore';
import {
  Sparkles, ArrowRight, Layers, ChevronDown, ChevronUp, CheckCircle
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
  const [region, setRegion] = useState('INDIA_INR');
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [expandedPlans, setExpandedPlans] = useState({});

  const containerRef = useRef(null);

  const toggleExpandPlan = (planCode) => {
    setExpandedPlans((prev) => ({ ...prev, [planCode]: !prev[planCode] }));
  };

  const fallbackPlans = [
    {
      code: 'STARTER',
      name: 'Starter Plan',
      desc: 'Essential agentic tools for small teams and solo builders.',
      inr: { m: 4999, a: 3999 },
      usd: { m: 79, a: 65 },
      feats: [
        '2 Included user seats', '1 Included workspace', '1 Selectable workforce bundle',
        '4 Maximum active agents', '300 Monthly task unit allowance',
        '1 Knowledge base vector storage', '10 Knowledge sources allowed',
        '3 Active automated workflows', '100 Scheduled post & publishing runs',
        '3 Standard platform integrations', '20 Standard image generations'
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
        '5 Included user seats', '1 Included workspace', '2 Selectable workforce bundles',
        '8 Maximum active agents', '1000 Monthly task unit allowance',
        '5 Knowledge base vector storage', '50 Knowledge sources allowed',
        '15 Active automated workflows', '500 Scheduled post & publishing runs',
        '10 Standard platform integrations', '75 Standard image generations', 'Advanced analytics'
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
        '15 Included user seats', '3 Included workspaces', '5 All standard workforce bundles',
        '20 Maximum active agents', '3000 Monthly task unit allowance',
        '25 Knowledge base vector storage', '250 Knowledge sources allowed',
        '50 Active automated workflows', '2000 Scheduled post & publishing runs',
        '25 Standard platform integrations', '250 Standard image generations',
        'API & Webhooks', 'BYO model keys', 'Advanced analytics'
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
        'Unlimited custom seats', 'Unlimited custom workspaces',
        'Custom workforce configuration', 'Custom active agent allocation',
        'Custom high-volume task balance', 'Dedicated vector storage',
        'Unlimited knowledge sources', 'Unlimited automated workflows',
        'Unlimited scheduled runs', 'Custom integrations & SLAs'
      ],
      off: []
    }
  ];

  useEffect(() => {
    fetchPlans();
    if (organizationId) fetchCurrentSubscription();
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
      const sub = data?.data?.subscription || data?.subscription || null;
      setCurrentSubscription(sub);
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
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (planCode) => {
    if (!organizationId) { toast.error('Please select an active organization first.'); return; }
    setCheckoutLoading(planCode);
    try {
      const order = await subscriptionService.createRazorpayOrder(organizationId, planCode, region, billingCycle);
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
                organizationId, response.razorpay_order_id, response.razorpay_payment_id,
                response.razorpay_signature, planCode, region, billingCycle
              );
              toast.success(`Subscribed to ${order.planName || planCode}!`);
              fetchPlans();
              fetchCurrentSubscription();
            } catch {
              toast.error('Payment verification failed.');
            }
          },
          theme: { color: '#4F46E5' },
        };
        new window.Razorpay(options).open();
      } else {
        toast.error('Payment gateway key is not configured properly.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription upgrade failed.');
    } finally {
      setCheckoutLoading(null);
    }
  };

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
          text = desc && desc.toLowerCase().includes(String(val)) ? desc : `${val} ${(desc || key).replace(/_/g, ' ')}`;
        } else if (val) {
          text = desc && desc.toLowerCase().includes(String(val).toLowerCase()) ? desc : `${val} ${desc || key.replace(/_/g, ' ')}`;
        } else {
          text = desc || key.replace(/_/g, ' ');
        }
        text = text
          .replace(/tasks_per_month/gi, 'Monthly Tasks')
          .replace(/active_agents/gi, 'Active Agents')
          .replace(/users/gi, 'User Seats')
          .replace(/vector_storage_gb/gi, 'Vector Storage (GB)')
          .replace(/scheduled_runs/gi, 'Scheduled Runs')
          .replace(/image_generations/gi, 'Image Generations')
          .replace(/standard_integrations/gi, 'Integrations');
        if (isFalse) excluded.push(text);
        else included.push(text);
      });
      if (included.length > 0 || excluded.length > 0) return { included, excluded };
    }
    if ((p.feats && p.feats.length > 0) || (p.off && p.off.length > 0)) {
      return { included: p.feats || [], excluded: p.off || [] };
    }
    const code = (p.code || p.name || '').toUpperCase();
    if (code.includes('STARTER')) return { included: ['2 Included user seats','1 Included workspace','1 Selectable workforce bundle','4 Maximum active agents','300 Monthly task unit allowance','1 Knowledge base vector storage','10 Knowledge sources allowed','3 Active automated workflows','100 Scheduled post & publishing runs','3 Standard platform integrations','20 Standard image generations'], excluded: ['API & Webhooks','BYO model keys','Advanced analytics'] };
    if (code.includes('TEAM')) return { included: ['5 Included user seats','1 Included workspace','2 Selectable workforce bundles','8 Maximum active agents','1000 Monthly task unit allowance','5 Knowledge base vector storage','50 Knowledge sources allowed','15 Active automated workflows','500 Scheduled post & publishing runs','10 Standard platform integrations','75 Standard image generations','Advanced analytics'], excluded: ['API & Webhooks','BYO model keys'] };
    if (code.includes('BUSINESS')) return { included: ['15 Included user seats','3 Included workspaces','5 All standard workforce bundles','20 Maximum active agents','3000 Monthly task unit allowance','25 Knowledge base vector storage','250 Knowledge sources allowed','50 Active automated workflows','2000 Scheduled post & publishing runs','25 Standard platform integrations','250 Standard image generations','API & Webhooks','BYO model keys','Advanced analytics'], excluded: [] };
    if (code.includes('ENTERPRISE')) return { included: ['Unlimited custom seats','Unlimited custom workspaces','Custom workforce configuration','Custom active agent allocation','Custom high-volume task balance','Dedicated vector storage','Unlimited knowledge sources','Unlimited automated workflows','Unlimited scheduled runs','Custom integrations & SLAs'], excluded: [] };
    return { included: [], excluded: [] };
  };

  const activePlanCode = (
    currentSubscription?.plan?.code ||
    currentSubscription?.code ||
    currentSubscription?.planCode ||
    currentSubscription?.plan_code ||
    ''
  ).toUpperCase();

  const displayPlans = plans && plans.length > 0 ? plans : fallbackPlans;

  return (
    <div ref={containerRef} className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-8 pt-2 font-sans space-y-6">

      {/* ── Page Header ── */}
      <div className="bg-white dark:bg-[#111111] border border-neutral-200/90 dark:border-[#262626] rounded-3xl overflow-hidden shadow-sm">
        <div className="flex flex-col lg:flex-row items-stretch">

          {/* Left: Hero */}
          <div className="flex-1 p-6 sm:p-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-[#6c48ff] dark:text-purple-300 text-xs font-semibold border border-purple-100 dark:border-purple-900/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plans &amp; Subscription Pricing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
              Flexible Pricing Built for Your AI Team
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-lg">
              Scale workspace seats, active agents, and AI task units with zero hidden fees. Upgrade or adjust anytime.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
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

          {/* Right: Billing controls */}
          <div className="lg:w-80 bg-neutral-50/80 dark:bg-[#171717] border-t lg:border-t-0 lg:border-l border-neutral-200/80 dark:border-[#333333] p-6 flex flex-col justify-center gap-4">
            <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Customize Billing</span>

            <div>
              <p className="text-[10.5px] text-neutral-400 dark:text-neutral-500 font-semibold mb-1.5">Currency</p>
              <div className="bg-white dark:bg-[#1a1a1a] p-1 rounded-xl border border-neutral-200 dark:border-[#333333] flex">
                <button type="button" onClick={() => setRegion('INDIA_INR')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${region === 'INDIA_INR' ? 'bg-[#6c48ff] text-white shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}>
                  🇮🇳 India (INR ₹)
                </button>
                <button type="button" onClick={() => setRegion('GLOBAL_USD')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${region === 'GLOBAL_USD' ? 'bg-[#6c48ff] text-white shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}>
                  🌐 Global (USD $)
                </button>
              </div>
            </div>

            <div>
              <p className="text-[10.5px] text-neutral-400 dark:text-neutral-500 font-semibold mb-1.5">Billing Cycle</p>
              <div className="bg-white dark:bg-[#1a1a1a] p-1 rounded-xl border border-neutral-200 dark:border-[#333333] flex">
                <button type="button" onClick={() => setBillingCycle('MONTHLY')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${billingCycle === 'MONTHLY' ? 'bg-[#6c48ff] text-white shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}>
                  Monthly
                </button>
                <button type="button" onClick={() => setBillingCycle('ANNUAL')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${billingCycle === 'ANNUAL' ? 'bg-[#6c48ff] text-white shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}>
                  Annual <span className="text-[9.5px] font-black text-emerald-500 ml-0.5">-20%</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Plans Grid ── */}
      <div className="animate-gsap">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-[#111111] border border-neutral-100 dark:border-[#262626] rounded-[24px] p-8 shadow-sm animate-pulse flex flex-col h-[500px]">
                <div className="h-6 w-1/3 bg-neutral-200 dark:bg-[#222222] rounded mb-4"></div>
                <div className="h-10 w-1/2 bg-neutral-200 dark:bg-[#222222] rounded mb-6"></div>
                <div className="h-4 w-full bg-neutral-100 dark:bg-[#1a1a1a] rounded mb-8"></div>
                <div className="space-y-4 mb-auto">
                   <div className="h-4 w-3/4 bg-neutral-100 dark:bg-[#1a1a1a] rounded"></div>
                   <div className="h-4 w-5/6 bg-neutral-100 dark:bg-[#1a1a1a] rounded"></div>
                   <div className="h-4 w-4/5 bg-neutral-100 dark:bg-[#1a1a1a] rounded"></div>
                   <div className="h-4 w-3/4 bg-neutral-100 dark:bg-[#1a1a1a] rounded"></div>
                </div>
                <div className="h-12 w-full bg-neutral-200 dark:bg-[#222222] rounded-xl mt-8"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayPlans.map((p, idx) => {
              const isCurrent = activePlanCode === p.code;
              const isPopular = p.popular || p.code === 'TEAM';
              const isEnterprise = p.custom || p.code === 'ENTERPRISE';
              const isExpanded = !!expandedPlans[p.code || idx];

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
              const { included, excluded } = getPlanFeatures(p);
              const maxInitial = 5;
              const totalCount = included.length + excluded.length;
              const hasMore = totalCount > maxInitial;
              const visibleIncluded = isExpanded ? included : included.slice(0, maxInitial);
              const visibleExcluded = isExpanded
                ? excluded
                : included.length < maxInitial ? excluded.slice(0, maxInitial - included.length) : [];

              // Card border & shadow style
              let cardClass = 'bg-white dark:bg-[#111111] border shadow-sm hover:shadow-md';
              if (isCurrent) cardClass = 'bg-white dark:bg-[#111111] border-2 border-[#4F46E5] shadow-xl shadow-indigo-500/10 ring-4 ring-indigo-500/5';
              else if (isPopular) cardClass = 'bg-white dark:bg-[#111111] border-2 border-purple-500/60 dark:border-purple-700/50 shadow-lg shadow-purple-500/10';
              else cardClass += ' border-neutral-200/90 dark:border-[#262626]';

              return (
                <div key={p.code || idx} className={`relative rounded-2xl flex flex-col transition-all duration-300 ${cardClass}`}>

                  {/* Accent stripe */}
                  {(isCurrent || isPopular) && (
                    <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${isCurrent ? 'bg-[#4F46E5]' : 'bg-purple-500'}`} />
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    {/* Badge row */}
                    <div className="h-7 mb-2 flex items-center">
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1.5 bg-[#4F46E5] text-white text-[9.5px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse"></span>
                          Current Plan
                        </span>
                      ) : isPopular ? (
                        <span className="inline-flex items-center gap-1 bg-purple-600 text-white text-[9.5px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          ⭐ Most Popular
                        </span>
                      ) : null}
                    </div>

                    {/* Name & description */}
                    <h4 className="text-base font-bold text-neutral-900 dark:text-white mb-1 font-['Space_Grotesk']">{p.name || p.code}</h4>
                    <p className="text-[11.5px] text-neutral-500 dark:text-neutral-400 leading-normal mb-4 min-h-[40px]">{p.desc || p.description}</p>

                    {/* Price */}
                    <div className="mb-4 pb-3 border-b border-neutral-100 dark:border-[#262626]">
                      {isEnterprise ? (
                        <div>
                          <div className="text-xl font-bold text-neutral-900 dark:text-white font-['Space_Grotesk']">Custom Pricing</div>
                          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">Tailored to your organization</p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight font-['Space_Grotesk']">
                              {symbol}{displayPrice !== null ? displayPrice.toLocaleString() : '0'}
                            </span>
                            <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">/mo</span>
                          </div>
                          {billingCycle === 'ANNUAL' && displayPrice && (
                            <p className="text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                              Billed {symbol}{(displayPrice * 12).toLocaleString()} / year
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <div className="mb-4">
                      {isCurrent ? (
                        <div className="w-full py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 text-xs font-bold text-center border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Active Plan
                        </div>
                      ) : isEnterprise ? (
                        <button
                          onClick={() => window.open('mailto:sales@kaynetics.com', '_blank')}
                          className="w-full py-2.5 rounded-xl border border-neutral-300 dark:border-[#363b52] hover:bg-neutral-50 dark:hover:bg-[#262626] text-neutral-900 dark:text-neutral-200 text-xs font-bold transition-all"
                        >
                          Contact Sales →
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubscribe(p.code)}
                          disabled={checkoutLoading === p.code}
                          className={`w-full py-2.5 rounded-xl text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 ${isPopular ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#4F46E5] hover:bg-[#3730B8]'}`}
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

                    {/* Features */}
                    <div className="space-y-2 pt-3 border-t border-neutral-100 dark:border-[#262626] flex-1">
                      <span className="text-[10px] font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-1.5">
                        Included Features
                      </span>

                      <div className="space-y-2">
                        {visibleIncluded.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2 text-[11.5px] text-neutral-700 dark:text-neutral-200 font-medium">
                            <span className="w-4 h-4 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[9.5px] font-black shrink-0 mt-px">✓</span>
                            <span className="leading-snug">{feat}</span>
                          </div>
                        ))}
                        {visibleExcluded.map((offFeat, oIdx) => (
                          <div key={oIdx} className="flex items-start gap-2 text-[11.5px] text-neutral-400 dark:text-neutral-600">
                            <span className="w-4 h-4 rounded bg-neutral-100 dark:bg-[#1a1a1a] text-neutral-400 dark:text-neutral-600 flex items-center justify-center text-[9.5px] font-black shrink-0 mt-px">–</span>
                            <span className="leading-snug line-through">{offFeat}</span>
                          </div>
                        ))}
                      </div>

                      {hasMore && !isExpanded && (
                        <button
                          onClick={() => toggleExpandPlan(p.code || idx)}
                          className="w-full mt-2.5 pt-2 border-t border-dashed border-neutral-200 dark:border-[#333333] text-left text-[11px] font-bold text-[#4F46E5] dark:text-indigo-400 hover:text-[#3730B8] dark:hover:text-indigo-300 flex items-center justify-between transition-colors group"
                        >
                          <span>Show all features ({totalCount})</span>
                          <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                        </button>
                      )}

                      {isExpanded && (
                        <button
                          onClick={() => toggleExpandPlan(p.code || idx)}
                          className="w-full mt-2.5 pt-2 border-t border-dashed border-neutral-200 dark:border-[#333333] text-left text-[11px] font-bold text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center justify-between transition-colors"
                        >
                          <span>Show fewer features</span>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Capacity Add-ons ── */}
      {addOns && addOns.length > 0 && (
        <div className="animate-gsap bg-white dark:bg-[#111111] border border-neutral-200/80 dark:border-[#262626] rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white font-['Space_Grotesk']">Available Capacity Add-Ons</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Add extra user seats and task top-ups on demand</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {addOns.map((addon) => {
              const price = region === 'INDIA_INR' ? `₹${addon.priceInr?.toLocaleString()}` : `$${addon.priceUsd}`;
              return (
                <div key={addon.id} className="bg-neutral-50/70 dark:bg-[#171717] border border-neutral-200/60 dark:border-[#333333] rounded-xl p-3.5 hover:bg-neutral-50 dark:hover:bg-[#1e2232] transition">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-neutral-900 dark:text-white text-xs">{addon.name}</h4>
                    <span className="text-[#4F46E5] dark:text-indigo-300 font-extrabold text-xs bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">{price}</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{addon.notes || addon.deliveryCondition || 'Prepaid top-up'}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
