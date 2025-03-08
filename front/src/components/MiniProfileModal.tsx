import React, { useEffect, useState } from 'react';
import {
    View, Text, Image, Modal, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import followStore from '../context/followStore';

interface MiniProfileModalProps {
    visible: boolean;
    onClose: () => void;
    user: {
        id: string;
        name: string;
        profileImage: any;
        // postCount: number;
    };
}


const MiniProfileModal = ({ visible, onClose, user }: MiniProfileModalProps) => {
    const navigation = useNavigation();
    const { followers, following, fetchFollowers, fetchFollowing } = followStore();

    useEffect(() => {
        if (visible) {
            fetchFollowers(user.name);
            fetchFollowing(user.name);
        }
    }, [fetchFollowers, fetchFollowing, user.name, visible]);

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

                    {/* 게시글, 팔로워, 팔로잉 */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            {/*<Text style={styles.statNumber}>{user.postCount}</Text>*/}
                            <Text style={styles.statText}>게시글</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.statBox}
                            onPress={() => navigation.navigate('FollowListScreen', { type: 'followers', nickName: user.nickName })}
                        >
                            <Text style={styles.statNumber}>{followers.length}</Text>
                            <Text style={styles.statText}>팔로워</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.statBox}
                            onPress={() => navigation.navigate('FollowListScreen', { type: 'following', nickName: user.nickName })}
                        >
                            <Text style={styles.statNumber}>{following.length}</Text>
                            <Text style={styles.statText}>팔로잉</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 팔로우 버튼 */}
                    <TouchableOpacity style={styles.followButton}>
                        <Text style={styles.followText}>팔로우</Text>
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
