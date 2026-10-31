import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Copy, 
  Check, 
  Navigation, 
  MessageSquare, 
  PhoneCall, 
  Globe, 
  Sparkles, 
  ArrowUpRight, 
  Radio, 
  Headphones, 
  AlertCircle, 
  ExternalLink,
  Zap,
  Building,
  CheckCheck
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<'TUITION' | 'LIBRARY' | 'FINANCE' | 'PARTNER' | 'ESCALATION'>('TUITION');
  const [district, setDistrict] = useState('Saidpur (Central HQ Zone)');
  const [priority, setPriority] = useState<'STANDARD' | 'HIGH' | 'EMERGENCY'>('STANDARD');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{
    ticketId: string;
    timestamp: string;
    name: string;
    category: string;
    district: string;
  } | null>(null);

  // Copy feedback states
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedPhone1, setCopiedPhone1] = useState(false);
  const [copiedPhone2, setCopiedPhone2] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedTicket, setCopiedTicket] = useState(false);

  // Live IST Time
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      setCurrentTime(new Intl.DateTimeFormat('en-IN', options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string, type: 'address' | 'phone1' | 'phone2' | 'email' | 'ticket') => {
    navigator.clipboard.writeText(text);
    if (type === 'address') {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
      showToast('Office address copied to clipboard', 'info');
    } else if (type === 'phone1') {
      setCopiedPhone1(true);
      setTimeout(() => setCopiedPhone1(false), 2000);
      showToast('Primary helpline copied (+91 91964 34387)', 'info');
    } else if (type === 'phone2') {
      setCopiedPhone2(true);
      setTimeout(() => setCopiedPhone2(false), 2000);
      showToast('Secondary helpline copied (+91 95696 44387)', 'info');
    } else if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
      showToast('Official email copied (focuspoint011@gmail.com)', 'info');
    } else if (type === 'ticket') {
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2000);
      showToast('Ticket Reference ID copied', 'info');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please fill in your name, email, and message payload.', 'warning');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate futuristic quantum dispatch transmission
    setTimeout(() => {
      const ticketId = `ZYZU-SPT-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date();
      setSubmittedTicket({
        ticketId,
        timestamp: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        name,
        category: category === 'TUITION' ? 'Home Tuition Matching' : 
                  category === 'LIBRARY' ? 'Library Space Booking' :
                  category === 'FINANCE' ? 'Billing & Verification' :
                  category === 'PARTNER' ? 'Educator/Owner Partner' : 'Urgent Escalation',
        district,
      });
      setIsSubmitting(false);
      showToast(`Transmission Successful! Ticket ${ticketId} registered with Saidpur HQ.`, 'success');
    }, 900);
  };

  const handleResetForm = () => {
    setSubmittedTicket(null);
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setPriority('STANDARD');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Ambient Cybernetic Grid Background */}
      <div className="relative overflow-hidden pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-10 relative z-10">
          
          {/* Futuristic Command Header & Status HUD */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs shadow-inner backdrop-blur-md">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-mono font-bold tracking-wider text-emerald-400 uppercase text-[11px]">
                OFFICE COMMAND: ONLINE • ACTIVE DISPATCH
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-slate-300 text-[11px] font-semibold">
                LIVE IST: {currentTime || 'CONNECTING...'}
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                Contact <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">ZYZU'S</span> Support
              </h1>
              <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                Official Centralized Communications, District Redressal & Support Command Desk for Students, Parents, Tutors, and Study Library Owners.
              </p>
            </div>

            {/* Quick KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                <div className="text-lg sm:text-xl font-black text-cyan-400 font-mono">&lt; 3 Min</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Voice Response</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">24/7</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WhatsApp Routing</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                <div className="text-lg sm:text-xl font-black text-blue-400 font-mono">99.8%</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resolution SLA</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                <div className="text-lg sm:text-xl font-black text-amber-400 font-mono">233304</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saidpur HQ PIN</div>
              </div>
            </div>
          </div>

          {/* Three Futuristic Core Contact Hub Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            
            {/* CARD 1: Office Headquarters */}
            <div className="group relative rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/50 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-cyan-500/10 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    <Building className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-[10px] font-mono font-bold text-cyan-300 tracking-wider uppercase">
                    HQ NODE
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Office Address
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Central Directorate & Physical District Desk
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                      Saidpur, Ghazipur 233304, Uttar Pradesh, India
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>PIN Code: 233304</span>
                    <span>Zone: IN-UP-GZP</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
                  <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Mon – Sat: 08:00 AM – 09:00 PM IST</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => copyToClipboard('Saidpur, Ghazipur 233304, Uttar Pradesh, India', 'address')}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all border border-slate-700 active:scale-95 cursor-pointer"
                  >
                    {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAddress ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Saidpur,+Ghazipur+233304,+Uttar+Pradesh,+India"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-900/30 active:scale-95"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Route Map</span>
                  </a>
                </div>
              </div>
            </div>

            {/* CARD 2: Dual Mobile Helpline Grid */}
            <div className="group relative rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/50 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-emerald-500/10 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-[10px] font-mono font-bold text-emerald-300 tracking-wider uppercase">
                    VOICE & WA
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Direct Mobile Helplines
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Instant Voice Calling & WhatsApp Concierge
                  </p>
                </div>

                {/* Primary Number */}
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                      Primary Line
                    </span>
                    <button
                      onClick={() => copyToClipboard('9196434387', 'phone1')}
                      className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copy Primary Number"
                    >
                      {copiedPhone1 ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPhone1 ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-sm sm:text-base font-black font-mono text-white tracking-wide">
                      +91 91964 34387
                    </span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href="tel:+919196434387"
                        className="p-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-all"
                        title="Call Primary Line"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href="https://wa.me/919196434387?text=Hello%20ZYZU'S%20Support,%20I%20need%20assistance"
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Secondary Number */}
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/50">
                      Secondary & Escalations
                    </span>
                    <button
                      onClick={() => copyToClipboard('9569644387', 'phone2')}
                      className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copy Secondary Number"
                    >
                      {copiedPhone2 ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPhone2 ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-sm sm:text-base font-black font-mono text-white tracking-wide">
                      +91 95696 44387
                    </span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href="tel:+919569644387"
                        className="p-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-all"
                        title="Call Secondary Line"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href="https://wa.me/919569644387?text=Hello%20ZYZU'S%20Support,%20I%20have%20an%20urgent%20escalation"
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://wa.me/919196434387?text=Hello%20ZYZU'S%20Support,%20I%20need%20assistance"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-950/40 active:scale-98"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Launch Direct WhatsApp Chat</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* CARD 3: Electronic Mail & Verification Hub */}
            <div className="group relative rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-blue-500/50 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-blue-500/10 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-[10px] font-mono font-bold text-blue-300 tracking-wider uppercase">
                    OFFICIAL MAIL
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Official Email Desk
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct Administrative Mail & Verification
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-blue-400 font-bold block">
                      Primary Support Email
                    </span>
                    <p className="text-xs sm:text-sm font-bold font-mono text-white break-all">
                      focuspoint011@gmail.com
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Platform Secondary:</span>
                    <span className="font-mono text-slate-300">support@zyzus.com</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>256-Bit SSL Redressal &amp; Audit Trail</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => copyToClipboard('focuspoint011@gmail.com', 'email')}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all border border-slate-700 active:scale-95 cursor-pointer"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <a
                    href="mailto:focuspoint011@gmail.com?subject=Support%20Inquiry%20-%20ZYZU'S%20Platform"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-900/30 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Mail</span>
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Interactive Futuristic Transmission Deck & Radar Map Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 Columns: Futuristic Interactive Transmission Form */}
            <div className="lg:col-span-7 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              {submittedTicket ? (
                /* Holographic Ticket Receipt */
                <div className="py-6 space-y-6 animate-in fade-in zoom-in duration-300">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-white">Transmission Authenticated</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Your inquiry payload has been logged on the Saidpur District Operations Queue and assigned an authorized tracking voucher.
                    </p>
                  </div>

                  {/* Holographic Voucher Card */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 relative space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">VOUCHER TICKET REF</span>
                        <span className="text-base font-black font-mono text-emerald-400">{submittedTicket.ticketId}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(submittedTicket.ticketId, 'ticket')}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedTicket ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedTicket ? 'Copied' : 'Copy Ref'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Applicant</span>
                        <span className="font-semibold text-slate-200">{submittedTicket.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Category</span>
                        <span className="font-semibold text-slate-200">{submittedTicket.category}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Designated Node</span>
                        <span className="font-semibold text-cyan-400">{submittedTicket.district}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Timestamp (IST)</span>
                        <span className="font-mono text-slate-300 text-[11px]">{submittedTicket.timestamp}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>An operations officer from the Saidpur Desk will follow up within 24 hours.</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <a
                      href={`https://wa.me/919196434387?text=Hello%20ZYZU'S%20Support,%20I%20have%20submitted%20inquiry%20voucher%20${submittedTicket.ticketId}%20for%20${encodeURIComponent(submittedTicket.category)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/30"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Forward Ticket to WhatsApp</span>
                    </a>
                    
                    <button
                      onClick={handleResetForm}
                      className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                    >
                      New Transmission
                    </button>
                  </div>
                </div>
              ) : (
                /* Interactive Submission Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <h2 className="text-lg font-black text-white">Quantum Dispatch Console</h2>
                    </div>
                    <p className="text-xs text-slate-400">
                      Submit an inquiry payload directly to the Saidpur &amp; Ghazipur District command desk.
                    </p>
                  </div>

                  {/* Category Selector Pills */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
                      Select Department / Service Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'TUITION', label: 'Home Tuition', icon: '🎓' },
                        { id: 'LIBRARY', label: 'Study Library', icon: '📚' },
                        { id: 'FINANCE', label: 'Receipt & Billing', icon: '💳' },
                        { id: 'PARTNER', label: 'Owner & Tutor', icon: '🏛️' },
                        { id: 'ESCALATION', label: 'Grievance / Issue', icon: '🚨' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setCategory(item.id as any)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                            category === item.id 
                              ? 'bg-blue-600/30 border-blue-500 text-cyan-300 shadow-sm shadow-blue-900/50' 
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <span>{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Grid: Name, Email, Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar Maurya"
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. ramesh@example.com"
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
                        Mobile / WhatsApp (Optional)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 91964 34387"
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
                        Target District Division
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer"
                      >
                        <option value="Saidpur (Central HQ Zone)">Saidpur (Central HQ Zone - 233304)</option>
                        <option value="Ghazipur City (Main Office)">Ghazipur City (Main Office)</option>
                        <option value="Varanasi Regional Node">Varanasi Regional Node</option>
                        <option value="Mau Regional Node">Mau Regional Node</option>
                        <option value="Ballia Regional Node">Ballia Regional Node</option>
                        <option value="Pan-Uttar Pradesh (All Other Districts)">Pan-Uttar Pradesh (All Other Districts)</option>
                      </select>
                    </div>
                  </div>

                  {/* Priority Indicator */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
                      Dispatch Priority Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'STANDARD', label: 'Standard', desc: 'Within 24 Hours' },
                        { id: 'HIGH', label: 'High Priority', desc: 'Within 2 Hours' },
                        { id: 'EMERGENCY', label: 'Critical Escalation', desc: '< 15 Minutes' }
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPriority(p.id as any)}
                          className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                            priority === p.id 
                              ? p.id === 'EMERGENCY'
                                ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                                : p.id === 'HIGH'
                                ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                                : 'bg-blue-950/40 border-blue-500 text-blue-300'
                              : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <div className="text-xs font-bold">{p.label}</div>
                          <div className="text-[10px] opacity-75">{p.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Payload */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
                        Transmission Message / Inquiry Details *
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {message.length} characters
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please specify requirements regarding home tutor matching, study library desk shifts, payment verification, or administrative queries..."
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:from-blue-500 hover:via-cyan-500 hover:to-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Transmitting to Saidpur Dispatch...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Transmit Message to Saidpur Desk</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right 5 Columns: Futuristic Geolocation & Saidpur Hub Radar */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Radar Coordinate Frame */}
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Saidpur Node Radar
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                    25.5458° N, 83.2195° E
                  </span>
                </div>

                {/* High-Tech Geolocation Visual Mock */}
                <div className="relative h-48 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                  {/* Concentric Radar Rings */}
                  <div className="absolute w-44 h-44 rounded-full border border-cyan-500/20 animate-ping opacity-25" />
                  <div className="absolute w-36 h-36 rounded-full border border-cyan-500/30" />
                  <div className="absolute w-24 h-24 rounded-full border border-cyan-500/40" />
                  <div className="absolute w-12 h-12 rounded-full border border-emerald-500/50" />

                  {/* Crosshairs */}
                  <div className="absolute w-full h-[1px] bg-cyan-500/20" />
                  <div className="absolute h-full w-[1px] bg-cyan-500/20" />

                  {/* Pulsing Pin Center */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee] flex items-center justify-center animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                    </div>
                    <span className="mt-1.5 px-2 py-0.5 rounded-md bg-slate-900/90 border border-cyan-500/40 text-[9px] font-mono font-bold text-cyan-300">
                      ZYZU'S HQ • Saidpur 233304
                    </span>
                  </div>

                  {/* Corner Coordinates */}
                  <div className="absolute bottom-2 left-2 text-[9px] font-mono text-slate-500">
                    ELEV: 74M • GZP-DISTRICT
                  </div>
                  <div className="absolute top-2 right-2 text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    GRID ONLINE
                  </div>
                </div>

                {/* Location Specs */}
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Physical Address</div>
                    <div className="font-bold text-white leading-relaxed">
                      Saidpur, Ghazipur 233304, Uttar Pradesh, India
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-slate-500 block text-[9px]">DISTRICT</span>
                      <span className="text-slate-200 font-bold">Ghazipur (UP)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-slate-500 block text-[9px]">POSTAL CODE</span>
                      <span className="text-cyan-400 font-bold">233304</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=Saidpur,+Ghazipur+233304,+Uttar+Pradesh,+India"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 active:scale-98"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Open Full Satellite Map Directions</span>
                </a>
              </div>

              {/* Instant WhatsApp Priority Channel */}
              <div className="rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-900 border border-emerald-500/30 p-6 shadow-xl backdrop-blur-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <MessageSquare className="w-5 h-5" />
                  <h4 className="text-sm font-bold text-white">Instant WhatsApp Concierge</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Need quick tutor matching or an immediate seat check? Message our Saidpur dispatch team on WhatsApp.
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <a
                    href="https://wa.me/919196434387?text=Hello%20ZYZU'S%20Support"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                  >
                    Chat +91 91964 34387
                  </a>
                  <a
                    href="https://wa.me/919569644387?text=Hello%20ZYZU'S%20Support"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all"
                  >
                    Chat +91 95696 44387
                  </a>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Fast Redressal & Emergency Escalation Strip */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  Have an Urgent Exam or Verification Escalation?
                </h4>
                <p className="text-[11px] text-slate-400">
                  Direct contact: <a href="tel:+919196434387" className="text-cyan-400 hover:underline font-mono font-bold">+91 91964 34387</a> • <a href="tel:+919569644387" className="text-cyan-400 hover:underline font-mono font-bold">+91 95696 44387</a> • <a href="mailto:focuspoint011@gmail.com" className="text-cyan-400 hover:underline font-mono font-bold">focuspoint011@gmail.com</a>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href="tel:+919196434387"
                className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
              <a
                href="mailto:focuspoint011@gmail.com"
                className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email HQ</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
