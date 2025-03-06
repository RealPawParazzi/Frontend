import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import commentStore from '../../context/commentStore';

interface CommentInputProps {
    boardId: number;
}

/** ✅ 댓글 입력 바 (항상 화면 하단에 고정) */
const CommentInput = ({ boardId }: CommentInputProps) => {
    const { addComment } = commentStore();
    const [commentText, setCommentText] = useState('');

    const handleSendComment = async () => {
        if (!commentText.trim()) { return; }
        try {
            await addComment(boardId, commentText);
            setCommentText(''); // ✅ 입력 후 초기화
        } catch (error) {
            console.error('❌ 댓글 작성 실패:', error);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            style={styles.container}
        >
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    placeholder="댓글을 입력해주세요"
                    value={commentText}
                    onChangeText={setCommentText}
                />
                <TouchableOpacity onPress={handleSendComment} style={styles.sendButton}>
                    <MaterialIcons name="send" size={24} color={commentText ? "#FF6F00" : "gray"} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#FFF',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderColor: '#EEE',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    input: {
        flex: 1,
        fontSize: 16,
        padding: 10,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
    },
    sendButton: {
        marginLeft: 10,
        padding: 8,
    },
});

export default CommentInput;
