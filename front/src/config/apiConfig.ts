// 📁 src/config/apiConfig.ts
import {Platform} from 'react-native';

/** ✅ 공통 API 루트 URL */

/** 로컬 에뮬레이터로 돌릴때 */
// export const API_ROOT_URL =
//   Platform.OS === 'android'
//     ? 'http://10.0.2.2:8080/api'
//     : 'http://localhost:8080/api';



/** 배포된  ec2 서버로 돌릴때 */
export const API_ROOT_URL = 'http://43.202.62.32:8080/api'; // 백엔드 API 서버 주소

// ipconfig getifaddr en0
// 172.29.66.96 ( 옥정 스벅 와이파이 )

// 172.30.1.87 ( 집 와이파이 )

// export const API_ROOT_URL =
//   Platform.OS === 'android'
//     ? 'http://172.30.1.87:8080/api'
//     : 'http://172.30.1.87:8080/api';
