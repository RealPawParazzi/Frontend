import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ActionSheetIOS, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import commentStore from '../../context/commentStore';

interface CommentCardProps {
    comment: {
        commentId: number;
        content: string;
        likeCount: number;
        createdAt: string;
        commentMember: {
            memberId: number;
            nickname: string;
            profileImageUrl: string | null;
        };
    };
}

/** ✅ 개별 댓글 카드 컴포넌트 */
const CommentCard = ({ comment }: CommentCardProps) => {
    const { removeComment, toggleLikeOnComment } = commentStore();
    const [liked, setLiked] = useState(false);

    // ✅ 댓글 삭제 핸들러
    const handleDelete = async () => {
        Alert.alert('삭제 확인', '정말 댓글을 삭제하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            {
                text: '삭제',
                onPress: async () => {
                    try {
                        await removeComment(comment.commentId);
                        Alert.alert('✅ 삭제 완료', '댓글이 삭제되었습니다.');
                    } catch (error) {
                        Alert.alert('❌ 오류', '댓글 삭제 중 문제가 발생했습니다.');
                    }
                },
                style: 'destructive',
            },
        ]);
    };

    // ✅ 옵션 메뉴 (수정/삭제)
    const openActionSheet = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['수정하기 ✏️', '삭제하기 ❌', '취소'],
                    destructiveButtonIndex: 1,
                    cancelButtonIndex: 2,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) {
                        handleDelete();
                    }
                }
            );
        } else {
            Alert.alert('댓글 관리', '수정 또는 삭제할 수 있습니다.', [
                { text: '삭제하기', onPress: handleDelete, style: 'destructive' },
                { text: '취소', style: 'cancel' },
            ]);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {/* 작성자 프로필 이미지 */}
                <Image
                    source={comment.commentMember.profileImageUrl ? { uri: comment.commentMember.profileImageUrl } : require('../../assets/images/profile-1.png')}
                    style={styles.profileImage}
                />
                <View style={styles.info}>
                    <Text style={styles.nickname}>{comment.commentMember.nickname}</Text>
                    <Text style={styles.date}>{comment.createdAt}</Text>
                </View>

                {/* 옵션 메뉴 (햄버거 아이콘) */}
                <TouchableOpacity onPress={openActionSheet} style={styles.moreIcon}>
                    <MaterialIcons name="more-vert" size={20} color="#555" />
                </TouchableOpacity>
            </View>

            {/* 댓글 내용 */}
            <Text style={styles.content}>{comment.content}</Text>

            {/* 좋아요 & 대댓글 버튼 */}
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.actionButton}>
                    <MaterialIcons name={liked ? 'favorite' : 'favorite-border'} size={18} color={liked ? 'red' : 'black'} />
                    <Text style={styles.actionText}>{liked ? comment.likeCount + 1 : comment.likeCount}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <MaterialIcons name="chat-bubble-outline" size={18} color="black" />
                    <Text style={styles.actionText}>대댓글</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#EEE',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    info: {
        flex: 1,
    },
    nickname: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 12,
        color: '#777',
    },
    moreIcon: {
        padding: 5,
    },
    content: {
        fontSize: 14,
        marginVertical: 5,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingVertical: 5,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    actionText: {
        fontSize: 14,
        marginLeft: 5,
    },
});

export default CommentCard;
