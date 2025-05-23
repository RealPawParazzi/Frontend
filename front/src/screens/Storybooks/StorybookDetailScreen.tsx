import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video'; // Video 컴포넌트 추가
import boardStore from '../../context/boardStore';
import userStore from '../../context/userStore'; // ✅ 로그인한 유저 정보 가져오기
import CommentList from '../../components/Comments/CommentList'; // ✅ 댓글 목록 컴포넌트
import CommentInput from '../../components/Comments/CommentInput'; // ✅ 댓글 입력 바 컴포넌트
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../../navigation/AppNavigator';

/**
 * 📄 스토리북 상세 조회 화면
 */

// 📌 네비게이션 타입 지정
type StorybookDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'StorybookDetailScreen'
>;

const StorybookDetailScreen = ({
  route,
  navigation,
}: {
  route: StorybookDetailScreenRouteProp;
  navigation: any;
}) => {
  const {boardId} = route.params;

  // ✅ Zustand에서 필요한 값만 가져오기
  const fetchBoardDetail = boardStore(state => state.fetchBoardDetail);
  const fetchBoardLikes = boardStore(state => state.fetchBoardLikes);
  const deleteExistingBoard = boardStore(state => state.deleteExistingBoard);
  const toggleBoardLike = boardStore(state => state.toggleBoardLike);
  const selectedBoard = boardStore(state => state.selectedBoard);

  // ✅ 로그인한 사용자 정보 가져오기
  const {userData} = userStore();

  // ✅ 좋아요 상태 관리
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  /**
   * ✅ 초기 데이터 로드 (게시글 상세 및 좋아요 정보)
   * - `useEffect`가 무한 루프를 방지하도록 의존성 배열을 설정.
   */
  useEffect(() => {
    let isMounted = true; // ✅ 컴포넌트 언마운트 체크

    const loadPost = async () => {
      try {
        await fetchBoardDetail(boardId);
        const likesData = await fetchBoardLikes(boardId);

        if (isMounted) {
          setIsLiked(
            likesData?.likedMember?.some(
              member => member.memberId === Number(userData.id),
            ) || false,
          );
          setLikeCount(likesData?.likesCount || 0);
        }
      } catch (error) {
        console.error('게시글 로드 오류:', error);
        Alert.alert('❌ 오류', '게시글을 불러오는 중 문제가 발생했습니다.');
        if (isMounted) {
          navigation.goBack();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPost();

    return () => {
      isMounted = false; // ✅ 컴포넌트가 언마운트되면 API 요청을 중단
    };
  }, [boardId, fetchBoardDetail, fetchBoardLikes, navigation, userData.id]);

  // ✅ 게시글 삭제 함수
  const handleDeletePost = async () => {
    Alert.alert('삭제 확인', '정말 게시글을 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        onPress: async () => {
          try {
            await deleteExistingBoard(boardId);
            Alert.alert('✅ 삭제 완료', '게시글이 삭제되었습니다.');
            navigation.goBack();
          } catch (error) {
            console.error('게시글 삭제 오류:', error);
            Alert.alert('❌ 오류', '게시글 삭제 중 문제가 발생했습니다.');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  // ✅ 햄버거 메뉴 클릭 시 실행되는 Action Sheet
  const openActionSheet = () => {
    // 작성자 일치 여부 확인 (본인 게시글만 수정/삭제 가능)
    const isAuthor = selectedBoard?.author?.id === Number(userData.id);

    if (!isAuthor) {
      Alert.alert(
        '❌ 권한 없음',
        '작성자만 게시글을 수정하거나 삭제할 수 있습니다.',
      );
      return;
    }

    if (!navigation) {
      Alert.alert('❌ 오류', '네비게이션을 사용할 수 없습니다.');
      return;
    }

    if (!boardId) {
      Alert.alert('❌ 오류', '게시글 ID를 불러오는 중 문제가 발생했습니다.');
      return;
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['수정하기 ✏️', '삭제하기 ❌', '취소'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 2,
        },
        buttonIndex => {
          if (buttonIndex === 0) {
            console.log('🔄 이동 중: EditStorybookScreen, boardId:', boardId);
            navigation.navigate('EditStorybookScreen', {boardId});
          } else if (buttonIndex === 1) {
            handleDeletePost();
          }
        },
      );
    } else {
      // 📌 Android에서는 Alert 사용
      Alert.alert('게시글 관리', '수정 또는 삭제할 수 있습니다.', [
        {
          text: '수정하기',
          onPress: () => {
            console.log('🔄 이동 중: EditStorybookScreen, boardId:', boardId);
            navigation.navigate('EditStorybookScreen', {boardId});
          },
        },
        {text: '삭제하기', onPress: handleDeletePost, style: 'destructive'},
        {text: '취소', style: 'cancel'},
      ]);
    }
  };

  /**
   * ✅ 게시글 좋아요 토글 함수
   * - Optimistic UI: 먼저 UI를 업데이트하고 API 요청 실행
   * - 오류 발생 시 이전 상태로 롤백하여 UX 향상
   * - 서버 응답 후 최신 데이터로 동기화
   */
  const handleToggleLike = async () => {
    if (!userData?.id) {
      return Alert.alert('❌ 오류', '로그인이 필요합니다.');
    }

    // ✅ 1. UI 즉시 변경 (Optimistic UI)
    const prevLiked = isLiked;
    const prevLikeCount = likeCount;

    setIsLiked(!prevLiked);
    setLikeCount(prevLiked ? prevLikeCount - 1 : prevLikeCount + 1);

    console.log('🔄 좋아요 토글 시도:', !prevLiked);

    try {
      const response = await toggleBoardLike(boardId);
      if (response) {
        // ✅ response가 존재하는지 체크
        setIsLiked(response.liked);
        setLikeCount(response.favoriteCount);
      } else {
        console.warn('⚠️ toggleBoardLike 응답이 undefined입니다.');
      }
    } catch (error) {
      console.error('좋아요 토글 오류:', error);
      Alert.alert('❌ 오류', '좋아요 처리 중 문제가 발생했습니다.');
    }
  };

  // ✅ 게시글 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    if (!dateString) {
      return '';
    }

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return dateString;
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF6F00" />
      </View>
    );
  }

  if (!selectedBoard) {
    return (
      <View style={styles.loader}>
        <Text>게시글을 찾을 수 없습니다.</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={{flex: 1}}>
        {/* 상단 네비게이션 바 */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <MaterialIcons name="arrow-back-ios" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={styles.navTitle}>
            {formatDate(selectedBoard.writeDatetime)}
          </Text>

          {/* 햄버거 메뉴 (수정/삭제) - 작성자에게만 표시 */}
          {selectedBoard?.author?.id === Number(userData.id) && (
            <TouchableOpacity onPress={openActionSheet}>
              <MaterialIcons name="more-vert" size={24} color="#333" />
            </TouchableOpacity>
          )}
        </View>

        {/* 본문 스크롤뷰 */}
        <ScrollView
          style={styles.contentContainer}
          contentContainerStyle={{paddingBottom: 60}}
          keyboardShouldPersistTaps="handled">
          {/* 작성자 정보 */}
          <View style={styles.authorContainer}>
            <Image
              source={
                selectedBoard.author?.profileImageUrl
                  ? {uri: String(selectedBoard.author.profileImageUrl)}
                  : require('../../assets/images/user-2.png')
              }
              style={styles.authorImage}
            />
            <View>
              <Text style={styles.authorName}>
                {selectedBoard.author?.nickname || '알 수 없음'}
              </Text>
              <Text style={styles.postDate}>
                {formatDate(selectedBoard.writeDatetime)}
              </Text>
            </View>
          </View>

          {/* 제목 */}
          <Text style={styles.title}>{selectedBoard.title}</Text>

          {/* 게시글 컨텐츠 */}
          {selectedBoard.contents?.map(
            (content: {type: string; value: string}, index: number) =>
              content.type === 'Text' ? (
                <Text key={index} style={styles.postText}>
                  {content.value}
                </Text>
              ) : (
                <View key={index} style={styles.mediaContainer}>
                  {content.value.toLowerCase().endsWith('.mp4') ||
                  content.value.toLowerCase().includes('video') ? (
                    <Video
                      source={
                        content.value ? {uri: String(content.value)} : undefined
                      }
                      style={styles.postVideo}
                      resizeMode="cover"
                      controls={true}
                      paused={true}
                    />
                  ) : (
                    <Image
                      source={
                        content.value
                          ? {uri: String(content.value)}
                          : require('../../assets/images/profile-1.png')
                      }
                      style={styles.postImage}
                      resizeMode="cover"
                    />
                  )}
                </View>
              ),
          )}

          {/* 태그 출력 추가 */}
          {selectedBoard.tag && selectedBoard.tag.split(', ').length > 0 && (
            <View style={styles.tagWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tagContainer}>
                {selectedBoard.tag.split(', ').map((tag, index) => (
                  <View key={index} style={styles.tagChip}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ✅ 좋아요 & 댓글 수 표시 */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              onPress={handleToggleLike}
              style={styles.bottomIcon}>
              <MaterialIcons
                name={isLiked ? 'favorite' : 'favorite-border'}
                size={24}
                color={isLiked ? 'red' : 'black'}
              />
              <Text style={styles.bottomText}>{likeCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomIcon}>
              <MaterialIcons
                name="chat-bubble-outline"
                size={24}
                color="black"
              />
              <Text style={styles.bottomText}>
                {selectedBoard.commentCount || 0}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 댓글 목록 */}
          <CommentList boardId={boardId} />
        </ScrollView>
      </View>
      {/* 🔥 댓글 입력 바 - 하단에 고정 */}
      <View style={styles.commentInputContainer}>
        <CommentInput boardId={boardId} />
      </View>
    </SafeAreaView>
  );
};

// ✅ 스타일 정의
const styles = StyleSheet.create({
  safeContainer: {flex: 1, backgroundColor: '#FFF'},

  /* 🔺 상단 네비게이션 바 */
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  backButton: {padding: 8},
  navTitle: {fontSize: 16, fontWeight: 'bold', textAlign: 'center', flex: 1},

  /* 🔺 작성자 정보 */
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  authorName: {fontSize: 16, fontWeight: 'bold'},
  postDate: {fontSize: 12, color: '#777'},

  /* 🔺 본문 */
  contentContainer: {flex: 1, paddingHorizontal: 15},
  title: {fontSize: 22, fontWeight: 'bold', marginBottom: 10},
  postText: {fontSize: 16, lineHeight: 24, marginBottom: 10},
  mediaContainer: {
    width: '100%',
    marginBottom: 10,
  },
  postVideo: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    backgroundColor: '#000',
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },

  tagWrapper: {
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 4,
  },

  /* 🔺 하단 네비게이션 바 */
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop : 3,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 2,
    borderColor: '#EEE',
  },
  bottomIcon: {flexDirection: 'row', alignItems: 'center'},
  bottomText: {fontSize: 16, marginLeft: 5},

  /* 🔺 로딩 화면 */
  loader: {flex: 1, justifyContent: 'center', alignItems: 'center'},

  /* 🔥 댓글 입력 바를 하단에 고정 */
  commentInputContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderTopWidth: 5,
    borderColor: '#EEE',
  },
});

export default StorybookDetailScreen;
