import {Platform, PermissionsAndroid, Alert, Linking} from 'react-native';
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';

/** 📍 위치 권한 요청 함수 */
export const requestLocationPermission = async (): Promise<boolean> => {

    const handleLocationPermissionDenied = () => {
        Alert.alert(
            '위치 권한이 필요합니다',
            '위치 서비스를 사용하려면 설정에서 위치 권한을 허용해주세요.',
            [
                { text: '취소', style: 'cancel' },
                { text: '설정으로 이동', onPress: () => Linking.openSettings() },
            ]
        );
    };

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


        if (granted !== RESULTS.GRANTED) {
            handleLocationPermissionDenied();
            return false;
        }


        return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
        try {
            // iOS 위치 권한 상태 확인
            const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

            if (status === RESULTS.GRANTED) {
                console.log('✅ 위치 권한 이미 허용됨');
                return true;
            }

            // 권한 요청
            const newStatus = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

            if (newStatus === RESULTS.GRANTED) {
                console.log('✅ 위치 권한 허용됨');
                return true;
            } else {
                console.warn('❌ 위치 권한 거부됨');
                handleLocationPermissionDenied();
                return false;
            }
        } catch (error) {
            console.error('🚨 iOS 위치 권한 요청 오류:', error);
            return false;
        }
    }

};
