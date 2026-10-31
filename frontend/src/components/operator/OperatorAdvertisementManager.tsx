import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Megaphone, Plus, Edit3, Trash2, Eye, MousePointerClick, 
  TrendingUp, Calendar, CheckCircle2, Clock, PauseCircle, 
  ExternalLink, Sparkles, Filter, ShieldCheck, X, Image as ImageIcon,
  Copy, Play, Video, Smartphone, Monitor, Tablet, Layers, 
  ArrowRight, Tag, AlertCircle, Upload, Check, ChevronRight, ChevronLeft,
  Volume2, VolumeX, Maximize2, Minimize2, Search, Percent, Ticket,
  MapPin, RotateCcw, Radio, Award, Activity, Flame, ShieldAlert, Globe, Compass
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { 
  AdvertisementCampaign, AdPlacement, AdStatus, AdLayout, 
  AdMediaType, AdTargetPage 
} from '../../types/advertisement';
import { HomepageOffer, OfferStatus } from '../../types/homepage';
import { SuperAdminOfferDefinition } from '../../types';
import { advertisementService } from '../../services/advertisementService';
import { offerService } from '../../services/offerService';
import { locationService } from '../../services/locationService';
import { operatorService } from '../../services/operatorService';
import { useToast } from '../../context/ToastContext';

// ============================================================================
// PROCEDURAL AUDIO SYNTHESIZER (Cyber-HUD Sound Effects)
// ============================================================================
let audioCtx: AudioContext | null = null;
const playCyberSound = (type: 'click' | 'warp' | 'confirm' | 'toggle' | 'alert' | 'scan') => {
  if (typeof window === 'undefined') return;
  const isMuted = localStorage.getItem('fp_ad_manager_audio_muted') === 'true';
  if (isMuted) return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    switch (type) {
      case 'click':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.04);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'toggle':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(720, now);
        osc.frequency.setValueAtTime(540, now + 0.04);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.07);
        break;
      case 'warp':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.14);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
        break;
      case 'confirm':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.setValueAtTime(960, now + 0.06);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      case 'scan':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.08);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
        break;
      case 'alert':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.setValueAtTime(280, now + 0.08);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
        break;
    }
  } catch {
    // Audio context suppressed or unsupported
  }
};

// ============================================================================
// 1-CLICK CAMPAIGN PRESET TEMPLATES
// ============================================================================
interface CampaignPreset {
  id: string;
  badge: string;
  title: string;
  advertiser: string;
  headline: string;
  subheading: string;
  description: string;
  supportingText: string;
  promotionalOffer: string;
  targetPage: AdTargetPage;
  placement: AdPlacement;
  destinationUrl: string;
  ctaText: string;
  priority: number;
  imageUrl: string;
  accentColor: string;
}

const HIGH_IMPACT_PRESETS: CampaignPreset[] = [
  {
    id: 'PRESET-UP-POLICE',
    badge: 'UPPRPB 2026',
    title: 'UP Police Constable Mega Mock Blitz',
    advertiser: 'FocusPoint Test Intelligence Studio',
    headline: 'UP Police Constable 300-Mark Full Computerized Mock Test',
    subheading: 'Exact Exam Interface • Negative Marking 0.50 • Live Rank',
    description: 'Solve real exam pattern simulated papers. Instant bilingual Hindi/English explanations with automatic mistake book generation.',
    supportingText: '⚡ Over 48,000 UP Aspirants Attempted This Week',
    promotionalOffer: 'Free All-UP Diagnostic Rank',
    targetPage: 'MOCK_TESTS',
    placement: 'MOCK_TEST_HERO',
    destinationUrl: '/mock-tests',
    ctaText: 'Start Free Mock Drill',
    priority: 95,
    imageUrl: '/assets/images/white_home_tuition_bg.jpg',
    accentColor: 'from-amber-500/20 to-orange-600/30'
  },
  {
    id: 'PRESET-KOTA-NEET',
    badge: 'Kota Mentorship',
    title: 'NEET & IIT-JEE Foundation Mentorship Pass',
    advertiser: 'Kota EduPrep Partner Institute',
    headline: 'IIT-JEE & NEET Ranker Faculty for Personalized Home Tuition',
    subheading: 'Master Complex Physics, Organic Chemistry & Biology Concepts',
    description: 'Learn from seasoned Kota educators at your home desk. Includes weekly chapter tests, personalized DPP sheets, and zero brokerage.',
    supportingText: '🎯 100% Aadhaar & Degree KYC Verified Faculty',
    promotionalOffer: 'Free Diagnostic Demo Class',
    targetPage: 'FIND_TUTOR',
    placement: 'FIND_TUTOR_HERO',
    destinationUrl: '/find-tutor?subject=Physics&class=Class+11',
    ctaText: 'Book Free Demo',
    priority: 92,
    imageUrl: '/assets/images/study_library_bg.jpg',
    accentColor: 'from-cyan-500/20 to-blue-600/30'
  },
  {
    id: 'PRESET-AC-LIBRARY',
    badge: 'Silent Hubs',
    title: '24/7 Digital AC Study Library Desk Pass',
    advertiser: 'Silent Study Hubs India',
    headline: 'Reserved Air-Conditioned Desks with 5G Wi-Fi & Power Backup',
    subheading: 'Engineered for UPSC, UPPSC, SSC & High-Concentration Study',
    description: 'Choose your preferred desk on live visual seat map. Ergonomic cushion chairs, individual power plugs, purified RO water, and pin-drop silence.',
    supportingText: '⚡ Morning (6AM-2PM) & Evening (2PM-10PM) Shifts Available',
    promotionalOffer: 'Save ₹200 on First Monthly Pass',
    targetPage: 'FIND_LIBRARY',
    placement: 'FIND_LIBRARY_HERO',
    destinationUrl: '/find-library',
    ctaText: 'Reserve My Desk',
    priority: 88,
    imageUrl: '/assets/images/study_library_bg.jpg',
    accentColor: 'from-emerald-500/20 to-teal-600/30'
  },
  {
    id: 'PRESET-SUPER-TET',
    badge: 'Primary Teacher',
    title: 'Super TET Primary Master Marathon 2026',
    advertiser: 'UP Shikshak Academy',
    headline: 'Comprehensive Super TET Study Materials & Question Vault',
    subheading: 'Child Psychology, Hindi, Math & Environmental Studies Mastery',
    description: 'Handcrafted question papers and digital notes curated by state examination toppers. Covers all 14 mandatory syllabus sections.',
    supportingText: '📚 5,000+ Topic Wise Solved Practice Questions',
    promotionalOffer: 'Flat 30% Off Today',
    targetPage: 'STUDY_MATERIALS',
    placement: 'SERVICE_CAROUSEL',
    destinationUrl: '/study-materials',
    ctaText: 'Explore Notes Vault',
    priority: 85,
    imageUrl: '/assets/images/white_home_tuition_bg.jpg',
    accentColor: 'from-purple-500/20 to-indigo-600/30'
  },
  {
    id: 'PRESET-DISTRICT-KYC',
    badge: 'Verified Tutor',
    title: 'District KYC Verified Home Tutors at Your Doorstep',
    advertiser: 'FocusPoint Academic Network',
    headline: 'District Admin KYC Verified Home Tutors at Your Doorstep',
    subheading: '100% Aadhaar & University Degree Authenticated Educators',
    description: 'Personalized 1-on-1 home tuition for Class 1 to 12, CBSE, ICSE, and UP Board. Zero cold calling, zero middleman brokerage.',
    supportingText: '⚡ Instant District Admin Matching in < 15 mins',
    promotionalOffer: '100% Zero Brokerage',
    targetPage: 'ALL',
    placement: 'SERVICE_CAROUSEL',
    destinationUrl: '/find-tutor',
    ctaText: 'Find Your Tutor',
    priority: 95,
    imageUrl: '/assets/images/white_home_tuition_bg.jpg',
    accentColor: 'from-rose-500/20 to-pink-600/30'
  }
];

