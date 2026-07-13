"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminData, setAdminData] = useState({ name: "", role: "" });

  useEffect(() => {
    // التحقق من وجود صلاحيات المدير
    const adminId = localStorage.getItem("hse_admin_id");
    if (!adminId) {
      router.push("/admin-login"); // طرد غير المصرح لهم
    } else {
      setAdminData({
        name: localStorage.getItem("hse_admin_name"),
        role: localStorage.getItem("hse_admin_role")
      });
      setIsAuthorized(true);
    }
  }, []);

  const menuItems = [
    { name: "لوحة القيادة", icon: "📊", path: "/admin" },
    { name: "إدارة المشرفين", icon: "🛡️", path: "/admin/supervisors" },
    { name: "حسابات الإدارة", icon: "👑", path: "/admin/users" },
  ];

  const handleAdminLogout = () => {
    localStorage.removeItem("hse_admin_id");
    localStorage.removeItem("hse_admin_name");
    localStorage.removeItem("hse_admin_role");
    router.push("/admin-login");
  };

  // شاشة تحميل فخمة أثناء التحقق من الصلاحيات
  if (!isAuthorized) {
    return <div className="h-screen bg-slate-900 flex items-center justify-center text-white font-black text-2xl">جاري التحقق من الصلاحيات... 🔒</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden" dir="rtl">
      
      {/* القائمة الجانبية */}
      <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex print:hidden shadow-2xl z-20">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xl shadow-lg">HSE</div>
          <h2 className="text-xl font-black text-white tracking-wide">نظام <span className="text-blue-500">الأوناش</span></h2>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`) && item.path !== "/admin" || pathname === "/admin" && item.path === "/admin";
            return (
              <Link key={item.path} href={item.path} className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all duration-300 ${isActive ? "bg-blue-600 text-white shadow-md transform translate-x-1" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
                <span className="text-xl">{item.icon}</span> {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleAdminLogout} className="flex items-center gap-3 w-full p-3 rounded-xl font-bold text-red-400 hover:bg-red-900/30 transition-colors">
            <span className="text-xl">🚪</span> تسجيل خروج
          </button>
        </div>
      </aside>

      {/* منطقة المحتوى الرئيسية */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-8 print:hidden z-10">
          <h1 className="text-xl font-black text-slate-800 hidden lg:block">إدارة تدريب واعتمادات المشغلين</h1>
          <h1 className="text-xl font-black text-slate-800 lg:hidden">HSE System</h1>
          <div className="flex items-center gap-4">
            <div className="text-left" dir="ltr">
              <p className="text-sm font-black text-slate-900">{adminData.name}</p>
              <p className="text-xs font-bold text-slate-500">{adminData.role}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-black text-xl border-2 border-blue-200 shadow-sm">👑</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto print:overflow-visible print:bg-white flex flex-col justify-between">
          <div>{children}</div>
          
          <footer className="w-full py-4 text-center border-t border-gray-200 mt-8 print:hidden">
            <a href="https://www.linkedin.com/in/YOUR_LINKEDIN_PROFILE" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 text-slate-400 hover:text-blue-600 transition-colors group">
              <span className="text-[10px] font-bold uppercase tracking-widest">Powered by</span>
              <span className="text-sm font-black tracking-tight group-hover:scale-105 transition-transform text-slate-600">Justtap</span>
            </a>
          </footer>
        </main>
      </div>

    </div>
  );
}