import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, Image, StyleSheet,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import followStore, { Follower, Following } from '../context/followStore';

const FollowListScreen = () => {
    const route = useRoute();
    const { type, nickName } = route.params as { type: 'followers' | 'following', nickName: string };
    const { followers, following, fetchFollowers, fetchFollowing } = followStore();

    // ✅ type에 따라 명확한 타입 지정 (followers 또는 following 중 하나)
    const [followList, setFollowList] = useState<Follower[] | Following[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (type === 'followers') {
                await fetchFollowers(nickName);
                setFollowList([...followStore.getState().followers] as Follower[]);
            } else {
                await fetchFollowing(nickName);
                setFollowList([...followStore.getState().following] as Following[]);
            }
        };
        fetchData();
    }, [type, nickName, fetchFollowers, fetchFollowing]);

    // ✅ 타입 가드 함수 (Follower와 Following 구분)
    const isFollower = (item: Follower | Following): item is Follower => {
        return (item as Follower).followerNickName !== undefined;
    };

    return (
        <View style={styles.container}>
            {/* 상단 네비게이션 */}
            <View style={styles.navBar}>
                <Text style={styles.title}>{type === 'followers' ? '팔로워' : '팔로잉'}</Text>
            </View>

            {/* 팔로워/팔로잉 목록 */}
            {followList.length > 0 ? (
                <FlatList<Follower | Following>
                    data={followList}
                    keyExtractor={(item) =>
                        isFollower(item) ? item.followerNickName : item.followingNickName
                    }
                    renderItem={({ item }) => (
                        <View style={styles.userItem}>
                            <Image
                                source={{
                                    uri: isFollower(item)
                                        ? item.followerProfileImageUrl || 'https://via.placeholder.com/50'
                                        : item.followingProfileImageUrl || 'https://via.placeholder.com/50',
                                }}
                                style={styles.profileImage}
                            />
                            <Text style={styles.username}>
                                {isFollower(item) ? item.followerNickName : item.followingNickName}
                            </Text>
                        </View>
                    )}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        {type === 'followers' ? '회원님을 팔로우한 사용자가 없습니다. 😢' : '팔로잉한 사용자가 없습니다. 😢'}
                    </Text>
                </View>
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF', padding: 20 },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    title: { fontSize: 18, fontWeight: 'bold' },
    userItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
    username: { fontSize: 16 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 16, color: '#888' },
});

export default FollowListScreen;
