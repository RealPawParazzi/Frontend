import React from 'react';
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

const SCREEN_HEIGHT = Dimensions.get('window').height;

// 🔹 Props 타입 정의
interface PetRouteModalProps {
    isVisible: boolean; // 모달 표시 여부
    pets: { id: number; name: string; image: any }[]; // 반려동물 리스트
    onClose: () => void; // 모달 닫기 함수
    onSelectPet: (petId: number) => void; // 특정 펫 선택 시 호출되는 함수
}

const PetRouteBottomModal: React.FC<PetRouteModalProps> = ({
                                                               isVisible,
                                                               pets,
                                                               onClose,
                                                               onSelectPet,
                                                           }) => {
    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            onSwipeComplete={onClose}
            swipeDirection="down"
            style={styles.modalContainer}
            backdropOpacity={0.3}
            propagateSwipe
        >
            <View style={styles.modalContent}>
                {/* 🔹 상단 핸들바 */}
                <View style={styles.handleBar} />

                {/* 🔹 타이틀 */}
                <Text style={styles.title}>🐾 산책 경로 보기</Text>

                {/* 🔹 펫 리스트 */}
                <FlatList
                    data={pets}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.petButton}
                            onPress={() => onSelectPet(item.id)}
                        >
                            <Image source={item.image} style={styles.petImage} />
                            <Text style={styles.petName}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
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
        paddingVertical: 24,
        minHeight: SCREEN_HEIGHT * 0.25,
    },
    handleBar: {
        width: 60,
        height: 5,
        backgroundColor: '#ccc',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
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
});

export default PetRouteBottomModal;
