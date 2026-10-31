import React, { useState } from 'react';
import { 
  X, MapPin, Bell, Sparkles, CheckCircle2, 
  BookMarked, GraduationCap, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { locationDemandService } from '../../services/locationDemandService';
import { useToast } from '../../context/ToastContext';

interface RegisterInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'LIBRARY' | 'TEACHER';
  stateName: string;
  districtName: string;
  localityName?: string;
  facility?: string;
  classGrade?: string;
  subject?: string;
}

export const RegisterInterestModal: React.FC<RegisterInterestModalProps> = ({
  isOpen,
  onClose,
  type,
  stateName,
  districtName,
  localityName,
  facility = 'All Facility',
  classGrade = 'Class 10',
  subject = 'All Subjects'
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile && !email) {
      showToast('Please provide at least a phone number or email for notifications', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (type === 'LIBRARY') {
        locationDemandService.recordLibraryDemand({
          state: stateName || 'Uttar Pradesh',
          district: districtName,
          locality: localityName || 'District Wide',
          facility: facility,
          contact: {
            name: name.trim() || undefined,
            phone: mobile.trim() || undefined,
            email: email.trim() || undefined,
            notes: notes.trim() || undefined
          }
        });
      } else {
        locationDemandService.recordTeacherDemand({
          state: stateName || 'Uttar Pradesh',
          district: districtName,
          locality: localityName || 'District Wide',
          classGrade: classGrade,
          subject: subject,
          contact: {
            name: name.trim() || undefined,
            phone: mobile.trim() || undefined,
            email: email.trim() || undefined,
            notes: notes.trim() || undefined
          }
        });
      }

      setIsSubmitted(true);
      showToast('Your interest has been recorded! Our District Team will notify you.', 'success');
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
      }, 2200);
    } catch {
      showToast('Failed to record interest. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Accent Bar */}
        <div className={`h-2 w-full ${type === 'LIBRARY' ? 'bg-gradient-to-r from-amber-500 to-brand-600' : 'bg-gradient-to-r from-brand-600 to-emerald-500'}`} />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-5">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-950">Thank You for Registering!</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                We have notified our District Administration about student demand in <strong>{localityName || districtName}</strong>. You will receive an instant notification once an accredited provider is approved.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black uppercase tracking-wider">
                  <Bell className="w-3.5 h-3.5 text-amber-600" />
                  <span>Expansion Registry</span>
                </div>
                <h3 className="text-2xl font-black text-slate-950 tracking-tight">
                  {type === `LIBRARY` ? "ZYZU'S is Coming to Your Area" : `We Are Expanding to Your Area`}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {type === 'LIBRARY'
                    ? `Currently, there are no listed ZYZU'S study libraries in ${localityName ? `${localityName}, ` : ''}${districtName}. Register your interest below to expedite expansion and get prioritized access.`
                    : `Currently, there are no verified home tutors in ${localityName ? `${localityName}, ` : ''}${districtName} for ${classGrade} (${subject}). Leave your requirement below for priority matching.`}
                </p>
              </div>

              {/* Location Summary Tag */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-700">
                <span className="flex items-center gap-1.5 font-bold">
                  <MapPin className="w-4 h-4 text-brand-600" />
                  <span>{localityName ? `${localityName}, ` : ''}{districtName}, {stateName}</span>
                </span>
                <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  {type === 'LIBRARY' ? facility : `${classGrade} • ${subject}`}
                </span>
              </div>

              <div className="space-y-3 pt-1">
                <Input
                  label="Your Name (Optional)"
                  placeholder="e.g. Ramesh Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Mobile Number (WhatsApp)"
                    placeholder="10-digit number"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                  <Input
                    label="Email Address"
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Specific Requirement or Locality Landmark
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Near Railway Station or Block Road, require full-day AC shift..."
                    className="w-full rounded-xl bg-white border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full justify-center py-3 text-sm font-black shadow-lg shadow-brand-500/25 bg-brand-600 hover:bg-brand-700 text-white rounded-xl"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Notify Me When Available
                </Button>
              </div>

              <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero spam guarantee. Your details are private and handled by District Admin.</span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
