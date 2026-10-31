import React, { useState, useMemo } from 'react';
import { 
  Search, HelpCircle, ChevronDown, Sparkles, MessageSquare, 
  PhoneCall, ArrowRight, BookOpen, GraduationCap, BookMarked, 
  ShieldCheck, CreditCard, Award, X, ThumbsUp, ThumbsDown,
  Clock, Zap, CheckCircle2, Headphones, MessageCircle, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';

interface FaqItem {
  id: string;
  category: 'STUDENTS' | 'PARENTS' | 'TEACHERS' | 'LIBRARY' | 'MOCK_TESTS' | 'STUDY_MATERIALS' | 'SUBSCRIPTIONS' | 'GOVT_EXAMS';
  categoryLabel: string;
  categoryColor: string;
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  // Students & Parents
  {
    id: 'f-1',
    category: 'STUDENTS',
    categoryLabel: 'Students',
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-200',
    q: "How does ZYZU'S ensure teacher quality for home tuition?",
    a: 'Every educator undergoes multi-step KYC verification by the designated District Admin. We verify original university degrees (e.g. BHU, AKTU, State Universities), masked Aadhaar identity, past teaching experience, and locality address before allotting any tuition.'
  },
  {
    id: 'f-2',
    category: 'PARENTS',
    categoryLabel: 'Parents',
    categoryColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    q: 'Do parents receive cold calls or are phone numbers exposed to tutors?',
    a: "No. ZYZU'S uses strict District Admin matching. Student and parent personal contact details are never leaked to public directories. Our local admin reviews the syllabus and budget requirements, matching only one thoroughly vetted nearby tutor."
  },
  {
    id: 'f-3',
    category: 'PARENTS',
    categoryLabel: 'Parents',
    categoryColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    q: 'Can we take a demo class before paying the monthly tuition fee?',
    a: 'Yes! Every student is entitled to a 1-time official verified demo session. You only confirm the monthly allotment after you and your child are completely satisfied with the teacher\'s pedagogical style.'
  },

  // Study Libraries
  {
    id: 'f-4',
    category: 'LIBRARY',
    categoryLabel: 'Digital Libraries',
    categoryColor: 'bg-amber-50 text-amber-700 border-amber-200',
    q: "How do seat reservations and shifts work in ZYZU'S libraries?",
    a: 'Each affiliated library offers configured shifts: Morning (07:00 AM - 12:00 PM), Afternoon (12:00 PM - 05:00 PM), Evening (05:00 PM - 10:00 PM), or Full Day Pass. Students can select their exact desk number from a live visual interactive seat map and receive instant digital shift pass receipts.'
  },
  {
    id: 'f-5',
    category: 'LIBRARY',
    categoryLabel: 'Library Owners',
    categoryColor: 'bg-amber-50 text-amber-700 border-amber-200',
    q: "How can library owners list their spaces on ZYZU'S?",
    a: 'Library owners can apply via "List Your Library". A local District Admin visits the physical facility to inspect standard amenities (AC, 5G Wi-Fi, power backup, CCTV, RO water) before granting approved status and providing an admin dashboard.'
  },

  // Mock Tests
  {
    id: 'f-6',
    category: 'MOCK_TESTS',
    categoryLabel: 'Mock Tests',
    categoryColor: 'bg-purple-50 text-purple-700 border-purple-200',
    q: 'What is the Personal Mistake Book in the Mock Test Center?',
    a: 'Whenever you attempt a government or school entrance mock test, the platform automatically logs every incorrect answer, concept trap, and unattempted question into your Personal Mistake Book with step-by-step explanations for targeted re-testing.'
  },
  {
    id: 'f-7',
    category: 'MOCK_TESTS',
    categoryLabel: 'Mock Tests',
    categoryColor: 'bg-purple-50 text-purple-700 border-purple-200',
    q: 'Are the mock tests modeled on actual NTA and BHU CHS patterns?',
    a: 'Yes. Tests are crafted by subject experts following the exact CBT user interface, negative marking rules, timer mechanisms, and official syllabus weightages for BHU CHS, JNVST Navodaya, NEET, JEE, and State exams.'
  },

  // Study Materials
  {
    id: 'f-8',
    category: 'STUDY_MATERIALS',
    categoryLabel: 'Study Materials',
    categoryColor: 'bg-teal-50 text-teal-700 border-teal-200',
    q: 'Can I download study materials and previous year solved papers offline?',
    a: 'Students with active access can view high-resolution chapter mind maps, topper handwritten notes, and solved PYQ sets directly on their dashboard and print/download eligible revision PDFs.'
  },
  {
    id: 'f-9',
    category: 'STUDY_MATERIALS',
    categoryLabel: 'Study Materials',
    categoryColor: 'bg-teal-50 text-teal-700 border-teal-200',
    q: 'Do library members automatically get study materials and mock tests?',
    a: 'Study materials and mock test access depend on the student\'s specific subscription tier or bundled library pass. Many premium library hubs include free diagnostic tests and standard question banks.'
  },

  // Teachers
  {
    id: 'f-10',
    category: 'TEACHERS',
    categoryLabel: 'Teachers',
    categoryColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    q: 'How do teachers receive tuition allotments and payments?',
    a: 'Verified educators receive tuition matching notifications for their specific locality and subject expertise. Monthly fees are tracked with digital receipts through the teacher portal with zero commission deductions.'
  },

  // Subscriptions & Payments
  {
    id: 'f-11',
    category: 'SUBSCRIPTIONS',
    categoryLabel: 'Subscriptions & Payments',
    categoryColor: 'bg-sky-50 text-sky-700 border-sky-200',
    q: "What payment modes are supported on ZYZU'S?",
    a: 'We support UPI (GPay, PhonePe, Paytm), debit/credit cards, net banking, and direct digital invoicing with zero middleman brokerage fees.'
  },

  // Government Exams
  {
    id: 'f-12',
    category: 'GOVT_EXAMS',
    categoryLabel: 'Government Exams',
    categoryColor: 'bg-rose-50 text-rose-700 border-rose-200',
    q: 'Which government and entrance exams are currently supported?',
    a: 'We support BHU CHS (Class 9 & 11), JNVST Navodaya Vidyalaya, NEET UG, JEE Main & Advanced, UP Police Constable & SI, SSC CGL / CHSL / MTS, and School Olympiads.'
  }
];

export const HelpCenterFaqSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('f-1');
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});

  const CATEGORIES = [
    { id: 'ALL', label: 'All Categories', count: FAQS.length, icon: Sparkles },
    { id: 'STUDENTS', label: 'Students', count: FAQS.filter(f => f.category === 'STUDENTS').length, icon: GraduationCap },
    { id: 'PARENTS', label: 'Parents', count: FAQS.filter(f => f.category === 'PARENTS').length, icon: ShieldCheck },
    { id: 'TEACHERS', label: 'Verified Teachers', count: FAQS.filter(f => f.category === 'TEACHERS').length, icon: Award },
    { id: 'LIBRARY', label: 'AC Digital Libraries', count: FAQS.filter(f => f.category === 'LIBRARY').length, icon: BookMarked },
    { id: 'MOCK_TESTS', label: 'CBT Mock Tests', count: FAQS.filter(f => f.category === 'MOCK_TESTS').length, icon: Zap },
    { id: 'STUDY_MATERIALS', label: 'Notes & PYQ', count: FAQS.filter(f => f.category === 'STUDY_MATERIALS').length, icon: BookOpen },
    { id: 'SUBSCRIPTIONS', label: 'Subscriptions', count: FAQS.filter(f => f.category === 'SUBSCRIPTIONS').length, icon: CreditCard },
    { id: 'GOVT_EXAMS', label: 'Govt & Entrance', count: FAQS.filter(f => f.category === 'GOVT_EXAMS').length, icon: Clock },
  ];

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCat = selectedCategory === 'ALL' || faq.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        faq.q.toLowerCase().includes(query) || 
        faq.a.toLowerCase().includes(query) ||
        faq.categoryLabel.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleFeedback = (faqId: string, type: 'up' | 'down') => {
    setFeedbackGiven(prev => ({ ...prev, [faqId]: type }));
  };

  return (
    <section 
      id="help-center" 
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14 scroll-mt-20"
      aria-label="ZYZU'S Help Center & FAQ"
    >
      {/* Decorative Ambient Glow Lights */}
      <div className="absolute top-10 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Section Header */}
      <div className="text-center space-y-3 mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-blue-700 text-xs font-black uppercase tracking-wider shadow-xs">
          <HelpCircle className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span>24x7 Intelligent Knowledge Base &amp; Support Hub</span>
        </div>
        
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
          ZYZU'S Help Center &amp;{' '}
          <span className="bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Smart FAQ
          </span>
        </h2>
        
        <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
          Instant, verified answers about accredited study libraries, KYC-checked home tutors, CBT mock exam intelligence, revision notes, and transparent subscriptions.
        </p>
      </div>

      {/* Futuristic Command Center Layout: 2-Column on LG screens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: SEARCH + CATEGORY FILTER COMMAND DECK (4 cols on lg)       */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          
          {/* Futuristic Search Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-md space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-brand-600" />
                Live Answer Search
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask or search (e.g. demo class, wifi, shifts, mistake book)..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white shadow-inner transition-all"
              />
            </div>

            <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
              <span>Showing {filteredFaqs.length} verified answers</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live
              </span>
            </div>
          </div>

          {/* Futuristic Category Switcher Deck */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-md space-y-2.5">
            <span className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              Browse by Service Domain
            </span>
            
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full p-2.5 sm:p-3 rounded-xl text-left transition-all duration-200 flex items-center justify-between cursor-pointer border ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-50 to-blue-50 border-brand-300 text-brand-900 shadow-xs font-black ring-1 ring-brand-400/20'
                        : 'bg-transparent border-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-brand-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs sm:text-sm truncate">{cat.label}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isActive ? 'bg-brand-200/60 text-brand-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick SLA & District Help Desk Guarantee Badge */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-900/40 shadow-md space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
              <Headphones className="w-4 h-4 text-cyan-400" />
              <span>District Help Desk SLA</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Every inquiry is overseen by designated District Administrative Officers with a verified average response time of &lt; 15 minutes.
            </p>
            <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800">
              <span>99.4% SLA Adherence</span>
              <span className="text-emerald-400 font-bold">100% Zero Brokerage</span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: INTERACTIVE ACCORDION LIST (8 cols on lg)                  */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-3.5">
          {filteredFaqs.length === 0 ? (
            /* No Results Empty State */
            <div className="p-10 sm:p-14 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <HelpCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-bold text-slate-900">
                  No matching answers found for "{searchQuery}"
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Our District Admin support team is active 7 days a week to clarify any specific question regarding tuition, libraries, or test series.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Reset Filters
                </button>
                <Link to="/contact">
                  <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Ask District Admin
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = expandedId === faq.id;
              const feedback = feedbackGiven[faq.id];

              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-white border-brand-500 shadow-md ring-1 ring-brand-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : faq.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 cursor-pointer group"
                  >
                    <div className="space-y-1.5 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${faq.categoryColor}`}>
                          {faq.categoryLabel}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          #{faq.id.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-950 group-hover:text-brand-600 transition-colors leading-snug">
                        {faq.q}
                      </h3>
                    </div>
                    <div className={`p-2 rounded-full transition-transform duration-200 shrink-0 mt-1 ${
                      isOpen ? 'rotate-180 bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed border-t border-slate-100 pt-4 animate-in fade-in duration-200 space-y-4">
                      <p className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 text-slate-800">
                        {faq.a}
                      </p>

                      {/* Interactive Feedback & Fast Link Deck */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-semibold text-[11px]">
                            Was this answer helpful?
                          </span>
                          <button
                            type="button"
                            onClick={() => handleFeedback(faq.id, 'up')}
                            className={`p-1.5 rounded-lg border flex items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
                              feedback === 'up' 
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{feedback === 'up' ? 'Helpful!' : 'Yes'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeedback(faq.id, 'down')}
                            className={`p-1.5 rounded-lg border flex items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
                              feedback === 'down' 
                                ? 'bg-rose-50 border-rose-300 text-rose-700' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>{feedback === 'down' ? 'Reported' : 'No'}</span>
                          </button>
                        </div>

                        <Link 
                          to="/contact" 
                          className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                        >
                          <span>Ask a question about this</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Still Need Assistance Live Support Bar */}
          <div className="mt-6 p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl border border-indigo-900/50">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/30 shrink-0">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-white">
                  Still have questions about tuition or library booking?
                </h4>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Our local District Administrative Help Desk is active 7 days a week to support parents, students, and educators.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link to="/contact" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white text-xs sm:text-sm font-black transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Contact Support Desk</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
