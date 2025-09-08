import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import Btn from '../component/Btn';
import axios from 'axios';
import RNFS from 'react-native-fs';
import useDownload from '../utils/useDownload';
import useUsageGuard from '../hook/useUsageGuard';
import {REPLICATE_API_TOKEN} from '@env';
import {checkFileSize} from '../utils/fileUtils';
import globalStyles from '../styles/globalStyles';

import LoaderModal from '../component/modals/LoaderModal';
import AlertModal from '../component/modals/AlertModal';
import PickerModal from '../component/modals/PickerModal';

const tutorialSteps = [
  {
    title: 'Upload Your Image',
    description:
      '• Click the button below to select an image.\n• Max file size: 10MB.\n• Supported formats: JPEG, PNG, WebP.',
  },
];

export default function GhiblifyScreen() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [ghibliImage, setGhibliImage] = useState(null);
  const [isModalVisible, setModalVisible] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const [loader, setLoader] = useState({visible: false, message: ''});
  const [alertModal, setAlertModal] = useState({visible: false, message: ''});
  const [pickerVisible, setPickerVisible] = useState(false);
  const showAlert = msg => setAlertModal({visible: true, message: msg});
  const hideAlert = () => setAlertModal({visible: false, message: ''});

  const {incrementUsage, checkUsage} = useUsageGuard('ai_usage_count');
  const {handleDownload} = useDownload(showAlert, setLoader);

  const openImagePicker = () => setPickerVisible(true);

  const handleImageSelected = async uri => {
    setLoader({visible: true, message: 'Checking image size...'});

    const {valid, message} = await checkFileSize(uri, 10);

    setLoader({visible: false, message: ''});

    if (!valid) {
      showAlert(message);
      return;
    }

    setSelectedImage(uri);
    setGhibliImage(null);
    setShowTutorial(false);
  };

  const openCamera = async () => {
    setPickerVisible(false);
    const allowed = await checkUsage();
    if (!allowed) return;
    launchCamera({mediaType: 'photo', quality: 1}, response => {
      if (!response.didCancel && response.assets?.length > 0) {
        handleImageSelected(response.assets[0].uri);
      }
    });
  };

  const openGallery = async () => {
    setPickerVisible(false);
    const allowed = await checkUsage();
    if (!allowed) return;
    launchImageLibrary({mediaType: 'photo', quality: 1}, response => {
      if (!response.didCancel && response.assets?.length > 0) {
        handleImageSelected(response.assets[0].uri);
      }
    });
  };

  const processGhiblifyImage = async () => {
    if (!selectedImage) {
      showAlert('Please select an image first!');
      return;
    }
    const allowed = await checkUsage();
    if (!allowed) return;

    setLoader({visible: true, message: 'Processing...'});

    try {
      const base64Image = await RNFS.readFile(selectedImage, 'base64');
const dataUrl = `data:image/jpeg;base64,${base64Image}`;

      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
        version: '6c4785d791d08ec65ff2ca5e9a7a0c2b0ac4e07ffadfb367231aa16bc7a52cbb',
        input: {
          seed: -1,
          prompt:
            'Ghibli Studio style, Charming hand-drawn anime-style illustration',
          input_image: dataUrl, // IMPORTANT: use input_image here
          lora_weight: 1,
          guidance_scale: 3.5,
          num_inference_steps: 25,
        },
      },
        {
          headers: {
            Authorization: `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      );

      let prediction = response.data;
      if (prediction?.error) throw new Error(prediction.error);

      while (
        prediction.status === 'starting' ||
        prediction.status === 'processing'
      ) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const checkResponse = await axios.get(
          `https://api.replicate.com/v1/predictions/${prediction.id}`,
          {headers: {Authorization: `Token ${REPLICATE_API_TOKEN}`}},
        );
        prediction = checkResponse.data;
      }

      if (prediction.status === 'succeeded') {
        setGhibliImage(
          Array.isArray(prediction.output)
            ? prediction.output[0]
            : prediction.output,
        );
        incrementUsage();
      } else {
        throw new Error('Processing failed.'
        );
      }
    } catch (err) {
       console.error('Replicate error:', err);
      showAlert('Something went wrong while processing. Please try again.');
    } finally {
      setLoader({visible: false, message: ''});
    }
  };

  return (
    <LinearGradient
      colors={['#0d1117', '#8ec5fc']}
      style={globalStyles.gradient}>
      <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
      
        <LoaderModal visible={loader.visible} message={loader.message} />

        <AlertModal
          visible={alertModal.visible}
          message={alertModal.message}
          onClose={hideAlert}
        />

        <PickerModal
          visible={pickerVisible}
          onCamera={openCamera}
          onGallery={openGallery}
          onClose={() => setPickerVisible(false)}
        />

        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={globalStyles.modalOverlay}>
            <View style={globalStyles.modalContentContainer}>
              <TouchableOpacity
                style={globalStyles.closeButton}
                onPress={() => setModalVisible(false)}>
                <Text style={globalStyles.closeButtonText}>X</Text>
              </TouchableOpacity>

              <FastImage
                source={require('../../assets/gif/Ghibli.png')}
                style={globalStyles.gif}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
          </View>
        </Modal>

        <View style={globalStyles.container}>
          <Text style={styles.title}>Ghiblify Your Image</Text>
          <Text style={styles.subtitle}>
            Transform your photos into stunning Ghibli-style artwork with AI.
          </Text>

          {!selectedImage && showTutorial && (
            <View style={globalStyles.tutorialContainer}>
              <Text style={globalStyles.tutorialTitle}>
                {tutorialSteps[0].title}
              </Text>
              <Text style={globalStyles.tutorialText}>
                {tutorialSteps[0].description}
              </Text>
            </View>
          )}

          {!selectedImage ? (
            <Btn title="Upload Image" onPress={openImagePicker} />
          ) : (
            <>
              {selectedImage && (
                <View style={globalStyles.imageWrapper}>
                  <Text style={globalStyles.imageLabel}>Selected Image</Text>
                  <Image
                    source={{uri: selectedImage}}
                    style={globalStyles.uploadedImage}
                  />
                </View>
              )}
              {!ghibliImage && (
                <Btn title="Ghiblify Image" onPress={processGhiblifyImage} />
              )}
            </>
          )}

          {ghibliImage && (
            <View style={globalStyles.imageWrapper}>
              <Text style={globalStyles.imageLabel}>Result</Text>
              <Image
                source={{uri: ghibliImage}}
                style={globalStyles.uploadedImage}
                onLoadStart={() =>
                  setLoader({visible: true, message: 'Loading result...'})
                }
                onLoadEnd={() => setLoader({visible: false, message: ''})}
              />

              {downloading ? (
                <View style={{marginTop: 10}}>
                  <ActivityIndicator size="large" color="#ffffff" />
                  <Text style={{color: '#fff', marginTop: 8}}>
                    Saving to Downloads...
                  </Text>
                </View>
              ) : (
                <Btn
                  title="Download Image"
                  onPress={() => handleDownload(ghibliImage, 'ghibli')}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  title: {color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20},
  subtitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});
