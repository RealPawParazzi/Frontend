import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import petStore, {Pet} from '../../context/petStore';
import {useNavigation} from '@react-navigation/native';
import PetInfoMiniModal from '../PetInfoMiniModal';
import {getImageSource} from '../../utils/imageUtils';

// ✅ 기본 이미지 설정
const DEFAULT_PET_IMAGE = require('../../assets/images/pets-1.jpg');

// ✅ 화면 크기 계산 (카드 크기 균일하게 설정)
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_SIZE = (SCREEN_WIDTH - 50) / 2; // ✅ 2열 그리드에서 카드 크기 균일하게 유지

// ✅ Pet + 추가 버튼 타입 지정
interface AddPetButton {
  isAddButton: boolean;
}

type PetItem = Pet | AddPetButton;

const PetInfo = () => {
  const navigation = useNavigation();
  const {pets} = petStore();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null); // ✅ 선택한 반려동물 정보 저장
  const [modalVisible, setModalVisible] = useState(false); // ✅ 모달 상태 관리
  const [isAddButton, setIsAddButton] = useState(true); // ✅ 추가 버튼 상태 관리

  // ✅ 동물 타입에 따라 아이콘 표시 (강아지: 🐶, 고양이: 🐱)
  const getAnimalIcon = (type: string) => {
    return type.toLowerCase() === 'dog' ? '🐶' : '🐱';
  };

  // 🔄 gridData 설정 부분 수정
  const realPets = pets.filter(p => p.petId !== 0); // ✅ 더미 제외
  const hasRealPet = realPets.length > 0;

  const gridData: PetItem[] = hasRealPet
    ? [...realPets, {isAddButton: true}]
    : [{isAddButton: true}];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your Buddies {realPets.length}</Text>

      {/* ✅ 반려동물 리스트 (2열 그리드) */}
      <FlatList
        data={gridData}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2} // ✅ 2열 그리드
        renderItem={({item}) =>
          (item as AddPetButton).isAddButton ? (
            // 🔹 반려동물 추가 버튼
            <TouchableOpacity
              style={[
                styles.petCard,
                styles.addPetCard,
                !hasRealPet && styles.fullWidthAddCard, // 👉 한 마리도 없으면 카드 크게!
              ]}
              //@ts-ignore
              onPress={() => navigation.navigate('PetRegistrationScreen')}>
              <MaterialIcons name="add" size={35} color="gray" />
              <Text style={styles.addPetText}>Add Pet</Text>
            </TouchableOpacity>
          ) : (
            // 🔹 반려동물 카드
            <TouchableOpacity
              style={styles.petCard}
              onPress={() => {
                setSelectedPet(item as Pet);
                setModalVisible(true);
              }}>
              {/* ✅ 반려동물 이미지 */}
              <Image
                source={getImageSource((item as Pet).petImg, DEFAULT_PET_IMAGE)}
                style={styles.petImage}
              />

              {/* ✅ 하단 정보 영역 */}
              <View style={styles.petInfoContainer}>
                {/* 🔹 반려동물 이름 & 나이 */}
                <View>
                  <Text style={styles.petName}>{(item as Pet).name}</Text>
                  <Text style={styles.petAge}>{(item as Pet).birthDate}</Text>
                </View>
                {/* 🔹 동물 아이콘 (강아지/고양이) */}
                <Text style={styles.petIcon}>
                  {getAnimalIcon((item as Pet).type)}
                </Text>
              </View>
            </TouchableOpacity>
          )
        }
      />

      {/* ✅ 반려동물 상세 모달 */}
      <PetInfoMiniModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        pet={selectedPet}
      />
    </View>
  );
};

/** ✅ 스타일 정의 */
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingBottom: 1300,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  /** ✅ 반려동물 카드 & 추가 버튼 크기 통일 */
  petCard: {
    width: CARD_SIZE, // ✅ 균일한 너비
    height: 180, // ✅ 균일한 높이
    backgroundColor: 'white',
    borderRadius: 12,
    paddingBottom: 10,
    margin: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2, // ✅ 안드로이드 그림자 효과
  },

  /** ✅ 반려동물 이미지 */
  petImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  /** ✅ 반려동물 정보 영역 */
  petInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: 5,
  },

  /** ✅ 반려동물 이름 */
  petName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flexWrap: 'wrap',
    maxWidth: '80%',
  },

  /** ✅ 반려동물 나이 */
  petAge: {
    fontSize: 12,
    color: 'gray',
    marginTop: 2,
  },

  /** ✅ 반려동물 아이콘 */
  petIcon: {
    fontSize: 20,
  },

  /** ✅ 반려동물 추가 버튼 (카드 크기 통일) */
  addPetCard: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4D7CFE', // ✅ 점선 테두리 색상
    borderRadius: 12,
    borderStyle: 'dashed', // ✅ 점선 테두리
    backgroundColor: '#e0ecfa',
  },

  /** ✅ 추가 버튼 텍스트 */
  addPetText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 5,
  },
  fullWidthAddCard: {
    width: SCREEN_WIDTH - 30, // 한 줄 전체
    height: 200,
    alignSelf: 'center',
  },
});

export default PetInfo;
