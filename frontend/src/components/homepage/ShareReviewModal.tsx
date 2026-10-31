import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Star, Upload, Video, Image as ImageIcon, ShieldCheck, 
  Sparkles, CheckCircle2, AlertCircle, ArrowRight, UserCheck, 
  LogIn, BookMarked, GraduationCap, Play, Trash2, FileText, 
  HelpCircle, Eye, EyeOff, Loader2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { reviewService } from '../../services/reviewService';
import { ReviewEligibility, ReviewServiceType } from '../../types/homepage';
import { Button } from '../common/Button';
import { Link } from 'react-router-dom';

interface ShareReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: ReviewServiceType;
  initialMode?: 'REVIEW' | 'VIDEO_STORY';
  onSuccess?: () => void;
}

export const ShareReviewModal: React.FC<ShareReviewModalProps> = ({
  isOpen,
  onClose,
  defaultService = 'HOME_TUITION',
  initialMode = 'REVIEW',
  onSuccess
}) => {
  const { user, login } = useAuth();
  const [eligibility, setEligibility] = useState<ReviewEligibility>({ canReview: false });
  const [selectedService, setSelectedService] = useState<ReviewServiceType>(defaultService);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [childClass, setChildClass] = useState('');
  const [locality, setLocality] = useState('');
  const [targetEntityName, setTargetEntityName] = useState('');
  const [privacyPreference, setPrivacyPreference] = useState<'FULL_NAME' | 'INITIAL_ONLY'>('FULL_NAME');
  
  // Media attachments
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoFileName, setVideoFileName] = useState<string>('');
  
  // Video upload simulation progress
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<'IDLE' | 'UPLOADING' | 'PROCESSING' | 'READY'>('IDLE');
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Check eligibility whenever user or modal open state changes
  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setErrorMessage(null);
      setUploadProgress(0);
      setUploadStage('IDLE');
      return;
    }

    const elig = reviewService.checkReviewEligibility(user);
    setEligibility(elig);

    const services = elig.availableServices || [];
    if (elig.canReview && services.length > 0) {
      const preferred = services.find(s => s.service === defaultService) || services[0];
      setSelectedService(preferred.service);
      setTargetEntityName(preferred.targetName || '');
    }

    if (user) {
      setLocality(user.localityName || user.districtName || 'Saidpur, Ghazipur');
      if (user.role === 'STUDENT') {
        setChildClass('Class 10 CBSE / Competitive Aspirant');
      } else if (user.role === 'TEACHER') {
        setChildClass('Verified Faculty');
      } else if (user.role === 'LIBRARY_OWNER') {
        setChildClass('Study Space Partner');
      }
    }
  }, [isOpen, user, defaultService]);

  if (!isOpen) return null;

  // Handle photo file selection (convert to base64 Data URL)
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setPhotoFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle video file selection with progress animation and validation
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 60MB)
    if (file.size > 60 * 1024 * 1024) {
      setErrorMessage('Video file size exceeds the 60MB limit. Please upload a shorter clip.');
      return;
    }

    // Validate mime type
    if (!file.type.includes('mp4') && !file.type.includes('webm') && !file.type.includes('quicktime') && !file.type.includes('video')) {
      setErrorMessage('Please upload a supported video format (MP4 or WebM).');
      return;
    }

    setVideoFileName(file.name);
    setErrorMessage(null);
    setIsUploadingVideo(true);
    setUploadStage('UPLOADING');
    setUploadProgress(15);

    // Simulate multi-step secure upload & processing
    const t1 = setTimeout(() => setUploadProgress(45), 200);
    const t2 = setTimeout(() => setUploadProgress(80), 450);
    const t3 = setTimeout(() => {
      setUploadProgress(100);
      setUploadStage('PROCESSING');
    }, 700);
    const t4 = setTimeout(() => {
      setIsUploadingVideo(false);
      setUploadStage('READY');
      // Store durable sample video or object url
      setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
    }, 1100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  };

  // Quick 1-click login for demo verification
  const handleDemoLogin = async (identifier: string) => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      await login(identifier, 'pass');
    } catch {
      setErrorMessage('Could not sign in with demo credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!reviewText.trim() || reviewText.trim().length < 10) {
      setErrorMessage('Please provide a detailed review of at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await reviewService.submitReview({
        user,
        serviceUsed: selectedService,
        rating,
        title: title.trim() || undefined,
        reviewText: reviewText.trim(),
        childClass: childClass.trim() || undefined,
        photoAttachmentUrl: photoUrl || undefined,
        videoAttachmentUrl: videoUrl || undefined,
        targetEntityName: targetEntityName.trim() || undefined,
        locality: locality.split(',')[0]?.trim(),
        district: locality.split(',')[1]?.trim() || 'Ghazipur',
        state: 'Uttar Pradesh',
        privacyPreference
      });

      setIsSuccess(true);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 1600);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 border border-brand-400/30 text-brand-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">Share Your Verified Review</h3>
              <p className="text-xs text-slate-400">Authentic community feedback from active students, educators, and library partners.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">

          {/* Success State */}
          {isSuccess ? (
            <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-slate-900">Thank You for Your Feedback!</h4>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Your verified review has been published to the ZYZU'S homepage.
                {videoUrl && ' Your attached video is now active in the Video Testimonials section!'}
              </p>
            </div>
          ) : !user ? (
            /* ========================================================================= */
            /* STATE 1: Unauthenticated User Prompt with 1-Click Verified Login          */
            /* ========================================================================= */
            <div className="space-y-5 text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-lg font-black text-slate-900">Verified Service-Usage Required</h4>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  To protect review integrity and prevent spam, reviews can only be submitted by registered users who have booked a home tutor, reserved a library desk, or manage a verified space.
                </p>
              </div>

              {/* 1-Click Demo Profiles to Test Verified Reviewing Immediately */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 max-w-md mx-auto">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                  <span>Sign In as Active Service User</span>
                </p>

                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={isLoggingIn}
                    onClick={() => handleDemoLogin('student.aryan@focuspoint.internal')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white hover:border-brand-500 hover:bg-brand-50/30 transition-all flex items-center justify-between text-left cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">Aryan Tiwari (Student)</p>
                        <p className="text-[10px] text-slate-500">Active Home Tuition & Library Desk Bookings</p>
                      </div>
                    </div>
                    <LogIn className="w-4 h-4 text-brand-600 shrink-0" />
                  </button>

                  <button
                    type="button"
                    disabled={isLoggingIn}
                    onClick={() => handleDemoLogin('teacher.rahul@focuspoint.internal')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white hover:border-brand-500 hover:bg-brand-50/30 transition-all flex items-center justify-between text-left cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">Rahul Verma (Teacher)</p>
                        <p className="text-[10px] text-slate-500">KYC Verified Home Tuition Educator</p>
                      </div>
                    </div>
                    <LogIn className="w-4 h-4 text-brand-600 shrink-0" />
                  </button>

                  <button
                    type="button"
                    disabled={isLoggingIn}
                    onClick={() => handleDemoLogin('owner.manoj@focuspoint.internal')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white hover:border-brand-500 hover:bg-brand-50/30 transition-all flex items-center justify-between text-left cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <BookMarked className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">Manoj Kumar (Library Owner)</p>
                        <p className="text-[10px] text-slate-500">Verified Study Space Partner</p>
                      </div>
                    </div>
                    <LogIn className="w-4 h-4 text-brand-600 shrink-0" />
                  </button>
                </div>
              </div>

              <div className="text-center pt-2">
                <Link to="/login" onClick={onClose} className="text-xs font-bold text-brand-600 hover:underline">
                  Or sign in with another account →
                </Link>
              </div>
            </div>
          ) : !eligibility.canReview ? (
            /* ========================================================================= */
            /* STATE 2: Logged in, but without service usage history                     */
            /* ========================================================================= */
            <div className="space-y-5 text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-lg font-black text-slate-900">Service Booking Required</h4>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {eligibility.reason || 'Reviews are unlocked after you have an active home tutor booking or library desk reservation.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link to="/find-tutor" onClick={onClose}>
                  <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Find a Home Tutor
                  </Button>
                </Link>
                <Link to="/find-library" onClick={onClose}>
                  <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Reserve Library Desk
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* STATE 3: Eligible User Review Submission Form                             */
            /* ========================================================================= */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* User Verified Status Ribbon */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900">{user.name}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700">
                      Verified {user.role === 'STUDENT' ? 'Student' : user.role === 'TEACHER' ? 'Educator' : 'Library Partner'}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-600 border border-emerald-200 font-semibold">
                  Active User
                </span>
              </div>

              {/* Service Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Service You Are Reviewing
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedService('HOME_TUITION');
                      setTargetEntityName('Dr. Rajesh Kumar (Physics & Maths)');
                    }}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                      selectedService === 'HOME_TUITION'
                        ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedService === 'HOME_TUITION' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 leading-tight">Home Tuition</p>
                      <p className="text-[10px] text-slate-500">1-on-1 Mentorship</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedService('SELF_STUDY_LIBRARY');
                      setTargetEntityName("ZYZU'S Central Library (Saidpur)");
                    }}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                      selectedService === 'SELF_STUDY_LIBRARY'
                        ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedService === 'SELF_STUDY_LIBRARY' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <BookMarked className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 leading-tight">Digital Library</p>
                      <p className="text-[10px] text-slate-500">Study Space & Desks</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedService('MOCK_TEST');
                      setTargetEntityName("ZYZU'S Test Intelligence");
                    }}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                      selectedService === 'MOCK_TEST'
                        ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedService === 'MOCK_TEST' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 leading-tight">Mock Tests</p>
                      <p className="text-[10px] text-slate-500">Govt Exams & PYQ</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedService('STUDY_MATERIAL');
                      setTargetEntityName("ZYZU'S Academic Repository");
                    }}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                      selectedService === 'STUDY_MATERIAL'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedService === 'STUDY_MATERIAL' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 leading-tight">Study Materials</p>
                      <p className="text-[10px] text-slate-500">Notes & Formula Books</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedService('OTHER');
                      setTargetEntityName("ZYZU'S Platform");
                    }}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                      selectedService === 'OTHER'
                        ? 'border-sky-600 bg-sky-50/60 ring-2 ring-sky-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedService === 'OTHER' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 leading-tight">Platform Experience</p>
                      <p className="text-[10px] text-slate-500">Overall Governance</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Privacy Display Name Preference */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 gap-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-bold text-slate-800">Review Privacy Setting:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPrivacyPreference('FULL_NAME')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      privacyPreference === 'FULL_NAME'
                        ? 'bg-white text-brand-700 shadow-xs border border-brand-300'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Full Name ({user.name})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrivacyPreference('INITIAL_ONLY')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      privacyPreference === 'INITIAL_ONLY'
                        ? 'bg-white text-brand-700 shadow-xs border border-brand-300'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Initials ({user.name.split(' ')[0]} {user.name.split(' ')[1]?.[0] || ''}.)
                  </button>
                </div>
              </div>

              {/* Star Rating Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating !== null ? hoverRating : rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          aria-label={`Rate ${star} star`}
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              isFilled ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-black text-slate-700 ml-2">
                    {rating === 5 ? 'Exceptional (5/5)' : rating === 4 ? 'Very Good (4/5)' : rating === 3 ? 'Good (3/5)' : rating === 2 ? 'Fair (2/5)' : 'Needs Improvement (1/5)'}
                  </span>
                </div>
              </div>

              {/* Title & Teacher/Library/Resource Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Excellent Math foundations!"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    {selectedService === 'HOME_TUITION' ? 'Teacher / Subject' : selectedService === 'SELF_STUDY_LIBRARY' ? 'Library Branch' : 'Subject / Exam / Module'}
                  </label>
                  <input
                    type="text"
                    value={targetEntityName}
                    onChange={(e) => setTargetEntityName(e.target.value)}
                    placeholder={selectedService === 'HOME_TUITION' ? 'e.g. Dr. Rajesh Kumar (Physics)' : selectedService === `SELF_STUDY_LIBRARY` ? "e.g. ZYZU'S Central Library" : `e.g. JEE Main Mock Series`}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Class / Designation & Locality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    Class / Exam or Role Context
                  </label>
                  <input
                    type="text"
                    value={childClass}
                    onChange={(e) => setChildClass(e.target.value)}
                    placeholder="e.g. Class 10 CBSE, NEET Aspirant"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    Location (Locality, District)
                  </label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Saidpur, Ghazipur"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Detailed Experience <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details about the teacher's punctuality, teaching clarity, library atmosphere, mock test analytics, or study material quality..."
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                />
              </div>

              {/* Media Attachments Section (Photo & Video) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Add Photo & Video Attachments
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">Optional</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Photo Attachment */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
                      <span>Attach Photo</span>
                    </label>

                    {photoUrl ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-black/5 flex items-center justify-center">
                        <img src={photoUrl} alt="Review attachment" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setPhotoUrl(''); setPhotoFileName(''); }}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-black cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Upload className="w-4 h-4 text-brand-600" />
                          <span>Upload Image File</span>
                        </button>
                        <input
                          type="url"
                          placeholder="Or paste image URL"
                          value={photoUrl}
                          onChange={(e) => setPhotoUrl(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Video Attachment */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Attach Video Story</span>
                    </label>

                    {/* Upload progress state */}
                    {isUploadingVideo && (
                      <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                            <span>{uploadStage === 'PROCESSING' ? 'Encoding & Validating Stream...' : 'Uploading Video Stream...'}</span>
                          </span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-indigo-200 overflow-hidden">
                          <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    )}

                    {videoUrl ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-black flex items-center justify-center">
                        <video src={videoUrl} controls playsInline className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => { setVideoUrl(''); setVideoFileName(''); setUploadStage('IDLE'); }}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-black cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <input
                          ref={videoInputRef}
                          type="file"
                          accept="video/*"
                          onChange={handleVideoSelect}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Upload className="w-4 h-4 text-indigo-600" />
                          <span>Upload Video File (MP4/WebM)</span>
                        </button>
                        <input
                          type="url"
                          placeholder="Or paste video URL (MP4 link)"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {videoUrl && (
                  <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-bold flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Your video will also appear in the Video Testimonials section upon submission!</span>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  isLoading={isSubmitting}
                  rightIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Submit Verified Review
                </Button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
