// FollowListScreen.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import userStore from '../../context/userStore';
import userFollowStore, {
  Follower,
  Following,
} from '../../context/userFollowStore';
import profileFollowStore from '../../context/profileFollowStore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {getImageSource} from '../../utils/imageUtils';
import MiniProfileModal from '../../components/MiniProfileModal';

// FlatList 항목을 위한 유니온 타입 정의
type FollowListItem = Follower | Following;

// ✅ 기본 프로필 이미지
const DEFAULT_PROFILE_IMAGE = require('../../assets/images/user-2.png');

const FollowListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {type, userId, userName} = route.params as {
    type: 'followers' | 'following';
    userId: number;
    userName: string;
  };

  const {
    fetchFollowers: fetchUserFollowers,
    fetchFollowing: fetchUserFollowing,
    followers: userFollowers,
    following: userFollowing,
  } = userFollowStore();

  const {followers, following, fetchProfileFollowers, fetchProfileFollowing} =
    profileFollowStore();

  const {userData} = userStore();

  const [selectedSegment, setSelectedSegment] = useState(
    type === 'followers' ? 0 : 1,
  );

  const [followerList, setFollowerList] = useState<Follower[]>([]);
  const [followingList, setFollowingList] = useState<Following[]>([]);

  // 💬 미니모달 상태 및 유저 정보 저장
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    name: string | null;
    nickName: string;
    profileImage: string;
  } | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedSegment === 0) {
        if (userId === Number(userData.id)) {
          await fetchUserFollowers(userId);
          setFollowerList(userFollowStore.getState().followers);
        } else {
          await fetchProfileFollowers(userId);
          setFollowerList(profileFollowStore.getState().followers);
        }
      } else {
        if (userId === Number(userData.id)) {
          await fetchUserFollowing(userId);
          setFollowingList(userFollowStore.getState().following);
        } else {
          await fetchProfileFollowing(userId);
          setFollowingList(profileFollowStore.getState().following);
        }
      }
    };
    fetchData();
  }, [
    selectedSegment,
    userId,
    userData.id,
    fetchUserFollowers,
    fetchProfileFollowers,
    fetchUserFollowing,
    fetchProfileFollowing,
  ]);

  // ✅ 리스트가 비어있는지 확인
  const isListEmpty =
    selectedSegment === 0
      ? followerList.length === 0
      : followingList.length === 0;

  // ✅ 각 항목의 고유 키 설정
  const getItemKey = (item: FollowListItem): string => {
    if ('followerId' in item) {
      return `follower-${item.followerId}`;
    } else {
      return `following-${item.followingId}`;
    }
  };

  // ✅ FlatList 항목 렌더링 + 모달 오픈 기능 추가
  const renderItem = ({item}: {item: FollowListItem}) => {
    if ('followerId' in item) {
      return (
        <TouchableOpacity
          style={styles.userItem}
          onPress={() => {
            setSelectedUser({
              id: item.followerId,
              name: item.followerName,
              nickName: item.followerNickName,
              profileImage: item.followerProfileImageUrl || '',
            });
            setIsModalVisible(true); // ✅ 미니모달 열기
          }}>
          <Image
            source={getImageSource(
              item.followerProfileImageUrl,
              DEFAULT_PROFILE_IMAGE,
            )}
            style={styles.profileImage}
          />
          <Text style={styles.usernameText}>{item.followerNickName}</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.userItem}
          onPress={() => {
            setSelectedUser({
              id: item.followingId,
              name: item.followingNickName,
              nickName: item.followingNickName,
              profileImage: item.followingProfileImageUrl || '',
            });
            setIsModalVisible(true); // ✅ 미니모달 열기
          }}>
          <Image
            source={getImageSource(
              item.followingProfileImageUrl,
              DEFAULT_PROFILE_IMAGE,
            )}
            style={styles.profileImage}
          />
          <Text style={styles.usernameText}>{item.followingNickName}</Text>
        </TouchableOpacity>
      );
    }
  };

  // ✅ 헤더 텍스트 지정
  const getHeaderTitle = () => {
    return selectedSegment === 0
      ? `${userName || ''}님의 팔로워`
      : `${userName || ''}님의 팔로잉`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔙 뒤로가기 & 중앙 유저 닉네임 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back-ios" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.username}>{getHeaderTitle()}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 📌 세그먼트 컨트롤 (팔로워 / 팔로잉) */}
      <SegmentedControl
        values={['팔로워', '팔로잉']}
        selectedIndex={selectedSegment}
        onChange={event =>
          setSelectedSegment(event.nativeEvent.selectedSegmentIndex)
        }
        style={styles.segmentedControl}
      />

      {/* 📋 팔로워/팔로잉 리스트 */}
      {!isListEmpty ? (
        <FlatList
          data={selectedSegment === 0 ? followerList : followingList}
          keyExtractor={getItemKey}
          renderItem={renderItem}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon
            name="group-off"
            size={60}
            color="#bbb"
            style={{marginBottom: 20}}
          />

          <Text style={styles.emptyText}>
            {selectedSegment === 0
              ? '회원님을 팔로우한 사용자가 없습니다. 😢'
              : '팔로우한 사용자가 없습니다. 😢'}
          </Text>
          <TouchableOpacity
            style={styles.recommendButton}
            onPress={() => navigation.navigate('Home')} // ✅ 홈으로 이동
          >
            <Text style={styles.recommendText}>팔로우 추천 보러가기</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ✅ 미니 프로필 모달 */}
      {selectedUser && (
        <MiniProfileModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          user={selectedUser}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FFF'},

  /** 🔙 헤더 스타일 */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {padding: 5},
  username: {fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1},
  placeholder: {width: 30},

  /** 📌 세그먼트 컨트롤 */
  segmentedControl: {
    marginHorizontal: 20,
    marginVertical: 10,
  },

  /** 📋 유저 리스트 */
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  profileImage: {width: 50, height: 50, borderRadius: 25, marginRight: 10},
  usernameText: {fontSize: 16, fontWeight: '500'},

  /** 📌 팔로워/팔로잉 없음 */
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyImage: {width: 80, height: 80, marginBottom: 10},
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 10,
  },

  /** 🔵 팔로우 추천 버튼 */
  recommendButton: {
    borderWidth: 1,
    borderColor: '#4A90E2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recommendText: {fontSize: 14, color: '#4A90E2', fontWeight: 'bold'},
});

export default FollowListScreen;
