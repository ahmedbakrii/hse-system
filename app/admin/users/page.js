"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminUsersManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    full_name: "", username: "", password: "", role: "System Admin"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "حسابات الإدارة | نظام HSE"; // تغيير اسم التاب
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    setLoading(true);
    const { data } = await supabase.from("admin_users").select("*").order("id", { ascending: false });
    if (data) setAdmins(data);
    setLoading(false);
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.from("admin_users").insert([formData]);

    if (error) {
      alert(`حدث خطأ: ${error.message}`);
    } else {
      alert("✅ تم إضافة حساب الإدارة بنجاح!");
      setFormData({ full_name: "", username: "", password: "", role: "System Admin" });
      fetchAdmins();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`هل أنت متأكد من حذف حساب الإدارة: ${name}؟\nسيتم فقدان صلاحياته فوراً.`)) {
      await supabase.from("admin_users").delete().eq("id", id);
      fetchAdmins();
    }
  };

  return (
    <div className="p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-slate-800">
          <h1 className="text-3xl font-black text-slate-900 mb-1">👑 حسابات الإدارة</h1>
          <p className="text-slate-600 font-bold">إدارة صلاحيات الوصول للوحة التحكم الرئيسية (الأدمن)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* فورم الإضافة */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border-2 border-blue-200 h-fit">
            <h2 className="text-xl font-black text-slate-800 mb-6 border-b-2 border-slate-100 pb-2">➕ إضافة مدير جديد</h2>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-1">الاسم الكامل</label>
                <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} className="w-full border-2 border-slate-300 p-3 rounded-lg font-bold" />
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 mb-1">اسم المستخدم</label>
                <input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full border-2 border-slate-300 p-3 rounded-lg font-bold" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 mb-1">كلمة المرور</label>
                <input type="text" name="password" required value={formData.password} onChange={handleChange} className="w-full border-2 border-slate-300 p-3 rounded-lg font-bold" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 mb-1">الدور (Role)</label>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full border-2 border-slate-300 p-3 rounded-lg font-bold">
                  <option value="System Admin">System Admin (مدير نظام)</option>
                  <option value="General Manager">General Manager (مدير عام)</option>
                </select>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition-transform mt-2">
                {isSubmitting ? "جاري الحفظ..." : "حفظ الصلاحيات"}
              </button>
            </form>
          </div>

          {/* الجدول */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border-2 border-slate-300 overflow-hidden">
            <div className="p-6 border-b-2 border-slate-200 bg-slate-50"><h2 className="text-xl font-black text-slate-800">📋 المديرين المسجلين</h2></div>
            {loading ? <div className="p-12 text-center font-black">جاري تحميل البيانات... ⏳</div> : (
              <table className="w-full text-right border-collapse">
                <thead className="bg-slate-800 text-white">
                  <tr><th className="p-4">الاسم</th><th className="p-4">اسم المستخدم</th><th className="p-4">الدور</th><th className="p-4 text-center">إجراء</th></tr>
                </thead>
                <tbody className="text-slate-900">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="border-b-2 border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-black">{admin.full_name}</td>
                      <td className="p-4 font-bold text-blue-700" dir="ltr">{admin.username}</td>
                      <td className="p-4 font-bold text-slate-600"><span className="bg-slate-200 px-2 py-1 rounded text-xs">{admin.role}</span></td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleDelete(admin.id, admin.full_name)} className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-black text-xs">🗑️ حذف</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}