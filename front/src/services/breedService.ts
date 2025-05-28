import axios from 'axios';

interface PetBreedPrediction {
  breed: string;
  confidence: number;
}

// GCP 서버 URL 설정
const API_BASE_URL = 'http://34.64.201.17:8000';
const DETECT_URL = `${API_BASE_URL}/api/pet-breed/detect`;

export const predictPetBreed = async (
  imageUri: string,
): Promise<PetBreedPrediction> => {
  try {
    // 이미지를 FormData로 변환
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'pet_image.jpg',
    } as any);

    // GCP 서버로 요청
    const response = await axios.post(DETECT_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('펫 품종 추론 중 오류 발생:', error);
    throw error;
  }
};

export const getTopBreeds = (
  prediction: PetBreedPrediction,
  threshold: number = 0.7,
): string[] => {
  if (prediction.confidence >= threshold) {
    return [prediction.breed];
  }
  return [];
};

export interface PetBreedResponse {
  breed: string; // 한글 품종명
  breed_en: string; // 영문 품종명
  confidence: number; // 신뢰도
}

export const detectPetBreed = async (
  imageUri: string,
): Promise<PetBreedResponse> => {
  try {
    // 이미지를 FormData로 변환
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'pet_image.jpg',
    } as any);

    const response = await axios.post<PetBreedResponse>(DETECT_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error detecting pet breed:', error);
    throw error;
  }
};
