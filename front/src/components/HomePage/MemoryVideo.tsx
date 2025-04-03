// 📽️ MemoryVideo.tsx - 게시글 영상 랜덤 5개 슬라이드 배너
import React, { useState, useMemo } from 'react';
import {
    View,
    Image,
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
                    //  수정된 부분: 재생할 video URL 우선순위 결정
                    const videoUrl =
                        typeof item.titleImage === 'string' &&
                        item.titleImage.toLowerCase().endsWith('.mp4')
                            ? item.titleImage
                            : item.contents?.find(
                                (c) =>
                                    c.type === 'File' &&
                                    c.value.toLowerCase().endsWith('.mp4')
                            )?.value;

                    return (
                        <View style={styles.card}>
                            {playingBoardId === item.id && videoUrl ? (
                                <Video
                                    source={{ uri: videoUrl }}
                                    style={styles.video}
                                    controls
                                    resizeMode="cover"
                                />
                            ) : (
                                <>
                                    {/* 썸네일: 게시글 대표 이미지 또는 fallback */}
                                    <Image
                                        source={
                                            typeof item.titleImage === 'string' &&
                                            item.titleImage.toLowerCase().endsWith('.mp4')
                                                ? require('../../assets/images/post-2.jpg') // fallback 이미지
                                                : typeof item.titleImage === 'string'
                                                    ? { uri: item.titleImage }
                                                    : item.titleImage
                                        }
                                        style={styles.image}
                                    />
                                    <View style={styles.textContainer}>
                                        <Text style={styles.title} numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                        <Text style={styles.subtitle}>기억 속의 영상</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.playButton}
                                        onPress={() => setPlayingBoardId(item.id)}
                                    >
                                        <Icon name="play-circle" size={30} color="black" />
                                    </TouchableOpacity>
                                </>
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
        height: 140,
        resizeMode: 'cover',
    },
    textContainer: {
        padding: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 12,
        color: 'gray',
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

