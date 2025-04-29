// 🔹 services/placeSearchService.ts
import axios from 'axios';
import { Platform } from 'react-native';
import { GOOGLE_API_KEY_IOS, GOOGLE_API_KEY_ANDROID } from '@env'; // .env에서 키 불러오기

const GOOGLE_PLACES_API = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const GOOGLE_API_KEY = Platform.OS === 'ios' ? GOOGLE_API_KEY_IOS : GOOGLE_API_KEY_ANDROID;



/**
 * ✅ 반려동물 관련 장소 검색 (다중 타입 + 키워드 + 중복 제거 포함)
 * @param lat 현재 위치 위도
 * @param lng 현재 위치 경도
 * @returns 중복 제거된 장소 리스트
 */

export const searchPetFriendlyPlaces = async (lat: number, lng: number) => {
    const radius = 1000; // 검색 반경 (단위: m)

    // 추가된 키워드 (한글 + 영어)
    const keyword =
        '강아지 고양이 펫 반려동물 pet vet';

    // 사용할 type 리스트
    const types = [
        'veterinary_care',
        'vet',                   // 동물 병원
        'pet_store',           // 펫 용품점
        'cafe',                // 애견 카페
        'store',               // 일반 상점 (펫 용품점 포함 가능)
        'park',                // 산책 가능한 공원
        'bakery',              // 애견 간식점
        'point_of_interest',   // 관심 장소 (광범위)
        'establishment',        // 거의 모든 상업 장소 포함
    ];


    const allResults: any[] = [];

    try {
        // 각 타입에 대해 API 호출
        for (const type of types) {
            const response = await axios.get(GOOGLE_PLACES_API, {
                params: {
                    key: GOOGLE_API_KEY,
                    location: `${lat},${lng}`,
                    radius,
                    keyword,
                    type,
                    language: 'ko',
                },
            });

        console.log('📡 Google API 응답 상태:', response.data.status);
        console.log(`📡 ${type} 검색 결과 상태:`, response.data.status);
        if (response.data.results) {
                allResults.push(...response.data.results);
            }
        }

        const uniqueResults = Array.from(
            new Map(allResults.map((place) => [place.place_id, place])).values()
        );

        console.log('🐾 중복 제거 후 최종 장소 수:', uniqueResults.length);
        return uniqueResults;
    } catch (error) {
        console.error('❌ 장소 검색 실패:', error);
        return [];
    }
};
