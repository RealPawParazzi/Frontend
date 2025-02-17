import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

/**
 * 📌 UserInfo 컴포넌트
 * - selectedTab (0 = 펫, 1 = 집사) 값에 따라 다른 정보를 표시
 */

const UserInfo = ({ selectedTab }: { selectedTab: number }) => {
    return (
        <View style={styles.container}>
            {/* 🖼️ 프로필 사진 */}
            <Image source={{ uri: 'https://your-profile-image-url.com' }} style={styles.profileImage} />

            {/* 🟢 펫 탭 선택 시 */}
            {selectedTab === 0 ? (
                <View>
                    <Text style={styles.name}>김초코</Text>
                    <Text style={styles.subtitle}>집사: 홍길동</Text>
                    <View style={styles.tag}>
                        <Text>📅 최근 게시물: 1일 전</Text>
                        <Text>🚶 오늘의 산책: 5km</Text>
                    </View>
                </View>
            ) : (
                /* 🟣 집사 탭 선택 시 */
                <View>
                    <Text style={styles.name}>부기부기</Text>
                    <Text style={styles.subtitle}>반려동물: 3마리</Text>
                    <Text>📝 자기소개: 안녕하세요 저는 초코, 딸기, 바닐라 주인 부기부기에요</Text>
                    <Text>📍 주요 산책지: 여의도 일대, 영등포구 공원 단지</Text>
                    <Text>🐶 반려 현황: 강아지 1 / 고양이 2</Text>
                </View>
            )}
        </View>
    );
};

/** ✅ 스타일 정의 */
const styles = StyleSheet.create({
    container: { padding: 20 },
    profileImage: { width: 80, height: 80, borderRadius: 50, alignSelf: 'center', marginBottom: 10 },
    name: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
    subtitle: { fontSize: 14, color: 'gray', textAlign: 'center' },
    tag: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
});

export default UserInfo;
