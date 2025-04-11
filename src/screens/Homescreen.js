import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Card } from "react-native-paper";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from 'react-native-vector-icons/Ionicons';


const features = [
  {
    title: "Face Enhancement",
    description: "Enhance facial features naturally using our advanced AI technology.",
    screen: "FaceEnhancement",
    icon: "scan-circle-outline",
  },
  {
    title: "Ghiblify Screen",
    description: "Transform your photos into stunning Ghibli-style artwork with the power of AI.",
    screen: "GhiblifyScreen",
    icon:"accessibility-outline"
  },
  {
    title: "Face To Make Images",
    description: "Make realistic images of people instantly.",
    screen: "FaceToImage",
    icon:"images-outline"
  },
  {
    title: "Text To Image",
    description: "Create high quality images from text descriptions using our AI model.",
    screen: "TextToImage",
    icon: "color-wand-outline",
  },
  {
    title: "B & W Colorization",
    description: "Bring black & white photos to life with colors.",
    screen: "BwColourization",
    icon: "color-palette-outline"
  },
  {
    title: "AI Super Resolution",
    description: " Enhance image quality and resolution using advanced AI upscaling.Transform low-resolution images into crisp, detailed photos.",
    screen: "SuperResolution",
    icon:"scan-outline"
  },
  {
    title: "Text To Image Diffusion",
    description: "  Transform text descriptions into stunning AI- generated images using stable diffusion.",
    screen: "TextToImageDiffusion",
    icon:"image-outline"
  },
  {
    title: "Photo Restoration",
    description: "  Models that improve or restore images by deblurring, colorization, and removing noise.",
    screen: "PhotoRestoration",
    icon:"timer-outline"
  },
];

const Homescreen = ({ navigation }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <LinearGradient colors={["#0d1117", "#8ec5fc"]} style={styles.gradient}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.title}>Transform Your Images with AI Magic</Text>
          <Text style={styles.subtitle}>
            Experience professional face enhancement and image editing powered by AI.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("FaceEnhancement")}
          >
            <Text style={styles.buttonText}>Try Face Enhancement</Text>
            <Image
              source={require("../../assets/arrow-right.png")}
              style={styles.arrowIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Explore Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore All AI Features</Text>
        </View>

        {/* Cards Section */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        ) : (
          features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(feature.screen)}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
                <Card style={styles.card}>
                  <View style={styles.cardContent}>
                  <Ionicons name={feature.icon} size={30} color="red" />
                    <Text style={styles.cardTitle}>{feature.title}</Text>
                  </View>
                  <Text style={styles.cardDescription}>{feature.description}</Text>
                </Card>
              </Animated.View>
            </TouchableOpacity>
          ))
        )}
      </Animated.ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  hero: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#eee",
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#6a11cb",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: "center",
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginRight: 8,
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
  },
  cardContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  card: {
    // backgroundColor: "rgba(255, 255, 255, 0.05)",
    backgroundColor: "rgba(13, 17, 23, 0.85)"
,
    borderWidth: 7,
    borderColor: "#8c93fb",
    borderRadius: 16,
    padding: 20,
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: "#eee",
  },
  image: {
    width: 30,
    height: 30,
  },
  loadingContainer: {
    marginTop: 50,
    alignItems: "center",
  },
});

export default Homescreen;

