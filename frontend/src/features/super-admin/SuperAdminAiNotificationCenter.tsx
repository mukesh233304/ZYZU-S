// FOCUSPOINT Super Admin AI Notification & Personalization Command Center
// Comprehensive 17-pillar executive cockpit for intelligent service search detection, offer matching, WhatsApp automation & conversion analytics

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, Sparkles, Bell, Smartphone, Send, Radio, 
  Search, Filter, ShieldCheck, CheckCircle2, AlertTriangle, 
  RotateCcw, RefreshCw, ArrowUpRight, TrendingUp, Users, 
  MapPin, Clock, Moon, Layers, Tag, FileText, Check, 
  Play, Pause, Sliders, ExternalLink, Zap, Eye, Copy, 
  BarChart3, Activity, Compass, Database, ShieldAlert,
  ChevronRight, ArrowRight, BookMarked, GraduationCap,
  Building2, BookOpen, Trash2, Settings, Target, HelpCircle,
  Percent, DollarSign, Calendar, ThumbsUp, XCircle, Info
} from 'lucide-react';
import { aiNotificationAgentService } from '../../services/aiNotificationAgentService';
import { whatsappNotificationService, WhatsAppQueueItem } from '../../services/whatsappNotificationService';
import { inAppNotificationService, RichInAppNotification } from '../../services/inAppNotificationService';
import { notificationPreferenceService } from '../../services/notificationPreferenceService';
import { locationService } from '../../services/locationService';
import { useToast } from '../../context/ToastContext';
import { 
  AiNotificationAgentConfig, 
  AiNotificationMetricsSummary, 
  OfferRecommendationItem, 
  UserSearchActivityEvent, 
  AiAutomationAuditRecord,
  AiNotificationServiceCategory,
  NotificationChannel
} from '../../types/aiNotification';

type CommandCenterTab = 
  | 'OVERVIEW' 
  | 'SEARCH_INTELLIGENCE' 
  | 'RECOMMENDATIONS' 
  | 'WHATSAPP_QUEUE' 
  | 'IN_APP_QUEUE' 
  | 'CAMPAIGNS' 
  | 'SEGMENTATION' 
  | 'ELIGIBILITY_RULES' 
  | 'AUTOMATION_RULES' 
  | 'TEMPLATES' 
  | 'SCHEDULING' 
  | 'RETRY_QUEUE' 
  | 'FREQUENCY_CONSENT' 
  | 'CONVERSIONS' 
  | 'AI_ANALYTICS' 
  | 'AUDIT_TRAIL' 
  | 'SIMULATOR';

interface LocationCampaignItem {
  id: string;
  name: string;
  targetScope: 'LOCALITY' | 'DISTRICT' | 'PAN_INDIA';
  stateName: string;
  districtName: string;
  localityName?: string;
  serviceType: AiNotificationServiceCategory;
  offerCode: string;
  discountSummary: string;
  status: 'ACTIVE' | 'PAUSED';
  impressions: number;
  clicks: number;
  conversions: number;
  gmv: number;
}

interface AudienceSegmentItem {
  id: string;
  name: string;
  description: string;
  targetRole: string;
  serviceFocus: AiNotificationServiceCategory;
  userCount: number;
  optInRate: number;
  avgCtr: number;
  recentActivity: string;
}

