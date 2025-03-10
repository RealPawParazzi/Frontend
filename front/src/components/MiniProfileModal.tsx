import React, { useEffect, useState } from 'react';
import {
    View, Text, Image, Modal, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import followStore from '../context/followStore';
import boardStore from '../context/boardStore';

interface MiniProfileModalProps {
    visible: boolean;
    onClose: () => void;
    user: {
        id: number;
        name: string;
        profileImage: string;
    };
}

const MiniProfileModal = ({ visible, onClose, user }: MiniProfileModalProps) => {
    const navigation = useNavigation();
    const { followers, following, fetchFollowers, fetchFollowing, followUser, unfollowUser } = followStore();
    const { boardList, fetchUserBoards } = boardStore();
    const [isFollowing, setIsFollowing] = useState(false);
    const [postCount, setPostCount] = useState(0);

    /** ✅ 프로필 정보 불러오기 */
    useEffect(() => {
        if (visible) {
            fetchFollowers(user.id);
            fetchFollowing(user.id);
            fetchUserBoards(user.id);
        }
    }, [visible, user.id, fetchFollowers, fetchFollowing, fetchUserBoards]);

    /** ✅ 팔로잉 상태 & 게시물 개수 업데이트 */
    useEffect(() => {
        setIsFollowing(following.some((f) => f.followingNickName === user.name));
        setPostCount(boardList.length || 0);
    }, [following, boardList, user.name]);

    /** ✅ 팔로우/언팔로우 토글 */
    const handleFollowToggle = async () => {
        if (isFollowing) {
            await unfollowUser(user.id);
        } else {
            await followUser(user.id);
        }
        setIsFollowing(!isFollowing);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* 닫기 버튼 */}
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>

                    {/* 프로필 이미지 */}
                    <Image source={{ uri: user.profileImage }} style={styles.profileImage} />

                    {/* 닉네임 */}
                    <Text style={styles.username}>{user.name}</Text>

                    {/* 게시물 수, 팔로워, 팔로잉 */}
                    <View style={styles.statsContainer}>
                        <TouchableOpacity
                            style={styles.statBox}
                            onPress={() => navigation.navigate('UserPostsScreen', { userId: user.id })}
                        >
                            <Text style={styles.statNumber}>{postCount}</Text>
                            <Text style={styles.statText}>게시물</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.statBox}
                            onPress={() => navigation.navigate('FollowListScreen', { type: 'followers', userId: user.id })}
                        >
                            <Text style={styles.statNumber}>{followers.length || 0}</Text>
                            <Text style={styles.statText}>팔로워</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.statBox}
                            onPress={() => navigation.navigate('FollowListScreen', { type: 'following', userId: user.id })}
                        >
                            <Text style={styles.statNumber}>{following.length || 0}</Text>
                            <Text style={styles.statText}>팔로잉</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 팔로우 버튼 */}
                    <TouchableOpacity style={styles.followButton} onPress={handleFollowToggle}>
                        <Text style={styles.followText}>{isFollowing ? '언팔로우' : '팔로우'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: '#FFF',
        borderRadius: 12,
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 15,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 8,
    },
    closeText: {
        fontSize: 18,
        color: '#888',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
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
    followButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    followText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});

export default MiniProfileModal;
