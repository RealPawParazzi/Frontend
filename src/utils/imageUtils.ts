import { Platform } from 'react-native';

export const getSafeImageUri = (uri: any): string | undefined => {
    if (!uri) { return undefined; }

    // ✅ { uri: string } 형식도 지원
    if (typeof uri === 'object' && typeof uri.uri === 'string') {
        uri = uri.uri;
    }

    // 문자열이 아닌 경우 처리
    if (typeof uri !== 'string') {
        return undefined;
    }

    // 이미 올바른 형식인 경우
    if (uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('http')) {
        return uri;
    }

    // 안드로이드에서 number로 변환되는 것을 방지
    if (Platform.OS === 'android') {
        // 숫자로 변환되는 문자열인 경우
        if (!isNaN(Number(uri))) {
            return undefined;
        }
    }

    return uri;
};

export const getImageSource = (uri: any, defaultImage: any) => {
    // ✅ 이미 { uri: string } 형태인 경우 → 바로 리턴
    if (typeof uri === 'object' && typeof uri.uri === 'string') {
        return uri;
    }

    // ✅ 문자열인 경우 → { uri } 형태로 감싸서 리턴
    const safeUri = getSafeImageUri(uri);
    if (safeUri) {
        return { uri: safeUri };
    }

    return defaultImage;
};