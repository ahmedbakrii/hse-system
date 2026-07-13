import Link from 'next/link';

export const metadata = {
  title: 'Energia HSE | نظام إدارة السلامة',
  description: 'نظام إدارة تدريب واعتمادات المشغلين لشركة إنيرجيا',
};

export default function Home() {
  return (
    <main dir="rtl" className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      
      {/* هيدر الصفحة */}
      <nav className="p-8 flex justify-between items-center border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xl shadow-lg shadow-blue-900/20">🛡️</div>
          <h1 className="text-xl font-black tracking-tight">Energya HSE</h1>
        </div>
      </nav>

      {/* القسم الرئيسي */}
      <div className="flex-grow flex flex-col items-center justify-center w-full px-4 text-center">
        
        {/* شارة إضافية تعطي طابع احترافي */}
        <span className="px-4 py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-blue-900">
          Industrial Safety Portal
        </span>

        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
          نظام إدارة السلامة
        </h1>
        
        <p className="max-w-xl text-lg text-slate-400 mb-12 font-medium leading-relaxed">
          نظام متكامل لإدارة اعتمادات المشغلين وتدريب السلامة المهنية داخل مصانع إنيرجيا.
        </p>

        {/* كروت الدخول */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          
          {/* الكارت الأول: بوابة الإدارة */}
          <Link href="/admin-login" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-blue-500 transition-all group shadow-xl flex flex-col items-center justify-center text-center">
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform"></span>
            <h3 className="text-xl font-black mb-2 group-hover:text-blue-400">بوابة الإدارة</h3>
            <p className="text-slate-500 font-bold text-sm">تسجيل دخول للمديرين</p>
          </Link>
          
          {/* الكارت الثاني: بوابة المشرفين */}
          <Link href="/login" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-green-500 transition-all group shadow-xl flex flex-col items-center justify-center text-center">
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform"></span>
            <h3 className="text-xl font-black mb-2 group-hover:text-green-400">بوابة المشرفين</h3>
            <p className="text-slate-500 font-bold text-sm">تسجيل دخول مشرف السلامة</p>
          </Link>

        </div>
      </div>

      {/* الفوتر */}
      <footer className="w-full py-8 border-t border-slate-900 text-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Powered by</p>
          <a href="https://jus-tt-ap.com" target="_blank" rel="noopener noreferrer" className="text-white font-black hover:text-blue-400 transition-colors">
            Justtap Smart NFC Solutions‎‏ 
          </a>
          <p className="text-slate-600 text-xs mt-2 font-bold">© 2026 Energya Steel - All Rights Reserved</p>
        </div>
      </footer>

    </main>
  );
}
