
// ✅ StoryBooksList.tsx
import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import boardStore from '../../../context/boardStore';
import userStore from '../../../context/userStore';
import followStore from '../../../context/userFollowStore';
import StoryBookCard from './StoryBookCard';

const StoryBooksList = () => {
    const { boardList } = boardStore();
    const { userData } = userStore();
    const { following, fetchFollowing } = followStore();

    // ✅ 로그인한 유저가 팔로우한 목록 가져오기
    useEffect(() => {
        if (userData?.id) {
            fetchFollowing(Number(userData.id));
        }
    }, [fetchFollowing, userData.id]);

    // 🔎 기본 더미 제거
    const validBoards = boardList.filter((b) => b.id !== 0);

    // 🧠 following 배열은 followingId를 갖고 있음
    const followingIds = following.map((user) => user.followingId);

    // ✅ 필터링된 게시글만 렌더링
    const filteredBoards = validBoards.filter((b) =>
        followingIds.includes(b.author.id)
    );


    return (
        <View style={styles.container}>
            {filteredBoards.length > 0 ? (
                <FlatList
                    data={filteredBoards}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <StoryBookCard story={item} />}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                />
            ) : (
                <Text style={styles.emptyText}>팔로우한 유저의 게시글이 없습니다.</Text>
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 14,
        color: 'gray',
    },
});

export default StoryBooksList;

