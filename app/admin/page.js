"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminDashboard() {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // حالات النافذة المنبثقة (Modal) للسجل
  const [modalData, setModalData] = useState({ isOpen: false, operatorName: "", history: [], loading: false });

useEffect(() => {
    document.title = "لوحة القيادة | نظام HSE"; // تغيير اسم التاب
    fetchOperators();
  }, []);

  async function fetchOperators() {
    setLoading(true);
    const { data } = await supabase.from("operators").select("*").order("issue_date", { ascending: false });
    if (data) setOperators(data);
    setLoading(false);
  }

  const handleDeleteOperator = async (certId, name) => {
    if (window.confirm(`⚠️ تحذير: هل أنت متأكد من حذف المشغل "${name}" نهائياً؟`)) {
      await supabase.from("operators").delete().eq("cert_id", certId);
      fetchOperators();
    }
  };

  // دالة فتح نافذة السجل
  const openHistoryModal = async (certId, name) => {
    setModalData({ isOpen: true, operatorName: name, history: [], loading: true });
    
    const { data, error } = await supabase
      .from("operator_history")
      .select("*")
      .eq("cert_id", certId)
      .order("id", { ascending: false });
      
    if (error) {
      alert(`خطأ في جلب السجل: ${error.message}`);
    }
    
    setModalData({ isOpen: true, operatorName: name, history: data || [], loading: false });
  };

  const today = new Date().toISOString().split('T')[0];
  
  const stats = useMemo(() => {
    let valid = 0, expired = 0, suspended = 0;
    operators.forEach(op => {
      if (op.status === 'Suspended') suspended++;
      else if (op.expiry_date < today) expired++;
      else valid++;
    });
    return { total: operators.length, valid, expired, suspended };
  }, [operators, today]);

  const filteredOperators = useMemo(() => {
    if (!searchQuery) return operators;
    const lowerQuery = searchQuery.toLowerCase();
    return operators.filter(op => 
      (op.full_name && op.full_name.toLowerCase().includes(lowerQuery)) ||
      (op.cert_id && op.cert_id.toLowerCase().includes(lowerQuery)) ||
      (op.iqama_number && op.iqama_number.includes(lowerQuery))
    );
  }, [searchQuery, operators]);

  return (
    <div className="min-h-screen bg-gray-100 p-8" dir="rtl">
      <div className="max-w-[1400px] mx-auto space-y-8 relative">
        
        {/* رأس الصفحة والمربعات الإحصائية */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border-2 border-slate-800">
          <div><h1 className="text-4xl font-black text-slate-900 mb-1">لوحة تحكم HSE</h1><p className="text-slate-600 font-bold text-lg">نظام إدارة تدريب واعتمادات المشغلين</p></div>
          <Link href="/admin/add" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black shadow-lg transition-transform hover:scale-105 flex items-center gap-2"><span>➕</span> إضافة مشغل جديد</Link>
        </div>

        {loading ? <div className="text-center font-black text-2xl py-10">جاري التحميل... ⏳</div> : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-blue-200 flex flex-col justify-center items-center"><span className="text-5xl font-black text-blue-600 mb-2">{stats.total}</span><span className="text-gray-600 font-bold text-lg">إجمالي المشغلين</span></div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-green-200 flex flex-col justify-center items-center"><span className="text-5xl font-black text-green-600 mb-2">{stats.valid}</span><span className="text-gray-600 font-bold text-lg">رخص سارية ✅</span></div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-red-200 flex flex-col justify-center items-center"><span className="text-5xl font-black text-red-600 mb-2">{stats.expired}</span><span className="text-gray-600 font-bold text-lg">رخص منتهية ❌</span></div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-orange-200 flex flex-col justify-center items-center"><span className="text-5xl font-black text-orange-600 mb-2">{stats.suspended}</span><span className="text-gray-600 font-bold text-lg">إيقاف مؤقت ⛔</span></div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-300 overflow-hidden">
              <div className="p-6 border-b-2 border-slate-200 bg-slate-50">
                <div className="relative max-w-2xl"><span className="absolute inset-y-0 right-0 flex items-center pr-4 text-xl">🔍</span><input type="text" placeholder="ابحث بالاسم، رقم الإقامة..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-4 pr-12 py-4 rounded-xl border-2 border-slate-300 font-black text-slate-800 focus:border-blue-600 outline-none shadow-inner" /></div>
              </div>

              <div className="overflow-x-auto pb-24">
                <table className="w-full text-right border-collapse whitespace-nowrap">
                  <thead className="bg-slate-800 text-white">
                    <tr>
                      <th className="p-4 font-bold text-sm">الاعتماد</th><th className="p-4 font-bold text-sm">الاسم</th><th className="p-4 font-bold text-sm">الإقامة / الموظف</th><th className="p-4 font-bold text-sm">الوظيفة والقسم</th><th className="p-4 font-bold text-sm">الانتهاء</th><th className="p-4 font-bold text-sm text-center">الحالة</th><th className="p-4 font-bold text-sm text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-900">
                    {filteredOperators.map((op) => {
                      let currentStatus = op.status;
                      if (op.status === 'Valid' && op.expiry_date < today) currentStatus = 'Expired';
                      const hasViolation = op.violations_record && op.violations_record !== "سجل نظيف";

                      return (
                        <tr key={op.cert_id} className="border-b-2 border-gray-100 hover:bg-slate-50">
                          <td className="p-4 font-black text-slate-700">{op.cert_id}</td>
                          <td className="p-4 font-black text-black text-lg">{op.full_name}</td>
                          <td className="p-4"><div className="font-bold text-slate-800">{op.iqama_number || '---'}</div><div className="text-xs font-bold text-slate-500 mt-1">ID: {op.emp_id}</div></td>
                          <td className="p-4"><div className="font-bold text-slate-800">{op.job_title}</div><div className="text-xs font-bold text-blue-700 mt-1">{op.department} - {op.level}</div></td>
                          <td className="p-4 font-black text-slate-800" dir="ltr">{op.expiry_date}</td>
                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              {currentStatus === 'Valid' && <span className="px-3 py-1 rounded-lg text-xs font-black bg-green-100 text-green-800 border-2 border-green-300">سارية ✔️</span>}
                              {currentStatus === 'Expired' && <span className="px-3 py-1 rounded-lg text-xs font-black bg-red-100 text-red-800 border-2 border-red-300">منتهية ❌</span>}
                              {currentStatus === 'Suspended' && <span className="px-3 py-1 rounded-lg text-xs font-black bg-orange-100 text-orange-800 border-2 border-orange-300">موقوفة ⛔</span>}
                              {hasViolation && <span className="px-2 py-0.5 mt-1 bg-red-600 text-white text-[10px] rounded font-bold shadow-sm">مخالفة ⚠️</span>}
                            </div>
                          </td>
                         <td className="p-4">
                            <div className="flex justify-center items-center gap-2">
                              {/* 1. الكارنيه */}
                              <Link href={`/operator/${op.cert_id}`} target="_blank" className="bg-slate-200 text-slate-900 px-3 py-2 rounded-lg font-black text-xs border-2 border-slate-400 shadow-sm hover:bg-slate-300"><span>🪪</span> الكارنيه</Link>
                              
                              {/* 2. السجل */}
                              <button onClick={() => openHistoryModal(op.cert_id, op.full_name)} className="bg-blue-100 text-blue-900 px-3 py-2 rounded-lg font-black text-xs border-2 border-blue-300 shadow-sm hover:bg-blue-200"><span>📜</span> السجل</button>
                              
                              {/* 3. تعديل */}
                              <Link href={`/admin/edit/${op.cert_id}`} className="bg-amber-100 text-amber-900 px-3 py-2 rounded-lg font-black text-xs border-2 border-amber-300 shadow-sm hover:bg-amber-200"><span>⚙️</span> تعديل</Link>
                              
                              {/* 4. طباعة */}
                              <Link href={`/admin/print/${op.cert_id}`} className="bg-green-100 text-green-900 px-3 py-2 rounded-lg font-black text-xs border-2 border-green-300 shadow-sm hover:bg-green-200"><span>🖨️</span> طباعة</Link>
                              
                              {/* 5. حذف */}
                              <button onClick={() => handleDeleteOperator(op.cert_id, op.full_name)} className="bg-red-100 text-red-900 px-3 py-2 rounded-lg font-black text-xs border-2 border-red-300 shadow-sm hover:bg-red-200"><span>🗑️</span> حذف</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ================= النافذة المنبثقة (Modal) للسجل ================= */}
        {modalData.isOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border-4 border-slate-800">
              {/* هيدر النافذة */}
              <div className="bg-slate-800 p-5 flex justify-between items-center text-white">
                <div>
                  <h2 className="text-xl font-black">📜 سجل المخالفات والإنذارات</h2>
                  <p className="text-sm font-bold text-blue-300 mt-1">المشغل: {modalData.operatorName}</p>
                </div>
                <button onClick={() => setModalData({ isOpen: false, operatorName: "", history: [], loading: false })} className="text-red-400 hover:text-red-300 font-black text-2xl px-2">✖</button>
              </div>

              {/* محتوى السجل */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {modalData.loading ? (
                  <div className="text-center font-black py-8">جاري التحميل... ⏳</div>
                ) : modalData.history.length === 0 ? (
                  <div className="text-center py-10">
                    <span className="text-5xl block mb-4">✔️</span>
                    <p className="text-xl font-black text-green-600">سجل المشغل نظيف تماماً</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modalData.history.map((record) => (
                      <div key={record.id} className="bg-slate-50 border-r-4 border-red-600 p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="bg-red-100 text-red-800 font-black text-xs px-3 py-1 rounded border border-red-200">{record.action_type}</span>
                          <span className="font-bold text-slate-500 text-sm" dir="ltr">{record.action_date}</span>
                        </div>
                        <p className="font-bold text-slate-800 text-lg leading-relaxed">{record.details}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}