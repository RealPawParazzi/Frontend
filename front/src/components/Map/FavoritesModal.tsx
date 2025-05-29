// 📁 components/Map/FavoritesModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList, Dimensions,
} from 'react-native';
import {Place} from '../../context/placeStore';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  places: Place[];
  onSelectPlace: (place: Place) => void;
}

const screenWidth = Dimensions.get('window').width;
const isTablet = screenWidth >= 768;

const FavoritesModal: React.FC<Props> = ({isVisible, onClose, places, onSelectPlace}) => {

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>⭐ 즐겨찾기 목록</Text>
          <FlatList
            data={places}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => onSelectPlace(item)}
              >
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.addr}>{item.address}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={{textAlign: 'center', color: '#888'}}>
                추가된 즐겨찾기가 없습니다.
              </Text>
            }
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={{color: 'white', fontWeight: 'bold'}}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FavoritesModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000077',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '55%',
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,

    width: isTablet ? 500 : '100%',
    alignSelf: isTablet ? 'center' : 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  card: {
    paddingVertical: 12,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  addr: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    marginTop: 14,
    backgroundColor: '#4D7CFE',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
});

