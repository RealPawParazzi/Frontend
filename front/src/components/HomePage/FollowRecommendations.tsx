import React, { useEffect } from 'react';
import { View, Image, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import userStore from '../../context/userStore';

/**
 * 📌 FollowRecommendations 컴포넌트
 * - Zustand에서 가져온 팔로우 추천 리스트 표시
 * - 각 유저 옆에 "+ 팔로우" 버튼 추가
 */
const FollowRecommendations = () => {
    const { followRecommendations, loadFollowRecommendations } = userStore();

    // ✅ 컴포넌트가 마운트될 때 팔로우 추천 리스트 불러오기
    useEffect(() => {
        loadFollowRecommendations();
    }, [loadFollowRecommendations]);

    return (
        <View style={styles.container}>
            <FlatList
                data={followRecommendations} // ✅ Zustand에서 가져온 유저 리스트
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        {/* 🖼️ 프로필 이미지 */}
                        <Image
                            source={typeof item.profileImage === 'string' ? { uri: item.profileImage } : item.profileImage}
                            style={styles.profileImage}
                        />
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
                nestedScrollEnabled={true} // ✅ 내부 스크롤 활성화
            />
        </View>
    );
};


const styles = StyleSheet.create({
    container: { paddingVertical: 20 },
    itemContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    profileImage: { width: 50, height: 50, borderRadius: 50, marginRight: 10 },
    textContainer: { flex: 1 },
    name: { fontSize: 14, fontWeight: 'bold' },
    followButton: { backgroundColor: '#6A5ACD', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5 },
    followText: { color: 'white', fontWeight: 'bold' },
});

export default FollowRecommendations;
