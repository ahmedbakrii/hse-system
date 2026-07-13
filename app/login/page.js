"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/admin";
  
  const [username, setUsername] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // جلب المشرف بالاسم فقط أولاً للتأكد إن الجدول شغال
      const { data, error: fetchError } = await supabase
        .from("supervisors")
        .select("*")
        .eq("username", username.trim()); // trim() بتمسح أي مسافة زيادة

      if (fetchError) {
        throw new Error(`خطأ في الاتصال بقاعدة البيانات: ${fetchError.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error("اسم المستخدم غير مسجل في النظام.");
      }

      const user = data[0]; // أول يوزر يرجع

      if (user.pin_code !== pinCode.trim()) {
        throw new Error("الرمز السري غير صحيح.");
      }

      // إذا وصل هنا، يبقى الدخول ناجح 100%
      localStorage.setItem("hse_sup_id", user.id);
      localStorage.setItem("hse_sup_name", user.full_name);
      localStorage.setItem("hse_sup_label", user.role_label || "مشرف سلامة");

      router.push(redirectUrl);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-2 border-slate-800">
        <h1 className="text-3xl font-black mb-2 text-slate-900 text-center">بوابة المشرفين</h1>
        <p className="mb-6 font-bold text-gray-500 text-center">قم بتسجيل الدخول لتتمكن من تسجيل المخالفات</p>
        
        {/* هنا هيظهر لك السبب الحقيقي للخطأ */}
        {error && <div className="bg-red-100 text-red-800 font-bold p-3 rounded mb-4 text-center border border-red-300">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-black text-slate-800 mb-1">اسم المستخدم (Username)</label>
            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border-2 border-slate-300 p-3 rounded-lg font-bold focus:border-slate-800 outline-none" placeholder="مثال: ahmed" />
          </div>
          <div>
            <label className="block font-black text-slate-800 mb-1">الرمز السري (PIN)</label>
            <input type="password" required value={pinCode} onChange={(e) => setPinCode(e.target.value)} className="w-full border-2 border-slate-300 p-3 rounded-lg font-bold focus:border-slate-800 outline-none" placeholder="****" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-slate-800 text-white font-black py-4 rounded-lg hover:bg-slate-900 mt-4 transition-colors">
            {loading ? "جاري التحقق..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}