export const OperatorAdvertisementManager: React.FC = () => {
  const { showToast } = useToast();

  // Core Data State
  const [campaigns, setCampaigns] = useState<AdvertisementCampaign[]>([]);
  const [offers, setOffers] = useState<HomepageOffer[]>([]);
  const [rawOffers, setRawOffers] = useState<SuperAdminOfferDefinition[]>([]);
  
  // Navigation & Viewport Modes
  const [activeConsoleTab, setActiveConsoleTab] = useState<'CAMPAIGNS' | 'OFFERS' | 'SIMULATOR' | 'ANALYTICS'>('CAMPAIGNS');
  const [isPanoramic, setIsPanoramic] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    return typeof window !== 'undefined' && localStorage.getItem('fp_ad_manager_audio_muted') === 'true';
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPageFilter, setSelectedPageFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('ALL');

  // Multi-Device Simulator State
  const [simulatorDevice, setSimulatorDevice] = useState<'DESKTOP' | 'TABLET' | 'MOBILE'>('DESKTOP');
  const [simulatorActiveHeroIndex, setSimulatorActiveHeroIndex] = useState(0);
  const [inspectedSlot, setInspectedSlot] = useState<'HERO' | 'TICKER' | 'MENTORSHIP' | 'FLOATING'>('HERO');

  // Ad Wizard Modal State (6 Steps)
  const [wizardOpen, setWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingCampaign, setEditingCampaign] = useState<AdvertisementCampaign | null>(null);

  // Offer Creation Modal State
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<SuperAdminOfferDefinition | null>(null);

  // Form State: 6-Step Ad Creation Wizard
  const [formTitle, setFormTitle] = useState('');
  const [formAdvertiserName, setFormAdvertiserName] = useState('FocusPoint');
  const [formCampaignName, setFormCampaignName] = useState('');
  const [formInternalNotes, setFormInternalNotes] = useState('');
  const [formMediaType, setFormMediaType] = useState<AdMediaType>('RICH_AD');
  const [formImageUrl, setFormImageUrl] = useState('/assets/images/white_home_tuition_bg.jpg');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formCompanyLogoUrl, setFormCompanyLogoUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [formHeadline, setFormHeadline] = useState('');
  const [formSubheading, setFormSubheading] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSupportingText, setFormSupportingText] = useState('');
  const [formBadgeText, setFormBadgeText] = useState('Verified Partner');
  const [formPromotionalOffer, setFormPromotionalOffer] = useState('');
  const [formCtaText, setFormCtaText] = useState('Explore Now');
  const [formDestinationUrl, setFormDestinationUrl] = useState('/find-tutor');
  const [formTargetPage, setFormTargetPage] = useState<AdTargetPage>('ALL');
  const [formPlacement, setFormPlacement] = useState<AdPlacement>('SERVICE_CAROUSEL');
  const [formTargetStateId, setFormTargetStateId] = useState<string>('');
  const [formTargetDistrictId, setFormTargetDistrictId] = useState<string>('');
  const [formTargetAudience, setFormTargetAudience] = useState('All Students & Parents');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState('2026-12-31');
  const [formPriority, setFormPriority] = useState(10);
  const [formStatus, setFormStatus] = useState<AdStatus>('LIVE');

  // Form State: Offer / Coupon Modal
  const [offerFormCode, setOfferFormCode] = useState('FESTIVE30');
  const [offerFormName, setOfferFormName] = useState('Autumn Student Savings Festival');
  const [offerFormService, setOfferFormService] = useState<'ALL' | 'HOME_TUITION' | 'SELF_STUDY_LIBRARY' | 'MOCK_TEST' | 'STUDY_MATERIAL'>('ALL');
  const [offerFormScope, setOfferFormScope] = useState<'PAN_INDIA' | 'STATE' | 'DISTRICT' | 'LOCALITY'>('PAN_INDIA');
  const [offerFormState, setOfferFormState] = useState('Uttar Pradesh');
  const [offerFormDistrict, setOfferFormDistrict] = useState('Ghazipur');
  const [offerFormLocality, setOfferFormLocality] = useState('');
  const [offerFormDiscountType, setOfferFormDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [offerFormDiscountValue, setOfferFormDiscountValue] = useState<number>(30);
  const [offerFormStartDate, setOfferFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [offerFormEndDate, setOfferFormEndDate] = useState('2026-11-30');
  const [offerFormUsageLimit, setOfferFormUsageLimit] = useState<number>(250);
  const [offerFormTerms, setOfferFormTerms] = useState<string>('Valid on first academic booking\nCannot be clubbed with referral cashbacks');
  const [offerFormStatus, setOfferFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const states = locationService.getStates();
  const districts = formTargetStateId ? locationService.getDistricts(formTargetStateId) : [];

  // Data Loading & Reactive Subscriptions
  const loadData = async () => {
    const allCampaigns = advertisementService.getAllCampaigns();
    setCampaigns(allCampaigns);

    const mappedOffers = await offerService.getAllOffers();
    setOffers(mappedOffers);

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fp_super_admin_offers');
      if (stored) {
        try {
          setRawOffers(JSON.parse(stored));
        } catch {
          setRawOffers([]);
        }
      }
    }
  };

  useEffect(() => {
    loadData();
    advertisementService.syncWithBackend();

    const unsubAd = advertisementService.subscribe(loadData);
    const unsubOffer = offerService.subscribe(loadData);

    return () => {
      unsubAd();
      unsubOffer();
    };
  }, []);

  // Audio Toggle Handler
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    localStorage.setItem('fp_ad_manager_audio_muted', String(next));
    if (!next) playCyberSound('confirm');
  };

  // Launch Wizard with Preset
  const handleApplyPreset = (preset: CampaignPreset) => {
    playCyberSound('warp');
    setEditingCampaign(null);
    setCurrentStep(1);
    setFormTitle(preset.title);
    setFormAdvertiserName(preset.advertiser);
    setFormCampaignName('Academic Boost 2026');
    setFormInternalNotes(`Created from operator preset: ${preset.title}`);
    setFormMediaType('RICH_AD');
    setFormImageUrl(preset.imageUrl);
    setFormVideoUrl('');
    setFormCompanyLogoUrl('');
    setFormHeadline(preset.headline);
    setFormSubheading(preset.subheading);
    setFormDescription(preset.description);
    setFormSupportingText(preset.supportingText);
    setFormBadgeText(preset.badge);
    setFormPromotionalOffer(preset.promotionalOffer);
    setFormCtaText(preset.ctaText);
    setFormDestinationUrl(preset.destinationUrl);
    setFormTargetPage(preset.targetPage);
    setFormPlacement(preset.placement);
    setFormTargetStateId('');
    setFormTargetDistrictId('');
    setFormTargetAudience('All Students & Parents');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate('2026-12-31');
    setFormPriority(preset.priority);
    setFormStatus('LIVE');
    setWizardOpen(true);
    showToast(`Preset "${preset.title}" loaded into Studio Wizard!`, 'success');
  };

  // Open Blank Create Wizard
  const openCreateWizard = () => {
    playCyberSound('click');
    setEditingCampaign(null);
    setCurrentStep(1);
    setFormTitle('New Academic Year Promotion');
    setFormAdvertiserName('FocusPoint');
    setFormCampaignName('Pan-India Launch 2026');
    setFormInternalNotes('Verified educational campaign for students and parents');
    setFormMediaType('RICH_AD');
    setFormImageUrl('/assets/images/white_home_tuition_bg.jpg');
    setFormVideoUrl('');
    setFormCompanyLogoUrl('');
    setUploadProgress(null);
    setUploadedFileName('');
    setFormHeadline('Empower Your Academic Journey with Verified Home Mentors');
    setFormSubheading('Pan-India Academic Excellence Guaranteed');
    setFormDescription('Book background-verified home educators across 75 Uttar Pradesh districts and top educational hubs.');
    setFormSupportingText('⚡ Trial session guaranteed with 100% syllabus alignment');
    setFormBadgeText('Verified Campaign');
    setFormPromotionalOffer('Flat 20% Off');
    setFormCtaText('Find Verified Tutor');
    setFormDestinationUrl('/find-tutor');
    setFormTargetPage('FIND_TUTOR');
    setFormPlacement('SERVICE_CAROUSEL');
    setFormTargetStateId('');
    setFormTargetDistrictId('');
    setFormTargetAudience('All Students & Parents');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate('2026-12-31');
    setFormPriority(50);
    setFormStatus('LIVE');
    setWizardOpen(true);
  };

  // Open Edit Wizard
  const openEditWizard = (camp: AdvertisementCampaign) => {
    playCyberSound('click');
    setEditingCampaign(camp);
    setCurrentStep(1);
    setFormTitle(camp.title || camp.headline);
    setFormAdvertiserName(camp.advertiserName || 'FocusPoint');
    setFormCampaignName(camp.campaignName || '');
    setFormInternalNotes('');
    setFormMediaType(camp.mediaType || 'RICH_AD');
    setFormImageUrl(camp.imageUrl || '/assets/images/white_home_tuition_bg.jpg');
    setFormVideoUrl(camp.videoUrl || '');
    setFormCompanyLogoUrl(camp.companyLogoUrl || '');
    setUploadProgress(null);
    setUploadedFileName('');
    setFormHeadline(camp.headline);
    setFormSubheading(camp.subheading || '');
    setFormDescription(camp.description || '');
    setFormSupportingText(camp.supportingText || '');
    setFormBadgeText(camp.badgeText || 'Verified Campaign');
    setFormPromotionalOffer(camp.promotionalOffer || '');
    setFormCtaText(camp.ctaText || 'Explore Now');
    setFormDestinationUrl(camp.destinationUrl || '/find-tutor');
    setFormTargetPage((camp.targetPages && camp.targetPages[0]) || camp.targetPage || 'ALL');
    setFormPlacement(camp.placement || 'SERVICE_CAROUSEL');
    setFormTargetStateId(camp.targetStateId || '');
    setFormTargetDistrictId(camp.targetDistrictId || '');
    setFormTargetAudience(camp.targetAudience || 'All Students & Parents');
    setFormStartDate(camp.startDate);
    setFormEndDate(camp.endDate);
    setFormPriority(camp.priority || 50);
    setFormStatus(camp.status || 'LIVE');
    setWizardOpen(true);
  };

  // Save Campaign
  const handleSaveCampaign = async () => {
    if (!formHeadline.trim() || !formDestinationUrl.trim()) {
      playCyberSound('alert');
      showToast('Headline and Destination Link are required', 'warning');
      return;
    }

    playCyberSound('confirm');
    const payload: Omit<AdvertisementCampaign, 'id' | 'createdAt' | 'updatedAt' | 'impressions' | 'clicks' | 'videoPlays'> & {
      id?: string;
      impressions?: number;
      clicks?: number;
      videoPlays?: number;
    } = {
      id: editingCampaign?.id,
      title: formTitle.trim() || formHeadline.trim(),
      advertiserName: formAdvertiserName.trim() || 'FocusPoint',
      campaignName: formCampaignName.trim() || 'General Campaign',
      headline: formHeadline.trim(),
      subheading: formSubheading.trim() || undefined,
      description: formDescription.trim() || undefined,
      supportingText: formSupportingText.trim() || undefined,
      badgeText: formBadgeText.trim() || undefined,
      promotionalOffer: formPromotionalOffer.trim() || undefined,
      mediaType: formMediaType,
      imageUrl: formImageUrl.trim() || '/assets/images/white_home_tuition_bg.jpg',
      videoUrl: formVideoUrl.trim() || undefined,
      companyLogoUrl: formCompanyLogoUrl.trim() || undefined,
      destinationUrl: formDestinationUrl.trim(),
      ctaText: formCtaText.trim() || 'Explore Now',
      targetPages: formTargetPage === 'ALL' ? (['ALL'] as AdTargetPage[]) : [formTargetPage],
      targetPage: formTargetPage,
      placement: formPlacement,
      layout: 'carousel' as AdLayout,
      targetStateId: formTargetStateId || undefined,
      targetDistrictId: formTargetDistrictId || undefined,
      targetAudience: formTargetAudience.trim() || undefined,
      startDate: formStartDate,
      endDate: formEndDate,
      priority: Number(formPriority) || 10,
      status: formStatus,
    };

    const saved = advertisementService.saveCampaign(payload);

    // Operator Immutable Activity Trail Logging
    try {
      await operatorService.logActivity({
        operatorId: 'OP-2026-08',
        operatorName: 'Sunita Verma',
        action: editingCampaign ? 'MATERIAL_EDIT' : 'MATERIAL_PUBLISH',
        entity: 'STUDY_MATERIAL',
        entityId: saved.id,
        entityTitle: saved.headline,
        details: `Saved advertisement campaign: "${saved.headline}" for placement ${saved.placement} (Priority ${saved.priority})`,
      });
    } catch {
      // Background audit log non-blocking
    }

    showToast(editingCampaign ? 'Campaign updated successfully!' : 'Campaign published to FocusPoint Homepage!', 'success');
    setWizardOpen(false);
  };

  // Fast Status Toggle for Campaigns
  const handleToggleCampaignStatus = async (camp: AdvertisementCampaign) => {
    playCyberSound('toggle');
    const nextStatus: AdStatus = camp.status === 'LIVE' ? 'PAUSED' : 'LIVE';
    advertisementService.saveCampaign({ ...camp, status: nextStatus });

    try {
      await operatorService.logActivity({
        operatorId: 'OP-2026-08',
        operatorName: 'Sunita Verma',
        action: 'STATUS_CHANGE',
        entity: 'STUDY_MATERIAL',
        entityId: camp.id,
        entityTitle: camp.headline,
        details: `Toggled ad campaign "${camp.headline}" status from ${camp.status} to ${nextStatus}`,
      });
    } catch {}

    showToast(`Campaign is now ${nextStatus}`, 'info');
  };

  // Adjust Priority Quickly
  const handleAdjustPriority = (camp: AdvertisementCampaign, delta: number) => {
    playCyberSound('click');
    const newPriority = Math.max(1, Math.min(100, (camp.priority || 50) + delta));
    advertisementService.saveCampaign({ ...camp, priority: newPriority });
    showToast(`Priority adjusted to ${newPriority} for "${camp.headline.substring(0, 24)}..."`, 'info');
  };

  // Duplicate Campaign
  const handleDuplicateCampaign = async (id: string) => {
    playCyberSound('warp');
    const duplicated = advertisementService.duplicateCampaign(id);
    if (duplicated) {
      try {
        await operatorService.logActivity({
          operatorId: 'OP-2026-08',
          operatorName: 'Sunita Verma',
          action: 'MATERIAL_UPLOAD',
          entity: 'STUDY_MATERIAL',
          entityId: duplicated.id,
          entityTitle: duplicated.headline,
          details: `Duplicated ad campaign ID: ${id} into clone ${duplicated.id}`,
        });
      } catch {}
      showToast('Campaign cloned into Draft status!', 'success');
    }
  };

  // Delete Campaign
  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this advertisement campaign? This action is recorded in the immutable audit trail.')) {
      return;
    }
    playCyberSound('alert');
    advertisementService.deleteCampaign(id);

    try {
      await operatorService.logActivity({
        operatorId: 'OP-2026-08',
        operatorName: 'Sunita Verma',
        action: 'MATERIAL_ARCHIVE',
        entity: 'STUDY_MATERIAL',
        entityId: id,
        entityTitle: 'Advertisement Campaign',
        details: `Deleted ad campaign ID: ${id}`,
      });
    } catch {}

    showToast('Advertisement campaign deleted', 'warning');
  };

  // Media File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'IMAGE' | 'VIDEO' | 'LOGO') => {
    const file = e.target.files?.[0];
    if (!file) return;

    playCyberSound('scan');
    const maxBytes = type === 'VIDEO' ? 50 * 1024 * 1024 : 15 * 1024 * 1024;
    if (file.size > maxBytes) {
      playCyberSound('alert');
      showToast(`File is too large. Max limit is ${type === 'VIDEO' ? '50MB' : '15MB'}.`, 'error');
      return;
    }

    setUploadedFileName(file.name);
    setUploadProgress(15);

    const res = await advertisementService.uploadMedia(file, (pct) => {
      setUploadProgress(pct);
    });

    if (res.success && res.url) {
      playCyberSound('confirm');
      if (type === 'IMAGE') setFormImageUrl(res.url);
      if (type === 'VIDEO') setFormVideoUrl(res.url);
      if (type === 'LOGO') setFormCompanyLogoUrl(res.url);
      showToast(`${file.name} uploaded and verified!`, 'success');
      setTimeout(() => setUploadProgress(null), 1200);
    } else {
      playCyberSound('alert');
      showToast(res.error || 'Upload failed. Please try again.', 'error');
      setUploadProgress(null);
    }
  };

  // ============================================================================
  // OFFER / COUPON MODAL HANDLERS
  // ============================================================================
  const openCreateOfferModal = () => {
    playCyberSound('click');
    setEditingOffer(null);
    setOfferFormCode(`DIWALI${Math.floor(10 + Math.random() * 90)}`);
    setOfferFormName('Festival Special Student Discount');
    setOfferFormService('ALL');
    setOfferFormScope('PAN_INDIA');
    setOfferFormState('Uttar Pradesh');
    setOfferFormDistrict('Ghazipur');
    setOfferFormLocality('');
    setOfferFormDiscountType('PERCENTAGE');
    setOfferFormDiscountValue(25);
    setOfferFormStartDate(new Date().toISOString().split('T')[0]);
    setOfferFormEndDate('2026-11-30');
    setOfferFormUsageLimit(500);
    setOfferFormTerms('Valid on first academic booking\nCannot be clubbed with other offers');
    setOfferFormStatus('ACTIVE');
    setOfferModalOpen(true);
  };

  const openEditOfferModal = (offer: HomepageOffer) => {
    playCyberSound('click');
    const raw = rawOffers.find(r => r.id === offer.id);
    setEditingOffer(raw || null);
    setOfferFormCode(offer.couponCode || '');
    setOfferFormName(offer.title);
    setOfferFormService(offer.service as any || 'ALL');
    setOfferFormScope(offer.scope as any || 'PAN_INDIA');
    setOfferFormState(offer.stateName || 'Uttar Pradesh');
    setOfferFormDistrict(offer.districtName || 'Ghazipur');
    setOfferFormLocality(offer.localityName || '');
    setOfferFormDiscountType(offer.discountType);
    setOfferFormDiscountValue(offer.discountValue);
    setOfferFormStartDate(offer.startDate);
    setOfferFormEndDate(offer.endDate);
    setOfferFormUsageLimit(raw?.usageLimit || 250);
    setOfferFormTerms(offer.termsAndConditions?.join('\n') || 'Valid on all eligible student courses');
    setOfferFormStatus(raw?.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE');
    setOfferModalOpen(true);
  };

  const handleSaveOffer = async () => {
    if (!offerFormCode.trim() || !offerFormName.trim()) {
      playCyberSound('alert');
      showToast('Coupon Code and Campaign Name are required', 'warning');
      return;
    }

    playCyberSound('confirm');
    const termsArray = offerFormTerms
      .split('\n')
      .map(t => t.trim())
      .filter(Boolean);

    await offerService.saveOffer({
      id: editingOffer?.id,
      name: offerFormName.trim(),
      couponCode: offerFormCode.toUpperCase().trim(),
      service: offerFormService as any,
      scope: offerFormScope as any,
      stateName: offerFormScope !== 'PAN_INDIA' ? offerFormState : undefined,
      districtName: offerFormScope === 'DISTRICT' || offerFormScope === 'LOCALITY' ? offerFormDistrict : undefined,
      localityName: offerFormScope === 'LOCALITY' ? offerFormLocality : undefined,
      discountType: offerFormDiscountType,
      discountValue: Number(offerFormDiscountValue) || 10,
      startDate: offerFormStartDate,
      endDate: offerFormEndDate,
      usageLimit: Number(offerFormUsageLimit) || 500,
      termsAndConditions: termsArray.length > 0 ? termsArray : ['Valid across FocusPoint educational services'],
      status: offerFormStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
    });

    try {
      await operatorService.logActivity({
        operatorId: 'OP-2026-08',
        operatorName: 'Sunita Verma',
        action: editingOffer ? 'MATERIAL_EDIT' : 'MATERIAL_PUBLISH',
        entity: 'STUDY_MATERIAL',
        entityId: editingOffer?.id || offerFormCode,
        entityTitle: offerFormName,
        details: `Configured Homepage Promotional Coupon: "${offerFormCode.toUpperCase()}" (${offerFormDiscountType === 'PERCENTAGE' ? `${offerFormDiscountValue}%` : `₹${offerFormDiscountValue}`} discount)`,
      });
    } catch {}

    showToast(editingOffer ? 'Coupon offer updated!' : 'New promotional coupon launched to Homepage!', 'success');
    setOfferModalOpen(false);
  };

  const handleToggleOfferStatus = async (id: string) => {
    playCyberSound('toggle');
    await offerService.toggleOfferStatus(id);
    try {
      await operatorService.logActivity({
        operatorId: 'OP-2026-08',
        operatorName: 'Sunita Verma',
        action: 'STATUS_CHANGE',
        entity: 'STUDY_MATERIAL',
        entityId: id,
        entityTitle: 'Homepage Promotional Offer',
        details: `Toggled promotional offer ID: ${id} status`,
      });
    } catch {}
    showToast('Offer status updated!', 'info');
  };

  const handleDeleteOffer = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this promotional coupon?')) return;
    playCyberSound('alert');
    await offerService.deleteOffer(id);
    try {
      await operatorService.logActivity({
        operatorId: 'OP-2026-08',
        operatorName: 'Sunita Verma',
        action: 'MATERIAL_ARCHIVE',
        entity: 'STUDY_MATERIAL',
        entityId: id,
        entityTitle: 'Homepage Promotional Offer',
        details: `Deleted homepage offer coupon ID: ${id}`,
      });
    } catch {}
    showToast('Offer deleted from system', 'warning');
  };

  const handleCopyCode = (code: string) => {
    playCyberSound('click');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    showToast(`Coupon code ${code} copied to clipboard!`, 'success');
  };

  // Filtered Lists
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (c.title || '').toLowerCase().includes(q);
        const matchHead = (c.headline || '').toLowerCase().includes(q);
        const matchAdv = (c.advertiserName || '').toLowerCase().includes(q);
        const matchDesc = (c.description || '').toLowerCase().includes(q);
        if (!matchTitle && !matchHead && !matchAdv && !matchDesc) return false;
      }

      // Page Filter
      const pages = c.targetPages || (c.targetPage ? [c.targetPage] : ['ALL']);
      if (selectedPageFilter !== 'ALL' && !pages.includes(selectedPageFilter as AdTargetPage) && !pages.includes('ALL')) {
        return false;
      }

      // Status Filter
      if (selectedStatusFilter !== 'ALL' && c.status !== selectedStatusFilter) {
        return false;
      }

      return true;
    });
  }, [campaigns, searchQuery, selectedPageFilter, selectedStatusFilter]);

  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = (o.couponCode || '').toLowerCase().includes(q);
        const matchTitle = (o.title || '').toLowerCase().includes(q);
        const matchSub = (o.subtitle || '').toLowerCase().includes(q);
        if (!matchCode && !matchTitle && !matchSub) return false;
      }

      if (selectedServiceFilter !== 'ALL' && o.service !== 'ALL' && o.service !== selectedServiceFilter) {
        return false;
      }

      if (selectedStatusFilter !== 'ALL' && o.status !== selectedStatusFilter) {
        return false;
      }

      return true;
    });
  }, [offers, searchQuery, selectedServiceFilter, selectedStatusFilter]);

  // Real Analytics Aggregation
  const analyticsSummary = useMemo(() => {
    return advertisementService.getAnalyticsSummary();
  }, [campaigns]);

  // Live Campaigns eligible for Simulator Hero
  const liveHeroCampaigns = useMemo(() => {
    const list = campaigns.filter(c => c.status === 'LIVE');
    return list.length > 0 ? list : campaigns;
  }, [campaigns]);

  const currentSimulatedHero = liveHeroCampaigns[simulatorActiveHeroIndex % (liveHeroCampaigns.length || 1)] || liveHeroCampaigns[0];
  const activeOfferForTicker = offers.find(o => o.status === 'LIVE' || o.status === 'EXPIRING_SOON') || offers[0];

  return (
    <div className={`space-y-6 transition-all duration-300 ${isPanoramic ? 'max-w-none px-2' : ''}`}>
      
      {/* ============================================================ */}
      {/* 1. CYBER-HUD COCKPIT HEADER WITH TELEMETRY STATUS */}
      {/* ============================================================ */}
      <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                HUD PROMOTIONS & OFFERS ENGINE
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold">
                <Radio className="w-3 h-3 text-emerald-400 animate-ping" />
                LIVE SERVING: {analyticsSummary.activeLive} ADS & {offers.filter(o => o.status === 'LIVE').length} OFFERS
              </span>

              <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-[11px] font-mono">
                NON-FINANCIAL ACADEMIC HUD
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Homepage Ads & Offers Console</span>
              <Award className="w-7 h-7 text-amber-400 hidden sm:inline" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl mt-1">
              Autonomous promotional command center for student hero sliders, partner campaigns, multi-device viewports, and seasonal discount coupons across pan-India landing hubs.
            </p>
          </div>

          {/* Quick HUD Tool Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isMuted 
                  ? 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white' 
                  : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-sm'
              }`}
              title={isMuted ? 'Unmute Audio Synthesizer' : 'Mute Audio Synthesizer'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />}
              <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Audio On'}</span>
            </button>

            {/* Panoramic Studio Toggle */}
            <button
              onClick={() => {
                playCyberSound('click');
                setIsPanoramic(!isPanoramic);
              }}
              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title={isPanoramic ? 'Compact View' : 'Panoramic Studio'}
            >
              {isPanoramic ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
              <span className="hidden md:inline">{isPanoramic ? 'Standard' : 'Panoramic'}</span>
            </button>

            {/* Add Offer Button */}
            <button
              onClick={openCreateOfferModal}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-600/20 cursor-pointer transition-all active:scale-95"
            >
              <Ticket className="w-4 h-4" />
              <span>+ New Offer / Coupon</span>
            </button>

            {/* Add Ad Campaign Button */}
            <button
              onClick={openCreateWizard}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Ad Campaign</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TELEMETRY 6-KPI STATS MATRIX */}
        {/* ============================================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          {/* KPI 1 */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-3.5 border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">Total Campaigns</span>
              <Megaphone className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-black font-mono text-white">{analyticsSummary.totalCampaigns}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Multi-company Hub</div>
          </div>

          {/* KPI 2 */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">Serving Live</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black font-mono text-emerald-400">{analyticsSummary.activeLive}</div>
            <div className="text-[10px] text-emerald-500/80 font-medium mt-0.5">Broadcasting Now</div>
          </div>

          {/* KPI 3 */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-3.5 border border-amber-500/20 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">Active Coupons</span>
              <Ticket className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-black font-mono text-amber-300">
              {offers.filter(o => o.status === 'LIVE' || o.status === 'EXPIRING_SOON').length}
            </div>
            <div className="text-[10px] text-amber-400/80 font-medium mt-0.5">Seasonal Discounts</div>
          </div>

          {/* KPI 4 */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-3.5 border border-blue-500/20 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">Verified Views</span>
              <Eye className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-black font-mono text-white">{analyticsSummary.totalImpressions.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Slide Impressions</div>
          </div>

          {/* KPI 5 */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-3.5 border border-purple-500/20 hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">Direct Clicks</span>
              <MousePointerClick className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-black font-mono text-white">{analyticsSummary.totalClicks.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Student Engagements</div>
          </div>

          {/* KPI 6 */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-3.5 border border-rose-500/20 hover:border-rose-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">Avg CTR</span>
              <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-xl font-black font-mono text-rose-400">{analyticsSummary.overallCtr}%</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Conversion Efficiency</div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MASTER STUDIO TABS SWITCHER & SEARCH TOOLBAR */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/70 backdrop-blur-md p-2 rounded-2xl border border-slate-800">
        
        {/* Studio Consoles Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => {
              playCyberSound('click');
              setActiveConsoleTab('CAMPAIGNS');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeConsoleTab === 'CAMPAIGNS'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Ad Campaigns ({campaigns.length})</span>
          </button>

          <button
            onClick={() => {
              playCyberSound('click');
              setActiveConsoleTab('OFFERS');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeConsoleTab === 'OFFERS'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Homepage Offers ({offers.length})</span>
          </button>

          <button
            onClick={() => {
              playCyberSound('warp');
              setActiveConsoleTab('SIMULATOR');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeConsoleTab === 'SIMULATOR'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Multi-Device Simulator</span>
          </button>

          <button
            onClick={() => {
              playCyberSound('click');
              setActiveConsoleTab('ANALYTICS');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeConsoleTab === 'ANALYTICS'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Telemetry & Heatmap</span>
          </button>
        </div>

        {/* Global Instant Search & Filter Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search headline, advertiser, code..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Page Filter (for Campaigns tab) */}
          {activeConsoleTab === 'CAMPAIGNS' && (
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <Filter className="w-3 h-3 text-cyan-400" />
              <select
                value={selectedPageFilter}
                onChange={(e) => {
                  playCyberSound('click');
                  setSelectedPageFilter(e.target.value);
                }}
                className="bg-transparent font-mono font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL" className="bg-slate-900 text-white">All Pages</option>
                <option value="FIND_TUTOR" className="bg-slate-900 text-white">Find Tutor</option>
                <option value="FIND_LIBRARY" className="bg-slate-900 text-white">Find Library</option>
                <option value="MOCK_TESTS" className="bg-slate-900 text-white">Mock Tests</option>
                <option value="STUDY_MATERIALS" className="bg-slate-900 text-white">Study Materials</option>
              </select>
            </div>
          )}

          {/* Service Filter (for Offers tab) */}
          {activeConsoleTab === 'OFFERS' && (
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <Filter className="w-3 h-3 text-amber-400" />
              <select
                value={selectedServiceFilter}
                onChange={(e) => {
                  playCyberSound('click');
                  setSelectedServiceFilter(e.target.value);
                }}
                className="bg-transparent font-mono font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL" className="bg-slate-900 text-white">All Services</option>
                <option value="HOME_TUITION" className="bg-slate-900 text-white">Home Tuition</option>
                <option value="SELF_STUDY_LIBRARY" className="bg-slate-900 text-white">Library Passes</option>
                <option value="MOCK_TEST" className="bg-slate-900 text-white">Mock Tests</option>
                <option value="STUDY_MATERIAL" className="bg-slate-900 text-white">Study Materials</option>
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <select
              value={selectedStatusFilter}
              onChange={(e) => {
                playCyberSound('click');
                setSelectedStatusFilter(e.target.value);
              }}
              className="bg-transparent font-mono font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Statuses</option>
              <option value="LIVE" className="bg-slate-900 text-emerald-400">Live Active</option>
              <option value="PAUSED" className="bg-slate-900 text-amber-400">Paused</option>
              <option value="SCHEDULED" className="bg-slate-900 text-cyan-400">Scheduled</option>
              <option value="EXPIRED" className="bg-slate-900 text-rose-400">Expired</option>
              <option value="DRAFT" className="bg-slate-900 text-slate-400">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: COMMERCIAL & PARTNER AD CAMPAIGNS                     */}
      {/* ============================================================ */}
      {activeConsoleTab === 'CAMPAIGNS' && (
        <div className="space-y-6">
          
          {/* 1-Click High-Impact Campaign Presets Ribbon */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                1-Click High-Impact Campaign Launch Presets
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Click any preset to pre-fill the 6-Step Studio Wizard
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {HIGH_IMPACT_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className={`group relative p-3 rounded-xl border border-slate-800 hover:border-cyan-400 bg-gradient-to-br ${preset.accentColor} hover:shadow-lg hover:shadow-cyan-500/10 transition-all cursor-pointer overflow-hidden flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-black/60 text-cyan-300 border border-cyan-500/30">
                        {preset.badge}
                      </span>
                      <span className="text-[10px] font-mono text-amber-300 font-bold">
                        P-{preset.priority}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                      {preset.title}
                    </h4>
                    <p className="text-[11px] text-slate-300 line-clamp-2 mt-1">
                      {preset.headline}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-cyan-400 font-mono font-bold">
                    <span>Deploy Preset</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campaign Action Cards List */}
          <div className="space-y-3">
            {filteredCampaigns.length === 0 ? (
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center text-slate-400 space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <h3 className="text-base font-bold text-white">No Matching Ad Campaigns</h3>
                <p className="text-xs max-w-md mx-auto">
                  No promotional campaigns match your active search and page filters. Clear filters or create a new campaign above.
                </p>
                <button
                  onClick={openCreateWizard}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Campaign</span>
                </button>
              </div>
            ) : (
              filteredCampaigns.map((camp) => {
                const isExpired = new Date(camp.endDate) < new Date();
                const ctr = camp.impressions > 0 
                  ? ((camp.clicks / camp.impressions) * 100).toFixed(1) 
                  : '0.0';

                return (
                  <div
                    key={camp.id}
                    className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/90 hover:border-slate-700 p-4 sm:p-5 shadow-lg transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 group"
                  >
                    {/* Media Thumbnail + Core Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Thumbnail Container */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 relative group-hover:border-cyan-500/40 transition-all">
                        {camp.mediaType?.includes('VIDEO') ? (
                          <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-white p-2">
                            <Play className="w-6 h-6 text-cyan-400 mb-1" />
                            <span className="text-[9px] font-mono text-slate-400">VIDEO STREAM</span>
                          </div>
                        ) : (
                          <img
                            src={camp.imageUrl || '/assets/images/white_home_tuition_bg.jpg'}
                            alt={camp.headline}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/80 text-[8px] font-mono font-bold text-cyan-300 uppercase">
                          {camp.mediaType?.replace('_', ' ') || 'RICH AD'}
                        </span>
                      </div>

                      {/* Campaign Meta & Text */}
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                            {camp.advertiserName || 'FocusPoint'}
                          </span>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            isExpired 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : camp.status === 'LIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}>
                            {isExpired ? 'EXPIRED' : camp.status}
                          </span>

                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">
                            Slot: <strong>{camp.placement}</strong>
                          </span>

                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">
                            Pages: <strong>{(camp.targetPages && camp.targetPages.join(', ')) || camp.targetPage || 'ALL'}</strong>
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-black text-white group-hover:text-cyan-300 transition-colors truncate">
                          {camp.headline}
                        </h3>

                        {camp.subheading && (
                          <p className="text-xs text-slate-300 font-medium line-clamp-1">
                            {camp.subheading}
                          </p>
                        )}

                        <p className="text-xs text-slate-400 line-clamp-2">
                          {camp.description}
                        </p>

                        {/* Engagement Bar */}
                        <div className="flex items-center gap-4 pt-1 text-[11px] font-mono text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1 text-slate-300">
                            <Calendar className="w-3 h-3 text-cyan-400" />
                            {camp.startDate} → {camp.endDate}
                          </span>
                          <span className="flex items-center gap-1 text-blue-300">
                            <Eye className="w-3 h-3 text-blue-400" />
                            {(camp.impressions || 0).toLocaleString()} views
                          </span>
                          <span className="flex items-center gap-1 text-purple-300">
                            <MousePointerClick className="w-3 h-3 text-purple-400" />
                            {(camp.clicks || 0).toLocaleString()} clicks
                          </span>
                          <span className="flex items-center gap-1 text-rose-400 font-bold">
                            <TrendingUp className="w-3 h-3" />
                            {ctr}% CTR
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Priority & Action Controls */}
                    <div className="flex lg:flex-col items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800 flex-wrap">
                      {/* Priority Controls */}
                      <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Priority</span>
                        <span className="text-xs font-mono font-black text-amber-400">{camp.priority}</span>
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            onClick={() => handleAdjustPriority(camp, -5)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono cursor-pointer"
                            title="Decrease priority (-5)"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleAdjustPriority(camp, 5)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono cursor-pointer"
                            title="Increase priority (+5)"
                          >
                            +5
                          </button>
                        </div>
                      </div>

                      {/* Action Triggers */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Preview in Simulator */}
                        <button
                          onClick={() => {
                            playCyberSound('warp');
                            const idx = liveHeroCampaigns.findIndex(c => c.id === camp.id);
                            if (idx !== -1) setSimulatorActiveHeroIndex(idx);
                            setActiveConsoleTab('SIMULATOR');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                          title="Preview in Multi-Device Simulator"
                        >
                          <Eye className="w-3 h-3 text-cyan-400" />
                          <span>Simulator</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditWizard(camp)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3 text-indigo-400" />
                          <span>Edit</span>
                        </button>

                        {/* Duplicate Button */}
                        <button
                          onClick={() => handleDuplicateCampaign(camp.id)}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
                          title="Clone Campaign"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Status (Live / Paused) */}
                        <button
                          onClick={() => handleToggleCampaignStatus(camp)}
                          className={`p-1.5 rounded-lg border cursor-pointer ${
                            camp.status === 'LIVE'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                          title={camp.status === 'LIVE' ? 'Pause Campaign' : 'Publish / Resume Campaign'}
                        >
                          {camp.status === 'LIVE' ? (
                            <PauseCircle className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteCampaign(camp.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 cursor-pointer"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: LIVE HOMEPAGE OFFERS & SEASONAL COUPONS              */}
      {/* ============================================================ */}
      {activeConsoleTab === 'OFFERS' && (
        <div className="space-y-6">
          {/* Quick Header Banner */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-amber-400" />
                Live Homepage Promotional Offers & Coupons Engine
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage high-conversion discount vouchers, coupon tickers, seasonal passes, and regional price incentives evaluated dynamically by FocusPoint.
              </p>
            </div>

            <button
              onClick={openCreateOfferModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-600/20 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Launch New Coupon</span>
            </button>
          </div>

          {/* Offers Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOffers.length === 0 ? (
              <div className="md:col-span-2 bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center text-slate-400 space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <h3 className="text-base font-bold text-white">No Offers Found</h3>
                <p className="text-xs max-w-md mx-auto">
                  No promotional offers match your selected filter criteria. Create your first promotional discount coupon above.
                </p>
              </div>
            ) : (
              filteredOffers.map((offer) => {
                const raw = rawOffers.find(r => r.id === offer.id);
                const usageLimit = raw?.usageLimit || 250;
                const timesUsed = raw?.timesUsed || 0;
                const usagePercent = Math.min(100, Math.round((timesUsed / (usageLimit || 1)) * 100));

                return (
                  <div
                    key={offer.id}
                    className="relative bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 hover:border-amber-500/40 p-5 shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
                  >
                    {/* Top Coupon Ticket Header */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Coupon Code Pill with Copy Action */}
                          <div
                            onClick={() => handleCopyCode(offer.couponCode || '')}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-black text-xs cursor-pointer hover:bg-amber-500/20 transition-colors"
                            title="Click to copy coupon code"
                          >
                            <Ticket className="w-3.5 h-3.5 text-amber-400" />
                            <span>{offer.couponCode}</span>
                            <Copy className="w-3 h-3 text-amber-400 opacity-60 group-hover:opacity-100" />
                          </div>

                          {/* Discount Pill */}
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs">
                            {offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} FLAT OFF`}
                          </span>
                        </div>

                        {/* Status Beacon */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          offer.status === 'LIVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : offer.status === 'EXPIRING_SOON'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                            : offer.status === 'SCHEDULED'
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {offer.status}
                        </span>
                      </div>

                      {/* Offer Title & Scope */}
                      <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors mb-1">
                        {offer.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                        {offer.subtitle}
                      </p>

                      {/* Target Location / Scope Badge */}
                      <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-slate-400 mb-4">
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {offer.scope === 'PAN_INDIA' ? 'Pan-India Broad' : `${offer.stateName || 'UP'} • ${offer.districtName || 'All Districts'}`}
                        </span>

                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                          <Award className="w-3 h-3 text-amber-400" />
                          Service: {offer.service}
                        </span>

                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                          <Calendar className="w-3 h-3" />
                          Valid till {offer.endDate}
                        </span>
                      </div>

                      {/* Usage Limit Progress Bar */}
                      <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 space-y-1 mb-4">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Usage Redemptions</span>
                          <span className="font-bold text-slate-200">
                            {timesUsed} / {usageLimit} ({usagePercent}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Terms Bullet Points */}
                      {offer.termsAndConditions && offer.termsAndConditions.length > 0 && (
                        <div className="space-y-1 mb-4">
                          <span className="text-[10px] font-mono uppercase text-slate-500">Terms & Conditions</span>
                          <ul className="text-[11px] text-slate-400 space-y-0.5 list-disc list-inside">
                            {offer.termsAndConditions.slice(0, 2).map((term, i) => (
                              <li key={i} className="line-clamp-1">{term}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyCode(offer.couponCode || '')}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3 text-amber-400" />
                          <span>Copy</span>
                        </button>

                        <button
                          onClick={() => openEditOfferModal(offer)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3 text-indigo-400" />
                          <span>Edit</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Toggle Status */}
                        <button
                          onClick={() => handleToggleOfferStatus(offer.id)}
                          className={`p-1.5 rounded-lg border text-xs font-mono font-bold cursor-pointer ${
                            raw?.status === 'ACTIVE'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                          title={raw?.status === 'ACTIVE' ? 'Pause Offer' : 'Activate Offer'}
                        >
                          {raw?.status === 'ACTIVE' ? <PauseCircle className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>

                        {/* Delete Offer */}
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 cursor-pointer"
                          title="Delete Offer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: INTERACTIVE MULTI-DEVICE HOMEPAGE SIMULATOR          */}
      {/* ============================================================ */}
      {activeConsoleTab === 'SIMULATOR' && (
        <div className="space-y-6">
          {/* Simulator Cockpit Controls */}
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                Live Multi-Device Public Homepage Wireframe Simulator
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect how live campaigns and discount offers render on Desktop, Tablet, and Mobile viewports in real time.
              </p>
            </div>

            {/* Device Switcher Pills */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  playCyberSound('click');
                  setSimulatorDevice('DESKTOP');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                  simulatorDevice === 'DESKTOP'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop (1200px)</span>
              </button>

              <button
                onClick={() => {
                  playCyberSound('click');
                  setSimulatorDevice('TABLET');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                  simulatorDevice === 'TABLET'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>Tablet (768px)</span>
              </button>

              <button
                onClick={() => {
                  playCyberSound('click');
                  setSimulatorDevice('MOBILE');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                  simulatorDevice === 'MOBILE'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (375px)</span>
              </button>
            </div>
          </div>

          {/* Master Two-Column Simulator Viewport + Slot Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Viewport Render Area (Col 8) */}
            <div className="lg:col-span-8 bg-slate-950 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-center min-h-[550px] overflow-x-auto">
              
              {/* Scaled Device Shell */}
              <div
                className={`transition-all duration-300 w-full space-y-4 ${
                  simulatorDevice === 'DESKTOP'
                    ? 'max-w-4xl'
                    : simulatorDevice === 'TABLET'
                    ? 'max-w-xl'
                    : 'max-w-sm border-4 border-slate-700 rounded-3xl p-3 bg-slate-900 shadow-2xl'
                }`}
              >
                {/* 1. Simulated Top Announcement Bar (Offers Ticker) */}
                <div 
                  onClick={() => {
                    playCyberSound('click');
                    setInspectedSlot('TICKER');
                  }}
                  className={`p-2 rounded-xl text-center cursor-pointer transition-all border ${
                    inspectedSlot === 'TICKER'
                      ? 'ring-2 ring-amber-400 border-amber-400 bg-amber-500/20'
                      : 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-amber-300 flex-wrap">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>⚡ {activeOfferForTicker?.couponCode || 'FESTIVE30'}:</span>
                    <span className="text-slate-200">{activeOfferForTicker?.title || 'Grand Launch 30% Off'}</span>
                    <span className="underline text-amber-400">Claim Code</span>
                  </div>
                </div>

                {/* 2. Simulated Navbar Mock */}
                <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#0a192f] to-[#2563eb] flex items-center justify-center text-white font-black text-xs">
                      Z
                    </div>
                    <span className="font-black text-white text-xs tracking-tight">ZYZU'S Portal</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-slate-400">
                    <span>Find Tutor</span>
                    <span>Libraries</span>
                    <span>Mock Tests</span>
                    <span>Notes</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-cyan-600 text-white text-[10px] font-bold">
                    Login
                  </div>
                </div>

                {/* 3. Simulated Hero Carousel Ad Banner */}
                {currentSimulatedHero && (
                  <div 
                    onClick={() => {
                      playCyberSound('click');
                      setInspectedSlot('HERO');
                    }}
                    className={`relative rounded-3xl overflow-hidden border p-5 sm:p-7 shadow-2xl transition-all cursor-pointer ${
                      inspectedSlot === 'HERO'
                        ? 'ring-2 ring-cyan-400 border-cyan-400'
                        : 'border-slate-800 hover:border-slate-700'
                    } bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white`}
                  >
                    {/* Background Decorative Graphic */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 space-y-3">
                      {/* Advertiser Tag & Promo Offer */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {currentSimulatedHero.advertiserName || 'FocusPoint Academic'}
                        </span>
                        {currentSimulatedHero.promotionalOffer && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {currentSimulatedHero.promotionalOffer}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-black/60 text-slate-400 border border-slate-700">
                          Slot: {currentSimulatedHero.placement}
                        </span>
                      </div>

                      {/* Main Headline & Description */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-8 space-y-2">
                          <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
                            {currentSimulatedHero.headline}
                          </h2>
                          {currentSimulatedHero.subheading && (
                            <p className="text-xs font-bold text-cyan-300">
                              {currentSimulatedHero.subheading}
                            </p>
                          )}
                          <p className="text-xs text-slate-300 line-clamp-3">
                            {currentSimulatedHero.description}
                          </p>

                          {/* CTA Trigger */}
                          <div className="pt-2">
                            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/30 pointer-events-none">
                              <span>{currentSimulatedHero.ctaText || 'Explore Now'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Media Box */}
                        <div className="md:col-span-4 flex justify-center">
                          <img
                            src={currentSimulatedHero.imageUrl || '/assets/images/white_home_tuition_bg.jpg'}
                            alt={currentSimulatedHero.headline}
                            className="w-full max-h-36 object-cover rounded-2xl border border-slate-800 shadow-lg"
                          />
                        </div>
                      </div>

                      {/* Carousel Slide Switcher Arrows */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <div className="flex items-center gap-1">
                          {liveHeroCampaigns.map((_, i) => (
                            <span
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                playCyberSound('click');
                                setSimulatorActiveHeroIndex(i);
                              }}
                              className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${
                                i === (simulatorActiveHeroIndex % (liveHeroCampaigns.length || 1))
                                  ? 'bg-cyan-400 w-5'
                                  : 'bg-slate-700 hover:bg-slate-500'
                              }`}
                            />
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playCyberSound('click');
                              setSimulatorActiveHeroIndex((prev) => (prev > 0 ? prev - 1 : liveHeroCampaigns.length - 1));
                            }}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-[10px] font-mono text-slate-400">
                            Slide {(simulatorActiveHeroIndex % (liveHeroCampaigns.length || 1)) + 1} of {liveHeroCampaigns.length}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playCyberSound('click');
                              setSimulatorActiveHeroIndex((prev) => (prev + 1) % liveHeroCampaigns.length);
                            }}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Simulated Mid-Page Mentorship Banner */}
                <div
                  onClick={() => {
                    playCyberSound('click');
                    setInspectedSlot('MENTORSHIP');
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    inspectedSlot === 'MENTORSHIP'
                      ? 'ring-2 ring-emerald-400 border-emerald-400 bg-emerald-500/10'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                        Secondary Mid-Page Slot: MENTORSHIP_SLOT
                      </span>
                      <h4 className="text-xs font-black text-white">
                        District KYC Verified Tutors & Silent Study Library Hubs
                      </h4>
                    </div>
                    <span className="text-xs text-cyan-400 font-mono font-bold flex items-center gap-1">
                      <span>View Slot Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Slot Inspector Panel (Col 4) */}
            <div className="lg:col-span-4 bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Slot Telemetry Inspector
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {inspectedSlot}
                </span>
              </div>

              {inspectedSlot === 'HERO' && currentSimulatedHero && (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500">Active Campaign</span>
                    <div className="font-black text-white text-sm">{currentSimulatedHero.headline}</div>
                    <div className="text-cyan-400 font-mono text-[11px] mt-0.5">By {currentSimulatedHero.advertiserName}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Priority Weight</span>
                      <div className="text-base font-black text-amber-400 font-mono">{currentSimulatedHero.priority}</div>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Media Format</span>
                      <div className="text-xs font-black text-slate-200 font-mono truncate">{currentSimulatedHero.mediaType}</div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Destination Security</span>
                    <div className="font-mono text-emerald-400 truncate text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{currentSimulatedHero.destinationUrl}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => openEditWizard(currentSimulatedHero)}
                      className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit This Campaign in Studio Wizard</span>
                    </button>
                  </div>
                </div>
              )}

              {inspectedSlot === 'TICKER' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500">Top Announcement Slot</span>
                    <div className="font-black text-amber-300 text-sm">
                      {activeOfferForTicker ? activeOfferForTicker.title : 'No Active Offer'}
                    </div>
                    <div className="font-mono text-slate-300 mt-1">
                      Code: <strong className="text-amber-400">{activeOfferForTicker?.couponCode}</strong>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Evaluation Rule</span>
                    <p className="text-[11px] text-slate-300">
                      OfferService evaluates real-time validity, usage quotas, and geo-locality before injecting into the public announcement ticker.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={openCreateOfferModal}
                      className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Configure New Offer Coupon</span>
                    </button>
                  </div>
                </div>
              )}

              {inspectedSlot === 'MENTORSHIP' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500">Mid-Page Feature Slot</span>
                    <div className="font-black text-white text-sm">Targeted Placement: MENTORSHIP_SLOT</div>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Mid-page carousels automatically match student intent on specific service landing pages (e.g. Find Home Tutor and Find Libraries).
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: PERFORMANCE TELEMETRY & GEO-HEATMAP                  */}
      {/* ============================================================ */}
      {activeConsoleTab === 'ANALYTICS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Service Page Breakdown */}
            <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Service Page Distribution Matrix</span>
              </h3>
              
              <div className="space-y-3">
                {[
                  { page: 'Find Home Tutor', count: campaigns.filter(c => (c.targetPages || []).includes('FIND_TUTOR') || (c.targetPages || []).includes('ALL') || c.targetPage === 'FIND_TUTOR' || c.targetPage === 'ALL').length, color: 'from-cyan-500 to-blue-500' },
                  { page: 'Find Libraries', count: campaigns.filter(c => (c.targetPages || []).includes('FIND_LIBRARY') || (c.targetPages || []).includes('ALL') || c.targetPage === 'FIND_LIBRARY' || c.targetPage === 'ALL').length, color: 'from-emerald-500 to-teal-500' },
                  { page: 'Mock Tests CBT', count: campaigns.filter(c => (c.targetPages || []).includes('MOCK_TESTS') || (c.targetPages || []).includes('ALL') || c.targetPage === 'MOCK_TESTS' || c.targetPage === 'ALL').length, color: 'from-amber-500 to-orange-500' },
                  { page: 'Study Materials', count: campaigns.filter(c => (c.targetPages || []).includes('STUDY_MATERIALS') || (c.targetPages || []).includes('ALL') || c.targetPage === 'STUDY_MATERIALS' || c.targetPage === 'ALL').length, color: 'from-purple-500 to-indigo-500' },
                ].map((item) => (
                  <div key={item.page} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-slate-300">
                      <span>{item.page}</span>
                      <span className="font-bold text-cyan-300">{item.count} Active Campaigns</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(100, (item.count / (campaigns.length || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Advertiser Companies & Partners Breakdown */}
            <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Advertiser & Partner Leadership</span>
              </h3>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {Array.from(new Set(campaigns.map(c => c.advertiserName || 'FocusPoint'))).map(company => {
                  const companyAds = campaigns.filter(c => (c.advertiserName || 'FocusPoint') === company);
                  const impressions = companyAds.reduce((acc, c) => acc + (c.impressions || 0), 0);
                  const clicks = companyAds.reduce((acc, c) => acc + (c.clicks || 0), 0);
                  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : '0.0';

                  return (
                    <div key={company} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
                      <div>
                        <div className="font-bold text-xs text-white">{company}</div>
                        <div className="text-[10px] font-mono text-slate-400">{companyAds.length} campaigns configured</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-black text-xs text-cyan-400">{impressions.toLocaleString()} views</div>
                        <div className="text-[10px] font-mono text-amber-300">{clicks} clicks • {ctr}% CTR</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. GUIDED 6-STEP FUTURISTIC AD CREATION / EDIT WIZARD MODAL  */}
      {/* ============================================================ */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden my-6">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase text-cyan-400 mb-1">
                  <Megaphone className="w-4 h-4" />
                  <span>Step {currentStep} of 6 — Cyber-HUD Advertisement Wizard</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {editingCampaign ? 'Edit Advertisement Campaign' : 'Deploy New Advertisement Campaign'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  playCyberSound('click');
                  setWizardOpen(false);
                }}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Indicators Bar */}
            <div className="grid grid-cols-6 border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono font-bold text-center">
              {[
                { step: 1, label: '1. Basic Info' },
                { step: 2, label: '2. Media Format' },
                { step: 3, label: '3. Media Assets' },
                { step: 4, label: '4. Copy & CTA' },
                { step: 5, label: '5. Placement' },
                { step: 6, label: '6. Priority' },
              ].map((s) => (
                <div
                  key={s.step}
                  onClick={() => {
                    playCyberSound('click');
                    setCurrentStep(s.step);
                  }}
                  className={`py-3 px-1 cursor-pointer transition-colors border-r border-slate-800 last:border-r-0 ${
                    currentStep === s.step
                      ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-b-cyan-500 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.step}</span>
                </div>
              ))}
            </div>

            {/* Modal Body: Split-View (Form on Left, Keystroke Live Preview on Right) */}
            <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[70vh] overflow-y-auto">
              
              {/* Form Input Area (Col 7) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* STEP 1: BASIC INFORMATION */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Campaign Identification & Entity</span>
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                          Campaign Internal Display Name *
                        </label>
                        <input
                          type="text"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="e.g. UP Police 300M Mock Blitz Campaign"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                            Advertiser / Company Name *
                          </label>
                          <input
                            type="text"
                            value={formAdvertiserName}
                            onChange={(e) => setFormAdvertiserName(e.target.value)}
                            placeholder="e.g. FocusPoint / Kota EduPrep"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                            Campaign Group
                          </label>
                          <input
                            type="text"
                            value={formCampaignName}
                            onChange={(e) => setFormCampaignName(e.target.value)}
                            placeholder="e.g. State Examination 2026"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                          Internal Operator Notes
                        </label>
                        <input
                          type="text"
                          value={formInternalNotes}
                          onChange={(e) => setFormInternalNotes(e.target.value)}
                          placeholder="e.g. Verified by Operator Sunita Verma for pan-India students"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: MEDIA FORMAT */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-cyan-400" />
                      <span>Select Media & Presentation Format</span>
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { type: 'RICH_AD', label: 'Rich Interactive Ad', desc: 'Graphic banner with badges and direct CTA button' },
                        { type: 'IMAGE_TEXT', label: 'Image + Copy', desc: 'Split layout with high-res photography' },
                        { type: 'VIDEO_TEXT', label: 'Video Stream', desc: 'Embedded promotional video clip with text' },
                        { type: 'IMAGE_ONLY', label: 'Image Banner', desc: 'Full-bleed visual banner graphic' },
                        { type: 'TEXT_ONLY', label: 'High-Impact Copy', desc: 'Minimalist high-contrast typography banner' },
                        { type: 'VIDEO_ONLY', label: 'Full Video Reel', desc: 'Full width responsive video ad player' }
                      ].map((item) => (
                        <div
                          key={item.type}
                          onClick={() => {
                            playCyberSound('click');
                            setFormMediaType(item.type as AdMediaType);
                          }}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            formMediaType === item.type
                              ? 'bg-cyan-500/15 border-cyan-400 ring-1 ring-cyan-400'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="font-mono font-bold text-xs text-white mb-1">{item.label}</div>
                          <div className="text-[10px] text-slate-400">{item.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3: MEDIA & ASSETS */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                      <Upload className="w-4 h-4 text-cyan-400" />
                      <span>Upload Media or Select High-Res Preset</span>
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                          Media Image URL / Asset Path
                        </label>
                        <input
                          type="text"
                          value={formImageUrl}
                          onChange={(e) => setFormImageUrl(e.target.value)}
                          placeholder="/assets/images/white_home_tuition_bg.jpg"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      {/* Quick Image Presets */}
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400">Quick High-Res Presets:</span>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              playCyberSound('click');
                              setFormImageUrl('/assets/images/white_home_tuition_bg.jpg');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500 text-[10px] font-mono text-slate-300 cursor-pointer"
                          >
                            Home Tuition Visual
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playCyberSound('click');
                              setFormImageUrl('/assets/images/study_library_bg.jpg');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500 text-[10px] font-mono text-slate-300 cursor-pointer"
                          >
                            Study Library Visual
                          </button>
                        </div>
                      </div>

                      {/* File Upload Simulator */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-dashed border-slate-700 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                          <span>Upload Local Media (Images up to 15MB, Video to 50MB)</span>
                          <Upload className="w-4 h-4 text-cyan-400" />
                        </div>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) => handleFileUpload(e, formMediaType.includes('VIDEO') ? 'VIDEO' : 'IMAGE')}
                          className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-mono file:bg-cyan-600 file:text-white cursor-pointer"
                        />
                        {uploadProgress !== null && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono text-cyan-400">
                              <span>Uploading {uploadedFileName}...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: AD COPY & CTA */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                      <Tag className="w-4 h-4 text-cyan-400" />
                      <span>Call-to-Action & Promotional Copy</span>
                    </h3>

                    {/* Hindi/Devanagari Quick Presets */}
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block mb-1">
                        Devanagari / Hindi Quick Inserts:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {['१००% सत्यापित शिक्षक', 'निःशुल्क डेमो क्लास', 'सिट रिज़र्वेशन चालू', 'सभी विषयों की तैयारी'].map((txt) => (
                          <button
                            key={txt}
                            type="button"
                            onClick={() => {
                              playCyberSound('click');
                              setFormSubheading(txt);
                            }}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 hover:border-amber-400 text-[10px] text-slate-300 cursor-pointer"
                          >
                            + {txt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                          Main Headline *
                        </label>
                        <input
                          type="text"
                          value={formHeadline}
                          onChange={(e) => setFormHeadline(e.target.value)}
                          placeholder="e.g. Master UP Police 2026 Examination with Real Computerized CBT"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                          Subheading
                        </label>
                        <input
                          type="text"
                          value={formSubheading}
                          onChange={(e) => setFormSubheading(e.target.value)}
                          placeholder="e.g. Free All-UP Rank & Personal Mistake Book Tracking"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                          Detailed Description
                        </label>
                        <textarea
                          rows={2}
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          placeholder="e.g. Solve full-length computerized tests modeled strictly on official UPPRPB patterns..."
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                            CTA Button Text *
                          </label>
                          <input
                            type="text"
                            value={formCtaText}
                            onChange={(e) => setFormCtaText(e.target.value)}
                            placeholder="e.g. Attempt Mock Test"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                            Destination Link *
                          </label>
                          <input
                            type="text"
                            value={formDestinationUrl}
                            onChange={(e) => setFormDestinationUrl(e.target.value)}
                            placeholder="/mock-tests"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                            Badge Text
                          </label>
                          <input
                            type="text"
                            value={formBadgeText}
                            onChange={(e) => setFormBadgeText(e.target.value)}
                            placeholder="e.g. Official Simulation"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                            Promotional Offer Pill
                          </label>
                          <input
                            type="text"
                            value={formPromotionalOffer}
                            onChange={(e) => setFormPromotionalOffer(e.target.value)}
                            placeholder="e.g. 100% Free Demo"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: PLACEMENT & TARGETING */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                      <Compass className="w-4 h-4 text-cyan-400" />
                      <span>Page Placement & Geo-Targeting Rules</span>
                    </h3>

                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                            Target Service Page
                          </label>
                          <select
                            value={formTargetPage}
                            onChange={(e) => setFormTargetPage(e.target.value as AdTargetPage)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="ALL">All Portal Pages (Global)</option>
                            <option value="FIND_TUTOR">Find Home Tutor</option>
                            <option value="FIND_LIBRARY">Find Libraries</option>
                            <option value="MOCK_TESTS">Mock Tests</option>
                            <option value="STUDY_MATERIALS">Study Materials</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                            Slot Allocation
                          </label>
                          <select
                            value={formPlacement}
                            onChange={(e) => setFormPlacement(e.target.value as AdPlacement)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="SERVICE_CAROUSEL">Service Carousel (Hero Banner)</option>
                            <option value="FIND_TUTOR_HERO">Find Tutor Hero Slot</option>
                            <option value="FIND_LIBRARY_HERO">Find Library Hero Slot</option>
                            <option value="MOCK_TEST_HERO">Mock Test Hero Slot</option>
                            <option value="STUDY_MATERIAL_HERO">Study Material Hero Slot</option>
                            <option value="MENTORSHIP_SLOT">Mentorship Mid-Banner</option>
                            <option value="QUIET_HUBS_SLOT">Quiet Hubs Mid-Banner</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                            Target State (Optional)
                          </label>
                          <select
                            value={formTargetStateId}
                            onChange={(e) => {
                              setFormTargetStateId(e.target.value);
                              setFormTargetDistrictId('');
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="">Pan-India (All States)</option>
                            {states.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                            Target District (Optional)
                          </label>
                          <select
                            value={formTargetDistrictId}
                            disabled={!formTargetStateId}
                            onChange={(e) => setFormTargetDistrictId(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-cyan-500 disabled:opacity-40"
                          >
                            <option value="">All State Districts</option>
                            {districts.map((d) => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6: PRIORITY & SCHEDULING */}
                {currentStep === 6 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span>Scheduling & Rotation Priority Weight</span>
                    </h3>

                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                            Broadcast Start Date
                          </label>
                          <input
                            type="date"
                            value={formStartDate}
                            onChange={(e) => setFormStartDate(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                            Expiration End Date
                          </label>
                          <input
                            type="date"
                            value={formEndDate}
                            onChange={(e) => setFormEndDate(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>

                      {/* Priority Slider */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-300">Rotation Priority Weight (1 - 100)</span>
                          <span className="font-black text-amber-400 text-sm">{formPriority}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={formPriority}
                          onChange={(e) => setFormPriority(Number(e.target.value))}
                          className="w-full accent-cyan-500 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-400 font-mono">
                          Higher priority campaigns are displayed first and receive more slide rotations in public hero carousels.
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                          Publication Status
                        </label>
                        <select
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as AdStatus)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="LIVE">LIVE (Broadcast immediately)</option>
                          <option value="PAUSED">PAUSED (Hold in reserve)</option>
                          <option value="DRAFT">DRAFT (Operator review)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Keystroke Live Preview Panel (Col 5) */}
              <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 uppercase font-bold border-b border-slate-800 pb-2 mb-3">
                    <span>Keystroke Live Card Preview</span>
                    <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  </div>

                  {/* Rendered Live Preview Card */}
                  <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-indigo-950 p-4 text-white shadow-xl space-y-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {formAdvertiserName || 'FocusPoint'}
                      </span>
                      {formPromotionalOffer && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {formPromotionalOffer}
                        </span>
                      )}
                      <span className="text-[9px] font-mono text-amber-400 ml-auto">
                        P-{formPriority}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-white line-clamp-2 leading-tight">
                      {formHeadline || 'Headline will appear here as you type...'}
                    </h4>

                    {formSubheading && (
                      <p className="text-[11px] font-bold text-cyan-300 line-clamp-1">
                        {formSubheading}
                      </p>
                    )}

                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      {formDescription || 'Detailed educational campaign description will preview here live.'}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="px-3 py-1.5 rounded-xl bg-cyan-600 text-white font-extrabold text-[10px] inline-flex items-center gap-1 shadow-md">
                        <span>{formCtaText || 'Explore Now'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>

                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                        <img 
                          src={formImageUrl || '/assets/images/white_home_tuition_bg.jpg'} 
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 border-t border-slate-800 pt-2 flex items-center justify-between">
                  <span>Destination: {formDestinationUrl || '/'}</span>
                  <span>Pages: {formTargetPage}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                disabled={currentStep === 1}
                onClick={() => {
                  playCyberSound('click');
                  setCurrentStep((prev) => Math.max(1, prev - 1));
                }}
                className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-300 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>

              <div className="flex items-center gap-2">
                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={() => {
                      playCyberSound('click');
                      setCurrentStep((prev) => Math.min(6, prev + 1));
                    }}
                    className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-600/30"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveCampaign}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs cursor-pointer shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingCampaign ? 'Save Campaign Changes' : 'Broadcast Advertisement Campaign'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. DEDICATED LIVE OFFER / COUPON CREATION MODAL             */}
      {/* ============================================================ */}
      {offerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden my-6">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-400 mb-1">
                  <Ticket className="w-4 h-4" />
                  <span>Homepage Promotional Offer & Coupon Studio</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {editingOffer ? 'Edit Promotional Coupon' : 'Launch New Promotional Coupon'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  playCyberSound('click');
                  setOfferModalOpen(false);
                }}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-7 space-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* Code + Quick Generator */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                    Coupon Code (Voucher Key) *
                  </label>
                  <input
                    type="text"
                    value={offerFormCode}
                    onChange={(e) => setOfferFormCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SAIDPUR30"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500 uppercase tracking-wider"
                  />
                </div>

                <div className="sm:col-span-4">
                  <button
                    type="button"
                    onClick={() => {
                      playCyberSound('click');
                      setOfferFormCode(`FOCUS${Math.floor(100 + Math.random() * 900)}`);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold cursor-pointer"
                  >
                    🎲 Random Code
                  </button>
                </div>
              </div>

              {/* Offer Title */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                  Offer Name / Campaign Title *
                </label>
                <input
                  type="text"
                  value={offerFormName}
                  onChange={(e) => setOfferFormName(e.target.value)}
                  placeholder="e.g. Saidpur Grand Launch 30% OFF"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Service & Scope */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                    Applicable Service
                  </label>
                  <select
                    value={offerFormService}
                    onChange={(e) => setOfferFormService(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ALL">All FocusPoint Services</option>
                    <option value="HOME_TUITION">Home Tuition</option>
                    <option value="SELF_STUDY_LIBRARY">Self Study Library</option>
                    <option value="MOCK_TEST">Mock Tests CBT</option>
                    <option value="STUDY_MATERIAL">Study Materials</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                    Target Scope
                  </label>
                  <select
                    value={offerFormScope}
                    onChange={(e) => setOfferFormScope(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="PAN_INDIA">Pan-India Broad</option>
                    <option value="STATE">State Level</option>
                    <option value="DISTRICT">District Specific</option>
                    <option value="LOCALITY">Locality Specific</option>
                  </select>
                </div>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                    Discount Structure
                  </label>
                  <select
                    value={offerFormDiscountType}
                    onChange={(e) => setOfferFormDiscountType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Currency Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                    Discount Amount ({offerFormDiscountType === 'PERCENTAGE' ? '%' : '₹'})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={offerFormDiscountType === 'PERCENTAGE' ? 100 : 50000}
                    value={offerFormDiscountValue}
                    onChange={(e) => setOfferFormDiscountValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Dates & Usage Quota */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={offerFormStartDate}
                    onChange={(e) => setOfferFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={offerFormEndDate}
                    onChange={(e) => setOfferFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                    Redemption Limit
                  </label>
                  <input
                    type="number"
                    value={offerFormUsageLimit}
                    onChange={(e) => setOfferFormUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                  Terms and Conditions (One Per Line)
                </label>
                <textarea
                  rows={2}
                  value={offerFormTerms}
                  onChange={(e) => setOfferFormTerms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setOfferModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveOffer}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs cursor-pointer shadow-lg shadow-amber-600/30 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingOffer ? 'Save Offer Changes' : 'Publish Coupon Offer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
