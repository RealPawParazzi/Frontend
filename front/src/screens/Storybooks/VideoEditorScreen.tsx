// screens/VideoEditorScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
    ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video';
import { useAIvideoStore } from '../../context/AIvideoStore';

const VideoEditorScreen: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [duration, setDuration] = useState('5');
    const [imageFile, setImageFile] = useState<{
        uri: string;
        name: string;
        type: string;
    } | null>(null);

    const status = useAIvideoStore((s) => s.status);
    const finalUrl = useAIvideoStore((s) => s.finalUrl);
    const error = useAIvideoStore((s) => s.error);
    const startGeneration = useAIvideoStore((s) => s.startGeneration);

    const pickImage = () => {
        launchImageLibrary({ mediaType: 'photo', quality: 1 }, (res) => {
            if (res.didCancel) { return; }
            if (res.errorMessage) {
                Alert.alert('오류', res.errorMessage);
                return;
            }
            const asset = res.assets?.[0];
            if (asset?.uri && asset.fileName && asset.type) {
                setImageFile({
                    uri: asset.uri,
                    name: asset.fileName,
                    type: asset.type,
                });
            }
        });
    };


    // ✅ 생성 요청 처리
    const handleGenerate = async () => {
        if (!prompt.trim()) {
            Alert.alert('입력 오류', '프롬프트를 입력해주세요.');
            return;
        }
        if (!imageFile) {
            Alert.alert('입력 오류', '이미지를 선택해주세요.');
            return;
        }
        if (isNaN(Number(duration)) || Number(duration) <= 0) {
            Alert.alert('입력 오류', '유효한 지속 시간(초)을 입력해주세요.');
            return;
        }

        try {
            await startGeneration(prompt.trim(), duration, imageFile);
        } catch (e: any) {
            Alert.alert('요청 실패', e.message || '알 수 없는 오류가 발생했습니다.');
        }
    };





    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎥 AI 동영상 생성</Text>

            <TextInput
                style={styles.input}
                placeholder="원하는 동영상 줄거리 입력하기"
                value={prompt}
                onChangeText={setPrompt}
            />
            <TextInput
                style={styles.input}
                placeholder="몇초짜리 영상을 만들까? (ex: 5)"
                keyboardType="numeric"
                value={duration}
                onChangeText={setDuration}
            />

            <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Text style={styles.buttonText}>
                    {imageFile ? '✅ 이미지 선택됨' : '이미지 선택하기'}
                </Text>
            </TouchableOpacity>

            {imageFile && (
                <Image
                    source={{ uri: imageFile.uri }}
                    style={styles.preview}
                    resizeMode="cover"
                />
            )}

            <TouchableOpacity
                style={styles.generateButton}
                onPress={handleGenerate}
                disabled={status === 'PENDING' || status === 'IN_PROGRESS'}>
                <Text style={styles.buttonText}>
                    {status === 'PENDING' || status === 'IN_PROGRESS' ? '생성 중...' : '동영상 생성하기'}
                </Text>
            </TouchableOpacity>

            {(status === 'PENDING' || status === 'IN_PROGRESS') && (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            )}
            {error && <Text style={styles.errorText}>❌ 오류: {error}</Text>}

            {finalUrl && (
                <>
                    <Text style={styles.resultLabel}>✅ 생성 완료!</Text>
                    <Video
                        source={{ uri: finalUrl }}
                        style={styles.video}
                        controls
                        resizeMode="contain"
                        paused={true} // 수정: 자동 재생 방지
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#FFF3E0' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginBottom: 12 },
    button: { backgroundColor: '#4D7CFE', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
    generateButton: { backgroundColor: '#FF6F00', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#FFF', fontWeight: 'bold' },
    preview: { width: '100%', height: 200, borderRadius: 8, marginBottom: 12 },
    errorText: { color: 'red', marginTop: 12 },
    resultLabel: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
    video: { width: '100%', height: 250, backgroundColor: '#000' },
});

export default VideoEditorScreen;


