import React, { useState } from 'react';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadToCloudinary } from '../utils/cloudinary';

export const ImageUploadInput = ({ 
  value, 
  onChange, 
  placeholder = "أدخل رابط الصورة أو اختر من الجهاز...", 
  label = "صورة / شعار" 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const url = await uploadToCloudinary(file);
      if (url) {
        onChange(url);
      }
    } catch (err) {
      console.error('Cloudinary Upload Error:', err);
      setUploadError(err.message || 'فشل رفع الصورة');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-1.5 text-right rtl:text-right">
      {label && <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">{label}</label>}
      
      <div className="flex gap-2 items-center">
        {/* Direct URL text input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs font-bold text-slate-900 dark:text-white"
          />
        </div>

        {/* Upload File Button */}
        <label className={`px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer shrink-0 ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}>
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>جاري الرفع...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" />
              <span>رفع صورة ☁️</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>

        {/* Live Image Preview Thumbnail */}
        {value && (
          <div className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
            <img src={value} alt="معاينة" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-[11px] font-bold text-rose-500 mt-0.5">⚠️ {uploadError}</p>
      )}
    </div>
  );
};
