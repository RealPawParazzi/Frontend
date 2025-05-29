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
  Dimensions,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {launchImageLibrary} from 'react-native-image-picker';
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
      petDetail?: string;
    };
  };
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const IS_TABLET = SCREEN_WIDTH >= 768;

const PetEditScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'params'>>();
  const pet = route.params?.pet ?? {
    petId: 0,
    name: '',
    type: 'CAT',
    birthDate: '',
    petImg: undefined,
    petDetail: '',
  };

  const {editPet} = petStore();

  const [petName, setPetName] = useState(pet.name);
  const [petType, setPetType] = useState<'CAT' | 'DOG'>(pet.type);
  const [petBirthDate, setPetBirthDate] = useState(pet.birthDate);
  const [petDetail, setPetDetail] = useState(pet.petDetail || '');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [petImage, setPetImage] = useState<string | null>(pet.petImg || null);

  const pickImage = async () => {
    await launchImageLibrary({mediaType: 'photo'}, response => {
      if (response.didCancel) {
        console.log('🚫 사용자가 이미지 선택 취소');
      } else if (response.errorMessage) {
        console.error('❌ 이미지 선택 오류:', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const imageUri = response.assets[0].uri;
        if (imageUri) {
          setPetImage(imageUri);
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

  /**
   * ✅ 반려동물 정보 수정 요청
   */
  const handleSave = async () => {
    if (!petName.trim() || !petType.trim() || !petBirthDate.trim()) {
      Alert.alert('⚠️ 입력 오류', '이름, 종류, 생일은 필수 입력 항목입니다.');
      return;
    }

    try {
      const petData = {
        name: petName,
        type: petType,
        birthDate: petBirthDate,
        petDetail,
      };

      const petImageData = petImage
        ? {
            uri: String(petImage),
            name: 'updated_pet.jpg',
            type: 'image/jpeg',
          }
        : undefined;

      console.log('✏️ 반려동물 수정 데이터:', petData, petImageData);
      await editPet(pet.petId, petData, petImageData);

      Alert.alert(
        '✅ 수정 완료',
        `${petData.name}의 정보가 업데이트되었습니다!`,
        [{text: '확인', onPress: () => navigation.goBack()}],
      );
    } catch (error) {
      Alert.alert('❌ 수정 실패', '반려동물 수정 중 오류가 발생했습니다.');
      console.error('✏️❌ 수정 오류:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // 필요시 조절
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.headerTitle}>반려동물 정보 수정</Text>

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              <Image
                source={
                  petImage
                    ? {uri: String(petImage)}
                    : require('../../assets/images/pets-1.jpg')
                }
                style={styles.petImage}
              />
              <View style={styles.addImageIcon}>
                <MaterialIcons name="edit" size={24} color="white" />
              </View>
            </TouchableOpacity>

            <Text style={styles.label}>종류</Text>
            <View style={styles.buttonGroup}>
              {[
                {label: '고양이', value: 'CAT'},
                {label: '강아지', value: 'DOG'},
              ].map(item => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.typeButton,
                    petType === item.value && styles.selectedTypeButton,
                  ]}
                  onPress={() => setPetType(item.value as 'CAT' | 'DOG')}>
                  <Text
                    style={[
                      styles.typeButtonText,
                      petType === item.value && styles.selectedTypeText,
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>이름</Text>
            <TextInput
              style={styles.input}
              maxLength={8}
              value={petName}
              onChangeText={setPetName}
            />

            <Text style={styles.label}>생년월일</Text>
            <TouchableOpacity style={styles.input} onPress={showDatePicker}>
              <Text style={{color: petBirthDate ? 'black' : '#aaa'}}>
                {petBirthDate || '생일을 선택하세요'}
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
              placeholder="성격, 특징 등을 간단히 적어주세요."
              multiline
              maxLength={200}
              value={petDetail}
              onChangeText={setPetDetail}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
              <Text style={styles.submitText}>저장</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: StatusBar.currentHeight || 20,
  },
  scroll: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: IS_TABLET ? 60 : 25, // $$$$$$$$ iPad padding 대응
    alignSelf: 'center',                    // $$$$$$$$ 가운데 정렬
    width: IS_TABLET ? 600 : '100%',        // $$$$$$$$ iPad 너비 제한
  },
  container: {
    flex: 1,
    paddingBottom: 50,
    backgroundColor: 'white',
    flexGrow: 1,
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
    backgroundColor: '#4D7CFE',
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
    backgroundColor: '#4d7cfe',
    borderColor: '#4d7cfe',
  },
  typeButtonText: {
    fontSize: 16,
  },
  selectedTypeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#4d7cfe',
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
