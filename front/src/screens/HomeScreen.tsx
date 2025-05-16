import React, {useEffect} from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import MemoryVideo from '../components/HomePage/MemoryVideo';
import FollowRecommendations from '../components/HomePage/FollowRecommendations';
import RecommendShortcutButtons from '../components/HomePage/RecommendShortcutButtons';
import StoryBooksList from '../components/HomePage/HomePageStoryBooks/StoryBooksList';
import StoryReels from '../components/HomePage/StoryReels'; // ✅ 스토리 컴포넌트 import
import boardStore from '../context/boardStore';

/**
 * 📌 HomeScreen (홈 화면)
 * - Zustand에서 가져온 데이터 사용
 * - "오늘의 추억 영상", "스토리 릴", "팔로우 추천", "StoryBooks for Today" 섹션 포함
 */
const HomeScreen = () => {
    const { fetchBoardList } = boardStore();

    useEffect(() => {
        // 컴포넌트가 마운트될 때 전체 게시물을 불러옴
        fetchBoardList();
    }, [fetchBoardList]);
    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* 🔵 스토리 릴 (최상단) */}
                <StoryReels />

                {/* 👇 디바이더 */}
                <View style={styles.divider} />

                {/* 🎞️ 오늘의 추억 영상 */}
                <MemoryVideo />

                {/* 👇 디바이더 추가 */}
                <View style={styles.divider} />

                {/* 추천 컨텐츠 아이콘들 */}
                <RecommendShortcutButtons />

                {/* 👇 디바이더 추가 */}
                <View style={styles.divider} />

                {/* 👥 팔로우 추천 */}
                <Text style={styles.sectionTitle}> 👥 팔로우 추천 </Text>
                <FollowRecommendations />

                {/* 👇 디바이더 추가 */}
                <View style={styles.divider} />

                {/* 📖 StoryBooks for Today */}
                <Text style={styles.sectionTitle}> 📖 오늘의 게시물 </Text>
                <StoryBooksList />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
    },
    divider: {
        height: 2,
        width: '100%', // 👉 전체 너비
        backgroundColor: '#e0e0e0',
        marginVertical: 1,
    },

});

export default HomeScreen;
