import { Platform } from 'react-native';
import { request, RESULTS, requestNotifications } from 'react-native-permissions';

/** 🔔 알림 권한 요청 함수 */
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
        // ✅ iOS에서는 requestNotifications 사용
        const { status } = await requestNotifications(['alert', 'badge', 'sound']);
        return status === RESULTS.GRANTED;
    } else if (Platform.OS === 'android' && Platform.Version >= 33) {
        // ✅ Android 13 이상에서만 POST_NOTIFICATIONS 요청
        const status = await request('android.permission.POST_NOTIFICATIONS' as any);
        return status === RESULTS.GRANTED;
    }
    return true; // ✅ Android 12 이하는 따로 요청할 필요 없음
};
