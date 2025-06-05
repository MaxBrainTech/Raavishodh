import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, Image, Modal, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet, FlatList
} from "react-native";
import { Card } from "react-native-paper";
import FastImage from 'react-native-fast-image';
import Slider from "@react-native-community/slider";
import axios from "axios";
import LinearGradient from "react-native-linear-gradient";
import Btn from "../component/Btn";
import useUsageGuard from "../hook/useUsageGuard";
import { downloadImageFile } from "../utils/downloadImage";
import { REPLICATE_API_TOKEN } from "@env";

export default function TextToImageDiffusion({ navigation }) {
  const [prompt, setPrompt] = useState("");
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [inferenceSteps, setInferenceSteps] = useState(50);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(true);
    const [downloading, setDownloading] = useState(false);

  const {
    usageCount,
    incrementUsage,
    checkUsage,
  } = useUsageGuard("ghibli_usage_count");


  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert("Error", "Please enter a prompt before generating.");
      return;
    }

    const allowed = checkUsage();
    if (!allowed) return;

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

  const downloadImage = async () => {
     if (!imageUrl) return;
 
     try {
       setDownloading(true);
       await downloadImageFile(imageUrl, "generated");
     } catch (err) {
       console.error("Download failed", err);
     } finally {
       setDownloading(false);
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
              source={require("../../assets/gif/StableDiffusion.png")}
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
                <Btn title="Generate Image" onPress={handleGenerate} disabled={loading} />
              </View>
            </Card>

            {loading && <ActivityIndicator size="large" color="#fff" style={styles.loader} />}

            {imageUrl && (
              <>
                <View style={styles.imageWrapper}>
                  <Text style={styles.imageLabel}>Result</Text>
                  <Image source={{ uri: imageUrl }} style={styles.generatedImage} />
                </View>

                <View style={styles.buttonContainer}>
                  {downloading ? (
                    <View style={{ marginTop: 10 }}>
                      <ActivityIndicator size="large" color="#ffffff" />
                      <Text style={{ color: '#fff', marginTop: 8 }}>Saving to Downloads...</Text>
                    </View>
                  ) : (
                    <Btn
                      title="Download Image"
                      onPress={downloadImage}
                    />
                  )}
                </View>
              </>
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
    // borderRadius: 12,
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
imageWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
    alignItems: "center",
    alignSelf:'center',
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    width: '85%',
  },
  imageLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 10,
  },
   generatedImage: {
     width: 200,
    height: 200,
    marginTop: 0,
    marginBottom: 30,
    borderRadius: 10,
    resizeMode: "contain",
  },
});