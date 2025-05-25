// 📁 services/questionService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ROOT_URL } from '../config/apiConfig';

// 🔹 백엔드 API 기본 URL
const API_BASE_URL = `${API_ROOT_URL}/inquiry`;


// ✅ 인증 토큰을 AsyncStorage에서 가져오는 함수
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('로그인이 필요합니다.'); // 토큰이 없으면 예외 발생
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};


/**
 * ✅ 1. 문의 등록 API 호출
 * @param title - 문의 제목
 * @param content - 문의 내용
 */
export const createInquiry = async (title: string, content: string) => {
  const config = await getAuthHeader();
  const response = await axios.post(API_BASE_URL, { title, content }, config);
  return response.data;
};

/**
 * ✅ 2. 나의 문의 목록 조회 API 호출
 * GET /api/inquiry/my
 */
export const fetchMyInquiries = async () => {
  const config = await getAuthHeader();
  const response = await axios.get(`${API_BASE_URL}/my`, config);
  return response.data.data; // 문의 요약 목록 배열
};

/**
 * ✅ 3. 문의 상세 조회 API 호출
 * GET /api/inquiry/{inquiryId}
 * @param inquiryId - 상세 조회할 문의 ID
 */
export const fetchInquiryDetail = async (inquiryId: number) => {
  const config = await getAuthHeader();
  const response = await axios.get(`${API_BASE_URL}/${inquiryId}`, config);
  return response.data.data; // 상세 문의 정보 객체
};

/**
 * ✅ 4. 문의 삭제 API 호출
 * DELETE /api/inquiry/{inquiryId}
 * @param inquiryId - 삭제할 문의 ID
 */
export const deleteInquiry = async (inquiryId: number) => {
  const config = await getAuthHeader();
  const response = await axios.delete(`${API_BASE_URL}/${inquiryId}`, config);
  return response.data;
};
