// 📁 components/PetSelectorModal.tsx
import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

interface Pet {
  id: string;
  name: string;
  image: any;
}

interface Props {
  isVisible: boolean;
  selectedPetId: string;
  pets: Pet[];
  keepThisPet: boolean;
  onSelectPet: (petId: string) => void;
  onToggleKeep: () => void;
  onConfirm: () => void;
  onClose: () => void;
}

const PetSelectorModal: React.FC<Props> = ({
  isVisible,
  selectedPetId,
  pets,
  keepThisPet,
  onSelectPet,
  onToggleKeep,
  onConfirm,
  onClose,
}) => {
  const navigation = useNavigation();

  const filteredPets = pets.filter(p => p.id !== '0'); // ✅ 더미 데이터 제외
  const isOnlyDummy = pets.length === 1 && pets[0].id === '0';


  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.content}>
          {/* 🔺 닫기 버튼 */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={22} color="#999" />
          </TouchableOpacity>
          <Text style={styles.title}>
            🤔 <Text style={{color: '#4D7CFE'}}>누구랑</Text> 산책할까요?
          </Text>

          {isOnlyDummy ? (
              <View style={{alignItems: 'center', marginVertical: 24}}>
                <Text style={{color: '#777', marginBottom: 16}}>
                  아직 등록된 반려동물이 없습니다.
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    onClose(); // ✅ 모달 닫기 먼저
                    //@ts-ignore
                    navigation.navigate('PetRegistrationScreen');
                  }}
                  style={styles.registerButton}>
                  <Icon name="add" size={18} color="#fff" style={styles.icon} />
                  <Text style={styles.registerButtonText}>등록하러 가기</Text>
                </TouchableOpacity>
              </View>

          ) : (
            <>
          <FlatList
            horizontal
            data={filteredPets}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => onSelectPet(item.id)}
                style={[
                  styles.petCard,
                  selectedPetId === item.id && styles.petCardSelected,
                ]}>
                <Image source={item.image} style={styles.petImage} />
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />

          {/* ✅ 체크박스 */}
          <TouchableOpacity style={styles.checkboxRow} onPress={onToggleKeep}>
            <Icon
              name={keepThisPet ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={keepThisPet ? '#4D7CFE' : '#999'}
            />
            <Text style={styles.checkboxText}>당분간 계속 이 아이와 산책할게요</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
            <Text style={styles.confirmButtonText}>산책 시작하기</Text>
          </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default PetSelectorModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
    marginBottom: 20,
  },
  content: {
    backgroundColor: 'white',
    padding: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  title: {fontSize: 18, fontWeight: 'bold', marginBottom: 16},
  petCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  petCardSelected: {
    backgroundColor: '#FFDD99',
    borderWidth: 2,
    borderColor: '#FFB400',
  },
  petImage: {width: 50, height: 50, borderRadius: 25},
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkboxText: {marginLeft: 8},
  confirmButton: {
    backgroundColor: '#4D7CFE',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmButtonText: {color: 'white', fontSize: 16},
  registerButton: {
    flexDirection: 'row',        // 아이콘과 텍스트 나란히
    alignItems: 'center',        // 수직 정렬 중앙
    backgroundColor: '#4D7CFE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  icon: {
    marginRight: 6,              // 텍스트와 간격
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
