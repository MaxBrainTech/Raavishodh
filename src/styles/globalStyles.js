import { StyleSheet } from "react-native";

const globalStyles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, alignItems: "center" },

  // Modal Overlay (dark)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Modal Content (Info Modals like GIF intro)
  modalContentContainer: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 20,
    borderRadius: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#222",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 10,
  },
  closeButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  // Alert & Loader
  alertBox: {
    backgroundColor: "#1f2937",
    padding: 25,
    borderRadius: 20,
    width: "75%",
    alignItems: "center",
  },
  alertText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  alertButton: {
    backgroundColor: "#8ec5fc",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  alertButtonText: {
    color: "#000",
    fontWeight: "600",
  },

  loaderBox: {
    backgroundColor: "#1f2937",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  loaderText: { color: "#fff", marginTop: 10, fontSize: 16 },

  // Tutorial
  tutorialContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tutorialTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  tutorialText: {
    color: "#d1d5db",
    fontSize: 14,
    textAlign: "left",
    lineHeight: 20,
  },

  // Shared Image Wrappers (Selected/Result + GIF)
 imageWrapper: {
  backgroundColor: "rgba(255,255,255,0.1)",
  padding: 20,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  marginVertical: 20,
  width: "90%",      
  alignSelf: "center", 
},
  imageLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 10,
  },
  uploadedImage: {
    width: 250,
    height: 250,
    borderRadius: 10,
    resizeMode: "contain",
    marginBottom: 20,
  },
  gif: { width: 250, height: 250, borderRadius: 20 },
  inputBox: {
  backgroundColor: "rgba(255,255,255,0.2)",
  padding: 10,
  borderRadius: 10,
  color: "#fff",
  marginVertical: 10,
  width: "100%",
},
});

export default globalStyles;
