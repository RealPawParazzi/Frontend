import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator'; // ✅ 스택 네비게이션 타입 가져오기
import boardStore from '../../context/boardStore';
import userStore from '../../context/userStore';

/** ✅ 게시글 데이터 타입 */
interface Post {
    id: number;
    title: string;
    titleImage: string;
    writeDatetime: string;
}

/** ✅ 네비게이션 타입 정의 */
type NavigationProp = StackNavigationProp<RootStackParamList, 'StorybookDetailScreen'>;


/** ✅ PostList 컴포넌트 */
const PostList = () => {
    const navigation = useNavigation<NavigationProp>(); // 🔵 네비게이션 훅 추가
    const { boardList, fetchUserBoards } = boardStore(); // 🟢 Zustand에서 게시글 목록 가져오기
    const { userData } = userStore(); // 🟢 현재 로그인한 유저 데이터 가져오기

    /** ✅ 컴포넌트 마운트 시 게시글 불러오기 */
    useEffect(() => {
        console.log('🟢 현재 로그인한 유저 데이터:', userData);

        if (userData.id) {
            fetchUserBoards(Number(userData.id)); // 🔵 현재 로그인한 유저의 게시글 목록 조회
        }
    }, [fetchUserBoards, userData, userData.id]);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>📌 내 게시글 목록</Text>

            {boardList.length > 0 ? (
                <FlatList
                    data={boardList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.postContainer}
                            onPress={() => navigation.navigate('StorybookDetailScreen', { boardId: item.id })} // 🔵 클릭 시 상세 페이지 이동
                        >
                            <Image source={{ uri: item.titleImage }} style={styles.image} />
                            <View style={styles.textContainer}>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.date}>{item.writeDatetime.split('T')[0]}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => String(item.id)}
                />
            ) : (
                <Text style={styles.noPosts}>📭 게시글이 없습니다.</Text>
            )}
        </View>
    );
};

/** ✅ 스타일 정의 */
const styles = StyleSheet.create({
    container: { padding: 10 },
    header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    postContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
    image: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
    textContainer: { flex: 1 },
    title: { fontSize: 16, fontWeight: 'bold' },
    date: { fontSize: 14, color: 'gray' },
    noPosts: { textAlign: 'center', fontSize: 16, color: 'gray', marginTop: 20 },
});

export default PostList;
