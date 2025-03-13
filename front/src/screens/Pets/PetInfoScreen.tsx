import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Alert, SafeAreaView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import petStore from '../../context/petStore';

// ✅ 기본 이미지 상수
const DEFAULT_PET_IMAGE = require('../../assets/images/pets-1.jpg');

const PetInfoScreen = () => {
    const navigation = useNavigation();
    const { pets, removePet } = petStore();

    /**
     * 🗑️ 반려동물 삭제 처리
     */
    const handleDelete = (petId: number) => {
        Alert.alert('삭제 확인', '이 반려동물을 삭제하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            { text: '삭제', onPress: async () => await removePet(petId) }, // ✅ 비동기 삭제 처리
        ]);
    };



    return (
        <SafeAreaView style={styles.safeContainer}>
            <FlatList
                data={pets}
                keyExtractor={(item) => item.petId.toString()}
                renderItem={({ item }) => (
                    <View style={styles.petCard}>
                        <Image source={item.petImg ? { uri: item.petImg } : DEFAULT_PET_IMAGE} style={styles.petImage} />
                        <View style={styles.petInfo}>
                            <Text style={styles.petName}>{item.name}</Text>
                            <Text style={styles.petDetail}>{item.type === 'CAT' ? '고양이' : '강아지'} · {item.birthDate}</Text>
                        </View>
                        {/* ✏️ 수정 버튼 */}
                        <TouchableOpacity
                            style={styles.editButton}
                            // @ts-ignore
                            onPress={() => navigation.navigate('PetEditScreen', { pet: item })}
                        >
                            <MaterialIcons name="edit" size={24} color="#FF6F00" />
                        </TouchableOpacity>
                        {/* 🗑️ 삭제 버튼 */}
                        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.petId)}>
                            <MaterialIcons name="delete" size={24} color="red" />
                        </TouchableOpacity>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

/** ✅ 스타일 정의 */
const styles = StyleSheet.create({
    /** 🔹 노치 대응 */
    safeContainer: {
        flex: 1,
        backgroundColor: 'white',
        paddingTop: 10,
    },

    /** 🔹 카드 스타일 */
    petCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20, // ✅ 크기 증가
        borderRadius: 15,
        backgroundColor: '#F9F9F9',
        margin: 18, // ✅ 간격 증가
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 2, // ✅ 안드로이드 그림자 효과
    },

    /** 🔹 반려동물 프로필 이미지 */
    petImage: {
        width: 80, // ✅ 크기 증가
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EAEAEA',
    },

    /** 🔹 반려동물 정보 컨테이너 */
    petInfo: {
        flex: 1,
        marginLeft: 15
    },

    /** 🔹 반려동물 이름 (크고 굵게) */
    petName: {
        fontSize: 20, // ✅ 크기 증가
        fontWeight: 'bold',
        color: '#333',
    },

    /** 🔹 반려동물 타입 & 생일 (작고 회색) */
    petDetail: {
        fontSize: 14, // ✅ 작게
        color: '#777',
        marginTop: 4,
    },

    /** ✏️ 수정 버튼 */
    editButton: {
        padding: 10,
        marginRight: 10
    },

    /** 🗑️ 삭제 버튼 */
    deleteButton: {
        padding: 10
    },
});

export default PetInfoScreen;
