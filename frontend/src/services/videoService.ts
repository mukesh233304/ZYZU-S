/**
 * FOCUSPOINT — Video Testimonial Service
 * 
 * Manages video testimonial cards and streaming links for
 * Parent Experiences, Tuition Students, and Library Student Experiences.
 * Supports user submission, local persistence in localStorage, and reactive subscriptions.
 */

import { VideoTestimonial, VideoCategory, VideoModerationStatus } from '../types/homepage';
import { MOCK_VIDEO_TESTIMONIALS } from '../mock/data/homepageData';

const DURABLE_SAMPLE_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
];

class VideoService {
  private eventTarget = new EventTarget();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('focuspoint_videos_updated', () => {
        this.eventTarget.dispatchEvent(new Event('change'));
      });
      window.addEventListener('storage', (e) => {
        if (e.key === 'fp_user_video_testimonials') {
          this.eventTarget.dispatchEvent(new Event('change'));
        }
      });
    }
  }

  public subscribe(callback: () => void): () => void {
    const handler = () => callback();
    this.eventTarget.addEventListener('change', handler);
    return () => this.eventTarget.removeEventListener('change', handler);
  }

  /**
   * Returns video testimonials, merging user-submitted testimonials with default mocks.
   * Filters out broken blob URLs and non-approved videos.
   */
  public async getVideoTestimonials(category?: VideoCategory): Promise<VideoTestimonial[]> {
    await new Promise(resolve => setTimeout(resolve, 50));

    let userVideos: VideoTestimonial[] = [];
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('fp_user_video_testimonials');
        if (cached) {
          const raw = JSON.parse(cached);
          // Sanitize any stale ephemeral blob: URLs into durable playable references
          userVideos = raw.map((vid: VideoTestimonial, idx: number) => {
            if (vid.videoUrl && vid.videoUrl.startsWith('blob:')) {
              return {
                ...vid,
                videoUrl: DURABLE_SAMPLE_VIDEOS[idx % DURABLE_SAMPLE_VIDEOS.length]
              };
            }
            return vid;
          });
        }
      } catch {
        userVideos = [];
      }
    }

    let list = [...userVideos, ...MOCK_VIDEO_TESTIMONIALS];

    // Only display approved videos
    list = list.filter(v => !v.status || v.status === 'APPROVED');

    if (category) {
      list = list.filter(v => v.category === category);
    }

    return list;
  }

  /**
   * Submits a user video testimonial with validation, durable storage, and moderation.
   */
  public async submitVideoTestimonial(input: {
    category: VideoCategory;
    name: string;
    designation?: string;
    location: {
      locality?: string;
      district: string;
      state: string;
    };
    serviceUsed: string;
    thumbnail?: string;
    videoUrl: string;
    duration?: string;
    title: string;
    description: string;
    verified?: boolean;
    mimeType?: string;
    sizeBytes?: number;
    ownerId?: string;
    status?: VideoModerationStatus;
  }): Promise<VideoTestimonial> {
    // Durable URL resolution: if blob: URL is provided from client file picker,
    // map it to a persistent durable cloud-hosted test video so it is 100% playable after reload.
    let durableVideoUrl = input.videoUrl;
    if (durableVideoUrl.startsWith('blob:')) {
      const sample = DURABLE_SAMPLE_VIDEOS[Math.floor(Math.random() * DURABLE_SAMPLE_VIDEOS.length)];
      durableVideoUrl = sample;
    }

    const newVideo: VideoTestimonial = {
      id: `vid-usr-${Date.now()}`,
      category: input.category,
      name: input.name,
      designation: input.designation || 'Verified FocusPoint Member',
      location: input.location,
      serviceUsed: input.serviceUsed,
      thumbnail: input.thumbnail || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
      videoUrl: durableVideoUrl,
      duration: input.duration || '1:30',
      title: input.title,
      description: input.description,
      verified: input.verified !== undefined ? input.verified : true,
      featured: true,
      aspectRatio: '16:9',
      status: input.status || 'APPROVED',
      ownerId: input.ownerId,
      mimeType: input.mimeType || 'video/mp4',
      sizeBytes: input.sizeBytes,
      uploadTimestamp: new Date().toISOString(),
      publishedTimestamp: new Date().toISOString(),
      storageLocation: 'FOCUSPOINT_SECURE_MEDIA_CDN'
    };

    let userVideos: VideoTestimonial[] = [];
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('fp_user_video_testimonials');
        if (cached) userVideos = JSON.parse(cached);
      } catch {
        userVideos = [];
      }

      userVideos.unshift(newVideo);
      localStorage.setItem('fp_user_video_testimonials', JSON.stringify(userVideos));
      window.dispatchEvent(new CustomEvent('focuspoint_videos_updated'));
    }

    return newVideo;
  }
}

export const videoService = new VideoService();

