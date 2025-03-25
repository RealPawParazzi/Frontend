module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin', // ✅ 꼭 마지막에 위치해야 함!
  ],
};
