import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import {createThumbnail} from 'react-native-create-thumbnail';
import userStore from '../../context/userStore';
import userFollowStore from '../../context/userFollowStore';
import {useStoryReelsStore} from '../../context/storyReelsStore';
import {useNavigation} from '@react-navigation/native';
import PostList from './PostList';
import Icon from 'react-native-vector-icons/MaterialIcons';
import authStore from '../../context/authStore';
import {getImageSource} from '../../utils/imageUtils';
import boardStore from '../../context/boardStore';
import Video from 'react-native-video';
import StoryReelsModal from '../../components/HomePage/StoryReels/StoryReelsModal';
import MyVideos from './MyVideos';
import MyPhotos from './MyPhotos'; // 위치에 따라 경로 조정

// ✅ 기본 프로필 이미지
const DEFAULT_PROFILE_IMAGE = require('../../assets/images/user-2.png');

const OwnerInfo = () => {
  const navigation = useNavigation();
  const {userData} = userStore();
  const {logout} = authStore(); // ✅ 로그아웃 함수 가져오기
  const [selectedTab, setSelectedTab] = useState<'posts' | 'photos' | 'videos'>(
    'posts',
  );

  const [storyModalVisible, setStoryModalVisible] = useState(false);
  const [singleStoryGroup, setSingleStoryGroup] = useState<any>(null);

  const [menuVisible, setMenuVisible] = useState(false); // ✅ 햄버거 메뉴 모달 상태
  const {following, followers, fetchFollowing, fetchFollowers} =
    userFollowStore(); // ✅ 현재 로그인 유저의 팔로우 정보

  // ✅ 게시글, 팔로워, 팔로잉 수 상태 관리
  const [postCount, setPostCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [memories, setMemories] = useState<string[]>([]);
  const [latestPostTime, setLatestPostTime] = useState('없음');
  const {userBoardsMap, fetchUserBoards} = boardStore();

  const {myStories, loadMyStories} = useStoryReelsStore();

  // ✅ 썸네일 상태
  const [memoryThumbnails, setMemoryThumbnails] = useState<{
    [key: number]: string;
  }>({});

  // ✅ 썸네일 생성 함수
  const generateThumbnailForMedia = async (story: any): Promise<string> => {
    const isVideo =
      story.mediaUrl.endsWith('.mp4') || story.mediaUrl.endsWith('.mov');

    if (isVideo) {
      try {
        const thumb = await createThumbnail({
          url: story.mediaUrl,
          timeStamp: 1000,
        });
        return thumb.path;
      } catch (error) {
        console.warn('썸네일 생성 실패:', error);
        return story.mediaUrl; // 실패 시 원본 반환
      }
    } else {
      return story.mediaUrl;
    }
  };

  // ✅ 썸네일 로딩 useEffect
  useEffect(() => {
    const loadThumbnails = async () => {
      const thumbs: {[key: number]: string} = {};
      for (const story of myStories) {
        const thumbUri = await generateThumbnailForMedia(story);
        thumbs[story.storyId] = thumbUri;
      }
      setMemoryThumbnails(thumbs);
    };

    if (myStories.length > 0) {
      loadThumbnails();
    }
  }, [myStories]);

  // ✅ 처음에 내 스토리 불러오기
  useEffect(() => {
    loadMyStories();
  }, [loadMyStories]);

  // ✅ 내 게시글 목록 가져오기
  const myBoards = useMemo(() => {
    return userBoardsMap[Number(userData.id)] || [];
  }, [userBoardsMap, userData.id]);

  // ✅ 게시글 개수 및 최신 게시물 시간 업데이트
  useEffect(() => {
    if (userData.id) {
      fetchUserBoards(Number(userData.id));
    }
  }, [userData.id, fetchUserBoards]);

  useEffect(() => {
    const sortedPosts = [...myBoards].sort(
      (a, b) =>
        new Date(b.writeDatetime).getTime() -
        new Date(a.writeDatetime).getTime(),
    );
    setPostCount(myBoards.length);
    setLatestPostTime(
      sortedPosts.length > 0
        ? getRelativeTime(sortedPosts[0].writeDatetime)
        : '없음',
    );
  }, [myBoards]);

  // ✅ 팔로잉 & 팔로워 목록 가져오기
  useEffect(() => {
    fetchFollowing(Number(userData.id)); // ✅ 로그인한 유저의 팔로잉 목록 불러오기
    fetchFollowers(Number(userData.id)); // ✅ 로그인한 유저를 팔로우하는 목록 불러오기
  }, [fetchFollowing, fetchFollowers, userData.id]);

  // ✅ 팔로워 및 팔로잉 수 업데이트
  useEffect(() => {
    setFollowerCount(followers.length);
    setFollowingCount(following.length);
  }, [followers, following]);

  useEffect(() => {
    const memoryImages = [
      'https://via.placeholder.com/80',
      'https://via.placeholder.com/80',
      'https://via.placeholder.com/80',
      'https://via.placeholder.com/80',
    ];
    setMemories(memoryImages);
  }, []);

  // ✅ 상대적인 시간 계산 함수
  const getRelativeTime = (dateString: string) => {
    const postDate = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - postDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
      return '방금 전';
    }
    if (diffMinutes < 60) {
      return `${diffMinutes}분 전`;
    }
    if (diffHours < 24) {
      return `${diffHours}시간 전`;
    }
    return `${diffDays}일 전`;
  };

  const handleLogout = async () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '로그아웃',
        onPress: async () => {
          await logout(); // ✅ 로그아웃 처리
          //@ts-ignore
          navigation.reset({index: 0, routes: [{name: 'Login'}]}); // ✅ 로그인 화면으로 이동
        },
      },
    ]);
  };

  // ✅ 특정 스토리 하나만 모달에 전달하는 함수
  const openSingleStory = (story: any) => {
    setSingleStoryGroup({
      memberId: Number(userData.id), // 현재 사용자 ID
      nickname: userData.nickName, // 사용자 닉네임
      profileImageUrl: userData.profileImage.uri, // 사용자 프로필 이미지
      stories: [story], // 🔥 단일 스토리만 배열로 전달
    });
    setStoryModalVisible(true); // 모달 열기
  };

  // useEffect(() => {
  //     console.log('📸 userData:', userData);
  //     console.log('📸 profileImage value:', userData.profileImage.uri);
  //     console.log('📸 typeof profileImage:', typeof userData.profileImage);
  // }, [userData]);

  // 상단에 추가
  const realPetCount = userData.petList?.filter(p => Number(p.id) !== 0).length || 0;

  return (
    <View style={styles.container}>
      {/* ✅ 상단 프로필 영역 */}
      <View style={styles.profileContainer}>
        {/* ✅ 프로필 이미지 + 사용자 정보 */}
        <View style={styles.profileInfo}>
          <Image
            source={getImageSource(
              userData.profileImage,
              DEFAULT_PROFILE_IMAGE,
            )}
            style={styles.profileImage}
            onError={e => {
              console.log('Image loading error:', e.nativeEvent); // 이미지 로드 에러 로깅
            }}
          />
          <View style={styles.userInfo}>
            {/* 🔹 닉네임 + 이름 (한 줄에 배치) */}
            <View style={styles.nameRow}>
              <Text style={styles.userNickname}>{userData.nickName}</Text>
              <Text style={styles.userRealName}>@{userData.name}</Text>
            </View>

            {/* 🔹 반려동물 수 */}
            <Text style={styles.petCount}>{realPetCount}마리</Text>
          </View>
        </View>

        {/* ✅ 점 3개(더보기) 아이콘 버튼 */}
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.menuButton}>
          <Icon name="more-vert" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {/* ✅ 메뉴 모달 */}
      <Modal visible={menuVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setMenuVisible(false);
                // @ts-ignore
                navigation.navigate('EditProfileScreen'); // ✅ 프로필 수정 화면으로 이동
              }}>
              <Text style={styles.modalText}>프로필 수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setMenuVisible(false);
                // @ts-ignore
                navigation.navigate('MyInquiriesScreen');
              }}>
              <Text style={styles.modalText}>1:1 문의 목록</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setMenuVisible(false);
                // @ts-ignore
                navigation.navigate('MyGeneratedVideosScreen');
              }}>
              <Text style={styles.modalText}>생성된 동영상</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={handleLogout}>
              <Text style={[styles.modalText, {color: 'red'}]}>로그아웃</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setMenuVisible(false)}>
              <Text style={styles.modalCancelText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ✅ 게시글, 팔로워, 팔로잉 */}
      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={styles.statBox}
          onPress={() =>
            //@ts-ignore
            navigation.navigate('UserPostsScreen', {
              userId: userData.id,
              userName: userData.nickName,
            })
          }>
          <Text style={styles.statNumber}>{postCount}</Text>
          <Text style={styles.statText}>게시물</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.statBox}
          onPress={() =>
            //@ts-ignore
            navigation.navigate('FollowListScreen', {
              type: 'followers',
              userId: userData.id,
              userName: userData.name,
              userNickName: userData.nickName,
            })
          }>
          <Text style={styles.statNumber}>{followerCount}</Text>
          <Text style={styles.statText}>팔로워</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.statBox}
          onPress={() =>
            //@ts-ignore
            navigation.navigate('FollowListScreen', {
              type: 'following',
              userId: userData.id,
              userName: userData.name,
              userNickName: userData.nickName,
            })
          }>
          <Text style={styles.statNumber}>{followingCount}</Text>
          <Text style={styles.statText}>팔로잉</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ 메모리 (스토리 형식) */}
      {myStories.length > 0 && (
        <>
          <Text style={styles.memoryTitle}>Memories</Text>
          <FlatList
            horizontal
            data={myStories}
            //@ts-ignore
            keyExtractor={item => item.storyId}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.memoryCircle}
                onPress={() => openSingleStory(item)}>
                <Image
                  source={{
                    uri:
                      memoryThumbnails[item.storyId] || DEFAULT_PROFILE_IMAGE,
                  }}
                  style={styles.memoryImage}
                />
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </>
      )}

      {/* ✅ 단일 스토리만 재생하는 모달 */}
      {singleStoryGroup && (
        <StoryReelsModal
          visible={storyModalVisible}
          onClose={() => setStoryModalVisible(false)} // 닫기 핸들러
          userIndex={0} // 단일 유저이므로 항상 0
          userStoryGroups={[singleStoryGroup]} // 🔥 단일 스토리 그룹만 전달
        />
      )}

      {/* ✅ 탭 메뉴 */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'posts' && styles.activeTab]}
          onPress={() => setSelectedTab('posts')}>
          <Text
            style={
              selectedTab === 'posts' ? styles.activeTabText : styles.tabText
            }>
            Posts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'photos' && styles.activeTab]}
          onPress={() => setSelectedTab('photos')}>
          <Text
            style={
              selectedTab === 'photos' ? styles.activeTabText : styles.tabText
            }>
            Photos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'videos' && styles.activeTab]}
          onPress={() => setSelectedTab('videos')}>
          <Text
            style={
              selectedTab === 'videos' ? styles.activeTabText : styles.tabText
            }>
            Videos
          </Text>
        </TouchableOpacity>
      </View>

      {/* ✅ 선택된 탭에 따라 다른 컴포넌트 출력 */}
      <View style={styles.tabContentWrapper}>
        {selectedTab === 'posts' && <PostList userId={Number(userData.id)} />}
        {selectedTab === 'photos' && <MyPhotos userId={Number(userData.id)} />}
        {selectedTab === 'videos' && <MyVideos userId={Number(userData.id)} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },

  /** ✅ 상단 프로필 영역 */
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // ✅ 점 세 개 아이콘을 우측 끝으로 정렬
    marginBottom: 15,
  },

  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#EAEAEA',
  },
  userInfo: {
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  userNickname: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 6, // 닉네임과 이름 사이 여백
  },

  userRealName: {
    fontSize: 13,
    color: '#777',
  },

  petCount: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },

  /** ✅ 점 세 개(더보기) 버튼 */
  menuButton: {
    padding: 8,
  },

  /** ✅ 메뉴 모달 */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    width: 250,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalOption: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  modalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCancel: {
    marginTop: 10,
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#555',
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15,
  },
  statBox: {
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#888',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  memoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  memoryCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#4D7CFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  memoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 8,
    flex: 1,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4D7CFE',
  },
  activeTabText: {
    color: '#4D7CFE',
    fontWeight: 'bold',
  },
  tabText: {
    color: 'gray',
  },
  photoContainer: {
    flex: 1,
    margin: 2,
    aspectRatio: 1, // 정사각형 유지
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  tabContentWrapper: {
    marginTop: 8,
    paddingBottom: 300, // 📌 탭 아래 여백
  },
});

export default OwnerInfo;
