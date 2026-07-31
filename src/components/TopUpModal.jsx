import React, { useState, useEffect } from 'react';
import { X, Zap, Image as ImageIcon, Search, ShoppingCart, Info, Loader2, CheckCircle2 } from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';
import { toast } from 'react-toastify';

// ── Rate table (matches backend spec) ─────────────────────────────────────────
const RATES = {
  INDIA_INR: {
    currency: 'INR',
    symbol: '₹',
    task: 0.5,
    image: 5.0,
    research: 1.0,
  },
  GLOBAL_USD: {
    currency: 'USD',
    symbol: '$',
    task: 0.01,
    image: 0.10,
    research: 0.02,
  },
};

const MIN_QTY = 0;
const STEP = { task: 10, image: 1, research: 5 };

// ── Utility ───────────────────────────────────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── Resource Row ──────────────────────────────────────────────────────────────
function ResourceRow({ icon, label, color, qty, step, rate, symbol, onChange }) {
  const lineTotal = qty * rate;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200/70 dark:border-[#333333] transition-all">
      {/* Icon + label */}
      <div className="flex items-center gap-3 min-w-[160px]">
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        <div>
          <p className="text-sm font-bold text-neutral-800 dark:text-white">{label}</p>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
            {symbol}{rate.toFixed(2)} / unit
          </p>
        </div>
      </div>

      {/* Qty control */}
      <div className="flex items-center gap-2 flex-1">
        <button
          onClick={() => onChange(Math.max(MIN_QTY, qty - step))}
          className="w-8 h-8 rounded-lg border border-neutral-200 dark:border-[#363b52] bg-white dark:bg-[#111111] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#262626] font-bold text-lg leading-none transition-colors flex items-center justify-center select-none"
        >−</button>

        <input
          type="number"
          min={MIN_QTY}
          step={step}
          value={qty}
          onChange={(e) => onChange(Math.max(MIN_QTY, parseInt(e.target.value) || 0))}
          className="w-20 text-center text-sm font-bold bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#363b52] text-neutral-900 dark:text-white rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors"
        />

        <button
          onClick={() => onChange(qty + step)}
          className="w-8 h-8 rounded-lg border border-neutral-200 dark:border-[#363b52] bg-white dark:bg-[#111111] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#262626] font-bold text-lg leading-none transition-colors flex items-center justify-center select-none"
        >+</button>
      </div>

      {/* Line total */}
      <div className="text-right min-w-[72px]">
        <p className="text-sm font-black text-neutral-900 dark:text-white font-['Space_Grotesk']">
          {symbol}{lineTotal.toFixed(2)}
        </p>
        {qty > 0 && (
          <p className="text-[10.5px] text-neutral-400 dark:text-neutral-500">{qty} units</p>
        )}
      </div>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function TopUpModal({ organizationId, region = 'INDIA_INR', onClose, onSuccess }) {
  const [taskQty, setTaskQty] = useState(50);
  const [imageQty, setImageQty] = useState(0);
  const [researchQty, setResearchQty] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const rates = RATES[region] || RATES.INDIA_INR;
  const { symbol, currency, task: taskRate, image: imageRate, research: researchRate } = rates;

  const total =
    taskQty * taskRate +
    imageQty * imageRate +
    researchQty * researchRate;

  const hasItems = taskQty > 0 || imageQty > 0 || researchQty > 0;

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handlePay = async () => {
    if (!hasItems) {
      toast.warn('Please select at least one resource to top-up.');
      return;
    }
    setLoading(true);
    try {
      // 1. Create order — apiClient interceptor auto-unwraps { success, data } envelope
      //    so orderData IS already the inner data object: { razorpayOrderId, keyId, amount, ... }
      const orderData = await subscriptionService.createDynamicTopUpOrder(
        organizationId,
        taskQty,
        imageQty,
        researchQty,
        region
      );

      if (!orderData?.razorpayOrderId) {
        throw new Error('Order creation failed — no Razorpay order ID returned.');
      }

      const { razorpayOrderId, keyId, amount, currency: orderCurrency } = orderData;

      // 2. Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) throw new Error('Razorpay SDK failed to load.');

      // 3. Open checkout
      const rzpOptions = {
        key: keyId,
        amount,
        currency: orderCurrency,
        name: 'Kaynetics Agentic Platform',
        description: buildDescription(taskQty, imageQty, researchQty),
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            const verifyData = await subscriptionService.verifyDynamicTopUpPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              taskUnits: taskQty,
              imageUnits: imageQty,
              researchUnits: researchQty,
            });

            // verifyData is the already-unwrapped inner data object: { organizationId, topUps, ... }
            if (verifyData?.organizationId || verifyData?.success || Array.isArray(verifyData?.topUps)) {
              setPaid(true);
              toast.success('Credits added to your organization! 🎉');
              onSuccess?.();
            } else {
              throw new Error(verifyData?.message || 'Payment verification failed.');
            }
          } catch (e) {
            toast.error(e.message || 'Verification error. Contact support.');
          }
        },
        modal: {
          ondismiss: () => { setLoading(false); },
        },
        prefill: {},
        theme: { color: '#6366f1' },
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.on('payment.failed', (resp) => {
        toast.error(`Payment failed: ${resp.error?.description || 'Unknown error'}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to initiate top-up.');
      setLoading(false);
    }
  };

  return (
    // ── Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      {/* ── Panel */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#111111] border border-neutral-200/80 dark:border-[#262626] rounded-2xl shadow-2xl shadow-black/30 flex flex-col overflow-hidden animate-scale-in">

        {/* ── Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-[#262626] bg-neutral-50/50 dark:bg-[#171717]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/60">
              <ShoppingCart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Top-Up Credits</h2>
              <p className="text-[10.5px] text-neutral-400 dark:text-neutral-500">Dynamic per-unit purchase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#262626] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Success State */}
        {paid ? (
          <div className="flex flex-col items-center justify-center gap-4 py-14 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">Payment Successful!</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Your credits have been added to the organization.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730B8] text-white text-sm font-bold transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* ── Body */}
            <div className="p-5 space-y-3 overflow-y-auto max-h-[60vh]">
              {/* Info Banner */}
              <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/30">
                <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[11.5px] text-indigo-700 dark:text-indigo-300 font-medium leading-relaxed">
                  Credits are added instantly after payment and stack on top of your plan allowance.
                  Region: <span className="font-black">{region === 'INDIA_INR' ? 'India (₹ INR)' : 'Global ($ USD)'}</span>
                </p>
              </div>

              {/* Resource rows */}
              <ResourceRow
                icon={<Zap className="w-4 h-4 text-indigo-600" />}
                label="AI Tasks"
                color="bg-indigo-50 dark:bg-indigo-950/50"
                qty={taskQty}
                step={STEP.task}
                rate={taskRate}
                symbol={symbol}
                onChange={setTaskQty}
              />
              <ResourceRow
                icon={<ImageIcon className="w-4 h-4 text-sky-500" />}
                label="Image Generations"
                color="bg-sky-50 dark:bg-sky-950/50"
                qty={imageQty}
                step={STEP.image}
                rate={imageRate}
                symbol={symbol}
                onChange={setImageQty}
              />
              <ResourceRow
                icon={<Search className="w-4 h-4 text-emerald-600" />}
                label="Research Runs"
                color="bg-emerald-50 dark:bg-emerald-950/50"
                qty={researchQty}
                step={STEP.research}
                rate={researchRate}
                symbol={symbol}
                onChange={setResearchQty}
              />
            </div>

            {/* ── Footer */}
            <div className="px-5 py-4 border-t border-neutral-100 dark:border-[#262626] bg-neutral-50/50 dark:bg-[#171717] flex items-center justify-between gap-4">
              {/* Total */}
              <div>
                <p className="text-[10.5px] text-neutral-400 dark:text-neutral-500 font-medium uppercase tracking-wider">
                  Total
                </p>
                <p className="text-xl font-black text-neutral-900 dark:text-white font-['Space_Grotesk']">
                  {symbol}{total.toFixed(2)}{' '}
                  <span className="text-xs font-semibold text-neutral-400">{currency}</span>
                </p>
                {!hasItems && (
                  <p className="text-[10.5px] text-amber-500 font-medium mt-0.5">Select at least one unit</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-[#363b52] text-neutral-600 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-[#262626] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePay}
                  disabled={loading || !hasItems}
                  className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730B8] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Processing…</span></>
                  ) : (
                    <><ShoppingCart className="w-3.5 h-3.5" /><span>Pay {symbol}{total.toFixed(2)}</span></>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildDescription(tasks, images, research) {
  const parts = [];
  if (tasks > 0) parts.push(`${tasks} Tasks`);
  if (images > 0) parts.push(`${images} Images`);
  if (research > 0) parts.push(`${research} Research Runs`);
  return parts.length > 0 ? `Top-Up: ${parts.join(', ')}` : 'Credit Top-Up';
}
