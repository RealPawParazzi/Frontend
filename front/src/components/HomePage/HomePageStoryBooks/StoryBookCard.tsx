// 📁 StoryBookCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface StoryBookCardProps {
    id: number;
    titleImage: string;
    titleContent: string;
    writeDatetime: string;
    author: {
        nickname: string;
        profileImageUrl: string;
    };
    favoriteCount: number;
    commentCount: number;
    viewCount: number;
}

const StoryBookCard: React.FC<{ story: StoryBookCardProps }> = ({ story }) => {
    return (
        <View style={styles.card}>
            {/* 🔹 상단 정보 */}
            <View style={styles.header}>
                <Image source={{ uri: story.author.profileImageUrl }} style={styles.avatar} />
                <View style={styles.info}>
                    <Text style={styles.username}>{story.author.nickname}</Text>
                    <Text style={styles.meta}>{new Date(story.writeDatetime).toLocaleDateString()}</Text>
                </View>
                <Icon name="more-vert" size={20} color="gray" />
            </View>

            {/* 🔹 이미지 */}
            {story.titleImage && <Image source={{ uri: story.titleImage }} style={styles.storyImage} />}

            {/* 🔹 콘텐츠 텍스트 */}
            <Text style={styles.content}>{story.titleContent}</Text>

            {/* 🔹 하단 아이콘 */}
            <View style={styles.footer}>
                <View style={styles.iconGroup}>
                    <Icon name="favorite-border" size={18} color="#888" />
                    <Text style={styles.iconText}>{story.favoriteCount}</Text>
                </View>
                <View style={styles.iconGroup}>
                    <Icon name="chat-bubble-outline" size={18} color="#888" />
                    <Text style={styles.iconText}>{story.commentCount}</Text>
                </View>
                <View style={styles.iconGroup}>
                    <Icon name="visibility" size={18} color="#888" />
                    <Text style={styles.iconText}>{story.viewCount}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 50,
        padding: 25,
        marginVertical: 10,
        marginHorizontal: 5,

        // iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,

        // Android
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        justifyContent: 'space-between',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    info: {
        flex: 1,
        marginLeft: 10,
    },
    username: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    meta: {
        fontSize: 12,
        color: 'gray',
    },
    storyImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 10,
    },
    content: {
        fontSize: 14,
        color: '#444',
        marginBottom: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 4,
    },
    iconGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 13,
        marginLeft: 4,
        color: '#555',
    },
});

export default StoryBookCard;
