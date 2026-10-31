import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, ShieldCheck, PhoneCall, Mail, BookOpen, Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { BRAND_CONFIG } from '../../config/brand';
import { locationService } from '../../services/locationService';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white pt-14 pb-10 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top 6 Columns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-10 mb-12">
          
          {/* Col 1: Brand & Overview */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <BrandLogo variant="primary" theme="light" size="md" />
            </Link>
            <p className="text-slate-500 text-xs leading-relaxed max-w-sm font-medium">
              India's trusted unified EdTech ecosystem integrating verified home tutors, quiet self-study libraries, curated study materials, and government exam mock test intelligence.
            </p>
            <div className="pt-2 flex flex-col gap-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>Saidpur, Ghazipur 233304, Uttar Pradesh, India</span>
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <a href={`mailto:${BRAND_CONFIG.supportEmail}`} className="hover:text-brand-600 transition-colors">
                  {BRAND_CONFIG.supportEmail}
                </a>
              </span>
              <span className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <a href="tel:+919196434387" className="hover:text-brand-600 transition-colors">
                  +91 91964 34387
                </a>
                <span>/</span>
                <a href="tel:+919569644387" className="hover:text-brand-600 transition-colors">
                  +91 95696 44387
                </a>
              </span>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% KYC & Admin Verified Network</span>
              </span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-950 uppercase tracking-wider text-[11px]">
              Services
            </h4>
            <ul className="space-y-2 font-medium">
              <li><Link to="/find-tutor" className="hover:text-brand-600 transition-colors">Find Home Tutor</Link></li>
              <li><Link to="/find-library" className="hover:text-brand-600 transition-colors">Find Libraries</Link></li>
              <li><Link to="/mock-tests" className="hover:text-brand-600 transition-colors">Mock Tests Center</Link></li>
              <li><Link to="/study-materials" className="hover:text-brand-600 transition-colors">Study Materials</Link></li>
              <li><Link to="/register/teacher" className="text-brand-600 font-bold hover:underline">Apply as Teacher</Link></li>
              <li><Link to="/register/library-owner" className="text-amber-600 font-bold hover:underline">List Your Library</Link></li>
            </ul>
          </div>

          {/* Col 3: Exams */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-950 uppercase tracking-wider text-[11px]">
              Exams
            </h4>
            <ul className="space-y-2 font-medium">
              <li><Link to="/mock-tests?exam=CHS" className="hover:text-brand-600 transition-colors">BHU CHS (Class 9 & 11)</Link></li>
              <li><Link to="/mock-tests?exam=NAVODAYA" className="hover:text-brand-600 transition-colors">Navodaya Vidyalaya (JNVST)</Link></li>
              <li><Link to="/mock-tests?exam=NEET" className="hover:text-brand-600 transition-colors">NEET Foundation & Tests</Link></li>
              <li><Link to="/mock-tests?exam=JEE" className="hover:text-brand-600 transition-colors">JEE Main CBT Series</Link></li>
              <li><Link to="/mock-tests?exam=GOVERNMENT" className="hover:text-brand-600 transition-colors">UP Police & SSC Exams</Link></li>
              <li><Link to="/mock-tests?exam=OLYMPIAD" className="hover:text-brand-600 transition-colors">Olympiad Preparation</Link></li>
            </ul>
          </div>

          {/* Col 4: Resources */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-950 uppercase tracking-wider text-[11px]">
              Resources
            </h4>
            <ul className="space-y-2 font-medium">
              <li><Link to="/study-materials" className="hover:text-brand-600 transition-colors">Study Materials</Link></li>
              <li><Link to="/study-materials" className="hover:text-brand-600 transition-colors">Previous Year Papers</Link></li>
              <li><Link to="/mock-tests" className="hover:text-brand-600 transition-colors">Test Series Analytics</Link></li>
              <li><a href="#help-center" className="hover:text-brand-600 transition-colors">Help Center & FAQ</a></li>
              <li><Link to="/verify/doc" className="hover:text-brand-600 transition-colors">Verify Certificate</Link></li>
              <li><Link to="/about" className="hover:text-brand-600 transition-colors">About {BRAND_CONFIG.name}</Link></li>
            </ul>
          </div>

          {/* Col 5: Legal & Trust */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-950 uppercase tracking-wider text-[11px]">
              Legal & Trust
            </h4>
            <ul className="space-y-2 font-medium">
              <li><Link to="/privacy" className="hover:text-slate-950 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-slate-950 transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund" className="hover:text-slate-950 transition-colors">Refund Policy</Link></li>
              <li><Link to="/subscription-policy" className="hover:text-slate-950 transition-colors">Subscription Policy</Link></li>
              <li><Link to="/content-policy" className="hover:text-slate-950 transition-colors">Content & IP Policy</Link></li>
              <li><Link to="/login" className="text-brand-600 font-bold hover:underline">Authorized Portal Access</Link></li>
            </ul>
          </div>

        </div>

        {/* Pan-India Coverage Banner */}
        <div className="border-t border-slate-100 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600" />
            <span>Active Pan-India Presence:</span>
            <span className="text-slate-800">Uttar Pradesh, Bihar, Delhi NCR, Madhya Pradesh, Rajasthan + All 28 States & 8 UTs</span>
          </div>
          <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            ✓ Enterprise Quality Supervised by District Admins
          </span>
        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>{BRAND_CONFIG.copyright}</p>
          <div className="flex items-center gap-6 font-medium">
            <Link to="/about" className="hover:text-slate-900 transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-slate-900 transition-colors">Contact Support</Link>
            <Link to="/login" className="hover:text-brand-600 font-bold text-slate-700 transition-colors">Portal Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

