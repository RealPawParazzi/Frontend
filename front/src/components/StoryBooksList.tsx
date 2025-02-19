import React from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';

interface StoryBook {
    id: string;
    title: string;
    thumbnail: any;
    author: string;
}

/**
 * 📌 StoryBooksList 컴포넌트
 * - Zustand에서 가져온 스토리북 리스트를 `FlatList`로 렌더링
 */
const StoryBooksList = ({ storyBooks }: { storyBooks: StoryBook[] }) => {
    return (
        <FlatList
            data={storyBooks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={styles.bookContainer}>
                    {/* 🖼️ 스토리북 썸네일 */}
                    <Image source={item.thumbnail} style={styles.thumbnail} />
                    <View>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.author}>✍ {item.author}</Text>
                    </View>
                </View>
            )}
        />
    );
};

const styles = StyleSheet.create({
    bookContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    thumbnail: { width: 60, height: 60, borderRadius: 10, marginRight: 10 },
    title: { fontSize: 16, fontWeight: 'bold' },
    author: { fontSize: 12, color: 'gray' },
});

export default StoryBooksList;
