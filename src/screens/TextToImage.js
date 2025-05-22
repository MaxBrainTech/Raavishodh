import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image 
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Btn from "../component/Btn";
import axios from "axios";
import { REPLICATE_API_TOKEN } from '@env';
import useDailyUsage from '../hook/useDailyUsage';


export default function TextToImage({ navigation }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [buttonVisible, setButtonVisible] = useState(true);
  const [generateClicked, setGenerateClicked] = useState(false); 

  const guestLimit = 1;
  const loggedInLimit = 2;
  
  const { usageCount, limit, incrementUsage, isLoggedIn } = useDailyUsage(
   "text_to_image_usage",
    loggedInLimit,
    guestLimit
  );

const handleGenerate = async () => {
  if (!prompt) {
    Alert.alert("Error", "Please enter a prompt before generating");
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
          onPress: () => navigation.navigate("Login", { returnTo: "TextToImage" }),
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

  const handleDownload = () => {
    console.log("Download the image:", imageUrl);
  };

  return (
    <LinearGradient colors={["#0d1117", "#8ec5fc"]} style={styles.gradient}>
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

        {/* Conditionally render the Generate Image button */}
        {!generateClicked && buttonVisible && (
          <Btn onPress={handleGenerate} title="Generate Image" loading={loading} />
        )}

        {/* Display loading indicator while the image is being generated */}
        {loading && <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 20 }} />}

        {/* Display the generated image */}
        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.generatedImage} />}

        {/* Display the download button after the image is generated */}
        {generateClicked && imageUrl && (
          <Btn onPress={handleDownload} title="Download Image" />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  textcontainer: {
    padding: 10,
    backgroundColor: "white",
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
    marginBottom: 15
  },
  input: {
    borderWidth: 1,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 5,
    marginBottom: 10
  },
  generatedImage: {
    width: 300,
    height: 300,
    marginTop: 20,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom:20
  }
});
