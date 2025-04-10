import React, { useState } from "react";
import { 
  View, Text, Image, Button, StyleSheet, 
  FlatList, ActivityIndicator, Alert 
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import RNFS from "react-native-fs";
import { REPLICATE_API_TOKEN } from '@env';

const tutorialSteps = [
  {
    title: "Upload Your Photo",
    description:
      "• Tap the button to pick an image.\n• Max size: 10MB.\n• Formats: JPEG, PNG, WebP.",
  }
];

export default function PhotoRestoration() { 
  const [showTutorial, setShowTutorial] = useState(true);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);

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

  const generateNewFeatureImage = async () => {
    if (!image) {
      Alert.alert("Error", "Please select an image first.");
      return;
    }

    setLoading(true);

    try {
      const base64Image = await RNFS.readFile(image, "base64");
      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify({
          version: "cc4956dd26fa5a7185d5660cc9100fab1b8070a1d1654a8bb5eb6d443b020bb2", 
          input: {
            image: `data:image/jpeg;base64,${base64Image}`,
            upscale: 2,
      face_upsample: true,
      background_enhance: true,
      codeformer_fidelity: 0.1
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
      const fileName = `processed_${Date.now()}.jpg`;
      const folderPath = `${RNFS.PicturesDirectoryPath}/PhotoRestorationApp`;
    
    // Create folder if not exists
    await RNFS.mkdir(folderPath);
    const downloadPath = `${folderPath}/${fileName}`;

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
    <FlatList
      style={{ backgroundColor: "#5680E9" }}
      data={[]}
      keyExtractor={(_, index) => index.toString()}
      ListHeaderComponent={
        <View style={styles.container}>
          <Text style={styles.title}>Photo Restoration</Text> 
          <Text style={styles.subtitle}>
            This screen showcases another feature.
          </Text>

          {!image && showTutorial && (
            <View style={styles.tutorialContainer}>
              <Text style={styles.tutorialTitle}>{tutorialSteps[0].title}</Text>
              <Text style={styles.tutorialText}>{tutorialSteps[0].description}</Text>
            </View>
          )}

          {!image && (
            <View style={styles.button}>
              <Button title="Upload Image" onPress={pickImage} color="blue" />
            </View>
          )}

          {image && (
            <View>
              <Text style={styles.resultText}>Selected Image</Text>
              <Image source={{ uri: image }} style={styles.image} />
            </View>
          )}

          {image && !processedImage && (
            <View style={styles.button}>
              <Button 
                title="Generate New Image" 
                onPress={generateNewFeatureImage} 
                disabled={loading} 
                color="blue" 
              />
            </View>
          )}

          {loading && <ActivityIndicator size="large" color="#fff" style={styles.loader} />}

          {processedImage && (
            <View>
              <Text style={styles.resultText}>Result Image</Text>
              <Image source={{ uri: processedImage }} style={styles.image} />
              <View style={styles.button}>
                <Button title="Download Image" onPress={downloadImage} color="blue" />
              </View>
            </View>
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    backgroundColor: "#5680E9",
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
  button: {
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
