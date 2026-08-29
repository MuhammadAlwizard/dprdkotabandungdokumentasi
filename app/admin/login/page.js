"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError("Email atau password salah.");
      return;
    }
    router.push("/admin/dashboard");
  }

  return (
    <main className="min-h-screen bg-dprd-red flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm"
      >
        <h1 className="text-lg font-bold text-dprd-red mb-1 text-center">
          Login Admin
        </h1>
        <p className="text-xs text-gray-500 text-center mb-6">
          Dokumentasi Kegiatan DPRD Kota Bandung
        </p>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg p-2 mb-4">
            {error}
          </p>
        )}

        <label className="text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm mt-1 mb-4"
          placeholder="admin@contoh.com"
        />

        <label className="text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm mt-1 mb-6"
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-dprd-red text-white font-medium rounded-lg py-2 hover:bg-dprd-dark transition disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </main>
  );
}
