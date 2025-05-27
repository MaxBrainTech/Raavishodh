import React, { useState } from "react";
import { 
  View, Text, Image,  StyleSheet, 
  FlatList, ActivityIndicator, Alert ,TouchableOpacity
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import FeatureLayout from "../component/FeatureLayout";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from '@react-navigation/native';
import RNFS from "react-native-fs";
import { REPLICATE_API_TOKEN } from '@env';
import {auth} from "../services/Firebase"
import Btn from "../component/Btn";
import AsyncStorage from '@react-native-async-storage/async-storage';
import useDailyUsage from "../hook/useDailyUsage";

export default function PhotoRestoration() { 
  const [showTutorial, setShowTutorial] = useState(true);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const navigation = useNavigation();

  const guestLimit = 1;
   const loggedInLimit = 1;
   
   const { usageCount, limit, incrementUsage, isLoggedIn } = useDailyUsage(
     "ghibli_usage_count",
     loggedInLimit,
     guestLimit
   );
   

  const tutorialSteps = [
  {
    title: "Upload Your Image",
    description:
      "• Click the button below to select an image.\n• Max file size: 10MB.\n• Supported formats: JPEG, PNG, WebP.",
  }
];

  const pickImage = () => {
    launchImageLibrary({ mediaType: "photo", quality: 1 }, (response) => {
      if (!response.didCancel && response.assets?.length > 0) {
        setShowTutorial(false);
        setImage(response.assets[0].uri);
        setProcessedImage(null);
      } else if (response.errorMessage) {
        console.log("ImagePicker Error: ", response.errorMessage);
        Alert.alert("Error", "Failed to pick an image.");
      }
    });
  };

  const generateNewFeatureImage = async () => {
    if (!image) {
      Alert.alert("Error", "Please select an image first.");
      return;
    }
 if (usageCount >= limit) {
      if (!isLoggedIn) {
        Alert.alert(
          "Guest Limit Reached",
          "You’ve already used your free attempt today. Please log in to continue.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Login",
              onPress: () =>
                navigation.navigate("Login", { redirectTo: "PhotoRestoration" }),
            },
          ]
        );
      } else {
        Alert.alert("Limit Reached", "You’ve already used your daily limit.");
      }
     return ;
    
  };
    setLoading(true);

    try {
      const base64Image = await RNFS.readFile(image, "base64");
      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify({
          version: "cc4956dd26fa5a7185d5660cc9100fab1b8070a1d1654a8bb5eb6d443b020bb2", 
          input: {
            image: `data:image/jpeg;base64,${base64Image}`,
            upscale: 2,
      face_upsample: true,
      background_enhance: true,
      codeformer_fidelity: 0.1
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process image");
      }

      const data = await response.json();
      const resultUrl = await checkReplicateStatus(data.urls.get);

      if (resultUrl) {
        setProcessedImage(resultUrl);
         incrementUsage();
      } else {
        Alert.alert("Error", "Failed to get processed image.");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      Alert.alert("Error", "An error occurred while processing the image.");
    }

    setLoading(false);
  };

  const checkReplicateStatus = async (statusUrl) => {
    try {
      while (true) {
        const response = await fetch(statusUrl, {
          headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch status");
        }

        const data = await response.json();

        if (data.status === "succeeded") {
          return data.output;
        } else if (data.status === "failed") {
          return null;
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error("Error checking status:", error);
      return null;
    }
  };

  const downloadImage = async () => {
    if (!processedImage) {
      Alert.alert("Error", "No image to download!");
      return;
    }

    try {
      const fileName = `processed_${Date.now()}.jpg`;
      const folderPath = `${RNFS.PicturesDirectoryPath}/PhotoRestorationApp`;
    
    
    await RNFS.mkdir(folderPath);
    const downloadPath = `${folderPath}/${fileName}`;

      const downloadResult = await RNFS.downloadFile({
        fromUrl: processedImage,
        toFile: downloadPath,
      }).promise;

      if (downloadResult.statusCode === 200) {
        Alert.alert("Download Complete", `Image saved to ${downloadPath}`);
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Download Error:", error);
      Alert.alert("Error", error.message || "Failed to download image");
    }
  };

  return (
     <LinearGradient colors={["#0d1117", "#8ec5fc"]} style={styles.gradient}>
    <FlatList
      data={[]}
      keyExtractor={(_, index) => index.toString()}
      ListHeaderComponent={
        <View style={styles.container}>
        <FeatureLayout
                title="Photo Restoration"
                description="Restore your Old Photos with AI"
              />

          {!image && showTutorial && (
            <View style={styles.tutorialContainer}>
              <Text style={styles.tutorialTitle}>{tutorialSteps[0].title}</Text>
              <Text style={styles.tutorialText}>{tutorialSteps[0].description}</Text>
            </View>
          )}

          {!image && (
            <Btn title="Upload Image" onPress={pickImage} />
          )}

          {image && (
            <View>
              <Text style={styles.resultText}>Selected Image</Text>
              <Image source={{ uri: image }} style={styles.image} />
            </View>
          )}

          {image && !processedImage && (
            <View style={styles.button}>
            <Btn title="Generate Image"
             onPress={generateNewFeatureImage}
              disabled={loading} />
                         
            </View>
          )}

          {loading && <ActivityIndicator size="large" color="#fff" style={styles.loader} />}

          {processedImage && (
            <View>
              <Text style={styles.resultText}>Result Image</Text>
              <Image source={{ uri: processedImage }} style={styles.image} />
             
              <Btn title="Download Image"
             onPress={downloadImage} />
                          
            </View>
          )}
        </View>
      }
    />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    color: "#fff",
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
 tutorialContainer: {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  padding: 16,
  borderRadius: 20,
  marginBottom: 20,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
},
tutorialTitle: {
  color: "#ffffff",
  fontSize: 20,
  fontWeight: "600",
  marginBottom: 8,
},
tutorialText: {
  color: "#d1d5db",
  fontSize: 14,
  textAlign: 'left',
  lineHeight: 20,
},
  image: {
    width: 200,
    height: 200,
    marginTop: 10,
    borderRadius: 10,
    marginBottom: 20,
    alignSelf: "center",
  },
  loader: {
    marginTop: 10,
  },
  resultText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  
});
