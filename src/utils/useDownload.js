import { useCallback } from "react";
import { downloadImageFile } from "../utils/downloadImage";

export default function useDownload(showAlert, setLoader) {
  const handleDownload = useCallback(async (imageUrl, prefix = "image") => {
    if (!imageUrl) {
      showAlert("No image to download.");
      return;
    }

    try {
      setLoader({ visible: true, message: "Saving to Downloads..." });

      await downloadImageFile(imageUrl, prefix);

      showAlert("Image saved to Downloads successfully!");
    } catch (err) {
      console.error("Download Error:", err);
      showAlert(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoader({ visible: false, message: "" });
    }
  }, [setLoader, showAlert]);

  return { handleDownload };
}
