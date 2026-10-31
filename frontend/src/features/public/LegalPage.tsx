import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, FileText, RefreshCw, Scale, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LegalPage: React.FC = () => {
  const location = useLocation();
  const path = location.pathname.replace('/', '');

  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'refund' | 'subscription' | 'content'>('privacy');

  useEffect(() => {
    if (path.includes('terms')) setActiveTab('terms');
    else if (path.includes('refund')) setActiveTab('refund');
    else if (path.includes('subscription')) setActiveTab('subscription');
    else if (path.includes('content')) setActiveTab('content');
    else setActiveTab('privacy');
  }, [path]);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-16">
      {/* Header */}
      <section className="bg-slate-950 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            <span>ZYZU'S Platform Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Policies & Legal Terms
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Clear, transparent policies for students, parents, certified educators, and library partners.
          </p>
        </div>
      </section>

      {/* Main Tabs Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 overflow-x-auto shadow-xs mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'privacy' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'terms' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Terms of Service
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('refund')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'refund' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Refund Policy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('subscription')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'subscription' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Subscription Policy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'content' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Content & IP Policy
          </button>
        </div>

        {/* Content Box */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6 text-sm leading-relaxed text-slate-700 font-medium">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-950">Privacy Policy & Student Data Protection</h2>
              <p>
                At ZYZU'S, we strictly safeguard the privacy of students, guardians, educators, and library partners. This privacy statement outlines how personal information and educational records are handled.
              </p>
              <h3 className="text-base font-bold text-slate-900 pt-2">1. Masked Information & Safe Matching</h3>
              <p>
                Student personal phone numbers and precise street addresses are never sold, published publicly, or shared with unverified third parties. All teacher matching is supervised by verified District Admins.
              </p>
              <h3 className="text-base font-bold text-slate-900 pt-2">2. Verification Credentials (KYC)</h3>
              <p>
                Teacher Aadhaar records and academic degrees collected during onboarding are securely stored with restricted administrative access solely for credential authentication and crime-prevention background checks.
              </p>
              <h3 className="text-base font-bold text-slate-900 pt-2">3. Analytics & Performance Intelligence</h3>
              <p>
                Mock test attempts, mistake book records, and study habit analytics are private to the student and their authorized mentors or guardians. Aggregated demand metrics do not disclose personal identifiable records.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-950">Terms of Service & Platform Governance</h2>
              <p>
                By accessing or using the ZYZU'S platform, mobile applications, or affiliated study library centers, you agree to comply with these terms.
              </p>
              <h3 className="text-base font-bold text-slate-900 pt-2">1. Eligibility & Verification</h3>
              <p>
                All educators and library partners must undergo mandatory District Admin KYC verification before offering tuition services or listing study desks.
              </p>
              <h3 className="text-base font-bold text-slate-900 pt-2">2. Code of Conduct in Libraries</h3>
              <p>
                Students reserving seats at ZYZU'S affiliated libraries agree to maintain a silent, study-focused environment. Any breach of discipline may result in seat forfeiture.
              </p>
            </div>
          )}

          {activeTab === 'refund' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-950">Refund & Cancellation Policy</h2>
              <p>
                ZYZU'S follows a transparent, fair refund policy across home tuition bookings, library subscriptions, and digital mock test packages.
              </p>
              <h3 className="text-base font-bold text-slate-900 pt-2">1. Home Tuition Demos & Satisfaction Guarantee</h3>
              <p>
                Every student receives a 1-time verified demo class with their matched tutor. If the educator is not a suitable match, students can request an alternative tutor allotment or a full unutilized balance refund within 7 days.
              </p>
              <h3 className="text-base font-bold text-slate-900 pt-2">2. Library Desks</h3>
              <p>
                Library desk fees can be cancelled with a pro-rata refund before the start of the booked monthly shift cycle.
              </p>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-950">Digital Learning Subscription Policy</h2>
              <p>
                Access to digital study materials, test series, and previous year papers is governed by the student's active plan.
              </p>
              <h3 className="text-base font-bold text-slate-900 pt-2">1. Plan Entitlements</h3>
              <p>
                Free tier accounts can access diagnostic tests and sample study notes. Premium Mock Test Series bundles unlock complete previous year question papers and the Personal Mistake Book intelligence system.
              </p>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-950">Content & Intellectual Property Policy</h2>
              <p>
                All question papers, test items, handwritten notes, and learning materials on ZYZU'S are verified by designated Study Material & Mock Test Operators.
              </p>
              <h3 className="text-base font-bold text-slate-900 pt-2">1. Educational Fair Use</h3>
              <p>
                Past competitive examination questions (CHS, Navodaya, NEET, JEE) are digitized for candidate evaluation, revision, and academic prep. Commercial redistribution is prohibited.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
