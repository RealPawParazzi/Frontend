import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // ✅ CLI 환경용 아이콘 패키지
import userStore from '../../context/userStore';
import petStore from '../../context/petStore';
import boardStore from '../../context/boardStore';
import { useNavigation } from '@react-navigation/native';

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
    const navigation = useNavigation(); // 네비게이션 객체 추가
    const { userData } = userStore(); // ✅ 유저 데이터 Zustand에서 가져오기
    const { pets } = petStore(); // ✅ 반려동물 데이터 가져오기
    const { boardList, fetchUserBoards } = boardStore(); // ✅ 게시물 데이터 가져오기
    const [petList, setPetList] = useState<Pet[]>([]); // ✅ 반려동물 리스트 상태
    const [selectedPetId, setSelectedPetId] = useState<string | null>(null); // ✅ 선택된 펫 ID 상태
    const [latestPostTime, setLatestPostTime] = useState<string>('없음'); // ✅ 최신 게시물 시간 상태

    useEffect(() => {
        if (pets.length > 0) {
            // ✅ 반려동물 데이터 업데이트
            const updatedPets = pets.map((pet) => ({
                id: pet.petId.toString(),
                name: pet.name,
                species: pet.type,
                image: pet.petImg || DEFAULT_PET_IMAGE, // 기본 이미지 처리
            }));
            setPetList(updatedPets);
            setSelectedPetId(updatedPets[0].id); // ✅ 첫 번째 반려동물을 기본 선택
        }
    }, [pets]); // ✅ pets 데이터 변경 시 실행

    useEffect(() => {
        console.log('🔄 게시글 업데이트 요청');
        fetchUserBoards(Number(userData.id)); // ✅ 게시글 최신화
    }, [fetchUserBoards, userData.id]);

    useEffect(() => {
        console.log('📌 현재 boardList:', boardList); // ✅ 게시글 리스트 로그 확인

        const userPosts = boardList
            .filter((post) => post.author.id === userData.id) // ✅ 현재 로그인한 유저의 게시글 필터링
            .sort((a, b) => new Date(b.writeDatetime).getTime() - new Date(a.writeDatetime).getTime()); // ✅ 최신순 정렬

        if (userPosts.length > 0) {
            setLatestPostTime(getRelativeTime(userPosts[0].writeDatetime)); // ✅ 최신 게시글 시간 업데이트
        } else {
            setLatestPostTime('없음');
        }
    }, [boardList, userData.id]); // ✅ boardList 변경 시 실행

    /**
     * 🕒 게시글 시간 변환 함수
     * - 현재 시간과 비교하여 "3분 전", "2일 전" 등으로 변환
     */
    const getRelativeTime = (dateString: string) => {
        const postDate = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - postDate.getTime();

        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) { return '방금 전'; }
        if (diffMinutes < 60) { return `${diffMinutes}분 전`; }
        if (diffHours < 24) { return `${diffHours}시간 전`; }
        return `${diffDays}일 전`;
    };

    return (
        <View style={styles.container}>
            {/* ✅ 집사 탭 선택 시 */}
            {selectedTab === 1 ? (
                <View style={styles.petInfo}>
                    <Text>🏡 {userData.name} 집사님의 반려동물 일상을 공유하세요 !</Text>

                    {/* 📅 최근 게시물 & 🚶 오늘의 산책 거리 */}
                    <View style={styles.statsContainer}>
                        <Text style={styles.statText}>📅 최근 게시물: {latestPostTime}</Text>
                        <Text style={styles.statText}>🚶 오늘의 산책: 5km</Text>
                    </View>
                </View>
            ) : (
                <>
                    <View style={styles.container}>
                        {/* ✅ 반려동물 수 반영 */}
                        <Text style={styles.sectionTitle}>반려동물 {petList.length} 마리</Text>

                        {/* 🔹 반려동물 리스트 + ➡️ 버튼을 한 줄로 정렬 */}
                        <View style={styles.petRow}>
                            <FlatList
                                horizontal
                                data={petList}
                                keyExtractor={(item) => item.id}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.petListContainer}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.petCard,
                                            selectedPetId === item.id && styles.selectedPetCard, // ✅ 선택된 펫 강조
                                        ]}
                                        onPress={() => setSelectedPetId(item.id)} // ✅ 펫 선택 시 ID 변경
                                    >
                                        <Image source={item.image ? { uri: item.image } : DEFAULT_PET_IMAGE} style={styles.petImage} />
                                        <Text style={styles.petName}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />

                            {/* ➡️ 아이콘 (반려동물 정보 화면 이동) */}
                            <TouchableOpacity
                                style={styles.viewMoreButton}
                                // @ts-ignore
                                onPress={() => navigation.navigate('PetInfoScreen')}
                            >
                                <MaterialIcons name="arrow-forward-ios" size={24} color="#888" />
                            </TouchableOpacity>
                        </View>

                        {/* ➕ 반려동물 추가 버튼 */}
                        <TouchableOpacity
                            style={styles.addPetButton}
                            // @ts-ignore
                            onPress={() => navigation.navigate('PetRegistrationScreen')}
                        >
                            <MaterialIcons name="add" size={30} color="gray" />
                            <Text style={styles.addPetText}>반려동물 추가하기</Text>
                        </TouchableOpacity>
                    </View>
                    );
                </>
            )}
        </View>
    );
};

/** ✅ 스타일 정의 */
const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 15,
        paddingVertical: 10,
    },

    /** ✅ 반려동물 목록을 ➡️ 버튼과 한 줄에 배치 */
    petRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // 가로 정렬 유지
        width: '100%',
    },

    /** ✅ 반려동물 목록 제목 */
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15, // 📌 타이틀과 리스트 사이 간격 조정
        alignSelf: 'flex-start',
    },

    /** ✅ 반려동물 목록 스타일 */
    petListContainer: {
        flexDirection: 'row',
        gap: 15,
        alignItems: 'center',
        paddingVertical: 5,
        marginBottom: 15, // 📌 반려동물 목록과 추가 버튼 사이 간격 추가
    },

    petCard: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 85,
        padding: 10,
        borderRadius: 50,
        backgroundColor: 'white',
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2, // ✅ 안드로이드 그림자 효과
    },

    selectedPetCard: {
        borderWidth: 2,
        borderColor: '#FF6F00', // ✅ 선택된 반려동물 강조 색상
    },

    petImage: {
        width: 65, // 📌 크기 약간 증가
        height: 65,
        borderRadius: 32.5,
        backgroundColor: '#EAEAEA',
    },

    petName: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 6, // 📌 텍스트와 이미지 간격 추가
    },

    viewMoreButton: { marginLeft: 10, padding: 10 },

    /** ➕ 추가 버튼 스타일 */
    addPetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: 14, // 📌 버튼 높이 조금 늘림
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        backgroundColor: '#f8f8f8',
    },

    addPetText: {
        fontSize: 16,
        color: 'gray',
        marginLeft: 8, // 📌 아이콘과 텍스트 간격 조정
    },

    /** 🏡 집사 및 반려동물 정보 */
    petInfo: {
        alignItems: 'center',
        marginVertical: 20, // 📌 여백 조금 증가
    },

    /** 📅 최근 게시물 & 🚶 산책 정보 */
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 30,
        marginTop: 40,
        marginBottom: 20, // 📌 하단 여백 증가
    },

    statText: {
        fontSize: 14,
        color: 'gray',
    },
});



export default UserInfo;
