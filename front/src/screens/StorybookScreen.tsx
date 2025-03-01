import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, SafeAreaView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // ✅ MaterialIcons 사용

/**
 * 📝 네이버 블로그 스타일 게시물 작성 화면
 */
const StorybookScreen = ({ navigation }: any) => {
    const [title, setTitle] = useState('');
    const [story, setStory] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) {
                console.log('사용자가 이미지 선택 취소');
            } else if (response.errorMessage) {
                console.log('이미지 선택 오류:', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                setSelectedImage(response.assets[0].uri || null); // 이미지 상태 저장
            }
        });
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
                <TouchableOpacity onPress={() => Alert.alert('게시물이 저장되었습니다.')}>
                    <Text style={styles.saveButton}>등록</Text>
                </TouchableOpacity>
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
                {/* 선택한 이미지 표시 */}
                {selectedImage && <Image source={{ uri: selectedImage }} style={styles.imagePreview} />}
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
        padding: 8, // 터치하기 쉽게 패딩 추가
    },
    navTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1, // 중앙 정렬을 위해 flex 추가
    },
    saveButton: {
        fontSize: 16,
        color: '#FF6F00',
        fontWeight: 'bold',
    },

    /* 🔺 제목 입력 필드 */
    titleInput: {
        fontSize: 25, // 제목 폰트 크기 증가
        fontWeight: 'bold',
        paddingHorizontal: 25, // 좌우 여백 추가
        paddingVertical: 16, // 높이 증가
        borderBottomWidth: 1,
        borderColor: '#EEE',
        marginBottom: 8,
    },

    /* 🔺 본문 입력 필드 */
    storyContainer: {
        flex: 1,
        paddingHorizontal: 25, // 좌우 여백 증가
        paddingTop: 10,
        paddingBottom: 30, // 하단 네비게이션과 간격 추가
    },
    storyInput: {
        fontSize: 16,
        color: '#333',
        minHeight: 300, // 기본 높이 추가
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
        paddingVertical: 5, // 크기 조정
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderColor: '#EEE',
    },
    bottomIcon: {
        padding: 15, // 터치 영역 키우기
    },
    iconText: {
        fontSize: 24, // 아이콘 크기 증가
    },
});

export default StorybookScreen;
