const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
    resolver: {
        assetExts: [
            'json', // Lottie JSON 파일 지원 추가
            'png',
            'jpg',
            'jpeg',
            'gif',
            'svg',
            'mp4',
        ],
    },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
