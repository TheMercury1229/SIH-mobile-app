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

const API_BASE_URL = "https://e88adf18050a.ngrok-free.app";

export const useFaceVerification = (): UseFaceVerificationReturn => {
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyFace = async (imageUri: string): Promise<FaceVerificationResult> => {
    setIsVerifying(true);
    
    try {
      console.log("=== FACE VERIFICATION API CALL ===");
      console.log("Image URI:", imageUri);
      
      const formData = new FormData();
      const fileName = `face_image_${Date.now()}.jpg`;

      const imageFile: any = {
        uri: imageUri,
        type: 'image/jpeg',
        name: fileName,
      };

      formData.append("file", imageFile);

      console.log("Sending face verification request to:", `${API_BASE_URL}/recognize_face`);
      console.log("File details:", { uri: imageUri, type: 'image/jpeg', name: fileName });

      const response = await axios.post(
        `${API_BASE_URL}/recognize_face`,
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
            "ngrok-skip-browser-warning": "true"
          },
          timeout: 60000,
        }
      );

      console.log("Face verification API response:", response.data);
      console.log("Response status:", response.status);

      // Expecting response like { verified: true/false, confidence?: number, ... }
      const verified = Boolean(response?.data?.verified);

      console.log("Face verification result - verified:", verified);

      return { 
        success: true, 
        verified, 
        data: response.data 
      };
      
    } catch (error) {
      console.error("Face verification API error:", error);
      
      let message = "Failed to verify face";
      
      if (axios.isAxiosError(error)) {
        const e = error as AxiosError;
        console.log("Axios error details:");
        console.log("- Status:", e.response?.status);
        console.log("- Status text:", e.response?.statusText);
        console.log("- Response data:", e.response?.data);
        console.log("- Error code:", e.code);
        console.log("- Error message:", e.message);
        
        if (e.code === "ECONNABORTED") {
          message = "Verification request timed out";
        } else if (e.response?.status === 400) {
          message = "Invalid image format or quality";
        } else if (e.response?.status === 422) {
          message = "No face detected in image";
        } else if (e.response?.status === 500) {
          message = "Face verification service error";
        } else if (e.message.includes("Network Error")) {
          message = "Network connection error";
        } else if (e.response?.data?.error) {
          message = e.response.data.error;
        } else if (e.response?.data?.detail) {
          message = e.response.data.detail;
        }
      } else {
        console.log("Non-axios error:", error);
      }
      
      return {
        success: false,
        verified: false,
        error: message,
      };
    } finally {
      setIsVerifying(false);
    }
  };
  return { verifyFace, isVerifying };
};