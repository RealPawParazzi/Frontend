// ✅ StoryBooksList.tsx
import React, {useEffect, useState} from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import boardStore from '../../../context/boardStore';
import userStore from '../../../context/userStore';
import followStore from '../../../context/userFollowStore';
import StoryBookCard from './StoryBookCard';

const StoryBooksList = () => {
    const { boardList } = boardStore();
    const { userData } = userStore();
    const { following, fetchFollowing } = followStore();

    // ✅ 정렬 기준 추가: 'writeDatetime' 포함
    const [sortBy, setSortBy] = useState<'favoriteCount' | 'viewCount' | 'writeDatetime'>('favoriteCount');

    /**
     * ✅ 로그인한 유저의 팔로잉 목록 fetch (현재는 사용 안 하지만 추후 활용 가능)
     */
    useEffect(() => {
        if (userData?.id) {
            fetchFollowing(Number(userData.id));
        }
    }, [fetchFollowing, userData.id]);


    // ✅ 정렬 기준에 따라 정렬 방식 분기
    const sortBoards = (boards: typeof boardList) => {
        if (sortBy === 'writeDatetime') {
            return [...boards].sort(
                (a, b) => new Date(b.writeDatetime).getTime() - new Date(a.writeDatetime).getTime()
            );
        } else {
            return [...boards].sort((a, b) => b[sortBy] - a[sortBy]);
        }
    };

    // ✅ 필터링: 퍼블릭 게시글만
    const filteredSortedBoards = sortBoards(
        boardList.filter((b) => b.id !== 0 && b.visibility === 'PUBLIC')
    );

    return (
        <View style={styles.container}>
            {/* 🔘 좋아요순 / 조회수순 토글 버튼 */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        sortBy === 'favoriteCount' && styles.activeButton,
                    ]}
                    onPress={() => setSortBy('favoriteCount')}
                >
                    <Text style={sortBy === 'favoriteCount' ? styles.activeText : styles.inactiveText}>
                        ❤️ 좋아요순
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        sortBy === 'viewCount' && styles.activeButton,
                    ]}
                    onPress={() => setSortBy('viewCount')}
                >
                    <Text style={sortBy === 'viewCount' ? styles.activeText : styles.inactiveText}>
                        👀 조회수순
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        sortBy === 'writeDatetime' && styles.activeButton,
                    ]}
                    onPress={() => setSortBy('writeDatetime')}
                >
                    <Text style={sortBy === 'writeDatetime' ? styles.activeText : styles.inactiveText}>
                        🗓️ 최신순
                    </Text>
                </TouchableOpacity>
            </View>


            {/* ✅ 게시글 리스트 출력 */}
            {filteredSortedBoards.length > 0 ? (
                <FlatList
                    data={filteredSortedBoards}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <StoryBookCard story={item} />}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                />
            ) : (
                <Text style={styles.emptyText}> 게시글이 없습니다. </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
    },
    toggleButton: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 20,
        marginHorizontal: 5,
        backgroundColor: '#F0F0F0',
    },
    activeButton: {
        backgroundColor: '#4D7CFE',
    },
    activeText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    inactiveText: {
        color: '#444',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 14,
        color: 'gray',
    },
});


export default StoryBooksList;

