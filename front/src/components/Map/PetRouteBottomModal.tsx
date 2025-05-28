import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

// 🔹 Props 타입 정의
interface WalkSummary {
  id: number;
  startTime: string;
  endTime: string;
  distance: number;
}

interface Pet {
  id: number;
  name: string;
  image: any;
}

// 🔹 Props 타입 정의
interface PetRouteBottomModalProps {
  isVisible: boolean;
  pets: Pet[];
  onClose: () => void;
  getWalksByPetId: (petId: number) => Promise<WalkSummary[]>;
  onSelectWalk: (walkId: number) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const isTablet = SCREEN_WIDTH >= 768;

const PetRouteBottomModal: React.FC<PetRouteBottomModalProps> = ({
  isVisible,
  pets,
  onClose,
  getWalksByPetId,
  onSelectWalk,
}) => {

  const navigation = useNavigation();

  const filteredPets = pets.filter(p => p.id !== 0); // ✅ 더미 데이터 제외
  const isOnlyDummy = pets.length === 1 && pets[0].id === 0;


  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [walkHistories, setWalkHistories] = useState<WalkSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPet = async (pet: Pet) => {
    setSelectedPet(pet);
    setIsLoading(true);
    try {
      const histories = await getWalksByPetId(pet.id);
      setWalkHistories(histories);
    } catch (e) {
      console.error('🚨 산책 기록 불러오기 실패:', e);
      setWalkHistories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPetList = () => {
    setSelectedPet(null);
    setWalkHistories([]);
  };


  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modalContainer}
      backdropOpacity={0.3}
      propagateSwipe>
      <View style={styles.modalContent}>
        {/* 🔹 핸들바 */}
        <View style={styles.handleBar} />

        {/* 🔹 헤더 */}
        {!selectedPet ? (
          isOnlyDummy ? (
            <View style={{alignItems: 'center', marginTop: 24}}>
              <Text style={styles.noticeText}>아직 등록된 반려동물이 없습니다.</Text>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => {
                  onClose();
                  //@ts-ignore
                  navigation.navigate('PetRegistrationScreen');
                }}>
                <Icon name="add" size={18} color="#fff" style={styles.icon} />
                <Text style={styles.registerButtonText}>등록하러 가기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.title}>🐾 산책 경로 보기</Text>
              <Text style={styles.noticeText}>
                반려동물을 선택하면 산책 기록을 볼 수 있어요.
              </Text>
              <FlatList
                data={filteredPets}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingHorizontal: 16}}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.petButton}
                    onPress={() => handleSelectPet(item)}>
                    <Image source={item.image} style={styles.petImage} />
                    <Text style={styles.petName}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )
        ) : (
          <>
            <View style={styles.walkHeader}>
              <TouchableOpacity onPress={handleBackToPetList}>
                <Text style={styles.backButton}>←</Text>
              </TouchableOpacity>
              <Text style={styles.title}>{selectedPet.name}의 산책 기록</Text>
            </View>
            {isLoading ? (
              <Text style={styles.loadingText}>불러오는 중...</Text>
            ) : (
              <FlatList
                data={walkHistories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.walkItem}
                    onPress={() => onSelectWalk(item.id)}>
                    <Text style={styles.walkText}>
                      📍 {item.startTime.split('T')[0]} / {item.distance}km
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>📭 산책 기록이 없습니다.</Text>
                }
              />
            )}
          </>
        )}
      </View>
    </Modal>
  );
};

// 🔹 스타일 정의
const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    minHeight: SCREEN_HEIGHT * 0.3,

    // 📱 아이패드 대응
    width: isTablet ? 500 : '100%',
    alignSelf: isTablet ? 'center' : 'flex-start',
    paddingHorizontal: isTablet ? 24 : 20,
  },
  handleBar: {
    width: 60,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  noticeText: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    marginBottom: 16,
  },
  petButton: {
    alignItems: 'center',
    marginRight: 16,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 6,
  },
  petName: {
    fontSize: 14,
    fontWeight: '500',
  },
  walkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  backButton: {
    fontSize: 20,
    marginRight: 10,
    color: '#4D7CFE',
  },
  walkItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  walkText: {
    fontSize: 15,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4D7CFE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  icon: {
    marginRight: 6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PetRouteBottomModal;
