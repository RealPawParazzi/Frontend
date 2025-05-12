// 🧭 BottomTabNavigator.tsx - 네비게이션 바 및 커스텀 FAB 구현 (네이버 스타일 부채꼴 메뉴)
import React, { useState } from 'react';
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
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CalendarScreen from '../screens/CalendarScreen';
import MapScreen from '../screens/MapScreen';
import MyPageScreen from '../screens/MyPageScreen';
import HomeScreen from '../screens/HomeScreen';
import Header from '../components/Header';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = ({ navigation }: any) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [animation] = useState(new Animated.Value(0));


    // ✅ FAB 메뉴 애니메이션 실행 함수
    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
        Animated.timing(animation, {
            toValue: menuVisible ? 0 : 1,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    };

    // ✅ FAB 버튼 위치들 계산
    const fabOptions = [
        { label: '게시물 등록', icon: 'edit', screen: 'StorybookScreen' },
        { label: '동영상 생성', icon: 'videocam', screen: 'VideoEditorScreen' },
        { label: '이미지 생성', icon: 'image', screen: 'ImageEditorScreen' },
    ];

    return (
        <SafeAreaView style={styles.safeContainer}>
            <Header />
        <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ color, size }) => {
                        let iconName;
                        if (route.name === 'Home') {iconName = 'home';}
                        else if (route.name === 'Calendar') {iconName = 'calendar-today';}
                        else if (route.name === 'Post') {iconName = 'add-box';}
                        else if (route.name === 'Map') {iconName = 'map';}
                        else if (route.name === 'MyPage') {iconName = 'person';}
                        return <Icon name={iconName as any} size={size} color={color} />;
                    },
                    headerShown: false, // ✅ 상단 네비게이션 바 숨기기
                    tabBarActiveTintColor: '#4D7CFE',
                    tabBarInactiveTintColor: 'gray',
                    tabBarStyle: {
                        height: Platform.OS === 'ios' ? 40 : 60,
                        paddingBottom: Platform.OS === 'ios' ? 15 : 15,
                    }, // ✅ 탭 바 높이를 조정해서 통일
                })}
            >
                <Tab.Screen name="Home" component={HomeScreen} options={{ title: '홈' }} />
                <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: '캘린더' }} />

                {/* 📍 중간 add 버튼은 화면 없음 (커스텀 렌더링됨) */}
                <Tab.Screen name="Dummy" component={View} options={{ tabBarButton: () => null }} />

                <Tab.Screen name="Map" component={MapScreen} options={{ title: '산책' }} />
                <Tab.Screen name="MyPage" component={MyPageScreen} options={{ title: '마이페이지' }} />
            </Tab.Navigator>

            {/* 🌟 중앙 Add 버튼 (FAB 스타일) */}
            <View style={styles.fabContainer}>
                {fabOptions.map((option, index) => {
                    const angle = (Math.PI / 3.5) * index + Math.PI / 4.7; // ✅ 위쪽 부채꼴 방향으로 변경
                    const radius = 90;
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
                                        { translateX: x },
                                        { translateY: y },
                                        { scale: animation }, // ✅ 확대 효과
                                    ],
                                    opacity: animation,    // ✅ 투명도 적용
                                },
                            ]}
                            pointerEvents={menuVisible ? 'auto' : 'none'} // ✅ 클릭 방지
                        >
                            <TouchableOpacity
                                style={styles.fabOptionButton}
                                onPress={() => {
                                    toggleMenu();
                                    navigation.navigate(option.screen);
                                }}
                            >
                                <Icon name={option.icon} size={22} color="#4D7CFE" />
                            </TouchableOpacity>
                            <Text style={styles.fabLabel}>{option.label}</Text>
                        </Animated.View>
                    );
                })}

                {/* ✅ 중앙 원형 FAB 버튼 */}
                <TouchableOpacity style={styles.fabMainButton} onPress={toggleMenu} activeOpacity={0.8}>
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
        bottom: 35,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fabMainButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff', // ✅ 흰색 배경
        borderWidth: 2.2,
        borderColor: '#4D7CFE', // ✅ 테두리 색상 적용
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
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
        color: '#333',
        marginTop: 2,
    },
});

export default BottomTabNavigator;
