import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // ✅ CLI 환경용 아이콘 패키지
import userStore from '../../context/userStore';
import petStore from '../../context/petStore';
import boardStore from '../../context/boardStore';

// ✅ Pet 인터페이스 정의 (Zustand store의 pet 데이터와 동일한 구조로 유지)
interface Pet {
    id: string;
    name: string;
    species: string;
    image: any; // ✅ require() 사용으로 any 타입 설정
}

// ✅ Props 인터페이스
interface UserInfoProps {
    selectedTab: number;
}

// ✅ 기본 이미지 상수
const DEFAULT_PET_IMAGE = require('../../assets/images/pets-1.jpg'); // 기본 반려동물 이미지


/**
 * 📌 UserInfo 컴포넌트
 * - selectedTab 값이 0일 때 펫 정보를, 1일 때 집사 정보를 표시
 */
const UserInfo = ({ selectedTab }: UserInfoProps) => {
    const { userData } = userStore(); // ✅ 유저 데이터 Zustand에서 가져오기
    const { pets } = petStore(); // ✅ 반려동물 데이터 가져오기
    const { boardList } = boardStore(); // ✅ 게시물 데이터 가져오기

    // ✅ 현재 선택된 펫 (펫 데이터 로드되면 첫 번째 펫 자동 선택)
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

    useEffect(() => {
        if (pets.length > 0) {
            // 🟢 첫 번째 반려동물 자동 선택 (store에서 가져옴)
            setSelectedPet({
                id: pets[0].petId.toString(),
                name: pets[0].name,
                species: pets[0].type,
                image: pets[0].petImg,
            });
        } else {
            // ❌ 반려동물 정보가 없을 경우 기본값 설정
            setSelectedPet({
                id: '0',
                name: '기본 반려동물',
                species: '강아지',
                image: DEFAULT_PET_IMAGE,
            });
        }
    }, [pets]); // ✅ pets 데이터 변경 시 실행

    // ✏️ 펫 수정 메뉴 (모달)
    const [menuVisible, setMenuVisible] = useState(false);

    // ✅ 선택된 펫의 게시물 필터링 (제목에 펫 이름 포함된 게시물만 가져옴)
    const petPosts = selectedPet
        ? boardList
            .filter((post) => post.title.includes(selectedPet.name)) // 선택된 펫과 관련된 게시물 필터링
            .sort((a, b) => new Date(b.writeDatetime).getTime() - new Date(a.writeDatetime).getTime()) // 날짜순 정렬
        : [];

    return (
        <View style={styles.container}>
            {/* ✅ 집사 탭 선택 시 */}
            {selectedTab === 1 ? (
                <View style={styles.petInfo}>
                    <Text>🏡 집사님 반려동물 정보를 확인하세요!</Text>
                </View>
            ) : (
                <>
                    {/* 🖼️ 펫 프로필 이미지 */}
                    <View style={styles.profileContainer}>
                        {selectedPet && (
                            <Image
                                source={selectedPet?.image}
                                style={styles.petImage}
                            />
                        )}
                        {/* ✏️ 펫 수정 메뉴 버튼 */}
                        <TouchableOpacity
                            style={styles.editIcon}
                            onPress={() => setMenuVisible(true)}
                        >
                            <MaterialIcons name="edit" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* 🏡 펫 이름 & 집사 정보 */}
                    <View style={styles.petInfo}>
                        <Text style={styles.petName}>{selectedPet?.name || '반려동물 선택'}</Text>
                        <Text style={styles.ownerName}>집사: {userData.nickName}</Text>
                    </View>

                    {/* 📅 최근 게시물 & 🚶 오늘의 산책 거리 */}
                    <View style={styles.statsContainer}>
                        <Text style={styles.statText}>
                            📅 최근 게시물: {petPosts.length > 0 ? petPosts[0]?.writeDatetime.split('T')[0] : '없음'}
                        </Text>
                        <Text style={styles.statText}>🚶 오늘의 산책: 5km</Text>
                    </View>

                    {/* ✏️ 펫 수정 메뉴 모달 */}
                    <Modal visible={menuVisible} transparent animationType="fade">
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            onPress={() => setMenuVisible(false)}
                        >
                            <View style={styles.modalContent}>
                                <TouchableOpacity onPress={() => setMenuVisible(false)}>
                                    <Text style={styles.menuItem}>➕ 펫 추가</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setMenuVisible(false)}>
                                    <Text style={styles.menuItem}>✏️ 펫 정보 수정</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setMenuVisible(false)}>
                                    <Text style={styles.menuItem}>🔄 펫 교체</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Modal>
                </>
            )}
        </View>
    );
};

/** ✅ 스타일 정의 */
const styles = StyleSheet.create({
    container: { padding: 20, alignItems: 'center' },
    profileContainer: { alignItems: 'center', marginBottom: 10 },
    petImage: { width: 350, height: 250, resizeMode: 'cover', borderRadius: 10 },
    editIcon: { position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 5 },
    petInfo: { alignItems: 'center', marginVertical: 10 },
    petName: { fontSize: 22, fontWeight: 'bold' },
    ownerName: { fontSize: 16, color: 'gray' },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, marginBottom: 15 },
    statText: { fontSize: 14, color: 'gray' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: 200, alignItems: 'center' },
    menuItem: { fontSize: 16, marginVertical: 10 },
});

export default UserInfo;
