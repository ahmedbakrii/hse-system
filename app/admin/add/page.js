"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as XLSX from "xlsx";

export default function AddOperator() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ================= اللمسة الجمالية: تغيير اسم التاب =================
  useEffect(() => {
    document.title = "إضافة مشغل جديد | نظام HSE";
  }, []);

  // ================= 1. الإضافة الفردية =================
  const [photoFile, setPhotoFile] = useState(null);
  const [formData, setFormData] = useState({
    emp_id: "",
    full_name: "",
    iqama_number: "",
    job_title: "مشغل ونش علوي - Overhead Crane",
    department: "",
    level: "Level 1: Trainee",
    issue_date: "",
    validity_period: "6", // المدة الافتراضية 6 شهور
    status: "Valid",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePhotoChange = (e) => setPhotoFile(e.target.files[0]);

  const handleSubmitSingle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const currentYear = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generatedCertId = `CR-${currentYear}-${randomNum}`;

    // حساب تاريخ الانتهاء تلقائياً بناءً على مدة الصلاحية
    const issueDateObj = new Date(formData.issue_date);
    issueDateObj.setMonth(issueDateObj.getMonth() + parseInt(formData.validity_period));
    const calculatedExpiryDate = issueDateObj.toISOString().split('T')[0];

    try {
      let finalPhotoUrl = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${generatedCertId}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
        finalPhotoUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase.from("operators").insert([
        {
          cert_id: generatedCertId,
          emp_id: formData.emp_id,
          full_name: formData.full_name,
          iqama_number: formData.iqama_number,
          job_title: formData.job_title,
          department: formData.department,
          level: formData.level,
          issue_date: formData.issue_date,
          expiry_date: calculatedExpiryDate, // التاريخ المحسوب
          status: formData.status,
          photo_url: finalPhotoUrl,
          courses_count: 1,
          violations_record: "سجل نظيف",
        },
      ]);

      if (insertError) throw insertError;
      router.push("/admin");
    } catch (err) {
      setError(`حدث خطأ: ${err.message || "فشل في حفظ البيانات"}`);
      setLoading(false);
    }
  };

  // ================= 2. الإضافة الجماعية بالإكسيل =================
  
  // دالة توليد وتحميل قالب الإكسيل
  const downloadTemplate = () => {
    const wsData = [{
      emp_id: "10455", full_name: "مثال: أحمد محمود", iqama_number: "2500000000",
      job_title: "مشغل ونش علوي - Overhead Crane", department: "الصيانة",
      level: "Level 1: Trainee", issue_date: "2026-07-13", expiry_date: "2027-01-13",
      status: "Valid", photo_url: ""
    }];
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Operators");
    XLSX.writeFile(wb, "HSE_Operators_Template.xlsx");
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError("");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bstr = event.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const currentYear = new Date().getFullYear();
        const operatorsToInsert = data.map((row) => {
          const randomNum = Math.floor(10000 + Math.random() * 90000);
          return {
            cert_id: `CR-${currentYear}-${randomNum}`,
            emp_id: String(row.emp_id || ""),
            full_name: row.full_name || "",
            iqama_number: String(row.iqama_number || ""),
            job_title: row.job_title || "مشغل ونش",
            department: row.department || "عام",
            level: row.level || "Level 1: Trainee",
            issue_date: row.issue_date || "",
            expiry_date: row.expiry_date || "",
            status: row.status || "Valid",
            photo_url: row.photo_url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            courses_count: 1,
            violations_record: "سجل نظيف"
          };
        });

        const { error: insertBulkError } = await supabase.from("operators").insert(operatorsToInsert);
        if (insertBulkError) throw insertBulkError;

        setSuccess(`تم إضافة ${operatorsToInsert.length} مشغل بنجاح! جاري تحويلك...`);
        setTimeout(() => router.push("/admin"), 2000);

      } catch (err) {
        setError(`خطأ في الإكسيل: ${err.message}`);
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center mb-6 border-b border-gray-300 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">إضافة مشغلين</h1>
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-bold">العودة للوحة التحكم</Link>
        </div>

        {error && <div className="bg-red-100 text-red-800 p-4 rounded-lg font-bold">{error}</div>}
        {success && <div className="bg-green-100 text-green-800 p-4 rounded-lg font-bold">{success}</div>}

        {/* قسم رفع الإكسيل */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">1. إضافة جماعية (عبر ملف Excel)</h2>
            <button onClick={downloadTemplate} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-all">
              📥 تحميل قالب الإكسيل
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4 font-medium">
            قم بتحميل القالب، واملأ البيانات (مع الاحتفاظ بأسماء الأعمدة بالإنجليزية)، ثم ارفع الملف هنا:
          </p>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleExcelUpload} 
            disabled={loading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* قسم الإضافة الفردية */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-300">
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">2. إضافة فردية يدوية</h2>
          <form onSubmit={handleSubmitSingle} className="space-y-4">
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">الصورة الشخصية (اختياري)</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">اسم المشغل</label>
                <input type="text" name="full_name" required onChange={handleChange} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">رقم الموظف</label>
                <input type="text" name="emp_id" required onChange={handleChange} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 font-medium" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">رقم الإقامة</label>
                <input type="text" name="iqama_number" required onChange={handleChange} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">القسم</label>
                <input type="text" name="department" required onChange={handleChange} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 font-medium" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الوظيفة</label>
                <select name="job_title" onChange={handleChange} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 font-bold text-gray-700">
                  <option value="مشغل ونش علوي - Overhead Crane">مشغل ونش علوي - Overhead Crane</option>
                  <option value="مشغل ونش متحرك - Mobile Crane">مشغل ونش متحرك - Mobile Crane</option>
                  <option value="مشغل فوركليفت - Forklift Operator">مشغل فوركليفت - Forklift Operator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">المستوى</label>
                <select name="level" onChange={handleChange} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 font-bold text-gray-700">
                  <option value="Level 1: Trainee">Level 1: Trainee</option>
                  <option value="Level 2: Authorized">Level 2: Authorized</option>
                  <option value="Level 3: Senior">Level 3: Senior</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">تاريخ الإصدار (التدريب)</label>
                <input type="date" name="issue_date" required onChange={handleChange} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">صلاحية التدريب</label>
                <select name="validity_period" onChange={handleChange} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 font-bold text-gray-700">
                  <option value="1">شهر واحد</option>
                  <option value="3">3 شهور</option>
                  <option value="6">6 شهور</option>
                  <option value="12">سنة كاملة</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-all">
                {loading ? "جاري الحفظ والرفع..." : "حفظ المشغل وإصدار الاعتماد"}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}