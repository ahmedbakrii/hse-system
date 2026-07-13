import Link from 'next/link';

export default function Home() {
  return (
    <main dir="rtl" className="min-h-screen flex flex-col items-center justify-between bg-black text-white font-sans">
      
      {/* القسم الرئيسي (Hero Section) */}
      <div className="flex-grow flex flex-col items-center justify-center w-full px-4 text-center">
        
        {/* لمسة تصميمية بسيطة باللون الذهبي */}
        <div className="w-16 h-1 bg-yellow-500 mb-8 rounded-full"></div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          لوحة تحكم نظام السلامة
        </h1>
        <h2 className="text-2xl md:text-3xl font-light text-gray-300 mb-8">
          شركة إنيرجيا
        </h2>

        <p className="max-w-xl text-lg text-gray-400 mb-12 leading-relaxed">
          النظام الشامل لمتابعة وتدريب المشغلين.
        </p>

        {/* زر الدخول للوحة التحكم */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/admin" 
            className="px-8 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors duration-300 shadow-lg shadow-yellow-500/20"
          >
            الدخول إلى النظام
          </Link>
        </div>
      </div>

      {/* الفوتر (الذي يحتوي على الحقوق) */}
      <footer className="w-full py-8 border-t border-gray-800 text-sm text-gray-400 flex flex-col items-center justify-center gap-3">
        <p className="flex items-center gap-1">
         powered by
          <a
            href="https://www.jus-tt-ap.com/" // استبدل هذا برابط موقع Justtap الخاص بك
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-500 hover:text-yellow-400 font-bold transition-colors mx-1"
          >
            Justtap
          </a>
        </p>
        <p className="flex items-center gap-1">
            designed by          <a
            href="https://www.linkedin.com/in/ahmed-salah-5b0567197?utm_source=share_via&utm_content=profile&utm_medium=member_android" // استبدل هذا برابط حسابك على لينكد إن
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-300 font-semibold transition-colors mx-1 underline decoration-gray-600 underline-offset-4"
          >
            Ahmed Salah
          </a>
        </p>
      </footer>

    </main>
  );
}
