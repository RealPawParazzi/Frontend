import React, { useState } from 'react';
import {View, Text, TouchableOpacity, Modal, StyleSheet, SafeAreaView} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CalendarScreen from '../screens/CalendarScreen';
import MapScreen from '../screens/MapScreen';
import MyPageScreen from '../screens/MyPageScreen';
import HomeScreen from '../screens/HomeScreen';
import Header from '../components/Header';


const Tab = createBottomTabNavigator();

const BottomTabNavigator = ({ navigation }: any) => {
    const [modalVisible, setModalVisible] = useState(false);

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
                    tabBarActiveTintColor: '#000',
                    tabBarInactiveTintColor: 'gray',
                    tabBarStyle: { height: 40, paddingBottom: 15 }, // ✅ 탭 바 높이를 조정해서 통일
                })}
            >
                <Tab.Screen name="Home" component={HomeScreen} options={{ title: '홈' }} />
                <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: '캘린더' }} />

                {/* 🟢 Post 버튼: 누르면 모달이 뜸 */}
                <Tab.Screen
                    name="Post"
                    component={HomeScreen} // 기본적으로 화면 변화 없음
                    options={{
                        title: '게시물 올리기',
                        tabBarButton: () => (
                            <TouchableOpacity
                                style={styles.tabBarButton}
                                onPress={() => setModalVisible(true)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.addButton}>
                                    <Icon name="add-box" size={35} color="#FFF" />
                                </View>
                            </TouchableOpacity>
                        ),
                    }}
                />

                <Tab.Screen name="Map" component={MapScreen} options={{ title: '산책' }} />
                <Tab.Screen name="MyPage" component={MyPageScreen} options={{ title: '마이페이지' }} />
            </Tab.Navigator>

            {/* 📌 Post 버튼 클릭 시 선택 모달 */}
            <Modal visible={modalVisible} animationType="fade" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>무엇을 만들까요?</Text>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                navigation.navigate('StorybookScreen');
                                setModalVisible(false);
                            }}
                        >
                            <Text style={styles.modalButtonText}>📖 게시물 등록</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                navigation.navigate('VideoEditorScreen');
                                setModalVisible(false);
                            }}
                        >
                            <Text style={styles.modalButtonText}>🎥 동영상 만들기</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                navigation.navigate('ImageEditorScreen');
                                setModalVisible(false);
                            }}
                        >
                            <Text style={styles.modalButtonText}>🖼️ 이미지 만들기</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelButtonText}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

// ✅ 스타일 정의
const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    tabBarButton: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 10, // ✅ 탭 바 내에서 버튼 위치 조정
        alignSelf: 'center', // ✅ 버튼을 중앙 정렬
    },
    addButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ffcf33', // ✅ 아이콘 배경 색상 (조금 더 튀도록 변경)
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: -20, // ✅ 버튼이 너무 위로 올라가는 문제 해결
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        width: 300,
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalButton: {
        padding: 10,
        backgroundColor: '#FFD700',
        width: '100%',
        alignItems: 'center',
        borderRadius: 5,
        marginVertical: 5,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        marginTop: 10,
        padding: 8,
    },
    cancelButtonText: {
        color: 'red',
        fontSize: 14,
    },
});

export default BottomTabNavigator;
