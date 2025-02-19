import React from 'react';
import { View, Image, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface FollowRecommendation {
    id: string;
    name: string;
    profileImage: any;
}

/**
 * 📌 FollowRecommendations 컴포넌트
 * - Zustand에서 가져온 팔로우 추천 리스트 표시
 * - 각 유저 옆에 "+ 팔로우" 버튼 추가
 */
const FollowRecommendations = ({ recommendations }: { recommendations: FollowRecommendation[] }) => {
    return (
        <FlatList
            data={recommendations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={styles.container}>
                    {/* 🖼️ 프로필 이미지 */}
                    <Image source={item.profileImage} style={styles.profileImage} />
                    <View style={styles.textContainer}>
                        <Text style={styles.name}>{item.name}</Text>
                    </View>
                    {/* ➕ 팔로우 버튼 */}
                    <TouchableOpacity style={styles.followButton}>
                        <Text style={styles.followText}>+ 팔로우</Text>
                    </TouchableOpacity>
                </View>
            )}
            showsVerticalScrollIndicator={false}
        />
    );
};

const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    profileImage: { width: 50, height: 50, borderRadius: 50, marginRight: 10 },
    textContainer: { flex: 1 },
    name: { fontSize: 14, fontWeight: 'bold' },
    followButton: { backgroundColor: '#6A5ACD', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5 },
    followText: { color: 'white', fontWeight: 'bold' },
});

export default FollowRecommendations;
