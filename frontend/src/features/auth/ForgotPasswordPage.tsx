import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { BrandLogo } from '../../components/common/BrandLogo';
import { useToast } from '../../context/ToastContext';

export const ForgotPasswordPage: React.FC = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email', 'warning');
      return;
    }
    setSent(true);
    showToast('Password reset link sent to your email.', 'success');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <BrandLogo variant="primary" size="md" />
          </div>
          <h1 className="text-2xl font-black text-slate-950">Reset Password</h1>
          <p className="text-xs text-slate-600">
            Enter your registered email address to receive password reset instructions.
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-white border-slate-200 shadow-xl">
          {sent ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-base text-slate-950">Reset Link Sent</h3>
              <p className="text-xs text-slate-600">
                We have sent an authentication recovery link to <strong className="text-slate-900">{email}</strong>.
              </p>
              <Link to="/reset-password">
                <Button size="sm">Enter Reset Code</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
              />
              <Button type="submit" size="md" className="w-full">
                Send Recovery Instructions
              </Button>
            </form>
          )}

          <div className="pt-6 border-t border-slate-200 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-brand-600 font-semibold transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const ResetPasswordPage: React.FC = () => {
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [completed, setCompleted] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setCompleted(true);
    showToast('Password updated successfully! Please sign in.', 'success');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-slate-950">Set New Password</h1>
          <p className="text-xs text-slate-600">Enter the verification code and set your new account password.</p>
        </div>

        <Card className="p-6 sm:p-8 bg-white border-slate-200 shadow-xl">
          {completed ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-base text-slate-950">Password Updated</h3>
              <p className="text-xs text-slate-600">You can now sign in using your new password.</p>
              <Link to="/login">
                <Button size="md">Proceed to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <Input
                label="Verification Code (from Email)"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 953645"
              />
              <Input
                label="New Password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Input
                label="Confirm New Password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Button type="submit" size="md" className="w-full">
                Save New Password
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
