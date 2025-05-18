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
    const [modalVisible, setModalVisible] = useState(false); // 모달 열림 여부
    const [activeUserIndex, setActiveUserIndex] = useState<number>(-1); // 현재 선택된 유저 스토리 인덱스

    const {
        groupedStories,
        myStories,
        loadGroupedStories,
        uploadNewStory,
        loadMyStories,
    } = useStoryReelsStore();

    const { userData } = userStore();

    // 🟢 최초 진입 시 스토리 데이터 로딩
    useEffect(() => {
        loadMyStories();
        loadGroupedStories();
    }, [loadMyStories, loadGroupedStories]);

    // 🟠 이미지 선택 후 업로드 → 업로드 완료 시 스토리 목록 재로딩
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
                await loadMyStories(); // 업로드 후 내 스토리 다시 로드
            } catch (e: any) {
                Alert.alert('업로드 실패', e.message || '알 수 없는 오류');
            }
        });
    };


    // 🔵 내 스토리 눌렀을 때: 있으면 보기, 없으면 업로드
    const handleMyStoryPress = () => {
        if (myStories.length === 0) {
            handlePickAndUpload();
        } else {
            setActiveUserIndex(0); // 내 스토리는 항상 0번째
            setModalVisible(true);
            console.log('⭕️ 내 (',userData.nickName, ') 스토리 눌림 !:', myStories);

        }
    };

    // 🔵 유저 스토리 눌렀을 때: 인덱스를 1부터 시작 (내 스토리 제외)
    const handleOtherUserPress = (index: number) => {
        const selectedUser = groupedStories[activeUserIndex];
        setActiveUserIndex(index + 1); // 내 스토리가 0이므로 +1 offset
        setModalVisible(true);
        console.log(`⭕️ ${selectedUser.nickname} 스토리 눌림 !:`, selectedUser.stories);

    };

    // 🔵 내 스토리와 다른 유저 스토리 구분
    const myStoryGroup: UserStoryGroup = {
        memberId: Number(userData.id),
        nickname: userData.nickName,
        profileImageUrl: userData.profileImage?.uri || 'https://default-image-url.com/default-profile.png',
        stories: myStories,
    };

    const filteredStories = groupedStories.filter(
        (group) => group.memberId !== Number(userData.id)
    );

    const allStoryGroups: UserStoryGroup[] = [myStoryGroup, ...filteredStories];

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
                    <TouchableOpacity
                        style={styles.storyItem}
                        onPress={() => handleOtherUserPress(index)}
                    >
                        <Image source={{ uri: item.profileImageUrl }} style={styles.storyImage} />
                    </TouchableOpacity>
                )}
            />




            {/* ✅ 전체화면 스토리 모달 */}
            {modalVisible && activeUserIndex >= 0 && (
                <StoryReelsModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    userIndex={activeUserIndex}
                    userStoryGroups={allStoryGroups}
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
        borderWidth: 2.5,
        borderColor: '#00a1e6',
    },
    grayBorder: {
        borderColor: '#bbb',
    },
});

export default StoryReels;

