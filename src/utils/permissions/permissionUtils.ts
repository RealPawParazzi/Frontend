import { requestLocationPermission } from './locationPermission';
import { requestCameraPermission } from './cameraPermission';
import { requestGalleryPermission } from './galleryPermission';
import { requestNotificationPermission } from './notificationPermission';

/** 🎛️ 한 번에 모든 권한 요청 */
export const requestAllPermissions = async () => {
    const locationGranted = await requestLocationPermission();
    const cameraGranted = await requestCameraPermission();
    const galleryGranted = await requestGalleryPermission();
    const notificationGranted = await requestNotificationPermission();

    return {
        location: locationGranted,
        camera: cameraGranted,
        gallery: galleryGranted,
        notification: notificationGranted,
    };
};
