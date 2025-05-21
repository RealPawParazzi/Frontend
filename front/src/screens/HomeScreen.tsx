import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import MemoryVideo from '../components/HomePage/MemoryVideo';
import FollowRecommendations from '../components/HomePage/FollowRecommendations';
import RecommendShortcutButtons from '../components/HomePage/RecommendShortcutButtons';
import StoryBooksList from '../components/HomePage/HomePageStoryBooks/StoryBooksList';
import StoryReels from '../components/HomePage/StoryReels/StoryReels'; // ✅ 스토리 컴포넌트 import
import boardStore from '../context/boardStore';
import userStore from '../context/userStore';
import userFollowStore from '../context/userFollowStore';
import {useStoryReelsStore} from '../context/storyReelsStore';
import Footer from '../components/Footer';

/**
 * 📌 HomeScreen (홈 화면)
 * - 오늘의 추억, 스토리, 추천 컨텐츠, 팔로우 추천, 게시물 리스트 등을 표시
 * - Pull-to-refresh 시 여러 데이터 다시 로드
 * - Lottie 애니메이션으로 로딩 표시
 */
const HomeScreen = () => {
  const {fetchBoardList} = boardStore();
  const {loadGroupedStories, loadMyStories} = useStoryReelsStore();
  const {loadFollowRecommendations, userData} = userStore();
  const {fetchFollowing} = userFollowStore();

  // 🔄 새로고침 상태
  const [refreshing, setRefreshing] = useState(false);

  // ✅ 최초 마운트 시 게시물 로드
  useEffect(() => {
    fetchBoardList();
  }, [fetchBoardList]);

  // ✅ 최소 로딩 시간 유지를 위한 대기 함수
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * 🔄 새로고침 시 실행되는 함수
   * - 모든 주요 데이터 fetch + 최소 1초 대기
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    await Promise.all([
      fetchBoardList(),
      loadMyStories(),
      loadGroupedStories(),
      loadFollowRecommendations(),
      fetchFollowing(Number(userData.id)),
      wait(1000), // ✅ 최소 로딩 시간 1초 확보
    ]);

    setRefreshing(false);
  }, [
    fetchBoardList,
    fetchFollowing,
    loadFollowRecommendations,
    loadGroupedStories,
    loadMyStories,
    userData.id,
  ]);

  return (
    <View style={styles.container}>
      {/* ✅ 메인 콘텐츠 스크롤 */}
      {/* ✅ ScrollView + RefreshControl */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4D7CFE']}       // ✅ Android용 로딩 색상
            tintColor="#4D7CFE"        // ✅ iOS용 로딩 색상
            // title="새로운 소식을 불러오고 있어요..."
            // titleColor="#4D7CFE"
          />
        }>
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
        <Footer />
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
  lottieWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  lottie: {
    width: 60,
    height: 60,
  },
});

export default HomeScreen;
