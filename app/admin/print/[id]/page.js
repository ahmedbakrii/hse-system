"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import { toJpeg } from "html-to-image";

export default function PrintCard({ params }) {
  const unwrappedParams = use(params);
  const certId = unwrappedParams.id;
  const [operator, setOperator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from("operators").select("*").eq("cert_id", certId).single();
      if (data) {
        setOperator(data);
        document.title = `طباعة كارت | ${data.full_name}`;
      }
      setLoading(false);
    }
    fetchData();
  }, [certId]);

  if (loading) return <div className="flex h-screen items-center justify-center font-black text-2xl bg-slate-50">جاري تجهيز الكارت... ⏳</div>;
  if (!operator) return <div className="flex h-screen items-center justify-center font-black text-2xl text-red-600 bg-slate-50">❌ المشغل غير موجود</div>;

  const getEquipmentConfig = (jobTitle) => {
    const title = (jobTitle || "").toLowerCase();
    
    if (title.includes("علوية") || title.includes("overhead")) {
      return { 
        color: "bg-blue-600", 
        textColor: "text-blue-700",
        label: "OVERHEAD CRANE OPERATOR",
        svgPath: "M4 4h16v4h-2v12h-2V8H8v12H6V8H4V4zm6 4h4v4h-4V8z"
      };
    } 
    else if (title.includes("فوركليفت") || title.includes("شوكة") || title.includes("forklift")) {
      return { 
        color: "bg-orange-500", 
        textColor: "text-orange-600",
        label: "FORKLIFT OPERATOR",
        svgPath: "M7 15h2v-4h4v4h2v-6H7V3H5v14H3v2h4v-4zm6-2v-2h-4v2h4zm-4-8h4v2H9V5zm10 12h2v-2h-2v2zm-2 2h4v2h-4v-2z"
      };
    } 
    else if (title.includes("موبايل") || title.includes("mobile") || title.includes("ونش متحرك")) {
      return { 
        color: "bg-red-600", 
        textColor: "text-red-700",
        label: "MOBILE CRANE OPERATOR",
        svgPath: "M19 8l-6-4v2H5v6H3v6h2v-2h14v2h2v-6h-2V8zm-2 2v2h-2v-2h2zm-4 0v2h-2v-2h2zm-4 0v2H7v-2h2zm10 6H5v-2h14v2z"
      };
    }
    
    return { 
      color: "bg-gray-500", 
      textColor: "text-gray-600",
      label: "EQUIPMENT OPERATOR",
      svgPath: "M12 2L2 22h20L12 2zm0 4l6.5 13h-13L12 6z"
    };
  };

  const config = getEquipmentConfig(operator.job_title);

  // دالة تحميل الكارت كصورتين JPG باستخدام المكتبة الجديدة
  const handleDownloadJPG = async () => {
    setIsDownloading(true);
    try {
      const frontCard = document.getElementById("front-card");
      const backCard = document.getElementById("back-card");

      // إعدادات جودة الصورة للطباعة (تكبير البيكسل 3 مرات لجودة ممتازة)
      const options = { quality: 1, backgroundColor: "#ffffff", pixelRatio: 3 };

      if (frontCard) {
        const dataUrlFront = await toJpeg(frontCard, options);
        const linkFront = document.createElement("a");
        linkFront.download = `Front_Card_${operator.full_name}.jpg`;
        linkFront.href = dataUrlFront;
        linkFront.click();
      }

      if (backCard) {
        const dataUrlBack = await toJpeg(backCard, options);
        const linkBack = document.createElement("a");
        linkBack.download = `Back_Card_${operator.full_name}.jpg`;
        linkBack.href = dataUrlBack;
        linkBack.click();
      }
    } catch (error) {
      console.error("Error generating images:", error);
      alert("حدث خطأ أثناء تحميل الكارت.");
    }
    setIsDownloading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10">
      
      {/* زر التحميل */}
      <button 
        onClick={handleDownloadJPG} 
        disabled={isDownloading}
        className="mb-8 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-3 px-8 rounded-lg shadow-lg transition-colors flex items-center gap-2"
      >
        {isDownloading ? "جاري تحويل الكارت لصور... ⏳" : "📥 تحميل الكارت (وش وضهر JPG)"}
      </button>

      {/* حاوية الكروت */}
      <div className="flex flex-col gap-8">
        
        {/* ==================== الوجه الأمامي ==================== */}
        <div id="front-card" className="relative w-[54mm] h-[86mm] bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200" dir="ltr">
          
          {/* الشريط الجانبي الملون */}
          <div className={`absolute left-0 top-0 bottom-0 w-[6px] ${config.color} z-20`}></div>

          {/* الأيقونة الشفافة الكبيرة في الخلفية */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] z-0 pointer-events-none">
            <svg viewBox="0 0 24 24" fill="black" className="w-48 h-48">
              <path d={config.svgPath} />
            </svg>
          </div>

          {/* محتوى الوجه الأمامي */}
          <div className="relative z-10 w-full h-full flex flex-col items-center pt-6 pb-4 px-4">
            
            {/* شعار المصنع واسمه */}
            <div className="flex flex-col items-center mb-5">
              <div className="w-14 h-14 mb-1 flex items-center justify-center">
                <img src="/energya-logo.png" alt="Energya Logo" className="w-full h-full object-contain" onError={(e) => e.target.src = 'https://via.placeholder.com/80?text=LOGO'} />
              </div>
              <h2 className="text-[8px] font-black tracking-[0.15em] text-slate-900 text-center leading-tight uppercase mt-1">
                ENERGYA<br/>STEEL SOLUTIONS
              </h2>
            </div>

            {/* صورة المشغل */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-white shadow-md mb-4 bg-gray-100 ring-2 ring-gray-100">
              <img src={operator.photo_url} alt={operator.full_name} className="w-full h-full object-cover" />
            </div>

            {/* اسم المشغل */}
            <h1 className="text-base font-black text-slate-900 text-center mb-auto" dir="rtl">
              {operator.full_name}
            </h1>

            {/* نوع المعدة */}
            <div className="mt-auto w-full text-center border-t border-gray-200 pt-3">
              <p className={`text-[9.5px] font-black tracking-widest ${config.textColor} uppercase`}>
                {config.label}
              </p>
            </div>
          </div>
        </div>

        {/* ==================== ظهر الكارت ==================== */}
        <div id="back-card" className="relative w-[54mm] h-[86mm] bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200" dir="ltr">
          
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
            
            {/* شعار NFC */}
            <div className="mb-2 mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800">
                <path d="M6 4c3.5-2 8.5-2 12 0" />
                <path d="M4 9c4.5-3 11.5-3 16 0" />
                <path d="M2 14c6.5-4 15.5-4 22 0" />
              </svg>
            </div>
            
            {/* نص التوجيه */}
            <p className="text-[11px] font-black tracking-widest text-slate-800 mb-6 uppercase">
              Tap Your Phone
            </p>

            {/* QR Code */}
            <div className="p-1 mb-auto">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://bakrii-hse-system.vercel.app/operator/${operator.cert_id}`} 
                alt="QR Code" 
                className="w-24 h-24"
              />
            </div>

            {/* شعار Energya الصغير */}
            <div className="opacity-50 flex items-center justify-center mb-2">
              <h2 className="text-[6.5px] font-black tracking-[0.15em] text-slate-900 text-center leading-tight uppercase">
                ENERGYA<br/>STEEL SOLUTIONS
              </h2>
            </div>

            {/* حقوق Justtap */}
            <div className="mt-2 pt-2 border-t border-gray-100 w-full flex justify-center items-center">
              <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider">
                Powered by <span className="font-black text-slate-800 text-[8px]">Justtap</span>
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
