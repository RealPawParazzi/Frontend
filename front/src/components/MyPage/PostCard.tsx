import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/MaterialIcons';

/** ✅ 게시글 데이터 타입 */
interface Post {
    id: number;
    title: string;
    titleImage: string;
    titleContent: string;
    writeDatetime: string;
    likes: number;
    comments: number;
    author: {
        id: number;
        nickname: string;
        profileImageUrl: string;
    };
}
/** ✅ 네비게이션 타입 */
type NavigationProp = StackNavigationProp<RootStackParamList, 'StorybookDetailScreen'>;

/** ✅ 게시물 카드 컴포넌트 */
const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    const navigation = useNavigation<NavigationProp>();

    return (
        <View style={styles.card}>
            {/* 🔹 상단 프로필 정보 + 작성 시간 + 옵션 버튼 */}
            <View style={styles.header}>
                <View style={styles.profileContainer}>
                    <Image source={{ uri: post.author.profileImageUrl }} style={styles.profileImage} />
                    <View>
                        <Text style={styles.authorName}>{post.author.nickname}</Text>
                        <Text style={styles.postTime}>{post.writeDatetime.split('T')[0]}</Text>
                    </View>
                </View>

                {/* 🔹 옵션 버튼 (게시글 수정/삭제) */}
                <TouchableOpacity>
                    <Icon name="more-vert" size={24} color="gray" />
                </TouchableOpacity>
            </View>

            {/* 🔹 게시글 메인 이미지 */}
            <TouchableOpacity onPress={() => navigation.navigate('StorybookDetailScreen', { boardId: post.id })}>
                <Image source={{ uri: post.titleImage }} style={styles.postImage} />
            </TouchableOpacity>

            {/* 🔹 타이틀 콘텐츠 */}
            <Text style={styles.titleContent}>{post.titleContent}</Text>

            {/* 🔹 하단 아이콘: 좋아요, 댓글 */}
            <View style={styles.footer}>
                <View style={styles.iconContainer}>
                    <Icon name="favorite-border" size={20} color="gray" />
                    <Text style={styles.iconText}>{post.likes}</Text>
                </View>

                <View style={styles.iconContainer}>
                    <Icon name="chat-bubble-outline" size={20} color="gray" />
                    <Text style={styles.iconText}>{post.comments}</Text>
                </View>
            </View>
        </View>
    );
};

/** ✅ 스타일 */
const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    authorName: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    postTime: {
        fontSize: 12,
        color: 'gray',
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 8,
    },
    titleContent: {
        fontSize: 14,
        color: '#444',
        marginBottom: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 20,
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 14,
        color: '#444',
        marginLeft: 4,
    },
});

export default PostCard;
