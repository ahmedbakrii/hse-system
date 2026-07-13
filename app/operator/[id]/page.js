"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function OperatorProfile({ params }) {
  const unwrappedParams = use(params);
  const certId = unwrappedParams.id;
  const pathname = usePathname();
  
  const [operator, setOperator] = useState(null);
  const [history, setHistory] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [supervisorName, setSupervisorName] = useState("");
  
  const [violationDetails, setViolationDetails] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // التحقق هل الزائر ده مشرف سلامة ولا لأ؟
    const supId = localStorage.getItem("hse_sup_id");
    const supName = localStorage.getItem("hse_sup_name");
    if (supId && supName) {
      setIsSupervisor(true);
      setSupervisorName(supName);
    }

    async function fetchData() {
      // 1. جلب بيانات الموظف الأساسية
      const { data: opData } = await supabase.from("operators").select("*").eq("cert_id", certId).single();
      if (opData) {
        setOperator(opData);
        // تغيير اسم التاب لاسم المشغل تلقائياً 👑
        document.title = `${opData.full_name} | تصريح العمل`;
      }

      // 2. جلب السجل التاريخي للمخالفات
      const { data: histData } = await supabase.from("operator_history").select("*").eq("cert_id", certId).order("id", { ascending: false });
      if (histData) setHistory(histData);
      
      setLoading(false);
    }
    fetchData();
  }, [certId]);

  const handleSupervisorAction = async (actionType) => {
    if (!violationDetails) return alert("برجاء كتابة تفاصيل المخالفة أولاً.");
    setActionLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const finalDetails = `${violationDetails} (بواسطة: ${supervisorName})`;

    // تسجيل المخالفة في جدول السجل التاريخي
    await supabase.from("operator_history").insert([{
      cert_id: certId, action_type: actionType, action_date: today, details: finalDetails
    }]);

    // تحديث حالة الموظف الأساسية
    let updates = { violations_record: finalDetails };
    if (actionType === "إيقاف مؤقت") updates.status = "Suspended";

    await supabase.from("operators").update(updates).eq("cert_id", certId);
    
    alert("تم تسجيل الإجراء بنجاح.");
    setViolationDetails("");
    
    // إعادة تحميل البيانات عشان تظهر المخالفة الجديدة فوراً
    const { data: histData } = await supabase.from("operator_history").select("*").eq("cert_id", certId).order("id", { ascending: false });
    if (histData) setHistory(histData);
    
    const { data: opData } = await supabase.from("operators").select("*").eq("cert_id", certId).single();
    if (opData) setOperator(opData);
    
    setActionLoading(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-black text-2xl">جاري التحقق... ⏳</div>;
  if (!operator) return <div className="flex h-screen items-center justify-center font-black text-2xl text-red-600">❌ المشغل غير موجود</div>;

  const isValid = operator.status === "Valid" && operator.expiry_date >= new Date().toISOString().split('T')[0];
  const violationsCount = history.length;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between" dir="rtl">
      <div>
        {/* الشريط العلوي للحالة */}
        <div className={`w-full py-6 text-center text-white shadow-md relative ${isValid ? "bg-green-600" : "bg-red-700"}`}>
          <h1 className="text-3xl font-black">{isValid ? "مصرح بالعمل ✔️" : "غير مصرح (موقوف/منتهي) ❌"}</h1>
        </div>

        <div className="max-w-md mx-auto mt-6 px-4 space-y-6">
          
          {/* كارت بيانات المشغل */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
            <img src={operator.photo_url} alt="Profile" className="w-32 h-32 mx-auto rounded-full border-4 border-gray-100 object-cover shadow-sm mb-4" />
            <h2 className="text-2xl font-black text-center text-black mb-1">{operator.full_name}</h2>
            <p className="text-center text-lg font-black text-blue-800 mb-6">{operator.cert_id}</p>
            
            <div className="space-y-4 text-sm font-bold text-gray-800">
              <div className="flex justify-between border-b pb-2"><span>الوظيفة:</span><span>{operator.job_title}</span></div>
              <div className="flex justify-between border-b pb-2"><span>القسم:</span><span>{operator.department}</span></div>
              <div className="flex justify-between border-b pb-2"><span>رقم الإقامة:</span><span>{operator.iqama_number}</span></div>
              <div className="flex justify-between border-b pb-2">
                <span>تاريخ الانتهاء:</span>
                <span className={`font-black ${isValid ? 'text-gray-900' : 'text-red-600'}`} dir="ltr">{operator.expiry_date}</span>
              </div>
            </div>
          </div>

          {/* ================= قسم السجل والمخالفات ================= */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border-2 border-slate-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
              <h3 className="text-lg font-black text-slate-800">سجل المخالفات</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-black ${violationsCount > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                العدد: {violationsCount}
              </span>
            </div>
            
            {violationsCount === 0 ? (
              <div className="text-center text-green-600 font-bold py-4">سجل نظيف ✔️ لا توجد مخالفات مسجلة.</div>
            ) : (
              <div className="space-y-3">
                {history.map((record) => (
                  <div key={record.id} className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black text-red-800 bg-red-200 px-2 py-0.5 rounded text-xs">{record.action_type}</span>
                      <span className="font-bold text-gray-500 text-xs" dir="ltr">{record.action_date}</span>
                    </div>
                    <p className="text-gray-800 font-bold leading-relaxed">{record.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================= لوحة المشرف (تظهر للمشرفين فقط) ================= */}
          {isSupervisor ? (
            <div className="bg-slate-800 rounded-2xl shadow-lg p-6 text-white border-2 border-slate-900">
              <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
                 <div>
                    <h3 className="text-lg font-black flex items-center gap-2">🛡️ إضافة مخالفة جديدة</h3>
                    <p className="text-xs text-green-400 mt-1 font-bold">بواسطة: {supervisorName}</p>
                 </div>
              </div>
              <textarea 
                className="w-full bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg p-3 font-bold mb-4 focus:outline-none focus:border-blue-500" 
                rows="3" 
                placeholder="اكتب تفاصيل المخالفة..." 
                value={violationDetails} 
                onChange={(e) => setViolationDetails(e.target.value)}
              ></textarea>
              <div className="flex gap-3">
                <button onClick={() => handleSupervisorAction("مخالفة سلامة")} disabled={actionLoading} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-black py-3 rounded-lg transition-colors">تسجيل إنذار</button>
                <button onClick={() => handleSupervisorAction("إيقاف مؤقت")} disabled={actionLoading} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-lg transition-colors">إيقاف الرخصة</button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200 text-center">
               <p className="text-sm font-bold text-gray-600 mb-3">هل أنت مشرف سلامة؟</p>
               <Link href={`/login?redirect=${pathname}`} className="bg-slate-800 text-white font-black px-6 py-2 rounded-lg inline-block hover:bg-slate-900 transition-colors">تسجيل دخول كـ مشرف</Link>
            </div>
          )}
        </div>
      </div>

      {/* ================= فوتر Justtap ================= */}
      <footer className="w-full py-6 text-center mt-8">
        <a href="https://www.linkedin.com/in/YOUR_LINKEDIN_PROFILE" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group">
          <span className="text-xs font-bold uppercase tracking-widest">Powered by</span>
          <span className="text-lg font-black tracking-tight group-hover:scale-105 transition-transform text-slate-800">Justtap</span>
        </a>
      </footer>
    </div>
  );
}
