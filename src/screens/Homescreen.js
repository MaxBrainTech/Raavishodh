import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  FlatList,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import GifCarousel from "../component/GifCarousel"
import AnimatedGradientBackground from "../component/AnimatedGradientBackground"

const features = [
  {
    title: "Face Enhancement",
    screen: "FaceEnhancement",
    icon: "happy-outline",
      image: require('../../assets/gif/face_enhancement_tool-gif.png'),
  },
  {
    title: "Ghiblify",
    screen: "GhiblifyScreen",
    icon: "color-palette-outline",
     image: require('../../assets/gif/Ghibli.png'),
  },
  {
    title: "Face to Image",
    screen: "FaceToImage",
    icon: "image-outline",
     image: require('../../assets/gif/face-image.png'),
  },
  {
    title: "Text to Image",
    screen: "TextToImage",
    icon: "text-outline",
      image: require('../../assets/gif/TextToImage.png'),
  },
  {
    title: "B&W Colorization",
    screen: "BwColourization",
    icon: "color-fill-outline",
    image: require('../../assets/gif/B&W.png'),
  },
  {
    title: "Super Resolution",
    screen: "SuperResolution",
    icon: "scan-circle-outline",
      image: require('../../assets/gif/superResolution.png'),
  },
  {
    title: "Diffusion",
    screen: "TextToImageDiffusion",
    icon: "sparkles-outline",
    image: require('../../assets/gif/StableDiffusion.png'),
  },
  {
    title: "Photo Restoration",
    screen: "PhotoRestoration",
    icon: "time-outline",
     image: require('../../assets/gif/PhotoRestoration.png'),
  },
   {
    title: "OCR Scanner",
    screen: "OCRScanner",
    icon: "time-outline",
     image: require('../../assets/gif/ocr.png'),
  },
  //   {
  //   title: "Flux Txt to Img",
  //   screen: "Flux",
  //   icon: "time-outline",
  //    image: require('../../assets/gif/flux.jpg'),
  // },
];

const Homescreen = ({ navigation }) => {
  return (
    <LinearGradient colors={["#0d1117", "#8ec5fc"]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
     
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Transform Your Images with AI</Text>
          <Text style={styles.heroSubtitle}>
            Powerful tools for enhancing and reimagining your photos.
          </Text>
        </View>

 <GifCarousel />

      <AnimatedGradientBackground>
        <View style={styles.carouselContainer}>
          <Text style={styles.sectionTitle}>Featured Tools</Text>
          <FlatList
            horizontal
            data={features.slice(0, 4)}
            keyExtractor={(item) => item.title}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.featureCard}
                onPress={() => navigation.navigate(item.screen)}
              >
                <Ionicons name={item.icon} size={28} color="#8ec5fc" />
                <Text style={styles.featureText}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
</AnimatedGradientBackground>
  
        <Text style={[styles.sectionTitle, { marginLeft: 20 }]}>All Features</Text>
        <View style={styles.grid}>
          {features.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.gridCard}
              onPress={() => navigation.navigate(item.screen)}
            >
                 <Image
        source={item.image}
        style={styles.gridImage}
        resizeMode="cover"
      />
              {/* <Ionicons name={item.icon} size={30} color="#fff" /> */}
              <Text style={styles.gridText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    padding: 20,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 15,
    color: "#bbb",
    textAlign: "center",
    marginVertical: 10,
  },
  heroImage: {
    width: 260,
    height: 260,
    marginTop: 10,
    resizeMode: "contain",
  },
 carouselContainer: {
  marginTop: 10,
  paddingLeft: 20,
  paddingTop: 20,
  paddingBottom: 20,
  marginBottom: 20,
  // backgroundColor: 'red',
  borderRadius: 12,
  overflow: 'hidden', // Ensures animation stays inside
  position: 'relative', // Needed for absolute overlay
},

  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  featureCard: {
  backgroundColor: "#1f2937",
  padding: 16,
  marginRight: 14,
  borderRadius: 16,
  alignItems: "center",
  width: 120,
  borderWidth: 1,
  borderColor: "#3b82f6", 
},

  featureText: {
    color: "#eee",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    paddingBottom: 50,
  },
  gridCard: {
  width: "47%",
  height:250,
  backgroundColor: "rgba(3, 7, 26, 0.1)",
  marginBottom: 16,
  padding: 20,
  borderRadius: 16,
  alignItems: "center",
  shadowColor: "#fff", 
  shadowOffset: { width: 0, height: 8 },
  // shadowOpacity: 0.4,
  // shadowRadius: 10,
  // elevation: 30,
   borderWidth: 2,
  borderColor: "rgba(123, 127, 150, 0.82)",
  // overflow: 'hidden' 
},
  gridText: {
    color: "#fff",
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
  },
  gridImage: {
  width: '100%',
  height: 150,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
},
});

export default Homescreen;
