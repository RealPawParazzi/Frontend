// 📁 screens/MapImageScreen.tsx
import React from 'react';
import {View, Image, StyleSheet, Dimensions} from 'react-native';

const MapImageScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/walk_placeholder.jpg')} // ✅ 본인이 넣은 이미지 경로로 교체
        style={styles.image}
        resizeMode="cover" // 또는 'contain' 원할 경우
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // 이미지 로딩 중에도 깔끔하게 보이도록
  },
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default MapImageScreen;
