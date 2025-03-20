import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import petStore from '../../context/petStore';
import { useNavigation } from '@react-navigation/native';

// ✅ 기본 이미지 설정
const DEFAULT_PET_IMAGE = require('../../assets/images/pets-1.jpg');

const PetInfo = () => {
    const navigation = useNavigation();
    const { pets } = petStore();
    const [petList, setPetList] = useState(pets);
    const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

    useEffect(() => {
        if (pets.length > 0) {
            setPetList(pets);
            setSelectedPetId(pets[0].petId);
        }
    }, [pets]);

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>반려동물 {petList.length} 마리</Text>

            {/* 🔹 반려동물 리스트 + ➡️ 버튼을 한 줄로 정렬 */}
            <View style={styles.petRow}>
                <FlatList
                    horizontal
                    data={petList}
                    keyExtractor={(item) => String(item.petId)}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.petListContainer}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.petCard,
                                selectedPetId === item.petId && styles.selectedPetCard, // ✅ 선택된 펫 강조
                            ]}
                            onPress={() => setSelectedPetId(item.petId)}
                        >
                            <Image source={item.petImg ? { uri: item.petImg } : DEFAULT_PET_IMAGE} style={styles.petImage} />
                            <Text style={styles.petName}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />

                {/* ➡️ 아이콘 (반려동물 정보 화면 이동) */}
                <TouchableOpacity
                    style={styles.viewMoreButton}
                    // @ts-ignore
                    onPress={() => navigation.navigate('PetInfoScreen')}
                >
                    <MaterialIcons name="arrow-forward-ios" size={24} color="#888" />
                </TouchableOpacity>
            </View>

            {/* ➕ 반려동물 추가 버튼 */}
            <TouchableOpacity
                style={styles.addPetButton}
                // @ts-ignore
                onPress={() => navigation.navigate('PetRegistrationScreen')}
            >
                <MaterialIcons name="add" size={30} color="gray" />
                <Text style={styles.addPetText}>반려동물 추가하기</Text>
            </TouchableOpacity>
        </View>
    );
};

/** ✅ 스타일 정의 */
const styles = StyleSheet.create({
    container: { paddingHorizontal: 15, paddingVertical: 10 },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },

    petRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },

    petListContainer: { flexDirection: 'row', gap: 15, alignItems: 'center', paddingVertical: 5 },

    petCard: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 85,
        padding: 10,
        borderRadius: 50,
        backgroundColor: 'white',
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },

    selectedPetCard: { borderWidth: 2, borderColor: '#FF6F00' },

    petImage: { width: 65, height: 65, borderRadius: 32.5, backgroundColor: '#EAEAEA' },

    petName: { fontSize: 14, fontWeight: 'bold', marginTop: 6 },

    viewMoreButton: { marginLeft: 10, padding: 10 },

    addPetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        backgroundColor: '#f8f8f8',
    },

    addPetText: { fontSize: 16, color: 'gray', marginLeft: 8 },
});

export default PetInfo;
