import { useState } from "react";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { request, PERMISSIONS } from "react-native-permissions";
import { Platform } from "react-native";
import { checkFileSize } from "../utils/fileUtils";
import useUsageGuard from "./useUsageGuard";

/**
 * Handles image selection (camera/gallery) + file size check + usage guard.
 * @param {string} usageKey - key for usage tracking (e.g., "ghibli_usage_count")
 */
export default function useImageHandler(usageKey) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { checkUsage, incrementUsage } = useUsageGuard(usageKey);

  // Request permissions
  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      await request(PERMISSIONS.ANDROID.CAMERA);
      await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    } else {
      await request(PERMISSIONS.IOS.CAMERA);
      await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    }
  };

  // Validate and set selected image
  const handleFile = async (uri) => {
    setLoading(true);
    setError("");

    const { valid, message } = await checkFileSize(uri, 10);
    if (!valid) {
      setError(message);
      setLoading(false);
      return false;
    }

    setSelectedImage(uri);
    setLoading(false);
    return true;
  };

  // Open Camera
  const pickFromCamera = async () => {
    await requestPermissions();

    const allowed = await checkUsage();
    if (!allowed) return false;

    return new Promise((resolve) => {
      launchCamera({ mediaType: "photo", quality: 1 }, async (response) => {
        if (!response.didCancel && response.assets?.length > 0) {
          const success = await handleFile(response.assets[0].uri);
          resolve(success);
        } else {
          resolve(false);
        }
      });
    });
  };

  // Open Gallery
  const pickFromGallery = async () => {
    await requestPermissions();

    const allowed = await checkUsage();
    if (!allowed) return false;

    return new Promise((resolve) => {
      launchImageLibrary({ mediaType: "photo", quality: 1 }, async (response) => {
        if (!response.didCancel && response.assets?.length > 0) {
          const success = await handleFile(response.assets[0].uri);
          resolve(success);
        } else {
          resolve(false);
        }
      });
    });
  };

  return {
    selectedImage,
    setSelectedImage,
    loading,
    error,
    pickFromCamera,
    pickFromGallery,
    incrementUsage, 
  };
}
