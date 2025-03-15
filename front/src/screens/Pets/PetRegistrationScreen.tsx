import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Image, Alert, ScrollView, SafeAreaView, StatusBar, TextInput,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { registerPet } from '../../services/petService';
import petStore from '../../context/petStore';

/**
 * 📌 반려동물 추가 화면
 * - 반려동물의 이름, 종류, 생일 입력 가능
 * - 프로필 사진 선택 가능
 * - 등록 후 `petStore` 업데이트하여 반려동물 목록 최신화
 */
const PetRegistrationScreen = ({ navigation }: { navigation: any }) => {
    // ✅ 입력값 상태 관리
    const [petName, setPetName] = useState('');
    const [petType, setPetType] = useState<'CAT' | 'DOG'>('CAT'); // ✅ '고양이' → 'CAT', '강아지' → 'DOG' 변환 적용
    const [petGender, setPetGender] = useState('암컷'); // 기본값 '암컷'
    const [petBirthDate, setPetBirthDate] = useState('');
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [petImage, setPetImage] = useState<string | null>(null);

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
     * ✅ 반려동물 등록 요청
     * - 필수 입력값(이름, 종류, 생일) 확인
     * - `registerPet()` API 호출
     * - 등록 성공 시 `petStore` 최신화 및 화면 이동
     */
    const handleRegisterPet = async () => {
        if (!petName.trim() || !petType.trim() || !petBirthDate.trim()) {
            Alert.alert('⚠️ 입력 오류', '이름, 종류, 생일은 필수 입력 항목입니다.');
            return;
        }

        try {
            const petData = {
                name: petName,
                type: petType,
                birthDate: petBirthDate,
            };

            const petImageData = petImage
                ? { uri: petImage, name: 'petProfile.jpg', type: 'image/jpeg' } // $$$$$$$$ 이미지 타입 명확히 정의
                : undefined;

            console.log('🐶 API 요청 데이터:', petData, petImageData); // 🚀 전송 데이터 확인

            await registerPet(petData, petImageData); // ✅ formData로 전달 처리됨

            // ✅ 상태 업데이트 (펫 리스트 최신화)
            await petStore.getState().fetchPets();

            Alert.alert('✅ 등록 완료', `${petData.name}가 추가되었습니다!`, [
                { text: '확인', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            Alert.alert('❌ 등록 실패', '반려동물 등록 중 오류가 발생했습니다.');
            console.error('🐶❌ 등록 오류:', error);
        }
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <ScrollView style={styles.container}>
                {/* 🔹 헤더 */}
                <Text style={styles.headerTitle}>반려동물 등록</Text>

                {/* 🖼️ 프로필 이미지 선택 (크기 증가) */}
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    <Image source={petImage ? { uri: petImage } : require('../../assets/images/pets-1.jpg')} style={styles.petImage} />
                    <View style={styles.addImageIcon}>
                        <MaterialIcons name="add" size={24} color="white" />
                    </View>
                </TouchableOpacity>

                {/* 📌 종류 선택 */}
                <Text style={styles.label}>종류 (필수)</Text>
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
                <Text style={styles.label}>이름 (필수)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="한글, 영문, 숫자 8자 이내 입력"
                    maxLength={8}
                    value={petName}
                    onChangeText={setPetName}
                />

                {/* 📌 성별 선택 */}
                <Text style={styles.label}>성별 (필수)</Text>
                <View style={styles.buttonGroup}>
                    {['암컷', '수컷'].map((gender) => (
                        <TouchableOpacity
                            key={gender}
                            style={[styles.typeButton, petGender === gender && styles.selectedTypeButton]}
                            onPress={() => setPetGender(gender)}
                        >
                            <Text style={[styles.typeButtonText, petGender === gender && styles.selectedTypeText]}>{gender}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>생년월일 (필수)</Text>
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
                <TouchableOpacity style={styles.submitButton} onPress={handleRegisterPet}>
                    <Text style={styles.submitText}>완료</Text>
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
        paddingTop: StatusBar.currentHeight || 20, // ✅ 상태바 높이 고려
    },
    container: {
        paddingHorizontal: 20, // ✅ 전체적인 좌우 패딩 조정
        paddingBottom: 50, // ✅ 스크롤 시 여백 유지
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
        marginBottom: 30, // ✅ 이미지 아래 여백 추가
        position: 'relative',
    },
    petImage: {
        width: 160, // ✅ 크기 증가
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
        marginBottom: 5, // ✅ 입력 필드와 균형 맞추기 위해 추가
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 8,
        height: 50, // ✅ 높이 통일
        fontSize: 16,
        backgroundColor: '#F9F9F9', // ✅ 약간의 배경색 추가로 가독성 향상
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 12, // ✅ 버튼 내부 높이 조정
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
    datePickerButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 14, // ✅ 버튼 스타일 통일
        marginTop: 8,
        height: 50,
        justifyContent: 'center',
        backgroundColor: '#F9F9F9', // ✅ 일반 입력 필드와 동일한 스타일로 통일
    },
    datePickerText: {
        fontSize: 16,
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#FF6F00',
        paddingVertical: 18, // ✅ 높이 증가
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



export default PetRegistrationScreen;
