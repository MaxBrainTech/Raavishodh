
import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image 
} from "react-native";
import axios from "axios";
import { REPLICATE_API_TOKEN } from '@env';

export default function TextToImage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const handleGenerate = async () => {
    if (!prompt) {
      Alert.alert("Error", "Please enter a prompt before generating");
      return;
    }

    setLoading(true);
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
            "Authorization": `Token ${REPLICATE_API_TOKEN}`, // Fixed Authorization
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const predictionId = response.data.id;
      let imageResult = null;

      // Poll the API to check the status
      while (!imageResult) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const statusResponse = await axios.get(
          `https://api.replicate.com/v1/predictions/${predictionId}`,
          {
            headers: {
              "Authorization": `Token ${REPLICATE_API_TOKEN}` // Fixed Token
            }
          }
        );

        if (statusResponse.data.status === "succeeded") {
          imageResult = statusResponse.data.output[0];
          setImageUrl(imageResult);
        } else if (statusResponse.data.status === "failed") {
          throw new Error("Image generation failed.");
        }
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to generate image.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
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

      <TouchableOpacity onPress={handleGenerate} style={styles.button}>
        <Text style={styles.buttonText}>{loading ? "Generating..." : "Generate Image"}</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 20 }} />}
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.generatedImage} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#5680E9"
  },
  textcontainer: {
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 5
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
    marginBottom: 15
  },
  input: {
    borderWidth: 1,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 5,
    marginBottom: 10
  },
  button: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    marginTop: 20
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold"
  },
  generatedImage: {
    width: 300,
    height: 300,
    marginTop: 20,
    borderRadius: 10,
    alignSelf: "center"
  }
});