import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useStore from '../context/useStore'; // ✅ Zustand 전역 상태 가져오기

/**
 * 📌 Header 컴포넌트
 * - 앱의 최상단에 위치하는 헤더
 * - 왼쪽에는 앱 타이틀(PawParazzi), 오른쪽에는 알림 아이콘과 프로필 이미지 표시
 * - 프로필 이미지가 없을 경우 기본 아이콘(person) 표시
 */
const Header = () => {
    // ✅ Zustand에서 사용자 정보 가져오기
    const { userData } = useStore();
    const profileImageUrl = userData.profileImage; // 프로필 이미지 URL

    return (
        <View style={styles.container}>
            {/* 🏠 앱 타이틀 (왼쪽 정렬) */}
            <Text style={styles.title}>PawParazzi</Text>

            {/* 🟢 오른쪽 영역: 알림 아이콘 + 프로필 이미지 */}
            <View style={styles.rightIcons}>
                {/* 🔔 알림 아이콘 */}
                <TouchableOpacity style={styles.icon}>
                    <Icon name="notifications" size={24} color="black" />
                </TouchableOpacity>

                {/* 🖼️ 프로필 이미지가 있으면 이미지 표시, 없으면 기본 아이콘 표시 */}
                {profileImageUrl ? (
                    <Image source={profileImageUrl} style={styles.profileImage} />
                ) : (
                    <Icon name="person" size={30} color="gray" />
                )}
            </View>
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
        padding: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 10,
    },
    profileImage: {
        width: 30,
        height: 30,
        borderRadius: 50,
    },
});

export default Header;
