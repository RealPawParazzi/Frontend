// ✅ StoryBooksList.tsx
import React, {useEffect, useState} from 'react';
import {View, FlatList, StyleSheet, Text, TouchableOpacity} from 'react-native';
import boardStore from '../../../context/boardStore';
import userStore from '../../../context/userStore';
import followStore from '../../../context/userFollowStore';
import StoryBookCard from './StoryBookCard';
import Icon from 'react-native-vector-icons/MaterialIcons';

const StoryBooksList = () => {
  const {boardList} = boardStore();
  const {userData} = userStore();
  const {following, fetchFollowing} = followStore();

  // ✅ 정렬 기준 추가: 'writeDatetime' 포함
  const [sortBy, setSortBy] = useState<
    'favoriteCount' | 'viewCount' | 'writeDatetime'
  >('favoriteCount');

  /**
   * ✅ 로그인한 유저의 팔로잉 목록 fetch (현재는 사용 안 하지만 추후 활용 가능)
   */
  useEffect(() => {
    if (userData?.id) {
      fetchFollowing(Number(userData.id));
    }
  }, [fetchFollowing, userData.id]);

  // ✅ 정렬 기준에 따라 정렬 방식 분기
  const sortBoards = (boards: typeof boardList) => {
    if (sortBy === 'writeDatetime') {
      return [...boards].sort(
        (a, b) =>
          new Date(b.writeDatetime).getTime() -
          new Date(a.writeDatetime).getTime(),
      );
    } else {
      return [...boards].sort((a, b) => b[sortBy] - a[sortBy]);
    }
  };

  // ✅ 필터링: 퍼블릭 게시글만
  const filteredSortedBoards = sortBoards(
    boardList.filter(b => b.id !== 0 && b.visibility === 'PUBLIC'),
  );

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Icon
          name="calendar-today"
          size={20}
          color="#999"
          style={{marginRight: 6}}
        />
        <Text style={styles.sectionTitle}> 오늘의 추천 일기 </Text>
      </View>
      <View style={styles.tabRow}>
        <TouchableOpacity onPress={() => setSortBy('favoriteCount')}>
          <Text
            style={[
              styles.tabText,
              sortBy === 'favoriteCount' && styles.activeTabText,
            ]}>
            좋아요순
          </Text>
        </TouchableOpacity>

        <Text style={styles.separator}>|</Text>

        <TouchableOpacity onPress={() => setSortBy('viewCount')}>
          <Text
            style={[
              styles.tabText,
              sortBy === 'viewCount' && styles.activeTabText,
            ]}>
            조회수순
          </Text>
        </TouchableOpacity>

        <Text style={styles.separator}>|</Text>

        <TouchableOpacity onPress={() => setSortBy('writeDatetime')}>
          <Text
            style={[
              styles.tabText,
              sortBy === 'writeDatetime' && styles.activeTabText,
            ]}>
            최신순
          </Text>
        </TouchableOpacity>
      </View>

      {/* ✅ 게시글 리스트 출력 */}
      {filteredSortedBoards.length > 0 ? (
        <FlatList
          data={filteredSortedBoards}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => <StoryBookCard story={item} />}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        />
      ) : (
        <Text style={styles.emptyText}> 게시글이 없습니다. </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // 👉 오른쪽 끝으로 정렬
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 2,
    paddingRight: 4, // 오른쪽 간격 살짝 여유
  },
  tabText: {
    fontSize: 14,
    color: '#aaa', // 🔹 기본 회색
    fontWeight: '400',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  separator: {
    fontSize: 14,
    color: '#ccc',
  },
  activeTabText: {
    color: '#4D7CFE', // 🔵 선택된 탭만 파란색
    fontWeight: 'bold',
    // textDecorationLine: 'underline',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    color: 'gray',
  },
});

export default StoryBooksList;
