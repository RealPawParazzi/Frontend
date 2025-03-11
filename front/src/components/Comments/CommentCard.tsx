import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActionSheetIOS,
    Platform,
    TextInput,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import commentStore from '../../context/commentStore';
import replyStore from '../../context/replyStore'; // ✅ 대댓글 상태 추가
import ReplyCard from './Replys/ReplyCard'; // ✅ 대댓글 카드 추가
import ReplyInput from './Replys/ReplyInput'; // ✅ 대댓글 입력창 추가

interface CommentCardProps {
    comment: {
        commentId: number;
        content: string;
        likeCount: number;
        replyCount: number;
        createdAt: string;
        updatedAt: string;
        commentMember: {
            memberId: number;
            nickname: string;
            profileImageUrl: string | null;
        };
        likedMembers?: {
            memberId: number;
            nickname: string;
            profileImageUrl: string | null
        }[];
    };
    boardId: number; // 게시글 ID를 props로 받도록 추가
}

/** ✅ 개별 댓글 카드 컴포넌트 */
const CommentCard = ({ comment, boardId }: CommentCardProps) => {
    const {
        removeComment,
        editComment,
        toggleLikeOnComment,
        fetchCommentLikeDetails,
        isCommentLikedByMe,
    } = commentStore();
    const { replies, fetchRepliesByComment } = replyStore(); // ✅ 대댓글 기능 추가
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment.content);
    const [showReplyInput, setShowReplyInput] = useState(false); // ✅ 대댓글 입력창 토글
    const [showLikes, setShowLikes] = useState(false); // 좋아요 상세 목록 표시 여부

    // ✅ 대댓글 불러오기 (최초 렌더링 시)
    useEffect(() => {
        fetchRepliesByComment(comment.commentId);
    }, [comment.commentId, fetchRepliesByComment]);

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

    // ✅ 댓글 수정 저장 핸들러
    const handleSaveEdit = async () => {
        if (!editedText.trim()) { return; }
        try {
            await editComment(comment.commentId, editedText);
            setIsEditing(false);
        } catch (error) {
            Alert.alert('❌ 오류', '댓글 수정 중 문제가 발생했습니다.');
        }
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
                    if (buttonIndex === 0) {
                        setIsEditing(true);
                    } else if (buttonIndex === 1) {
                        handleDelete();
                    }
                }
            );
        } else {
            Alert.alert('댓글 관리', '수정 또는 삭제할 수 있습니다.', [
                { text: '수정하기', onPress: () => setIsEditing(true) },
                { text: '삭제하기', onPress: handleDelete, style: 'destructive' },
                { text: '취소', style: 'cancel' },
            ]);
        }
    };

    // ✅ 좋아요 버튼 핸들러
    const handleLikeToggle = async () => {
        try {
            await toggleLikeOnComment(comment.commentId, boardId);
        } catch (error) {
            Alert.alert('❌ 오류', '좋아요 처리 중 문제가 발생했습니다.');
        }
    };

    // ✅ 좋아요 상세 목록 표시 핸들러
    const handleShowLikes = async () => {
        if (comment.likeCount > 0) {
            try {
                await fetchCommentLikeDetails(comment.commentId, boardId);
                setShowLikes(!showLikes);
            } catch (error) {
                Alert.alert('❌ 오류', '좋아요 목록을 불러오는 중 문제가 발생했습니다.');
            }
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

            {/* ✅ 댓글 수정 중일 때 입력 필드 표시 */}
            {isEditing ? (
                <View style={styles.editContainer}>
                    <TextInput
                        style={styles.editInput}
                        value={editedText}
                        onChangeText={setEditedText}
                        autoFocus
                        placeholder="댓글을 수정하세요..."
                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity onPress={handleSaveEdit} style={styles.saveButton}>
                        <MaterialIcons name="check" size={18} color="white" />
                    </TouchableOpacity>
                </View>
            ) : (
                <Text style={styles.content}>{comment.content}</Text>
            )}



            {/* 좋아요 & 대댓글 버튼 */}
            <View style={styles.actions}>
                <TouchableOpacity onPress={handleLikeToggle} style={styles.actionButton}>
                    <MaterialIcons
                        name={isCommentLikedByMe[comment.commentId] ? 'favorite' : 'favorite-border'}
                        size={18}
                        color={isCommentLikedByMe[comment.commentId] ? 'red' : 'black'}
                    />
                    <TouchableOpacity onPress={handleShowLikes}>
                        <Text style={styles.actionText}>{comment.likeCount}</Text>
                    </TouchableOpacity>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowReplyInput(!showReplyInput)} style={styles.actionButton}>
                    <MaterialIcons name="chat-bubble-outline" size={18} color="black" />
                    <Text style={styles.actionText}>대댓글 {comment.replyCount > 0 ? `(${comment.replyCount})` : ''}</Text>
                </TouchableOpacity>
            </View>

            {/* 좋아요 누른 사용자 목록 */}
            {showLikes && comment.likedMembers && comment.likedMembers.length > 0 && (
                <View style={styles.likesContainer}>
                    <Text style={styles.likesTitle}>좋아요 {comment.likeCount}개</Text>
                    {comment.likedMembers.map((member) => (
                        <View key={member.memberId} style={styles.likedMember}>
                            <Image
                                source={member.profileImageUrl ? { uri: member.profileImageUrl } : require('../../assets/images/profile-1.png')}
                                style={styles.likedMemberImage}
                            />
                            <Text style={styles.likedMemberName}>{member.nickname}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* ✅ 대댓글 입력창 (토글 가능) */}
            {showReplyInput && <ReplyInput commentId={comment.commentId} onReplyAdded={() => setShowReplyInput(false)} />}

            {/* ✅ 대댓글 리스트 */}
            <View style={styles.replyContainer}>
                {replies[comment.commentId]?.map((reply) => (
                    <ReplyCard key={reply.replyId} reply={reply} commentId={comment.commentId} />
                ))}
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
        marginVertical: 30,
        marginHorizontal: 10,
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 30,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginTop: 20,
        marginBottom: 20,
    },
    editInput: {
        flex: 1,
        fontSize: 14,
        padding: 5,
        color: '#333',
    },
    saveButton: {
        marginLeft: 10,
        backgroundColor: 'rgba(51,51,51,0.28)',
        padding: 8,
        borderRadius: 50,
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
    likesContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
    },
    likesTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    likedMember: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    likedMemberImage: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    likedMemberName: {
        fontSize: 13,
    },
    replyInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 5,
        marginTop: 10,
    },
    replyInput: {
        flex: 1,
        fontSize: 14,
        padding: 5,
        color: '#333',
    },
    replyButton: {
        marginLeft: 10,
        backgroundColor: '#FF6F00',
        padding: 8,
        borderRadius: 5,
    },
    replyButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    replyContainer: {
        marginTop: 10,
        paddingLeft: 10, // ✅ 대댓글 들여쓰기
        borderColor: '#DDD',
    },
});

export default CommentCard;
