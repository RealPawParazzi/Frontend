import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';


interface MemoryVideoProps {
    video: { id: string; title: string; video: any };
}


/**
 * 📌 MemoryVideo 컴포넌트
 * - 추억 영상 섹션에서 동영상 플레이어를 관리
 */
const MemoryVideo = ({ video }: MemoryVideoProps) => {
    const [playing, setPlaying] = useState(false);

    return (
        <View style={styles.container}>
            {!playing ? (
                <>
                    <Image source={require('../assets/images/post-1.jpeg')} style={styles.image} />
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>초코네</Text>
                        <Text style={styles.subtitle}>오늘은 멍멍이 스벅 다녀옴 ~!!!</Text>
                    </View>
                    <TouchableOpacity style={styles.playButton} onPress={() => setPlaying(true)}>
                        <Icon name="play-circle" size={30} color="black" />
                    </TouchableOpacity>
                </>
            ) : (
                <Video
                    source={video.video}
                    style={styles.video}
                    controls
                    resizeMode="cover"
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
    image: { width: 120, height: 100, borderRadius: 10 },
    textContainer: { marginLeft: 10, flex: 1 },
    title: { fontSize: 16, fontWeight: 'bold' },
    subtitle: { fontSize: 12, color: 'gray' },
    playButton: { marginRight: 10 },
    video: { width: '100%', height: 200, borderRadius: 10 },
});

export default MemoryVideo;