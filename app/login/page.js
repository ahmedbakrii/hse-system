"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// 1. المكون اللي فيه الفورم وبيستخدم useSearchParams
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. هنجيب اليوزر بس من غير الباسورد عشان نعرف هو موجود أصلاً ولا لأ
      const { data: supervisorData, error: fetchError } = await supabase
        .from("supervisors")
        .select("*")
        .eq("username", username);

      // لو فيه خطأ في الاتصال بقاعدة البيانات
      if (fetchError) {
        setError(`خطأ من الداتابيز: ${fetchError.message}`);
        setLoading(false);
        return;
      }

      // 2. هل اليوزر ده موجود في جدول المشرفين؟
      if (!supervisorData || supervisorData.length === 0) {
        setError("اليوزر ده مش موجود في المشرفين! (هل ده حساب مدير؟ جرب بوابة الإدارة) ❌");
        setLoading(false);
        return;
      }

      // 3. اليوزر موجود، تعالوا نقارن الباسورد بقى
      const foundUser = supervisorData[0];
      
      // هنحولهم لنصوص ونشيل المسافات عشان لو فيه مسافة منسية
      const dbPassword = String(foundUser.password).trim();
      const enteredPassword = String(password).trim();

      if (dbPassword !== enteredPassword) {
        // الأمانة العلمية: هنفضح الداتابيز ونعرض الباسورد اللي جواها عشان نعرف الفرق
        setError(`الباسورد غلط! (المتخزن في الداتابيز هو: ${dbPassword}) ❌`);
        setLoading(false);
        return;
      }

      // 4. لو كله متطابق وتمام التمام
      localStorage.setItem("hse_sup_id", foundUser.id);
      localStorage.setItem("hse_sup_name", foundUser.name);
      localStorage.setItem("hse_sup_label", foundUser.label || "مشرف سلامة");

      const redirectUrl = searchParams.get("redirect") || "/supervisor";
      router.push(redirectUrl);

    } catch (err) {
      setError(`خطأ غير متوقع: ${err.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-slate-50 p-8 rounded-3xl shadow-2xl w-full max-w-md border-4 border-slate-200">
        
        {/* هيدر الفورم */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl shadow-lg shadow-green-600/30">🛡️</div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">بوابة المشرفين</h1>
          <p className="text-slate-500 font-bold mt-2">تسجيل الدخول للعمليات الميدانية</p>
        </div>

        {/* رسالة الخطأ */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl font-black text-sm mb-6 text-center border-2 border-red-200 animate-pulse">
            {error}
          </div>
        )}

        {/* فورم الدخول */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2">اسم المستخدم</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white border-2 border-slate-300 p-4 rounded-xl focus:outline-none focus:border-green-600 font-bold text-slate-800 shadow-inner transition-colors"
              placeholder="اكتب اسم المستخدم هنا..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2">كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border-2 border-slate-300 p-4 rounded-xl focus:outline-none focus:border-green-600 font-bold text-slate-800 shadow-inner transition-colors"
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-green-600/30 mt-2 text-lg"
          >
            {loading ? "جاري التحقق... ⏳" : "تسجيل الدخول"}
          </button>
        </form>
        
        {/* زر العودة */}
        <div className="mt-8 text-center border-t-2 border-slate-200 pt-6">
          <Link href="/" className="text-sm font-black text-slate-400 hover:text-slate-800 transition-colors">
            العودة للصفحة الرئيسية
          </Link>
        </div>

      </div>
    </div>
  );
}

// 2. الصفحة الرئيسية بتعمل Wrap للـ LoginForm جوه Suspense عشان Vercel
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center font-black text-2xl bg-slate-900 text-white">
        جاري تهيئة البوابة... ⏳
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
