import React, { useState } from 'react';
import { Target, Users, Mail, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import SelectProductStep from './components/SelectProductStep';
import ICPStep from './components/ICPStep';
import LeadsCRMStep from './components/LeadsCRMStep';
import ReviewSendStep from './components/ReviewSendStep';

const STEPS = [
  { id: 1, name: 'Product Setup', icon: Target },
  { id: 2, name: 'Lead Discovery', icon: Users },
  { id: 3, name: 'Draft Generation', icon: Mail },
  { id: 4, name: 'Review & Send', icon: CheckCircle }
];

export default function SalesOutreach() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeIcp, setActiveIcp] = useState(null);
  const [discoveredLeads, setDiscoveredLeads] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  
  return (
    <div className="flex flex-col h-full bg-[#f4f7fe] dark:bg-[#000000] animate-fade-in relative z-10">
      {/* Header */}
      <div className="px-8 py-6 border-b border-neutral-200 dark:border-neutral-800/50 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Sales Outreach</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">SAM - AI Lead Generation & Email Campaign Manager</p>
        </div>
      </div>
      
      {/* Step Indicator */}
      <div className="px-8 py-4 border-b border-neutral-200 dark:border-neutral-800/50 bg-white/50 dark:bg-[#0a0a0a]/50 shrink-0">
         <div className="flex items-center max-w-4xl mx-auto justify-between">
           {STEPS.map((step, idx) => {
             const Icon = step.icon;
             const isActive = currentStep === step.id;
             const isPast = currentStep > step.id;
             
             return (
               <React.Fragment key={step.id}>
                 <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                     isActive ? 'bg-[#6c48ff] text-white shadow-lg shadow-[#6c48ff]/20' : 
                     isPast ? 'bg-emerald-500 text-white' : 
                     'bg-neutral-100 dark:bg-[#1a1a1a] text-neutral-400 dark:text-neutral-500'
                   }`}>
                     {isPast ? <CheckCircle className="w-5 h-5" /> : step.id}
                   </div>
                   <div>
                     <p className={`text-sm font-semibold ${isActive || isPast ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500'}`}>
                       {step.name}
                     </p>
                   </div>
                 </div>
                 {idx < STEPS.length - 1 && (
                   <div className={`h-[2px] flex-1 mx-4 rounded-full ${isPast ? 'bg-emerald-500' : 'bg-neutral-200 dark:bg-neutral-800'}`} />
                 )}
               </React.Fragment>
             );
           })}
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-5xl mx-auto h-full flex flex-col">
           {/* Render steps based on currentStep */}
           <div className="flex-1 bg-white dark:bg-[#111111] rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-8 flex flex-col relative">
             {currentStep === 1 && (
               <SelectProductStep 
                 onSelectProduct={(product) => {
                   setSelectedProduct(product);
                   setCurrentStep(2);
                 }} 
               />
             )}
             {currentStep === 2 && (
               <ICPStep 
                 product={selectedProduct}
                 onComplete={(icp) => {
                   setActiveIcp(icp);
                   setCurrentStep(3);
                 }}
                 onBack={() => setCurrentStep(1)}
               />
             )}
             {currentStep === 3 && (
               <LeadsCRMStep
                 activeIcp={activeIcp}
                 onComplete={(leads, sessionId) => {
                   setDiscoveredLeads(leads);
                   setActiveSessionId(sessionId);
                   setCurrentStep(4);
                 }}
                 onBack={() => setCurrentStep(2)}
               />
             )}
             {currentStep === 4 && (
               <ReviewSendStep
                 leads={discoveredLeads}
                 sessionId={activeSessionId}
                 onBack={() => setCurrentStep(3)}
               />
             )}
           </div>
           
           
           {/* Wizard Controls */}
           {/* Hide generic controls for active steps that manage their own buttons */}
           {currentStep > 2 && (
             <div className="flex justify-between items-center mt-6 shrink-0">
               <button
                 onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                 disabled={currentStep === 1}
                 className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-neutral-200 dark:border-[#333333] text-neutral-600 dark:text-neutral-300 font-bold hover:bg-neutral-50 dark:hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
               >
                 <ChevronLeft className="w-4 h-4" /> Back
               </button>
               <button
                 onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                 disabled={currentStep === 4}
                 className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#6c48ff] hover:bg-[#5b3adb] text-white font-bold shadow-md shadow-[#6c48ff]/20 transition-all disabled:opacity-50"
               >
                 Next Step <ChevronRight className="w-4 h-4" />
               </button>
             </div>
           )}
        </div>
      </div>

    </div>
  );
}
