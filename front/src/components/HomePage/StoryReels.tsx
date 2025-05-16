// 📁 components/StoryReels.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Image,
    FlatList,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useStoryReelsStore } from '../../context/storyReelsStore';
import Video from 'react-native-video';
import { launchImageLibrary } from 'react-native-image-picker';
import userStore from '../../context/userStore';


interface Story {
    storyId: number;
    mediaUrl: string;
    caption: string;
    createdAt: string;
    expired: boolean;
    viewed: boolean;
}

interface UserStoryGroup {
    memberId: number;
    nickname: string;
    profileImageUrl: string;
    stories: Story[];
}

/**
 * 📌 StoryReels 컴포넌트
 * - 사용자별 스토리를 수평 스크롤 형태로 보여줌
 * - 스토리 항목 클릭 시 모달로 전체 화면에서 보여줌
 * - 첫 번째는 본인 스토리 추가 버튼
 */
const StoryReels = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedStory, setSelectedStory] = useState<any>(null);
    const { groupedStories, loadGroupedStories, myStories, uploadNewStory } = useStoryReelsStore();
    const { userData } = userStore(); // ✅ 현재 로그인 사용자 정보

    // 🟢 최초 로드 시 스토리 불러오기
    useEffect(() => {
        loadGroupedStories();
    }, [loadGroupedStories]);

    // 🟠 갤러리에서 이미지 선택 후 업로드 처리
    const handlePickAndUpload = () => {
        launchImageLibrary({ mediaType: 'photo' }, async (res) => {
            if (res.didCancel || !res.assets || !res.assets[0]) return;

            const file = res.assets[0];
            if (!file.uri || !file.fileName || !file.type) return;

            const fileData = {
                uri: file.uri,
                name: file.fileName,
                type: file.type,
            };

            try {
                await uploadNewStory(fileData);
            } catch (e: any) {
                Alert.alert('스토리 업로드 실패', e.message || '알 수 없는 오류');
            }
        });
    };

    // 🟣 내 스토리 프로필 클릭 시
    const handleMyStoryPress = () => {
        if (myStories.length === 0) {
            handlePickAndUpload(); // 스토리가 없으면 바로 업로드
        } else {
            const latest = myStories[myStories.length - 1];
            setSelectedStory(latest);
            setModalVisible(true); // 있으면 모달로 보기
        }
    };


    return (
        <View>
            {/* ✅ 수평 스크롤 스토리 목록 */}
            <FlatList
                horizontal
                data={groupedStories}
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
                                    myStories.length > 0 && styles.grayBorder, // 🟤 회색 테두리
                                ]}
                            />
                        </TouchableOpacity>

                        {/* ➕ 플러스 아이콘으로 추가 업로드 */}
                        <TouchableOpacity style={styles.plusIconWrapper} onPress={handlePickAndUpload}>
                            <Icon name="add-circle" size={20} color="#3399ff" />
                        </TouchableOpacity>
                    </View>
                }
                renderItem={({ item }) => {
                    const latestStory = item.stories[item.stories.length - 1];
                    return (
                        <TouchableOpacity onPress={() => {
                            setSelectedStory(latestStory);
                            setModalVisible(true);
                        }} style={styles.storyItem}>
                            <Image
                                source={{ uri: item.profileImageUrl }}
                                style={styles.storyImage}
                            />
                        </TouchableOpacity>
                    );
                }}
            />


            {/* 🎬 전체화면 스토리 뷰 */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <TouchableOpacity style={styles.modalContainer} onPress={() => setModalVisible(false)}>
                    {selectedStory?.mediaUrl?.endsWith('.mp4') ? (
                        <Video
                            source={{ uri: selectedStory.mediaUrl }}
                            style={styles.fullScreenMedia}
                            controls
                            resizeMode="contain"
                        />
                    ) : (
                        <Image
                            source={{ uri: selectedStory?.mediaUrl }}
                            style={styles.fullScreenMedia}
                        />
                    )}
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    storyContainer: {
        marginHorizontal: 8,
    },
    storyItem: {
        marginHorizontal: 6,
    },
    storyImage: {
        width: 60,
        height: 60,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#ff69b4', // 다른 유저는 핑크 테두리
    },
    grayBorder: {
        borderColor: '#bbb',
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
    modalContainer: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenMedia: {
        width: '90%',
        height: '80%',
        borderRadius: 10,
    },
    // ✅ 추가 버튼 스타일
    addStoryButton: {
        marginLeft: 16,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addStoryCircle: {
        width: 60,
        height: 60,
        marginTop : 10,
        marginBottom : 10,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#ccc',
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default StoryReels;

