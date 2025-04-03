import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import MemoryVideo from '../components/HomePage/MemoryVideo';
import FollowRecommendations from '../components/HomePage/FollowRecommendations';
import RecommendShortcutButtons from '../components/HomePage/RecommendShortcutButtons';
import StoryBooksList from '../components/HomePage/HomePageStoryBooks/StoryBooksList';
import userStore from '../context/userStore';

/**
 * 📌 HomeScreen (홈 화면)
 * - Zustand에서 가져온 데이터 사용
 * - "오늘의 추억 영상", "스토리 릴", "팔로우 추천", "StoryBooks for Today" 섹션 포함
 */
const HomeScreen = () => {
    const { storyBooks } = userStore(); // ✅ Zustand 데이터 가져오기

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* 🎞️ 오늘의 추억 영상 */}
                <MemoryVideo />

                {/* 추천 컨텐츠 아이콘들 */}
                <RecommendShortcutButtons />

                {/* 👥 팔로우 추천 */}
                <Text style={styles.sectionTitle}> 👥 팔로우 추천 </Text>
                <FollowRecommendations />

                {/* 📖 StoryBooks for Today */}
                <Text style={styles.sectionTitle}> 📖 오늘의 게시물 </Text>
                <StoryBooksList />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
});

export default HomeScreen;
