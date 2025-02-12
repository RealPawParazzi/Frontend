import React from 'react';
import { View, Image, FlatList, Text, StyleSheet } from 'react-native';

const stories = [
    { id: '1', image: 'https://your-image-url.com/story1.jpg', title: '움짤 1' },
    { id: '2', image: 'https://your-image-url.com/story2.jpg', title: '움짤 2' },
    { id: '3', image: 'https://your-image-url.com/story3.jpg', title: '움짤 3' },
];

const StoryReels = () => {
    return (
        <FlatList
            horizontal
            data={stories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={styles.story}>
                    <Image source={{ uri: item.image }} style={styles.image} />
                    <Text style={styles.title}>{item.title}</Text>
                </View>
            )}
            showsHorizontalScrollIndicator={false}
        />
    );
};

const styles = StyleSheet.create({
    story: { alignItems: 'center', marginHorizontal: 8 },
    image: { width: 60, height: 60, borderRadius: 50 },
    title: { marginTop: 5, fontSize: 12 },
});

export default StoryReels;
