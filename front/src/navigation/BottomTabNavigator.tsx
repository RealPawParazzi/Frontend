// 🧭 BottomTabNavigator.tsx - 네비게이션 바 및 커스텀 FAB 구현 (네이버 스타일 부채꼴 메뉴)
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CalendarScreen from '../screens/CalendarScreen';
import MapScreen from '../screens/MapScreen';
import MyPageScreen from '../screens/MyPageScreen';
import HomeScreen from '../screens/HomeScreen';
import Header from '../components/Header';
import SearchScreen from '../screens/SearchScreen';
import MapImageScreen from '../screens/MapImageScreen'; // ✅ 안드로이드 전용 맵 스크린 추가
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const isPad = screenWidth >= 768;


const Tab = createBottomTabNavigator();

const BottomTabNavigator = ({navigation}: any) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');


  // ✅ FAB 메뉴 애니메이션 실행 함수
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
    Animated.timing(animation, {
      toValue: menuVisible ? 0 : 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  // ✅ FAB 버튼 위치들 계산
  const fabOptions = [
    {label: '게시물 등록', icon: 'edit', screen: 'StorybookScreen'},
    {label: '동영상 생성', icon: 'videocam', screen: 'VideoEditorScreen'},
    // {label: '이미지 생성', icon: 'image', screen: 'ImageEditorScreen'},
  ];

  return (
    <SafeAreaView style={styles.safeContainer}>
      <Header
        searchMode={searchMode}
        setSearchMode={setSearchMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {searchMode && (
        <SearchScreen
          searchQuery={searchQuery}
          onClose={() => {
            setSearchMode(false);
            setSearchQuery('');
          }}
        />
      )}

      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({color, size}) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Calendar') {
              iconName = 'calendar-today';
            } else if (route.name === 'Post') {
              iconName = 'add-box';
            } else if (route.name === 'Map') {
              iconName = 'map';
            } else if (route.name === 'MyPage') {
              iconName = 'person';
            }
            return <Icon name={iconName as any} size={size} color={color} />;
          },
          headerShown: false, // ✅ 상단 네비게이션 바 숨기기
          tabBarActiveTintColor: '#4D7CFE',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            height: Platform.OS === 'ios' ? 50 : 60,
            paddingBottom: Platform.OS === 'ios' ? (isPad ? 10 : 15) : 15,
            paddingHorizontal: isPad ? 60 : 0,
          }, // ✅ 탭 바 높이를 조정해서 통일
        })}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{title: '홈'}}
        />
        <Tab.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{title: '캘린더'}}
        />

        {/* 📍 중간 add 버튼은 화면 없음 (커스텀 렌더링됨) */}
        <Tab.Screen
          name="Dummy"
          component={View}
          options={{tabBarButton: () => null}}
        />

        <Tab.Screen
          name="Map"
          component={Platform.OS === 'android' ? MapImageScreen : MapScreen} // ✅ 플랫폼에 따라 다르게 지정
          options={{title: '산책'}}
        />
        <Tab.Screen
          name="MyPage"
          component={MyPageScreen}
          options={{title: '마이페이지'}}
        />
      </Tab.Navigator>

      {/* 🌟 중앙 Add 버튼 (FAB 스타일) */}
      <View style={styles.fabContainer}>
        {/* 추가된 회색 부채꼴 배경 */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.fabBackdrop,
            {
              opacity: animation,
              transform: [
                {scale: animation},
                {rotate: '-25deg'}, // 약간 회전 줘서 부채꼴 느낌
              ],
            },
          ]}
        />

        {fabOptions.map((option, index) => {
          const angle = (Math.PI / 3) * index + Math.PI / 3; // ✅ 위쪽 부채꼴 방향으로 변경
          const radius = 80;
          const x = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, radius * Math.cos(angle)],
          });
          const y = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -radius * Math.sin(angle)], // ✅ 위 방향
          });

          return (
            <Animated.View
              key={option.label}
              style={[
                styles.fabOption,
                {
                  transform: [
                    {translateX: x},
                    {translateY: y},
                    {scale: animation}, // ✅ 확대 효과
                  ],
                  opacity: animation, // ✅ 투명도 적용
                },
              ]}
              pointerEvents={menuVisible ? 'auto' : 'none'} // ✅ 클릭 방지
            >
              <TouchableOpacity
                style={styles.fabOptionButton}
                onPress={() => {
                  toggleMenu();
                  navigation.navigate(option.screen);
                }}>
                <Icon name={option.icon} size={22} color="#4D7CFE" />
              </TouchableOpacity>
              <Text style={styles.fabLabel}>{option.label}</Text>
            </Animated.View>
          );
        })}

        {/* ✅ 중앙 원형 FAB 버튼 */}
        <TouchableOpacity
          style={styles.fabMainButton}
          onPress={toggleMenu}
          activeOpacity={0.8}>
          <Icon name="add" size={30} color="#4D7CFE" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


// ✅ 스타일 정의
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  tabBarButton: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10, // ✅ 탭 바 내에서 버튼 위치 조정
    alignSelf: 'center', // ✅ 버튼을 중앙 정렬
  },
  fabContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 25 : 35,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabMainButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 2.2,
    borderColor: '#4D7CFE',
    alignItems: 'center',
    justifyContent: 'center',

    // ✨ Android white box 이슈 방지
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',

    // ✨ 플랫폼별 그림자 처리 분리
    elevation: Platform.OS === 'android' ? 20 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 6 : undefined,
    shadowOffset: Platform.OS === 'ios' ? {width: 0, height: 3} : undefined,
  },
  fabBackdrop: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 300,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // ✅ 반투명 회색
    bottom: -35,
    alignSelf: 'center',
  },
  fabOption: {
    position: 'absolute',
    alignItems: 'center',
  },
  fabOptionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 1.3,
    borderColor: '#4D7CFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  fabLabel: {
    fontSize: 12,
    fontWeight: 'bold', // ✅ 볼드체!
    color: '#ffffff',
    marginTop: 2,
  },
});

export default BottomTabNavigator;
