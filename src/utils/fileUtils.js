import RNFS from "react-native-fs";

/**
 * Check if the file size is under the allowed limit.
 * @param {string} uri - File URI
 * @param {number} maxMB - Maximum file size in MB (default 10MB)
 * @returns {Promise<{ valid: boolean, message: string }>}
 */
export const checkFileSize = async (uri, maxMB = 10) => {
  try {
    const fileStats = await RNFS.stat(uri);
    const fileSizeMB = fileStats.size / (1024 * 1024);

    if (fileSizeMB >= maxMB) {
      return {
        valid: false,
        message: `Image size exceeds ${maxMB} MB. Please upload a smaller image.`,
      };
    }

    return { valid: true, message: "File size is valid" };
  } catch (err) {
    return {
      valid: false,
      message: "Could not check file size. Please try again.",
    };
  }
};
