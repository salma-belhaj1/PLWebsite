import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import { LocationSelector } from '../components/LocationSelector';
import { PhoneInputWithCountry } from '../components/PhoneInputWithCountry';
import toast from 'react-hot-toast';
import { User, Mail, Calendar, Lock, LogOut, Package, Save, Shield, MapPin } from 'lucide-react';

export default function Account() {
  const { user, signOut, refreshProfile } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+216 ');
  const [birthDate, setBirthDate] = useState('');
  const [country, setCountry] = useState('Tunisia');
  const [countryCode, setCountryCode] = useState('TN');
  const [city, setCity] = useState('Tunis');
  const [stateVal, setStateVal] = useState('Tunis');
  const [address, setAddress] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '+216 ');
      setBirthDate(user.birth_date || '');
      setCountry(user.country || 'Tunisia');
      setCity(user.city || 'Tunis');
      setStateVal(user.state || 'Tunis');
      setAddress(user.address || '');
    }
  }, [user]);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setProfileSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || null,
          phone: phone.trim() || null,
          birth_date: birthDate || null,
          country: country.trim() || null,
          city: city.trim() || null,
          state: stateVal.trim() || null,
          address: address.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      toast.success(t('account.profileUpdated') || 'Profile updated successfully!');
    } catch (error: any) {
      toast.error(error?.message || t('account.updateFailed') || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error(t('auth.passwordMinLength') || 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error(t('auth.passwordsDoNotMatch') || 'Passwords do not match');
      return;
    }

    setPasswordSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      toast.success(t('account.passwordChanged') || 'Password changed successfully!');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      toast.error(error?.message || t('account.passwordUpdateFailed') || 'Failed to update password');
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      toast.success(t('account.signedOut') || 'Signed out successfully');
      navigate('/login');
    } catch (err) {
      toast.error(t('account.signOutFailed') || 'Failed to sign out');
    }
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-stone-50 text-stone-900'}`}>
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-16">
        {/* Page Title & User Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-pl-pink/20">
          <div>
            <span className="text-xs font-century uppercase tracking-widest text-pl-pink font-semibold">
              {t('account.portalSubtitle') || 'Member Portal'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-stayvibes text-pl-pink mt-1">
              {t('account.title') || 'My Account'}
            </h1>
            <p className={`text-xs font-century mt-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`}>
              {t('account.description') || 'Manage your personal information, shipping addresses, and security settings.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-century font-semibold bg-pl-pink/10 text-pl-pink border border-pl-pink/30 hover:bg-pl-pink/20 smooth-transition"
            >
              <Package className="w-4 h-4" />
              <span>{t('account.myOrders') || 'My Orders'}</span>
            </Link>
            <button
              onClick={handleSignOut}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-century font-semibold border smooth-transition ${
                theme === 'dark' ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>{t('signOut') || 'Sign Out'}</span>
            </button>
          </div>
        </div>

        {/* Account Info Pill */}
        <div className={`p-4 rounded-2xl border mb-6 flex flex-wrap items-center justify-between gap-4 ${
          theme === 'dark' ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pl-pink to-pl-red text-white flex items-center justify-center font-bold text-lg font-stayvibes">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <p className="font-stayvibes text-lg leading-tight">{user?.full_name || (t('auth.customer') || 'Customer')}</p>
              <p className={`text-xs font-century ${theme === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`}>
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase px-3 py-1 rounded-full bg-pl-pink/10 text-pl-pink font-semibold border border-pl-pink/20">
              {t('account.role') || 'Role'}: {user?.role || 'customer'}
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mb-6 border-b border-pl-pink/10 pb-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-century font-semibold smooth-transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-pl-pink text-white shadow-sm'
                : theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-stone-600 hover:text-black'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t('account.tabProfile') || 'Profile & Addresses'}</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-century font-semibold smooth-transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-pl-pink text-white shadow-sm'
                : theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-stone-600 hover:text-black'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>{t('account.tabSecurity') || 'Security & Password'}</span>
          </button>
        </div>

        {/* Tab 1: Profile & Address */}
        {activeTab === 'profile' && (
          <div className={`p-6 sm:p-8 rounded-3xl border ${
            theme === 'dark' ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <form onSubmit={handleProfileSave} className="space-y-6">
              <div>
                <h3 className="text-lg font-stayvibes text-pl-pink mb-1">
                  {t('account.personalInfoTitle') || 'Personal Information'}
                </h3>
                <p className={`text-xs font-century ${theme === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`}>
                  {t('account.personalInfoSubtitle') || 'Update your contact details and default shipping address with automatic country/state/city catalogs.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-century font-semibold mb-1.5 opacity-80">
                    {t('checkout.fullName') || 'Full Name'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl border font-century text-xs outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                        theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-stone-50 border-stone-200 text-black'
                      }`}
                    />
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-century font-semibold mb-1.5 opacity-80">
                    {t('account.emailReadOnly') || 'Email Address (Read-only)'}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl border font-century text-xs opacity-60 cursor-not-allowed ${
                        theme === 'dark' ? 'bg-zinc-800/40 border-zinc-700 text-zinc-400' : 'bg-stone-100 border-stone-200 text-stone-500'
                      }`}
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Birth Date */}
                <div>
                  <label className="block text-xs font-century font-semibold mb-1.5 opacity-80">
                    {t('form.birthDate') || 'Birth Date'}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl border font-century text-xs outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                        theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-stone-50 border-stone-200 text-black'
                      }`}
                    />
                    <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* International Phone with Country Code (+216 default) */}
                <div className="sm:col-span-2">
                  <PhoneInputWithCountry
                    value={phone}
                    onChange={setPhone}
                    defaultDialCode="+216"
                    theme={theme}
                  />
                </div>

                {/* Country, State, City Cascading Dropdowns */}
                <div className="sm:col-span-2 pt-2">
                  <LocationSelector
                    selectedCountry={countryCode || country}
                    selectedState={stateVal}
                    selectedCity={city}
                    onCountryChange={(name, code) => {
                      setCountry(name);
                      setCountryCode(code);
                    }}
                    onStateChange={(stateName) => setStateVal(stateName)}
                    onCityChange={(cityName) => setCity(cityName)}
                    theme={theme}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-century font-semibold mb-1.5 opacity-80">
                    {t('account.shippingAddress') || 'Shipping Street Address'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Avenue Habib Bourguiba"
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl border font-century text-xs outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                        theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-stone-50 border-stone-200 text-black'
                      }`}
                    />
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-pl-pink/10">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-6 py-2.5 rounded-xl font-century font-semibold text-xs bg-gradient-to-r from-pl-pink to-pl-red text-white flex items-center gap-2 shadow-md hover:shadow-pl-pink/30 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{profileSaving ? (t('account.saving') || 'Saving...') : (t('account.saveProfile') || 'Save Profile Changes')}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Security */}
        {activeTab === 'security' && (
          <div className={`p-6 sm:p-8 rounded-3xl border ${
            theme === 'dark' ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <h3 className="text-lg font-stayvibes text-pl-pink mb-1">
                  {t('account.passwordSecurityTitle') || 'Password & Security'}
                </h3>
                <p className={`text-xs font-century ${theme === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`}>
                  {t('account.passwordSecuritySubtitle') || 'Change your password to keep your account safe.'}
                </p>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-century font-semibold mb-1.5 opacity-80">
                    {t('account.newPassword') || 'New Password (Min. 6 chars)'}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl border font-century text-xs outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                        theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-stone-50 border-stone-200 text-black'
                      }`}
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-century font-semibold mb-1.5 opacity-80">
                    {t('account.confirmNewPassword') || 'Confirm New Password'}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl border font-century text-xs outline-none focus:ring-2 focus:ring-pl-pink/30 ${
                        theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-stone-50 border-stone-200 text-black'
                      }`}
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-pl-pink/10">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-6 py-2.5 rounded-xl font-century font-semibold text-xs bg-gradient-to-r from-pl-pink to-pl-red text-white flex items-center gap-2 shadow-md hover:shadow-pl-pink/30 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{passwordSaving ? (t('account.updating') || 'Updating...') : (t('account.updatePassword') || 'Update Password')}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
