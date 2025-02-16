import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

/**
 * 📌 Header 컴포넌트
 * - 앱의 최상단에 위치하는 헤더
 * - 왼쪽에는 앱 타이틀(PawParazzi), 오른쪽에는 알림 아이콘과 프로필 이미지 표시
 * - 프로필 이미지가 없을 경우 기본 아이콘(person) 표시
 */
const Header = () => {
    // 🟢 사용자의 프로필 이미지 URL (현재는 빈 문자열, 실제 데이터가 있다면 URL이 들어감)
    const profileImageUrl = '';

    return (
        <View style={styles.container}>
            {/* 🏠 앱 타이틀 (왼쪽 정렬) */}
            <Text style={styles.title}>PawParazzi</Text>

            {/* 🟢 오른쪽 영역: 알림 아이콘 + 프로필 이미지 */}
            <View style={styles.rightIcons}>
                {/* 🔔 알림 아이콘 (TouchableOpacity: 클릭 가능) */}
                <TouchableOpacity style={styles.icon}>
                    <Icon name="notifications" size={24} color="black" />
                </TouchableOpacity>

                {/* 🖼️ 프로필 이미지가 있으면 이미지 표시, 없으면 기본 아이콘 표시 */}
                {profileImageUrl ? (
                    // 사용자가 프로필 이미지를 등록한 경우, 해당 이미지를 표시
                    <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
                ) : (
                    // 사용자가 프로필 이미지를 등록하지 않은 경우, 기본 아이콘(person) 표시
                    <Icon name="person" size={30} color="gray" />
                )}
            </View>
        </View>
    );
};

/**
 * ✅ 스타일 정의 (React Native의 StyleSheet 사용)
 * - container: 전체 헤더 스타일 (가로 정렬, 간격 조정)
 * - title: 앱 타이틀 스타일 (폰트 크기 및 굵기 설정)
 * - rightIcons: 오른쪽 아이콘 정렬
 * - icon: 알림 아이콘의 스타일 (우측 여백 조정)
 * - profileImage: 프로필 이미지 스타일 (원형 모양)
 */
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row', // 🔹 헤더를 가로 정렬 (왼쪽부터 오른쪽으로)
        justifyContent: 'space-between', // 🔹 양 끝에 배치
        alignItems: 'center', // 🔹 세로 중앙 정렬
        padding: 15, // 🔹 내부 여백 설정
    },
    title: {
        fontSize: 24, // 🔹 글자 크기 설정
        fontWeight: 'bold', // 🔹 글자를 굵게 표시
    },
    rightIcons: {
        flexDirection: 'row', // 🔹 아이콘과 프로필 이미지를 가로 정렬
        alignItems: 'center', // 🔹 세로 중앙 정렬
    },
    icon: {
        marginRight: 10, // 🔹 알림 아이콘과 프로필 이미지 간격 조정
    },
    profileImage: {
        width: 30, // 🔹 프로필 이미지 크기 (가로)
        height: 30, // 🔹 프로필 이미지 크기 (세로)
        borderRadius: 50, // 🔹 원형 모양으로 만들기
    },
});

export default Header;
