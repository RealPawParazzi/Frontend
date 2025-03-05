import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
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
    const navigation = useNavigation(); // $$$$$$ 네비게이션 객체 추가
    const { userData } = userStore(); // ✅ 유저 데이터 Zustand에서 가져오기
    const { pets } = petStore(); // ✅ 반려동물 데이터 가져오기
    const [petList, setPetList] = useState<Pet[]>([]);
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

                    {/* 📅 최근 게시물 & 🚶 오늘의 산책 거리 */}
                    <View style={styles.statsContainer}>
                        <Text style={styles.statText}>
                            📅 최근 게시물: {petPosts.length > 0 ? petPosts[0]?.writeDatetime.split('T')[0] : '없음'}
                        </Text>
                        <Text style={styles.statText}>🚶 오늘의 산책: 5km</Text>
                    </View>
                </View>
            ) : (
                <>
                    <View style={styles.container}>
                        {/* 🏡 반려동물 타이틀 */}
                        <Text style={styles.sectionTitle}>반려동물 {petList.length}</Text>

                        {/* 📜 반려동물 리스트 (가로 스크롤) */}
                        <FlatList
                            horizontal
                            data={petList}
                            keyExtractor={(item) => item.id}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.petListContainer}
                            renderItem={({ item }) => (
                                <View style={styles.petCard}>
                                    <Image source={item.image} style={styles.petImage} />
                                    <Text style={styles.petName}>{item.name}</Text>

                                    {/* ✏️ 펫 수정 버튼 */}
                                    <TouchableOpacity style={styles.editIcon}>
                                        <MaterialIcons name="edit" size={20} color="white" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        />

                        {/* ➕ 반려동물 추가 버튼 */}
                        <TouchableOpacity
                            style={styles.addPetButton}
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
        width: 85, // 📌 기존보다 조금 넓게 조정
        position: 'relative',
        marginHorizontal: 5, // 📌 카드 간격 균일하게 조정
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

    /** ✏️ 수정 버튼 */
    editIcon: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 6, // 📌 버튼 패딩 조정
        borderRadius: 15,
    },

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

    petNameInfo: {
        fontSize: 20,
        fontWeight: 'bold',
    },

    ownerName: {
        fontSize: 16,
        color: 'gray',
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
