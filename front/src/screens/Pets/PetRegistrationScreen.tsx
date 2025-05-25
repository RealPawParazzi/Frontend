import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {launchImageLibrary} from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import petStore from '../../context/petStore';

/**
 * 📌 반려동물 추가 화면
 * - 반려동물의 이름, 종류, 생일 입력 가능
 * - 프로필 사진 선택 가능
 * - 등록 후 `petStore` 업데이트하여 반려동물 목록 최신화
 */
const PetRegistrationScreen = ({navigation}: {navigation: any}) => {
  // ✅ 입력값 상태 관리
  const {addPet, fetchPets} = petStore();

  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState<'CAT' | 'DOG'>('CAT');
  // const [petGender, setPetGender] = useState<'암컷' | '수컷'>('암컷');
  const [petBirthDate, setPetBirthDate] = useState('');
  const [petDetail, setPetDetail] = useState(''); // ✅ 설명 입력 추가
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [petImage, setPetImage] = useState<{uri: string} | null>(null); // 타입 수정
  /**
   * 🖼️ 갤러리에서 반려동물 프로필 사진 선택
   */
  const pickImage = async () => {
    await launchImageLibrary({mediaType: 'photo'}, response => {
      if (response.didCancel) {
        console.log('🚫 사용자가 이미지 선택 취소');
      } else if (response.errorMessage) {
        console.error('❌ 이미지 선택 오류:', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const imageUri = response.assets[0].uri;
        if (imageUri) {
          console.log('✅ 선택한 이미지 URI:', imageUri);
          setPetImage({uri: imageUri});
        }
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

  const handleRegisterPet = async () => {
    if (!petName.trim() || !petBirthDate.trim() || !petDetail.trim()) {
      Alert.alert('⚠️ 입력 오류', '이름, 생일, 설명은 필수 입력 항목입니다.');
      return;
    }

    try {
      const petData = {
        name: petName,
        type: petType,
        birthDate: petBirthDate,
        petDetail: petDetail,
      };

      await addPet(petData, petImage);
      await fetchPets();

      Alert.alert('✅ 등록 완료', `${petName}가 등록되었습니다!`, [
        {text: '확인', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      console.error('❌ 등록 오류:', error);
      Alert.alert('❌ 등록 실패', '반려동물 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled">
            <Text style={styles.headerTitle}>반려동물 등록</Text>

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              <Image
                source={
                  petImage
                    ? petImage
                    : require('../../assets/images/pets-1.jpg')
                }
                style={styles.petImage}
              />
              <View style={styles.addImageIcon}>
                <MaterialIcons name="add" size={24} color="white" />
              </View>
            </TouchableOpacity>

            <Text style={styles.label}>종류</Text>
            <View style={styles.buttonGroup}>
              {['CAT', 'DOG'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    petType === type && styles.selectedTypeButton,
                  ]}
                  onPress={() => setPetType(type as 'CAT' | 'DOG')}>
                  <Text
                    style={[
                      styles.typeButtonText,
                      petType === type && styles.selectedTypeText,
                    ]}>
                    {type === 'CAT' ? '고양이' : '강아지'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>이름</Text>
            <TextInput
              style={styles.input}
              value={petName}
              onChangeText={setPetName}
              placeholder="이름을 입력하세요"
            />

            {/*<Text style={styles.label}>성별</Text>*/}
            {/*<View style={styles.buttonGroup}>*/}
            {/*  {['암컷', '수컷'].map(gender => (*/}
            {/*    <TouchableOpacity*/}
            {/*      key={gender}*/}
            {/*      style={[*/}
            {/*        styles.typeButton,*/}
            {/*        petGender === gender && styles.selectedTypeButton,*/}
            {/*      ]}*/}
            {/*      onPress={() => setPetGender(gender as '암컷' | '수컷')}>*/}
            {/*      <Text*/}
            {/*        style={[*/}
            {/*          styles.typeButtonText,*/}
            {/*          petGender === gender && styles.selectedTypeText,*/}
            {/*        ]}>*/}
            {/*        {gender}*/}
            {/*      </Text>*/}
            {/*    </TouchableOpacity>*/}
            {/*  ))}*/}
            {/*</View>*/}

            <Text style={styles.label}>생년월일</Text>
            <TouchableOpacity style={styles.input} onPress={showDatePicker}>
              <Text style={{color: petBirthDate ? 'black' : '#aaa'}}>
                {petBirthDate || '날짜 선택'}
              </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={() => setDatePickerVisibility(false)}
            />

            <Text style={styles.label}>설명</Text>
            <TextInput
              style={[styles.input, {height: 100, textAlignVertical: 'top'}]}
              value={petDetail}
              onChangeText={setPetDetail}
              placeholder="반려동물의 특징이나 메모를 입력하세요"
              multiline
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleRegisterPet}>
              <Text style={styles.submitText}>등록 완료</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    padding: 30,
    backgroundColor: 'white',
    flexGrow: 1, // ✅ 스크롤뷰 내부가 키보드 토글 시 꽉 차도록
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  imagePicker: {alignSelf: 'center', marginBottom: 30, position: 'relative'},
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
    backgroundColor: '#4d7cfe',
    borderRadius: 20,
    padding: 7,
  },
  label: {fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 5},
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
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
  selectedTypeButton: {backgroundColor: '#4d7cfe', borderColor: '#4d7cfe'},
  typeButtonText: {fontSize: 16},
  selectedTypeText: {color: 'white', fontWeight: 'bold'},
  submitButton: {
    backgroundColor: '#4d7cfe',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
  },
  submitText: {color: 'white', fontSize: 18, fontWeight: 'bold'},
});

export default PetRegistrationScreen;
