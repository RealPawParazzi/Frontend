import { Platform, PermissionsAndroid } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

/** 📸 카메라 권한 요청 함수 */
export const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
                title: '📸 카메라 권한 요청',
                message: '사진 촬영을 위해 카메라 권한이 필요합니다.',
                buttonNeutral: '나중에',
                buttonNegative: '취소',
                buttonPositive: '확인',
            }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
        const status = await request(PERMISSIONS.IOS.CAMERA);
        return status === RESULTS.GRANTED;
    }
};
