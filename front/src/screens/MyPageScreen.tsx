import React, { useState } from 'react';
import {Text, TouchableOpacity, StyleSheet, FlatList, View} from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import UserInfo from '../components/UserInfo';
import PostList from '../components/PostList';
import Header from '../components/Header';
import useStore from '../context/useStore'; // ✅ Zustand 스토어 불러오기


/**
 * 📌 MyPageScreen (마이페이지 화면)
 * - "펫" / "집사" 탭을 선택할 수 있는 Segmented Control 포함
 * - 선택된 탭에 따라 사용자 정보가 달라짐
 * - 유저 프로필 및 반려동물 게시물 리스트 표시
 */
const MyPageScreen = () => {
    // 🟢 현재 선택된 탭 ("펫" = 0, "집사" = 1)
    const [selectedTab, setSelectedTab] = useState(0);
    const { userData } = useStore(); // ✅ Zustand에서 데이터 가져오기


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
                    <UserInfo selectedTab={selectedTab} userData={userData} />
                </>
            )}
            data={userData.recentPosts} // ✅ 상태에서 가져온 게시물 리스트
            renderItem={({ item }) => (
                <PostList post={item} /> // ✅ 게시물 단위 렌더링
            )}
            keyExtractor={(item) => item.id}
            ListFooterComponent={(
                <View style={styles.footer}>
                    {/* 🔵 로그아웃 버튼 */}
                    <TouchableOpacity style={styles.logoutButton}>
                        <Text style={styles.logoutText}>로그아웃</Text>
                    </TouchableOpacity>
                </View>
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
