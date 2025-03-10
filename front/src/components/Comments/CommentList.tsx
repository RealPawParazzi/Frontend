import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import commentStore from '../../context/commentStore';
import CommentCard from './CommentCard'; // ✅ 개별 댓글 카드 컴포넌트

interface CommentListProps {
    boardId: number;
}

/** ✅ 댓글 목록 컴포넌트 */
const CommentList = ({ boardId }: CommentListProps) => {
    const { comments, fetchCommentsByBoard } = commentStore();

    useEffect(() => {
        fetchCommentsByBoard(boardId);
    }, [boardId, fetchCommentsByBoard]);

    return (
        <View style={styles.container}>
            <FlatList
                data={comments[boardId] || []}
                keyExtractor={(item) => item.commentId.toString()}
                renderItem={({ item }) => <CommentCard comment={item} boardId={boardId} />}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 10, paddingTop: 5 },
    listContainer: { paddingBottom: 20 },
});

export default CommentList;
