import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    Modal,
    View,
    Image,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    TouchableWithoutFeedback,
    Animated,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import { ActionSheetIOS, Alert } from 'react-native';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// ✅ 스토리 타입
interface Story {
    storyId: number;
    mediaUrl: string;
    caption: string;
    createdAt: string;
    expired: boolean;
    viewed: boolean;
}

// ✅ 유저 + 스토리 배열을 포함한 구조
interface User {
    memberId: number;
    nickname: string;
    profileImageUrl: string;
    stories: Story[];
}

// ✅ 컴포넌트 Props 정의
interface Props {
    visible: boolean; // 모달 표시 여부
    onClose: () => void; // 모달 닫기 콜백
    userIndex: number; // 현재 유저 인덱스
    userStoryGroups: User[]; // 유저 + 스토리 목록 배열
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const StoryReelsModal = ({ visible, onClose, userIndex, userStoryGroups }: Props) => {
    const [currentUserIndex, setCurrentUserIndex] = useState(userIndex); // 현재 유저 위치
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0); // 현재 스토리 위치
    const progress = useRef(new Animated.Value(0)).current; // 진행바 애니메이션 값

    const currentUser = userStoryGroups[currentUserIndex];
    const currentStory = currentUser?.stories[currentStoryIndex];

    // 🟢 진행바 애니메이션 시작
    const startProgress = useCallback(() => {
        progress.setValue(0);
        Animated.timing(progress, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                handleNext(); // 진행 끝나면 다음 스토리
            }
        });
    }, [progress, handleNext]);

    const handleNext = useCallback(() => {
        if (!currentUser || !currentUser.stories) {
            onClose();
            return;
        }

        if (currentStoryIndex < currentUser.stories.length - 1) {
            setCurrentStoryIndex((prev) => prev + 1);
        } else if (currentUserIndex < userStoryGroups.length - 1) {
            setCurrentUserIndex((prev) => prev + 1);
            setCurrentStoryIndex(0);
        } else {
            onClose(); // 마지막 스토리일 경우 닫기
        }
    }, [currentStoryIndex, currentUser, currentUserIndex, userStoryGroups.length, onClose]);

    // 🟣 이전 스토리 or 이전 유저로 이동
    const handlePrev = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex((prev) => prev - 1);
        } else if (currentUserIndex > 0) {
            const prevUser = userStoryGroups[currentUserIndex - 1];
            setCurrentUserIndex((prev) => prev - 1);
            setCurrentStoryIndex(prevUser?.stories.length - 1 || 0);
        }
    };

    // 🟡 인덱스 변경 시 자동 애니메이션 재시작
    useEffect(() => {
        if (visible && currentUser?.stories?.length > 0) {
            startProgress();
        }
    }, [visible, currentStoryIndex, currentUserIndex, startProgress, currentUser?.stories?.length]);

    // ✅ 햄버거 버튼 눌렀을 때 액션 시트 표시
    const handleMenuPress = () => {
        ActionSheetIOS.showActionSheetWithOptions(
            {
                options: ['취소', '수정', '삭제'], // 메뉴 항목
                cancelButtonIndex: 0,
                destructiveButtonIndex: 2,
            },
            (buttonIndex) => {
                if (buttonIndex === 1) {
                    // ✏️ 수정 기능: 여기에 Navigation 또는 편집 기능 연동 가능
                    Alert.alert('수정 기능은 아직 구현되지 않았습니다.');
                } else if (buttonIndex === 2) {
                    // ❌ 삭제 기능 확인 후 처리
                    Alert.alert('정말 삭제하시겠습니까?', '', [
                        { text: '취소', style: 'cancel' },
                        {
                            text: '삭제',
                            style: 'destructive',
                            onPress: () => {
                                // 👉 삭제 기능 연동 예정
                                Alert.alert('삭제 완료');
                                onClose(); // 삭제 후 모달 닫기
                            },
                        },
                    ]);
                }
            }
        );
    };

    useEffect(() => {
        if (!visible) {
            setCurrentUserIndex(userIndex);
            setCurrentStoryIndex(0);
            progress.setValue(0);
        }
    }, [visible, userIndex, progress]);

    if (!visible || !currentStory) { return null; }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.container}>
                {/* 🔷 상단 진행바 (스토리 개수만큼 출력) */}
                <View style={styles.progressBarRow}>
                    {currentUser.stories.map((_, idx) => (
                        <View key={idx} style={styles.progressBarBackground}>
                            <Animated.View
                                style={[
                                    styles.progressBarForeground,
                                    idx === currentStoryIndex
                                        ? { flex: progress }
                                        : idx < currentStoryIndex
                                            ? { flex: 1 }
                                            : { flex: 0 },
                                ]}
                            />
                        </View>
                    ))}
                </View>

                {/* 🔷 상단 유저 정보 바 */}
                <View style={styles.topBar}>
                    <Image source={{ uri: currentUser.profileImageUrl }} style={styles.avatar} />
                    <Text style={styles.nickname}>
                        {currentUser.nickname} · {dayjs(currentStory.createdAt).fromNow()}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 16 }}>
                        <TouchableOpacity onPress={handleMenuPress}>
                            <Icon name="more-vert" size={22} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="close" size={26} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 🔷 미디어 (사진 or 영상) */}
                <View style={styles.mediaWrapper}>
                    {currentStory.mediaUrl.endsWith('.mp4') ? (
                        <Video
                            source={{ uri: currentStory.mediaUrl }}
                            style={styles.media}
                            resizeMode="cover"
                            paused={false}
                            repeat={false}
                        />
                    ) : (
                        <Image
                            source={{ uri: currentStory.mediaUrl }}
                            style={styles.media}
                            resizeMode="cover"
                        />
                    )}
                </View>

                {/* ✅ 상단바를 제외한 아래 영역에만 좌우 터치 적용 */}
                <View style={styles.touchOverlay}>
                    <TouchableWithoutFeedback onPress={handlePrev}>
                        <View style={styles.touchArea} />
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={handleNext}>
                        <View style={styles.touchArea} />
                    </TouchableWithoutFeedback>
                </View>
            </View>
        </Modal>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    progressBarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingTop: 50,
    },
    progressBarBackground: {
        flex: 1,
        height: 2.5,
        backgroundColor: '#555',
        marginHorizontal: 2,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarForeground: {
        backgroundColor: 'white',
        height: '100%',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    nickname: {
        color: 'white',
        fontSize: 16,
        flex: 1,
    },
    mediaWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    media: {
        width: '100%',
        height: '100%',
    },
    // 🔽 터치 영역은 미디어 위에만 표시
    touchOverlay: {
        position: 'absolute',
        bottom: 0, // 상단바 피해서 아래쪽부터 시작
        top: 100,  // 예: 상단바 높이 + 여유
        flexDirection: 'row',
        width: '100%',
        height: '100%',
    },

    touchArea: {
        width: '50%',
        height: '100%',
    },
});

export default StoryReelsModal;
