import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface Post {
    id: string;
    title: string;
    image: any;
}

const PostList = ({ post }: { post: Post }) => {
    return (
        <View style={styles.post}>
            <Image source={post.image} style={styles.image} />
            <Text style={styles.title}>{post.title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    post: { flexDirection: 'row', padding: 10, alignItems: 'center' },
    image: { width: 50, height: 50, borderRadius: 10, marginRight: 10 },
    title: { fontSize: 16, fontWeight: 'bold' },
});


export default PostList;
