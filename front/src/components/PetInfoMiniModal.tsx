import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import petStore, {Pet} from '../context/petStore';
import {getImageSource} from '../utils/imageUtils';
import {useNavigation} from '@react-navigation/native';

// ✅ 기본 이미지 설정
const DEFAULT_PET_IMAGE = require('../assets/images/pets-1.jpg');

interface PetInfoMiniModalProps {
  visible: boolean;
  onClose: () => void;
  pet: Pet | null;
}

const PetInfoMiniModal: React.FC<PetInfoMiniModalProps> = ({
  visible,
  onClose,
  pet,
}) => {
  const navigation = useNavigation();
  const {removePet} = petStore(); // 🟢 삭제 스토어 함수 사용


  if (!pet) return null;

  const handleDelete = async () => {
    Alert.alert('삭제 확인', '이 반려동물을 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await removePet(pet.petId);
            onClose();
          } catch (error) {
            Alert.alert('삭제 실패', '삭제 중 오류가 발생했습니다.');
            console.error('🐶❌ 삭제 오류:', error);
          }
        },
      },
    ]);
  };


  /**
   * ✏ 수정 페이지 이동
   */
  const handleEdit = () => {
    // @ts-ignore
    navigation.navigate('PetEditScreen', {pet});
    onClose();
  };

  /**
   * 📅 반려동물 나이를 개월 수로 변환
   */
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const diffMonths =
      (now.getFullYear() - birth.getFullYear()) * 12 +
      now.getMonth() -
      birth.getMonth();
    return `${Math.floor(diffMonths / 12)} y ${diffMonths % 12} m`;
  };

  const calculateAgeKor = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const diffMonths =
      (now.getFullYear() - birth.getFullYear()) * 12 +
      now.getMonth() -
      birth.getMonth();
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    return `${years}살 ${months}개월`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* 🔹 모달 닫기 버튼 */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#555" />
          </TouchableOpacity>

          {/* 🔹 반려동물 이미지 */}
          <Image
            source={getImageSource(pet.petImg, DEFAULT_PET_IMAGE)}
            style={styles.petImage}
          />

          {/* 🔹 수정/삭제 버튼 */}
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={handleEdit}>
              <MaterialIcons name="edit" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
              <MaterialIcons name="delete" size={24} color="red" />
            </TouchableOpacity>
          </View>

          {/* 🔹 반려동물 기본 정보 */}
          <View style={styles.petInfoCard}>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petType}>
              {pet.type === 'DOG' ? 'DOG' : 'CAT'}
            </Text>
            <View style={styles.petAgeRow}>
              <MaterialIcons name="calendar-today" size={18} color="#777" />
              <Text style={styles.petAge}>{calculateAge(pet.birthDate)}</Text>
            </View>
          </View>

          {/* 🔹 보호자 정보 */}
          <View style={styles.petDetails}>
            <View style={[styles.detailBox, {backgroundColor: '#EDE7F6'}]}>
              <Text style={styles.detailLabel}>Owner</Text>
              <Text style={styles.detailValue}>{pet.member.name}</Text>
            </View>
            <View style={[styles.detailBox, {backgroundColor: '#FFF9C4'}]}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{pet.member.email}</Text>
            </View>
          </View>

          {/* 🔹 반려동물 설명 */}
          <View style={styles.petBio}>
            <Text style={styles.bioTitle}>저 {pet.name}에 대하여...!</Text>
            <Text style={styles.bioText}>
              {pet.description
                ? pet.description
                : `안녕하세요 ! 저는 ${pet.name} 라고 해요 ! ${new Date(
                    pet.birthDate,
                  ).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}에 태어난 ${calculateAgeKor(pet.birthDate)}의 귀여운 ${
                    pet.type === 'DOG' ? '멍멍이' : '야옹이'
                  }에요 ! ${
                    pet.member.name
                  } 집사랑 재미나게 살고 있어요 ! 잘 부탁해요 ! ${
                    pet.type === 'DOG' ? '🐶' : '🐱'
                  }`}
            </Text>
          </View>

          <View style={styles.petBio}>
            <Text style={styles.bioTitle}>집사는 {pet.name}를 이렇게 생각해요!</Text>
            <Text style={styles.bioText}>{pet.petDetail || '아직 작성된 집사의 소개가 없어요!'}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};
/** ✅ 스타일 정의 */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
    height: '88%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  petImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginVertical: 15,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconButton: {
    marginHorizontal: 15,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
  },
  petInfoCard: {
    backgroundColor: '#E0F2F1',
    borderRadius: 20,
    padding: 15,
    width: '100%',
    alignItems: 'center',
  },
  petName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  petType: {
    fontSize: 16,
    color: '#777',
    marginTop: 5,
  },
  petAgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  petAge: {
    fontSize: 16,
    color: '#777',
    marginLeft: 5,
  },
  petDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  detailBox: {
    width: '48%',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#555',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  petBio: {
    width: '100%',
    marginTop: 20,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  bioText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

export default PetInfoMiniModal;
