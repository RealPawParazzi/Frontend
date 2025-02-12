import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';
import StoryReels from '../components/StoryReels';
import MemoryVideo from '../components/MemoryVideo';

const HomeScreen = () => {
    return (
        <View style={styles.container}>
            <Header />
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>오늘의 추억 영상 →</Text>
                <MemoryVideo />

                <Text style={styles.sectionTitle}>팔로우 추천 →</Text>
                <StoryReels />

                <Text style={styles.sectionTitle}>StoryBooks for Today →</Text>
                {/* StoryBooksList 추가 예정 */}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
});

export default HomeScreen;
