import { Platform } from "react-native";
import RNFS from "react-native-fs";

export const downloadImageFile = async (imageUrl, fileNamePrefix = "image") => {
  try {
    const fileName = `${fileNamePrefix}_${Date.now()}.jpg`;
    const downloadDest =
      Platform.OS === "android"
        ? `${RNFS.DownloadDirectoryPath}/${fileName}`
        : `${RNFS.DocumentDirectoryPath}/${fileName}`;

    console.log("Saving image to:", downloadDest);

    const result = await RNFS.downloadFile({
      fromUrl: imageUrl,
      toFile: downloadDest,
    }).promise;

    if (result.statusCode !== 200) {
      throw new Error("Failed to download image");
    }

    return downloadDest; 
  } catch (error) {
    console.error("Download error:", error);
    throw new Error("Unable to save the image. Please try again later.");
  }
};
