import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import LottieView from 'lottie-react-native';
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

  // ✅ 새로고침 상태
  const [refreshing, setRefreshing] = useState(false);

  // ✅ 위로 당긴 거리 추적용 애니메이션 값
  const pullY = useRef(new Animated.Value(0)).current;

  // ✅ Lottie 컨트롤용 ref
  const lottieRef = useRef<LottieView>(null);

  const [isPulling, setIsPulling] = useState(false); // 🔵 당기는 중 여부

  // 로티 로딩 여유 시간 주기
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // ✅ 마운트 시 게시물 불러오기
  useEffect(() => {
    fetchBoardList();
  }, [fetchBoardList]);

  /**
   * ✅ 새로고침 시 데이터 재요청
   * - 게시물, 내 스토리, 전체 스토리, 팔로우 추천, 팔로잉 목록
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    // ✅ API 요청 + 최소 대기 동시에 실행
    await Promise.all([
      fetchBoardList(),
      loadMyStories(),
      loadGroupedStories(),
      loadFollowRecommendations(),
      fetchFollowing(Number(userData.id)),
      wait(3000), // 최소 3초 대기
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

  /**
   * ✅ 스크롤 감지하여 pullY 값 조정
   * - 위로 당긴 정도를 기준으로 애니메이션 위치 설정
   */
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    if (offset < 0) {
      pullY.setValue(Math.abs(offset));
      setIsPulling(true);
    } else {
      setIsPulling(false); // 손을 놓은 상태
    }
  };

  // ✅ 당기기 시작 시 Lottie 재생
  useEffect(() => {
    if (isPulling && !refreshing) {
      lottieRef.current?.play();
    }
  }, [isPulling, refreshing]);

  // ✅ 로딩 완료 시 Lottie 정지 및 초기화
  useEffect(() => {
    if (!refreshing && !isPulling) {
      lottieRef.current?.reset();
    }
  }, [refreshing, isPulling]);

  return (
    <View style={styles.container}>
      {/* ✅ Lottie 로딩 애니메이션 (위로 당길 때 표시됨) */}
      <Animated.View
        style={[
          styles.lottieWrapper,
          {
            height:
              isPulling
                ? pullY.interpolate({
                  inputRange: [100, 150],
                  outputRange: [75, 150],
                  extrapolate: 'clamp',
                })
                : refreshing
                  ? 120 // ✅ 로딩 중이면 고정 높이 확보
                  : 0,  // ✅ 평소에는 감춰둠
          },
        ]}>
        <LottieView
          ref={lottieRef}
          source={require('../assets/animations/circle_cat.json')}
          style={styles.lottie}
          loop
        />
      </Animated.View>
      {/* ✅ 메인 콘텐츠 스크롤 */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="transparent" // ✅ 기본 인디케이터 감춤
            colors={['transparent']}
            progressViewOffset={-100}
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
