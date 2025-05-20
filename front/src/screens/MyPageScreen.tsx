import React, {useState} from 'react';
import {StyleSheet, FlatList, View} from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

import UserInfo from '../components/MyPage/UserInfo';
import Footer from '../components/Footer';

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
