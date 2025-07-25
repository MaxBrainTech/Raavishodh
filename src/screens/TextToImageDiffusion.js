import React, { useState } from "react";
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

  const { checkUsage, incrementUsage } = useUsageGuard("text_diffusion_usage");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert("Error", "Please enter a prompt before generating.");
      return;
    }
    if (!checkUsage()) return;
    if (!REPLICATE_API_TOKEN) {
      Alert.alert("Configuration Error", "Missing REPLICATE_API_TOKEN in .env");
      return;
    }

    setLoading(true);
    setImageUrl(null);

    try {
      const response = await axios.post(
        "https://api.replicate.com/v1/predictions",
        {
          version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
          input: {
            width: 768,
            height: 768,
            prompt,
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

      let prediction = response.data;
      if (!prediction?.id) throw new Error("Invalid response from Replicate");

      while (["starting", "processing"].includes(prediction.status)) {
        await new Promise(res => setTimeout(res, 2000));
        const pollResponse = await axios.get(prediction.urls.get, {
          headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
        });
        prediction = pollResponse.data;
      }

      if (prediction.status === "succeeded" && prediction.output?.[0]) {
        setImageUrl(prediction.output[0]);
        incrementUsage();
      } else {
        throw new Error(
          prediction.status === "failed"
            ? "Image generation failed on server."
            : `Unexpected status: ${prediction.status}`
        );
      }
    } catch (err) {
      const msg = axios.isAxiosError(err) && err.response?.status === 401
        ? "Authentication failed (401). Check your API token."
        : err.message;
      console.error("Generation Error:", err);
      Alert.alert("Error", msg || "Failed to generate image. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!imageUrl) return;
    setDownloading(true);
    try {
      await downloadImageFile(imageUrl, "diffusion");
    } catch (err) {
      console.error("Download failed:", err);
      Alert.alert("Error", "Failed to download image.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <LinearGradient colors={["#0d1117", "#8ec5fc"]} style={styles.gradient}>
      <Modal visible={isModalVisible} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
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
        keyExtractor={(_, idx) => idx.toString()}
        ListHeaderComponent={
          <View style={styles.container}>
            <Text style={styles.title}>Text to Image Diffusion</Text>

            <Card style={styles.card}>
              <Text style={styles.label}>Prompt:</Text>
              <TextInput
                placeholder="Describe the image..."
                value={prompt}
                onChangeText={setPrompt}
                style={styles.input}
                placeholderTextColor="#888"
              />

              <Text style={styles.label}>
                Guidance Scale: {guidanceScale.toFixed(1)}
              </Text>
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

              <Btn
                title="Generate Image"
                onPress={handleGenerate}
                disabled={loading}
              />
            </Card>

            {loading && <ActivityIndicator style={styles.loader} size="large" color="#fff" />}

            {imageUrl && (
              <>
                <View style={styles.imageWrapper}>
                  <Text style={styles.imageLabel}>Result</Text>
                  <Image source={{ uri: imageUrl }} style={styles.generatedImage} />
                </View>

                <Btn
                  title={downloading ? "Downloading..." : "Download Image"}
                  onPress={downloadImage}
                  disabled={downloading}
                />
              </>
            )}
          </View>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { padding: 16, alignItems: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContentContainer: {
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#222",
    padding: 6,
    borderRadius: 14,
  },
  closeButtonText: { color: "#fff", fontSize: 16 },
  gif: { width: 240, height: 240 },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  card: {
    width: "100%",
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    marginBottom: 16,
  },
  label: { color: "#fff", fontWeight: "bold", marginTop: 10 },
  input: {
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: 10,
    color: "#000",
    borderRadius: 5,
    marginTop: 5,
  },
  slider: { marginVertical: 10 },
  loader: { marginVertical: 20 },
  imageWrapper: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 20,
    width: "90%",
  },
  imageLabel: { color: "#fff", fontSize: 20, marginBottom: 10 },
  generatedImage: {
    width: 250,
    height: 250,
    resizeMode: "contain",
    borderRadius: 10,
  },
});
