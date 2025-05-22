import React, {useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import petStore from '../context/petStore'; // userStore → petStore로 변경
import { useNavigation } from '@react-navigation/native'; // ✅ 네비게이션 훅 추가


const Header = () => {
  const navigation = useNavigation(); // ✅ 네비게이션 객체
  const {pets} = petStore(); // Zustand에서 반려동물 리스트 가져옴

  const DEFAULT_IMAGE = require('../assets/images/pets-1.jpg');
  const isDummyPet = pets[0]?.petId === 0;


  const getImageSource = () => {
    if (!pets?.length || isDummyPet) { return DEFAULT_IMAGE; }


    const petImage = pets[1]?.petImg;
    if (!petImage) {
      return DEFAULT_IMAGE;
    }

    if (typeof petImage === 'string') {
      return {
        uri: petImage,
        width: 40,
        height: 40,
        cache: 'force-cache',
      };
    }

    return DEFAULT_IMAGE;
  };

  useEffect(() => {
    if (!pets?.length) {
      console.log('⚠️ 반려동물 없음, 기본 이미지 사용됨');
      console.log('✅ Header에서 불러온 펫:', pets[0]);
    } else {
      console.log('✅ Header에서 불러온 펫:', pets[0]);
    }
  }, [pets]);

  return (
    <View style={styles.container}>
      {/* 🖼️ 반려동물 프로필 (왼쪽) */}
      <TouchableOpacity style={styles.petContainer}>
        <Image source={getImageSource()} style={styles.petImage} />
        <Text style={styles.petName}>
          {isDummyPet ? '반려동물을 등록해 주세요!' : pets[1]?.name}
        </Text>
        <Icon
          name={
            Platform.OS === 'ios' ? 'keyboard-arrow-down' : 'arrow-drop-down'
          }
          size={20}
          color="black"
        />
      </TouchableOpacity>

      {/* 🔔 알림 아이콘 (오른쪽) */}
      <TouchableOpacity style={styles.notificationIcon}>
        <Icon
          name={Platform.OS === 'ios' ? 'notifications' : 'notifications-none'}
          size={24}
          color="#999"
        />
      </TouchableOpacity>
    </View>
  );
};

/**
 * ✅ 스타일 정의
 */
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,

    // 💫 그림자 스타일 추가
    backgroundColor: '#fff', // 그림자 보이게 하려면 필요
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4, // Android용
    zIndex: 10, // iOS z-index 효과 보정
  },
  petContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petImage: {
    width: 35,
    height: 35,
    borderRadius: 50,
    marginRight: 8,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
    color: '#999',
  },
  notificationIcon: {
    padding: 5,
  },
});

export default Header;
