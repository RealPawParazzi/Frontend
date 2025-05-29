import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import userStore from '../context/userStore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';

/**
 * ✅ 회원 정보 수정 화면
 * - 이름, 닉네임, 프로필 이미지 수정 가능
 * - 이메일은 읽기 전용
 * - 저장 시 FormData로 PATCH 요청
 */

const SCREEN_WIDTH = Dimensions.get('window').width;
const IS_TABLET = SCREEN_WIDTH >= 768;

const EditProfileScreen = () => {
  const {userData, updateUserData} = userStore();

  const [name, setName] = useState(userData.name);
  const [nickName, setNickName] = useState(userData.nickName);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const navigation = useNavigation();

  // 🔍 이미지 선택 핸들러
  const handleImagePick = () => {
    ImagePicker.launchImageLibrary({mediaType: 'photo'}, res => {
      if (!res.didCancel && res.assets && res.assets[0]) {
        setSelectedImage(res.assets[0]);
      }
    });
  };

  // 📡 프로필 저장 API 호출
  const handleSave = async () => {
    try {
      const updatePayload = {
        name,
        nickName,
      };

      const imagePayload = selectedImage
        ? {
            uri: selectedImage.uri,
            name: selectedImage.fileName || 'profile.jpg',
            type: selectedImage.type || 'image/jpeg',
          }
        : undefined;

      // ✅ 전역 상태 업데이트
      const updated = updateUserData(updatePayload, imagePayload);

      console.log(
        '🔍프로필 수정 요청 데이터 (updatePayload, imagePayload): ',
        updatePayload,
        imagePayload,
      );

      Alert.alert('✅ 수정 완료', '회원 정보가 업데이트되었습니다.');

      navigation.goBack();
    } catch (err: any) {
      Alert.alert('❗ 오류', err.message || '프로필 수정 중 오류 발생');
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 🔵 프로필 이미지 */}
        <View style={styles.imageContainer}>
          <Image
            source={
              selectedImage
                ? {uri: selectedImage.uri}
                : userData.profileImage ||
                  require('../assets/images/user-2.png')
            }
            style={styles.profileImage}
          />
          {/* ✅ + 아이콘 */}
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={handleImagePick}>
            <Icon name="add-circle" size={28} color="#4D7CFE" />
          </TouchableOpacity>
        </View>

        {/* 🔵 입력 필드 */}
        <Text style={styles.label}>Your Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.readonly]}
          value={userData.email}
          editable={false}
        />

        <Text style={styles.label}>Your Nickname</Text>
        <TextInput
          style={styles.input}
          value={nickName}
          onChangeText={setNickName}
        />

        {/* 🔵 저장 버튼 */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingHorizontal : IS_TABLET ? 200 : 24,
    marginTop: 50,
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#ccc',
  },
  iconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 2,
    elevation: 3,
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 6,
    marginTop: 16,
    fontWeight: '600',
    color: '#555',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  readonly: {
    backgroundColor: '#f3f3f3',
    color: '#888',
  },
  saveButton: {
    marginTop: 32,
    backgroundColor: '#4d7cfe',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 30,
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
