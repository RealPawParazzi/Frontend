import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import replyStore from '../../../context/replyStore';

interface ReplyInputProps {
    commentId: number; // 부모 댓글 ID
    onReplyAdded?: () => void; // 대댓글 추가 후 실행할 함수
}

/** ✅ 대댓글 입력 바 */
const ReplyInput = ({ commentId, onReplyAdded }: ReplyInputProps) => {
    const { addReply } = replyStore();
    const [replyText, setReplyText] = useState('');

    const handleSendReply = async () => {
        if (!replyText.trim()) { return; }
        try {
            await addReply(commentId, replyText);
            setReplyText(''); // ✅ 입력 후 초기화
            if (onReplyAdded) { onReplyAdded(); } // ✅ 대댓글 추가 후 실행할 함수 호출
        } catch (error) {
            console.error('❌ 대댓글 작성 실패:', error);
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
                    placeholder="대댓글을 입력하세요..."
                    placeholderTextColor="#999"
                    value={replyText}
                    onChangeText={setReplyText}
                />
                <TouchableOpacity onPress={handleSendReply} style={styles.sendButton}>
                    <MaterialIcons name="send" size={24} color={replyText ? '#4D7CFE' : 'gray'} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#FFF',
        paddingVertical: 20,
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

export default ReplyInput;
