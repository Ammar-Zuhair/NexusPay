import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, ArrowLeft, ShieldCheck, Tag } from 'lucide-react';

export const CartDrawer = () => {
  const { 
    lang, 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateCartQuantity, 
    setActiveTab 
  } = useApp();

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.priceSAR || (item.priceUSD ? item.priceUSD * 3.75 : 37.50);
    return sum + (itemPrice * item.quantity);
  }, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = Math.max(0, subtotal - discountAmount);

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'NEXUS10') {
      setDiscount(10);
      setPromoApplied(true);
    } else {
      alert(lang === 'ar' ? 'كوبون غير صالح (جرب: NEXUS10)' : 'Invalid coupon code (Try: NEXUS10)');
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setActiveTab('checkout');
  };

  const BackIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      <div className={`fixed inset-y-0 ${lang === 'ar' ? 'left-0' : 'right-0'} max-w-full flex pl-10`}>
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between border-l dark:border-slate-800">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                {lang === 'ar' ? 'عربة التسوق' : 'Shopping Cart'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-cyan-300 text-xs font-bold">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-slate-500 text-sm">
                  {lang === 'ar' ? 'سلة التسوق فارغة حالياً' : 'Your shopping cart is empty'}
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setActiveTab('browse');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 transition-colors"
                >
                  {lang === 'ar' ? 'تصفح الألعاب والبطاقات' : 'Browse Top-ups'}
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={`${item.id}-${item.playerId}`}
                  className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60"
                >
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0" 
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {item.title}
                    </h4>
                    {item.playerId && (
                      <p className="text-xs text-blue-600 dark:text-cyan-400 font-medium">
                        ID: {item.playerId}
                      </p>
                    )}
                    <p className="font-extrabold text-blue-600 dark:text-cyan-400 text-sm mt-1">
                      {((item.priceSAR || (item.priceUSD ? item.priceUSD * 3.75 : 37.50)) * item.quantity).toFixed(2)} SAR
                    </p>
                  </div>

                  <div className="flex flex-col justify-between items-end">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Summary */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 space-y-4">
              
              {/* Promo Code Input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder={lang === 'ar' ? 'كود الخصم (NEXUS10)' : 'Promo Code (NEXUS10)'}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={applyPromo}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors"
                >
                  {lang === 'ar' ? 'تطبيق' : 'Apply'}
                </button>
              </div>

              {promoApplied && (
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {lang === 'ar' ? 'تم تطبيق خصم 10% بنجاح' : '10% discount applied'}
                </p>
              )}

              {/* Price Calculation */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>{lang === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                  <span>{subtotal.toFixed(2)} SAR</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>{lang === 'ar' ? 'الخصم (10%):' : 'Discount (10%):'}</span>
                    <span>-{discountAmount.toFixed(2)} SAR</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-base text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>{lang === 'ar' ? 'الإجمالي:' : 'Total:'}</span>
                  <span className="text-blue-600 dark:text-cyan-400">{total.toFixed(2)} SAR</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <span>{lang === 'ar' ? 'الاستمرار للشراء والدفع' : 'Proceed to Checkout'}</span>
                <BackIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
