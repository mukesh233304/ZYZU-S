// FOCUSPOINT Demo Booking & Pricing Types

export type DemoServiceType = 'LIBRARY' | 'HOME_TUITION' | 'library' | 'home_tuition';
export type DemoScopeType = 'PAN_INDIA' | 'STATE' | 'DISTRICT' | 'PARTICULAR' | 'DEFAULT_FREE';
export type DemoBookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
export type DemoPaymentStatus = 'FREE' | 'PAID' | 'PENDING' | 'REFUNDED';

export interface DemoPricingRule {
  id: string;
  service_type: 'LIBRARY' | 'HOME_TUITION';
  scope_type: 'PAN_INDIA' | 'STATE' | 'DISTRICT' | 'PARTICULAR';
  state?: string;
  district?: string;
  service_id?: string;
  service_name?: string;
  price: number;
  is_active: boolean;
  start_date: string;
  end_date?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DemoBooking {
  id: string;
  demo_booking_id: string; // FP-LIB-DEMO-YYYYMMDD-XXXX or FP-TUT-DEMO-YYYYMMDD-XXXX
  student_id: string;
  student_name?: string;
  student_photo?: string;
  student_mobile?: string;
  service_type: 'LIBRARY' | 'HOME_TUITION';
  service_id: string;
  service_name: string;
  service_address?: string;
  venue_details?: string;
  tutor_subject?: string;
  state?: string;
  district?: string;
  demo_date: string;
  demo_time: string;
  price: number; // locked fee
  pricing_rule_id?: string | null;
  pricing_scope_used?: DemoScopeType;
  payment_status: DemoPaymentStatus;
  payment_id?: string;
  payment_method?: string;
  booking_status: DemoBookingStatus;
  notes?: string;
  verified_at?: string;
  verified_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface DemoEligibility {
  canBookLibrary: boolean;
  canBookHomeTuition: boolean;
  libraryBooking?: DemoBooking | null;
  tuitionBooking?: DemoBooking | null;
  libraryMessage?: string;
  tuitionMessage?: string;
}

export interface DemoPriceCalculation {
  price: number;
  scopeUsed: DemoScopeType;
  ruleId?: string | null;
  ruleName?: string;
  isFree: boolean;
}
