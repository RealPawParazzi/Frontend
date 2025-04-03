import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
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

    // ✅ 기본 이미지
    const DEFAULT_IMAGE = require('../assets/images/pets-1.jpg');

    // ✅ 안전한 이미지 소스 가져오기
    const getImageSource = () => {
        if (!userData?.petList?.length) { return DEFAULT_IMAGE; }

        const petImage = userData.petList[0]?.image;
        if (!petImage) { return DEFAULT_IMAGE; }

        if (typeof petImage === 'string') {
            return {
                uri: petImage,
                width: 40,
                height: 40,
                cache: 'force-cache',
            };
        }

        return DEFAULT_IMAGE;
    };

    return (
        <View style={styles.container}>
            {/* 🖼️ 반려동물 프로필 (왼쪽) */}
            <TouchableOpacity style={styles.petContainer}>
                <Image
                    source={getImageSource()}
                    style={styles.petImage}
                />
                <Text style={styles.petName}>
                    {userData?.petList?.[0]?.name || '반려동물 선택'}
                </Text>
                <Icon
                    name={Platform.OS === 'ios' ? 'keyboard-arrow-down' : 'arrow-drop-down'}
                    size={20}
                    color="black"
                />
            </TouchableOpacity>

            {/* 🔔 알림 아이콘 (오른쪽) */}
            <TouchableOpacity style={styles.notificationIcon}>
                <Icon
                    name={Platform.OS === 'ios' ? 'notifications' : 'notifications-none'}
                    size={28}
                    color="black"
                />
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

        // 💫 그림자 스타일 추가
        backgroundColor: '#fff', // 그림자 보이게 하려면 필요
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4, // Android용
        zIndex: 10, // iOS z-index 효과 보정
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