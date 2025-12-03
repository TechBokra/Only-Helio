// -------------------------------------------------------------------------
// CONFIGURATION
// -------------------------------------------------------------------------
// Priority: Environment Variables -> Hardcoded Fallback (Dev Only)

const CLOUD_NAME = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || 'dwg0hr34g';
const UPLOAD_PRESET = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || 'onlyhelio_uploads';
const API_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

if (!(import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME) {
    console.info('🔵 [Cloudinary] Using fallback credentials. Setup .env for production.');
}

interface CloudinaryResponse {
    secure_url: string;
    public_id: string;
    [key: string]: any;
}

/**
 * Uploads a file to Cloudinary using the unsigned upload preset.
 * @param file The file object to upload
 * @returns Promise resolving to the secure URL of the uploaded image
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
    if (!file) throw new Error("No file provided for upload.");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    // Optional: Add folder if needed in future
    // formData.append('folder', 'only_helio_properties');

    console.debug(`[Cloudinary] Starting upload: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error?.message || `Upload failed with status ${response.status}`;
            console.error("[Cloudinary] Upload failed:", errorData);
            throw new Error(errorMessage);
        }

        const data: CloudinaryResponse = await response.json();
        console.debug(`[Cloudinary] Success: ${data.secure_url}`);
        return data.secure_url;
    } catch (error: any) {
        console.error('[Cloudinary] Network/Upload Error:', error);
        // Rethrow with user-friendly message if possible, or keep technical detail
        throw new Error(error.message || 'Failed to connect to image server. Please check your internet connection.');
    }
};