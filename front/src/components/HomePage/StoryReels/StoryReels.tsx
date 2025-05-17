// 📁 components/StoryReels.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Image,
    FlatList,
    StyleSheet,
    Alert,
    Text,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useStoryReelsStore } from '../../../context/storyReelsStore';
import userStore from '../../../context/userStore';
import StoryReelsModal from './StoryReelsModal'; // 🔹 분리된 모달 컴포넌트



/**
 * 📌 단일 스토리 타입
 */
interface Story {
    storyId: number;
    mediaUrl: string;
    caption: string;
    createdAt: string;
    expired: boolean;
    viewed: boolean;
}

/**
 * 📌 사용자별 스토리 그룹 타입
 */
interface UserStoryGroup {
    memberId: number;
    nickname: string;
    profileImageUrl: string;
    stories: Story[];
}

/**
 * 📌 StoryReels 컴포넌트
 * - 수평 리스트 형태의 스토리 UI
 * - 내 스토리는 왼쪽 + 버튼 포함
 * - 유저 스토리 클릭 시 전체 화면 StoryModal 컴포넌트 렌더링
 */
const StoryReels = () => {
    const [modalVisible, setModalVisible] = useState(false); // 모달 표시 여부
    const [activeUserIndex, setActiveUserIndex] = useState<number>(-1); // 현재 보고 있는 유저 스토리 인덱스

    const { groupedStories, myStories, loadGroupedStories, uploadNewStory } = useStoryReelsStore();
    const { userData } = userStore();

    /**
     * 🟢 최초 렌더 시 전체 스토리 로드
     */
    useEffect(() => {
        loadGroupedStories();
    }, [loadGroupedStories]);

    /**
     * 🟠 갤러리에서 이미지 선택 후 스토리 업로드
     */
    const handlePickAndUpload = () => {
        launchImageLibrary({ mediaType: 'photo' }, async (res) => {
            if (res.didCancel || !res.assets || !res.assets[0]) { return; }

            const file = res.assets[0];
            if (!file.uri || !file.fileName || !file.type) { return; }

            try {
                await uploadNewStory({
                    uri: file.uri,
                    name: file.fileName,
                    type: file.type,
                });
            } catch (e: any) {
                Alert.alert('업로드 실패', e.message || '알 수 없는 오류');
            }
        });
    };


    /**
     * 🔵 내 스토리 클릭 시
     * - 스토리가 없으면 업로드
     * - 있으면 모달로 보기
     */
    const handleMyStoryPress = () => {
        console.log('내 스토리 원형 눌림 !', myStories);
        if (myStories.length === 0) {
            handlePickAndUpload();
        } else {
            const myStoryGroup: UserStoryGroup = {
                memberId: Number(userData.id),
                nickname: userData.nickName,
                profileImageUrl: userData.profileImage?.uri || 'https://default-image-url.com/default-profile.png',
                stories: myStories,
            };
            setActiveUserIndex(0); // 본인 스토리는 항상 첫 번째 인덱스로 설정
            setModalVisible(true);
        }
    };

    /**
     * 🔵 다른 유저 스토리 클릭 시 모달 표시
     */
    const openStoryGroup = (index: number) => {
        setActiveUserIndex(index + 1); // 내 스토리가 0번째에 있으니까!
        setModalVisible(true);
    };

    /**
     * 🔵 스토리 그룹 필터링
     * - 내 스토리는 제외하고 나머지 유저 스토리만 표시
     */
    const filteredStories = groupedStories.filter(
        (group) => group.memberId !== Number(userData.id)
    );


    return (
        <View style={styles.reelsContainer}> {/* ✅ 상하 간격 추가 */}
            {/* ✅ 수평 스크롤 스토리 목록 */}
            <FlatList
                horizontal
                data={filteredStories}
                keyExtractor={(item) => item.memberId.toString()}
                showsHorizontalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.myStoryWrapper}>
                        {/* 🔵 내 스토리 버튼 */}
                        <TouchableOpacity onPress={handleMyStoryPress}>
                            <Image
                                source={{ uri: userData?.profileImage.uri || 'https://default-image-url.com/default-profile.png' }}
                                style={[
                                    styles.storyImage,
                                    myStories.length > 0 && styles.grayBorder, // 회색 테두리: 이미 스토리가 있는 경우
                                ]}
                            />
                        </TouchableOpacity>
                        {/* ➕ 플러스 아이콘으로 추가 업로드 */}
                        <TouchableOpacity style={styles.plusIconWrapper} onPress={handlePickAndUpload}>
                            <Icon name="add-circle" size={20} color="#3399ff" />
                        </TouchableOpacity>
                    </View>
                }
                renderItem={({ item, index }) => (
                    <TouchableOpacity onPress={() => openStoryGroup(index)} style={styles.storyItem}>
                        <Image source={{ uri: item.profileImageUrl }} style={styles.storyImage} />
                    </TouchableOpacity>
                )}
            />



            {/* ✅ 전체화면 모달 렌더링 */}
            {modalVisible && activeUserIndex >= 0 && (
                <StoryReelsModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    userIndex={activeUserIndex}
                    userStoryGroups={[{
                        memberId: Number(userData.id),
                        nickname: userData.nickName,
                        profileImageUrl: userData.profileImage?.uri || 'https://default-image-url.com/default-profile.png',
                        stories: myStories,
                    }, ...groupedStories]}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    reelsContainer: {
        marginTop: 16,
        marginBottom: 10,
    },
    myStoryWrapper: {
        marginHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    plusIconWrapper: {
        position: 'absolute',
        bottom: 0,
        right: -4,
        backgroundColor: 'white',
        borderRadius: 50,
    },
    storyItem: {
        marginHorizontal: 6,
    },
    storyImage: {
        width: 60,
        height: 60,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#ff69b4',
    },
    grayBorder: {
        borderColor: '#bbb',
    },
});

export default StoryReels;

