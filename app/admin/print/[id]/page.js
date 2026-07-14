"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";

export default function PrintCard({ params }) {
  const unwrappedParams = use(params);
  const certId = unwrappedParams.id;
  const [operator, setOperator] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from("operators").select("*").eq("cert_id", certId).single();
      if (data) setOperator(data);
      setLoading(false);
    }
    fetchData();
  }, [certId]);

  if (loading) return <div className="flex h-screen items-center justify-center font-black text-2xl">جاري تجهيز الكارت... ⏳</div>;
  if (!operator) return <div className="flex h-screen items-center justify-center font-black text-2xl text-red-600">❌ المشغل غير موجود</div>;

  // دالة لتحديد اللون، الأيقونة الشفافة، والمسمى بناءً على الوظيفة
  const getEquipmentConfig = (jobTitle) => {
    const title = (jobTitle || "").toLowerCase();
    
    // 1. الونش العلوي (أزرق)
    if (title.includes("علوية") || title.includes("overhead")) {
      return { 
        color: "bg-blue-600", 
        textColor: "text-blue-500",
        label: "OVERHEAD CRANE OPERATOR",
        // أيقونة ونش علوي (مسار SVG)
        svgPath: "M4 4h16v4h-2v12h-2V8H8v12H6V8H4V4zm6 4h4v4h-4V8z"
      };
    } 
    // 2. الفوركليفت (برتقالي)
    else if (title.includes("فوركليفت") || title.includes("شوكة") || title.includes("forklift")) {
      return { 
        color: "bg-orange-500", 
        textColor: "text-orange-500",
        label: "FORKLIFT OPERATOR",
        // أيقونة فوركليفت (مسار SVG)
        svgPath: "M7 15h2v-4h4v4h2v-6H7V3H5v14H3v2h4v-4zm6-2v-2h-4v2h4zm-4-8h4v2H9V5zm10 12h2v-2h-2v2zm-2 2h4v2h-4v-2z"
      };
    } 
    // 3. الموبايل كرين (أحمر)
    else if (title.includes("موبايل") || title.includes("mobile") || title.includes("ونش متحرك")) {
      return { 
        color: "bg-red-600", 
        textColor: "text-red-500",
        label: "MOBILE CRANE OPERATOR",
        // أيقونة موبايل كرين (مسار SVG)
        svgPath: "M19 8l-6-4v2H5v6H3v6h2v-2h14v2h2v-6h-2V8zm-2 2v2h-2v-2h2zm-4 0v2h-2v-2h2zm-4 0v2H7v-2h2zm10 6H5v-2h14v2z"
      };
    }
    
    // افتراضي لأي معدة أخرى (رمادي)
    return { 
      color: "bg-gray-500", 
      textColor: "text-gray-400",
      label: "EQUIPMENT OPERATOR",
      svgPath: "M12 2L2 22h20L12 2zm0 4l6.5 13h-13L12 6z"
    };
  };

  const config = getEquipmentConfig(operator.job_title);

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center py-10 print:bg-white print:py-0">
      
      {/* زر الطباعة (يختفي عند الطباعة) */}
      <button 
        onClick={() => window.print()} 
        className="mb-8 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-8 rounded-lg shadow-lg print:hidden transition-colors"
      >
        🖨️ طباعة الكارت
      </button>

      {/* حاوية الكروت للطباعة */}
      <div className="flex flex-col gap-8 print:gap-0">
        
        {/* ==================== الوجه الأمامي ==================== */}
        <div className="card-container relative w-[54mm] h-[86mm] bg-[#0a0a0a] rounded-xl overflow-hidden shadow-2xl print:shadow-none print:break-after-page" dir="ltr">
          
          {/* الشريط الجانبي الملون */}
          <div className={`absolute left-0 top-0 bottom-0 w-[6px] ${config.color} z-20`}></div>

          {/* الأيقونة الشفافة الكبيرة في الخلفية (Opacity 5%) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 z-0 pointer-events-none">
            <svg viewBox="0 0 24 24" fill="white" className="w-48 h-48">
              <path d={config.svgPath} />
            </svg>
          </div>

          {/* محتوى الوجه الأمامي */}
          <div className="relative z-10 w-full h-full flex flex-col items-center pt-6 pb-4 px-4">
            
            {/* شعار المصنع واسمه */}
            <div className="flex flex-col items-center mb-5">
              {/* استبدل src بمسار لوجو المصنع الحقيقي */}
              <div className="w-10 h-10 mb-1 rounded flex items-center justify-center overflow-hidden bg-white/10 p-1">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => e.target.src = 'https://via.placeholder.com/50'} />
              </div>
              <h2 className="text-[7.5px] font-black tracking-[0.2em] text-white text-center leading-tight uppercase">
                ENERGYA<br/>STEEL SOLUTIONS
              </h2>
            </div>

            {/* صورة المشغل */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-slate-800 mb-4 shadow-lg">
              <img src={operator.photo_url} alt={operator.full_name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
            </div>

            {/* اسم المشغل */}
            <h1 className="text-base font-black text-white text-center mb-auto" dir="rtl">
              {operator.full_name}
            </h1>

            {/* نوع المعدة */}
            <div className="mt-auto w-full text-center border-t border-slate-800 pt-3">
              <p className={`text-[9px] font-black tracking-widest ${config.textColor} uppercase`}>
                {config.label}
              </p>
            </div>
          </div>
        </div>

        {/* ==================== ظهر الكارت ==================== */}
        <div className="card-container relative w-[54mm] h-[86mm] bg-[#0a0a0a] rounded-xl overflow-hidden shadow-2xl print:shadow-none" dir="ltr">
          
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
            
            {/* شعار NFC */}
            <div className="mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M6 4c3.5-2 8.5-2 12 0" />
                <path d="M4 9c4.5-3 11.5-3 16 0" />
                <path d="M2 14c6.5-4 15.5-4 22 0" />
              </svg>
            </div>
            
            {/* نص التوجيه */}
            <p className="text-[10px] font-bold tracking-widest text-gray-300 mb-6 uppercase">
              Tap Your Phone
            </p>

            {/* QR Code (يتم توليده تلقائياً برقم الشهادة) */}
            <div className="bg-white p-2 rounded-lg mb-8 shadow-lg">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://bakrii-hse-system.vercel.app/operator/${operator.cert_id}`} 
                alt="QR Code" 
                className="w-20 h-20"
              />
            </div>

            {/* Logo المصنع الصغير في الأسفل */}
            <div className="mt-auto opacity-40 flex items-center justify-center">
              <h2 className="text-[6px] font-black tracking-[0.2em] text-white text-center leading-tight uppercase">
                ENERGYA<br/>STEEL SOLUTIONS
              </h2>
            </div>
          </div>
        </div>

      </div>

      {/* CSS مخصص لضبط الطباعة */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { 
            background: white !important; 
            margin: 0; 
            padding: 0; 
            display: flex;
            justify-content: center;
          }
          .card-container {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            page-break-inside: avoid;
            margin-bottom: 20px;
          }
        }
      `}} />
    </div>
  );
}
