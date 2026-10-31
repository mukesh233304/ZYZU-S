import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Star, ShieldCheck, ChevronLeft, ChevronRight, MessageSquareQuote, 
  MapPin, GraduationCap, BookMarked, Sparkles, MessageSquarePlus, 
  Play, Image as ImageIcon, UserCheck, Users 
} from 'lucide-react';
import { ParentReview, VideoTestimonial, ReviewServiceType } from '../../types/homepage';
import { reviewService } from '../../services/reviewService';
import { ShareReviewModal } from './ShareReviewModal';
import { VideoModal } from './VideoModal';
import { Button } from '../common/Button';

export const ParentReviewSection: React.FC = () => {
  const [reviews, setReviews] = useState<ParentReview[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | ReviewServiceType>('ALL');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<VideoTestimonial | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await reviewService.getReviews({ service: activeFilter });
      setReviews(data);
      setCurrentIndex(0);
    } catch {
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Subscribe to real-time review additions
  useEffect(() => {
    return reviewService.subscribe(() => {
      loadReviews();
    });
  }, [loadReviews]);

  // Auto rotation
  useEffect(() => {
    if (reviews.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [reviews.length, isPaused]);

  const handleNext = () => {
    if (reviews.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    if (reviews.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) handleNext();
    if (diff < -50) handlePrev();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleOpenAttachedVideo = (rev: ParentReview) => {
    if (!rev.videoAttachmentUrl) return;

    setActiveVideoModal({
      id: `vid-${rev.id}`,
      category: rev.serviceUsed === 'SELF_STUDY_LIBRARY' ? 'LIBRARY_STUDENT' : 'PARENT',
      name: rev.parentName,
      designation: rev.authorRoleLabel || rev.childClass,
      location: rev.location,
      serviceUsed: rev.serviceUsed === 'HOME_TUITION' ? 'Home Tuition Mentorship' : rev.serviceUsed === 'SELF_STUDY_LIBRARY' ? 'Self-Study Library' : rev.serviceUsed === 'MOCK_TEST' ? 'Mock Test Series' : 'Study Materials',
      thumbnail: rev.photoAttachmentUrl || rev.photoUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
      videoUrl: rev.videoAttachmentUrl,
      duration: '1:30',
      title: rev.title || `${rev.parentName}'s Experience`,
      description: rev.reviewText,
      verified: true
    });
  };

  const getRoleBadge = (rev: ParentReview) => {
    if (rev.userRole === 'STUDENT_TUITION' || rev.authorRoleLabel?.toLowerCase().includes('tuition student')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-[10px] font-bold">
          <GraduationCap className="w-3 h-3 text-brand-600" />
          <span>Tuition Student</span>
        </span>
      );
    }
    if (rev.userRole === 'STUDENT_LIBRARY' || rev.authorRoleLabel?.toLowerCase().includes('library student')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
          <BookMarked className="w-3 h-3 text-amber-600" />
          <span>Library Student</span>
        </span>
      );
    }
    if (rev.userRole === 'STUDENT_MOCK_TEST' || rev.serviceUsed === 'MOCK_TEST') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
          <Sparkles className="w-3 h-3 text-purple-600" />
          <span>Mock Test Aspirant</span>
        </span>
      );
    }
    if (rev.userRole === 'STUDENT_STUDY_MATERIAL' || rev.serviceUsed === 'STUDY_MATERIAL') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>Study Materials</span>
        </span>
      );
    }
    if (rev.userRole === 'TEACHER' || rev.authorRoleLabel?.toLowerCase().includes('educator')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
          <UserCheck className="w-3 h-3 text-emerald-600" />
          <span>Verified Educator</span>
        </span>
      );
    }
    if (rev.userRole === 'LIBRARY_OWNER' || rev.authorRoleLabel?.toLowerCase().includes('library partner')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
          <BookMarked className="w-3 h-3 text-purple-600" />
          <span>Library Partner</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
        <Users className="w-3 h-3 text-slate-500" />
        <span>Parent Review</span>
      </span>
    );
  };

  return (
    <section 
      id="community-reviews"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Parent and Student Reviews"
    >
      {/* Header & Service Filter Segmented Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span>Verified Community Feedback</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
            What Our Community Says
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 max-w-xl">
            Real experiences from students, parents, certified educators, and library partners in Ghazipur, Saidpur, and Varanasi.
          </p>
        </div>

        {/* Filter Switcher & Share Review Button */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-white text-slate-950 shadow-sm border border-slate-200 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Feedback
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('HOME_TUITION')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'HOME_TUITION'
                  ? 'bg-white text-slate-950 shadow-sm border border-slate-200 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Home Tuition
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('SELF_STUDY_LIBRARY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'SELF_STUDY_LIBRARY'
                  ? 'bg-white text-slate-950 shadow-sm border border-slate-200 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Study Libraries
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('MOCK_TEST')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'MOCK_TEST'
                  ? 'bg-white text-slate-950 shadow-sm border border-slate-200 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mock Tests
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('STUDY_MATERIAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'STUDY_MATERIAL'
                  ? 'bg-white text-slate-950 shadow-sm border border-slate-200 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Study Materials
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => setIsShareModalOpen(true)}
            leftIcon={<MessageSquarePlus className="w-4 h-4" />}
            className="shadow-md shadow-brand-500/20 font-bold"
          >
            Share Your Review
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-slate-100 border border-slate-200" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-xs max-w-xl mx-auto space-y-4">
          <MessageSquareQuote className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">No Reviews In This Category Yet</h4>
          <p className="text-xs text-slate-500">
            Be the first active student or partner to share your verified experience.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsShareModalOpen(true)}
            leftIcon={<MessageSquarePlus className="w-4 h-4" />}
          >
            Write the First Review
          </Button>
        </div>
      ) : (
        /* Review Cards Display */
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {reviews.map((rev, index) => {
              const isHighlight = index === currentIndex;

              return (
                <div
                  key={rev.id}
                  className={`p-6 sm:p-7 rounded-3xl bg-white border transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-md ${
                    isHighlight 
                      ? 'border-brand-500/80 ring-2 ring-brand-500/10' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Role + Verified Badge */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {getRoleBadge(rev)}
                      </div>

                      {rev.verified && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>

                    {/* Star Rating Row & Optional Title */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>

                      {rev.title && (
                        <h5 className="font-extrabold text-sm text-slate-950 pt-1 leading-snug">
                          {rev.title}
                        </h5>
                      )}
                    </div>

                    {/* Review Quote Text */}
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                      "{rev.reviewText}"
                    </p>

                    {/* Media Attachments Preview Bar */}
                    {(rev.photoAttachmentUrl || rev.videoAttachmentUrl) && (
                      <div className="flex items-center gap-2 pt-2">
                        {rev.photoAttachmentUrl && (
                          <div className="relative group overflow-hidden rounded-lg border border-slate-200 w-14 h-14 shrink-0 bg-slate-100">
                            <img
                              src={rev.photoAttachmentUrl}
                              alt="Review attachment"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white font-bold text-center py-0.5 flex items-center justify-center gap-0.5">
                              <ImageIcon className="w-2.5 h-2.5" />
                              <span>Photo</span>
                            </div>
                          </div>
                        )}

                        {rev.videoAttachmentUrl && (
                          <button
                            type="button"
                            onClick={() => handleOpenAttachedVideo(rev)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all cursor-pointer shadow-xs"
                          >
                            <Play className="w-3.5 h-3.5 fill-current text-indigo-600" />
                            <span>Watch Video Story</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Targeted Mentor/Library tag if present */}
                    {(rev.tutorName || rev.libraryName) && (
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700">
                          {rev.serviceUsed === 'HOME_TUITION' ? (
                            <GraduationCap className="w-3 h-3 text-brand-600" />
                          ) : (
                            <BookMarked className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{rev.tutorName || rev.libraryName}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Profile Meta Footer */}
                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-3">
                    {rev.photoUrl ? (
                      <img
                        src={rev.photoUrl}
                        alt={rev.parentName}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-brand-100 text-brand-700 font-black flex items-center justify-center text-sm border border-brand-200 shrink-0">
                        {rev.parentName.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h5 className="font-extrabold text-slate-950 text-sm truncate">
                        {rev.parentName}
                      </h5>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium truncate">
                        <MapPin className="w-3 h-3 text-brand-600 shrink-0" />
                        <span>{rev.location.locality ? `${rev.location.locality}, ` : ''}{rev.location.district}</span>
                        <span>•</span>
                        <span className="text-slate-600 font-semibold">{rev.childClass}</span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Carousel Arrows and Dots for Mobile / Multi-item pagination */}
          {reviews.length > 3 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={handlePrev}
                className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs active:scale-95 transition-all cursor-pointer"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      i === currentIndex ? 'w-5 bg-brand-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`Go to review ${i + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs active:scale-95 transition-all cursor-pointer"
                aria-label="Next review"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Share Review Modal */}
      <ShareReviewModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        defaultService={activeFilter === 'SELF_STUDY_LIBRARY' ? 'SELF_STUDY_LIBRARY' : 'HOME_TUITION'}
        onSuccess={loadReviews}
      />

      {/* Attached Video Modal Player */}
      <VideoModal
        video={activeVideoModal}
        onClose={() => setActiveVideoModal(null)}
      />
    </section>
  );
};
