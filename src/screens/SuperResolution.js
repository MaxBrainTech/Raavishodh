import React, { useState, useEffect } from "react";
import {
  View, Text, Image, StyleSheet,
  FlatList, ActivityIndicator, Alert
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import LinearGradient from "react-native-linear-gradient";
import FeatureLayout from "../component/FeatureLayout";
import RNFS from "react-native-fs";
import { REPLICATE_API_TOKEN } from "@env";
import Btn from "../component/Btn";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../services/Firebase";

export default function SuperResolution() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [enhancedImage, setEnhancedImage] = useState(null);
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
        setEnhancedImage(null);
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
    const useLimit = 1;
    const useCountStr = await AsyncStorage.getItem(usageKey);
    const useCount = parseInt(useCountStr || '0', 10);

    if (useCount >= useLimit) {
      Alert.alert(
        "Usage Limit Reached",
        user
          ? "You’ve used your 1 free attempt for today."
          : "You’ve used your free attempt. Log in to get one more use.",
        [
          { text: "Cancel", style: "cancel" },
          ...(!user ? [{ text: "Login", onPress: () => navigation.navigate("Login", { redirectTo: "SuperResolution" }) }] : []),
        ]
      );
      return false;
    }

    await AsyncStorage.setItem(usageKey, (useCount + 1).toString());
    return true;
  };

  const processImage = async () => {
    if (!image) return Alert.alert("Error", "No image selected!");
    const isAllowed = await checkUsageLimit();
    if (!isAllowed) return;

    setProcessing(true);
    setEnhancedImage(null);

    try {
      const base64Image = await RNFS.readFile(image, "base64");

      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify({
          version: "f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa", // face enhancement model
          input: {
            image: `data:image/jpeg;base64,${base64Image}`,
            scale: 2,
            face_enhance: true,
          },
        }),
      });

      const result = await response.json();
      if (result?.error) throw new Error(result.error);

      let prediction = result;
      while (prediction.status === "starting" || prediction.status === "processing") {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const checkResponse = await fetch(
          `https://api.replicate.com/v1/predictions/${prediction.id}`,
          {
            headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
          }
        );
        prediction = await checkResponse.json();
      }

      if (prediction.status === "succeeded") {
        setEnhancedImage(prediction.output);
      } else {
        throw new Error(`Failed with status: ${prediction.status}`);
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to enhance image");
      console.error("Enhancement Error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = async () => {
    if (!enhancedImage) {
      Alert.alert("Error", "No image to download!");
      return;
    }

    try {
      const fileName = `enhanced_${Date.now()}.jpg`;
      const downloadPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      const result = await RNFS.downloadFile({
        fromUrl: enhancedImage,
        toFile: downloadPath,
      }).promise;

      if (result.statusCode === 200) {
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
              title="AI Super Resolution"
              description="Enhance facial features using our advanced AI technology."
            />

            {!image && showTutorial && (
              <View style={styles.tutorialContainer}>
                <Text style={styles.tutorialTitle}>{tutorialSteps[0].title}</Text>
                <Text style={styles.tutorialText}>{tutorialSteps[0].description}</Text>
              </View>
            )}

            {!image && <Btn title="Upload Image" onPress={pickImage} />}

            {image && (
              <View>
                <Text style={styles.resultText}>Selected Image</Text>
                <Image source={{ uri: image }} style={styles.image} />
              </View>
            )}

            {image && !enhancedImage && (
              <View style={styles.button}>
                <Btn
                  title="Resolute Image"
                  onPress={processImage}
                  disabled={processing}
                />
              </View>
            )}

            {processing && <ActivityIndicator size="large" color="#fff" style={styles.loader} />}

            {enhancedImage && (
              <View>
                <Text style={styles.resultText}>Enhanced Image</Text>
                <Image source={{ uri: enhancedImage }} style={styles.image} />
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
  button: {
    marginVertical: 10,
  },
});
