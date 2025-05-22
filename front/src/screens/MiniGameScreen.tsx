// 📄 screens/MiniGameScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';

const MiniGameScreen: React.FC = () => {
  const handleStartGame = () => {
    Alert.alert('🎉 게임 시작!', '미니게임이 곧 시작됩니다!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🏷️ 타이틀 */}
      <Text style={styles.title}>🎮 오늘의 미니게임!</Text>

      {/* 🖼️ 게임 카드 (임시 이미지) */}
      <View style={styles.gameCard}>
        <Image
          source={require('../assets/images/1.jpg')} // 예시 이미지
          style={styles.gameImage}
          resizeMode="cover"
        />
        <Text style={styles.gameName}>🐱 고양이와 기억력 게임</Text>
      </View>

      {/* ▶️ 게임 시작 버튼 */}
      <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
        <Text style={styles.startButtonText}>게임 시작하기</Text>
      </TouchableOpacity>

      {/* 💬 힌트 메시지 */}
      <Text style={styles.hintText}>힌트: 60초 안에 최대한 많은 아이템을 기억하세요!</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#4D7CFE',
  },
  gameCard: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#F0F4FF',
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
  },
  gameImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#DDD',
  },
  gameName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  startButton: {
    backgroundColor: '#4D7CFE',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default MiniGameScreen;
