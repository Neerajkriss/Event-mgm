import { useState } from 'react';
import {
  UserCog, Mail, Phone, Building2, FileText, Save, Lock, Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';

export default function OrganizerProfilePage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    businessName: user?.name ?? '',
    email: user?.email ?? '',
    phone: '+91 98765 43210',
    bio: 'Event organizer specializing in music festivals, tech conferences, and cultural events. 10+ years of experience creating memorable experiences.',
  });
  const [saved, setSaved] = useState(false);
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    login({ ...user, name: form.businessName, email: form.email, avatar: form.businessName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.next.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError('New password and confirmation do not match.');
      return;
    }
    setPwSuccess(true);
    setTimeout(() => {
      setPwSuccess(false);
      setPwModalOpen(false);
      setPwForm({ current: '', next: '', confirm: '' });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizer Profile"
        description="Manage your business details, contact information, and account security."
        icon={<UserCog className="h-5 w-5" />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile summary card */}
        <div className="card p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-bold text-white shadow-lg">
              {form.businessName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <h2 className="mt-4 font-display text-lg font-bold text-gray-900">{form.businessName}</h2>
            <p className="mt-1 text-sm text-gray-500">Event Organizer</p>
            <span className="badge mt-3 bg-success-100 text-success-700">
              <Check className="h-3 w-3" />
              Verified Account
            </span>
          </div>
          <div className="mt-6 space-y-3 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="truncate">{form.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Phone className="h-4 w-4 text-gray-400" />
              {form.phone}
            </div>
          </div>
          <button
            onClick={() => setPwModalOpen(true)}
            className="btn-secondary mt-6 w-full"
          >
            <Lock className="h-4 w-4" />
            Change Password
          </button>
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="card space-y-5 p-6">
            <h3 className="font-display text-lg font-bold text-gray-900">Business Details</h3>

            <div>
              <label className="label" htmlFor="business-name">
                <Building2 className="mr-1 inline h-3.5 w-3.5" />
                Business Name
              </label>
              <input
                id="business-name"
                type="text"
                value={form.businessName}
                onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                className="input"
                placeholder="Your business or organization name"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="profile-email">
                  <Mail className="mr-1 inline h-3.5 w-3.5" />
                  Email Address
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="input"
                  placeholder="contact@yourcompany.com"
                />
              </div>
              <div>
                <label className="label" htmlFor="profile-phone">
                  <Phone className="mr-1 inline h-3.5 w-3.5" />
                  Phone Number
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="input"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="profile-bio">
                <FileText className="mr-1 inline h-3.5 w-3.5" />
                Bio / Description
              </label>
              <textarea
                id="profile-bio"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                rows={4}
                className="input resize-none"
                placeholder="Tell customers about your business and the types of events you organize..."
              />
              <p className="mt-1 text-xs text-gray-400">This appears on your public organizer profile.</p>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              {saved && (
                <span className="flex items-center gap-1.5 text-sm font-medium text-success-600">
                  <Check className="h-4 w-4" />
                  Profile saved successfully
                </span>
              )}
              <button type="submit" className="btn-primary">
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Change password modal */}
      <Modal
        open={pwModalOpen}
        onClose={() => setPwModalOpen(false)}
        title="Change Password"
        description="Enter your current password and choose a new one."
        size="sm"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setPwModalOpen(false)}>Cancel</button>
            <button className="btn-primary" type="submit" form="pw-form" disabled={pwSuccess}>
              {pwSuccess ? (
                <><Check className="h-4 w-4" /> Changed!</>
              ) : (
                'Update Password'
              )}
            </button>
          </>
        }
      >
        <form id="pw-form" onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="label" htmlFor="pw-current">Current Password</label>
            <input
              id="pw-current"
              type="password"
              value={pwForm.current}
              onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="pw-new">New Password</label>
            <input
              id="pw-new"
              type="password"
              value={pwForm.next}
              onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
              className="input"
              required
            />
            <p className="mt-1 text-xs text-gray-400">Minimum 8 characters.</p>
          </div>
          <div>
            <label className="label" htmlFor="pw-confirm">Confirm New Password</label>
            <input
              id="pw-confirm"
              type="password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
              className="input"
              required
            />
          </div>
          {pwError && <p className="text-sm text-error-600">{pwError}</p>}
          {pwSuccess && (
            <p className="flex items-center gap-1.5 text-sm text-success-600">
              <Check className="h-4 w-4" />
              Password updated successfully!
            </p>
          )}
        </form>
      </Modal>
    </div>
  );
}
