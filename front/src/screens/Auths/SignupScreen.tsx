import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation/AppNavigator';
import authStore from '../../context/authStore';
import {launchImageLibrary} from 'react-native-image-picker';

type SignupScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Signup'
>;

interface Props {
  navigation: SignupScreenNavigationProp;
}

const SignupScreen: React.FC<Props> = ({navigation}) => {
  const {register} = authStore(); // ✅ authStore에서 register 함수 가져오기

  // ✅ 화면 너비 판단
  const screenWidth = Dimensions.get('window').width;
  const isTablet = screenWidth >= 768; // iPad 기준

  // ✅ 회원가입 입력 필드 상태 관리
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickName, setNickName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ 기본 프로필 이미지 설정
  const getProfileImage = () => {
    return profileImage
      ? {uri: profileImage.uri}
      : require('../../assets/images/user-2.png');
  };

  const handleSignup = async () => {
    if (!email || !password || !name || !nickName) {
      Alert.alert('경고', '모든 정보를 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('경고', '비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true); // 회원가입 요청 시작 (로딩 표시 ON)

    try {
      const success = await register(
        email,
        password,
        nickName,
        name,
        profileImage,
      );
      if (success) {
        Alert.alert('성공!', '회원가입 성공! 자동 로그인 됩니다.');
        navigation.navigate('Login');
        //navigation.replace('Home'); // ✅ 회원가입 성공 후 바로 Home 이동
      } else {
        Alert.alert('회원가입 실패', '다시 시도해주세요.');
      }
    } catch (error: any) {
      Alert.alert('회원가입 실패', error.message || '문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
        maxWidth: 400,
        maxHeight: 400,
      },
      response => {
        if (response.didCancel) {
          console.log('❌ 이미지 선택 취소');
        } else if (response.errorMessage) {
          console.error('❌ 이미지 선택 오류:', response.errorMessage);
          Alert.alert('이미지 선택 오류', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          setProfileImage({
            uri: asset.uri!,
            name: asset.fileName || 'profile.jpg',
            type: asset.type || 'image/jpeg',
          });
        }
      },
    );
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        {/* ✅ iPad 대응용 래퍼 뷰 추가 */}
        <View style={[styles.container, isTablet && styles.tabletWrapper]}>
          <Text style={styles.logo}>PawParazzi</Text>
          <Text style={styles.subtitle}>
          Fill your information below or register with your social media
          account.
        </Text>

        {/* 프로필 이미지 미리보기 컨테이너 */}
        <TouchableOpacity
          onPress={handleImagePick}
          style={styles.imageContainer}>
          <Image source={getProfileImage()} style={styles.profileImage} />
          <View style={styles.iconContainer}>
            <Icon name="add-circle" size={28} color="#4D7CFE" />
          </View>
        </TouchableOpacity>

        {/* 이름 입력 */}
        <TextInput
          placeholder="Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        {/* 닉네임 입력 */}
        <TextInput
          placeholder="NickName"
          style={styles.input}
          value={nickName}
          onChangeText={setNickName}
        />

        {/* 이메일 입력 */}
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        {/* 비밀번호 입력 */}
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={22}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Confirm Password"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signupButtonText}>Sign up</Text>
          )}
        </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  logo: {
    fontSize: 32,
    color: '#4D7CFE',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  // ✅ 태블릿 전용 스타일
  tabletWrapper: {
    maxWidth: 500, // 너무 넓지 않게 제한
    alignSelf: 'center', // 가운데 정렬
    width: '100%',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },

  // 수정된 이미지 컨테이너 스타일 (중앙 배치)
  imageContainer: {
    alignSelf: 'center', // 가운데 정렬
    position: 'relative',
    marginTop: 10,
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60, // 원형
    backgroundColor: '#ddd',
  },
  // 플러스 아이콘 우측 하단에 배치
  iconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 2,
  },

  input: {
    width: '100%',
    padding: 15,
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
    marginBottom: 15,
  },

  passwordContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  passwordInput: {flex: 1},

  signupButton: {
    width: '100%',
    backgroundColor: '#4D7CFE',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  signupButtonText: {color: '#FFF', fontSize: 16, fontWeight: 'bold'},
});

export default SignupScreen;
