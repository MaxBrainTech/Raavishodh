import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
} from "react-native";
import FastImage from "react-native-fast-image";
import { useNavigation } from "@react-navigation/native";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import { request, PERMISSIONS } from "react-native-permissions";
import FeatureLayout from "../component/FeatureLayout";
import RNFS from "react-native-fs";
import { REPLICATE_API_TOKEN } from "@env";
import LinearGradient from "react-native-linear-gradient";
import Btn from "../component/Btn";
import useUsageGuard from "../hook/useUsageGuard";
import useDownload from "../utils/useDownload";
import { checkFileSize } from "../utils/fileUtils";
import globalStyles from "../styles/globalStyles";
import LoaderModal from "../component/modals/LoaderModal";
import AlertModal from "../component/modals/AlertModal";
import PickerModal from "../component/modals/PickerModal";

export default function FaceEnhancement() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [readyToGenerate, setReadyToGenerate] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loader, setLoader] = useState({ visible: false, message: "" });
  const [alertModal, setAlertModal] = useState({ visible: false, message: "" });
  const showAlert = (msg) => setAlertModal({ visible: true, message: msg });
  const hideAlert = () => setAlertModal({ visible: false, message: "" });
  const [pickerVisible, setPickerVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(true);
   const navigation = useNavigation();
  const { incrementUsage, checkUsage } = useUsageGuard("ai_usage_count");
const { handleDownload } = useDownload(showAlert, setLoader);

const requestPermissions = async () => {
    if (Platform.OS === "android") {
      await request(PERMISSIONS.ANDROID.CAMERA);
    } else {
      await request(PERMISSIONS.IOS.CAMERA);
    }
  };

  const handleImageSelected = async (uri) => {
    setLoader({ visible: true, message: "Checking image size..." });

    const { valid, message } = await checkFileSize(uri, 10);
    setLoader({ visible: false, message: "" });

    if (!valid) {
      showAlert(message);
      return;
    }

    setSelectedImage(uri);
    setEnhancedImage(null);
    setReadyToGenerate(true);
  };

  const openCamera = async () => {
    setPickerVisible(false);
    await requestPermissions();
    const allowed = await checkUsage();
    if (!allowed) return;

    launchCamera({ mediaType: "photo", quality: 1 }, (response) => {
      if (!response.didCancel && response.assets?.length > 0) {
        handleImageSelected(response.assets[0].uri);
      }
    });
  };

  const openGallery = async () => {
    setPickerVisible(false);
    await requestPermissions();
    const allowed = await checkUsage();
    if (!allowed) return;

    launchImageLibrary({ mediaType: "photo", quality: 1 }, (response) => {
      if (!response.didCancel && response.assets?.length > 0) {
        handleImageSelected(response.assets[0].uri);
      }
    });
  };

  const processImage = async (imageUri) => {
    if (!imageUri) return showAlert("No image selected!");

    setLoader({ visible: true, message: "Enhancing image..." });
    setEnhancedImage(null);

    try {
      const base64Image = await RNFS.readFile(imageUri, "base64");

      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify({
          version: "0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c",
          input: {
            img: `data:image/jpeg;base64,${base64Image}`,
            scale: 2,
            version: "v1.4",
          },
        }),
      });

      let prediction = await response.json();
      if (prediction?.error) throw new Error(prediction.error);

      while (prediction.status === "starting" || prediction.status === "processing") {
        await new Promise((res) => setTimeout(res, 3000));
        const pollRes = await fetch(
          `https://api.replicate.com/v1/predictions/${prediction.id}`,
          { headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` } }
        );
        prediction = await pollRes.json();
      }

      if (prediction.status === "succeeded") {
        setEnhancedImage(prediction.output);
        incrementUsage();
      } else {
        showAlert("Image enhancement failed. Please try again.");
      }
    } catch (err) {
      showAlert(err.message || "Failed to enhance image");
    } finally {
      setLoader({ visible: false, message: "" });
    }
  };


  return (
    <LinearGradient colors={["#0d1117", "#8ec5fc"]} style={globalStyles.gradient}>
      <KeyboardAvoidingView style={globalStyles.container} behavior="padding">
       
        <LoaderModal visible={loader.visible} message={loader.message} />

       
        <AlertModal visible={alertModal.visible} message={alertModal.message} onClose={hideAlert} />

        
        <PickerModal
          visible={pickerVisible}
          onCamera={openCamera}
          onGallery={openGallery}
          onClose={() => setPickerVisible(false)}
        />

        <FlatList
          data={[{}]}
          keyExtractor={(_, index) => index.toString()}
          renderItem={() => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              
              <Modal animationType="slide" transparent visible={isModalVisible}>
                <View style={globalStyles.modalOverlay}>
                  <View style={globalStyles.modalContentContainer}>
                    <TouchableOpacity style={globalStyles.closeButton} onPress={() => setModalVisible(false)}>
                      <Text style={globalStyles.closeButtonText}>X</Text>
                    </TouchableOpacity>

                    <FastImage
                      source={require("../../assets/gif/face_enhancement_tool-gif.png")}
                      style={globalStyles.gif}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                  </View>
                </View>
              </Modal>

              <FeatureLayout
                title="AI Face Enhancement"
                description="Enhance facial features using our advanced AI technology."
                operationId="face-enhancement"
              />

              {!selectedImage && (
                <View style={globalStyles.tutorialContainer}>
                  <Text style={globalStyles.tutorialTitle}>Upload Your Image</Text>
                  <Text style={globalStyles.tutorialText}>
                    • Click the button below to select an image.{"\n"}• Max file size: 10MB.{"\n"}• Supported formats: JPEG, PNG, WebP.
                  </Text>
                </View>
              )}

              {selectedImage && (
                <View style={globalStyles.imageWrapper}>
                  <Text style={globalStyles.imageLabel}>Selected Image</Text>
                  <Image source={{ uri: selectedImage }} style={globalStyles.uploadedImage} />
                </View>
              )}

              {selectedImage && enhancedImage && !readyToGenerate && (
                <View style={globalStyles.imageWrapper}>
                  <Text style={globalStyles.imageLabel}>Result</Text>
                  <Image
                    source={{ uri: enhancedImage }}
                    style={globalStyles.uploadedImage}
                    onLoadStart={() => setLoader({ visible: true, message: "Loading result..." })}
                    onLoadEnd={() => setLoader({ visible: false, message: "" })}
                  />

                  {downloading ? (
                    <View style={{ marginTop: 10 }}>
                      <ActivityIndicator size="large" color="#ffffff" />
                      <Text style={{ color: "#fff", marginTop: 8 }}>Saving to Downloads...</Text>
                    </View>
                  ) : (
                    <Btn title="Download Image" onPress={() => handleDownload(enhancedImage, "enhanced")} />
                  )}
                </View>
              )}

              {selectedImage && !enhancedImage && readyToGenerate && (
                <Btn title="Enhance" onPress={() => { setReadyToGenerate(false); processImage(selectedImage); }} />
              )}

              {!selectedImage && <Btn title="Upload Image" onPress={() => setPickerVisible(true)} />}
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}


