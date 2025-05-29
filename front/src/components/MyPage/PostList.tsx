import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation/AppNavigator'; // ✅ 스택 네비게이션 타입 가져오기
import boardStore, {Board} from '../../context/boardStore'; // 🧠 타입 재사용
import PostCard from './PostCard';

/** ✅ 네비게이션 타입 정의 */
type NavigationProp = StackNavigationProp<
  RootStackParamList,
  'StorybookDetailScreen'
>;

/** ✅ Props 타입 정의 */
interface PostListProps {
  userId: number;
}

const screenWidth = Dimensions.get('window').width;
const isTablet = screenWidth >= 768; // 기준: 768px 이상이면 iPad로 간주
const CARD_MARGIN = 10;
const CARD_WIDTH = isTablet
  ? (screenWidth - CARD_MARGIN * 3) / 2 // 2열 출력용 너비 계산
  : screenWidth - CARD_MARGIN * 2;

/** ✅ PostList 컴포넌트 */
const PostList = ({userId}: PostListProps) => {
  const navigation = useNavigation<NavigationProp>();
  const {userBoardsMap, fetchUserBoards} = boardStore();

  const [hasNoPosts, setHasNoPosts] = useState(false);

  const [displayCount, setDisplayCount] = useState(10); // ✅ 초기 10개만 표시
  const [loadingMore, setLoadingMore] = useState(false); // ✅ 더보기 로딩 상태

  const myBoards: Board[] = useMemo(
    () => userBoardsMap[userId] || [],
    [userBoardsMap, userId],
  );

  useEffect(() => {
    if (userId) {
      fetchUserBoards(userId);
    }
  }, [fetchUserBoards, userId]);

  useEffect(() => {
    setHasNoPosts(myBoards.length === 0);
  }, [myBoards]);

  const handleLoadMore = () => {
    if (displayCount < sortedBoards.length) {
      setLoadingMore(true);
      setTimeout(() => {
        setDisplayCount(prev => prev + 10);
        setLoadingMore(false);
      }, 500);
    }
  };

  // ✅ 최신순으로 정렬된 게시글 리스트
  const sortedBoards = useMemo(() => {
    return [...myBoards].sort(
      (a, b) =>
        new Date(b.writeDatetime).getTime() -
        new Date(a.writeDatetime).getTime(),
    );
  }, [myBoards]);

  return (
    <View style={styles.container}>
      {hasNoPosts ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.noPosts}>📭 게시글이 아직 없습니다!</Text>
          <Text style={styles.suggestion}>첫 게시글을 업로드 해볼까요?</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => navigation.navigate('StorybookScreen')}>
            <Text style={styles.uploadButtonText}>+ 새 게시글 작성</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={sortedBoards.slice(0, displayCount)}
            numColumns={isTablet ? 2 : 1} // ✅ iPad일 땐 2줄 출력
            renderItem={({item}) => (
              <View style={{width: CARD_WIDTH, marginRight: CARD_MARGIN}}>
                <PostCard post={item} />
              </View>
            )}
            keyExtractor={item => String(item.id)}
          />
          {displayCount < sortedBoards.length && (
            <View style={styles.loadMoreContainer}>
              {loadingMore ? (
                <ActivityIndicator size="small" color="#4D7CFE" />
              ) : (
                <TouchableOpacity
                  onPress={handleLoadMore}
                  style={styles.loadMoreButton}>
                  <Text style={styles.loadMoreText}>게시글 더 보기</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
};

/** ✅ 스타일 */
const styles = StyleSheet.create({
  container: {padding: 10},
  listContainer: {
    paddingHorizontal: CARD_MARGIN,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  noPosts: {fontSize: 18, fontWeight: 'bold', color: '#444', marginBottom: 5},
  suggestion: {fontSize: 14, color: 'gray', marginBottom: 15},

  uploadButton: {
    backgroundColor: '#4D7CFE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadMoreContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  loadMoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EAEFFF',
    borderRadius: 20,
  },
  loadMoreText: {
    color: '#4D7CFE',
    fontWeight: '600',
  },
});
export default PostList;
