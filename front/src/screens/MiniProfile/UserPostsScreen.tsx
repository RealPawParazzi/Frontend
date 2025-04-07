import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, Image, StyleSheet, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import boardStore, { Board } from '../../context/boardStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

// @ts-ignore
const UserPostsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userId, userName } = route.params as { userId: number; userName: string };

    const { userBoardsMap, fetchUserBoards } = boardStore();
    const [posts, setPosts] = useState<Board[]>([]);

    // ✅ 게시글 불러오기 (userId 변경 시마다)
    useEffect(() => {
        if (userId) {
            fetchUserBoards(userId);
        }
    }, [fetchUserBoards, userId]);

    // ✅ userBoardsMap 변경 시 게시글 업데이트
    useEffect(() => {
        setPosts(userBoardsMap[userId] || []);
    }, [userBoardsMap, userId]);

    /** 게시글 클릭 시 상세화면 이동 */
    const handlePostPress = (postId: number) => {
        // @ts-ignore
        navigation.navigate('StorybookDetailScreen', { boardId: postId });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 🔙 헤더: 뒤로가기 + 유저 닉네임 출력 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back-ios" size={20} color="#000" />
                </TouchableOpacity>
                <Text style={styles.username}>{userName}님의 게시글</Text>
                <View style={styles.placeholder} />
            </View>

            {/* 📌 게시글 개수 출력 */}
            <Text style={styles.postCount}>총 {posts.length}개</Text>


            {/* 📝 게시글 리스트 */}
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.postCard} onPress={() => handlePostPress(item.id)}>
                        <View style={styles.postContent}>
                            <Text style={styles.postTitle}>{item.title}</Text>
                            <Text style={styles.postDescription} numberOfLines={2}>{item.titleContent}</Text>
                            <View style={styles.metaInfo}>
                                <Text style={styles.metaText}>{item.author.nickname}</Text>
                                <Text style={styles.metaText}>좋아요 {item.favoriteCount} ・ 댓글 {item.commentCount}</Text>
                            </View>
                        </View>
                        {item.titleImage && (
                            <Image source={{ uri: item.titleImage }} style={styles.postImage} />
                        )}
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF', paddingBottom: 10 },

    /** 🔙 헤더 */
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

    /** 📌 게시글 개수 */
    postCount: {
        fontSize: 14,
        color: '#4A90E2',
        paddingHorizontal: 20,
        marginTop: 30,
    },

    /** 📝 게시글 카드 */
    postCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    postContent: {
        flex: 1,
        paddingRight: 10,
    },
    postTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    postDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    metaInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metaText: {
        fontSize: 12,
        color: '#888',
    },

    /** 🖼️ 게시글 썸네일 */
    postImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
});

export default UserPostsScreen;
