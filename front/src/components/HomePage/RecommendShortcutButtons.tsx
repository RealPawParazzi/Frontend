// 📦 components/HomePage/RecommendShortcutButtons.tsx
import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native'; // ✅ 유지

const shortcuts = [
  {
    key: 'myPet',
    label: '내 펫',
    iconName: 'pets',
    color: '#4CAF50',
  },
  {
    key: 'aiPhoto',
    label: 'AI 동영상',
    iconName: 'brush',
    color: '#FF9800',
  },
  {
    key: 'hallOfFame',
    label: '명예의 전당',
    iconName: 'emoji-events',
    color: '#FFD700',
  },
  {
    key: 'miniGame', // ✅ key 변경
    label: '미니게임',
    iconName: 'sports-esports', // ✅ 게임 컨트롤러 아이콘
    color: '#9C27B0', // ✅ 보라색 계열
  },
  {
    key: 'question',
    label: '궁금해요',
    iconName: 'help-outline',
    color: '#FF5722',
  },
];

const RecommendShortcutButtons = () => {
  const navigation = useNavigation();

  const handlePress = (key: string) => {
    switch (key) {
      case 'myPet':
        // @ts-ignore
        navigation.navigate('MyPage', { defaultTab: 0 });
        break;
      case 'aiPhoto':
        // @ts-ignore
        navigation.navigate('VideoEditorScreen');
        break;
      case 'question':
        // @ts-ignore
        navigation.navigate('CuriousScreen');
        break;
      case 'hallOfFame':
        // @ts-ignore
        navigation.navigate('HallOfFame');
        break;
      case 'miniGame':
        // @ts-ignore
        navigation.navigate('MiniGameScreen');
        break;
      default:
        console.warn(`❌ 알 수 없는 키: ${key}`);
    }
  };

  return (
    <View style={styles.container}>
      {shortcuts.map(item => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [isPressed, setIsPressed] = useState(false);

        return (
          <Pressable
            key={item.key}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            onPress={() => handlePress(item.key)}
            style={styles.button}>
            <Icon
              name={item.iconName}
              size={32}
              color={isPressed ? '#555' : item.color}
              style={[styles.icon, isPressed && {transform: [{scale: 1.1}]}]}
            />
            <Text style={[styles.label, isPressed && {color: '#555'}]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    marginBottom: 15,
  },
  button: {
    alignItems: 'center',
    width: 60,
  },
  icon: {
    marginBottom: 5,
  },
  label: {
    fontSize: 10.5,
    color: '#333',
    textAlign: 'center',
  },
});

export default RecommendShortcutButtons;
