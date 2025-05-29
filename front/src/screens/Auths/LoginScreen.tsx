import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
  KeyboardAvoidingView,
  Animated,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import authStore from '../../context/authStore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation/AppNavigator';

// ✅ 네비게이션 타입 지정
type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({navigation}) => {
  const {login, checkAuthStatus} = authStore(); // ✅ authStore에서 login 함수 가져오기
  const scrollRef = useRef<ScrollView>(null); // 🔵 스크롤뷰 참조
  const {width: screenWidth} = useWindowDimensions(); // ✅ 기기 너비 측정

  // ✅ 이메일 상태 관리
  const [email, setEmail] = useState('');
  // ✅ 비밀번호 상태 관리
  const [password, setPassword] = useState('');
  // ✅ 로딩 상태 관리 (로그인 요청 중 여부)
  const [loading, setLoading] = useState(false);
  // ✅ 비밀번호 숨김 토글 관리
  const [showPassword, setShowPassword] = useState(false);

  // ✅ 화면 로딩 시 자동 로그인 여부 검사
  useEffect(() => {
    checkAuthStatus().then(isLoggedIn => {
      if (isLoggedIn) {
        navigation.replace('Home'); // ✅ 자동 로그인 처리
      }
    });
  }, [checkAuthStatus, navigation]);

  /** ✅ 키보드 올라올 때 ScrollView 살짝 올리기 */
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollRef.current?.scrollTo({y: 100, animated: true}); // 🔥 약간 위로 스크롤
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        scrollRef.current?.scrollTo({y: 0, animated: true}); // 🔄 복구
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // ✅ 로그인 버튼 눌렀을 때 실행되는 함수
  const handleLogin = async () => {
    // 입력 유효성 검사 (이메일, 비밀번호 모두 입력됐는지)
    if (!email || !password) {
      Alert.alert('경고', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setLoading(true); // 로그인 처리 시작 (로딩 표시 ON)

    try {
      const success = await login(email, password);
      if (success) {
        navigation.replace('Home'); // ✅ 로그인 성공 후 Home 이동
      } else {
        Alert.alert('로그인 실패', '다시 시도해주세요.');
      }
    } catch (error: any) {
      Alert.alert(
        '로그인 실패',
        error.message || '로그인 중 문제가 발생했습니다.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      <View
        style={[
          styles.contentWrapper,
          screenWidth >= 768 && {maxWidth: 500, alignSelf: 'center'}, // ✅ iPad에서만 적용
        ]}>
        {/* 모든 내용 이 안으로 이동 */}
        <Text style={styles.logo}>PawParazzi</Text>
        <Text style={styles.welcome}>Hi! Welcome back, you've been missed</Text>

        {/* 이메일 입력 필드 */}
        <TextInput
          placeholder="Enter your email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        {/* 비밀번호 입력 필드 */}
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Enter your Password"
            style={styles.passwordInput}
            secureTextEntry={!showPassword}
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

        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forget Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          {loading ? (
            // 로딩 중이면 로딩 인디케이터 표시
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Log in</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.continueText}>Or continue with</Text>

        <View style={styles.socialContainer}>
          {/* 카카오 로그인 버튼 추가 및 클릭 연동 완료 */}
          <TouchableOpacity
            onPress={() => navigation.navigate('KakaoLoginWebView')}>
            <Image
              source={require('../../assets/images/kakao-talk_64.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          {/* ✅ 네이버 로그인 */}
          <TouchableOpacity
            onPress={() => navigation.navigate('NaverLoginWebView')}>
            <Image
              source={require('../../assets/images/naver-logo.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupLink}>Signup</Text>
          </Text>
        </TouchableOpacity>

        {/* Signup 버튼 아래 추가되는 튜토리얼 다시보기 버튼 */}
        <View style={styles.tutorialContainer}>
          <Text style={styles.tutorialText}>
            Need a refresher? {/* 강조 텍스트만 터치 가능하게 구성 */}
            <Text
              style={styles.tutorialLink}
              onPress={() => navigation.navigate('Tutorial')}>
              View Tutorial
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contentWrapper: {
    width: '100%',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  logo: {
    fontSize: 32,
    color: '#4D7CFE',
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  welcome: {fontSize: 16, color: '#888', marginBottom: 50, textAlign: 'center'},

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
    marginBottom: 5,
  },
  passwordInput: {flex: 1},

  forgotPassword: {
    color: '#4D7CFE',
    marginTop: 10,
    marginBottom: 40,
    textAlign:'center',
  },

  loginButton: {
    width: '100%',
    backgroundColor: '#4D7CFE',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {color: '#FFF', fontSize: 16, fontWeight: 'bold'},

  continueText: {color: '#888', marginTop: 10, marginBottom: 15, textAlign: 'center'},

  socialContainer: {flexDirection: 'row', gap: 20, marginBottom: 20, justifyContent: 'center'},
  socialIcon: {width: 40, height: 40},

  signupText: {color: '#888', marginTop: 2, textAlign: 'center'},
  signupLink: {color: '#4D7CFE', fontWeight: 'bold'},

  tutorialContainer: {
    marginTop: 15,
  },

  tutorialText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },

  tutorialLink: {
    color: '#4D7CFE',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
