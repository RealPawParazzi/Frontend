import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface Pet {
    id: string;
    name: string;
    species: string;
    image: any; // ✅ require()로 로컬 이미지 불러오므로 any 타입 설정
}

interface UserInfoProps {
    selectedTab: number;
    userData: {
        name: string;
        profileImage: any;
        petCount: number;
        petList: Pet[];
    };
}


/**
 * 📌 UserInfo 컴포넌트
 * - selectedTab (0 = 펫, 1 = 집사) 값에 따라 다른 정보를 표시
 */

const UserInfo = ({ selectedTab, userData }: UserInfoProps) => {
    return (
        <View style={styles.container}>
            {/* 🖼️ 프로필 이미지 */}
            <Image source={userData.profileImage} style={styles.profileImage} />
            <Text style={styles.name}>{userData.name}</Text>

            {selectedTab === 0 ? (
                // 🟢 펫 탭 선택 시 반려동물 정보 표시
                <View style={styles.petInfo}>
                    <Text>반려동물 수: {userData.petCount} 마리</Text>
                    {userData.petList.map((pet) => (
                        <View key={pet.id} style={styles.petItem}>
                            <Image source={pet.image} style={styles.petImage} />
                            <Text>🐾 {pet.name} ({pet.species})</Text>
                        </View>
                    ))}
                </View>
            ) : (
                // 🟣 집사 탭 선택 시 집사 정보 표시
                <View style={styles.petInfo}>
                    <Text>집사님 반려동물 정보 확인해보세요! 🏡</Text>
                </View>
            )}
        </View>
    );
};

/** ✅ 스타일 정의 */
const styles = StyleSheet.create({
    container: { padding: 20, alignItems: 'center' },
    profileImage: { width: 80, height: 80, borderRadius: 50, marginBottom: 10 },
    name: { fontSize: 20, fontWeight: 'bold' },
    petInfo: { marginTop: 10 },
    petItem: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    petImage: { width: 40, height: 40, borderRadius: 10, marginRight: 10 },
});

export default UserInfo;