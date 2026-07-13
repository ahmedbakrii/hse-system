"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SupervisorDashboard() {
  const router = useRouter();
  const [supName, setSupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [operators, setOperators] = useState([]);
  const [myHistory, setMyHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const name = localStorage.getItem("hse_sup_name");
    if (!name) {
      router.push("/login");
      return;
    }
    
    setSupName(name);
    document.title = "بوابة المشرف الميداني | HSE";
    fetchData(name);
  }, []);

  async function fetchData(name) {
    const { data: ops } = await supabase.from("operators").select("*");
    if (ops) setOperators(ops);

    const { data: hist } = await supabase
      .from("operator_history")
      .select("*")
      .ilike("details", `%${name}%`)
      .order("id", { ascending: false });
      
    if (hist) setMyHistory(hist);
    setLoading(false);
  }

  const handleLogout = () => {
    localStorage.removeItem("hse_sup_id");
    localStorage.removeItem("hse_sup_name");
    localStorage.removeItem("hse_sup_label");
    router.push("/");
  };

  const filteredOps = searchQuery
    ? operators.filter(op => 
        (op.full_name && op.full_name.includes(searchQuery)) || 
        (op.cert_id && op.cert_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (op.iqama_number && op.iqama_number.includes(searchQuery))
      ).slice(0, 5)
    : [];

  if (loading) return <div className="flex h-screen items-center justify-center font-black text-2xl bg-slate-50">جاري التحميل... ⏳</div>;

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-10" dir="rtl">
      <nav className="bg-slate-900 p-4 text-white flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2"><span>🛡️</span> العمليات الميدانية</h1>
          <p className="text-xs text-green-400 font-bold mt-1">مرحباً كابتن: {supName}</p>
        </div>
      </nav>

      <div className="p-4 max-w-md mx-auto space-y-6 mt-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border-2 border-blue-100">
          <h2 className="font-black text-slate-800 mb-4 text-lg flex items-center gap-2"><span>🔍</span> فحص مشغل سريع</h2>
          <div className="relative">
            <input 
              type="text" 
              placeholder="اكتب الاسم، الإقامة، أو كود CR..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 pl-10 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {searchQuery && (
            <div className="mt-3 space-y-2">
              {filteredOps.length > 0 ? (
                filteredOps.map(op => (
                  <Link key={op.cert_id} href={`/operator/${op.cert_id}`} className="block bg-white p-3 rounded-xl border-2 border-slate-100 hover:border-blue-400 shadow-sm transition-all">
                    <div className="font-black text-slate-800 text-lg">{op.full_name}</div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{op.cert_id}</span>
                      <span className={`text-[10px] font-black px-2 py-1 rounded ${op.status === 'Valid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {op.status === 'Valid' ? 'سارية' : 'موقوفة/منتهية'}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center p-3 text-sm font-bold text-red-500 bg-red-50 rounded-lg">لم يتم العثور على مشغل ❌</div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border-2 border-slate-200">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="font-black text-slate-800 text-lg flex items-center gap-2"><span>📜</span> سجل إجراءاتي</h2>
            <span className="bg-slate-800 text-white px-2 py-1 rounded-md text-xs font-bold">{myHistory.length} إجراء</span>
          </div>
          
          {myHistory.length === 0 ? (
            <div className="text-center py-6 text-slate-500 font-bold text-sm">لم تقم بتسجيل أي مخالفات حتى الآن.</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {myHistory.map(record => (
                <div key={record.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black text-blue-800">{record.cert_id}</span>
                    <span className="text-[10px] font-bold text-slate-500" dir="ltr">{record.action_date}</span>
                  </div>
                  <div className="flex items-start gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black mt-0.5 ${record.action_type === 'إيقاف مؤقت' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'}`}>
                      {record.action_type}
                    </span>
                    <p className="text-sm font-bold text-slate-700 leading-tight">
                      {record.details.split(' (بواسطة')[0]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
