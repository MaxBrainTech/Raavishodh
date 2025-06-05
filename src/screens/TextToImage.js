import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, Image,
  Modal, TouchableOpacity, ScrollView
} from "react-native";
import FastImage from 'react-native-fast-image';
import LinearGradient from "react-native-linear-gradient";
import Btn from "../component/Btn";
import axios from "axios";
import { REPLICATE_API_TOKEN } from '@env';
import useUsageGuard from "../hook/useUsageGuard";
import { downloadImageFile } from "../utils/downloadImage";

export default function TextToImage({ navigation }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [buttonVisible, setButtonVisible] = useState(true);
  const [generateClicked, setGenerateClicked] = useState(false);
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
    setGenerateClicked(false);
    setImageUrl(null);

    try {
      const response = await axios.post(
        "https://api.replicate.com/v1/predictions",
        {
          version: "7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc", // Correct version ID
          input: {
            width: 768,
            height: 768,
            prompt: prompt,
            refine: "expert_ensemble_refiner",
            scheduler: "K_EULER",
            lora_scale: 0.6,
            num_outputs: 1,
            guidance_scale: 7.5,
            apply_watermark: false,
            high_noise_frac: 0.8,
            negative_prompt: "",
            prompt_strength: 0.8,
            num_inference_steps: 25
          }
        },
        {
          headers: {
            "Authorization": `Token ${REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const predictionId = response.data.id;
      let imageResult = null;


      while (!imageResult) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const statusResponse = await axios.get(
          `https://api.replicate.com/v1/predictions/${predictionId}`,
          {
            headers: {
              "Authorization": `Token ${REPLICATE_API_TOKEN}`
            }
          }
        );

        if (statusResponse.data.status === "succeeded") {
          imageResult = statusResponse.data.output[0];
          setImageUrl(imageResult);
          await incrementUsage();
        } else if (statusResponse.data.status === "failed") {
          throw new Error("Image generation failed.");
        }
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to generate image.");
      console.error(error);
    } finally {
      setLoading(false);
      setGenerateClicked(true);
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
                source={require("../../assets/gif/TextToImage.png")}
                style={styles.gif}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
          </View>
        </Modal>
        <View style={styles.container}>
          <Text style={styles.title}>Text to Image Generation</Text>
          <Text style={styles.subtitle}>Generate amazing images from your text descriptions.</Text>

          <View style={styles.textcontainer}>
            <Text style={styles.label}>Enter your Prompt</Text>
            <TextInput
              style={styles.input}
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChangeText={setPrompt}
            />
          </View>


          {!generateClicked && buttonVisible && (
            <View style={styles.buttonContainer}>
              <Btn onPress={handleGenerate} title="Generate Image" loading={loading} />
            </View>
          )}


          {loading && <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 20 }} />}

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
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1
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
  buttonContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10
  },
  container: {
    flex: 1,
    padding: 20,
  },
  textcontainer: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginBottom: 10
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white"
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 15,
    color: "#dadce0"
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 15,
    color: "#d1d5db",
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    backgroundColor: 'rgba(231, 230, 236, 0.57)',
    borderRadius: 5,
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
});
