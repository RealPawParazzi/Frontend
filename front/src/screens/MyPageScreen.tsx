import React, {useCallback, useState} from 'react';
import {StyleSheet, FlatList, View, RefreshControl} from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

import UserInfo from '../components/MyPage/UserInfo';
import Footer from '../components/Footer';

// ✅ Zustand 스토어에서 필요한 데이터 로딩 함수 import
import petStore from '../context/petStore';
import userStore, { loadUserData } from '../context/userStore';
import userFollowStore from '../context/userFollowStore';
import boardStore from '../context/boardStore';
import { useStoryReelsStore } from '../context/storyReelsStore';


/**
 * 📌 MyPageScreen (마이페이지 화면)
 * - "펫" / "집사" 탭을 선택할 수 있는 Segmented Control 포함
 * - 선택된 탭에 따라 사용자 정보가 달라짐
 * - 유저 프로필 및 반려동물 게시물 리스트 표시
 */
const MyPageScreen = () => {
  // 🟢 현재 선택된 탭 ("펫" = 0, "집사" = 1)
  const [selectedTab, setSelectedTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false); // 🔄 새로고침 상태

  // ✅ 최소 로딩 시간 확보용 wait 함수
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // ✅ 새로고침 핸들러 내부
  const { userData } = userStore(); // ❗ 실제 userId 가져오는 방법 확인 필요
  const { fetchFollowers, fetchFollowing } = userFollowStore();
  const { fetchUserBoards } = boardStore();
  const { loadMyStories } = useStoryReelsStore();
  const { fetchPets } = petStore(); // ❗ 실제 함수명 다를 수 있음


  /**
   * 🔄 새로고침 핸들러
   * - 유저 데이터를 다시 불러오고 최소 1초 대기
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadUserData(),
      fetchFollowers(Number(userData.id)),
      fetchFollowing(Number(userData.id)),
      fetchUserBoards(Number(userData.id)),
      fetchPets(), // 반려동물 데이터 로드
      loadMyStories(),
      wait(1000),
    ]);
    setRefreshing(false);
  }, [fetchFollowers, fetchFollowing, fetchPets, fetchUserBoards, loadMyStories, userData.id]);

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.headerWrapper}>
          {/* 🟢 Segmented Control */}
          <SegmentedControl
            values={['펫', '집사']}
            selectedIndex={selectedTab}
            onChange={event =>
              setSelectedTab(event.nativeEvent.selectedSegmentIndex)
            }
            style={styles.segmentControl}
          />

          {/* ✅ 선택된 탭 콘텐츠 */}
          <UserInfo selectedTab={selectedTab} />

          {/* ✅ Footer */}
            <Footer />
        </View>
      }
      data={[]} // 게시글 없음
      renderItem={null}
      contentContainerStyle={{backgroundColor: '#fff', paddingBottom: 40}}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#4D7CFE']}   // ✅ Android 로딩 인디케이터 색상
          tintColor="#4D7CFE"    // ✅ iOS 로딩 인디케이터 색상
          // title="업데이트 중..."
          // titleColor="#4D7CFE"
        />
      }
    />
  );
};

/** ✅ 스타일 정의 */
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#ffffff'},

  headerWrapper: {
    backgroundColor: '#fff', // ✅ 세그먼트 ~ Footer 구간 흰 배경 보장
  },
  segmentControl: {
    marginHorizontal: 20,
    marginVertical: 15,
  },
});

export default MyPageScreen;
