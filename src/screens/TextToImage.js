import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Image,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import Btn from '../component/Btn';
import axios from 'axios';
import {REPLICATE_API_TOKEN} from '@env';
import useUsageGuard from '../hook/useUsageGuard';
import useDownload from '../utils/useDownload';
import globalStyles from '../styles/globalStyles';

import LoaderModal from '../component/modals/LoaderModal';
import AlertModal from '../component/modals/AlertModal';

export default function TextToImage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [generateClicked, setGenerateClicked] = useState(false);
  const [isModalVisible, setModalVisible] = useState(true);
  const [alertModal, setAlertModal] = useState({visible: false, message: ''});
  const [loader, setLoader] = useState({visible: false, message: ''});

  const showAlert = msg => setAlertModal({visible: true, message: msg});
  const hideAlert = () => setAlertModal({visible: false, message: ''});

  const {checkUsage, incrementUsage} = useUsageGuard('ai_usage_count');
  const {handleDownload} = useDownload(showAlert, setLoader);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showAlert('Please enter a prompt before generating.');
      return;
    }

    const allowed = checkUsage();
    if (!allowed) return;

    if (!REPLICATE_API_TOKEN) {
      showAlert('Replicate API token is missing or not loaded from .env');
      return;
    }

    setLoading(true);
    setGenerateClicked(false);
    setImageUrl(null);

    try {
      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version:
            '7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
          input: {
            width: 768,
            height: 768,
            prompt,
            refine: 'expert_ensemble_refiner',
            scheduler: 'K_EULER',
            lora_scale: 0.6,
            num_outputs: 1,
            guidance_scale: 7.5,
            apply_watermark: false,
            high_noise_frac: 0.8,
            negative_prompt: '',
            prompt_strength: 0.8,
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

      if (response.data.error) throw new Error(response.data.error);

      const predictionId = response.data.id;
      let imageResult = null;

      while (!imageResult) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const statusResponse = await axios.get(
          `https://api.replicate.com/v1/predictions/${predictionId}`,
          {
            headers: {
              Authorization: `Token ${REPLICATE_API_TOKEN}`,
            },
          },
        );

        if (statusResponse.data.status === 'succeeded') {
          imageResult = statusResponse.data.output[0];
          setImageUrl(imageResult);
          await incrementUsage();
        } else if (statusResponse.data.status === 'failed') {
          throw new Error('Image generation failed.');
        }
      }
    } catch (error) {
      showAlert(error.message || 'Failed to generate image.');
      console.error(error);
    } finally {
      setLoading(false);
      setGenerateClicked(true);
    }
  };

  return (
    <LinearGradient
      colors={['#0d1117', '#8ec5fc']}
      style={globalStyles.gradient}>
      <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
        {/* Alert Modal */}
        <AlertModal
          visible={alertModal.visible}
          message={alertModal.message}
          onClose={hideAlert}
        />

        {/* Loader Modal */}
        <LoaderModal visible={loader.visible} message={loader.message} />

        {/* Info Modal (GIF) */}
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
                source={require('../../assets/gif/TextToImage.png')}
                style={globalStyles.gif}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
          </View>
        </Modal>

        <View style={styles.container}>
          <Text style={styles.title}>Text to Image Generation</Text>
          <Text style={styles.subtitle}>
            Generate amazing images from your text descriptions.
          </Text>

          <View style={styles.textcontainer}>
            <Text style={styles.label}>Enter your Prompt</Text>
            <TextInput
              style={styles.input}
              placeholder="Describe the image you want to generate..."
              placeholderTextColor="#aaa"
              value={prompt}
              onChangeText={setPrompt}
            />
          </View>

          {!generateClicked && (
            <View style={styles.buttonContainer}>
              <Btn
                onPress={handleGenerate}
                title="Generate Image"
                loading={loading}
              />
            </View>
          )}

          {loading && (
            <ActivityIndicator
              size="large"
              color="#ffffff"
              style={{marginTop: 20}}
            />
          )}

          {imageUrl && (
            <>
              <View style={globalStyles.imageWrapper}>
                <Text style={globalStyles.imageLabel}>Result</Text>
                <Image
                  source={{uri: imageUrl}}
                  style={globalStyles.uploadedImage}
                />
              </View>

              <View style={styles.buttonContainer}>
                <Btn
                  title="Download Image"
                  onPress={() => handleDownload(imageUrl, 'textToImage')}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  textcontainer: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 15,
    color: '#dadce0',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 15,
    color: '#d1d5db',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    backgroundColor: 'rgba(9, 2, 43, 0.57)',
    borderRadius: 5,
    marginBottom: 10,
    color: '#000',
  },
});
