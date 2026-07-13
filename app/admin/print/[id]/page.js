"use client";

import { useEffect, useState, useRef, use } from "react";
import { supabase } from "@/lib/supabase";
import QRCode from "react-qr-code";
import Link from "next/link";
import * as htmlToImage from "html-to-image"; // المكتبة الجديدة القوية

export default function PrintCard({ params }) {
  const unwrappedParams = use(params);
  const certId = unwrappedParams.id;
  
  const [operator, setOperator] = useState(null);
  const [pageUrl, setPageUrl] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const frontCardRef = useRef(null);
  const backCardRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(`${window.location.origin}/operator/${certId}`);
    }
    async function fetchData() {
      const { data } = await supabase.from("operators").select("*").eq("cert_id", certId).single();
      if (data) setOperator(data);
    }
    fetchData();
  }, [certId]);

  const downloadAsJPG = async () => {
    setIsDownloading(true);
    try {
      // تصوير الوجه الأمامي باستخدام المكتبة الجديدة
      const frontDataUrl = await htmlToImage.toJpeg(frontCardRef.current, { quality: 1.0, pixelRatio: 3 });
      const frontLink = document.createElement("a");
      frontLink.download = `${operator.cert_id}_Front.jpg`;
      frontLink.href = frontDataUrl;
      frontLink.click();

      // تصوير الوجه الخلفي
      const backDataUrl = await htmlToImage.toJpeg(backCardRef.current, { quality: 1.0, pixelRatio: 3 });
      const backLink = document.createElement("a");
      backLink.download = `${operator.cert_id}_Back.jpg`;
      backLink.href = backDataUrl;
      backLink.click();

    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء تحميل الصور. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!operator) return <div className="p-8 text-center font-black">جاري التجهيز... ⏳</div>;

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center py-10" dir="rtl">
      <div className="mb-8 flex gap-4">
        <Link href="/admin" className="bg-gray-800 text-white font-black px-6 py-3 rounded-lg shadow-lg hover:bg-gray-900 transition-colors">العودة للوحة التحكم</Link>
        <button onClick={downloadAsJPG} disabled={isDownloading} className="bg-green-700 text-white font-black px-8 py-3 rounded-lg shadow-lg hover:bg-green-800 transition-colors">
          {isDownloading ? "جاري التحميل... ⏳" : "📥 تحميل الكارت كصورتين (JPG)"}
        </button>
      </div>

      <div className="flex flex-col gap-8 md:flex-row md:flex-wrap md:justify-center">
        
        {/* الوجه الأمامي (تم تغيير الألوان لـ hex صريحة عشان منعاً لأي خطأ) */}
        <div ref={frontCardRef} className="w-[330px] h-[520px] bg-[#ffffff] rounded-xl overflow-hidden border-2 border-[#d1d5db] relative">
          <div className="h-20 bg-[#0f172a] flex items-center justify-center text-[#ffffff] font-black text-xl">AUTHORIZED OPERATOR</div>
          <div className="px-5 py-4 flex flex-col items-center">
            <img src={operator.photo_url} alt="Profile" className="w-28 h-28 rounded-full border-4 border-[#ffffff] shadow-md object-cover -mt-16 mb-4 bg-[#ffffff]" crossOrigin="anonymous" />
            <h2 className="text-xl font-black text-[#111827] text-center mb-1">{operator.full_name}</h2>
            <p className="text-[#6b7280] font-black text-sm mb-6 tracking-widest">{operator.cert_id}</p>
            <div className="w-full space-y-3 text-right">
              <div className="bg-[#f3f4f6] p-2 rounded border border-[#e5e7eb]"><span className="text-xs font-bold text-[#6b7280] block">الوظيفة / Job Title</span><span className="text-sm font-black text-[#111827]">{operator.job_title}</span></div>
              <div className="flex gap-2">
                <div className="bg-[#f3f4f6] p-2 rounded border border-[#e5e7eb] flex-1"><span className="text-xs font-bold text-[#6b7280] block">رقم الموظف</span><span className="text-sm font-black text-[#111827]">{operator.emp_id}</span></div>
                <div className="bg-[#f3f4f6] p-2 rounded border border-[#e5e7eb] flex-1"><span className="text-xs font-bold text-[#6b7280] block">القسم</span><span className="text-sm font-black text-[#111827]">{operator.department}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* الوجه الخلفي */}
        <div ref={backCardRef} className="w-[330px] h-[520px] bg-[#ffffff] rounded-xl overflow-hidden border-2 border-[#d1d5db] flex flex-col items-center justify-between p-5">
          <div className="text-center w-full">
            <h3 className="text-lg font-black text-[#0f172a] border-b-2 border-[#0f172a] pb-2 mb-4">تعليمات السلامة</h3>
            <ul className="text-right text-xs font-bold text-[#374151] space-y-2 list-disc list-inside">
              <li>يجب ارتداء مهمات الوقاية (PPE).</li><li>يُمنع التشغيل في حالة وجود عطل.</li><li>التواصل بالعين مع الـ Rigger إلزامي.</li>
            </ul>
          </div>
          <div className="flex flex-col items-center my-2">
            <p className="text-xs font-black text-[#6b7280] mb-2 uppercase">Scan to Verify</p>
            <div className="p-1.5 border-2 border-[#e5e7eb] rounded-lg bg-[#ffffff]">
              {pageUrl && <QRCode value={pageUrl} size={110} level="H" />}
            </div>
          </div>
          <div className="text-center w-full bg-[#f3f4f6] p-2 rounded-lg">
            <p className="text-[10px] font-bold text-[#4b5563] leading-tight">Property of the company. Return to HSE Dept if found.</p>
            <p className="text-sm font-black text-[#b91c1c] mt-1">Emergency: 9999</p>
          </div>
        </div>

      </div>
    </div>
  );
}