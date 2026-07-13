import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadTaskSnapshot,
} from "firebase/storage";
import { storage } from "./config";

export type UploadProgress = {
  progress: number;
  url?: string;
  error?: string;
};

// =============================================
// UPLOAD FILE WITH PROGRESS
// =============================================
export const uploadFile = (
  file: File,
  path: string,
  onProgress?: (snapshot: UploadTaskSnapshot) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        onProgress?.(snapshot);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
};

// =============================================
// UPLOAD PRODUCT IMAGE
// =============================================
export const uploadProductImage = async (
  file: File,
  productId: string,
  index: number,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const extension = file.name.split(".").pop() || "jpg";
  const path = `products/${productId}/image_${index}_${Date.now()}.${extension}`;
  
  return uploadFile(file, path, (snapshot) => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    onProgress?.(progress);
  });
};

// =============================================
// UPLOAD MULTIPLE IMAGES
// =============================================
export const uploadMultipleImages = async (
  files: File[],
  folder: string,
  onProgress?: (progress: number, index: number) => void
): Promise<string[]> => {
  const urls: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const extension = file.name.split(".").pop() || "jpg";
    const path = `${folder}/${Date.now()}_${i}.${extension}`;
    
    const url = await uploadFile(file, path, (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress?.(progress, i);
    });
    
    urls.push(url);
  }
  
  return urls;
};

// =============================================
// UPLOAD BANNER IMAGE
// =============================================
export const uploadBannerImage = async (
  file: File,
  bannerId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const extension = file.name.split(".").pop() || "jpg";
  const path = `banners/${bannerId}_${Date.now()}.${extension}`;
  
  return uploadFile(file, path, (snapshot) => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    onProgress?.(progress);
  });
};

// =============================================
// UPLOAD CATEGORY IMAGE
// =============================================
export const uploadCategoryImage = async (
  file: File,
  categoryId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const extension = file.name.split(".").pop() || "jpg";
  const path = `categories/${categoryId}_${Date.now()}.${extension}`;
  
  return uploadFile(file, path, (snapshot) => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    onProgress?.(progress);
  });
};

// =============================================
// UPLOAD USER AVATAR
// =============================================
export const uploadUserAvatar = async (
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const extension = file.name.split(".").pop() || "jpg";
  const path = `avatars/${userId}_${Date.now()}.${extension}`;
  
  return uploadFile(file, path, (snapshot) => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    onProgress?.(progress);
  });
};

// =============================================
// DELETE FILE
// =============================================
export const deleteFile = async (url: string): Promise<void> => {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    // File might not exist, ignore error
    console.warn("File deletion failed:", error);
  }
};

// =============================================
// DELETE FOLDER
// =============================================
export const deleteFolder = async (folderPath: string): Promise<void> => {
  const folderRef = ref(storage, folderPath);
  const { items } = await listAll(folderRef);
  
  await Promise.all(items.map((item) => deleteObject(item)));
};

// =============================================
// VALIDATE IMAGE FILE
// =============================================
export const validateImageFile = (
  file: File,
  maxSizeMB = 5
): { valid: boolean; error?: string } => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPG, PNG, WebP are allowed.",
    };
  }
  
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size too large. Maximum ${maxSizeMB}MB allowed.`,
    };
  }
  
  return { valid: true };
};
