import React, {useEffect, useState} from 'react';
import {
  View,
  Image,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import userStore from '../../context/userStore';
import userFollowStore from '../../context/userFollowStore';
import {getImageSource} from '../../utils/imageUtils';
import ShadowWrapper from '../../common/ShadowWrapper';
import MiniProfileModal from '../MiniProfileModal';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DEFAULT_PROFILE_IMAGE = require('../../assets/images/user-2.png');

/** ✅ 유저 타입 정의 */
interface User {
  id: string;
  name: string | null;
  nickName: string | null;
  profileImage: string | null;
}

/**
 * 📌 FollowRecommendations 컴포넌트
 * - Zustand에서 가져온 팔로우 추천 리스트 표시
 * - 각 유저 옆에 "+ 팔로우" 버튼 추가
 */
const FollowRecommendations = () => {
  const {followRecommendations, loadFollowRecommendations, userData} =
    userStore();
  const {following, fetchFollowing, followUser, unfollowUser} =
    userFollowStore();

  const [selectedUser, setSelectedUser] = useState<User | null>(null); // 모달에서 보여줄 유저
  const [isModalVisible, setIsModalVisible] = useState(false); // 모달 표시 여부

  // ✅ 컴포넌트 마운트 시 추천 목록 + 내 팔로잉 목록 불러오기
  useEffect(() => {
    loadFollowRecommendations();
    fetchFollowing(Number(userData.id));
  }, [loadFollowRecommendations, fetchFollowing, userData.id]);

  // ✅ 특정 유저가 팔로잉 중인지 판단
  const isUserFollowing = (targetId: number) => {
    return following.some(f => f.followingId === targetId);
  };

  // ✅ 팔로우 토글
  const handleFollowToggle = async (targetId: number) => {
    if (isUserFollowing(targetId)) {
      await unfollowUser(targetId);
    } else {
      await followUser(targetId);
    }
  };

  // ✅ 본인만 제외
  const filteredRecommendations = followRecommendations.filter(
    user => Number(user.id) !== Number(userData.id), // 👉 본인 제외
  );

  useEffect(() => {
    if (selectedUser) {
      console.log('🧠 selectedUser가 바뀜:', selectedUser);
    }
  }, [selectedUser]);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Icon
          name="group-add"
          size={20}
          color="#999"
          style={{marginRight: 6}}
        />
        <Text style={styles.sectionTitle}> 팔로우 추천 </Text>
      </View>
      <FlatList
        data={filteredRecommendations}
        horizontal
        keyExtractor={item => {
          console.log('🧩 keyExtractor item:', item);
          console.log('🧠 selectedUser가 바뀜:', selectedUser);
          return item?.id?.toString?.() ?? 'unknown';
        }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: 10}}
        renderItem={({item}) => {
          console.log('🧩 renderItem item:', item);
          return (
            <ShadowWrapper style={styles.cardWrapper}>
              <View style={styles.card}>
                <TouchableOpacity
                  style={styles.closeIconArea}
                  onPress={() => {}}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedUser({
                      id: item.id,
                      name: item.name,
                      nickName: item.nickName, // 닉네임도 달라고 하기
                      profileImage: item.profileImage.uri,
                    });
                    setIsModalVisible(true);
                  }}>
                  <Image
                    source={getImageSource(
                      item.profileImage,
                      DEFAULT_PROFILE_IMAGE,
                    )}
                    style={styles.profileImage}
                  />
                </TouchableOpacity>
                <Text style={styles.nameText}>{item.nickName}</Text>
                <TouchableOpacity
                  style={[
                    styles.followButton,
                    isUserFollowing(Number(item.id)) && styles.unfollowButton, // 🔵 언팔로우 스타일 조건부 적용
                  ]}
                  onPress={() => handleFollowToggle(Number(item.id))}>
                  <Text
                    style={[
                      styles.followText,
                      isUserFollowing(Number(item.id)) && styles.unfollowText, // 🔵 텍스트 색상 변경
                    ]}>
                    {isUserFollowing(Number(item.id)) ? '언팔로우' : '팔로우'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ShadowWrapper>
          );
        }}
      />
      {selectedUser && (
        <MiniProfileModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          user={{
            id: Number(selectedUser.id),
            name: selectedUser.name,
            nickName: selectedUser.nickName,
            profileImage: selectedUser.profileImage || DEFAULT_PROFILE_IMAGE,
          }}
        />
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
  cardWrapper: {
    width: 150,
    height: 165,
    marginRight: 10,
    marginVertical: 10,
    borderRadius: 15,
    backgroundColor: '#fff',
  },
  card: {
    alignItems: 'center',
    padding: 10,
    position: 'relative',
    marginVertical: 15,
  },
  closeIconArea: {
    position: 'absolute',
    top: 5,
    right: 15,
    zIndex: 1,
  },
  closeText: {
    fontSize: 14,
    color: '#999',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#4D7CFE',
    marginBottom: 8,
  },
  nameText: {
    fontSize: 13.5,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  followButton: {
    backgroundColor: '#4D7CFE',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4D7CFE',
    alignItems: 'center',
    marginTop: 2,
  },

  unfollowButton: {
    backgroundColor: 'white',
  },

  followText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12.5,
  },

  unfollowText: {
    color: '#4D7CFE',
  },
});

export default FollowRecommendations;
