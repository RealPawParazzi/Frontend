import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, FlatList, View, Alert } from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

import UserInfo from '../components/MyPage/UserInfo';
import PostList from '../components/MyPage/PostList';
import Header from '../components/Header';
import { logoutUser } from '../services/authService'; // ✅ 로그아웃 서비스 추가
import { useNavigation } from '@react-navigation/native';
/**
 * 📌 MyPageScreen (마이페이지 화면)
 * - "펫" / "집사" 탭을 선택할 수 있는 Segmented Control 포함
 * - 선택된 탭에 따라 사용자 정보가 달라짐
 * - 유저 프로필 및 반려동물 게시물 리스트 표시
 */
const MyPageScreen = () => {


    // 🟢 현재 선택된 탭 ("펫" = 0, "집사" = 1)
    const [selectedTab, setSelectedTab] = useState(0);
    const navigation = useNavigation(); // ✅ 네비게이션 객체 가져오기

    // ✅ 로그아웃 함수
    const handleLogout = async () => {
        try {
            await logoutUser(); // ✅ 인증 정보 삭제
            Alert.alert('✅ 로그아웃 성공', '다시 로그인 해주세요.');
            navigation.navigate('Auth' as never); // ✅ 로그인 화면으로 이동 (타입 문제 방지)
        } catch (error: any) {
            Alert.alert('⚠️ 로그아웃 실패', error.message || '로그아웃 중 오류가 발생했습니다.');
        }
    };

    return (
        <FlatList
            ListHeaderComponent={(
                <>
                    <Header />
                    {/* 🟢 Segmented Control (펫 / 집사 선택) */}
                    <SegmentedControl
                        values={['펫', '집사']}
                        selectedIndex={selectedTab}
                        onChange={(event) => setSelectedTab(event.nativeEvent.selectedSegmentIndex)}
                        style={styles.segmentControl}
                    />
                    {/* ✅ 선택된 탭에 따라 UI 변경 */}
                    <UserInfo selectedTab={selectedTab} />
                </>
            )}
            data={[]} // ✅ 빈 배열 전달 (게시글 데이터는 `PostList` 내부에서 관리)
            renderItem={null} // ✅ 게시글 목록은 `PostList`에서 직접 관리
            ListFooterComponent={(
                <>
                    {/* ✅ 게시글 목록 (`PostList`에서 상태 관리) */}
                    <PostList />

                    <View style={styles.footer}>
                        {/* 🔵 로그아웃 버튼 */}
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Text style={styles.logoutText}>로그아웃</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        />
    );
};

/** ✅ 스타일 정의 */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    segmentControl: { marginHorizontal: 20, marginVertical: 15 },
    footer: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
    logoutButton: { backgroundColor: '#6A5ACD', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
    logoutText: { color: 'white', fontWeight: 'bold' },
});

export default MyPageScreen;
