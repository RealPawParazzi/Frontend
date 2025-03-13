import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Image, Alert, ScrollView, SafeAreaView, StatusBar, TextInput,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import petStore from '../../context/petStore';

// ✅ 네비게이션 Params 타입 정의
type RouteParams = {
    params: {
        pet: {
            petId: number;
            name: string;
            type: 'CAT' | 'DOG';
            birthDate: string;
            petImg?: string;
        };
    };
};


/**
 * 📌 반려동물 정보 수정 화면
 * - 기존 반려동물 정보 로드 후 수정 가능
 * - 수정 후 `petStore` 업데이트하여 반영
 */
const PetEditScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RouteParams, 'params'>>();

    // 🚀 **params가 undefined일 경우 기본값 제공**
    const pet = route.params?.pet ?? {
        petId: 0,
        name: '',
        type: 'CAT',
        birthDate: '',
        petImg: undefined,
    };
    const { editPet } = petStore();

    // ✅ 기존 데이터 불러와서 상태값 세팅
    const [petName, setPetName] = useState(pet.name);
    const [petType, setPetType] = useState<'CAT' | 'DOG'>(pet.type);
    const [petBirthDate, setPetBirthDate] = useState(pet.birthDate);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [petImage, setPetImage] = useState<string | null>(pet.petImg || null);

    /**
     * 🖼️ 갤러리에서 반려동물 프로필 사진 선택
     */
    const pickImage = async () => {
        await launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) {
                console.log('🚫 사용자가 이미지 선택 취소');
            } else if (response.errorMessage) {
                console.error('❌ 이미지 선택 오류:', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                const imageUri = response.assets[0].uri;
                if (imageUri) { setPetImage(imageUri); }
            }
        });
    };

    /**
     * 📆 날짜 선택 모달 열기
     */
    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    /**
     * 📆 날짜 선택 후 저장 (YYYY-MM-DD 변환)
     */
    const handleConfirm = (date: Date) => {
        const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD 형식 변환
        setPetBirthDate(formattedDate);
        setDatePickerVisibility(false);
    };

    /**
     * ✅ 반려동물 정보 수정 요청
     */
    const handleSave = async () => {
        if (!petName.trim() || !petType.trim() || !petBirthDate.trim()) {
            Alert.alert('⚠️ 입력 오류', '이름, 종류, 생일은 필수 입력 항목입니다.');
            return;
        }

        try {
            const updatedPet = {
                name: petName,
                type: petType,
                birthDate: petBirthDate,
                petImg: petImage || undefined,
            };

            console.log('✏️ 반려동물 수정 데이터:', updatedPet); // 🚀 전송 데이터 확인
            await editPet(pet.petId, updatedPet); // ✅ API 호출 (백엔드에 수정 요청)

            Alert.alert('✅ 수정 완료', `${petName}의 정보가 업데이트되었습니다!`, [
                { text: '확인', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            Alert.alert('❌ 수정 실패', '반려동물 수정 중 오류가 발생했습니다.');
            console.error('✏️❌ 수정 오류:', error);
        }
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <ScrollView style={styles.container}>
                {/* 🔹 헤더 */}
                <Text style={styles.headerTitle}>반려동물 정보 수정</Text>

                {/* 🖼️ 프로필 이미지 선택 */}
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    <Image source={petImage ? { uri: petImage } : require('../../assets/images/pets-1.jpg')} style={styles.petImage} />
                    <View style={styles.addImageIcon}>
                        <MaterialIcons name="edit" size={24} color="white" />
                    </View>
                </TouchableOpacity>

                {/* 📌 종류 선택 */}
                <Text style={styles.label}>종류</Text>
                <View style={styles.buttonGroup}>
                    {[
                        { label: '고양이', value: 'CAT' },
                        { label: '강아지', value: 'DOG' },
                    ].map((item) => (
                        <TouchableOpacity
                            key={item.value}
                            style={[styles.typeButton, petType === item.value && styles.selectedTypeButton]}
                            onPress={() => setPetType(item.value as 'CAT' | 'DOG')}
                        >
                            <Text style={[styles.typeButtonText, petType === item.value && styles.selectedTypeText]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 📌 이름 입력 */}
                <Text style={styles.label}>이름</Text>
                <TextInput
                    style={styles.input}
                    maxLength={8}
                    value={petName}
                    onChangeText={setPetName}
                />

                <Text style={styles.label}>생년월일</Text>
                <TouchableOpacity style={styles.input} onPress={showDatePicker}>
                    <Text style={{ color: petBirthDate ? 'black' : '#aaa' }}>
                        {petBirthDate || '생일을 선택하세요'}
                    </Text>
                </TouchableOpacity>

                {/* 📆 생일 선택 모달 */}
                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirm}
                    onCancel={() => setDatePickerVisibility(false)}
                />

                {/* ✅ 완료 버튼 */}
                <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
                    <Text style={styles.submitText}>저장</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

/** ✅ 스타일 정의 */
const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: 'white',
        paddingTop: StatusBar.currentHeight || 20,
    },
    container: {
        paddingHorizontal: 20,
        paddingBottom: 50,
        backgroundColor: 'white',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 25,
        marginTop: 20,
        textAlign: 'center',
    },
    imagePicker: {
        alignSelf: 'center',
        marginBottom: 30,
        position: 'relative',
    },
    petImage: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#EAEAEA',
    },
    addImageIcon: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: '#FF6F00',
        borderRadius: 20,
        padding: 7,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 8,
        height: 50,
        fontSize: 16,
        backgroundColor: '#F9F9F9',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        marginHorizontal: 5,
        backgroundColor: 'white',
    },
    selectedTypeButton: {
        backgroundColor: '#FF6F00',
        borderColor: '#FF6F00',
    },
    typeButtonText: {
        fontSize: 16,
    },
    selectedTypeText: {
        color: 'white',
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: '#FF6F00',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 40,
    },
    submitText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default PetEditScreen;
