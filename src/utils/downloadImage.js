import { Alert, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import CameraRoll from '@react-native-camera-roll/camera-roll';

export const downloadImageFile = async (imageUrl, fileNamePrefix = "image") => {
  try {
    
    if (Platform.OS === 'android') {
      const permission = await request(
        Platform.Version >= 33
          ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
          : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
      );

      if (permission !== RESULTS.GRANTED) {
        Alert.alert("Permission Denied", "Storage permission is required.");
        return;
      }
    }

    const fileName = `${fileNamePrefix}_${Date.now()}.jpg`;
    const localPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

    console.log("Downloading to:", localPath);

   
    const downloadResult = await RNFS.downloadFile({
      fromUrl: imageUrl,
      toFile: localPath,
    }).promise;

    console.log("Download result:", downloadResult);

   
    if (downloadResult.statusCode === 200) {
      const savedPath = await CameraRoll.save(localPath, {
        type: 'photo',
        album: 'MyAIImages',
      });

      console.log("Saved to gallery:", savedPath);

      Alert.alert("Download Complete", "Image saved to your Gallery.");
    } else {
      throw new Error(`Download failed with status ${downloadResult.statusCode}`);
    }

  } catch (err) {
    console.error("Download error:", err);
    Alert.alert("Download Failed", err.message || "An error occurred.");
  }
};
