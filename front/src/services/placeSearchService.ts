// 🔹 services/placeSearchService.ts
import axios from 'axios';
import { Platform } from 'react-native';
import { GOOGLE_API_KEY_IOS, GOOGLE_API_KEY_ANDROID } from '@env'; // .env에서 키 불러오기

const GOOGLE_PLACES_API = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const GOOGLE_API_KEY = Platform.OS === 'ios' ? GOOGLE_API_KEY_IOS : GOOGLE_API_KEY_ANDROID;


/**
 * ✅ 반려동물 장소 검색 (ex. 동물병원, 애견카페)
 * @param lat 현재 위치 위도
 * @param lng 현재 위치 경도
 */
export const searchPetFriendlyPlaces = async (lat: number, lng: number) => {
    const radius = 1500; // 검색 반경 (단위: m)
    const types = ['veterinary_care', 'pet_store', 'cafe']; // 병원, 애견용품, 카페
    const keyword = '반려동물 애견 동물병원 애견카페'; // 다중 키워드도 시도

    try {
        const response = await axios.get(GOOGLE_PLACES_API, {
            params: {
                key: GOOGLE_API_KEY,
                location: `${lat},${lng}`,
                radius,
                keyword,
                type: types.join('|'), // "type"은 여러 개 동시에 쓸 수 없음, keyword로 필터링
                language: 'ko',
            },
        });

        console.log('📡 Google API 응답 상태:', response.data.status);
        console.log('🐾 주변 장소 검색 결과 (필터 후):', response.data.results);


        return response.data.results || [];
    } catch (error) {
        console.error('❌ 장소 검색 실패:', error);
        return [];
    }
};