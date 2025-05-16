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
    Text, ActionSheetIOS,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useStoryReelsStore } from '../../context/storyReelsStore';
import Video from 'react-native-video';
import { launchImageLibrary } from 'react-native-image-picker';
import userStore from '../../context/userStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

dayjs.extend(relativeTime);
dayjs.locale('ko');


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
            handlePickAndUpload();
        } else {
            const latest = myStories[myStories.length - 1];
            setSelectedStory({
                story: latest,
                user: {
                    memberId: userData.id,
                    nickname: userData.name,
                    profileImageUrl: userData.profileImage.uri,
                    stories: [],
                },
            });
            setModalVisible(true);
        }
    };

    const handleMenuPress = () => {
        ActionSheetIOS.showActionSheetWithOptions(
            {
                options: ['취소', '수정', '삭제'],
                destructiveButtonIndex: 2,
                cancelButtonIndex: 0,
            },
            (buttonIndex) => {
                if (buttonIndex === 1) {
                    // TODO: 수정 로직
                    Alert.alert('수정 기능 아직 구현되지 않았습니다.');
                } else if (buttonIndex === 2) {
                    // 삭제
                    Alert.alert('삭제하시겠습니까?', '', [
                        { text: '취소', style: 'cancel' },
                        {
                            text: '삭제',
                            style: 'destructive',
                            onPress: () => {
                                // 실제 삭제 API 호출
                                Alert.alert('삭제 완료');
                            },
                        },
                    ]);
                }
            }
        );
    };


    return (
        <View style={styles.reelsContainer}> {/* ✅ 상하 간격 추가 */}
            {/* ✅ 수평 스크롤 스토리 목록 */}
            <FlatList
                horizontal
                data={groupedStories.filter((g) => g.memberId !== Number(userData.id))} // ✅ 내 스토리는 제외
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


            {/* ✅ 전체화면 모달 */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    {/* 🔵 상단 정보바 */}
                    <View style={styles.topBar}>
                        <Image
                            source={{ uri: selectedStory?.user.profileImageUrl }}
                            style={styles.topBarProfile}
                        />
                        <Text style={styles.topBarText}>
                            {selectedStory?.user.nickname} ·{' '}
                            {selectedStory && dayjs(selectedStory.story.createdAt).fromNow()}
                        </Text>
                        <View style={styles.topBarActions}>
                            <TouchableOpacity onPress={handleMenuPress}>
                                <Icon name="more-vert" size={22} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="close" size={26} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 📸 이미지 또는 영상 표시 */}
                    <View style={styles.mediaWrapper}>
                        {selectedStory?.story.mediaUrl?.endsWith('.mp4') ? (
                            <Video
                                source={{ uri: selectedStory.story.mediaUrl }}
                                style={styles.fullScreenMedia}
                                controls
                                resizeMode="contain"
                            />
                        ) : (
                            <Image
                                source={{ uri: selectedStory?.story.mediaUrl }}
                                style={styles.fullScreenMedia}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    reelsContainer: {
        marginTop: 16,
        marginBottom: 10,
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
    },
    mediaWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenMedia: {
        width: '100%',
        height: '100%',
        borderRadius: 5,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 54,
        paddingBottom: 10,
    },
    topBarProfile: {
        width: 36,
        height: 36,
        borderRadius: 20,
        marginRight: 8,
    },
    topBarText: {
        color: 'white',
        fontSize: 16,
        flex: 1,
    },
    topBarActions: {
        flexDirection: 'row',
        gap: 16,
    },
});

export default StoryReels;

