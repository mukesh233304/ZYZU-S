import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  BookMarked, MapPin, Clock, ShieldCheck, CheckCircle2, 
  ArrowLeft, ArrowRight, Armchair, AlertCircle, Phone, Info, Tag, Sparkles 
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { RatingStars } from '../../components/common/RatingStars';
import { LoadingSkeleton, ErrorState } from '../../components/common/FeedbackStates';
import { libraryService } from '../../services/libraryService';
import { Library } from '../../types';
import { ShiftDeskGrid } from '../../components/library/ShiftDeskGrid';
import { UserAvatar } from '../../components/common/UserAvatar';
import { policyService } from '../../services/policyService';
import { OfferBadge, OfferPriceDisplay } from '../../components/common/OfferBadge';
import { DemoBookingModal } from '../../components/demo/DemoBookingModal';

export const LibraryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [library, setLibrary] = useState<Library | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [, setPolicyVersion] = useState(0);
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Real-time reactive subscription to District Admin policy/offer changes
  useEffect(() => {
    return policyService.subscribe(() => setPolicyVersion(v => v + 1));
  }, []);

  useEffect(() => {
    const fetchLibrary = async () => {
      setLoading(true);
      if (id) {
        const data = await libraryService.getLibraryById(id);
        setLibrary(data || null);
      }
      setLoading(false);
    };
    fetchLibrary();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <LoadingSkeleton rows={8} />
      </div>
    );
  }

  if (!library) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <ErrorState
          title="Library Not Found"
          message="The requested self-study library could not be loaded."
          onRetry={() => navigate('/find-library')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link to="/find-library" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-brand-600 transition-colors font-semibold">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Study Libraries</span>
      </Link>

      {/* Main Header & Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Gallery on Left (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          {(() => {
            const images = library.images && library.images.length > 0 ? library.images : ['https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=1200'];
            return (
              <>
                <div className="rounded-2xl overflow-hidden h-72 sm:h-96 border border-slate-200 bg-white relative shadow-sm">
                  <img
                    src={images[activeImageIndex] || images[0]}
                    alt={library.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-md">
                    {library.availableSeats} Seats Available
                  </div>
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                          activeImageIndex === idx ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-300 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Right Info Box */}
        {/* Right Info Box */}
        {(() => {
          const originalMonthly = (library.id === 'lib-focus-saidpur' || library.name.toLowerCase().includes('focuspoint')) 
            ? 1000 
            : (library.monthlyStartingPrice || library.monthlyFee || 499);
          const mainPricing = policyService.getBestActiveOffer({
            districtName: library.districtName || 'Ghazipur',
            serviceType: 'LIBRARY',
            targetId: library.id,
            amount: originalMonthly,
          });

          return (
            <div className="space-y-6">
              <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-brand-600 font-bold">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>{library.area}, {library.districtName}, Uttar Pradesh</span>
                    </div>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">{library.name}</h1>
                  <div className="flex items-center gap-2 pt-1">
                    <RatingStars rating={library.rating || 0} reviewsCount={library.reviewsCount} />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-600 font-medium">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Total Desks:</span>
                    <span className="font-bold text-slate-950">{library.totalSeats} Ergonomic Desks</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Monthly Plan:</span>
                    <OfferPriceDisplay
                      originalPrice={originalMonthly}
                      pricing={mainPricing}
                      unit="/ mo"
                      size="md"
                      showBadge={true}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Hours:</span>
                    <span className="font-semibold text-slate-800">{library.timings || '6:00 AM - 11:00 PM'}</span>
                  </div>
                </div>

                <Button
                  onClick={() => navigate(`/libraries/${library.id}/book`)}
                  className="w-full font-bold shadow-sm"
                >
                  Book Desk Slot Now
                </Button>

                <button
                  type="button"
                  onClick={() => setShowDemoModal(true)}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition"
                >
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  Book 1-Time Demo Seat
                </button>
              </div>

              {/* Verified Study Center Administrator Card */}
              <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                    Facility Administrator
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Owner
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <UserAvatar
                    user={{
                      name: library.ownerName || 'Study Center Owner',
                      avatarUrl: library.ownerAvatar,
                      avatar: library.ownerAvatar
                    }}
                    size="lg"
                    showBorder
                    shape="rounded"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-950 text-sm truncate">
                      {library.ownerName || 'Verified Facility Owner'}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Center Director • {library.districtName || library.district}
                    </p>
                    {library.ownerPhone && (
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-600 font-medium">
                        <Phone className="w-3 h-3 text-brand-600" />
                        <span>+91 {library.ownerPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Shifts & Seat Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shifts Section */}
          <Card className="space-y-4 bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" />
                Daily Shifts & Timings
              </h3>
              <span className="text-xs text-slate-500 font-medium">Flexible options</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {library.shifts.map((shift) => {
                const shiftPrice = shift.monthlyPrice || shift.price || 499;
                const shiftPricing = policyService.getBestActiveOffer({
                  districtName: library.districtName || 'Ghazipur',
                  serviceType: 'LIBRARY',
                  targetId: library.id,
                  amount: shiftPrice,
                });

                return (
                  <div
                    key={shift.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-slate-950 text-sm">{shift.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{shift.startTime} - {shift.endTime}</p>
                    </div>
                    <div className="text-right">
                      <OfferPriceDisplay
                        originalPrice={shiftPrice}
                        pricing={shiftPricing}
                        unit="/ mo"
                        size="sm"
                        showBadge={true}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Seat Layout Matrix Preview with Live Shift Availability and Hover Popover */}
          <Card className="p-5 sm:p-6 bg-white border border-slate-200 shadow-sm space-y-4">
            <ShiftDeskGrid
              seats={library.seats || []}
              shifts={library.shifts}
              selectable={false}
              showShiftTabs={true}
            />
          </Card>
        </div>

        {/* Facilities & Rules */}
        <div className="space-y-6">
          <Card className="space-y-4 bg-white border border-slate-200 shadow-sm">
            <h3 className="text-base font-black text-slate-950">Library Amenities</h3>
            <div className="space-y-2">
              {library.facilities.map((fac) => (
                <div key={fac} className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>{fac}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 bg-white border border-slate-200 shadow-sm">
            <h3 className="text-base font-black text-slate-950">House Rules</h3>
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              {(() => {
                const rulesList = Array.isArray(library.rules)
                  ? library.rules
                  : typeof library.rules === 'string'
                  ? library.rules.split('\n')
                  : ['Keep silence in the study zone', 'No outside food inside reading halls', 'Turn mobile phones on silent mode'];
                return rulesList.map((rule: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1.5 shrink-0" />
                    <span>{rule}</span>
                  </li>
                ));
              })()}
            </ul>
          </Card>
        </div>
      </div>

      {showDemoModal && library && (
        <DemoBookingModal
          isOpen={showDemoModal}
          onClose={() => setShowDemoModal(false)}
          serviceType="LIBRARY"
          serviceId={library.id}
          serviceName={library.name}
          serviceAddress={library.address}
          state={library.stateId || (library as any).state || 'Uttar Pradesh'}
          district={library.districtName || (library as any).district || 'Ghazipur'}
        />
      )}
    </div>
  );
};
