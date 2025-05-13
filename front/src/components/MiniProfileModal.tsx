import React, { useEffect, useState } from 'react';
import {
    View, Text, Image, Modal, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import userFollowStore from '../context/userFollowStore';        // 현재 로그인 유저의 팔로우 상태
import profileFollowStore from '../context/profileFollowStore';  // 프로필 유저(B)의 팔로우 정보
import userStore from '../context/userStore';                    // 현재 로그인 유저 정보

// ✅ boardStore 완전 제거하고 아래 API만 사용
import { getBoardsByMember } from '../services/boardService';
import { getImageSource } from '../utils/imageUtils';

// ✅ 기본 프로필 이미지
const DEFAULT_PROFILE_IMAGE = require('../assets/images/profile-1.png');


interface MiniProfileModalProps {
    visible: boolean;
    onClose: () => void;
    user: {
        id: number;
        name: string;
        //nickName: string;
        profileImage: string;
    };
}

const MiniProfileModal = ({ visible, onClose, user }: MiniProfileModalProps) => {
    const navigation = useNavigation();
    const { following, fetchFollowing, followUser, unfollowUser } = userFollowStore();
    const {
        followers,
        following: profileFollowing,
        fetchProfileFollowers,
        fetchProfileFollowing,
        setFollowerCount,
        setFollowingCount,
        followerCount,
        followingCount,
    } = profileFollowStore();

    const { userData } = userStore();

    const [isFollowing, setIsFollowing] = useState(false);
    const [postCount, setPostCount] = useState(0); // ✅ 게시물 수 상태 (boardList 사용 안 함)


    /** ✅ 현재 프로필이 로그인한 유저의 프로필인지 확인 */
    const isOwnProfile = Number(userData.id) === user.id;

    /** ✅ 프로필 정보 불러오기 */
    useEffect(() => {
        if (visible) {
            // ✅ 게시물 수만 별도 fetch (스토어 안 건드림)
            getBoardsByMember(user.id)
                .then((userBoards) => {
                    setPostCount(userBoards.length);
                })
                .catch((error) => {
                    console.error('❌ 프로필 게시글 가져오기 실패:', error);
                    setPostCount(0); // fallback
                });

            // B(프로필 유저)의 팔로워 및 팔로잉 목록 가져오기
            fetchProfileFollowers(user.id); // ✅ B(프로필 유저)를 팔로우하는 사람들의 목록
            fetchProfileFollowing(user.id); // ✅ B(프로필 유저)가 팔로우하는 사람들의 목록

            // A(로그인 유저)가 B(프로필 유저)를 팔로우하는지 확인하기 위해 A의 팔로잉 목록 가져오기
            if (!isOwnProfile) {
                fetchFollowing(Number(userData.id)); // ✅ A(로그인 유저)가 팔로우하는 사람들의 목록
            }

        }

        console.log('현재 로그인 유저(A) = ', userData.id);
        console.log('프로필의 주인인 유저(B) = ', user.id);

    }, [visible, user.id, fetchFollowing, userData.id, isOwnProfile, fetchProfileFollowers, fetchProfileFollowing]);

    /** ✅ 팔로우 상태 & 게시물 개수 업데이트 */
    useEffect(() => {
        // 현재 로그인한 유저(A)가 프로필 유저(B)를 팔로우하고 있는지 확인
        if (!isOwnProfile) {
            const loggedInUserFollowing = following.filter(f => f.followingId === user.id);
            setIsFollowing(loggedInUserFollowing.length > 0);
        }

        // 팔로워/팔로잉 수 업데이트
        setFollowerCount(followers.length);
        setFollowingCount(profileFollowing.length);

    }, [following, followers, user.id, isOwnProfile, setFollowerCount, setFollowingCount, profileFollowing.length]);




    /** ✅ 팔로우/언팔로우 토글 */
    const handleFollowToggle = async () => {
        if (isOwnProfile) { return; } // 본인 프로필에서는 동작하지 않음

        try {
            if (isFollowing) {
                // ✅ A(현재 로그인 유저)가 B(프로필 유저)를 언팔로우
                const response = await unfollowUser(user.id);
                if (!response) {
                    console.error('❌ [언팔로우 실패]: 응답이 없습니다.');
                    return;
                }
                console.log('✅ [언팔로우 성공]', response);

                // ✅ 언팔로우 후 B(프로필 유저)의 팔로워 수 감소
                setFollowerCount(response.followerCount);

                // ✅ 언팔로우 상태 업데이트
                setIsFollowing(false);

            } else {
                // ✅ A(현재 로그인 유저)가 B(프로필 유저)를 팔로우
                const response = await followUser(user.id);
                if (!response) {
                    console.error('❌ [팔로우 실패]: 응답이 없습니다.');
                    return;
                }
                console.log('✅ [팔로우 성공]', response);

                // ✅ 팔로우 후 B(프로필 유저)의 팔로워 수 증가
                setFollowerCount(response.followerCount);

                // ✅ 팔로우 상태 업데이트
                setIsFollowing(true);
            }

            // ✅ 최신 팔로워/팔로잉 목록을 다시 불러와 UI를 동기화
            await fetchProfileFollowers(user.id); // B(프로필 유저)의 최신 팔로워 목록
            await fetchFollowing(Number(userData.id)); // A(로그인 유저)의 최신 팔로잉 목록

        } catch (error) {
            console.error('❌ [팔로우/언팔로우 오류]:', error);
        }
    };

    useEffect(() => {
        console.log('📸 user:', user);
        console.log('📸 profileImage value:', user.profileImage);
        console.log('📸 typeof profileImage:', typeof user.profileImage);
    }, [user, userData]);

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* 닫기 버튼 */}
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>

                    {/* 프로필 이미지 */}
                    <Image
                        source={getImageSource(user.profileImage, DEFAULT_PROFILE_IMAGE)}
                        style={styles.profileImage}
                    />

                    {/* 닉네임 */}
                    <Text style={styles.username}>{user.name}</Text>

                    {/* 게시물 수, 팔로워, 팔로잉 */}
                    <View style={styles.statsContainer}>
                        <TouchableOpacity
                            style={styles.statBox}
                            // @ts-ignore
                            onPress={() => navigation.navigate('UserPostsScreen', { userId: user.id, userName: user.name })}
                        >
                            <Text style={styles.statNumber}>{postCount}</Text>
                            <Text style={styles.statText}>게시물</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.statBox}
                            // @ts-ignore
                            onPress={() => navigation.navigate('FollowListScreen', { type: 'followers', userId: user.id, userName: user.name })}
                        >
                            <Text style={styles.statNumber}>{followerCount}</Text>
                            <Text style={styles.statText}>팔로워</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.statBox}
                            // @ts-ignore
                            onPress={() => navigation.navigate('FollowListScreen', { type: 'following', userId: user.id, userName: user.name })}
                        >
                            <Text style={styles.statNumber}>{followingCount}</Text>
                            <Text style={styles.statText}>팔로잉</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ✅ 본인 프로필일 경우 -> 닫기 버튼 */}
                    {isOwnProfile ? (
                        <TouchableOpacity style={styles.closeProfileButton} onPress={onClose}>
                            <Text style={styles.followText}>닫기</Text>
                        </TouchableOpacity>
                    ) : (
                        /* ✅ 다른 유저 프로필일 경우 -> 팔로우 버튼 */
                        <TouchableOpacity
                            style={[
                                styles.followButton,
                                isFollowing && styles.unfollowButton,
                            ]}
                            onPress={handleFollowToggle}
                        >
                            <Text
                                style={[
                                    styles.followText,
                                    isFollowing && styles.unfollowText,
                                ]}
                            >{isFollowing ? '언팔로우' : '팔로우'}</Text>
                        </TouchableOpacity>
                    )}
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
        backgroundColor: '#F0F0F0', // 이미지 로딩 중 배경색
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
        backgroundColor: '#4D7CFE',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#4D7CFE',
    },

    unfollowButton: {
        backgroundColor: 'white',
    },
    followText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 13,
    },
    unfollowText: {
        color: '#4D7CFE',
        fontWeight: 'bold',
        fontSize: 13,
    },
    closeProfileButton: { // 🛠 본인 프로필일 때 닫기 버튼 스타일 추가
        backgroundColor: '#888',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
});

export default MiniProfileModal;
