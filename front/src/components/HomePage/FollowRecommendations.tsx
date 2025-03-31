import React, { useEffect, useState } from 'react';
import { View, Image, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import userStore from '../../context/userStore';
import MiniProfileModal from '../MiniProfileModal';
import ShadowWrapper from '../../common/ShadowWrapper'; // 추가


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
                data={followRecommendations}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ShadowWrapper style={{ marginBottom: 12, marginHorizontal: 10 }}> {/*  여백 추가  */}
                        <View style={styles.cardContent}>
                        {/* 🖼️ 프로필 이미지 + 유저 이름 */}
                        <TouchableOpacity
                            style={styles.profileSection}
                            onPress={() => {
                                setSelectedUser({
                                    id: item.id,
                                    name: item.name,
                                    profileImage: item.profileImage.toString(),
                                });
                                setIsModalVisible(true);
                            }}
                        >
                            <Image
                                source={typeof item.profileImage === 'string' ? { uri: item.profileImage } : item.profileImage}
                                style={styles.profileImage}
                            />
                            <Text style={styles.name}>{item.name}</Text>
                        </TouchableOpacity>

                        {/* ➕ 팔로우 버튼 */}
                        <TouchableOpacity style={styles.followButton}>
                            <Text style={styles.followText}>+ 팔로우</Text>
                        </TouchableOpacity>
                        </View>
                    </ShadowWrapper>
                )}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true} // ✅ 내부 스크롤 활성화
            />
            {/* ✅ 미니 프로필 모달 */}
            {selectedUser && (
                <MiniProfileModal
                    visible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    user={{ ...selectedUser, id: Number(selectedUser.id) }}  // ✅ 수정된 유저 데이터 전달
                />
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        marginHorizontal: 10,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        marginRight: 12,
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
    },
    followButton: {
        backgroundColor: '#6A5ACD',
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 20,
    },
    followText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 13,
    },
});

export default FollowRecommendations;
