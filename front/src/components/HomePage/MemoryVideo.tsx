// 📽️ MemoryVideo.tsx - 게시글 영상 랜덤 5개 슬라이드 배너
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
import boardStore from '../../context/boardStore'; // 게시글 스토어로 변경

const screenWidth = Dimensions.get('window').width;

const MemoryVideo = () => {
    const { boardList } = boardStore();

    // 동영상 포함 게시글 필터링 후 랜덤 5개 선택
    const randomVideoBoards = useMemo(() => {
        const videoBoards = boardList.filter((board) => {
            const hasVideoInContents = board.contents?.some(
                (content) =>
                    content.type === 'File' && content.value.toLowerCase().endsWith('.mp4')
            );
            const hasVideoInTitleImage =
                typeof board.titleImage === 'string' &&
                board.titleImage.toLowerCase().endsWith('.mp4');

            return hasVideoInContents || hasVideoInTitleImage;
        });

        const shuffled = [...videoBoards].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 5);
    }, [boardList]);

    const [playingBoardId, setPlayingBoardId] = useState<number | null>(null);


    return (
        <View style={styles.sliderContainer}>
            <FlatList
                data={randomVideoBoards}
                horizontal
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const videoUrl =
                        typeof item.titleImage === 'string' &&
                        item.titleImage.toLowerCase().endsWith('.mp4')
                            ? item.titleImage
                            : item.contents?.find(
                                (c) => c.type === 'File' && c.value.toLowerCase().endsWith('.mp4')
                            )?.value;

                    return (
                        <View style={styles.card}>
                            {playingBoardId === item.id && videoUrl ? (
                                // ✅ 재생 중인 영상
                                <Video
                                    source={{ uri: videoUrl }}
                                    style={styles.video}
                                    controls
                                    resizeMode="cover"
                                />
                            ) : (
                                // ✅ 썸네일처럼 정지된 영상 보여주기
                                <TouchableOpacity
                                    onPress={() => {
                                        setPlayingBoardId(item.id); // ✅ 재생 시작
                                    }}
                                    activeOpacity={0.9}
                                >
                                    <Video
                                        source={{ uri: videoUrl! }}
                                        style={styles.image} // 썸네일용 정지화면
                                        paused
                                        resizeMode="cover"
                                    />
                                    {/* 제목 & 닉네임 */}
                                    <View style={styles.textContainer}>
                                        <Text style={styles.title} numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                        <Text style={styles.subtitle}>{item.author.nickname}</Text>
                                    </View>
                                    {/* 재생 버튼은 View로만 처리 */}
                                    <View style={styles.playButton}>
                                        <Icon name="play-circle" size={30} color="white" />
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                }}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 10 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    sliderContainer: {
        marginTop: 20,
    },
    card: {
        width: screenWidth * 0.8,
        height: 180, // 카드 자체도 고정
        marginRight: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
    },
    image: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
        backgroundColor: '#000',
    },
    textContainer: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 12,
        color: '#ccc',
        marginTop: 2,
    },
    playButton: {
        position: 'absolute',
        bottom: 15,
        right: 15,
    },
    video: {
        width: '100%',
        height: 180,
    },
});

export default MemoryVideo;

