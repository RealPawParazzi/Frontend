import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

/**
 * 🎥 VideoEditorScreen (동영상 편집 화면)
 * - 사용자가 동영상을 선택할 수 있음
 * - (기본적으로 동영상 편집 기능은 없고, 추후 추가 가능)
 */
const VideoEditorScreen = () => {
    const [videoUri, setVideoUri] = useState<string | null>(null);

    // ✅ 동영상 선택 함수
    const pickVideo = () => {
        launchImageLibrary({ mediaType: 'video' }, (response) => {
            if (response.didCancel) {
                Alert.alert('취소됨', '동영상 선택이 취소되었습니다.');
            } else if (response.errorMessage) {
                Alert.alert('오류', response.errorMessage);
            } else {
                setVideoUri(response.assets?.[0]?.uri || null);
            }
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎥 동영상 만들기</Text>

            <TouchableOpacity style={styles.button} onPress={pickVideo}>
                <Text style={styles.buttonText}>동영상 선택하기</Text>
            </TouchableOpacity>

            {videoUri && <Text style={styles.videoText}>선택된 동영상: {videoUri}</Text>}
        </View>
    );
};

// ✅ 스타일 정의
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF3E0' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    button: { backgroundColor: 'orange', padding: 12, borderRadius: 10, width: '80%', alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 16 },
    videoText: { marginTop: 15, color: 'black' },
});

export default VideoEditorScreen;
