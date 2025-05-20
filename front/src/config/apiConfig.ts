// 📁 src/config/apiConfig.ts
import { Platform } from 'react-native';

/** ✅ 공통 API 루트 URL */
export const API_ROOT_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api'
    : 'http://localhost:8080/api';
