/**
 * Utility function to upload image files directly from local device to Cloudinary.
 * Saves ONLY the hosted URL in application state / database.
 */
export const uploadToCloudinary = async (file) => {
  if (!file) return null;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'kyic8ha7';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'GraduateWebsite';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || 'فشل رفع الصورة إلى Cloudinary');
  }

  return data.secure_url;
};
