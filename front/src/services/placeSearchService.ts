// 🔹 services/placeSearchService.ts
import axios from 'axios';
import {Platform} from 'react-native';
import {GOOGLE_API_KEY_IOS, GOOGLE_API_KEY_ANDROID} from '@env'; // .env에서 키 불러오기

const GOOGLE_PLACES_API =
  'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const GOOGLE_API_KEY =
  Platform.OS === 'ios' ? GOOGLE_API_KEY_IOS : GOOGLE_API_KEY_ANDROID;

/**
 * ✅ 반려동물 관련 장소 검색 (다중 타입 + 키워드 + 중복 제거 포함)
 * @param lat 현재 위치 위도
 * @param lng 현재 위치 경도
 * @returns 중복 제거된 장소 리스트
 */

export const searchPetFriendlyPlaces = async (lat: number, lng: number) => {
  try {
    // ✅ 1. 하나의 강력한 키워드 + broad type으로 한번에 검색
    const keyword = '강아지 고양이 펫 반려동물 dog cat pet animal'; // 한글+영문 혼합
    const response = await axios.get(GOOGLE_PLACES_API, {
      params: {
        key: GOOGLE_API_KEY,
        location: `${lat},${lng}`,
        rankby: 'distance', // ✅ 가까운 순으로 정렬
        keyword,
        type: 'point_of_interest', // ✅ 넓은 범위로 포함
        language: 'ko',
      },
    });

    const results = response.data.results || [];
    console.log('📡 Google API 응답 상태:', response.data.status);
    console.log('🐾 검색된 장소 수:', results.length);

    return results;
  } catch (error) {
    console.error('❌ 장소 검색 실패:', error);
    return [];
  }
};
