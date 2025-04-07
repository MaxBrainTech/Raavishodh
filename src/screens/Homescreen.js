import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Animated,
} from "react-native";
// import { useNavigation } from "@react-navigation/native";
import { Card } from "react-native-paper"; // Optional for styled card UI


const Homescreen = ({navigation}) => {
  
  console.log(navigation.getState()); // Debugging line

  const scaleAnim = useRef(new Animated.Value(1)).current;

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
    <View style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.title}>Transform Your Images with AI Magic</Text>
        <Text style={styles.subtitle}>
          Experience professional face enhancement and image editing powered by AI.
          Start with our most popular feature.
        </Text>
        <TouchableOpacity style={styles.button}
         onPress={() => navigation.navigate("FaceEnhancement")}>
          <Text style={styles.buttonText}>Try Face Enhancement</Text>
         <Image source={require('../../assets/arrow-right.png')} />
        </TouchableOpacity>
      </View>

      {/* AI Features Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explore All AI Features</Text>
        <Text style={styles.subtitle}>
          From face enhancement to style transfer,
          discover our complete suite of AI-powered editing tools
        </Text>
      </View>

      {/* Face Enhancement Card */}
      <ScrollView showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("FaceEnhancement")}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Card style={styles.card}>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center" }}>
              <Image source={require("../../assets/sparkles.png")} style={styles.image} />
              <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>
                Face Enhancement
              </Text>
            </View>

            <View style={{ width: 250, marginTop: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: "normal" }}>
                Enhance facial features naturally using our advanced AI technology
              </Text>
            </View>
          </Card>
        </Animated.View>
      </TouchableOpacity>

        {/* Text To Image Card */}
<TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("TextToImage")}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Card style={styles.card}>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center" }}>
              <Image source={require("../../assets/sparkles.png")} style={styles.image} />
              <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>
                Text To Image
              </Text>
            </View>

            <View style={{ width: 250, marginTop: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: "normal" }}>
                Create high quality images from text descriptions using our AI model.
              </Text>
            </View>
          </Card>
        </Animated.View>
      </TouchableOpacity>

      {/* Text to Image Diffusion */}
      <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate("TextToImageDiffusion")}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
       <Card style={styles.card}>
       <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center" }}>
              <Image source={require("../../assets/sparkles.png")} style={styles.image} />
              <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>
                Text To Image Diffusion
              </Text>
            </View>
            <View style={{ width: 250, marginTop: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: "normal" }}>
                Transform text descriptions into stunning AI- generated images using stable diffusion.
              </Text>
            </View>
            </Card>
            </TouchableOpacity>

            {/* Background Removal */}
      <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate("BackgroundRemoval")}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
       <Card style={styles.card}>
       <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center" }}>
              <Image source={require("../../assets/sparkles.png")} style={styles.image} />
              <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>
                Background Removal
              </Text>
            </View>
            <View style={{ width: 250, marginTop: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: "normal" }}>
               Extract subjects with perfect edge detection.
              </Text>
            </View>
            </Card>
            </TouchableOpacity>

             {/* Face to Make Images*/}
      <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate("FaceToImage")}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
       <Card style={styles.card}>
       <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center" }}>
              <Image source={require("../../assets/sparkles.png")} style={styles.image} />
              <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>
                Face To Make Images
              </Text>
            </View>
            <View style={{ width: 250, marginTop: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: "normal" }}>
               Make realistic images of people instantly.
              </Text>
            </View>
            </Card>
            </TouchableOpacity>

            { /* Super Resolution */}
            <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate("SuperResolution")}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
       <Card style={styles.card}>
       <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center" }}>
              <Image source={require("../../assets/sparkles.png")} style={styles.image} />
              <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>
              AI Super Resolution
              </Text>
            </View>
            <View style={{ width: 250, marginTop: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: "normal" }}>
              Enhance image quality and resolution using advanced AI upscaling.
               Transform low-resolution images into crisp, detailed photos.
              </Text>
            </View>
            </Card>
            </TouchableOpacity>

            { /* Ghiblify Screen */}
            <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate("GhiblifyScreen")}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
       <Card style={styles.card}>
       <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center" }}>
              <Image source={require("../../assets/sparkles.png")} style={styles.image} />
              <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>
              Ghiblify Screen
              </Text>
            </View>
            <View style={{ width: 250, marginTop: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: "normal" }}>
              Transform your photos into stunning Ghibli-style artwork with the power of AI.
              </Text>
            </View>
            </Card>
            </TouchableOpacity>

            { /* BwColourization Screen */}
            <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate("BwColourization")}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
       <Card style={styles.card}>
       <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center" }}>
              <Image source={require("../../assets/sparkles.png")} style={styles.image} />
              <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>
              B & W Colorization
              </Text>
            </View>
            <View style={{ width: 250, marginTop: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: "normal" }}>
              Bring black & white photos to life with colors.
              </Text>
            </View>
            </Card>
            </TouchableOpacity>
            
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5680E9",
    padding: 20,
  },
  hero: {
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#ddd",
    textAlign: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    backgroundColor: "red",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    marginRight: 5,
  },
  card:{
    margin: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#dae1f2",
    borderColor:'#f21b2d',
    borderWidth:1,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    alignItems:'center'
  },
});

export default Homescreen;