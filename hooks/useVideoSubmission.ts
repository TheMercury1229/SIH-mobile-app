import axios, { AxiosError } from "axios";
import { useState } from "react";

interface VideoSubmissionResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface UseVideoSubmissionReturn {
  submitVideo: (
    videoUri: string,
    exerciseType: string
  ) => Promise<VideoSubmissionResult>;
  isSubmitting: boolean;
  progress: number;
}

const API_BASE_URL = "https://prishaa-sports.hf.space";

// Map test IDs to API exercise types
const exerciseTypeMap: Record<string, string> = {
  "sit-ups": "sit-up",
  "vertical-jump": "vertical-jump",
  "shuttle-run": "shuttle-run",
  "endurance-run": "endurance-run",
};

export const useVideoSubmission = (): UseVideoSubmissionReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const submitVideo = async (
    videoUri: string,
    exerciseType: string
  ): Promise<VideoSubmissionResult> => {
    setIsSubmitting(true);
    setProgress(0);

    try {
      // Map the exercise type to API format
      const apiExerciseType = exerciseTypeMap[exerciseType] || exerciseType;

      // Create form data
      const formData = new FormData();

      // For React Native, we need to create a file object
      const fileExtension = videoUri.split(".").pop() || "mp4";
      const fileName = `exercise_video.${fileExtension}`;

      // Create file object for FormData
      const videoFile = {
        uri: videoUri,
        type: `video/${fileExtension}`,
        name: fileName,
      } as any;

      formData.append("file", videoFile);

      // Make the API request
      const response = await axios.post(
        `${API_BASE_URL}/detect_from_video`,
        formData,
        {
          params: {
            exercise_type: apiExerciseType,
          },
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(percentCompleted);
            }
          },
          timeout: 120000, // 2 minutes timeout
        }
      );

      //   setProgress(100);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Video submission error:", error);

      let errorMessage = "Failed to submit video for analysis";

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.code === "ECONNABORTED") {
          errorMessage =
            "Request timed out. Please try again with a smaller video file.";
        } else if (axiosError.response?.status === 413) {
          errorMessage = "Video file is too large. Please use a smaller file.";
        } else if (axiosError.response?.status === 400) {
          errorMessage =
            "Invalid video format. Please use a standard video file.";
        } else if (axiosError.response?.status === 422) {
          errorMessage =
            "Video format not supported. Please use MP4, MOV, or AVI format.";
        } else if (axiosError.response?.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (axiosError.message.includes("Network Error")) {
          errorMessage =
            "Network error. Please check your internet connection.";
        } else if (axiosError.response?.status === 503) {
          errorMessage =
            "Service temporarily unavailable. Please try again in a few minutes.";
        }
      } else if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          errorMessage =
            "Connection timeout. Please check your internet and try again.";
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsSubmitting(false);
      setProgress(0);
    }
  };

  return {
    submitVideo,
    isSubmitting,
    progress,
  };
};