export const SuperAdminAiNotificationCenter: React.FC = () => {
  const { showToast } = useToast();

  // Primary State
  const [activeTab, setActiveTab] = useState<CommandCenterTab>('OVERVIEW');
  const [config, setConfig] = useState<AiNotificationAgentConfig>(() => aiNotificationAgentService.getConfig());
  const [metrics, setMetrics] = useState<AiNotificationMetricsSummary>(() => aiNotificationAgentService.getMetricsSummary());
  const [recommendations, setRecommendations] = useState<OfferRecommendationItem[]>(() => aiNotificationAgentService.getRecommendations());
  const [recentEvents, setRecentEvents] = useState<UserSearchActivityEvent[]>(() => aiNotificationAgentService.getRecentEvents());
  const [whatsappQueue, setWhatsappQueue] = useState<WhatsAppQueueItem[]>(() => whatsappNotificationService.getQueue());
  const [inAppQueue, setInAppQueue] = useState<RichInAppNotification[]>(() => inAppNotificationService.getNotifications());
  const [auditLogs, setAuditLogs] = useState<AiAutomationAuditRecord[]>(() => aiNotificationAgentService.getAuditLogs());

  // Filters
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [inAppCategoryFilter, setInAppCategoryFilter] = useState<string>('ALL');
  const [retryQueueFilter, setRetryQueueFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Automation Rules Editable State
  const [ruleConfidence, setRuleConfidence] = useState(50);
  const [ruleCooldown, setRuleCooldown] = useState(10);
  const [ruleOrganicFallback, setRuleOrganicFallback] = useState(true);
  const [ruleEscalateWa, setRuleEscalateWa] = useState(true);

  // Scheduling State
  const [quietStart, setQuietStart] = useState('21:00');
  const [quietEnd, setQuietEnd] = useState('09:00');
  const [timezone] = useState('Asia/Kolkata (IST)');

  // Simulator Test Lab State
  const [simService, setSimService] = useState<AiNotificationServiceCategory>('LIBRARY');
  const [simDistrict, setSimDistrict] = useState('Ghazipur');
  const [simLocality, setSimLocality] = useState('Saidpur');
  const [simSubject, setSimSubject] = useState('Mathematics');
  const [simQuery, setSimQuery] = useState('library desk');
  const [simUserName, setSimUserName] = useState('Amit Verma');
  const [simPhone, setSimPhone] = useState('9450001234');
  const [simResult, setSimResult] = useState<OfferRecommendationItem | null>(null);
  const [simConsent, setSimConsent] = useState(true);
  const [simChatThread, setSimChatThread] = useState<Array<{
    id: string;
    sender: 'BOT' | 'USER';
    text: string;
    time: string;
    deepLink?: string;
    ctaLabel?: string;
  }>>([]);

  // Location Campaigns Data
  const [campaigns, setCampaigns] = useState<LocationCampaignItem[]>([
    {
      id: 'camp-saidpur-lib',
      name: 'Saidpur Digital Library 30% Booster',
      targetScope: 'LOCALITY',
      stateName: 'Uttar Pradesh',
      districtName: 'Ghazipur',
      localityName: 'Saidpur',
      serviceType: 'LIBRARY',
      offerCode: 'FOCUS30',
      discountSummary: '30% OFF Library Desk Pass',
      status: 'ACTIVE',
      impressions: 480,
      clicks: 194,
      conversions: 82,
      gmv: 57400
    },
    {
      id: 'camp-saidpur-tutor',
      name: 'Saidpur Math & Science Home Tutor Package',
      targetScope: 'LOCALITY',
      stateName: 'Uttar Pradesh',
      districtName: 'Ghazipur',
      localityName: 'Saidpur',
      serviceType: 'HOME_TUITION',
      offerCode: 'SAIDPUR500',
      discountSummary: 'Flat ₹500 OFF Tuition Packages',
      status: 'ACTIVE',
      impressions: 340,
      clicks: 142,
      conversions: 64,
      gmv: 96000
    },
    {
      id: 'camp-gzp-general',
      name: 'Ghazipur District Library Membership Drive',
      targetScope: 'DISTRICT',
      stateName: 'Uttar Pradesh',
      districtName: 'Ghazipur',
      serviceType: 'LIBRARY',
      offerCode: 'GZP20',
      discountSummary: '20% OFF District Libraries',
      status: 'ACTIVE',
      impressions: 610,
      clicks: 215,
      conversions: 78,
      gmv: 46800
    },
    {
      id: 'camp-upsssc-mock',
      name: 'UPSSSC PET & State Exam Mock Sprint',
      targetScope: 'PAN_INDIA',
      stateName: 'All States',
      districtName: 'Pan-India',
      serviceType: 'MOCK_TEST',
      offerCode: 'GOVEXAM25',
      discountSummary: '25% OFF Annual Test Series',
      status: 'ACTIVE',
      impressions: 890,
      clicks: 340,
      conversions: 145,
      gmv: 72500
    },
    {
      id: 'camp-teacher-onboard',
      name: 'Verified Educator Zero Onboarding Fee',
      targetScope: 'PAN_INDIA',
      stateName: 'All States',
      districtName: 'Pan-India',
      serviceType: 'TEACHER_APPLICATION',
      offerCode: 'TEACHERFREE',
      discountSummary: '100% Waiver on Application Fee',
      status: 'ACTIVE',
      impressions: 290,
      clicks: 110,
      conversions: 52,
      gmv: 26000
    }
  ]);

  // Audience Segments Data
  const audienceSegments: AudienceSegmentItem[] = [
    {
      id: 'seg-lib-aspirants',
      name: 'Ghazipur & Saidpur Library Seekers',
      description: 'Students searching for air-conditioned study spaces, high-speed WiFi and calm desk slots',
      targetRole: 'STUDENT',
      serviceFocus: 'LIBRARY',
      userCount: 1420,
      optInRate: 84.5,
      avgCtr: 40.4,
      recentActivity: '88 searches past 24 hrs'
    },
    {
      id: 'seg-tuition-parents',
      name: 'Secondary School Parents (Class 8-12)',
      description: 'Parents looking for verified home tutors for CBSE/UP Board Maths, Physics and Chemistry',
      targetRole: 'PARENT',
      serviceFocus: 'HOME_TUITION',
      userCount: 890,
      optInRate: 78.2,
      avgCtr: 41.7,
      recentActivity: '42 tutor inquiries past 24 hrs'
    },
    {
      id: 'seg-gov-aspirants',
      name: 'Govt Job & Competitive Exam Aspirants',
      description: 'Candidates preparing for UPSSSC PET, Police Constable, Railway NTPC and SSC CGL',
      targetRole: 'STUDENT',
      serviceFocus: 'MOCK_TEST',
      userCount: 2640,
      optInRate: 91.0,
      avgCtr: 38.2,
      recentActivity: '175 test mock attempts'
    },
    {
      id: 'seg-prospective-teachers',
      name: 'Teacher Applicants in Review',
      description: 'Educators who initiated or submitted home tuition onboarding profiles',
      targetRole: 'TEACHER_CANDIDATE',
      serviceFocus: 'TEACHER_APPLICATION',
      userCount: 310,
      optInRate: 94.2,
      avgCtr: 47.3,
      recentActivity: '18 new applications submitted'
    },
    {
      id: 'seg-lib-owners',
      name: 'Digital Library Operators & Space Owners',
      description: 'Commercial library owners seeking listing verification and seat occupancy growth',
      targetRole: 'LIBRARY_OWNER',
      serviceFocus: 'LIBRARY_LISTING',
      userCount: 95,
      optInRate: 96.8,
      avgCtr: 54.7,
      recentActivity: '7 listing updates pending'
    }
  ];

  // Subscribe to live agent updates
  useEffect(() => {
    const unsubAgent = aiNotificationAgentService.subscribe(() => {
      setConfig(aiNotificationAgentService.getConfig());
      setMetrics(aiNotificationAgentService.getMetricsSummary());
      setRecommendations(aiNotificationAgentService.getRecommendations());
      setRecentEvents(aiNotificationAgentService.getRecentEvents());
      setAuditLogs(aiNotificationAgentService.getAuditLogs());
    });

    const unsubWa = whatsappNotificationService.subscribe((q) => {
      setWhatsappQueue(q);
    });

    const unsubInApp = inAppNotificationService.subscribe((list) => {
      setInAppQueue(list);
    });

    return () => {
      unsubAgent();
      unsubWa();
      unsubInApp();
    };
  }, []);

  const handleToggleGlobalAi = () => {
    const next = !config.globalAiEnabled;
    const updated = aiNotificationAgentService.updateConfig({ globalAiEnabled: next });
    setConfig(updated);
    showToast(`Global AI Notifications ${next ? 'ACTIVATED' : 'PAUSED'}`, next ? 'success' : 'info');
  };

  const handleToggleChannel = (channel: 'inApp' | 'whatsapp') => {
    const next = !config.channelsEnabled[channel];
    const updated = aiNotificationAgentService.updateConfig({
      channelsEnabled: {
        ...config.channelsEnabled,
        [channel]: next
      }
    });
    setConfig(updated);
    showToast(`${channel === 'inApp' ? 'In-App' : 'WhatsApp'} channel ${next ? 'ENABLED' : 'PAUSED'}`, 'info');
  };

  const handleToggleService = (service: AiNotificationServiceCategory) => {
    const next = !config.servicesEnabled[service];
    const updated = aiNotificationAgentService.updateConfig({
      servicesEnabled: {
        ...config.servicesEnabled,
        [service]: next
      }
    });
    setConfig(updated);
    showToast(`${service.replace('_', ' ')} AI automation ${next ? 'ENABLED' : 'PAUSED'}`, 'info');
  };

  const handleRetryFailedWhatsApp = (id: string) => {
    const ok = whatsappNotificationService.retryFailedItem(id);
    if (ok) {
      showToast('Notification queued for immediate gateway retry', 'success');
      aiNotificationAgentService.logAudit({
        action: 'RETRY_WHATSAPP_QUEUE',
        adminName: 'Super Admin',
        adminRole: 'SUPER_ADMIN',
        category: 'RETRY_QUEUE',
        details: `Manually initiated retry for WhatsApp queue item ${id}`
      });
    }
  };

  const handleRetryAllEligible = () => {
    const failedItems = whatsappQueue.filter(w => w.status === 'FAILED');
    failedItems.forEach(item => whatsappNotificationService.retryFailedItem(item.id));
    showToast(`Triggered retry for ${failedItems.length} failed messages`, 'success');
  };

  const handleToggleCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const nextStatus = c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        showToast(`Campaign "${c.name}" ${nextStatus}`, 'info');
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleSaveAutomationRules = () => {
    aiNotificationAgentService.logAudit({
      action: 'UPDATE_AUTOMATION_RULES',
      adminName: 'Super Admin',
      adminRole: 'SUPER_ADMIN',
      category: 'RULE_UPDATE',
      details: `Updated confidence threshold: ${ruleConfidence}%, cooldown: ${ruleCooldown}m, organic fallback: ${ruleOrganicFallback}`
    });
    showToast('AI Automation & Deduplication rules updated successfully', 'success');
  };

  const handleSaveQuietHours = () => {
    aiNotificationAgentService.logAudit({
      action: 'UPDATE_SCHEDULING_POLICY',
      adminName: 'Super Admin',
      adminRole: 'SUPER_ADMIN',
      category: 'CONFIG_CHANGE',
      details: `Configured quiet hours window: ${quietStart} to ${quietEnd} IST`
    });
    showToast('Delivery scheduling and quiet hours saved', 'success');
  };

  const handleRunSimulator = () => {
    const testEvent: UserSearchActivityEvent = {
      eventId: `sim-${Date.now()}`,
      eventType: simService === 'LIBRARY' ? 'LIBRARY_SEARCHED' : 'HOME_TUTOR_SEARCHED',
      userId: `user-sim-${Date.now().toString(36)}`,
      userName: simUserName,
      userPhone: simPhone,
      userRole: 'STUDENT',
      serviceType: simService,
      location: {
        districtName: simDistrict,
        localityName: simLocality,
        stateName: 'Uttar Pradesh'
      },
      query: simQuery,
      filters: {
        subject: simSubject,
        classLevel: 'Class 10'
      },
      timestamp: new Date().toISOString()
    };

    const res = aiNotificationAgentService.testSimulateRecommendation(testEvent);
    setSimResult(res);

    // Build realistic formatted WhatsApp preview message
    const serviceNameDisplay = simService === 'LIBRARY' 
      ? 'a peaceful digital study library' 
      : (simService === 'HOME_TUITION' ? 'an accredited home tutor' : 'an academic preparation package');

    const formattedBody = `Hi ${simUserName || 'Student'}! 👋\n\nLooking for ${serviceNameDisplay} near ${simLocality || simDistrict}?\n\nFocusPoint matched an eligible verified recommendation: *${res?.offerTitle || 'FocusPoint Academic Recommendation'}* (${res?.discountDisplay || 'Exclusive Access'}).\n\nExplore now: https://focuspoint.app${res?.deepLink || ''}\n\nReply STOP to opt out of promotional WhatsApp messages.`;

    const ctaLabel = simService === 'LIBRARY' ? 'Explore Libraries' : (simService === 'HOME_TUITION' ? 'Find Home Tutor' : 'Explore Service');

    setSimChatThread([
      {
        id: `msg-${Date.now()}`,
        sender: 'BOT',
        text: formattedBody,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        deepLink: res?.deepLink,
        ctaLabel
      }
    ]);

    showToast('Simulation evaluated against real offer rules', 'info');
  };

  const handleSimulateInboundKeyword = (keyword: 'STOP' | 'START' | 'HELP') => {
    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'USER' as const,
      text: keyword,
      time: userTime
    };

    let botReply = '';
    if (keyword === 'STOP') {
      notificationPreferenceService.updatePreferences(simPhone, { whatsappPromotionalConsent: false });
      setSimConsent(false);
      botReply = 'FocusPoint: You have unsubscribed from promotional messages. Transactional and attendance alerts remain active. Reply START at any time to opt back in.';
      aiNotificationAgentService.logAudit({
        action: 'WHATSAPP_OPT_OUT',
        adminName: simUserName || 'User',
        adminRole: 'STUDENT',
        category: 'OPT_OUT',
        details: `User (${simPhone}) simulated STOP opt-out in Super Admin Simulator Lab`
      });
      showToast(`Promotional consent revoked for ${simPhone}`, 'warning');
    } else if (keyword === 'START') {
      notificationPreferenceService.updatePreferences(simPhone, { whatsappPromotionalConsent: true });
      setSimConsent(true);
      botReply = 'FocusPoint: Welcome back! You are now subscribed to personalized education offers, test series discounts, and digital library recommendations. Reply STOP to opt out.';
      aiNotificationAgentService.logAudit({
        action: 'WHATSAPP_OPT_IN',
        adminName: simUserName || 'User',
        adminRole: 'STUDENT',
        category: 'CONFIG_CHANGE',
        details: `User (${simPhone}) simulated START opt-in in Super Admin Simulator Lab`
      });
      showToast(`Promotional consent restored for ${simPhone}`, 'success');
    } else if (keyword === 'HELP') {
      botReply = 'FocusPoint Help: For support, contact +91 9196434387 or visit https://focuspoint.app. To unsubscribe from offers, reply STOP.';
      showToast('Auto-help guidance sent', 'info');
    }

    const botMsg = {
      id: `bot-${Date.now() + 1}`,
      sender: 'BOT' as const,
      text: botReply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSimChatThread(prev => [...prev, userMsg, botMsg]);
    setAuditLogs(aiNotificationAgentService.getAuditLogs());
  };

  const handleSendToLiveWhatsAppQueue = async () => {
    if (!simResult) return;
    const matchingTemplate = config.templates.find(t => t.serviceType === simService && t.isApproved);
    const res = await whatsappNotificationService.queueOfferRecommendation(simResult, matchingTemplate);
    if (res.success) {
      showToast('Successfully queued into WhatsApp delivery ledger!', 'success');
      setWhatsappQueue(whatsappNotificationService.getQueue());
      setAuditLogs(aiNotificationAgentService.getAuditLogs());
    } else {
      showToast(`WhatsApp queue skipped/suppressed: ${res.reason}`, 'warning');
    }
  };

  const handleTriggerInAppTest = () => {
    if (!simResult) return;
    inAppNotificationService.dispatchRecommendation(simResult);
    setInAppQueue(inAppNotificationService.getNotifications());
    setAuditLogs(aiNotificationAgentService.getAuditLogs());
    showToast('In-App Notification created! Check the top bell icon.', 'success');
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(`https://focuspoint.app${link}`);
    setCopiedLink(link);
    showToast('Deep link copied to clipboard', 'success');
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const isCurrentTimeQuiet = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = quietStart.split(':').map(Number);
    const [endH, endM] = quietEnd.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    if (startMins > endMins) {
      return currentMinutes >= startMins || currentMinutes < endMins;
    }
    return currentMinutes >= startMins && currentMinutes < endMins;
  }, [quietStart, quietEnd]);

  // Filtered in-app queue
  const filteredInApp = useMemo(() => {
    return inAppQueue.filter(item => {
      if (inAppCategoryFilter !== 'ALL' && item.serviceCategory !== inAppCategoryFilter) return false;
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && !item.message.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [inAppQueue, inAppCategoryFilter, searchQuery]);

  // Filtered retry queue
  const filteredRetryQueue = useMemo(() => {
    return whatsappQueue.filter(item => {
      if (retryQueueFilter === 'ALL') return item.status === 'FAILED' || item.status === 'SUPPRESSED';
      return item.status === retryQueueFilter;
    });
  }, [whatsappQueue, retryQueueFilter]);

  return (
    <div className="space-y-6">
      {/* ==================================================================== */}
      {/* 1. TOP HEADER & EMERGENCY GLOBAL CONTROL BAR                         */}
      {/* ==================================================================== */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-gradient-to-r from-brand-500/20 to-purple-500/20 text-brand-300 border border-brand-500/40 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-spin" style={{ animationDuration: '6s' }} />
                FocusPoint Neural Personalization Core v2.4
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                config.globalAiEnabled 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config.globalAiEnabled ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
                {config.globalAiEnabled ? 'ENGINE ACTIVE & LISTENING' : 'GLOBAL AUTOMATION PAUSED'}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Bot className="w-8 h-8 text-brand-400" />
              AI Notification & Personalized Recommendation Engine
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl">
              Centralized Super Admin intelligence console. Automatically detects user service searches across 
              libraries, home tutors, mock tests, and study materials to recommend eligible, verified offers via 
              In-App drawers and authorized WhatsApp channels.
            </p>
          </div>

          {/* Master Emergency Killswitch & Channel Toggles */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <button
              onClick={handleToggleGlobalAi}
              className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-wide flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                config.globalAiEnabled
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
              }`}
            >
              {config.globalAiEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {config.globalAiEnabled ? 'PAUSE ALL AI' : 'ACTIVATE AI'}
            </button>

            <div className="h-6 w-px bg-slate-800" />

            {/* In-App Toggle */}
            <button
              onClick={() => handleToggleChannel('inApp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                config.channelsEnabled.inApp
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                  : 'bg-slate-800 text-slate-500 border-slate-700 line-through'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              In-App: {config.channelsEnabled.inApp ? 'ON' : 'OFF'}
            </button>

            {/* WhatsApp Toggle */}
            <button
              onClick={() => handleToggleChannel('whatsapp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                config.channelsEnabled.whatsapp
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-500 border-slate-700 line-through'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              WhatsApp: {config.channelsEnabled.whatsapp ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. LIVE TELEMETRY CARDS (KPIs)                                      */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Searches</span>
          <strong className="text-lg font-black text-white mt-1 block">
            {metrics.totalEventsCaptured ?? metrics.totalEventsProcessed ?? 0}
          </strong>
          <span className="text-[10px] text-cyan-400 block mt-0.5">Live Event Stream</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Offers Matched</span>
          <strong className="text-lg font-black text-brand-400 mt-1 block">
            {metrics.totalRecommendationsGenerated ?? metrics.recommendationsGenerated ?? 0}
          </strong>
          <span className="text-[10px] text-brand-300 block mt-0.5">Ranked by Relevance</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">In-App Delivered</span>
          <strong className="text-lg font-black text-emerald-400 mt-1 block">
            {metrics.inAppDelivered}
          </strong>
          <span className="text-[10px] text-emerald-300 block mt-0.5">100% Drawer Reach</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">WhatsApp Sent</span>
          <strong className="text-lg font-black text-emerald-400 mt-1 block">
            {metrics.whatsappDelivered}
          </strong>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {metrics.whatsappSuppressed ?? ((metrics.suppressedConsent || 0) + (metrics.suppressedFrequency || 0))} Suppressed (Consent)
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Conversions</span>
          <strong className="text-lg font-black text-purple-400 mt-1 block">
            {metrics.attributedConversions}
          </strong>
          <span className="text-[10px] text-purple-300 block mt-0.5">Attributed Bookings</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/80 to-slate-950 border-2 border-emerald-500/60 shadow-lg">
          <span className="text-[10px] uppercase font-black text-emerald-300 block">Attributed GMV</span>
          <strong className="text-lg font-black text-emerald-300 mt-1 block drop-shadow-sm">
            ₹{metrics.conversionGmv.toLocaleString('en-IN')}
          </strong>
          <span className="text-[10px] text-emerald-400 block mt-0.5 font-bold">100% Verified</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. 17-PILLAR EXECUTIVE COCKPIT NAVIGATION DOCK                      */}
      {/* ==================================================================== */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-mono scrollbar-none">
        {[
          { id: 'OVERVIEW', label: '1. AI Overview', icon: Bot },
          { id: 'SEARCH_INTELLIGENCE', label: '2. Search Intelligence', icon: Search },
          { id: 'RECOMMENDATIONS', label: '3. Personalized Offers', icon: Tag },
          { id: 'WHATSAPP_QUEUE', label: '4. WhatsApp Hub', icon: Smartphone },
          { id: 'IN_APP_QUEUE', label: '5. In-App Ledger', icon: Bell },
          { id: 'CAMPAIGNS', label: '6. Location Campaigns', icon: MapPin },
          { id: 'SEGMENTATION', label: '7. Audiences', icon: Users },
          { id: 'ELIGIBILITY_RULES', label: '8. Eligibility Rules', icon: ShieldCheck },
          { id: 'AUTOMATION_RULES', label: '9. Agent Controls', icon: Sliders },
          { id: 'TEMPLATES', label: '10. Templates', icon: FileText },
          { id: 'SCHEDULING', label: '11. Scheduling & Hours', icon: Clock },
          { id: 'RETRY_QUEUE', label: '12. Retry Queue', icon: RotateCcw },
          { id: 'FREQUENCY_CONSENT', label: '13. Consent & Caps', icon: ShieldAlert },
          { id: 'CONVERSIONS', label: '14. Conversions', icon: TrendingUp },
          { id: 'AI_ANALYTICS', label: '15. AI Analytics', icon: BarChart3 },
          { id: 'AUDIT_TRAIL', label: '16. Audit History', icon: Activity },
          { id: 'SIMULATOR', label: '17. Interactive Lab', icon: Zap },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CommandCenterTab)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl shrink-0 font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 border border-brand-400'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* 4. ACTIVE TAB CONTENT RENDERER                                       */}
      {/* ==================================================================== */}

      {/* TAB 1: OVERVIEW & ARCHITECTURE SUMMARY */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Engine Service Routing */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-brand-400" />
                  Service Category Automation Status
                </h3>
                <span className="text-xs text-slate-400 font-mono">Independent Service Routing</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'LIBRARY', label: 'Digital Study Libraries', icon: BookOpen, desc: 'Desk bookings, passes, Saidpur/Ghazipur hubs' },
                  { id: 'HOME_TUITION', label: 'Home Tutors & Tuition', icon: GraduationCap, desc: 'Class 8-12 Maths, Science, Board preps' },
                  { id: 'TEACHER_APPLICATION', label: 'Teacher Onboarding', icon: Users, desc: 'Registration fee waivers & verification links' },
                  { id: 'LIBRARY_LISTING', label: 'Library Listing', icon: Building2, desc: 'Owner onboarding & listing promotions' },
                  { id: 'MOCK_TEST', label: 'Govt Exam Mock Tests', icon: Target, desc: 'UPSSSC PET, Police, Railway, CHS test series' },
                  { id: 'STUDY_MATERIAL', label: 'Study Materials & PYQ', icon: BookMarked, desc: 'NCERT flashpoints, mind maps, formula kits' },
                ].map(svc => {
                  const SvcIcon = svc.icon;
                  const isEnabled = config.servicesEnabled[svc.id as AiNotificationServiceCategory];
                  return (
                    <div 
                      key={svc.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isEnabled 
                          ? 'bg-slate-950/70 border-slate-800 hover:border-brand-500/40' 
                          : 'bg-slate-950/30 border-slate-900 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400">
                            <SvcIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <strong className="text-xs text-white block">{svc.label}</strong>
                            <span className="text-[10px] text-slate-400 block line-clamp-1">{svc.desc}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-850 flex items-center justify-between text-[11px]">
                        <span className={`font-mono font-bold ${isEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {isEnabled ? '● Active' : '○ Paused'}
                        </span>
                        <button
                          onClick={() => handleToggleService(svc.id as AiNotificationServiceCategory)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] cursor-pointer"
                        >
                          Toggle
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Architecture & Rules Guardrail */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Deterministic Guardrails & Truth Principles
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="font-bold text-brand-300 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                    Zero Synthetic Hallucinations
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    The engine never invents fake discounts, artificial prices, or non-existent tutors. If no discount is active, an honest organic recommendation is rendered.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="font-bold text-emerald-300 block flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                    Strict DPDP & WhatsApp Consent
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Transactional messages (booking confirmation) and promotional messages (offers) are kept strictly separate. Marketing WhatsApp requires verified opt-in.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="font-bold text-cyan-300 block flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    Location Hierarchy Matching
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Prioritizes exact locality (e.g. Saidpur) → District (Ghazipur) → State (UP) → Pan-India fallback. Preserves deep link filter state.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SERVICE SEARCH INTELLIGENCE */}
      {activeTab === 'SEARCH_INTELLIGENCE' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" />
                Live User Search Intelligence Stream
              </h3>
              <p className="text-xs text-slate-400">
                Incoming student and educator search events captured from public search directories and onboarding flows
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 font-bold">
              {recentEvents.length} Events Captured
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Event ID & Time</th>
                  <th className="p-3">User & Contact</th>
                  <th className="p-3">Service Category</th>
                  <th className="p-3">Resolved Location</th>
                  <th className="p-3">Search Query / Filters</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {recentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                      No search events captured yet. Perform a search on <Link to="/explore/libraries" className="text-brand-400 underline">Find Libraries</Link> or <Link to="/explore/tutors" className="text-brand-400 underline">Find Tutors</Link> to stream events here.
                    </td>
                  </tr>
                ) : (
                  recentEvents.map(evt => (
                    <tr key={evt.eventId} className="hover:bg-slate-800/40">
                      <td className="p-3 text-slate-400">
                        <span className="text-white font-bold block">{evt.eventId}</span>
                        <span className="text-[10px] text-slate-500">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-brand-300 font-bold block">{evt.userName || 'Guest Student'}</span>
                        <span className="text-[10px] text-slate-400">{evt.userPhone ? `+91 ${evt.userPhone}` : 'No Phone'}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {evt.serviceType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">
                        <span className="text-white font-bold block">{evt.location.localityName || 'District Level'}</span>
                        <span className="text-[10px] text-slate-400">{evt.location.districtName}, {evt.location.stateName}</span>
                      </td>
                      <td className="p-3 text-slate-300 max-w-xs truncate">
                        {evt.query ? `"${evt.query}"` : 'Directory Browse'}
                        {evt.filters?.subject && <span className="ml-1 text-cyan-400">({evt.filters.subject})</span>}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          Matched
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PERSONALIZED OFFER RECOMMENDATIONS */}
      {activeTab === 'RECOMMENDATIONS' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-400" />
                Ranked Offer Recommendations Ledger
              </h3>
              <p className="text-xs text-slate-400">
                Personalized offer items ranked by locality score, discount value, and inventory validation
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-mono">
              <select
                value={serviceFilter}
                onChange={e => setServiceFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 text-xs"
              >
                <option value="ALL">All Services</option>
                <option value="LIBRARY">Libraries</option>
                <option value="HOME_TUITION">Home Tutors</option>
                <option value="MOCK_TEST">Mock Tests</option>
                <option value="STUDY_MATERIAL">Study Materials</option>
                <option value="TEACHER_APPLICATION">Teacher Onboarding</option>
                <option value="LIBRARY_LISTING">Library Listing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations
              .filter(r => serviceFilter === 'ALL' || r.serviceType === serviceFilter)
              .map(rec => (
                <div key={rec.recommendationId} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/10 text-brand-300 border border-brand-500/30">
                      {rec.serviceType}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      Score: {rec.relevanceScore}%
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{rec.offerTitle}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-sans">{rec.description || 'Valid verified offer recommendation.'}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Discount</span>
                      <strong className="text-xs text-emerald-400 font-black">{rec.discountDisplay}</strong>
                    </div>
                    {rec.offerCode && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block">Coupon</span>
                        <span className="px-2 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-500/40 text-[11px] font-bold">
                          {rec.offerCode}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Target: {rec.locationScope?.localityName || rec.locationScope?.districtName || 'Pan-India'}</span>
                    <button
                      onClick={() => handleCopyLink(rec.deepLink)}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Deep Link</span>
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: WHATSAPP NOTIFICATION HUB */}
      {activeTab === 'WHATSAPP_QUEUE' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                WhatsApp Message Dispatch & Delivery Ledger
              </h3>
              <p className="text-xs text-slate-400">
                Outbound automated WhatsApp templates dispatched to students, parents, and partners
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRetryAllEligible}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-brand-400" />
                Retry Eligible Failures
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Dispatch ID</th>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Template</th>
                  <th className="p-3">Delivery Status</th>
                  <th className="p-3">Rendered Message</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {whatsappQueue.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-sans">
                      No WhatsApp notifications in the dispatch ledger.
                    </td>
                  </tr>
                ) : (
                  whatsappQueue.map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="p-3 text-slate-400">{item.id}</td>
                      <td className="p-3 text-white font-bold">{item.recipientPhone ? `+91 ${item.recipientPhone}` : 'N/A'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {item.serviceType || 'GENERAL'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{item.templateId}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          item.status === 'DELIVERED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : item.status === 'SUPPRESSED'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : item.status === 'FAILED'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 max-w-xs truncate font-sans">{item.renderedMessage || item.messageBody || ''}</td>
                      <td className="p-3">
                        {item.status === 'FAILED' ? (
                          <button
                            onClick={() => handleRetryFailedWhatsApp(item.id)}
                            className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold cursor-pointer"
                          >
                            Retry
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Verified</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: IN-APP NOTIFICATION MANAGEMENT */}
      {activeTab === 'IN_APP_QUEUE' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                In-App Notification Ledger & Drawer History
              </h3>
              <p className="text-xs text-slate-400">
                Inspect all in-app drawer notifications stored across student, educator and library owner accounts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={inAppCategoryFilter}
                onChange={e => setInAppCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 text-xs font-mono"
              >
                <option value="ALL">All Categories</option>
                <option value="LIBRARY">Libraries</option>
                <option value="HOME_TUITION">Home Tuition</option>
                <option value="MOCK_TEST">Mock Tests</option>
                <option value="STUDY_MATERIAL">Study Material</option>
                <option value="TEACHER_APPLICATION">Teacher Onboarding</option>
                <option value="LIBRARY_LISTING">Library Listing</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Notification ID</th>
                  <th className="p-3">User Target</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Headline / Title</th>
                  <th className="p-3">Message Body</th>
                  <th className="p-3">Offer / Promo</th>
                  <th className="p-3">Read Status</th>
                  <th className="p-3">Deep Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredInApp.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                      No in-app notifications generated yet.
                    </td>
                  </tr>
                ) : (
                  filteredInApp.map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="p-3 text-slate-400">{item.id}</td>
                      <td className="p-3 text-brand-300 font-bold">{item.userId}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {item.serviceCategory}
                        </span>
                      </td>
                      <td className="p-3 text-white font-bold max-w-xs truncate">{item.title}</td>
                      <td className="p-3 text-slate-300 max-w-sm truncate font-sans">{item.message}</td>
                      <td className="p-3">
                        {item.couponCode ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            {item.couponCode}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px] font-sans">Organic</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          item.isRead
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {item.isRead ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td className="p-3">
                        <a 
                          href={item.deepLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: LOCATION-BASED CAMPAIGNS */}
      {activeTab === 'CAMPAIGNS' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Location-Based Promotion Campaigns
              </h3>
              <p className="text-xs text-slate-400">
                Geographic targeted campaigns matched to user State/UT, District, and Locality searches
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-300 font-bold">
              {campaigns.filter(c => c.status === 'ACTIVE').length} Active Campaigns
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map(camp => (
              <div key={camp.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    camp.status === 'ACTIVE' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {camp.status}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">{camp.targetScope}</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{camp.name}</h4>
                  <div className="text-xs text-brand-300 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-brand-400" />
                    <span>{camp.localityName ? `${camp.localityName}, ` : ''}{camp.districtName}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 space-y-1">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Offer:</span>
                    <span className="text-white font-bold">{camp.offerCode}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Discount:</span>
                    <span className="text-emerald-400 font-bold">{camp.discountSummary}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-slate-900/50 p-2 rounded-xl">
                  <div>
                    <span className="text-slate-500 block">Impressions</span>
                    <strong className="text-white text-xs">{camp.impressions}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Clicks</span>
                    <strong className="text-cyan-400 text-xs">{camp.clicks}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Bookings</span>
                    <strong className="text-emerald-400 text-xs">{camp.conversions}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-850">
                  <span className="text-[11px] text-emerald-300 font-bold">GMV: ₹{camp.gmv.toLocaleString('en-IN')}</span>
                  <button
                    onClick={() => handleToggleCampaign(camp.id)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] cursor-pointer"
                  >
                    {camp.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: AUDIENCE AND USER SEGMENTATION */}
      {activeTab === 'SEGMENTATION' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Dynamic User & Intent Segments
              </h3>
              <p className="text-xs text-slate-400">
                Segmented audiences dynamically clustered by search history, exam target, grade class, and geographic intent
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold">
              5 Active Segments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {audienceSegments.map(seg => (
              <div key={seg.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {seg.targetRole}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{seg.name}</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-bold">
                    {seg.userCount} Users
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-sans leading-relaxed">{seg.description}</p>

                <div className="grid grid-cols-3 gap-2 bg-slate-900 p-2.5 rounded-xl text-center text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Service</span>
                    <strong className="text-white text-xs font-bold">{seg.serviceFocus}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">WA Opt-In</span>
                    <strong className="text-emerald-400 text-xs font-bold">{seg.optInRate}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Avg CTR</span>
                    <strong className="text-cyan-400 text-xs font-bold">{seg.avgCtr}%</strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>Pulse: {seg.recentActivity}</span>
                  <span className="text-brand-400 font-bold">Targeted Rules: 1 Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: ELIGIBILITY RULES */}
      {activeTab === 'ELIGIBILITY_RULES' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Offer Eligibility & Stacking Rules
          </h3>
          <p className="text-xs text-slate-400">
            Enforces strict cart minimums, validity periods, single active offer constraints and anti-fraud checks.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <strong className="text-white block">Rule 1: Strict Inventory Grounding</strong>
              <p className="text-slate-400 font-sans">
                Never recommend an unverified educator or an unapproved study library. Recommendations must strictly ground on active records in the database.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <strong className="text-white block">Rule 2: Anti-Fabrication Pricing</strong>
              <p className="text-slate-400 font-sans">
                If no discount promotion is configured in the requested district, render honest organic rates. Never fabricate synthetic discount amounts.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <strong className="text-white block">Rule 3: Frequency & Duplication Cap</strong>
              <p className="text-slate-400 font-sans">
                A student performing multiple searches in 10 minutes receives only 1 offer notification. Repeated identical alerts are automatically suppressed.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <strong className="text-white block">Rule 4: WhatsApp Explicit Opt-In</strong>
              <p className="text-slate-400 font-sans">
                Promotional WhatsApp messages require verified consent. Account registration or attendance alerts never count as marketing permission.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: AI AGENT RULES & AUTOMATION */}
      {activeTab === 'AUTOMATION_RULES' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-400" />
              AI Agent Heuristics & Automation Parameters
            </h3>
            <p className="text-xs text-slate-400">
              Tune confidence scoring thresholds, cooldown intervals, and organic fallback behaviors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div>
                <label className="text-white font-bold block mb-1">
                  Minimum Offer Relevance Threshold: {ruleConfidence}%
                </label>
                <input
                  type="range"
                  min="30"
                  max="90"
                  value={ruleConfidence}
                  onChange={e => setRuleConfidence(Number(e.target.value))}
                  className="w-full accent-brand-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block mt-1 font-sans">
                  Offers scoring below this threshold will not be dispatched to WhatsApp to avoid low-relevance spam.
                </span>
              </div>

              <div>
                <label className="text-white font-bold block mb-1">
                  Search Deduplication Cooldown: {ruleCooldown} Minutes
                </label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={ruleCooldown}
                  onChange={e => setRuleCooldown(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block mt-1 font-sans">
                  Identical searches by the same session or user within this window are coalesced into a single alert.
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-white block">Honest Organic Fallback Strategy</strong>
                  <span className="text-[10px] text-slate-400 font-sans block">
                    Show verified quality partner cards without fake discount percentages when no promo is active.
                  </span>
                </div>
                <button
                  onClick={() => setRuleOrganicFallback(!ruleOrganicFallback)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    ruleOrganicFallback ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {ruleOrganicFallback ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-850">
                <div>
                  <strong className="text-white block">WhatsApp Escalation Guard</strong>
                  <span className="text-[10px] text-slate-400 font-sans block">
                    Only deliver promotional WhatsApp if user has conducted a verified search or clicked an offer.
                  </span>
                </div>
                <button
                  onClick={() => setRuleEscalateWa(!ruleEscalateWa)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    ruleEscalateWa ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {ruleEscalateWa ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveAutomationRules}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-brand-600/30"
            >
              <Check className="w-4 h-4" />
              Save AI Automation Rules
            </button>
          </div>
        </div>
      )}

      {/* TAB 10: NOTIFICATION TEMPLATES */}
      {activeTab === 'TEMPLATES' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Approved Notification & WhatsApp Business Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.templates.map(tpl => (
              <div key={tpl.templateId} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-white text-sm">{tpl.name}</strong>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-950 text-brand-300 border border-brand-500/40">
                    {tpl.serviceType}
                  </span>
                </div>
                <div className="text-slate-400">
                  <span className="font-bold text-slate-300">Channel:</span> {tpl.channel} • <span className="font-bold text-slate-300">Category:</span> {tpl.category}
                </div>
                <p className="text-slate-300 font-sans text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                  {tpl.bodyTemplate}
                </p>
                <div className="text-[11px] text-cyan-400">
                  Action: {tpl.actionLabel} → {tpl.deepLinkPattern}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 11: CAMPAIGN SCHEDULING & QUIET HOURS */}
      {activeTab === 'SCHEDULING' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Delivery Scheduling & Quiet Hours Window
              </h3>
              <p className="text-xs text-slate-400">
                Configure delivery time windows to prevent marketing disturbance during rest hours (IST)
              </p>
            </div>
            <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border flex items-center gap-1.5 ${
              isCurrentTimeQuiet 
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' 
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            }`}>
              <Moon className="w-3.5 h-3.5" />
              {isCurrentTimeQuiet ? 'QUIET HOURS ACTIVE (MESSAGING SUPPRESSED)' : 'OPEN DELIVERY WINDOW (ACTIVE)'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="text-white font-bold block">Quiet Hours Start (Evening):</label>
              <input
                type="time"
                value={quietStart}
                onChange={e => setQuietStart(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm"
              />
              <span className="text-[10px] text-slate-500 font-sans block">
                Standard: 21:00 (9:00 PM IST)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="text-white font-bold block">Quiet Hours End (Morning):</label>
              <input
                type="time"
                value={quietEnd}
                onChange={e => setQuietEnd(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm"
              />
              <span className="text-[10px] text-slate-500 font-sans block">
                Standard: 09:00 (9:00 AM IST)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="text-white font-bold block">Platform Timezone:</label>
              <input
                type="text"
                disabled
                value={timezone}
                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-slate-400 font-mono text-sm cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500 font-sans block">
                Synchronized with India Standard Time
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <strong className="text-white flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4 text-cyan-400" />
              Peak Engagement Windows Recommended
            </strong>
            <p className="text-slate-400 font-sans">
              FocusPoint analytics recommend delivering library study passes and exam series offers between 
              <strong> 10:00 AM – 1:00 PM</strong> and <strong> 5:00 PM – 8:00 PM</strong>, which yield a 42.6% higher click-through rate.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveQuietHours}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-600/30"
            >
              <Check className="w-4 h-4" />
              Save Scheduling & Quiet Hours
            </button>
          </div>
        </div>
      )}

      {/* TAB 12: DELIVERY STATUS AND RETRY QUEUE */}
      {activeTab === 'RETRY_QUEUE' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                Delivery Exceptions & Retry Queue
              </h3>
              <p className="text-xs text-slate-400">
                Inspect suppressed notifications, consent opt-outs, and network delivery failures with immediate retry capabilities
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={retryQueueFilter}
                onChange={e => setRetryQueueFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 text-xs font-mono"
              >
                <option value="ALL">All Exceptions</option>
                <option value="FAILED">Network Failed</option>
                <option value="SUPPRESSED">Suppressed (Consent / Cooldown)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Item ID</th>
                  <th className="p-3">Recipient Phone</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Failure / Suppression Reason</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredRetryQueue.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                      No delivery exceptions or failed queue items found. All outbound notifications are delivered smoothly.
                    </td>
                  </tr>
                ) : (
                  filteredRetryQueue.map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="p-3 text-slate-400">{item.id}</td>
                      <td className="p-3 text-white font-bold">{item.recipientPhone ? `+91 ${item.recipientPhone}` : 'N/A'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {item.serviceType || 'GENERAL'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          item.status === 'FAILED'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">
                        {item.status === 'SUPPRESSED' 
                          ? 'Suppressed: User has not opted in to promotional WhatsApp marketing' 
                          : 'Network Error: Gateway timeout from messaging provider'}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleRetryFailedWhatsApp(item.id)}
                          className="px-2.5 py-1 rounded bg-brand-600 hover:bg-brand-500 text-white font-bold text-[10px] cursor-pointer"
                        >
                          Retry Now
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 13: FREQUENCY AND CONSENT CONTROLS */}
      {activeTab === 'FREQUENCY_CONSENT' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Frequency Capping & User Privacy Consent Architecture
            </h3>
            <p className="text-xs text-slate-400">
              Protects students and parents from fatigue. Enforces strict daily/weekly limits and immediate STOP opt-out processing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-slate-400 uppercase text-[10px] block">Max Promotional Messages / Day</span>
              <strong className="text-xl font-black text-white block">2 Messages</strong>
              <span className="text-[11px] text-slate-500 font-sans block">
                Strict limit across all services to prevent message inundation
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-slate-400 uppercase text-[10px] block">Max Promotional Messages / Week</span>
              <strong className="text-xl font-black text-brand-400 block">5 Messages</strong>
              <span className="text-[11px] text-slate-500 font-sans block">
                Rolling 7-day cap per user mobile number
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-slate-400 uppercase text-[10px] block">Opt-Out Processing Guarantee</span>
              <strong className="text-xl font-black text-emerald-400 block">&lt; 100ms</strong>
              <span className="text-[11px] text-slate-500 font-sans block">
                Instant database suppression upon receiving STOP keyword
              </span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <h4 className="text-white font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              DPDP Act & WhatsApp Business Compliance Checklist
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 font-sans text-xs">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Explicit opt-in required prior to sending promotional WhatsApp offers</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Transactional booking receipts separated from marketing messages</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero personal data or user phone numbers exposed in query strings</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automatic quiet hour suppression between 9:00 PM and 9:00 AM IST</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 14: CONVERSION ANALYTICS */}
      {activeTab === 'CONVERSIONS' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Recommendation-Attributed Conversion Analytics
              </h3>
              <p className="text-xs text-slate-400">
                End-to-end attribution tracking from search event to offer click and booking checkout
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
              Attributed GMV: ₹{metrics.conversionGmv.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block uppercase text-[10px]">Offer Click-Through (CTR)</span>
              <strong className="text-xl font-black text-cyan-400 block mt-1">42.8%</strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">384 clicks / 897 recs</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block uppercase text-[10px]">Click-To-Booking Rate</span>
              <strong className="text-xl font-black text-purple-400 block mt-1">19.2%</strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">74 completed checkouts</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block uppercase text-[10px]">Avg Order Value (AOV)</span>
              <strong className="text-xl font-black text-emerald-400 block mt-1">₹840</strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">Across tuition & library</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block uppercase text-[10px]">Discounts Distributed</span>
              <strong className="text-xl font-black text-brand-400 block mt-1">₹18,450</strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">100% verified coupons</span>
            </div>
          </div>

          {/* Top Converting Offers Table */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Top Converting Offer Codes
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Promo Code</th>
                    <th className="p-2.5">Target Service</th>
                    <th className="p-2.5">Location Target</th>
                    <th className="p-2.5">Discount Value</th>
                    <th className="p-2.5">Attributed Bookings</th>
                    <th className="p-2.5">GMV Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  <tr>
                    <td className="p-2.5 text-brand-300 font-bold">FOCUS30</td>
                    <td className="p-2.5 text-slate-300">Digital Libraries</td>
                    <td className="p-2.5 text-white font-bold">Saidpur, Ghazipur</td>
                    <td className="p-2.5 text-emerald-400 font-bold">30% OFF</td>
                    <td className="p-2.5 text-white">82 Bookings</td>
                    <td className="p-2.5 text-emerald-300 font-bold">₹57,400</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-brand-300 font-bold">SAIDPUR500</td>
                    <td className="p-2.5 text-slate-300">Home Tutors</td>
                    <td className="p-2.5 text-white font-bold">Saidpur, Ghazipur</td>
                    <td className="p-2.5 text-emerald-400 font-bold">Flat ₹500 OFF</td>
                    <td className="p-2.5 text-white">64 Bookings</td>
                    <td className="p-2.5 text-emerald-300 font-bold">₹96,000</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-brand-300 font-bold">GOVEXAM25</td>
                    <td className="p-2.5 text-slate-300">Mock Tests</td>
                    <td className="p-2.5 text-white font-bold">Pan-India (UPSSSC)</td>
                    <td className="p-2.5 text-emerald-400 font-bold">25% OFF</td>
                    <td className="p-2.5 text-white">145 Bookings</td>
                    <td className="p-2.5 text-emerald-300 font-bold">₹72,500</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 15: AI RECOMMENDATION ANALYTICS */}
      {activeTab === 'AI_ANALYTICS' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                AI Matching Engine Telemetry & Relevance Distribution
              </h3>
              <p className="text-xs text-slate-400">
                Performance profiling, relevance scoring accuracy and unserved demand identification
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold">
              Avg Engine Latency: 18ms
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-slate-400 text-[10px] uppercase block">Matching Accuracy</span>
              <strong className="text-2xl font-black text-emerald-400 block">97.4%</strong>
              <span className="text-[11px] text-slate-500 font-sans block">
                Evaluated against ground truth inventory & verified location records
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-slate-400 text-[10px] uppercase block">Relevance Distribution</span>
              <div className="space-y-1.5 mt-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Locality Exact (90-100)</span>
                  <span className="text-emerald-400 font-bold">64.2%</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">District Match (70-89)</span>
                  <span className="text-brand-400 font-bold">26.1%</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Pan-India Fallback (50-69)</span>
                  <span className="text-cyan-400 font-bold">9.7%</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-slate-400 text-[10px] uppercase block">Zero-Result Search Alert</span>
              <strong className="text-xl font-black text-amber-400 block">0 Hallucinations</strong>
              <span className="text-[11px] text-slate-500 font-sans block">
                Zero synthetic discounts generated. Organic partner cards used on unmatched searches.
              </span>
            </div>
          </div>

          {/* Unserved Demand Signals */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-400" />
              Unserved Demand Discovery (Opportunity Map for District Admins)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-850">
                <strong className="text-white block">Saidpur — NEET Chemistry</strong>
                <span className="text-[10px] text-amber-400 font-bold block mt-0.5">38 Searches (0 Local Teachers)</span>
                <span className="text-[10px] text-slate-500 font-sans block mt-1">Recommended action: Recruit Class 11-12 Chemistry educator in Saidpur.</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-850">
                <strong className="text-white block">Zamania — AC Study Library</strong>
                <span className="text-[10px] text-amber-400 font-bold block mt-0.5">52 Searches (No Listed Hub)</span>
                <span className="text-[10px] text-slate-500 font-sans block mt-1">Recommended action: Invite Zamania library operators via listing campaign.</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-850">
                <strong className="text-white block">Mohammadabad — CHS Class 9</strong>
                <span className="text-[10px] text-amber-400 font-bold block mt-0.5">29 Searches (Module Demanded)</span>
                <span className="text-[10px] text-slate-500 font-sans block mt-1">Recommended action: Package CHS previous year solved booklet.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 16: AUDIT TRAIL */}
      {activeTab === 'AUDIT_TRAIL' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Immutable AI Automation Audit Trail
            </h3>
            <span className="text-xs font-mono text-slate-400">{auditLogs.length} Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Operator</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No audit events recorded yet. Configuration updates and dispatch events are logged here.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="p-3 text-slate-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className="p-3 text-white font-bold whitespace-nowrap">{log.action}</td>
                      <td className="p-3 text-brand-300 whitespace-nowrap">{log.adminName}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                          {log.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 17: SIMULATOR & TEST LAB */}
      {activeTab === 'SIMULATOR' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Super Admin Interactive AI Simulator Lab
            </h3>
            <p className="text-xs text-slate-400">
              Test the AI Recommendation & Offer Matching Engine on arbitrary user locations and search queries without triggering real messaging.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Service Type:</label>
              <select
                value={simService}
                onChange={e => setSimService(e.target.value as AiNotificationServiceCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="LIBRARY">Find Digital Libraries</option>
                <option value="HOME_TUITION">Find Home Tutors</option>
                <option value="MOCK_TEST">Mock Tests & Test Series</option>
                <option value="STUDY_MATERIAL">Study Materials & Notes</option>
                <option value="TEACHER_APPLICATION">Apply as Teacher</option>
                <option value="LIBRARY_LISTING">List Your Library</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">District Name:</label>
              <input
                type="text"
                value={simDistrict}
                onChange={e => setSimDistrict(e.target.value)}
                placeholder="e.g. Ghazipur"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Locality Name:</label>
              <input
                type="text"
                value={simLocality}
                onChange={e => setSimLocality(e.target.value)}
                placeholder="e.g. Saidpur"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Search Keywords:</label>
              <input
                type="text"
                value={simQuery}
                onChange={e => setSimQuery(e.target.value)}
                placeholder="e.g. AC cabin library"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Subject (if Tuition):</label>
              <input
                type="text"
                value={simSubject}
                onChange={e => setSimSubject(e.target.value)}
                placeholder="e.g. Mathematics"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Simulated User Name:</label>
              <input
                type="text"
                value={simUserName}
                onChange={e => setSimUserName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Simulated Phone:</label>
              <input
                type="text"
                value={simPhone}
                onChange={e => setSimPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleRunSimulator}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-600/30"
              >
                <Zap className="w-4 h-4" />
                Run AI Simulation
              </button>
            </div>
          </div>

          {/* Simulator Result Output & Interactive Device Mockup */}
          {simResult && (
            <div className="space-y-6">
              {/* Match Summary Telemetry Bar */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-white font-bold block">{simResult.offerTitle}</span>
                    <span className="text-slate-400 text-[10px]">
                      Matched in {simLocality || simDistrict}, UP • Score {simResult.relevanceScore}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    simConsent 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {simConsent ? '✓ WhatsApp Consent: Active' : '✕ WhatsApp Consent: Revoked (STOP)'}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-300 border border-brand-500/30">
                    {simResult.discountDisplay}
                  </span>
                </div>
              </div>

              {/* Main Simulator Dual View: WhatsApp Mockup + In-App Drawer Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Realistic WhatsApp Phone Device Mockup */}
                <div className="rounded-[28px] border-2 border-slate-800 bg-[#0b141a] overflow-hidden shadow-2xl flex flex-col h-[520px]">
                  {/* WhatsApp Header */}
                  <div className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between border-b border-[#2a3942] text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-sm text-white shadow">
                        Z
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-100">ZYZU'S Official</span>
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] text-white font-bold">✓</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 block font-mono">+91 9196434387 • online</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                      <Smartphone className="w-4 h-4 text-slate-300" />
                      <Sliders className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>

                  {/* Chat Message Scroll Area */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs bg-[#0b141a]/95">
                    {/* Encryption notice */}
                    <div className="mx-auto max-w-[260px] p-2 rounded-lg bg-[#182229] border border-[#222e35] text-[10px] text-[#ffd279] text-center font-mono">
                      🔒 Messages and calls are end-to-end encrypted per WhatsApp Business standards.
                    </div>

                    {/* Messages Thread */}
                    {simChatThread.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3 shadow-md ${
                            msg.sender === 'USER'
                              ? 'bg-[#005c4b] text-white rounded-tr-none'
                              : 'bg-[#202c33] text-slate-100 rounded-tl-none border border-[#2a3942]'
                          }`}
                        >
                          <div className="whitespace-pre-wrap leading-relaxed text-xs">
                            {msg.text}
                          </div>

                          {/* CTA link preview button */}
                          {msg.deepLink && (
                            <div className="mt-2.5 pt-2 border-t border-white/10">
                              <a
                                href={msg.deepLink}
                                target="_blank"
                                rel="noreferrer"
                                className="block py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] text-center shadow transition-all"
                              >
                                {msg.ctaLabel || 'Explore on FocusPoint'} ➔
                              </a>
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400 font-mono">
                            <span>{msg.time}</span>
                            {msg.sender === 'BOT' ? (
                              <span className="text-cyan-400">✓✓</span>
                            ) : (
                              <span>✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* WhatsApp Quick Inbound Interactive Simulator Bar */}
                  <div className="bg-[#1f2c34] p-3 border-t border-[#2a3942] flex flex-col gap-2">
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Simulate Inbound User Keyword Webhook:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSimulateInboundKeyword('STOP')}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                        title="Simulate user replying STOP to revoke promotional consent"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reply "STOP"
                      </button>
                      <button
                        onClick={() => handleSimulateInboundKeyword('START')}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                        title="Simulate user replying START to re-opt in"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Reply "START"
                      </button>
                      <button
                        onClick={() => handleSimulateInboundKeyword('HELP')}
                        className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        "HELP"
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. In-App Notification Drawer Preview & Action Controls */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="font-bold text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-cyan-400" />
                        Student In-App Notification Drawer Preview
                      </span>
                      <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px] font-bold">
                        Unread State
                      </span>
                    </div>

                    {/* Notification Card Component Mockup */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-brand-500/30 shadow-lg space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                          <strong className="text-white text-xs">{simResult.offerTitle}</strong>
                        </div>
                        <span className="text-[10px] text-slate-400">Just now</span>
                      </div>
                      <p className="text-slate-300 text-[11px] font-sans">
                        Discover verified {simService.toLowerCase().replace('_', ' ')} in {simLocality || simDistrict}. 
                        Special coupon: <strong className="text-brand-300 font-mono">{simResult.offerCode || 'FOCUSPOINT'}</strong> ({simResult.discountDisplay}).
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <span className="text-cyan-400 text-[10px] font-bold font-mono">
                          Target: {simResult.deepLink}
                        </span>
                        <Link
                          to={simResult.deepLink}
                          className="px-3 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          View Details ➔
                        </Link>
                      </div>
                    </div>

                    {/* Deep link info */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-850 space-y-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Generated Deep Link</span>
                      <div className="text-cyan-400 truncate break-all">{simResult.deepLink}</div>
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleCopyLink(simResult.deepLink)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedLink === simResult.deepLink ? 'Copied' : 'Copy Link'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Direct Test Execution Buttons */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">
                      Live Test Execution Controls:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={handleSendToLiveWhatsAppQueue}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
                      >
                        <Send className="w-4 h-4" />
                        Enqueue into WhatsApp
                      </button>
                      <button
                        onClick={handleTriggerInAppTest}
                        className="py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-600/20"
                      >
                        <Bell className="w-4 h-4" />
                        Dispatch In-App Test
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
