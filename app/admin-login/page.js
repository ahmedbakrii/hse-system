"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLogin() {
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // البحث في جدول المديرين
      const { data, error: fetchError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("username", username.trim())
        .single();

      if (fetchError || !data) {
        throw new Error("اسم المستخدم غير مسجل كمدير نظام.");
      }

      if (data.password !== password.trim()) {
        throw new Error("كلمة المرور غير صحيحة.");
      }

      // حفظ صلاحيات المدير في المتصفح
      localStorage.setItem("hse_admin_id", data.id);
      localStorage.setItem("hse_admin_name", data.full_name);
      localStorage.setItem("hse_admin_role", data.role);

      router.push("/admin"); // توجيه للوحة التحكم فوراً

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-8 border-blue-600">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-3xl mx-auto mb-4 shadow-lg">🛡️</div>
          <h1 className="text-3xl font-black text-slate-900 mb-1">بوابة الإدارة</h1>
          <p className="font-bold text-slate-500">نظام إدارة اعتمادات المشغلين (HSE)</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-700 font-bold p-3 rounded-lg mb-4 text-center border border-red-200">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block font-black text-slate-800 mb-2">اسم المستخدم</label>
            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border-2 border-slate-200 p-4 rounded-xl font-bold focus:border-blue-600 outline-none bg-slate-50 focus:bg-white transition-colors" placeholder="majd" dir="ltr" />
          </div>
          <div>
            <label className="block font-black text-slate-800 mb-2">كلمة المرور</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border-2 border-slate-200 p-4 rounded-xl font-bold focus:border-blue-600 outline-none bg-slate-50 focus:bg-white transition-colors" placeholder="••••••••" dir="ltr" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-black text-lg py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg mt-2">
            {loading ? "جاري التحقق..." : "تسجيل الدخول للوحة التحكم"}
          </button>
        </form>
      </div>
    </div>
  );
}