import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, FileText, Lock, RefreshCw, Mail, Phone, MapPin, 
  Send, ArrowLeft, ArrowRight, MessageSquare, CheckCircle2, Clock, HelpCircle, Globe, Award
} from 'lucide-react';

export const LegalAndContactPages = ({ tab }) => {
  const { lang, setActiveTab, addToast } = useApp();

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('GENERAL');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const BackButton = () => (
    <button
      onClick={() => setActiveTab('home')}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black rounded-xl transition shadow-sm border border-slate-200 dark:border-slate-700 mb-6"
    >
      {lang === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
      <span>{lang === 'ar' ? 'العودة إلى الصفحة الرئيسية' : 'Back to Home Page'}</span>
    </button>
  );

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      addToast(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          subject: contactSubject,
          message: contactMessage
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit message');

      setIsSubmitted(true);
      addToast(
        lang === 'ar' 
          ? 'تم إرسال شكواك/استفسارك بنجاح! تم تحويلها إلى لوحة تحكم الإدارة وسيتواصل معك الفريق قريباً.' 
          : 'Your complaint/inquiry has been sent successfully to admin dashboard.',
        'success'
      );
    } catch (err) {
      addToast(lang === 'ar' ? `تعذر إرسال الرسالة: ${err.message}` : `Error sending message: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Terms of Service
  if (tab === 'terms') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <BackButton />

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-cyan-400 shrink-0">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {lang === 'ar' ? 'شروط الخدمة والاستخدام' : 'Terms of Service'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'ar' ? 'آخر تحديث: أغسطس 2026 — منصة NexusPay الرقمية' : 'Last updated: August 2026 — NexusPay Platform'}
              </p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
            <section className="space-y-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400" />
                {lang === 'ar' ? '1. المقدمة والموافقة على الشروط' : '1. Introduction & Acceptance'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                مرحباً بكم في منصة <strong>NexusPay</strong>. بزيارتك للموقع أو إكمال أي عملية شراء لبطاقة أو كود تفعيل أو شحن رصيد محفظة، فإنك توافق التزامياً وبشكل كامل على جميع الشروط والأحكام المدونة في هذه الصفحة.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400" />
                {lang === 'ar' ? '2. طبيعة المنتجات الرقمية والتسليم الفوري' : '2. Digital Products & Instant Fulfiillment'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                جميع المنتجات المباعة في المنصة (شدات ببجي، بطاقات بلايستيشن، أكواد تفعيل، اشتراكات رقمية) هي منتجات رقمية يتم تسليمها فورياً أو معالجتها عبر خوادم الموردين المعتمدين. يتحمل المستخدم مسؤولية التأكد من نوع المنتج والدولة المطلوبة قبل الدفع.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400" />
                {lang === 'ar' ? '3. محفظة المنصة ووسائل الدفع اليمنية' : '3. Platform Wallet & Yemeni Payments'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                الرصيد المشحون في محفظة NexusPay يُستخدم حصرياً لإكمال طلبات الشراء داخل المنصة. تتوفر وسائل الدفع عبر المحافظ الإلكترونية اليمنية (كريمي، جيب، ون كاش، مفلوس) مع تدقيق مرجع التحويل من قبل إدارة المنصة.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400" />
                {lang === 'ar' ? '4. المسؤولية والاستخدام المقبول' : '4. Responsibilities & Fair Usage'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                يلتزم المستخدم بعدم استخدام المنصة لأي أغراض غير قانونية أو احتيالية. تحتفظ إدارة المنصة بحق حظر أي حساب يثبت تلاعبه ببيانات التحويل أو استخدام وسائل غير مصرح بها.
              </p>
            </section>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">
              🔒 NexusPay Guaranteed Security
            </span>
            <button
              onClick={() => setActiveTab('home')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-lg transition"
            >
              {lang === 'ar' ? 'فهمت، العودة للمتجر' : 'I Understand, Go to Store'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Privacy Policy
  if (tab === 'privacy') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <BackButton />

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {lang === 'ar' ? 'سياسة الخصوصية وحماية البيانات' : 'Privacy Policy'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'ar' ? 'حماية بياناتك وأمان معاملاتك هي أولوية منصة NexusPay المطلقة' : 'Your data privacy & transaction security are our highest priority'}
              </p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
            <section className="space-y-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                {lang === 'ar' ? '1. البيانات التي نجمعها' : '1. Information We Collect'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                نجمع فقط البيانات الأساسية اللازمة لإكمال خدماتك: الاسم الكامل، البريد الإلكتروني، رقم الهاتف المسجل، وعناوين التحويلات البنكية للمحافظ المحلية. لا نقوم بتخزين كلمات المرور كنص صريح بل نستخدم تشفير PBKDF2 وHMAC المحمي.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                {lang === 'ar' ? '2. تخزين الصور والوسائط عبر Cloudinary' : '2. Image Hosting via Cloudinary'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                لحفظ أداء المنصة وسرعة التصفح، يتم رفع صور المنتجات وإيصالات الإيداع وتخزينها الآمن عبر منصة <strong>Cloudinary العالمية</strong> وتخزين الرابط فقط في قواعد بياناتنا.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                {lang === 'ar' ? '3. عدم مشاركة البيانات مع أي طرف ثالث' : '3. Zero Data Sharing Policy'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                نضمن لك عدم بيع أو مشاركة بياناتك الشخصية مع أي شركات تسويقية أو أطراف خارجية تحت أي ظرف من الظروف.
              </p>
            </section>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              ✓ SSL 256-Bit Encrypted Platform
            </span>
            <button
              onClick={() => setActiveTab('home')}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg transition"
            >
              {lang === 'ar' ? 'العودة للمتجر الرئيسي' : 'Back to Store'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Refund Policy
  if (tab === 'refund') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <BackButton />

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 shrink-0">
              <RefreshCw className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {lang === 'ar' ? 'سياسة الاسترجاع والتعويض' : 'Refund & Exchange Policy'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'ar' ? 'ضمان التفعيل وحق التعويض في حالات الأكواد غير الشغالة' : 'Official Code Replacement & Refund Guarantees'}
              </p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
            <section className="space-y-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                {lang === 'ar' ? '1. ضمان الكود الصحيح وتحدّي التفعيل' : '1. Valid Code Guarantee'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                تضمن منصة NexusPay أن جميع بطاقات الهدايا وأكواد التفعيل صادرة من الموزعين الرسميين. في حال واجهت أي كود معطوب أو مُستخدم سابقاً، يتم استبداله فوراً بكود جديد بعد فحص الدعم الفني.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                {lang === 'ar' ? '2. مهلة الإبلاغ وتأكيد الطلب' : '2. Reporting Timeframe'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                يرجى الإبلاغ عن أي خطأ في المنتج الرقمي خلال <strong>24 ساعة</strong> من تاريخ استلام الطلب من خلال التواصل مع الدعم الفني وتزويدهم برقم الطلب.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-500" />
                {lang === 'ar' ? '3. إعادة المبلغ إلى المحفظة' : '3. Wallet Credit Refund'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                في حال تعذر توفير كود بديل للمنتج المطلوب، سيتم إضافة قيمة المنتج مباشرة إلى <strong>محفظتك في NexusPay</strong> لتتمكن من الشراء بها في أي وقت.
              </p>
            </section>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">
              💎 100% Customer Satisfaction Guarantee
            </span>
            <button
              onClick={() => setActiveTab('home')}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-xl shadow-lg transition"
            >
              {lang === 'ar' ? 'العودة للمتجر الرئيسي' : 'Back to Store'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Contact Us (Default for 'contact')
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <BackButton />

      <div className="grid grid-cols-1 lg:col-span-12 gap-8">
        
        {/* Left/Main Column: Interactive Contact Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-cyan-400 shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                {lang === 'ar' ? 'تواصل معنا — فريق الدعم الفني' : 'Contact Support'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'ar' ? 'يسعدنا الرد على استفساراتك ومساعدتك في أي وقت' : 'We are here to help 24/7 with any question'}
              </p>
            </div>
          </div>

          {isSubmitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl">
                ✓
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {lang === 'ar' ? 'تم استلام رسالتك بنجاح!' : 'Message Received!'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                {lang === 'ar'
                  ? `شكراً لك يا ${contactName}. تم تحويل طلبك لخدمة العملاء وستصلك إجابة شاملة على بريدك الإلكتروني: ${contactEmail}`
                  : `Thank you ${contactName}. Our team will review your query and reply to ${contactEmail}`}
              </p>
              <button
                onClick={() => { setIsSubmitted(false); setContactMessage(''); }}
                className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-black rounded-xl hover:bg-slate-200 transition"
              >
                {lang === 'ar' ? 'إرسال رسالة أخرى' : 'Send Another Message'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {lang === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                  </label>
                  <input
                    type="text" required value={contactName} onChange={e => setContactName(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: أحمد محمود' : 'e.g. John Doe'}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {lang === 'ar' ? 'البريد الإلكتروني *' : 'Email Address *'}
                  </label>
                  <input
                    type="email" required value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {lang === 'ar' ? 'موضوع الاستفسار' : 'Subject'}
                </label>
                <select
                  value={contactSubject} onChange={e => setContactSubject(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GENERAL">{lang === 'ar' ? 'استفسار عام عن المنتجات' : 'General Inquiry'}</option>
                  <option value="TOPUP">{lang === 'ar' ? 'مساعدة في شحن المحفظة (كريمي / جيب / ون كاش)' : 'Wallet Topup Issue'}</option>
                  <option value="ORDER">{lang === 'ar' ? 'استفسار عن طلب أو كود تفعيل' : 'Order or Code Issue'}</option>
                  <option value="BUSINESS">{lang === 'ar' ? 'شراكة تجارية وتزويد منتجات' : 'Business Partnership'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {lang === 'ar' ? 'نص الرسالة *' : 'Message *'}
                </label>
                <textarea
                  rows={4} required value={contactMessage} onChange={e => setContactMessage(e.target.value)}
                  placeholder={lang === 'ar' ? 'اكتب تفاصيل استفسارك أو رقم الطلب هنا...' : 'Describe your question or include order reference...'}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit" disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{lang === 'ar' ? 'جاري الإرسال...' : 'Sending...'}</>
                ) : (
                  <><Send className="w-4 h-4" />{lang === 'ar' ? 'إرسال الرسالة إلى الدعم الفني' : 'Submit Message'}</>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Direct Channels & Support Details */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-base font-black flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {lang === 'ar' ? 'الدعم الفني المباشر 24/7' : 'Instant Direct Support'}
            </h3>
            <p className="text-xs leading-relaxed text-blue-100 font-semibold">
              {lang === 'ar'
                ? 'فريقنا متواجد على مدار الساعة لخدمتكم وإكمال عمليات الإيداع في اليمن بسرعة فائقة.'
                : 'Our support specialists in Yemen are online 24/7 for instant assistance.'}
            </p>
            <div className="pt-2 space-y-3">
              <a
                href="https://wa.me/967784746159" target="_blank" rel="noreferrer"
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition"
              >
                💬 {lang === 'ar' ? 'محادثه واتساب المباشرة (+967 784 746 159)' : 'WhatsApp Support (+967 784 746 159)'}
              </a>
              <a
                href="https://t.me/nexuspay_support" target="_blank" rel="noreferrer"
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition"
              >
                ✈️ {lang === 'ar' ? 'قناة التليجرام والدعم' : 'Telegram Support Channel'}
              </a>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4 text-xs font-bold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-500 shrink-0" />
              <div>
                <p className="text-slate-400 text-[10px]">{lang === 'ar' ? 'ساعات العمل' : 'Working Hours'}</p>
                <p>{lang === 'ar' ? '24 ساعة / 7 أيام في الأسبوع' : '24 Hours / 7 Days a week'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-purple-500 shrink-0" />
              <div>
                <p className="text-slate-400 text-[10px]">{lang === 'ar' ? 'البريد الرسمي' : 'Official Email'}</p>
                <p className="font-mono">support@nexuspaystore.com</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
