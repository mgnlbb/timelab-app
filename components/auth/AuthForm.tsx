"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
//import Image from 'next/image'

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (data.session) {
        router.push("/profile-setup");
        router.refresh();
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) {
          setError(loginError.message);
          setLoading(false);
          return;
        }
        router.push("/profile-setup");
        router.refresh();
      }
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          "linear-gradient(135deg, #0d3d5e 0%, #1a8fd1 60%, #2ec866 100%)",
      }}
    >
      {/* Panel kiri — branding */}
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 px-12">
        <img
          src="/logo.png"
          alt="TimeLab"
          width={240}
          height={68}
          className="brightness-0 invert mb-6"
          loading="eager"
        />
        <p className="text-white/80 text-lg text-center max-w-xs leading-relaxed">
          Pengisian Timesheet Bulanan Mudah
        </p>
        <div className="mt-10 grid grid-cols-3 gap-4 w-full max-w-xs">
          {[
            { label: "Auto Save", desc: "Data tersimpan otomatis" },
            { label: "Export PDF", desc: "Generate timesheet PDF" },
            { label: "Multi Bulan", desc: "Kelola semua bulan" },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-white/10 rounded-xl p-3 text-center"
            >
              <div className="text-white text-xs font-semibold">{f.label}</div>
              <div className="text-white/60 text-[10px] mt-1">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel kanan — form */}
      <div className="flex flex-col justify-center items-center flex-1 px-6 py-12">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          {/* Logo di mobile */}
          <div className="flex justify-center mb-6 lg:hidden">
            <img
              src="/logo.png"
              alt="TimeLab"
              width={160}
              height={45}
              loading="eager"
            />
          </div>

          <h2 className="text-xl font-bold text-[#0d3d5e] mb-1">
            {isLogin ? "Selamat datang!" : "Buat akun baru"}
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            {isLogin
              ? "Masuk ke akun TimeLab kamu"
              : "Daftar dan mulai kelola timesheet"}
          </p>

          {/* Toggle */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            {["Login", "Daftar"].map((label, i) => (
              <button
                key={label}
                onClick={() => {
                  setIsLogin(i === 0);
                  setError("");
                }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  (i === 0) === isLogin
                    ? "bg-white shadow text-[#0d3d5e]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full border border-gray-200 text-black rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a8fd1] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                className="w-full border border-gray-200 text-black rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a8fd1] transition"
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white rounded-lg py-2.5 text-sm font-semibold transition-all disabled:opacity-50 hover:opacity-90"
              style={{ background: "linear-gradient(90deg, #0d3d5e, #1a8fd1)" }}
            >
              {loading ? "Memproses..." : isLogin ? "Masuk" : "Buat Akun"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
