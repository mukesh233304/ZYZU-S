// FOCUSPOINT Demo Service Layer
// Dual-Mode: Direct Local/MockStore + Express API Bridge

import {
  DemoPricingRule,
  DemoBooking,
  DemoEligibility,
  DemoPriceCalculation,
  DemoServiceType
} from '../types';
import { mockStore } from '../mock/store';

export const demoService = {
  /**
   * Calculate live demo price based on 4-tier hierarchy
   */
  async calculatePrice(
    serviceType: DemoServiceType,
    state?: string,
    district?: string,
    serviceId?: string
  ): Promise<DemoPriceCalculation> {
    try {
      const res = await fetch('/api/demos/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_type: serviceType, state, district, service_id: serviceId })
      });
      if (res.ok) {
        const data = await res.json();
        return {
          price: data.price,
          scopeUsed: data.scopeUsed,
          ruleId: data.ruleId,
          ruleName: data.ruleName,
          isFree: data.price === 0
        };
      }
    } catch (e) {
      // Fallback to mockStore
    }
    return mockStore.resolveDemoPrice(serviceType, state, district, serviceId);
  },

  /**
   * Check if current student has already used their 1-time demo
   */
  async checkEligibility(studentId: string): Promise<DemoEligibility> {
    try {
      const token = localStorage.getItem('fp_token') || sessionStorage.getItem('fp_token');
      if (token) {
        const res = await fetch('/api/demos/eligibility', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          return {
            canBookLibrary: data.canBookLibrary,
            canBookHomeTuition: data.canBookHomeTuition,
            libraryBooking: data.libraryBooking,
            tuitionBooking: data.tuitionBooking,
            libraryMessage: data.libraryMessage,
            tuitionMessage: data.tuitionMessage
          };
        }
      }
    } catch (e) {
      // Fallback to mockStore
    }
    return mockStore.checkDemoEligibility(studentId);
  },

  /**
   * Book a demo seat or class
   */
  async bookDemo(bookingData: Partial<DemoBooking>): Promise<{
    success: boolean;
    message: string;
    booking?: DemoBooking;
  }> {
    try {
      const token = localStorage.getItem('fp_token') || sessionStorage.getItem('fp_token');
      if (token) {
        const res = await fetch('/api/demos/book', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(bookingData)
        });
        const data = await res.json();
        if (res.ok && data.success) {
          return {
            success: true,
            message: data.message,
            booking: data.booking
          };
        } else {
          return {
            success: false,
            message: data.message || 'Demo booking failed'
          };
        }
      }
    } catch (e) {
      // Fallback to mockStore
    }
    return mockStore.createDemoBooking(bookingData);
  },

  /**
   * Process payment for a paid demo booking
   */
  async processPayment(
    bookingIdOrDemoId: string,
    paymentDetails?: { payment_id?: string; method?: string; transaction_id?: string }
  ): Promise<{
    success: boolean;
    message: string;
    booking?: DemoBooking;
  }> {
    try {
      const token = localStorage.getItem('fp_token') || sessionStorage.getItem('fp_token');
      if (token) {
        const res = await fetch('/api/demos/process-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            demo_booking_id: bookingIdOrDemoId,
            ...paymentDetails
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          return {
            success: true,
            message: data.message,
            booking: data.booking
          };
        }
      }
    } catch (e) {
      // Fallback to mockStore
    }
    return mockStore.processDemoPayment(bookingIdOrDemoId, paymentDetails);
  },

  /**
   * Get student's demo bookings
   */
  async getStudentDemoBookings(studentId: string): Promise<DemoBooking[]> {
    try {
      const token = localStorage.getItem('fp_token') || sessionStorage.getItem('fp_token');
      if (token) {
        const res = await fetch('/api/demos/my-bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.bookings)) {
            return data.bookings;
          }
        }
      }
    } catch (e) {
      // Fallback to mockStore
    }
    return mockStore.getStudentDemoBookings(studentId);
  },

  /**
   * Get single demo booking by internal ID or demo_booking_id
   */
  async getDemoById(idOrBookingId: string): Promise<DemoBooking | undefined> {
    try {
      const token = localStorage.getItem('fp_token') || sessionStorage.getItem('fp_token');
      if (token) {
        const res = await fetch(`/api/demos/booking/${idOrBookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.booking) {
            return data.booking;
          }
        }
      }
    } catch (e) {
      // Fallback to mockStore
    }
    return mockStore.getDemoBookingById(idOrBookingId);
  },

  /**
   * QR verification tool
   */
  async verifyDemoQr(
    tokenString: string,
    verifiedByUserId?: string
  ): Promise<{ valid: boolean; message: string; booking?: DemoBooking }> {
    try {
      const token = localStorage.getItem('fp_token') || sessionStorage.getItem('fp_token');
      if (token) {
        const res = await fetch('/api/demos/verify-qr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ demo_booking_id: tokenString })
        });
        if (res.ok) {
          const data = await res.json();
          return {
            valid: data.valid,
            message: data.message,
            booking: data.booking
          };
        }
      }
    } catch (e) {
      // Fallback to mockStore
    }
    return mockStore.verifyDemoQr(tokenString, verifiedByUserId);
  },

  /**
   * Admin Pricing Rules Management
   */
  async getPricingRules(): Promise<DemoPricingRule[]> {
    try {
      const token = localStorage.getItem('fp_token') || sessionStorage.getItem('fp_token');
      if (token) {
        const res = await fetch('/api/demos/admin/pricing-rules', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.rules)) {
            return data.rules;
          }
        }
      }
    } catch (e) {
      // Fallback to mockStore
    }
    return mockStore.getDemoPricingRules();
  },

  async savePricingRule(ruleData: Partial<DemoPricingRule>): Promise<DemoPricingRule> {
    try {
      const token = localStorage.getItem('fp_token') || sessionStorage.getItem('fp_token');
      if (token) {
        const endpoint = ruleData.id && !ruleData.id.startsWith('rule-demo-')
          ? `/api/demos/admin/pricing-rules/${ruleData.id}`
          : '/api/demos/admin/pricing-rules';
        const method = ruleData.id && !ruleData.id.startsWith('rule-demo-') ? 'PUT' : 'POST';

        const res = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(ruleData)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.rule) {
            return data.rule;
          }
        }
      }
    } catch (e) {
      // Fallback to mockStore
    }
    return mockStore.saveDemoPricingRule(ruleData);
  },

  async deletePricingRule(ruleId: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('fp_token') || sessionStorage.getItem('fp_token');
      if (token) {
        const res = await fetch(`/api/demos/admin/pricing-rules/${ruleId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          return true;
        }
      }
    } catch (e) {
      // Fallback to mockStore
    }
    return mockStore.deleteDemoPricingRule(ruleId);
  },

  /**
   * Admin Demo Bookings audit list
   */
  async getAllBookings(filters?: any): Promise<DemoBooking[]> {
    try {
      const token = localStorage.getItem('fp_token') || sessionStorage.getItem('fp_token');
      if (token) {
        const queryParams = new URLSearchParams(filters || {}).toString();
        const res = await fetch(`/api/demos/admin/bookings?${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.bookings)) {
            return data.bookings;
          }
        }
      }
    } catch (e) {
      // Fallback to mockStore
    }
    return mockStore.getAllDemoBookings(filters);
  }
};
