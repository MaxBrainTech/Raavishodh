import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Card } from "react-native-paper";
import Slider from "@react-native-community/slider";
import axios from "axios";
import { REPLICATE_API_TOKEN } from "@env";

export default function TextToImageDiffusion() {
  const [prompt, setPrompt] = useState("");
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [inferenceSteps, setInferenceSteps] = useState(50);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Function to Generate Image
  const generateImage = async () => {
    if (!prompt) {
      Alert.alert("Error", "Please enter a prompt.");
      return;
    }

    setLoading(true);
    setImageUrl(null); // Clear previous image

    try {
      // Step 1: Start the image generation process
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

      // Step 2: Polling - Wait for the image to be ready
      let prediction = response.data;
      let status = prediction.status;

      while (status === "starting" || status === "processing") {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
        const pollResponse = await axios.get(prediction.urls.get, {
          headers: {
            Authorization: `Token ${REPLICATE_API_TOKEN}`,
          },
        });
        prediction = pollResponse.data;
        status = prediction.status;
        console.log("Polling status:", status);
      }

      // Step 3: Display the generated image
      if (prediction.output) {
        setImageUrl(prediction.output[0]);
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
    <View style={{ flex: 1, padding: 20, backgroundColor: "#5680E9" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10, color: "#fff" }}>
        Text to Image Diffusion
      </Text>
      <Card style={{ padding: 16, marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 5 }}>
          Enter your prompt
        </Text>
        <TextInput
          placeholder="Describe the image you want to generate..."
          value={prompt}
          onChangeText={setPrompt}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            borderRadius: 5,
            marginBottom: 10,
          }}
        />
        <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>
          Guidance Scale: {guidanceScale.toFixed(1)}
        </Text>
        <Slider
          value={guidanceScale}
          onValueChange={setGuidanceScale}
          minimumValue={1}
          maximumValue={20}
          step={0.5}
          style={{ marginBottom: 20 }}
        />
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          Inference Steps: {inferenceSteps}
        </Text>
        <Slider
          value={inferenceSteps}
          onValueChange={setInferenceSteps}
          minimumValue={10}
          maximumValue={150}
          step={1}
          style={{ marginBottom: 20 }}
        />
        <Button title="Generate Image" onPress={generateImage} disabled={loading} color="blue" />
      </Card>

      {loading && (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
      )}

      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: 300, height: 300, alignSelf: "center", marginTop: 20 }}
        />
      )}
    </View>
  );
}
