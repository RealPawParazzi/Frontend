import React from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';

/** ✅ 더미 데이터 */
const posts = [
    { id: '1', title: '오늘은 스벅 방문기 ~', image: 'https://your-image-url.com/post1.jpg' },
    { id: '2', title: '내일은 투썸 방문기', image: 'https://your-image-url.com/post2.jpg' },
];

const PostList = () => {
    return (
        <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={styles.post}>
                    <Image source={{ uri: item.image }} style={styles.image} />
                    <Text style={styles.title}>{item.title}</Text>
                </View>
            )}
        />
    );
};

const styles = StyleSheet.create({
    post: { flexDirection: 'row', padding: 10, alignItems: 'center' },
    image: { width: 50, height: 50, borderRadius: 10, marginRight: 10 },
    title: { fontSize: 16, fontWeight: 'bold' },
});

export default PostList;
