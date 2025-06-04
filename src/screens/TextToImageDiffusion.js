import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image, Modal, TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  FlatList
} from "react-native";
import { Card } from "react-native-paper";
import FastImage from 'react-native-fast-image';
import Slider from "@react-native-community/slider";
import axios from "axios";
import LinearGradient from "react-native-linear-gradient";
import Btn from "../component/Btn";
import useDailyUsage from "../hook/useDailyUsage";
import { REPLICATE_API_TOKEN } from "@env";

export default function TextToImageDiffusion({ navigation }) {
  const [prompt, setPrompt] = useState("");
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [inferenceSteps, setInferenceSteps] = useState(50);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(true);

  const guestLimit = 1;
  const loggedInLimit = 2;

  const { usageCount, limit, incrementUsage, isLoggedIn } = useDailyUsage(
    "text_to_image_usage",
    loggedInLimit,
    guestLimit
  );

  const generateImage = async () => {
    if (!prompt) {
      Alert.alert("Error", "Please enter a prompt.");
      return;
    }
    if (!isLoggedIn && usageCount >= guestLimit) {
      Alert.alert(
        "Login Required",
        "Log in to use this feature again today.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Login",
            onPress: () => navigation.navigate("Login", { returnTo: "TextToImageDiffusion" }),
          },
        ]
      );
      return;
    }

    if (isLoggedIn && usageCount >= loggedInLimit) {
      Alert.alert("Limit Reached", "You’ve used your daily limit. Come back tomorrow.");
      return;
    }
    setLoading(true);
    setImageUrl(null);

    try {

      const response = await axios.post(
        "https://api.replicate.com/v1/predictions",
        {
          version:
            "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
          input: {
            width: 768,
            height: 768,
            prompt: prompt,
            scheduler: "K_EULER",
            num_outputs: 1,
            guidance_scale: guidanceScale,
            num_inference_steps: inferenceSteps,
          },
        },
        {
          headers: {
            Authorization: `Token ${REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response Data:", response.data);

      if (response.data.error) {
        Alert.alert("Error", response.data.error);
        setLoading(false);
        return;
      }


      let prediction = response.data;
      let status = prediction.status;

      while (status === "starting" || status === "processing") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const pollResponse = await axios.get(prediction.urls.get, {
          headers: {
            Authorization: `Token ${REPLICATE_API_TOKEN}`,
          },
        });
        prediction = pollResponse.data;
        status = prediction.status;
        console.log("Polling status:", status);
      }


      if (prediction.output) {
        setImageUrl(prediction.output[0]);
        incrementUsage();
      } else {
        Alert.alert("Error", "Failed to generate image.");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      Alert.alert("Error", "Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0d1117", "#8ec5fc"]} style={styles.gradient}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentContainer}>
            <TouchableOpacity style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>

            <FastImage
              source={require("../../assets/gif/superResolution.png")}
              style={styles.gif}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
        </View>
      </Modal>
      <FlatList
        data={[]}
        keyExtractor={(_, index) => index.toString()}
        ListHeaderComponent={
          <View style={styles.container}>
            <Text style={styles.title}>Text to Image Diffusion</Text>

            <Card style={styles.card}>
              <Text style={styles.label}>Enter your prompt</Text>
              <TextInput
                placeholder="Describe the image you want to generate..."
                value={prompt}
                onChangeText={setPrompt}
                style={styles.input}
                placeholderTextColor="#888"
              />
              <Text style={styles.label}>Guidance Scale: {guidanceScale.toFixed(1)}</Text>
              <Slider
                value={guidanceScale}
                onValueChange={setGuidanceScale}
                minimumValue={1}
                maximumValue={20}
                step={0.5}
                style={styles.slider}
              />
              <Text style={styles.label}>Inference Steps: {inferenceSteps}</Text>
              <Slider
                value={inferenceSteps}
                onValueChange={setInferenceSteps}
                minimumValue={10}
                maximumValue={150}
                step={1}
                style={styles.slider}
              />

              <View style={styles.button}>
                <Btn title="Generate Image" onPress={generateImage} disabled={loading} />
              </View>
            </Card>

            {loading && <ActivityIndicator size="large" color="#fff" style={styles.loader} />}

            {imageUrl && (
              <Image source={{ uri: imageUrl }} style={styles.image} />
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
    padding: 16,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(70, 71, 77, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentContainer: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 20,
    borderRadius: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#222',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  gif: {
    width: 260,
    height: 260,
    borderRadius: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    width: "100%",
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
     backgroundColor: 'rgba(231, 230, 236, 0.57)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  slider: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
     alignItems: 'center',
  },
  loader: {
    marginTop: 20,
  },
  image: {
    width: 300,
    height: 300,
    alignSelf: "center",
    marginTop: 20,
    borderRadius: 10,
  },
});