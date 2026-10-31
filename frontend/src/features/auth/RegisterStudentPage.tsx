import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { BrandLogo } from '../../components/common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CascadingLocationSelector } from '../../components/common/CascadingLocationSelector';

export const RegisterStudentPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    dob: '',
    gender: 'Male',
    countryId: 'loc-country-in',
    stateId: '',
    stateName: '',
    districtId: '',
    districtName: '',
    localityId: '',
    localityName: '',
    areaId: '',
    areaName: '',
    city: '',
    area: '',
    address: '',
    pincode: '',
    termsAccepted: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  const { registerStudent } = useAuth();

  const handleChange = (field: string, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (!formData.termsAccepted) {
      showToast('Please accept the terms & conditions to proceed', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const ok = await registerStudent(formData);
      if (ok) {
        const storedDestination = sessionStorage.getItem('fp_intended_destination');
        if (storedDestination) {
          sessionStorage.removeItem('fp_intended_destination');
          navigate(storedDestination);
        } else {
          navigate('/student');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <BrandLogo variant="primary" size="md" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950">Student Registration</h1>
        <p className="text-xs text-slate-600">
          Create your free student account to find verified 1-on-1 home tutors and reserve study library desks.
        </p>
      </div>

      <Card className="p-6 sm:p-8 bg-white border-slate-200 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Student Full Name"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Aryan Singh"
            />
            <Input
              label="WhatsApp Mobile Number"
              type="tel"
              required
              value={formData.mobile}
              onChange={(e) => handleChange('mobile', e.target.value)}
              placeholder="10-digit mobile number"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="student@example.com"
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="••••••••"
            />
            <Input
              label="Confirm Password"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Pan-India Residential Location *
            </h3>
            <CascadingLocationSelector
              value={{
                countryId: formData.countryId,
                stateId: formData.stateId,
                stateName: formData.stateName,
                districtId: formData.districtId,
                districtName: formData.districtName,
                localityId: formData.localityId,
                localityName: formData.localityName,
                areaId: formData.areaId,
                areaName: formData.areaName,
              }}
              pincode={formData.pincode}
              onPincodeChange={(pin) => handleChange('pincode', pin)}
              showPincodeAutofill={true}
              onChange={(sel) => {
                setFormData(prev => ({
                  ...prev,
                  countryId: sel.countryId || 'loc-country-in',
                  stateId: sel.stateId || '',
                  stateName: sel.stateName || '',
                  districtId: sel.districtId || '',
                  districtName: sel.districtName || '',
                  localityId: sel.localityId || '',
                  localityName: sel.localityName || '',
                  city: sel.localityName || prev.city,
                  areaId: sel.areaId || '',
                  areaName: sel.areaName || '',
                  area: sel.areaName || sel.localityName || prev.area,
                }));
              }}
              mode="stacked"
              required={true}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Complete Residential Address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="House / Street / Landmark"
              />
            </div>
            <Input
              label="Pincode"
              value={formData.pincode}
              onChange={(e) => handleChange('pincode', e.target.value)}
              placeholder="233304"
            />
          </div>

          <div className="pt-2 flex items-start gap-2.5 text-xs text-slate-600">
            <input
              type="checkbox"
              id="terms"
              checked={formData.termsAccepted}
              onChange={(e) => handleChange('termsAccepted', e.target.checked)}
              className="mt-0.5 rounded bg-white border-slate-300 text-brand-600 accent-brand-600"
            />
            <label htmlFor="terms" className="leading-snug">
              I accept the ZYZU'S Terms of Service and Privacy Policy. I acknowledge that home tutor assignments are reviewed and confirmed by the District Administration.
            </label>
          </div>

          <Button type="submit" size="lg" className="w-full mt-4" isLoading={isLoading}>
            Complete Free Registration
          </Button>
        </form>

        <div className="text-center pt-6 text-xs text-slate-600 border-t border-slate-200 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </Card>
    </div>
  );
};
