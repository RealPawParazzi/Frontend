import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

interface Place {
  name: string;
  vicinity?: string; // Google Places API의 주소
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface PlaceDetailModalProps {
  isVisible: boolean;
  place: Place | null;
  onClose: () => void;
  isFavorite: boolean; // 현재 선택된 장소가 즐겨찾기인지
  onToggleFavorite: () => void; // 즐겨찾기 추가 or 삭제
}

const {height} = Dimensions.get('window');

const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  isVisible,
  place,
  onClose,
  isFavorite,
  onToggleFavorite,
}) => {
  if (!place) {
    return null;
  }

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>{place.name}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          {/* 주소 */}
          {place.vicinity && (
            <Text style={styles.address}>📍 {place.vicinity}</Text>
          )}

          {/* 즐겨찾기 버튼 */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onToggleFavorite}
          >
            <Icon name={isFavorite ? 'star' : 'star-border'} size={20} color="#fff" />
            <Text style={styles.favoriteButtonText}>
              {isFavorite ? '즐겨찾기 삭제' : '즐겨찾기 등록'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: height * 0.25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  favoriteButton: {
    flexDirection: 'row',
    backgroundColor: '#4D7CFE',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
});

export default PlaceDetailModal;
