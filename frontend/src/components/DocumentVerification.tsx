import React from 'react';
import { CheckCircle2, XCircle, FileText, BadgeCheck, Landmark, ReceiptText } from 'lucide-react';

interface DocumentVerificationProps {
  status: {
    aadhar_verified: boolean;
    pan_verified: boolean;
    salary_slips_verified: boolean;
    bank_statements_verified: boolean;
  };
}

const DocumentVerification: React.FC<DocumentVerificationProps> = ({ status }) => {
  const docs = [
    { label: 'Aadhar Card', verified: status.aadhar_verified, icon: BadgeCheck },
    { label: 'PAN Card', verified: status.pan_verified, icon: FileText },
    { label: 'Salary Slips', verified: status.salary_slips_verified, icon: ReceiptText },
    { label: 'Bank Statement', verified: status.bank_statements_verified, icon: Landmark },
  ];

  return (
    <div className="card-premium h-full p-8 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col">
            <h3 className="text-xl font-black tracking-tight text-slate-900 mb-1">KYC & Compliance</h3>
            <span className="label-caps !text-[10px]">Verification Protocol 4.2</span>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-xl">
            <BadgeCheck className="text-blue-900 opacity-60" size={20} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {docs.map((doc, index) => (
            <div 
              key={index} 
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                doc.verified 
                  ? 'bg-emerald-50/30 border-emerald-100/50' 
                  : 'bg-slate-50 border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${doc.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                  <doc.icon size={16} />
                </div>
                <span className={`text-sm font-bold ${doc.verified ? 'text-emerald-900' : 'text-slate-500 line-through opacity-60'}`}>
                  {doc.label}
                </span>
              </div>
              {doc.verified ? (
                <CheckCircle2 size={18} className="text-emerald-600" />
              ) : (
                <XCircle size={18} className="text-slate-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${docs.every(d => d.verified) ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {docs.every(d => d.verified) ? 'Audit: Fully Verified' : 'Audit: Pending Data'}
          </span>
        </div>
        <button className="text-[11px] font-black uppercase tracking-widest text-blue-900 hover:text-blue-700 transition-colors">
          View Dossier →
        </button>
      </div>
    </div>
  );
};

export default DocumentVerification;
