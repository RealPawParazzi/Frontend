import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
    Image, Alert, SafeAreaView, ActivityIndicator, Switch,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import boardStore from '../context/boardStore';

/**
 * 📝 네이버 블로그 스타일 게시물 작성 화면
 */
const StorybookScreen = ({ navigation }: any) => {
    const [title, setTitle] = useState('');
    const [story, setStory] = useState('');
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [isPublic, setIsPublic] = useState(true); // ✅ 게시물 공개 여부 (기본값: 공개)
    const [loading, setLoading] = useState(false);
    const createNewBoard = boardStore((state) => state.createNewBoard); // Zustand에서 게시글 생성 함수 가져오기

    // ✅ 현재 날짜 가져오기
    const getCurrentDate = () => {
        const today = new Date();
        return today.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // ✅ 갤러리에서 이미지 선택
    const pickImage = async () => {
        await launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) {
                console.log('사용자가 이미지 선택 취소');
            } else if (response.errorMessage) {
                console.log('이미지 선택 오류:', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                const imageUri = response.assets[0].uri;
                if (imageUri) {
                    setSelectedImages((prev) => [...prev, imageUri]); // ✅ undefined 방지
                }
            }
        });
    };

    // ✅ 게시글 저장하기
    const handleSavePost = async () => {
        if (!title.trim() || !story.trim()) {
            Alert.alert('⚠️ 입력 오류', '제목과 내용을 입력해주세요.');
            return;
        }

        setLoading(true);

        try {
            const contents = [{ type: 'text', value: story }];
            selectedImages.forEach((img) => contents.push({ type: 'image', value: img }));

            await createNewBoard({
                title,
                visibility: isPublic ? 'PUBLIC' : 'FOLLOWERS', // ✅ 공개 범위 설정
                contents, // 자동으로 titleImage, titleContent가 설정됨
            });


            Alert.alert('✅ 등록 완료', '게시글이 성공적으로 등록되었습니다.', [
                { text: '확인', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            Alert.alert('❌ 등록 실패', '게시글 저장 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            {/* 상단 네비게이션 바 */}
            <View style={styles.navBar}>
                {/* 🔙 뒤로 가기 버튼 */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back-ios" size={24} color="#333" />
                </TouchableOpacity>

                {/* 📅 현재 날짜 */}
                <Text style={styles.navTitle}>{getCurrentDate()}</Text>

                {/* ✅ 등록 버튼 */}
                <TouchableOpacity onPress={handleSavePost} disabled={loading}>
                    {loading ? <ActivityIndicator size="small" color="#FF6F00" /> : <Text style={styles.saveButton}>등록</Text>}
                </TouchableOpacity>
            </View>

            {/* 공개 범위 토글 버튼 */}
            <View style={styles.visibilityContainer}>
                <Text style={styles.visibilityText}>{isPublic ? '공개' : '팔로워 전용'}</Text>
                <Switch
                    value={isPublic}
                    onValueChange={setIsPublic} // ✅ 공개 여부 토글
                    trackColor={{ false: '#767577', true: 'rgba(255,111,0,0.32)' }}
                    thumbColor={isPublic ? '#FF6F00' : '#f4f3f4'}
                    style={{ transform: [{ scale: 0.8 }] }} // ✅ 토글 크기 조절
                />
            </View>

            {/* 제목 입력 필드 */}
            <TextInput
                style={styles.titleInput}
                placeholder="제목"
                placeholderTextColor="#aaa"
                value={title}
                onChangeText={setTitle}
            />

            {/* 본문 입력 필드 */}
            <ScrollView style={styles.storyContainer}>
                <TextInput
                    style={styles.storyInput}
                    placeholder="본문에 #을 이용해 태그를 입력해보세요! (최대 30개)"
                    placeholderTextColor="#bbb"
                    multiline
                    value={story}
                    onChangeText={setStory}
                />
                {/* 선택한 이미지 미리보기 */}
                {selectedImages.map((image, index) => (
                    <Image key={index} source={{ uri: image }} style={styles.imagePreview} />
                ))}
            </ScrollView>

            {/* 하단 네비게이션 바 */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.bottomIcon} onPress={() => Alert.alert('이모티콘 기능 추가 예정')}>
                    <Text style={styles.iconText}>😊</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomIcon} onPress={pickImage}>
                    <Text style={styles.iconText}>🖼️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomIcon} onPress={() => Alert.alert('AI 이미지 생성 기능 추가 예정')}>
                    <Text style={styles.iconText}>✨</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// ✅ 스타일 정의
const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: '#FFF' },

    /* 🔺 상단 네비게이션 바 스타일 */
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderColor: '#EEE',
    },
    backButton: {
        padding: 8,
    },
    navTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    },
    saveButton: {
        fontSize: 16,
        color: '#FF6F00',
        fontWeight: 'bold',
    },

    /* 🔺 공개 범위 설정 */
    visibilityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    visibilityText: {
        fontSize: 16,
        fontWeight: 'bold',
    },

    /* 🔺 제목 입력 필드 */
    titleInput: {
        fontSize: 30,
        fontWeight: 'bold',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderColor: '#EEE',
        marginBottom: 8,
    },

    /* 🔺 본문 입력 필드 */
    storyContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 30,
    },
    storyInput: {
        fontSize: 16,
        color: '#333',
        minHeight: 300,
    },

    /* 🔺 선택된 이미지 스타일 */
    imagePreview: {
        width: '100%',
        height: 200,
        marginTop: 15,
        borderRadius: 10,
    },

    /* 🔺 하단 네비게이션 바 */
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 5,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderColor: '#EEE',
    },
    bottomIcon: {
        padding: 15,
    },
    iconText: {
        fontSize: 24,
    },
});

export default StorybookScreen;
