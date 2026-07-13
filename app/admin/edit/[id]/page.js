"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditOperator({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const certId = unwrappedParams.id;

  const [operator, setOperator] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // بيانات التعديل
  const [editData, setEditData] = useState({
    full_name: "", emp_id: "", iqama_number: "", job_title: "", department: "", level: ""
  });
  const [photoFile, setPhotoFile] = useState(null); // متغير الصورة الجديدة

  // إجراءات الرخصة
  const [actionType, setActionType] = useState("تجديد رخصة");
  const [validityPeriod, setValidityPeriod] = useState("6");
  const [actionDetails, setActionDetails] = useState("");

  useEffect(() => {
    fetchData();
  }, [certId]);

  async function fetchData() {
    setLoading(true);
    const { data: opData } = await supabase.from("operators").select("*").eq("cert_id", certId).single();
    if (opData) {
      setOperator(opData);
      setEditData({
        full_name: opData.full_name, emp_id: opData.emp_id, iqama_number: opData.iqama_number,
        job_title: opData.job_title, department: opData.department, level: opData.level
      });
    }
    const { data: histData } = await supabase.from("operator_history").select("*").eq("cert_id", certId).order("id", { ascending: false });
    if (histData) setHistory(histData);
    setLoading(false);
  }

  // دالة تحديث البيانات مع الصورة
  const handleUpdateData = async (e) => {
    e.preventDefault();
    let finalPhotoUrl = operator.photo_url;

    if (photoFile) {
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${certId}_updated_${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage.from("avatars").upload(fileName, photoFile);
      if (!error) {
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
        finalPhotoUrl = urlData.publicUrl;
      }
    }

    await supabase.from("operators").update({ ...editData, photo_url: finalPhotoUrl }).eq("cert_id", certId);
    alert("✅ تم تحديث بيانات المشغل بنجاح!");
    setPhotoFile(null); // تفريغ حقل الصورة
    fetchData();
  };

  const handleAddAction = async (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];

    await supabase.from("operator_history").insert([{
      cert_id: certId, action_type: actionType, action_date: today, details: actionDetails
    }]);

    let updates = {};
    if (actionType === "تجديد رخصة") {
      const issueDateObj = new Date();
      issueDateObj.setMonth(issueDateObj.getMonth() + parseInt(validityPeriod));
      updates = { expiry_date: issueDateObj.toISOString().split('T')[0], status: "Valid", courses_count: (operator.courses_count || 1) + 1, issue_date: today };
    } else if (actionType === "إيقاف مؤقت") {
      updates = { status: "Suspended" };
    } else if (actionType === "تفعيل الرخصة") {
      updates = { status: "Valid" };
    }

    await supabase.from("operators").update(updates).eq("cert_id", certId);
    alert(`✅ تم ${actionType} بنجاح!`);
    setActionDetails("");
    fetchData();
  };

  if (loading) return <div className="p-8 text-center font-black text-2xl text-black">جاري تحميل البيانات... ⏳</div>;

  return (
    <div className="min-h-screen bg-gray-200 p-8" dir="rtl">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-md border-2 border-gray-300">
          <h1 className="text-3xl font-black text-black">⚙️ إدارة ملف المشغل: {operator.full_name}</h1>
          <Link href="/admin" className="text-blue-800 hover:bg-blue-100 font-black border-2 border-blue-800 px-6 py-2 rounded-lg transition-colors">العودة للوحة التحكم</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* العمود الأول */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border-2 border-gray-400">
              <h3 className="text-xl font-black text-black mb-4 border-b-2 border-gray-300 pb-2">البطاقة الحالية</h3>
              <img src={operator.photo_url} alt="صورة" className="w-32 h-32 rounded-full mx-auto border-4 border-blue-800 object-cover mb-4 shadow-lg" />
              <h2 className="text-2xl font-black text-center text-black mb-1">{operator.full_name}</h2>
              <p className="text-center text-lg font-black text-blue-800 mb-6">{operator.cert_id}</p>
              
              <div className="space-y-4 text-base">
                <div className="flex justify-between border-b-2 border-gray-200 pb-2">
                  <span className="text-gray-900 font-bold">الحالة:</span>
                  <span className={`font-black ${operator.status === 'Valid' ? 'text-green-700' : 'text-red-700'}`}>{operator.status === 'Valid' ? 'سارية ✔️' : 'منتهية/موقوفة ❌'}</span>
                </div>
                <div className="flex justify-between border-b-2 border-gray-200 pb-2">
                  <span className="text-gray-900 font-bold">تاريخ الانتهاء:</span>
                  <span className="text-black font-black" dir="ltr">{operator.expiry_date}</span>
                </div>
              </div>
            </div>

            {/* السجل التاريخي */}
            <div className="bg-white p-6 rounded-xl shadow-md border-2 border-gray-400">
              <h3 className="text-xl font-black text-black mb-4 border-b-2 border-gray-300 pb-2">تاريخ الإجراءات</h3>
              <div className="space-y-3 h-64 overflow-y-auto pr-2">
                {history.map((record) => (
                  <div key={record.id} className="p-3 bg-gray-100 border-2 border-gray-300 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs font-black px-2 py-1 rounded text-white ${record.action_type === 'إيقاف مؤقت' ? 'bg-red-700' : 'bg-green-700'}`}>{record.action_type}</span>
                      <span className="text-xs font-black text-black" dir="ltr">{record.action_date}</span>
                    </div>
                    <p className="font-bold text-black text-sm">{record.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* العمود الثاني */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* قسم إجراءات الرخصة */}
            <div className="bg-white p-6 rounded-xl shadow-md border-2 border-blue-400">
              <h3 className="text-2xl font-black text-blue-900 mb-6 border-b-2 border-gray-300 pb-2">1. إجراءات الرخصة</h3>
              <form onSubmit={handleAddAction} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-black text-black mb-2">نوع الإجراء</label>
                    <select value={actionType} onChange={(e) => setActionType(e.target.value)} className="w-full border-2 border-black p-3 rounded font-black text-black bg-gray-50">
                      <option value="تجديد رخصة">🔄 تجديد رخصة</option>
                      <option value="إيقاف مؤقت">⛔ إيقاف المشغل مؤقتاً</option>
                      <option value="تفعيل الرخصة">✅ إعادة تفعيل الرخصة</option>
                    </select>
                  </div>
                  {actionType === "تجديد رخصة" && (
                    <div>
                      <label className="block text-lg font-black text-black mb-2">تجديد لمدة</label>
                      <select value={validityPeriod} onChange={(e) => setValidityPeriod(e.target.value)} className="w-full border-2 border-black p-3 rounded font-black text-black bg-gray-50">
                        <option value="1">شهر واحد</option><option value="3">3 شهور</option><option value="6">6 شهور</option><option value="12">سنة كاملة</option>
                      </select>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-lg font-black text-black mb-2">التفاصيل (مطلوب)</label>
                  <input type="text" required value={actionDetails} onChange={(e) => setActionDetails(e.target.value)} className="w-full border-2 border-black p-3 rounded font-black text-black bg-gray-50" />
                </div>
                <button type="submit" className="w-full bg-blue-800 hover:bg-blue-900 text-white font-black text-xl py-4 rounded-lg shadow-lg">تنفيذ الإجراء</button>
              </form>
            </div>

            {/* قسم تعديل البيانات */}
            <div className="bg-white p-6 rounded-xl shadow-md border-2 border-gray-400">
              <h3 className="text-2xl font-black text-black mb-6 border-b-2 border-gray-300 pb-2">2. تعديل بيانات المشغل</h3>
              <form onSubmit={handleUpdateData} className="space-y-6">
                
                {/* حقل تغيير الصورة */}
                <div className="bg-gray-100 p-4 rounded-lg border-2 border-dashed border-gray-400">
                  <label className="block text-lg font-black text-black mb-2">تغيير الصورة الشخصية (اختياري)</label>
                  <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} className="w-full text-black font-bold" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-black text-black mb-2">الاسم</label>
                    <input type="text" required value={editData.full_name} onChange={(e) => setEditData({...editData, full_name: e.target.value})} className="w-full border-2 border-gray-400 p-3 rounded font-black text-black" />
                  </div>
                  <div>
                    <label className="block text-lg font-black text-black mb-2">رقم الإقامة</label>
                    <input type="text" required value={editData.iqama_number} onChange={(e) => setEditData({...editData, iqama_number: e.target.value})} className="w-full border-2 border-gray-400 p-3 rounded font-black text-black" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-black text-black mb-2">الرقم الوظيفي</label>
                    <input type="text" required value={editData.emp_id} onChange={(e) => setEditData({...editData, emp_id: e.target.value})} className="w-full border-2 border-gray-400 p-3 rounded font-black text-black" />
                  </div>
                  <div>
                    <label className="block text-lg font-black text-black mb-2">القسم</label>
                    <input type="text" required value={editData.department} onChange={(e) => setEditData({...editData, department: e.target.value})} className="w-full border-2 border-gray-400 p-3 rounded font-black text-black" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-black text-black mb-2">الوظيفة</label>
                    <select value={editData.job_title} onChange={(e) => setEditData({...editData, job_title: e.target.value})} className="w-full border-2 border-gray-400 p-3 rounded font-black text-black">
                      <option value="مشغل ونش علوي - Overhead Crane">مشغل ونش علوي - Overhead Crane</option>
                      <option value="مشغل ونش متحرك - Mobile Crane">مشغل ونش متحرك - Mobile Crane</option>
                      <option value="مشغل فوركليفت - Forklift Operator">مشغل فوركليفت - Forklift Operator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-lg font-black text-black mb-2">المستوى</label>
                    <select value={editData.level} onChange={(e) => setEditData({...editData, level: e.target.value})} className="w-full border-2 border-gray-400 p-3 rounded font-black text-black">
                      <option value="Level 1: Trainee">Level 1: Trainee</option>
                      <option value="Level 2: Authorized">Level 2: Authorized</option>
                      <option value="Level 3: Senior">Level 3: Senior</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-black text-xl py-4 rounded-lg shadow-lg">
                  حفظ التعديلات على البيانات والصورة
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}