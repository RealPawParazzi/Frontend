import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MemoryVideo = () => {
    return (
        <View style={styles.container}>
            <Image source={{ uri: 'https://your-image-url.com/memory.jpg' }} style={styles.image} />
            <View style={styles.textContainer}>
                <Text style={styles.title}>초코네</Text>
                <Text style={styles.subtitle}>오늘은 멍멍이 스벅 다녀옴 ~!!!</Text>
            </View>
            <TouchableOpacity style={styles.playButton}>
                <Icon name="play-circle" size={30} color="black" />
            </TouchableOpacity>
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
});

export default MemoryVideo;
