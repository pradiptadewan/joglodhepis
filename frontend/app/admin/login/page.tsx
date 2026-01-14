"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Loader2, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import { API_URL } from '@/lib/config';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Request Login ke Backend
      const res = await fetch(`${API_URL}/api/auth/login/`, { // Sesuaikan endpoint login Anda
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Login gagal. Cek email/password.");
      }

      const token = data.access; // Asumsi response { access: "...", refresh: "..." }

      // 2. VERIFIKASI: Cek apakah user ini benar-benar Admin?
      // Kita coba hit endpoint admin dummy atau list orders.
      // Jika 403 Forbidden, berarti dia user biasa, tolak loginnya di sini.
      const checkAdmin = await fetch(`${API_URL}/api/admin/orders/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (checkAdmin.status === 403) {
        throw new Error("Akun Anda tidak memiliki akses Admin.");
      }

      // 3. Simpan Token dengan Key KHUSUS (Agar tidak menimpa login user biasa)
      localStorage.setItem('adminAccessToken', token);
      
      toast.success("Login Admin Berhasil");
      
      // Redirect ke Dashboard
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1000);

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-[#2D2D2D] p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#BFA06D]/20 text-[#BFA06D] mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">Joglo Dhepis Admin</h1>
          <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest">Restricted Access Only</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email / Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#BFA06D] focus:ring-1 focus:ring-[#BFA06D] outline-none transition-all text-sm"
                  placeholder="admin@joglodhepis.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#BFA06D] focus:ring-1 focus:ring-[#BFA06D] outline-none transition-all text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2D2D2D] hover:bg-black text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Access Dashboard"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <button 
                onClick={() => router.push('/')}
                className="text-xs text-gray-400 hover:text-[#BFA06D] transition-colors flex items-center justify-center gap-1 mx-auto"
            >
                ← Back to Main Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}