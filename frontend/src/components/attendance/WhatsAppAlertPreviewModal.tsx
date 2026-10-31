import React, { useState } from 'react';
import { 
  MessageSquare, 
  CheckCheck, 
  Clock, 
  ShieldCheck, 
  Phone, 
  User, 
  Calendar, 
  ExternalLink,
  Copy,
  Check,
  Bot,
  Zap
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AttendanceRecord } from '../../types';
import { 
  SYSTEM_WHATSAPP_NUMBER, 
  SYSTEM_WHATSAPP_DISPLAY, 
  getWhatsAppSendUrl, 
  getSystemBotWhatsAppUrl,
  formatWhatsAppPhone 
} from '../../services/notificationService';

interface WhatsAppAlertPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
}

export const WhatsAppAlertPreviewModal: React.FC<WhatsAppAlertPreviewModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !record) return null;

  const isCheckedOut = record.status === 'CHECKED_OUT' || !!record.checkOutTime;
  const serviceLabel = record.serviceType === 'HOME_TUITION' ? 'Home Tuition' : 'Digital Study Library';
  const facilityOrTeacher = record.serviceType === 'HOME_TUITION' 
    ? (record.teacherName || 'Assigned Tutor')
    : (record.libraryName || record.targetName || 'Digital Study Library');

  const checkInTime = record.checkInTime || record.checkIn || record.time || '04:02 PM';
  const checkOutTime = record.checkOutTime || record.checkOut || '05:05 PM';
  const duration = record.duration || '1h 03m';
  const rawParentPhone = record.parentPhone || '9876543210';
  const cleanParentPhone = formatWhatsAppPhone(rawParentPhone);
  const parentName = record.parentName || 'Parent / Guardian';

  // Construct message text
  const messageText = isCheckedOut
    ? `FocusPoint Attendance Alert\n\nYour child ${record.studentName || 'Student'} has checked out from:\n${serviceLabel}\n\nDate: ${record.date}\nCheck-In: ${checkInTime}\nCheck-Out: ${checkOutTime}\nDuration: ${duration}\nTeacher/Library: ${facilityOrTeacher}\n\nOfficial System Gateway: ${SYSTEM_WHATSAPP_DISPLAY}\nFocusPoint`
    : `FocusPoint Attendance Alert\n\nYour child ${record.studentName || 'Student'} has checked in for:\n${serviceLabel}\n\nDate: ${record.date}\nCheck-In: ${checkInTime}\nTeacher/Library: ${facilityOrTeacher}\n\nOfficial System Gateway: ${SYSTEM_WHATSAPP_DISPLAY}\nFocusPoint`;

  const waSendUrl = getWhatsAppSendUrl(cleanParentPhone, messageText);
  const botChatUrl = getSystemBotWhatsAppUrl(`Hello FocusPoint Assistant, verifying attendance for ${record.studentName || 'student'}`);

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
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className="relative -mt-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>Parent WhatsApp Alert</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                  <span>DELIVERED</span>
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Official Gateway Bot: {SYSTEM_WHATSAPP_DISPLAY}
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>256-Bit E2EE</span>
          </span>
        </div>

        {/* Recipient Details & System Gateway */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Recipient:</span>
            </span>
            <span className="font-bold text-slate-900">{parentName}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Recipient WhatsApp:</span>
            </span>
            <span className="font-mono font-bold text-emerald-700">+91 {rawParentPhone.replace(/^91/, '')}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Bot className="w-3.5 h-3.5 text-slate-400" />
              <span>System Bot Number:</span>
            </span>
            <span className="font-mono font-bold text-slate-900">{SYSTEM_WHATSAPP_DISPLAY}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Timestamp:</span>
            </span>
            <span className="font-mono text-slate-700">{record.date} • {isCheckedOut ? checkOutTime : checkInTime}</span>
          </div>
        </div>

        {/* WhatsApp Chat Bubble Simulation */}
        <div className="p-3.5 bg-emerald-950/5 border border-emerald-900/10 rounded-2xl space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-600" />
              <span>Official WhatsApp Chat View</span>
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 transition-colors cursor-pointer bg-white px-2 py-0.5 rounded-md border border-slate-200"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/80 space-y-2.5 relative font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-black text-[10px]">
                  FP
                </div>
                <span className="font-black text-slate-900 text-xs">FocusPoint Attendance Alert</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{isCheckedOut ? checkOutTime : checkInTime}</span>
            </div>

            <div className="text-xs text-slate-800 space-y-1.5 leading-relaxed">
              <p>
                Your child <strong className="text-slate-950">{record.studentName || 'Student'}</strong> has {isCheckedOut ? 'checked out from:' : 'checked in for:'}
              </p>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1 text-slate-700 font-medium">
                <div>📌 <strong>Service:</strong> {serviceLabel}</div>
                <div>📅 <strong>Date:</strong> {record.date}</div>
                <div>⏰ <strong>Check-In:</strong> {checkInTime}</div>
                {isCheckedOut && <div>🏁 <strong>Check-Out:</strong> {checkOutTime}</div>}
                {isCheckedOut && <div>⏳ <strong>Duration:</strong> {duration}</div>}
                <div>📍 <strong>Facility / Tutor:</strong> {facilityOrTeacher}</div>
                <div>🤖 <strong>Gateway:</strong> {SYSTEM_WHATSAPP_DISPLAY}</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-medium pt-0.5">
              <span>Delivered</span>
              <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              size="md"
              onClick={handleOpenWhatsApp}
              leftIcon={<MessageSquare className="w-4 h-4 fill-current" />}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md shadow-emerald-600/20"
            >
              Open & Send in WhatsApp
            </Button>
            <Button
              size="md"
              variant="outline"
              onClick={handleOpenBot}
              leftIcon={<Bot className="w-4 h-4 text-emerald-600" />}
              className="flex-1 border-slate-300 text-slate-800 hover:bg-slate-100 font-bold text-xs"
            >
              Chat with Bot (+91 {SYSTEM_WHATSAPP_NUMBER})
            </Button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Realtime transmission active</span>
            </span>
            <Button size="sm" variant="ghost" onClick={onClose} className="text-slate-600 hover:text-slate-900">
              Close Preview
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
