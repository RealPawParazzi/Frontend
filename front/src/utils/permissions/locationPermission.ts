import { Platform, PermissionsAndroid } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

/** 📍 위치 권한 요청 함수 */
export const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: '📍 위치 권한 요청',
                message: '산책 기능을 사용하려면 위치 권한이 필요합니다.',
                buttonNeutral: '나중에',
                buttonNegative: '취소',
                buttonPositive: '확인',
            }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
        const status = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        return status === RESULTS.GRANTED;
    }
};
