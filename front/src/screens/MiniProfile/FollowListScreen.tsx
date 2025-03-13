// FollowListScreen.tsx
import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, Image, StyleSheet, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import userStore from '../../context/userStore';
import userFollowStore, { Follower, Following } from '../../context/userFollowStore';
import profileFollowStore from '../../context/profileFollowStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

// FlatList 항목을 위한 유니온 타입 정의
type FollowListItem = Follower | Following;

const FollowListScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { type, userId, userName } = route.params as {
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

    const {
        followers,
        following,
        fetchProfileFollowers,
        fetchProfileFollowing,
    } = profileFollowStore();

    const { userData } = userStore();

    const [selectedSegment, setSelectedSegment] = useState(type === 'followers' ? 0 : 1);

    const [followerList, setFollowerList] = useState<Follower[]>([]);
    const [followingList, setFollowingList] = useState<Following[]>([]);


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
    }, [selectedSegment, userId, userData.id, fetchUserFollowers, fetchProfileFollowers, fetchUserFollowing, fetchProfileFollowing]);

    // 리스트가 비어있는지 확인하는 함수
    const isListEmpty = selectedSegment === 0
        ? followerList.length === 0
        : followingList.length === 0;

    // 각 항목에 대한 고유 키를 생성하는 함수
    const getItemKey = (item: FollowListItem): string => {
        if ('followerId' in item) {
            return `follower-${item.followerId}`;
        } else {
            return `following-${item.followingId}`;
        }
    };

    // 특정 항목을 렌더링하는 함수
    const renderItem = ({ item }: { item: FollowListItem }) => {
        if ('followerId' in item) {
            // 팔로워인 경우
            return (
                <View style={styles.userItem}>
                    <Image
                        source={{ uri: item.followerProfileImageUrl || 'https://via.placeholder.com/50' }}
                        style={styles.profileImage}
                    />
                    <Text style={styles.usernameText}>
                        {item.followerNickName}
                    </Text>
                </View>
            );
        } else {
            // 팔로잉인 경우
            return (
                <View style={styles.userItem}>
                    <Image
                        source={{ uri: item.followingProfileImageUrl || 'https://via.placeholder.com/50' }}
                        style={styles.profileImage}
                    />
                    <Text style={styles.usernameText}>
                        {item.followingNickName}
                    </Text>
                </View>
            );
        }
    };

    // 헤더 타이틀 생성
    const getHeaderTitle = () => {
        return selectedSegment === 0
            ? `${userName}님의 팔로워`
            : `${userName}님의 팔로잉`;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 🔙 뒤로가기 & 중앙 유저 닉네임 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back-ios" size={20} color="#000" />
                </TouchableOpacity>
                <Text style={styles.username}>{getHeaderTitle()}</Text>
                <View style={styles.placeholder} />
            </View>

            {/* 📌 세그먼트 컨트롤 (팔로워 / 팔로잉) */}
            <SegmentedControl
                values={['팔로워', '팔로잉']}
                selectedIndex={selectedSegment}
                onChange={(event) => setSelectedSegment(event.nativeEvent.selectedSegmentIndex)}
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
                    <Image
                        source={require('../../assets/images/profile-1.png')}
                        style={styles.emptyImage}
                    />
                    <Text style={styles.emptyText}>
                        {selectedSegment === 0 ? '회원님을 팔로우한 사용자가 없습니다. 😢' : '팔로우한 사용자가 없습니다. 😢'}
                    </Text>
                    <TouchableOpacity style={styles.recommendButton}>
                        <Text style={styles.recommendText}>팔로우 추천 보러가기</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },

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
    backButton: { padding: 5 },
    username: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1 },
    placeholder: { width: 30 },

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
    profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
    usernameText: { fontSize: 16, fontWeight: '500' },

    /** 📌 팔로워/팔로잉 없음 */
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyImage: { width: 80, height: 80, marginBottom: 10 },
    emptyText: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 10 },

    /** 🔵 팔로우 추천 버튼 */
    recommendButton: {
        borderWidth: 1,
        borderColor: '#4A90E2',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    recommendText: { fontSize: 14, color: '#4A90E2', fontWeight: 'bold' },
});

export default FollowListScreen;
