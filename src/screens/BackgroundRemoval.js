import React, { useState } from "react";
import {
    View,
    Text,
    Button,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    StyleSheet,
    FlatList
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";

export default function BackgroundRemoval() {
    const [image, setImage] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showTutorial, setShowTutorial] = useState(true); // Controls tutorial visibility

    // 📸 Pick Image from Gallery
    const pickImage = () => {
        setShowTutorial(false); // Hide tutorial after selecting image
        launchImageLibrary({ mediaType: "photo", quality: 1 }, (response) => {
            if (response.didCancel) {
                console.log("User cancelled image picker");
            } else if (response.error) {
                console.log("ImagePicker Error: ", response.error);
                Alert.alert("Error", "Failed to pick an image.");
            } else {
                setImage(response.assets[0].uri);
            }
        });
    };

    // 📝 Tutorial Data
    const tutorialSteps = [
        {
            title: "Upload Your Image",
            description: "Click on the button below to select an image.\nMax file size: 10MB.\nSupported formats: JPEG, PNG, WebP.",
        }
    ];

    return (
        <FlatList
        style={{  backgroundColor: "#5680E9",}}
            data={[]} // Empty data since we only use ListHeaderComponent
            keyExtractor={(_, index) => index.toString()}
            ListHeaderComponent={
                <View style={styles.container}>
                    <Text style={styles.title}>AI Background Removal</Text>
                    <Text style={styles.subtitle}>
                        Extract subjects from their backgrounds with perfect edge detection.
                    </Text>

                    {/* 📝 Tutorial Section */}
                    {!image && showTutorial && (
                        <View style={styles.tutorialContainer}>
                            <Text style={styles.tutorialTitle}>{tutorialSteps[0].title}</Text>
                            <Text style={styles.tutorialText}>{tutorialSteps[0].description}</Text>
                        </View>
                    )}

                    {/* 📤 Select Image Button */}
                    {!image && (
                        <View style={styles.button}>
                            <Button title="Select Image" onPress={pickImage} color="blue" />
                        </View>
                    )}

                    {/* 📸 Show Selected Image */}
                    {image && <Image source={{ uri: image }} style={styles.image} />}

                    {/* 🎨 Remove Background Button */}
                    {image && !processedImage && (
                        <View style={styles.button}>
                            <Button title="Remove Background" onPress={() => {}} disabled={loading} color="blue" />
                        </View>
                    )}

                    {/* ⏳ Loading Indicator */}
                    {loading && <ActivityIndicator size="large" color="#fff" style={styles.loader} />}
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
        backgroundColor: "rgba(255,255,255,0.2)",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: "center",
    },
    tutorialTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    tutorialText: {
        color: "#fff",
        fontSize: 14,
        textAlign: "center",
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
});
