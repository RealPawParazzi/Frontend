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
    const keyword = [
      '반려동물',
      '애완동물',
      '애견',
      '애묘',
      'dog',
      'cat',
      'pet',
      'animal',
      'dogcafe',
      'catcafe',
      'veterinary',
      'grooming',
      '동물병원',
      '펫샵',
      'vets',
      // 'petshop',
      // 'petstore',
      // 'petfriendly',
      // '애완동물카페',
      // '애견카페',
      // '애묘카페',
      // '애견미용',
      // '애묘미용',
      // '반려동물용품점',
      // '반려동물카페',
      // '반려동물병원',
      // '반려동물식당',
      // '반려동물식품점',
      // '반려동물식품',
      // '반려동물용품',
      // '반려동물미용',
      // '반려동물호텔',

    ].join(' ');
    const response = await axios.get(GOOGLE_PLACES_API, {
      params: {
        key: GOOGLE_API_KEY,
        location: `${lat},${lng}`,
        radius: 1500,
        keyword,
        type: 'point_of_interest', // ✅ 넓은 범위로 포함
        language: 'ko',
      },
    });

    const rawResults = response.data.results || [];

    // ✅ 중복 제거: 장소명 + 주소 기준
    const uniqueMap = new Map();
    for (const place of rawResults) {
      const key = `${place.name}_${place.vicinity}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, place);
      }
    }

    const uniqueResults = Array.from(uniqueMap.values());

    console.log('📡 Google API 응답 상태:', response.data.status);
    console.log('🐾 총 결과(중복 제거 후):', uniqueResults.length);

    return uniqueResults;
  } catch (error) {
    console.error('❌ 장소 검색 실패:', error);
    return [];
  }
};
