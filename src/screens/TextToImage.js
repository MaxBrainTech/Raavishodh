import React, { useState } from "react";
import { 
  View, Text, TextInput,  StyleSheet, Alert, ActivityIndicator, Image ,
  Modal,TouchableOpacity, ScrollView
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

  const handleDownload = () => {
  if (!imageUrl) {
    Alert.alert("No Image", "Please generate an image first.");
    return;
  }

  downloadImageFile(imageUrl, "text2image");
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

        {/* Conditionally render the Generate Image button */}
        {!generateClicked && buttonVisible && (
           <View style={styles.buttonContainer}>
          <Btn onPress={handleGenerate} title="Generate Image" loading={loading} />
           </View>
        )}

        {/* Display loading indicator while the image is being generated */}
        {loading && <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 20 }} />}

        {/* Display the generated image */}
        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.generatedImage} />}

        {/* Display the download button after the image is generated */}
        {generateClicked && imageUrl && (
          <View style={styles.buttonContainer}>
          <Btn onPress={handleDownload} title="Download Image" />
          </View>
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
  marginBottom:10
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
    width: 300,
    height: 300,
    marginTop: 20,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom:20
  }
});
