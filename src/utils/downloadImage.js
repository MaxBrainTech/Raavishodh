import { Alert, Platform, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';

export const downloadImageFile = async (imageUrl, fileNamePrefix = "image") => {
  try {
    // Ask for storage permission on Android
    if (Platform.OS === 'android') {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );

      if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert("Permission Denied", "Storage permission is required.");
        return;
      }
    }

    const fileName = `${fileNamePrefix}_${Date.now()}.jpg`;
    const downloadDest =
      Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/${fileName}`
        : `${RNFS.DocumentDirectoryPath}/${fileName}`;

    console.log("Saving image to:", downloadDest);

    const result = await RNFS.downloadFile({
      fromUrl: imageUrl,
      toFile: downloadDest,
    }).promise;

    if (result.statusCode === 200) {
      Alert.alert("Download Complete", `Image saved to Downloads folder.`);
    } else {
      throw new Error(`Download failed with status ${result.statusCode}`);
    }
  } catch (error) {
    console.error("Download error:", error);
    Alert.alert("Download Failed", error.message || "An error occurred.");
  }
};
