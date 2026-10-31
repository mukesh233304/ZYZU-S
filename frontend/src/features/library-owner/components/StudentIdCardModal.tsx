import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { useToast } from '../../../context/ToastContext';
import { bookingService } from '../../../services/bookingService';
import { libraryService } from '../../../services/libraryService';
import {
  Printer,
  ShieldCheck,
  Armchair,
  Clock,
  Calendar,
  Phone,
  User,
  Building,
  QrCode,
  Download,
  Sparkles,
  CheckCircle2,
  Share2,
  Camera,
  Trash2,
  Upload
} from 'lucide-react';
import { compressImage } from '../../../utils/imageUtils';
import { OfficialStudentIdCard } from '../../../components/common/OfficialStudentIdCard';

export interface StudentIdCardData {
  studentName: string;
  rollNumber?: string;
  studentPhone?: string;
  guardianName?: string;
  seatNumber: string;
  shift: string;
  shiftTimings?: string;
  startDate: string;
  endDate: string;
  libraryName: string;
  libraryAddress: string;
  libraryDistrict?: string;
  libraryOwnerName?: string;
  studentAvatar?: string;
  bookingRef?: string;
  bloodGroup?: string;
  serviceType?: 'HOME_TUITION' | 'LIBRARY' | 'BOTH';
  studentAddress?: string;
  state?: string;
  pincode?: string;
  studentClass?: string;
  teacherName?: string;
  subject?: string;
}

interface StudentIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardData: StudentIdCardData | null;
  onUpdatePhoto?: (newAvatarUrl: string) => void;
}

export const StudentIdCardModal: React.FC<StudentIdCardModalProps> = ({
  isOpen,
  onClose,
  cardData,
  onUpdatePhoto,
}) => {
  const { addToast } = useToast();
  const [orientation, setOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>('PORTRAIT');
  const [studentAvatar, setStudentAvatar] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cardData) {
      setStudentAvatar(cardData.studentAvatar || '');
    }
  }, [cardData]);

  if (!cardData) return null;

  const rollNumber = cardData.rollNumber || cardData.bookingRef || `FP-GZP-${Math.floor(1000 + Math.random() * 9000)}`;
  const district = cardData.libraryDistrict || 'Ghazipur';

  const handlePrint = () => {
    window.print();
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (JPEG, PNG, WebP)', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('Student photo must be less than 10MB', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadingPhoto(true);
    try {
      const dataUrl = await compressImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.85 });
      setStudentAvatar(dataUrl);

      if (cardData.bookingRef) {
        await bookingService.updateBookingPhoto(cardData.bookingRef, dataUrl);
      }
      if (cardData.studentName) {
        await libraryService.updateStudentPhoto(cardData.rollNumber || cardData.studentName, dataUrl);
      }
      if (onUpdatePhoto) {
        onUpdatePhoto(dataUrl);
      }
      addToast(`Student profile photo updated for ${cardData.studentName}!`, 'success');
    } catch (err) {
      console.error('Failed to compress/save student photo:', err);
      addToast('Failed to save student photo', 'error');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    setStudentAvatar('');
    try {
      if (cardData.bookingRef) {
        await bookingService.updateBookingPhoto(cardData.bookingRef, '');
      }
      if (cardData.studentName) {
        await libraryService.updateStudentPhoto(cardData.rollNumber || cardData.studentName, '');
      }
      if (onUpdatePhoto) {
        onUpdatePhoto('');
      }
      addToast('Student photo removed from ID card', 'info');
    } catch {
      addToast('Failed to remove photo', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Accredited Student Study Pass & ID Card"
      size="lg"
    >
      <div className="space-y-5">
        {/* Hidden File Input for Student Photo Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoFileChange}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
        />

        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Badge Layout:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setOrientation('PORTRAIT')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  orientation === 'PORTRAIT'
                    ? 'bg-royal-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Vertical (Lanyard Badge)
              </button>
              <button
                type="button"
                onClick={() => setOrientation('LANDSCAPE')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  orientation === 'LANDSCAPE'
                    ? 'bg-royal-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Horizontal (Pocket Card)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Camera className="w-3.5 h-3.5 text-royal-blue-600" />}
              onClick={handlePhotoClick}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? 'Uploading...' : studentAvatar ? 'Change Photo' : 'Upload Photo'}
            </Button>
            {studentAvatar && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                onClick={handleRemovePhoto}
                title="Remove photo from ID card"
              >
                Remove
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              icon={<Printer className="w-3.5 h-3.5" />}
              onClick={handlePrint}
            >
              Print ID Card
            </Button>
          </div>
        </div>

        {/* PRINT STYLES */}
        <style>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-student-id-card,
            #printable-student-id-card * {
              visibility: visible !important;
            }
            #printable-student-id-card {
              position: fixed !important;
              left: 50% !important;
              top: 50% !important;
              transform: translate(-50%, -50%) !important;
              box-shadow: none !important;
              margin: 0 !important;
              border: 1.5px solid #0f172a !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}</style>

        {/* ===================== THE ID CARD ===================== */}
        <div className="flex justify-center p-2 sm:p-4 bg-slate-100/60 rounded-2xl overflow-x-auto print:p-0 print:bg-transparent">
          <OfficialStudentIdCard
            studentName={cardData.studentName}
            studentId={rollNumber}
            studentAvatar={studentAvatar}
            studentPhone={cardData.studentPhone}
            studentClass={cardData.studentClass}
            serviceType={cardData.serviceType || 'LIBRARY'}
            libraryName={cardData.libraryName}
            seatNumber={cardData.seatNumber}
            shift={cardData.shift}
            teacherName={cardData.teacherName}
            subject={cardData.subject}
            address={cardData.studentAddress || cardData.libraryAddress}
            district={district}
            state={cardData.state || 'Uttar Pradesh'}
            pincode={cardData.pincode || '233304'}
            issueDate={cardData.startDate || '01 Feb 2026'}
            validUntil={cardData.endDate || '31 Mar 2027'}
            isEditablePhoto={true}
            onPhotoUpload={async (file) => {
              try {
                setUploadingPhoto(true);
                const dataUrl = await compressImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.85 });
                setStudentAvatar(dataUrl);
                if (cardData.bookingRef) {
                  await bookingService.updateBookingPhoto(cardData.bookingRef, dataUrl);
                }
                if (cardData.studentName) {
                  await libraryService.updateStudentPhoto(cardData.rollNumber || cardData.studentName, dataUrl);
                }
                if (onUpdatePhoto) {
                  onUpdatePhoto(dataUrl);
                }
                addToast(`Student profile photo updated for ${cardData.studentName}!`, 'success');
              } catch (err) {
                console.error('Failed to compress/save student photo:', err);
                addToast('Failed to save student photo', 'error');
              } finally {
                setUploadingPhoto(false);
              }
            }}
          />
        </div>

        {/* Modal Action Buttons */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-200 print:hidden">
          <p className="text-xs text-slate-500">
            Click <strong>Print ID Card</strong> to print on cardstock or save as a digital PDF pass.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
            >
              Print ID Card
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
