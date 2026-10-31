import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { superAdminService } from '../../services/superAdminService';
import { District } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Globe, Plus, MapPin, ShieldCheck, Users } from 'lucide-react';

export const SuperAdminDistricts: React.FC = () => {
  const { addToast } = useToast();
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);

  // Add District Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [areas, setAreas] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const data = await superAdminService.getDistricts();
        setDistricts(data);
      } catch (err) {
        console.error('Failed to load districts', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
  }, []);

  const handleAddDistrict = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      const newD: District = {
        id: `dist-${Date.now()}`,
        name,
        code: code.toUpperCase(),
        state: 'Uttar Pradesh',
        adminName: undefined,
        totalTeachers: 0,
        totalLibraries: 0,
        totalBookings: 0,
      };
      setDistricts(prev => [...prev, newD]);
      setIsModalOpen(false);
      setName('');
      setCode('');
      setAreas('');
      setSubmitting(false);
      addToast(`District ${name} initialized. Assign an authorized administrator to activate operations.`, 'success');
    }, 600);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Districts & Operational Territories"
        subtitle="Manage territorial boundaries, regional expansion, and active jurisdiction coverage"
        breadcrumbs={[
          { label: 'Super Admin', href: '/super-admin' },
          { label: 'Districts' }
        ]}
        actions={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            Add New District
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {districts.map(d => (
          <Card key={d.id} className="p-6 border border-slate-700/80 hover:border-royal-blue-500/50 hover:shadow-lg transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-royal-blue-300 transition-colors">{d.name}</h3>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    CODE: {d.code || 'UP'}
                  </span>
                </div>
                <StatusBadge status={d.adminName ? 'verified' : 'pending'} text={d.adminName ? 'Operational' : 'No Admin'} />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Authorized Admin:</span>
                  <span className="font-bold text-white">{d.adminName || 'Pending Appointment'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Verified Teachers:</span>
                  <span className="font-semibold text-slate-200">{d.totalTeachers || 18}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Study Libraries:</span>
                  <span className="font-semibold text-slate-200">{d.totalLibraries || 4}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-700/70 flex items-center justify-between text-xs text-slate-400">
              <span>Territory: Uttar Pradesh</span>
              <span className="text-royal-blue-400 font-semibold">1 Admin Enforced</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Add District Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Initialize New District"
        size="md"
      >
        <form onSubmit={handleAddDistrict} className="space-y-4">
          <Input
            label="District Name"
            placeholder="e.g. Prayagraj"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="District Short Code"
            placeholder="e.g. PRY"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <Input
            label="Key Localities / Hubs (comma-separated)"
            placeholder="e.g. Civil Lines, Katra, Georgetown"
            value={areas}
            onChange={(e) => setAreas(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Create District
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
