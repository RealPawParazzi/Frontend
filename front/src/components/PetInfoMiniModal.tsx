import React from 'react';
import {
    View, Text, Image, StyleSheet, TouchableOpacity, Alert, Modal
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import petStore, { Pet } from '../context/petStore';

// ✅ 기본 이미지 설정
const DEFAULT_PET_IMAGE = require('../assets/images/pets-1.jpg');

interface PetInfoMiniModalProps {
    visible: boolean;
    onClose: () => void;
    pet: Pet | null;
    onEdit: (pet: Pet) => void;
    onDelete: (petId: number) => void;
}

const PetInfoMiniModal: React.FC<PetInfoMiniModalProps> = ({ visible, onClose, pet, onEdit, onDelete }) => {
    if (!pet) { return null; }

    /**
     * 🗑️ 반려동물 삭제 처리
     */
    const handleDelete = () => {
        Alert.alert('삭제 확인', '이 반려동물을 삭제하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            {
                text: '삭제',
                onPress: () => onDelete(pet.petId),
                style: 'destructive',
            },
        ]);
    };

    /**
     * 📅 반려동물 나이를 개월 수로 변환
     */
    const calculateAge = (birthDate: string) => {
        const birth = new Date(birthDate);
        const now = new Date();
        const diffMonths = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
        return `${Math.floor(diffMonths / 12)} y ${diffMonths % 12} m`;
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
                    <Image source={pet.petImg ? { uri: pet.petImg } : DEFAULT_PET_IMAGE} style={styles.petImage} />

                    {/* 🔹 수정/삭제 버튼 */}
                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => onEdit(pet)}
                        >
                            <MaterialIcons name="edit" size={24} color="black" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
                            <MaterialIcons name="delete" size={24} color="red" />
                        </TouchableOpacity>
                    </View>

                    {/* 🔹 반려동물 기본 정보 */}
                    <View style={styles.petInfoCard}>
                        <Text style={styles.petName}>{pet.name}</Text>
                        <Text style={styles.petType}>{pet.type === 'CAT' ? 'Persian Cat' : 'Golden Retriever'}</Text>
                        <View style={styles.petAgeRow}>
                            <MaterialIcons name="calendar-today" size={18} color="#777" />
                            <Text style={styles.petAge}>{calculateAge(pet.birthDate)}</Text>
                        </View>
                    </View>

                    {/* 🔹 상세 정보 (Weight, Height, Color, Blood Type) */}
                    <View style={styles.petDetails}>
                        <View style={[styles.detailBox, { backgroundColor: '#EDE7F6' }]}>
                            <Text style={styles.detailLabel}>Weight</Text>
                            <Text style={styles.detailValue}>{pet.weight}kg</Text>
                        </View>
                        <View style={[styles.detailBox, { backgroundColor: '#FFF9C4' }]}>
                            <Text style={styles.detailLabel}>Height</Text>
                            <Text style={styles.detailValue}>{pet.height}cm</Text>
                        </View>
                        <View style={[styles.detailBox, { backgroundColor: '#FFEBEE' }]}>
                            <Text style={styles.detailLabel}>Color</Text>
                            <Text style={styles.detailValue}>{pet.color}</Text>
                        </View>
                        <View style={[styles.detailBox, { backgroundColor: '#FFCCBC' }]}>
                            <Text style={styles.detailLabel}>Blood</Text>
                            <Text style={styles.detailValue}>{pet.bloodType}</Text>
                        </View>
                    </View>

                    {/* 🔹 반려동물 설명 */}
                    <View style={styles.petBio}>
                        <Text style={styles.bioTitle}>🐾 Pet Biography</Text>
                        <Text style={styles.bioText}>
                            {pet.description || '이 반려동물에 대한 설명이 없습니다.'}
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

/** ✅ 스타일 정의 */
const styles = StyleSheet.create({
    /** 🔹 모달 오버레이 */
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },

    /** 🔹 모달 컨테이너 */
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        alignItems: 'center',
    },

    /** 🔹 모달 닫기 버튼 */
    closeButton: {
        alignSelf: 'flex-end',
        padding: 5,
    },

    /** 🔹 반려동물 이미지 */
    petImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 15,
    },

    /** 🔹 수정/삭제 버튼 */
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

    /** 🔹 반려동물 기본 정보 카드 */
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

    /** 🔹 반려동물 상세 정보 */
    petDetails: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    },

    detailBox: {
        width: '22%',
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

    /** 🔹 반려동물 설명 */
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
