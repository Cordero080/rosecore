/**
 * Cloudinary Upload Utility
 *
 * SETUP: Create a free Cloudinary account at https://cloudinary.com
 * Then create an "unsigned upload preset" in Settings > Upload
 *
 * Set these in your .env file:
 * VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
 * VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
 */
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";

/**
 * Upload an image to Cloudinary
 * @param {File} file - The file to upload
 * @returns {Promise<{url: string, publicId: string}>} - The uploaded image URL
 */
export const uploadToCloudinary = async (file) => {
  if (!file) throw new Error("No file provided");

  // Validate it's an image
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  // Max 10MB
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File size must be less than 10MB");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "numeneon"); // Organize uploads in a folder

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Upload failed");
    }

    const data = await response.json();

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

/**
 * Check if Cloudinary is configured
 */
export const isCloudinaryConfigured = () => {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
};

export default uploadToCloudinary;
