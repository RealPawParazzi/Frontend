import React, { useState } from 'react';
import {Text, TouchableOpacity, StyleSheet, FlatList} from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import UserInfo from '../components/UserInfo';
import PostList from '../components/PostList';
import Header from '../components/Header';

/**
 * 📌 MyPageScreen (마이페이지 화면)
 * - "펫" / "집사" 탭을 선택할 수 있는 Segmented Control 포함
 * - 선택된 탭에 따라 사용자 정보가 달라짐
 * - 유저 프로필 및 반려동물 게시물 리스트 표시
 */
const MyPageScreen = () => {
    // 🟢 현재 선택된 탭 ("펫" = 0, "집사" = 1)
    const [selectedTab, setSelectedTab] = useState(0);

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
            data={[]} // PostList 자체가 리스트를 렌더링하므로 빈 배열 전달
            renderItem={null}
            ListFooterComponent={(
                <>
                    {/* 📜 유저의 반려동물 게시물 리스트 */}
                    <PostList />
                    {/* 🔵 로그아웃 버튼 */}
                    <TouchableOpacity style={styles.logoutButton}>
                        <Text style={styles.logoutText}>로그아웃</Text>
                    </TouchableOpacity>
                </>
            )}
            keyExtractor={() => "dummy"}
        />
    );
};

/** ✅ 스타일 정의 */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
    title: { fontSize: 24, fontWeight: 'bold' },
    rightIcons: { flexDirection: 'row', alignItems: 'center' },
    profileImage: { width: 35, height: 35, borderRadius: 50, marginLeft: 10 },
    segmentControl: { marginHorizontal: 20, marginVertical: 15 },
    logoutButton: { alignSelf: 'center', backgroundColor: '#6A5ACD', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, marginVertical: 20 },
    logoutText: { color: 'white', fontWeight: 'bold' },
});

export default MyPageScreen;
