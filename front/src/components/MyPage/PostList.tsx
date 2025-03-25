import React, {useEffect, useState} from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator'; // ✅ 스택 네비게이션 타입 가져오기
import boardStore from '../../context/boardStore';
import userStore from '../../context/userStore';
import PostCard from './PostCard'; // ✅ 분리한 PostCard 컴포넌트 추가

/** ✅ 네비게이션 타입 정의 */
type NavigationProp = StackNavigationProp<RootStackParamList, 'StorybookDetailScreen'>;


/** ✅ PostList 컴포넌트 */
const PostList = () => {
    const navigation = useNavigation<NavigationProp>(); // 🔵 네비게이션 훅 추가
    const { boardList, fetchUserBoards } = boardStore(); // 🟢 Zustand에서 게시글 목록 가져오기
    const { userData } = userStore(); // 🟢 현재 로그인한 유저 데이터 가져오기
    const [hasNoPosts, setHasNoPosts] = useState(false); // ✅ 게시글 상태 추적


    /** ✅ 컴포넌트 마운트 시 게시글 불러오기 */
    useEffect(() => {
        console.log('🟢 현재 로그인한 유저 데이터:', userData);

        if (userData.id) {
            fetchUserBoards(Number(userData.id)); // 🔵 현재 로그인한 유저의 게시글 목록 조회
        }
    }, [fetchUserBoards, userData, userData.id]);

    /** ✅ boardList 변경 감지 후 상태 업데이트 */
    useEffect(() => {
        setHasNoPosts(boardList.length === 1 && boardList[0].id === 0);

        // ✅ 게시글이 하나 남아있다가 삭제되면 즉시 상태 업데이트
        if (boardList.length === 0) {
            setTimeout(() => setHasNoPosts(true), 100);
        }
    }, [boardList]);


    return (
        <View style={styles.container}>
            {hasNoPosts ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.noPosts}>📭 게시글이 아직 없습니다!</Text>
                    <Text style={styles.suggestion}>첫 게시글을 업로드 해볼까요?</Text>

                    {/* 🔹 게시글 작성 화면으로 이동 */}
                    <TouchableOpacity style={styles.uploadButton} onPress={() => navigation.navigate('StorybookScreen')}>
                        <Text style={styles.uploadButtonText}>+ 새 게시글 작성</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={boardList}
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
        backgroundColor: '#6A4BBC',
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
