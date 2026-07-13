"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SupervisorsManagement() {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // حالات الفورم لإضافة مشرف جديد
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    pin_code: "",
    role_label: "مشرف سلامة"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "إدارة المشرفين | نظام HSE"; // تغيير اسم التاب
    fetchSupervisors();
  }, []);

  async function fetchSupervisors() {
    setLoading(true);
    const { data } = await supabase.from("supervisors").select("*").order("id", { ascending: false });
    if (data) setSupervisors(data);
    setLoading(false);
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSupervisor = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data, error } = await supabase.from("supervisors").insert([formData]);

    if (error) {
      if (error.code === '23505') { // كود الخطأ لو اسم المستخدم متكرر
        alert("اسم المستخدم (Username) موجود بالفعل، الرجاء اختيار اسم آخر.");
      } else {
        alert("حدث خطأ أثناء إضافة المشرف.");
      }
    } else {
      alert("✅ تم إضافة المشرف بنجاح!");
      setFormData({ full_name: "", username: "", pin_code: "", role_label: "مشرف سلامة" });
      fetchSupervisors();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`هل أنت متأكد من حذف حساب المشرف: ${name}؟\nلا يمكن التراجع عن هذا الإجراء.`)) {
      await supabase.from("supervisors").delete().eq("id", id);
      fetchSupervisors();
    }
  };

  return (
    <div className="p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* رأس الصفحة */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-slate-800">
          <h1 className="text-3xl font-black text-slate-900 mb-1">🛡️ إدارة حسابات المشرفين</h1>
          <p className="text-slate-600 font-bold">إضافة وحذف صلاحيات مشرفي السلامة في الموقع</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* العمود الأول: فورم إضافة مشرف جديد */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border-2 border-blue-200 h-fit">
            <h2 className="text-xl font-black text-slate-800 mb-6 border-b-2 border-slate-100 pb-2">➕ إضافة مشرف جديد</h2>
            <form onSubmit={handleAddSupervisor} className="space-y-4">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-1">الاسم الكامل</label>
                <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} className="w-full border-2 border-slate-300 p-3 rounded-lg font-bold focus:border-blue-600 outline-none" placeholder="مثال: أحمد محمود" />
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 mb-1">اسم المستخدم (للدخول)</label>
                <input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full border-2 border-slate-300 p-3 rounded-lg font-bold focus:border-blue-600 outline-none text-left" placeholder="ahmed123" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 mb-1">الرمز السري (PIN)</label>
                <input type="text" name="pin_code" required value={formData.pin_code} onChange={handleChange} className="w-full border-2 border-slate-300 p-3 rounded-lg font-bold focus:border-blue-600 outline-none text-center tracking-widest" placeholder="1234" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 mb-1">الوصف (الوردية / الموقع)</label>
                <input type="text" name="role_label" required value={formData.role_label} onChange={handleChange} className="w-full border-2 border-slate-300 p-3 rounded-lg font-bold focus:border-blue-600 outline-none" placeholder="مثال: مشرف سلامة - الوردية الأولى" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] mt-2">
                {isSubmitting ? "جاري الحفظ..." : "حفظ بيانات المشرف"}
              </button>
            </form>
          </div>

          {/* العمود الثاني: جدول المشرفين الحاليين */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border-2 border-slate-300 overflow-hidden">
            <div className="p-6 border-b-2 border-slate-200 bg-slate-50">
              <h2 className="text-xl font-black text-slate-800">📋 قائمة المشرفين المسجلين</h2>
            </div>
            
            {loading ? (
              <div className="p-12 text-center font-black text-xl">جاري تحميل البيانات... ⏳</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead className="bg-slate-800 text-white">
                    <tr>
                      <th className="p-4 font-bold text-sm">الاسم الكامل</th>
                      <th className="p-4 font-bold text-sm">اسم المستخدم</th>
                      <th className="p-4 font-bold text-sm">الرمز السري</th>
                      <th className="p-4 font-bold text-sm">الوصف</th>
                      <th className="p-4 font-bold text-sm text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-900">
                    {supervisors.map((sup) => (
                      <tr key={sup.id} className="border-b-2 border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-black text-lg">{sup.full_name}</td>
                        <td className="p-4 font-bold text-blue-700" dir="ltr">{sup.username}</td>
                        <td className="p-4 font-black tracking-widest text-slate-600">{sup.pin_code}</td>
                        <td className="p-4 font-bold text-slate-600 text-sm">{sup.role_label}</td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => handleDelete(sup.id, sup.full_name)}
                            className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg font-black text-xs border-2 border-red-300 transition-colors shadow-sm"
                          >
                            🗑️ حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                    {supervisors.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-500 font-bold">لا يوجد مشرفين مسجلين.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}