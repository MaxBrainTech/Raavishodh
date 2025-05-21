import React, { useState ,useEffect } from "react";
import {
  View, Text, Image, StyleSheet,
  FlatList, ActivityIndicator, Alert
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import LinearGradient from "react-native-linear-gradient";
import FeatureLayout from "../component/FeatureLayout";
import RNFS from "react-native-fs";
import { REPLICATE_API_TOKEN } from '@env';
import Btn from "../component/Btn";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {auth} from "../services/Firebase"

export default function BwColourization() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const navigation = useNavigation();
  
  const tutorialSteps = [
    {
      title: "Upload Your Image",
      description:
        "• Click the button below to select an image.\n• Max file size: 10MB.\n• Supported formats: JPEG, PNG, WebP.",
    }
  ];
  
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
    setUser(firebaseUser);
    setAuthChecked(true);
  });

  return () => unsubscribe();
}, []);

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

  
  const checkUsageLimit = async () => {
   if (!authChecked) {
  Alert.alert("Please wait", "Checking login status...");
  return false;
}
  const today = new Date().toISOString().split('T')[0];
  const usageKey = user ? `usage_${user.uid}_${today}` : `guest_usage_${today}`;
  const useLimit = user ? 1 : 1;
  const useCountStr = await AsyncStorage.getItem(usageKey);
  const useCount = parseInt(useCountStr || '0', 10);

 console.log(`Checking usage: key=${usageKey}, count=${useCount}, limit=${useLimit}`);

    if (useCount >= useLimit) {
    Alert.alert(
  "Usage Limit Reached",
  user
    ? "You’ve used your 1 free attempts for today."
    : "You’ve used your free attempt for today. Please log in to get one more use.",
  [
    { text: "Cancel", style: "cancel" },
    ...(!user ? [{ text: "Login", onPress: () => navigation.navigate("Login", { redirectTo: "BwColourization" }) }] : []),
  ]
);

      return false;
    }

    await AsyncStorage.setItem(usageKey, (useCount + 1).toString());
    return true;
  };

  const generateColorizedImage = async () => {
    if (!image) {
      Alert.alert("Error", "Please select an image first.");
      return;
    }

    const isAllowed = await checkUsageLimit();
    if (!isAllowed) {
      return;  // If usage limit is reached, stop further execution
    }
    setLoading(true);

    try {
      const base64Image = await RNFS.readFile(image, "base64");
      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify({
          version: "ca494ba129e44e45f661d6ece83c4c98a9a7c774309beca01429b58fce8aa695",
          input: {
            image: `data:image/jpeg;base64,${base64Image}`,
            model_size: "large",
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
      const fileName = `colorized_${Date.now()}.jpg`;
      const downloadPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

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
                title="B & W Colorization"
                description=" Bring black & white photos to life with colors."
                
              />

            {!image && showTutorial && (
              <View style={styles.tutorialContainer}>
                <Text style={styles.tutorialTitle}>{tutorialSteps[0].title}</Text>
                <Text style={styles.tutorialText}>{tutorialSteps[0].description}</Text>
              </View>
            )}

            {!image && (
              <Btn
                title="Upload Image"
                onPress={pickImage}>
              </Btn>
            )}

            {image && (
              <View>
                <Text style={styles.resultText}>Selected Image</Text>
                <Image source={{ uri: image }} style={styles.image} />
              </View>
            )}

            {image && !processedImage && (
              <View style={styles.button}>
                <Btn
                  title="Generate Image"
                  onPress={generateColorizedImage}
                  disabled={loading}
                />
              </View>
            )}

            {loading && <ActivityIndicator size="large" color="#fff" style={styles.loader} />}

            {processedImage && (
              <View>
                <Text style={styles.resultText}>Colorized Image</Text>
                <Image source={{ uri: processedImage }} style={styles.image} />
                <View style={styles.button}>
                  <Btn title="Download Image" onPress={downloadImage} />
                </View>
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
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  tutorialTitle: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  tutorialText: {
    color: "black",
    fontSize: 14,
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
