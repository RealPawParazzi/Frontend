import React, { useState, useEffect } from 'react';
import {
    View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Alert,
    SafeAreaView, ActivityIndicator, ActionSheetIOS, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import boardStore from '../context/boardStore'; // ✅ 좋아요 상태 전역 관리
import CommentList from '../components/Comments/CommentList'; // ✅ 댓글 목록 컴포넌트
import CommentInput from '../components/Comments/CommentInput'; // ✅ 댓글 입력 바 컴포넌트
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
/**
 * 📄 스토리북 상세 조회 화면
 */

// 📌 네비게이션 타입 지정
type StorybookDetailScreenRouteProp = RouteProp<RootStackParamList, 'StorybookDetailScreen'>;

const StorybookDetailScreen = ({ route, navigation }: { route: StorybookDetailScreenRouteProp, navigation: any }) => {
    const { boardId } = route.params;

    // ✅ Zustand에서 게시글 데이터 불러오기
    const fetchBoardDetail = boardStore((state) => state.fetchBoardDetail);
    const deleteExistingBoard = boardStore((state) => state.deleteExistingBoard);
    const selectedBoard = boardStore((state) => state.selectedBoard);

    // ✅ Zustand에서 좋아요 상태 불러오기
    const toggleBoardLike = boardStore((state) => state.toggleBoardLike);
    const fetchBoardLikes = boardStore((state) => state.fetchBoardLikes);

    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);



    const [loading, setLoading] = useState(true);

    // ✅ 게시글 상세 데이터 불러오기
    useEffect(() => {
        const loadPost = async () => {
            try {
                await fetchBoardDetail(boardId);
                await fetchBoardLikes(boardId);
            } catch (error) {
                Alert.alert('❌ 오류', '게시글을 불러오는 중 문제가 발생했습니다.');
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };
        loadPost();
    }, [boardId, fetchBoardDetail, fetchBoardLikes, navigation]);

    useEffect(() => {
        if (selectedBoard) {
            setIsLiked(selectedBoard?.likedMembers?.some((member: { id: number }) => member.id === 1) || false);
            setLikeCount(selectedBoard?.favoriteCount || 0);
        }
    }, [selectedBoard]);


    // ✅ 게시글 삭제 함수
    const handleDeletePost = async () => {
        Alert.alert('삭제 확인', '정말 게시글을 삭제하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            {
                text: '삭제',
                onPress: async () => {
                    try {
                        await deleteExistingBoard(boardId);
                        Alert.alert('✅ 삭제 완료', '게시글이 삭제되었습니다.');
                        navigation.goBack();
                    } catch (error) {
                        Alert.alert('❌ 오류', '게시글 삭제 중 문제가 발생했습니다.');
                    }
                },
                style: 'destructive',
            },
        ]);
    };

    // ✅ 햄버거 메뉴 클릭 시 실행되는 Action Sheet
    const openActionSheet = () => {
        if (!navigation) {
            Alert.alert('❌ 오류', '네비게이션을 사용할 수 없습니다.');
            return;
        }

        if (!boardId) {
            Alert.alert('❌ 오류', '게시글 ID를 불러오는 중 문제가 발생했습니다.');
            return;
        }

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['수정하기 ✏️', '삭제하기 ❌', '취소'],
                    destructiveButtonIndex: 1,
                    cancelButtonIndex: 2,
                },
                (buttonIndex) => {
                    if (buttonIndex === 0) {
                        console.log('🔄 이동 중: EditStorybookScreen, boardId:', boardId);
                        navigation.navigate('EditStorybookScreen', { boardId });
                    } else if (buttonIndex === 1) {
                        handleDeletePost();
                    }
                }
            );
        } else {
            // 📌 Android에서는 Alert 사용
            Alert.alert('게시글 관리', '수정 또는 삭제할 수 있습니다.', [
                { text: '수정하기', onPress: () => {
                        console.log('🔄 이동 중: EditStorybookScreen, boardId:', boardId);
                        navigation.navigate('EditStorybookScreen', { boardId });
                    }},
                { text: '삭제하기', onPress: handleDeletePost, style: 'destructive' },
                { text: '취소', style: 'cancel' },
            ]);
        }
    };

    /**
     * ✅ 게시글 좋아요 토글 함수
     */
    const handleToggleLike = async () => {
        try {
            // ✅ 1. UI 즉시 변경 (사용자가 하트 누른 것 반영)
            const newLikedState = !isLiked;
            setIsLiked(newLikedState);
            setLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1));

            // ✅ 2. 서버에 좋아요 요청
            await toggleBoardLike(boardId);

            // ✅ 3. 최신 좋아요 상태 불러오기
            const updatedBoard = await fetchBoardLikes(boardId);

            // ✅ 4. 서버에서 받아온 최신 데이터로 UI 동기화
            if (updatedBoard) {
                setIsLiked(updatedBoard.likedMembers?.some((member: { id: number }) => member.id === 1) || false);
                setLikeCount(updatedBoard.likesCount || 0);
            }
        } catch (error) {
            Alert.alert('❌ 오류', '좋아요 처리 중 문제가 발생했습니다.');
            setIsLiked((prev) => !prev);
            setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
        }
    };





    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#FF6F00" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeContainer}>
            {/* 키보드가 올라오면 자동으로 입력 바 위치 조정 */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* 키보드 바깥을 클릭하면 키보드 닫힘 */}
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ flex: 1 }}>
                        {/* 상단 네비게이션 바 */}
                        <View style={styles.navBar}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <MaterialIcons name="arrow-back-ios" size={24} color="#333" />
                            </TouchableOpacity>

                            <Text style={styles.navTitle}>
                                {new Date(selectedBoard.writeDatetime).toLocaleDateString('ko-KR')}
                            </Text>

                            {/* 햄버거 메뉴 (수정/삭제) */}
                            <TouchableOpacity onPress={openActionSheet}>
                                <MaterialIcons name="more-vert" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {/* 본문 스크롤뷰 */}
                        <ScrollView style={styles.contentContainer}>
                            {/* 작성자 정보 */}
                            <View style={styles.authorContainer}>
                                <Image source={{ uri: selectedBoard.author.profileImageUrl }} style={styles.authorImage} />
                                <View>
                                    <Text style={styles.authorName}>{selectedBoard.author.nickname}</Text>
                                    <Text style={styles.postDate}>{selectedBoard.writeDatetime}</Text>
                                </View>
                            </View>

                            {/* 제목 */}
                            <Text style={styles.title}>{selectedBoard.title}</Text>

                            {/* 게시글 컨텐츠 */}
                            {selectedBoard.contents.map((content: { type: string; value: string }, index: number) =>
                                content.type === 'text' ? (
                                    <Text key={index} style={styles.postText}>{content.value}</Text>
                                ) : (
                                    <Image
                                        key={index}
                                        source={{ uri: content.value.startsWith('file://') ? content.value : `file://${content.value}` }}
                                        style={styles.postImage}
                                    />
                                )
                            )}

                            {/* ✅ 좋아요 & 댓글 수 표시 */}
                            <View style={styles.bottomBar}>
                                <TouchableOpacity onPress={handleToggleLike} style={styles.bottomIcon}>
                                    <MaterialIcons
                                        name={isLiked ? 'favorite' : 'favorite-border'}
                                        size={24}
                                        color={isLiked ? 'red' : 'black'}
                                    />
                                    <Text style={styles.bottomText}>{likeCount}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.bottomIcon}>
                                    <MaterialIcons name="chat-bubble-outline" size={24} color="black" />
                                    <Text style={styles.bottomText}>{selectedBoard.commentCount}</Text>
                                </TouchableOpacity>
                            </View>

                            {/* 댓글 목록 */}
                            <CommentList boardId={boardId} />
                        </ScrollView>
                    </View>
                </TouchableWithoutFeedback>

                {/* 🔥 댓글 입력 바 - 하단에 고정 */}
                <View style={styles.commentInputContainer}>
                    <CommentInput boardId={boardId} />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};


// ✅ 스타일 정의
const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: '#FFF' },

    /* 🔺 상단 네비게이션 바 */
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderColor: '#EEE',
    },
    backButton: { padding: 8 },
    navTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', flex: 1 },

    /* 🔺 작성자 정보 */
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    authorImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    authorName: { fontSize: 16, fontWeight: 'bold' },
    postDate: { fontSize: 12, color: '#777' },

    /* 🔺 본문 */
    contentContainer: { flex: 1, paddingHorizontal: 15 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
    postText: { fontSize: 16, lineHeight: 24, marginBottom: 10 },
    postImage: { width: '100%', height: 250, borderRadius: 10, marginBottom: 10 },

    /* 🔺 하단 네비게이션 바 */
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderColor: '#EEE',
    },
    bottomIcon: { flexDirection: 'row', alignItems: 'center' },
    bottomText: { fontSize: 16, marginLeft: 5 },

    /* 🔺 로딩 화면 */
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    /* 🔥 댓글 입력 바를 하단에 고정 */
    commentInputContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: '#EEE',
    },

});

export default StorybookDetailScreen;
