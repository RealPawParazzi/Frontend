import { Platform, PermissionsAndroid } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

/** 🖼️ 갤러리 권한 요청 함수 */
export const requestGalleryPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
                title: '🖼️ 갤러리 접근 권한 요청',
                message: '사진 업로드를 위해 갤러리 접근 권한이 필요합니다.',
                buttonNeutral: '나중에',
                buttonNegative: '취소',
                buttonPositive: '확인',
            }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
        const status = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        return status === RESULTS.GRANTED;
    }
};
