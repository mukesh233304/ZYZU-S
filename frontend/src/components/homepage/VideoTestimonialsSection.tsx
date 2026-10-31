import React, { useState, useEffect, useCallback } from 'react';
import { 
  Play, ShieldCheck, MapPin, Video, Sparkles, Clock, 
  ChevronRight, Users, BookMarked, PlusCircle 
} from 'lucide-react';
import { VideoTestimonial, VideoCategory } from '../../types/homepage';
import { videoService } from '../../services/videoService';
import { VideoModal } from './VideoModal';
import { ShareReviewModal } from './ShareReviewModal';
import { Button } from '../common/Button';

export const VideoTestimonialsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<VideoCategory>('PARENT');
  const [videos, setVideos] = useState<VideoTestimonial[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoTestimonial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const loadVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await videoService.getVideoTestimonials(activeCategory);
      setVideos(data);
    } catch {
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // Subscribe to real-time video testimonial updates
  useEffect(() => {
    return videoService.subscribe(() => {
      loadVideos();
    });
  }, [loadVideos]);

  return (
    <section 
      id="video-testimonials"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14"
      aria-label="Video Testimonials"
    >
      {/* Header & Category Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2 shadow-xs">
            <Video className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Video Testimonials</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Real Stories. Real Progress.
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 max-w-xl">
            Watch how ZYZU'S helps students, parents, and educators make confident decisions in their academic journey.
          </p>
        </div>

        {/* Category Tabs Switcher & Share Video Story Button */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setActiveCategory('PARENT')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'PARENT'
                  ? 'bg-white text-slate-950 shadow-sm border border-slate-200 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-brand-600" />
              <span>Parent Experiences</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('LIBRARY_STUDENT')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'LIBRARY_STUDENT'
                  ? 'bg-white text-slate-950 shadow-sm border border-slate-200 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5 text-amber-600" />
              <span>Library Students</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('STUDENT_ACADEMIC')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'STUDENT_ACADEMIC'
                  ? 'bg-white text-slate-950 shadow-sm border border-slate-200 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Exam & Test Aspirants</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsShareModalOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4 text-indigo-600" />}
            className="border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 text-indigo-900 font-bold"
          >
            Share Video Story
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map((n) => (
            <div key={n} className="h-80 rounded-3xl bg-slate-100 border border-slate-200" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-xs max-w-xl mx-auto space-y-4">
          <Video className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">No Video Stories In This Category</h4>
          <p className="text-xs text-slate-500">
            Have you booked a mentor or study desk? Share your video story with the ZYZU'S community.
          </p>
          <Button
            size="sm"
            onClick={() => setIsShareModalOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Share the First Video Story
          </Button>
        </div>
      ) : (
        /* Video Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="group rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-brand-500/50 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Thumbnail Container with Play Overlay */}
              <div 
                className="relative aspect-video overflow-hidden bg-slate-950 cursor-pointer"
                onClick={() => setSelectedVideo(vid)}
              >
                <img
                  src={vid.thumbnail}
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                
                {/* Contrast Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Center Play Button with Subtle Pulse */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-2xl pl-1 ring-4 ring-white/30 group-hover:scale-115 group-hover:bg-brand-500 transition-all">
                    <Play className="w-7 h-7 fill-current" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[11px] font-mono font-bold flex items-center gap-1 border border-white/10">
                  <Clock className="w-3 h-3 text-slate-300" />
                  <span>{vid.duration}</span>
                </div>

                {/* Verified Pill */}
                {vid.verified && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <ShieldCheck className="w-3 h-3 text-white" />
                    <span>Verified Story</span>
                  </div>
                )}
              </div>

              {/* Card Meta Content */}
              <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className="text-brand-600 font-extrabold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{vid.serviceUsed}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{vid.location.locality ? `${vid.location.locality}, ` : ''}{vid.location.district}</span>
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-black text-slate-950 leading-snug group-hover:text-brand-600 transition-colors">
                    {vid.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium line-clamp-2">
                    {vid.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-900">{vid.name}</p>
                    {vid.designation && (
                      <p className="text-[11px] font-semibold text-slate-500">{vid.designation}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedVideo(vid)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 cursor-pointer"
                  >
                    <span>Watch Story</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Video Player Modal */}
      <VideoModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />

      {/* Share Video Review Modal */}
      <ShareReviewModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        defaultService={activeCategory === 'LIBRARY_STUDENT' ? 'SELF_STUDY_LIBRARY' : 'HOME_TUITION'}
        onSuccess={loadVideos}
      />
    </section>
  );
};
