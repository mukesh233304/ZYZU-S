import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  X, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, 
  ShieldCheck, MapPin, AlertCircle, RefreshCw, Sliders 
} from 'lucide-react';
import { VideoTestimonial } from '../../types/homepage';

interface VideoModalProps {
  video: VideoTestimonial | null;
  onClose: () => void;
}

const FALLBACK_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
];

export const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [useNativeControls, setUseNativeControls] = useState(false);

  // Initialize and attempt smooth playback on video selection
  useEffect(() => {
    if (!video) {
      setCurrentSrc('');
      setHasError(false);
      setIsPlaying(false);
      setProgress(0);
      return;
    }

    setCurrentSrc(video.videoUrl);
    setHasError(false);
    setFallbackIndex(0);
    setProgress(0);
  }, [video]);

  // Attempt autoplay safely handling browser Autoplay policies
  useEffect(() => {
    if (!currentSrc || !videoRef.current) return;

    const timer = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            // If unmuted autoplay is blocked by browser, try muted autoplay
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
            }
          });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [currentSrc]);

  // Keyboard accessibility controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' && !e.repeat) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          togglePlay();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!video) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setProgress((curr / dur) * 100);

    const format = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    setCurrentTime(format(curr));
    if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
      setDuration(format(videoRef.current.duration));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekTo = (Number(e.target.value) / 100) * (videoRef.current.duration || 1);
    videoRef.current.currentTime = seekTo;
    setProgress(Number(e.target.value));
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleVideoError = () => {
    if (fallbackIndex < FALLBACK_VIDEOS.length) {
      const nextFallback = FALLBACK_VIDEOS[fallbackIndex];
      setFallbackIndex(prev => prev + 1);
      setCurrentSrc(nextFallback);
      setHasError(false);
    } else {
      setHasError(true);
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setFallbackIndex(0);
    setCurrentSrc(video.videoUrl);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSpeedChange = () => {
    if (!videoRef.current) return;
    const speeds = [1, 1.25, 1.5, 2];
    const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-slate-950/95 border-b border-white/10 flex items-center justify-between text-white shrink-0">
          <div className="min-w-0 flex-1 pr-3">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 text-[10px] font-black uppercase tracking-wider">
                {video.category === 'PARENT' ? 'Parent Experience' : 'Library Student Experience'}
              </span>
              {video.verified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Review</span>
                </span>
              )}
            </div>
            <h4 className="text-sm sm:text-base font-black text-white truncate">
              {video.title}
            </h4>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setUseNativeControls(!useNativeControls)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer hidden sm:flex items-center gap-1 ${
                useNativeControls 
                  ? 'bg-brand-600 text-white border-brand-500' 
                  : 'bg-white/10 hover:bg-white/20 text-slate-300 border-white/10'
              }`}
              title="Toggle native controls"
            >
              <Sliders className="w-3 h-3" />
              <span>{useNativeControls ? 'Native Player' : 'Custom Player'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Close video"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
          {hasError ? (
            <div className="p-8 text-center space-y-4 max-w-md mx-auto text-white">
              <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
              <h5 className="text-base font-bold">Video Stream Temporarily Unavailable</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                The video stream could not be loaded from the host server. You can retry with our fallback playback engine.
              </p>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black cursor-pointer shadow-lg shadow-brand-600/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Playback</span>
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                src={currentSrc}
                poster={video.thumbnail}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onError={handleVideoError}
                onClick={togglePlay}
                controls={useNativeControls}
                playsInline
                preload="metadata"
                className="w-full h-full object-contain cursor-pointer"
              />

              {/* Big Center Play Button Overlay when Paused (only in custom controls mode) */}
              {!useNativeControls && !isPlaying && (
                <button
                  type="button"
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors cursor-pointer"
                  aria-label="Play video"
                >
                  <div className="w-20 h-20 rounded-full bg-brand-600/95 text-white flex items-center justify-center shadow-2xl pl-1 ring-4 ring-white/30 transform hover:scale-110 transition-transform">
                    <Play className="w-9 h-9 fill-current" />
                  </div>
                </button>
              )}

              {/* Player Custom Control Bar (hidden if useNativeControls is active) */}
              {!useNativeControls && (
                <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-2 opacity-95 group-hover:opacity-100 transition-opacity">
                  {/* Scrubber Progress Bar */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />

                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={togglePlay}
                        className="p-1 rounded hover:bg-white/20 cursor-pointer"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      </button>

                      <button
                        type="button"
                        onClick={toggleMute}
                        className="p-1 rounded hover:bg-white/20 cursor-pointer"
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      <span className="font-mono text-[11px] text-slate-300">
                        {currentTime} / {duration !== '0:00' ? duration : video.duration}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSpeedChange}
                        className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[11px] font-bold cursor-pointer"
                        title="Change speed"
                      >
                        {playbackSpeed}x
                      </button>

                      <button
                        type="button"
                        onClick={handleFullscreen}
                        className="p-1 rounded hover:bg-white/20 cursor-pointer"
                        aria-label="Fullscreen"
                      >
                        <Maximize className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Video Description Footer */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-white/10 text-white space-y-2 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-white">{video.name}</span>
              {video.designation && (
                <span className="text-xs text-slate-400 font-medium">({video.designation})</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
              <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span>{video.location.locality ? `${video.location.locality}, ` : ''}{video.location.district}, {video.location.state}</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {video.description}
          </p>
        </div>

      </div>
    </div>
  );
};
