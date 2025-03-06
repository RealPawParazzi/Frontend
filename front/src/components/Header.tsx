import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import userStore from '../context/userStore'; // ✅ Zustand 전역 상태 가져오기

/**
 * 📌 Header 컴포넌트
 * - 앱의 최상단에 위치하는 헤더
 * - 왼쪽에는 앱 타이틀(PawParazzi), 오른쪽에는 알림 아이콘과 프로필 이미지 표시
 * - 프로필 이미지가 없을 경우 기본 아이콘(person) 표시
 */
const Header = () => {
    // ✅ Zustand에서 현재 선택한 반려동물 정보 가져오기
    const { userData } = userStore(); // 🟢 선택된 반려동물 상태

    return (
        <View style={styles.container}>
            {/* 🖼️ 반려동물 프로필 (왼쪽) */}
            <TouchableOpacity style={styles.petContainer}>
                <Image
                    // 우선 간이로 리스트에서 첫번째 펫으로 셀렉티드 함
                    source={userData.petList[0]?.image ? { uri: userData.petList[0]?.image } : require('../assets/images/pets-1.jpg')}
                    style={styles.petImage}
                />
                <Text style={styles.petName}>{userData.petList[0]?.name || '반려동물 선택'}</Text>
                <Icon name="keyboard-arrow-down" size={20} color="black" />
            </TouchableOpacity>

            {/* 🔔 알림 아이콘 (오른쪽) */}
            <TouchableOpacity style={styles.notificationIcon}>
                <Icon name="notifications" size={28} color="black" />
            </TouchableOpacity>
        </View>
    );
};

/**
 * ✅ 스타일 정의
 */
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    petContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    petImage: {
        width: 35,
        height: 35,
        borderRadius: 50,
        marginRight: 8,
    },
    petName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 4,
    },
    notificationIcon: {
        padding: 5,
    },
});

export default Header;