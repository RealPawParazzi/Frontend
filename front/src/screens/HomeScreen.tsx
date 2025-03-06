import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import MemoryVideo from '../components/HomePage/MemoryVideo';
import FollowRecommendations from '../components/HomePage/FollowRecommendations';
import StoryReels from '../components/HomePage/StoryReels';
import StoryBooksList from '../components/HomePage/StoryBooksList';
import userStore from '../context/userStore';

/**
 * 📌 HomeScreen (홈 화면)
 * - Zustand에서 가져온 데이터 사용
 * - "오늘의 추억 영상", "스토리 릴", "팔로우 추천", "StoryBooks for Today" 섹션 포함
 */
const HomeScreen = () => {
    const { memoryVideos, followRecommendations, storyBooks, storyReels } = userStore(); // ✅ Zustand 데이터 가져오기

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* 🎞️ 오늘의 추억 영상 */}
                <Text style={styles.sectionTitle}>오늘의 추억 영상 →</Text>
                {memoryVideos.map((video) => (
                    <MemoryVideo key={video.id} video={video} />
                ))}

                {/* 📸 스토리 릴 */}
                <Text style={styles.sectionTitle}>스토리 →</Text>
                <StoryReels stories={storyReels} />

                {/* 👥 팔로우 추천 */}
                <Text style={styles.sectionTitle}>팔로우 추천 →</Text>
                <FollowRecommendations recommendations={followRecommendations} />

                {/* 📖 StoryBooks for Today */}
                <Text style={styles.sectionTitle}>StoryBooks for Today →</Text>
                <StoryBooksList storyBooks={storyBooks} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
});

export default HomeScreen;
