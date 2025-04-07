import React, {useEffect, useMemo, useState} from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator'; // ✅ 스택 네비게이션 타입 가져오기
import boardStore, { Board } from '../../context/boardStore'; // 🧠 타입 재사용
import PostCard from './PostCard';

/** ✅ 네비게이션 타입 정의 */
type NavigationProp = StackNavigationProp<RootStackParamList, 'StorybookDetailScreen'>;


/** ✅ Props 타입 정의 */
interface PostListProps {
    userId: number;
}

/** ✅ PostList 컴포넌트 */
const PostList = ({ userId }: PostListProps) => {
    const navigation = useNavigation<NavigationProp>();
    const { userBoardsMap, fetchUserBoards } = boardStore();

    const [hasNoPosts, setHasNoPosts] = useState(false);

    const myBoards: Board[] = useMemo(() => userBoardsMap[userId] || [], [userBoardsMap, userId]);

    useEffect(() => {
        if (userId) {
            fetchUserBoards(userId);
        }
    }, [fetchUserBoards, userId]);

    useEffect(() => {
        setHasNoPosts(myBoards.length === 0);
    }, [myBoards]);

    return (
        <View style={styles.container}>
            {hasNoPosts ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.noPosts}>📭 게시글이 아직 없습니다!</Text>
                    <Text style={styles.suggestion}>첫 게시글을 업로드 해볼까요?</Text>
                    <TouchableOpacity style={styles.uploadButton} onPress={() => navigation.navigate('StorybookScreen')}>
                        <Text style={styles.uploadButtonText}>+ 새 게시글 작성</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={myBoards}
                    renderItem={({ item }) => <PostCard post={item} />}
                    keyExtractor={(item) => String(item.id)}
                />
            )}
        </View>
    );
};

/** ✅ 스타일 */
const styles = StyleSheet.create({
    container: { padding: 10 },
    emptyContainer: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
    },
    noPosts: { fontSize: 18, fontWeight: 'bold', color: '#444', marginBottom: 5 },
    suggestion: { fontSize: 14, color: 'gray', marginBottom: 15 },

    uploadButton: {
        backgroundColor: '#4D7CFE',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    uploadButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
});


export default PostList;
