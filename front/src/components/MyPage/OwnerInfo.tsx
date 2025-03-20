import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import boardStore from '../../context/boardStore';
import userStore from '../../context/userStore';

const OwnerInfo = () => {
    const { userData } = userStore();
    const { boardList, fetchUserBoards } = boardStore();
    const [latestPostTime, setLatestPostTime] = useState('없음');

    useEffect(() => {
        fetchUserBoards(Number(userData.id));
    }, [fetchUserBoards, userData.id]);

    useEffect(() => {
        const userPosts = boardList
            .filter((post) => post.author.id === userData.id)
            .sort((a, b) => new Date(b.writeDatetime).getTime() - new Date(a.writeDatetime).getTime());

        setLatestPostTime(userPosts.length > 0 ? getRelativeTime(userPosts[0].writeDatetime) : '없음');
    }, [boardList, userData.id]);

    const getRelativeTime = (dateString: string) => {
        const postDate = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - postDate.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) { return '방금 전'; }
        if (diffMinutes < 60) { return `${diffMinutes}분 전`; }
        if (diffHours < 24) { return `${diffHours}시간 전`; }
        return `${diffDays}일 전`;
    };

    return (
        <View style={styles.container}>
            <Text>🏡 {userData.name} 집사님의 반려동물 일상을 공유하세요!</Text>
            <View style={styles.statsContainer}>
                <Text style={styles.statText}>📅 최근 게시물: {latestPostTime}</Text>
                <Text style={styles.statText}>🚶 오늘의 산책: 5km</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', marginVertical: 20 },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 30 },
    statText: { fontSize: 14, color: 'gray' },
});

export default OwnerInfo;
