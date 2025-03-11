import React, { useEffect, useState } from 'react';
import { View, Image, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import userStore from '../../context/userStore';
import MiniProfileModal from '../MiniProfileModal';

/** ✅ 유저 타입 정의 */
interface User {
    id: string;
    name: string;
    profileImage: string;
}

/**
 * 📌 FollowRecommendations 컴포넌트
 * - Zustand에서 가져온 팔로우 추천 리스트 표시
 * - 각 유저 옆에 "+ 팔로우" 버튼 추가
 */
const FollowRecommendations = () => {
    const { followRecommendations, loadFollowRecommendations } = userStore();
    const [selectedUser, setSelectedUser] = useState<User | null>(null); // 모달에서 보여줄 유저
    const [isModalVisible, setIsModalVisible] = useState(false); // 모달 표시 여부

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
                        {/* 🖼️ 프로필 이미지 클릭 시 미니 프로필 모달 열기 */}
                        <TouchableOpacity onPress={() => {
                            setSelectedUser({
                                id: item.id,
                                name: item.name,
                                profileImage: item.profileImage,
                            });
                            setIsModalVisible(true);
                        }}>
                            <Image
                                source={typeof item.profileImage === 'string' ? { uri: item.profileImage } : item.profileImage}
                                style={styles.profileImage}
                            />
                        </TouchableOpacity>
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
            {/* ✅ 미니 프로필 모달 */}
            {selectedUser && (
                <MiniProfileModal
                    visible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    selectedUser={{ ...selectedUser, id: Number(selectedUser.id) }}  // ✅ 수정된 유저 데이터 전달
                />
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    container: { paddingVertical: 20 },
    itemContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    profileImage: { width: 50, height: 50, borderRadius: 50, marginRight: 10 },
    textContainer: { flex: 1 },
    name: { fontSize: 14, fontWeight: 'bold' },
    followButton: {
        backgroundColor: '#6A5ACD',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginHorizontal: 10,
    },
    followText: { color: 'white', fontWeight: 'bold' },
});

export default FollowRecommendations;
