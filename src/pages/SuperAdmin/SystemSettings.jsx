import React, { useEffect, useState } from 'react';
import { superAdminService } from '../../services/superAdminService';
import { Settings, Save, RefreshCw, ToggleLeft, ToggleRight, Shield, Sliders } from 'lucide-react';
import { toast } from 'react-toastify';

export default function SystemSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [globalAiLimit, setGlobalAiLimit] = useState(5000);
  const [allowSelfSignup, setAllowSelfSignup] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await superAdminService.getSettings();
      setSettings(res || []);
      // Pre-fill state if matching key exists
      res?.forEach((s) => {
        if (s.key === 'MAINTENANCE_MODE') setMaintenanceMode(Boolean(s.value));
        if (s.key === 'GLOBAL_AI_DAILY_LIMIT') setGlobalAiLimit(Number(s.value));
        if (s.key === 'ALLOW_SELF_SIGNUP') setAllowSelfSignup(Boolean(s.value));
      });
    } catch (err) {
      console.error('Failed to load system settings:', err);
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSetting = async (key, category, value) => {
    try {
      await superAdminService.upsertSetting(key, category, value);
      toast.success(`Saved setting ${key}`);
      fetchSettings();
    } catch (err) {
      toast.error(`Failed to save ${key}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-400" /> Global Platform Settings & Feature Flags
        </h2>
        <p className="text-sm text-neutral-400">Control system-wide operational flags, global rate limits, maintenance toggles, and security policies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Maintenance Mode */}
        <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Platform Maintenance Mode</h3>
              <p className="text-xs text-neutral-400 mt-1">Temporarily block non-superadmin access for scheduled platform upgrades.</p>
            </div>
            <button
              onClick={() => {
                const next = !maintenanceMode;
                setMaintenanceMode(next);
                handleSaveSetting('MAINTENANCE_MODE', 'SYSTEM', next);
              }}
              className="text-amber-400"
            >
              {maintenanceMode ? <ToggleRight className="w-10 h-10 text-amber-400" /> : <ToggleLeft className="w-10 h-10 text-neutral-600" />}
            </button>
          </div>
        </div>

        {/* Self Signup */}
        <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Public Registration (Self Signup)</h3>
              <p className="text-xs text-neutral-400 mt-1">Allow new users to register organizations via public pricing plans.</p>
            </div>
            <button
              onClick={() => {
                const next = !allowSelfSignup;
                setAllowSelfSignup(next);
                handleSaveSetting('ALLOW_SELF_SIGNUP', 'SYSTEM', next);
              }}
              className="text-amber-400"
            >
              {allowSelfSignup ? <ToggleRight className="w-10 h-10 text-emerald-400" /> : <ToggleLeft className="w-10 h-10 text-neutral-600" />}
            </button>
          </div>
        </div>

        {/* Global AI Daily Limit */}
        <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4 md:col-span-2">
          <h3 className="font-bold text-white text-base">Global AI Daily Token Limit per Tenant</h3>
          <p className="text-xs text-neutral-400">Hard limit on total AI tokens an organization can execute per day across all models.</p>

          <div className="flex items-center gap-3">
            <input
              type="number"
              value={globalAiLimit}
              onChange={(e) => setGlobalAiLimit(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white w-64 focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={() => handleSaveSetting('GLOBAL_AI_DAILY_LIMIT', 'AI', Number(globalAiLimit))}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Limit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
