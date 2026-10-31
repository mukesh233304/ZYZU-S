import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  CheckCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Radio, 
  PhoneCall, 
  Bot, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { Button } from '../common/Button';
import { 
  SYSTEM_WHATSAPP_NUMBER, 
  SYSTEM_WHATSAPP_DISPLAY, 
  getWhatsAppSendUrl, 
  getSystemBotWhatsAppUrl,
  formatWhatsAppPhone 
} from '../../services/notificationService';

export interface FuturisticWhatsAppBookingHubProps {
  recipientPhone: string;
  recipientName: string;
  serviceType: 'HOME_TUITION' | 'LIBRARY';
  bookingRef: string;
  facilityOrTeacherName: string;
  amount: number;
  transactionId?: string;
  detailsText?: string;
  autoLaunch?: boolean;
}

export const FuturisticWhatsAppBookingHub: React.FC<FuturisticWhatsAppBookingHubProps> = ({
  recipientPhone,
  recipientName,
  serviceType,
  bookingRef,
  facilityOrTeacherName,
  amount,
  transactionId,
  detailsText,
  autoLaunch = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [transmissionStep, setTransmissionStep] = useState<number>(3); // 1: Connecting, 2: Encrypting, 3: Delivered
  const [autoOpened, setAutoOpened] = useState(false);

  const cleanPhone = formatWhatsAppPhone(recipientPhone);
  const serviceTitle = serviceType === 'HOME_TUITION' ? 'Home Tuition' : 'Digital Study Library';

  // Construct official message text
  const messageText = serviceType === 'HOME_TUITION'
    ? `FocusPoint Home Tuition Booking Confirmed! 🎓\n\nDear ${recipientName},\nYour Home Tuition booking is successfully confirmed with FocusPoint.\n\n📋 Booking Ref: ${bookingRef}\n👨‍🏫 Allotted Educator: ${facilityOrTeacherName}\n${detailsText ? `📚 Details: ${detailsText}\n` : ''}💰 Amount Paid: ₹${amount.toLocaleString()}${transactionId ? ` (Txn ID: ${transactionId})` : ''}\n\n🤖 Official System WhatsApp: ${SYSTEM_WHATSAPP_DISPLAY}\nScan the FocusPoint QR code at the start of every session for automatic attendance logging.\n\nFocusPoint Intelligence System`
    : `FocusPoint Study Library Booking Confirmed! 📚\n\nDear ${recipientName},\nYour Study Desk reservation is successfully confirmed.\n\n📋 Pass Ref: ${bookingRef}\n🏢 Library: ${facilityOrTeacherName}\n${detailsText ? `🪑 Desk Details: ${detailsText}\n` : ''}💰 Amount Paid: ₹${amount.toLocaleString()}${transactionId ? ` (Txn ID: ${transactionId})` : ''}\n🔐 Access Pass: BIOMETRIC TURNSTILE ACTIVE\n\n🤖 Official System WhatsApp: ${SYSTEM_WHATSAPP_DISPLAY}\nScan the FocusPoint QR code at the entrance turnstile to check in & out daily.\n\nFocusPoint Intelligence System`;

  const waSendUrl = getWhatsAppSendUrl(cleanPhone, messageText);
  const botChatUrl = getSystemBotWhatsAppUrl(`Hello FocusPoint Assistant, I have a query regarding my booking ${bookingRef}`);

  // Auto-launch handling once if requested
  useEffect(() => {
    if (autoLaunch && !autoOpened) {
      setAutoOpened(true);
      const timer = setTimeout(() => {
        try {
          window.open(waSendUrl, '_blank', 'noopener,noreferrer');
        } catch (e) {
          console.warn('Auto-open blocked by browser:', e);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [autoLaunch, autoOpened, waSendUrl]);

  // Copy handler
  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleOpenWhatsApp = () => {
    window.open(waSendUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenBot = () => {
    window.open(botChatUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-linear-to-b from-slate-900 via-slate-950 to-slate-950 text-white p-5 sm:p-6 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 space-y-5">
      {/* Ambient background glow & holographic grid lines */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 shadow-inner">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white">
                Official WhatsApp Confirmation Dispatch
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <CheckCheck className="w-3 h-3 text-emerald-400" />
                <span>DELIVERED</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Automated transmission via FocusPoint Verified Bot ({SYSTEM_WHATSAPP_DISPLAY})
            </p>
          </div>
        </div>

        {/* Security badges */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-800/80 text-emerald-300 border border-slate-700 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-BIT E2EE</span>
          </span>
          <span className="inline-flex sm:hidden items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <CheckCheck className="w-3 h-3 text-emerald-400" />
            <span>DELIVERED</span>
          </span>
        </div>
      </div>

      {/* Gateway telemetry row */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            <span>System WhatsApp Bot:</span>
          </span>
          <span className="font-bold text-emerald-400">{SYSTEM_WHATSAPP_DISPLAY}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-teal-400" />
            <span>Recipient Contact:</span>
          </span>
          <span className="font-bold text-slate-200">
            +91 {recipientPhone.replace(/^91/, '')} ({recipientName})
          </span>
        </div>
      </div>

      {/* WhatsApp Message Preview Card */}
      <div className="relative z-10 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Live WhatsApp Transmission Payload</span>
          </span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Payload</span>
              </>
            )}
          </button>
        </div>

        {/* WhatsApp message bubble */}
        <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 text-xs leading-relaxed text-slate-200 font-sans space-y-2 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <img
                src="/assets/branding/zyzus-logo-64.png"
                alt="ZYZU'S"
                className="w-5 h-5 rounded-md object-contain border border-blue-400/30"
              />
              <span className="font-bold text-white text-xs">
                ZYZU'S Official Bot ({SYSTEM_WHATSAPP_DISPLAY})
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Just Now</span>
          </div>

          <div className="whitespace-pre-line text-slate-300 text-xs">
            {messageText}
          </div>

          <div className="flex items-center justify-end gap-1 pt-1 text-[10px] text-slate-400">
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 pt-1">
        <Button
          size="md"
          onClick={handleOpenWhatsApp}
          leftIcon={<MessageSquare className="w-4 h-4 fill-current" />}
          className="w-full sm:flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/25 border-0 hover:scale-[1.01] transition-all"
        >
          Open & Send on WhatsApp Now
        </Button>

        <Button
          size="md"
          variant="outline"
          onClick={handleOpenBot}
          leftIcon={<Bot className="w-4 h-4 text-emerald-400" />}
          className="w-full sm:flex-1 border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700 font-bold"
        >
          Chat with System Bot (+91 {SYSTEM_WHATSAPP_NUMBER})
        </Button>
      </div>

      <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 pt-1">
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Real-time dispatch to {recipientPhone} verified</span>
        </span>
        <button
          onClick={handleOpenWhatsApp}
          className="text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1 cursor-pointer"
        >
          <span>Direct wa.me link</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
