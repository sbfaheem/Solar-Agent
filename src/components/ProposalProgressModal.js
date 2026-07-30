'use client';

import React from 'react';

export default function ProposalProgressModal({ isOpen, currentStep, proposalId, customerEmail }) {
  if (!isOpen) return null;

  const steps = [
    { id: 1, label: 'Saving Data...', desc: 'Writing customer information & configuration to database', icon: 'database' },
    { id: 2, label: 'Generating PDF...', desc: 'Compiling high-resolution engineering proposal letterhead', icon: 'picture_as_pdf' },
    { id: 3, label: 'Uploading PDF...', desc: 'Uploading document to secure cloud storage', icon: 'cloud_upload' },
    { id: 4, label: 'Sending Email...', desc: `Dispatching PDF attachment to ${customerEmail || 'customer email'}`, icon: 'mail' },
    { id: 5, label: 'Completed', desc: `Proposal ${proposalId || ''} ready & sent!`, icon: 'check_circle' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#181a1d] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl animate-scaleUp text-slate-900 dark:text-white">
        
        <div className="text-center space-y-2">
          <div className="size-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-[#b45309] dark:text-amber-400 flex items-center justify-center font-bold shadow-md">
            <span className="material-symbols-outlined text-3xl animate-spin">
              {currentStep === 5 ? 'check_circle' : 'sync'}
            </span>
          </div>
          <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
            Processing Solar Proposal
          </h3>
          <p className="text-xs text-slate-500 font-medium font-mono">
            {proposalId ? `Reference ID: ${proposalId}` : 'Automated engineering workflow active'}
          </p>
        </div>

        {/* Vertical Stepper List */}
        <div className="space-y-4 font-mono text-xs">
          {steps.map((step) => {
            const isDone = currentStep > step.id || (currentStep === 5 && step.id === 5);
            const isCurrent = currentStep === step.id && currentStep !== 5;
            
            return (
              <div 
                key={step.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                  isDone 
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                    : isCurrent
                    ? 'border-[#b45309] dark:border-amber-700 bg-amber-50/80 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 ring-2 ring-[#b45309]/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20 text-slate-400 opacity-60'
                }`}
              >
                <div className={`size-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-[#b45309] text-white animate-pulse'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  {isDone ? (
                    <span className="material-symbols-outlined text-base">check</span>
                  ) : (
                    <span className="material-symbols-outlined text-base">{step.icon}</span>
                  )}
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="font-bold font-sans text-xs flex justify-between items-center">
                    <span>{step.label}</span>
                    {isDone && <span className="text-[10px] text-emerald-600 font-bold uppercase">Done ✓</span>}
                    {isCurrent && <span className="text-[10px] text-[#b45309] font-bold uppercase animate-pulse">In Progress...</span>}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
