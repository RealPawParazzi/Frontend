// 📁 components/WalkStatsBar.tsx
import React from 'react';
import {View, Text, Image, StyleSheet, Platform, Dimensions} from 'react-native';

interface Props {
  pet: {
    name: string;
    image: any;
  };
  elapsedTime: string;
}

const screenWidth = Dimensions.get('window').width;
const isTablet = screenWidth >= 768;

const WalkStatsBar: React.FC<Props> = ({pet, elapsedTime}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.text}>🐶 {pet.name}와 행복한 산책 중</Text>
        <Text style={styles.time}>{elapsedTime}</Text>
      </View>
      <Image source={pet.image} style={styles.image} />
    </View>
  );
};

export default WalkStatsBar;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 20 : 10,
    alignSelf: 'center', // ✅ 중앙 정렬
    width: '90%',
    maxWidth: isTablet ? 500 : undefined, // ✅ iPad에서는 최대 너비 제한
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 99,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  left: {flex: 1},
  text: {fontSize: 14, fontWeight: '600'},
  time: {fontSize: 24, fontWeight: 'bold'},
  image: {width: 40, height: 40, borderRadius: 20, marginLeft: 10},
});
