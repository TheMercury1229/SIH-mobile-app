import axios, { AxiosError } from "axios";
import { useState } from "react";

interface FaceVerificationResult {
  success: boolean;
  verified?: boolean;
  data?: any;
  error?: string;
}

interface UseFaceVerificationReturn {
  verifyFace: (imageUri: string) => Promise<FaceVerificationResult>;
  isVerifying: boolean;
}

// TODO: Replace with your actual Face Verification API base URL
const NEW_API_BASE_URL = "https://new_api"; // e.g., https://api.example.com

export const useFaceVerification = (): UseFaceVerificationReturn => {
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyFace = async (imageUri: string): Promise<FaceVerificationResult> => {
    setIsVerifying(true);
    try {
      const formData = new FormData();

      const ext = imageUri.split(".").pop() || "jpg";
      const fileName = `face_image.${ext}`;

      const imageFile: any = {
        uri: imageUri,
        type: `image/${ext}`,
        name: fileName,
      };

      formData.append("file", imageFile);

      const response = await axios.post(
        `${NEW_API_BASE_URL}/verify_face`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 60000,
        }
      );

      // Expecting response like { verified: true/false, ... }
      const verified = Boolean(response?.data?.verified);

      return { success: true, verified, data: response.data };
    } catch (error) {
      console.error("Face verification error:", error);
      let message = "Failed to verify face";
      if (axios.isAxiosError(error)) {
        const e = error as AxiosError;
        if (e.code === "ECONNABORTED") message = "Verification timed out";
        else if (e.response?.status === 400) message = "Invalid image format";
        else if (e.message.includes("Network Error")) message = "Network error";
      }
      return { success: false, verified: false, error: message };
    } finally {
      setIsVerifying(false);
    }
  };

  return { verifyFace, isVerifying };
};
