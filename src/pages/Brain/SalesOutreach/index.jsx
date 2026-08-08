import React, { useState } from 'react';
import { Package, Settings2, Zap, Users, Mail, CheckCircle } from 'lucide-react';
import SelectProductStep from './components/SelectProductStep';
import DiscoveryConfigStep from './components/DiscoveryConfigStep';
import DiscoveryStreamStep from './components/DiscoveryStreamStep';
import LeadsCRMStep from './components/LeadsCRMStep';
import ReviewSendStep from './components/ReviewSendStep';

const STEPS = [
  { id: 1, name: 'Select Product', icon: Package },
  { id: 2, name: 'Configure', icon: Settings2 },
  { id: 3, name: 'Discover', icon: Zap },
  { id: 4, name: 'Review Leads', icon: Users },
  { id: 5, name: 'Send', icon: Mail },
];

export default function SalesOutreach() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [discoveryConfig, setDiscoveryConfig] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [generatedDrafts, setGeneratedDrafts] = useState([]);

  return (
    <div className="flex flex-col h-full bg-[#f4f7fe] dark:bg-[#000000] animate-fade-in relative z-10">
      {/* Header */}
      <div className="px-8 py-6 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black relative z-20 flex flex-col justify-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
            Sales Outreach
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">AI Lead Generation & Campaign Manager</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="px-8 py-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black relative z-20">
        <div className="flex items-center max-w-5xl mx-auto justify-between">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isPast = currentStep > step.id;

            return (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold transition-colors ${
                    isActive ? 'bg-[#6c48ff] text-white' :
                    isPast ? 'bg-emerald-500 text-white' :
                    'bg-neutral-100 dark:bg-[#1a1a1a] text-neutral-400'
                  }`}>
                    {isPast ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold transition-colors ${isActive || isPast ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>
                      {step.name}
                    </p>
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`h-[2px] flex-1 mx-4 rounded-full transition-colors ${isPast ? 'bg-emerald-500' : 'bg-neutral-200 dark:bg-neutral-800'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        <div className="w-full h-full flex flex-col">
          <div className="bg-white dark:bg-[#0f0f0f] rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-8 flex flex-col relative min-h-[600px]">
            
            {/* Step 1: Select Product */}
            {currentStep === 1 && (
              <SelectProductStep
                onSelectProduct={(product) => {
                  setSelectedProduct(product);
                  setCurrentStep(2);
                }}
              />
            )}

            {/* Step 2: Configure Discovery */}
            {currentStep === 2 && (
              <DiscoveryConfigStep
                product={selectedProduct}
                onStart={(config) => {
                  setDiscoveryConfig(config);
                  setCurrentStep(3);
                }}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {/* Step 3: WebSocket Discovery Stream */}
            {currentStep === 3 && (
              <DiscoveryStreamStep
                product={selectedProduct}
                config={discoveryConfig}
                onDone={(sid) => {
                  setSessionId(sid);
                  setCurrentStep(4);
                }}
                onBack={() => setCurrentStep(2)}
              />
            )}

            {/* Step 4: Leads CRM */}
            {currentStep === 4 && (
              <LeadsCRMStep
                sessionId={sessionId}
                onComplete={(leads, sid, drafts) => {
                  setSelectedLeads(leads);
                  setGeneratedDrafts(drafts);
                  setCurrentStep(5);
                }}
                onBack={() => setCurrentStep(3)}
              />
            )}

            {/* Step 5: Review drafts */}
            {currentStep === 5 && (
              <ReviewSendStep
                drafts={generatedDrafts}
                leads={selectedLeads}
                sessionId={sessionId}
                onBack={() => setCurrentStep(4)}
              />
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
