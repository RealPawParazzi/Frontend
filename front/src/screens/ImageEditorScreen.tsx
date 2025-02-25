import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

/**
 * 🖼️ ImageEditorScreen (이미지 편집 화면)
 * - 사용자가 이미지를 선택할 수 있음
 * - (기본적으로 필터나 편집 기능 없음, 추후 추가 가능)
 */
const ImageEditorScreen = () => {
    const [imageUri, setImageUri] = useState<string | null>(null);

    // ✅ 이미지 선택 함수
    const pickImage = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) {
                Alert.alert('취소됨', '이미지 선택이 취소되었습니다.');
            } else if (response.errorMessage) {
                Alert.alert('오류', response.errorMessage);
            } else {
                setImageUri(response.assets?.[0]?.uri || null);
            }
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🖼️ 이미지 만들기</Text>

            <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Text style={styles.buttonText}>이미지 선택하기</Text>
            </TouchableOpacity>

            {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
        </View>
    );
};

// ✅ 스타일 정의
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF3E0' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    button: { backgroundColor: 'orange', padding: 12, borderRadius: 10, width: '80%', alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 16 },
    image: { width: 200, height: 200, marginTop: 20, borderRadius: 10 },
});

export default ImageEditorScreen;
