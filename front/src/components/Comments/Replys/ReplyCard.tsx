import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Alert,
    Platform,
    ActionSheetIOS,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import replyStore from '../../../context/replyStore';
import { fetchReplyLikes } from '../../../services/replyService';
import userStore from '../../../context/userStore'; // ✅ 현재 로그인한 유저 정보 가져오기

interface ReplyCardProps {
    reply: {
        replyId: number;
        content: string;
        replyLiked: boolean;
        replyLikeCount: number;
        createdAt: string;
        replyMember: {
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
    commentId: number; // 부모 댓글 ID
}

/** ✅ 개별 대댓글(답글) 카드 컴포넌트 */
const ReplyCard = ({ reply, commentId }: ReplyCardProps) => {
    const {
        removeReply,
        editReply,
        toggleLikeOnReply,
        fetchReplyLikeDetails,
    } = replyStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(reply.content);
    const [showLikes, setShowLikes] = useState(false); // 좋아요 상세 목록 표시 여부

    // 좋아요 상태 & 좋아요 개수 상태 추가
    const [isLiked, setIsLiked] = useState(reply.replyLiked);
    const [likeCount, setLikeCount] = useState(reply.replyLikeCount);

    // ✅ 로그인한 사용자 정보 가져오기
    const { userData } = userStore();

    // ✅ 좋아요 정보 불러오기
    useEffect(() => {
        const loadLikes = async () => {
            try {
                const likesData = await fetchReplyLikeDetails(reply.replyId, commentId);
                setIsLiked(likesData?.likedMembers?.some(member => member.memberId === Number(userData.id)) || false);
                setLikeCount(likesData?.likeCount || 0);
            } catch (error) {
                console.error('❌ 좋아요 정보 불러오기 오류:', error);
            }
        };
        loadLikes();
    }, [userData.id, fetchReplyLikeDetails, reply.replyId, commentId]);

    // ✅ 대댓글 수정 저장 핸들러
    const handleSaveEdit = async () => {
        if (!editedText.trim()) { return; }
        try {
            await editReply(reply.replyId, editedText);
            setIsEditing(false);
        } catch (error) {
            console.error('❌ 대댓글 수정 실패:', error);
        }
    };

    // ✅ 대댓글 삭제 핸들러
    const handleDelete = async () => {
        Alert.alert('삭제 확인', '정말 대댓글을 삭제하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            {
                text: '삭제',
                onPress: async () => {
                    try {
                        await removeReply(reply.replyId);
                        Alert.alert('✅ 삭제 완료', '대댓글이 삭제되었습니다.');
                    } catch (error) {
                        Alert.alert('❌ 오류', '대댓글 삭제 중 문제가 발생했습니다.');
                        console.error('❌ 대댓글 삭제 실패:', error);
                    }
                },
                style: 'destructive',
            },
        ]);
    };

    // ✅ 대댓글 좋아요 토글 핸들러
    const handleToggleLike = async () => {
        if (!userData?.id) {
            return Alert.alert('❌ 오류', '로그인이 필요합니다.');
        }

        try {
            const response = await toggleLikeOnReply(reply.replyId, commentId);

            if (response) {
                setIsLiked(response.liked);
                setLikeCount(response.replyLikeCount);
            }
        } catch (error) {
            console.error('❌ 좋아요 토글 오류:', error);
            Alert.alert('❌ 오류', '좋아요 처리 중 문제가 발생했습니다.');

        }
    };

    // ✅ 좋아요 상세 목록 표시 핸들러
    const handleShowLikes = async () => {
        if (reply.replyLikeCount > 0) {
            try {
                await fetchReplyLikes(reply.replyId);
                setShowLikes(!showLikes);
            } catch (error) {
                Alert.alert('❌ 오류', '좋아요 목록을 불러오는 중 문제가 발생했습니다.');
            }
        }
    };


    // ✅ 옵션 메뉴 (수정/삭제) 열기
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
            Alert.alert('답글 관리', '수정 또는 삭제할 수 있습니다.', [
                { text: '수정하기', onPress: () => setIsEditing(true) },
                { text: '삭제하기', onPress: handleDelete, style: 'destructive' },
                { text: '취소', style: 'cancel' },
            ]);
        }
    };

    return (
        <View style={styles.container}>
            {/* 부모 댓글과 연결되는 선 */}
            <View style={styles.replyLine} />

            <View style={styles.replyContent}>
                {/* 프로필 & 정보 */}
                <Image
                    source={reply.replyMember.profileImageUrl ? { uri: reply.replyMember.profileImageUrl } : require('../../../assets/images/profile-1.png')}
                    style={styles.profileImage}
                />
                <View style={styles.textWrapper}>
                    <Text style={styles.nickname}>{reply.replyMember.nickname}</Text>
                    <Text style={styles.date}>{reply.createdAt}</Text>
                </View>

                {/* 옵션 메뉴 (햄버거 아이콘) */}
                <TouchableOpacity onPress={openActionSheet} style={styles.moreIcon}>
                    <MaterialIcons name="more-vert" size={20} color="#555" />
                </TouchableOpacity>
            </View>

            {/* ✅ 수정 UI */}
            {isEditing ? (
                <View style={styles.editContainer}>
                    <TextInput
                        style={styles.editInput}
                        value={editedText}
                        onChangeText={setEditedText}
                        autoFocus
                        placeholder="답글을 수정하세요..."
                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity onPress={handleSaveEdit} style={styles.saveButton}>
                        <MaterialIcons name="check" size={15} color="white" />
                    </TouchableOpacity>
                </View>
            ) : (
                <Text style={styles.content}>{reply.content}</Text>
            )}

            {/* 좋아요 버튼 */}
            <View style={styles.actions}>
                <TouchableOpacity onPress={handleToggleLike} style={styles.actionButton}>
                    <MaterialIcons
                        name={isLiked ? 'favorite' : 'favorite-border'}
                        size={18}
                        color={isLiked ? 'red' : 'black'}
                    />
                    <TouchableOpacity onPress={handleShowLikes}>
                        <Text style={styles.actionText}>{likeCount}</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </View>

            {/* 좋아요 누른 사용자 목록 */}
            {showLikes && reply.likedMembers && reply.likedMembers.length > 0 && (
                <View style={styles.likesContainer}>
                    <Text style={styles.likesTitle}>좋아요 {likeCount}개</Text>
                    {reply.likedMembers.map((member) => (
                        <View key={member.memberId} style={styles.likedMember}>
                            <Image
                                source={member.profileImageUrl ? { uri: member.profileImageUrl } : require('../../../assets/images/profile-1.png')}
                                style={styles.likedMemberImage}
                            />
                            <Text style={styles.likedMemberName}>{member.nickname}</Text>
                        </View>
                    ))}
                </View>
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingLeft: 20, // ✅ 왼쪽 들여쓰기
        marginTop: 10,
        borderBottomWidth: 1,
        borderColor: '#EEE',
    },
    replyLine: {
        position: 'absolute',
        left: 10,
        top: 10,
        bottom: 0,
        width: 2.5,
        backgroundColor: '#DDD',
    },
    replyContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    textWrapper: {
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
        marginHorizontal: 15,
        marginVertical: 25,
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 30,
        paddingHorizontal: 15,
        paddingVertical: 10,
        margin: 15,
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
        marginTop: 5,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        marginVertical: 5,
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
});

export default ReplyCard;
