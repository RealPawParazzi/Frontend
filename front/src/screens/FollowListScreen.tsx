// FollowListScreen.tsx
import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, Image, StyleSheet, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import followStore from '../context/followStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const FollowListScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { type, userId, userName } = route.params as {
        type: 'followers' | 'following';
        userId: number;
        userName: string;
    };
    const { followers, following, fetchFollowers, fetchFollowing } = followStore();
    const [selectedSegment, setSelectedSegment] = useState(type === 'followers' ? 0 : 1);
    const [followList, setFollowList] = useState([]);

    useEffect(() => {
        if (selectedSegment === 0) {
            fetchFollowers(userId);
            setFollowList(followStore.getState().followers);
        } else {
            fetchFollowing(userId);
            setFollowList(followStore.getState().following);
        }
    }, [selectedSegment, fetchFollowers, fetchFollowing, userId]);


    return (
        <SafeAreaView style={styles.container}>
            {/* 🔙 뒤로가기 & 중앙 유저 닉네임 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back-ios" size={20} color="#000" />
                </TouchableOpacity>
                <Text style={styles.username}>{userName}</Text>
                <View style={styles.placeholder} /> {/* 중앙 정렬을 위한 빈 뷰 */}
            </View>

            {/* 📌 세그먼트 컨트롤 (팔로워 / 팔로잉) */}
            <SegmentedControl
                values={['팔로워', '팔로잉']}
                selectedIndex={selectedSegment}
                onChange={(event) => setSelectedSegment(event.nativeEvent.selectedSegmentIndex)}
                style={styles.segmentedControl}
            />

            {/* 📋 팔로워/팔로잉 리스트 */}
            {followList.length > 0 ? (
                <FlatList
                    data={followList}
                    keyExtractor={(item) => selectedSegment === 0 ? item.followerNickName : item.followingNickName}
                    renderItem={({ item }) => (
                        <View style={styles.userItem}>
                            <Image
                                source={{
                                    uri: selectedSegment === 0
                                        ? item.followerProfileImageUrl || 'https://via.placeholder.com/50'
                                        : item.followingProfileImageUrl || 'https://via.placeholder.com/50',
                                }}
                                style={styles.profileImage}
                            />
                            <Text style={styles.usernameText}>
                                {selectedSegment === 0 ? item.followerNickName : item.followingNickName}
                            </Text>
                        </View>
                    )}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Image
                        source={require('../assets/images/profile-1.png')} // 빈 상태 아이콘 (적절한 이미지 추가)
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
    placeholder: { width: 30 }, // 중앙 정렬 유지용 빈 뷰

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

