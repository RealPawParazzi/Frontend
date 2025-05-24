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
  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>
            🤔 <Text style={{color: '#4D7CFE'}}>누구랑</Text> 산책할까요?
          </Text>
          <FlatList
            horizontal
            data={pets}
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
});
