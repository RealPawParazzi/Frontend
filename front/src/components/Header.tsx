import React, {useEffect, useState} from 'react';
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
import {useNavigation} from '@react-navigation/native'; // ✅ 네비게이션 훅 추가

const Header = () => {
  const navigation = useNavigation();
  const {pets} = petStore();

  const DEFAULT_IMAGE = require('../assets/images/pets-1.jpg');
  const isDummyPet = pets[0]?.petId === 0;

  const [selectedPet, setSelectedPet] = useState(pets[0] || null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    if (!pets?.length) {
      console.log('⚠️ 반려동물 없음');
    } else {
      setSelectedPet(pets[0]);
      console.log('✅ Header에서 불러온 펫:', pets[0]);
    }
  }, [pets]);

  const getImageSource = (petImg?: string) => {
    if (!petImg) return DEFAULT_IMAGE;
    return typeof petImg === 'string'
      ? {uri: petImg, width: 40, height: 40, cache: 'force-cache'}
      : DEFAULT_IMAGE;
  };

  return (
    <View style={styles.container}>
      {/* 🐾 좌측 반려동물 프로필 or 등록 안내 */}
      <TouchableOpacity
        style={styles.petContainer}
        onPress={() => setDropdownVisible(!dropdownVisible)}>
        {/* 🐾 아이콘 또는 이미지 */}
        {(!pets?.length || isDummyPet) ? (
          <View style={styles.emptyPetCircle}>
            <Icon name="pets" size={20} color="#aaa" />
          </View>
        ) : (
          <Image
            source={getImageSource(selectedPet?.petImg)}
            style={styles.petImage}
          />
        )}
        {/* 🐱 펫 이름 or 안내문구 */}
        <Text style={styles.petName}>
          {!pets?.length || isDummyPet ? '반려동물을 등록해 주세요!' : selectedPet?.name}
        </Text>
        <Icon
          name={dropdownVisible ? 'arrow-drop-up' : 'arrow-drop-down'}
          size={22}
          color="#333"
        />
      </TouchableOpacity>

      {/* 🔔 우측 알림 아이콘 */}
      <TouchableOpacity style={styles.notificationIcon}>
        <Icon
          name={Platform.OS === 'ios' ? 'notifications' : 'notifications-none'}
          size={24}
          color="#999"
        />
      </TouchableOpacity>

      {/* 🔽 드롭다운 메뉴 */}
      {dropdownVisible && (
        <View style={styles.dropdown}>
          {(!pets?.length || isDummyPet) ? (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setDropdownVisible(false);
                navigation.navigate('PetRegistrationScreen');
              }}>
              <Text style={styles.dropdownText}>등록하러 가기</Text>
            </TouchableOpacity>
          ) : (
            pets.map(
              pet =>
                pet.petId !== selectedPet?.petId && (
                  <TouchableOpacity
                    key={pet.petId}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedPet(pet);
                      setDropdownVisible(false);
                    }}>
                    <Image
                      source={getImageSource(pet.petImg)}
                      style={styles.petImage}
                    />
                    <Text style={styles.dropdownText}>{pet.name}</Text>
                  </TouchableOpacity>
                ),
            )
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
    zIndex: 10,
  },
  petContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyPetCircle: {
    width: 35,
    height: 35,
    borderRadius: 50,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
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
    color: '#333',
    marginRight: 4,
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    left: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    width: 200,
    zIndex: 99,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dropdownText: {
    fontSize: 14,
    marginLeft: 8,
  },
  notificationIcon: {
    padding: 5,
  },
});

export default Header;
