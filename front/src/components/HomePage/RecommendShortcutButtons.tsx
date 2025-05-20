// 📦 components/HomePage/RecommendShortcutButtons.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native'; // ✅ 유지

const shortcuts = [
  {
    key: 'myPet',
    label: '내 펫',
    iconName: 'pets',
  },
  {
    key: 'aiPhoto',
    label: 'AI 사진 생성',
    iconName: 'brush',
  },
  {
    key: 'hallOfFame',
    label: '명예의 전당',
    iconName: 'emoji-events',
  },
  {
    key: 'todo',
    label: '오늘 할 일',
    iconName: 'check-circle-outline',
  },
  {
    key: 'question',
    label: '궁금해요',
    iconName: 'help-outline',
  },
];

const RecommendShortcutButtons = () => {
  const navigation = useNavigation();

  const handlePress = (key: string) => {
    switch (key) {
      case 'myPet':
        // @ts-ignore
        navigation.navigate('MyPage', {defaultTab: 0}); // 0은 펫 탭
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
      case 'todo':
        // @ts-ignore
        navigation.navigate('TodoScreen');
        break;
      default:
        console.warn(`❌ 알 수 없는 키: ${key}`);
    }
  };

  return (
    <View style={styles.container}>
      {shortcuts.map((item) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [isPressed, setIsPressed] = useState(false);

        return (
          <Pressable
            key={item.key}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            onPress={() => handlePress(item.key)}
            style={styles.button}
          >
            <Icon
              name={item.iconName}
              size={30}
              color={isPressed ? '#4D7CFE' : '#555'}
              style={[styles.icon, isPressed && { transform: [{ scale: 1.1 }] }]}
            />
            <Text style={[styles.label, isPressed && { color: '#4D7CFE' }]}>
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
    marginTop: 30,
    marginBottom: 30,
  },
  button: {
    alignItems: 'center',
    width: 60,
  },
  icon: {
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
});

export default RecommendShortcutButtons;
