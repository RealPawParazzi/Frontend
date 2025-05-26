export interface DogBreedPrediction {
  breed: string;
  confidence: number;
}

export interface DogBreedResponse {
  breed: string;      // 한글 품종명
  breed_en: string;   // 영문 품종명
  confidence: number; // 신뢰도
}

// GCP 서버 URL 설정
const API_BASE_URL = 'http://34.64.201.17:8000';
const DETECT_URL = `${API_BASE_URL}/api/dog-breed/detect`;

/** ✅ 단순 추론 결과 (영문 품종명 + confidence) */
export const predictDogBreed = async (imageUri: string): Promise<DogBreedPrediction> => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'dog_image.jpg',
  } as any);

  const res = await fetch(DETECT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    console.error('강아지 품종 추론 중 오류 발생:', error);
    throw new Error(error.message || '추론 요청 실패');
  }

  return await res.json();
};

/** ✅ 높은 confidence만 필터링 */
export const getTopBreeds = (prediction: DogBreedPrediction, threshold: number = 0.7): string[] => {
  if (prediction.confidence >= threshold) {
    return [prediction.breed];
  }
  return [];
};

/** ✅ 한글 품종 이름 포함한 응답 받기 */
export const detectDogBreed = async (imageUri: string): Promise<DogBreedResponse> => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'dog_image.jpg',
  } as any);

  const res = await fetch(DETECT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    console.error('Error detecting dog breed:', error);
    throw new Error(error.message || '품종 탐지 실패');
  }

  return await res.json();
};
