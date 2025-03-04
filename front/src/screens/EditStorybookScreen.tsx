import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
    Image, Alert, SafeAreaView, ActivityIndicator, Switch,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import boardStore from '../context/boardStore';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

/**
 * 📄 스토리북 게시글 수정 페이지
 * ✅ 사용자는 제목, 본문 내용을 편집하고, 이미지를 추가/삭제할 수 있음
 * ✅ 저장 버튼을 누르면 기존 데이터를 업데이트하고, 업데이트된 내용을 `fetchBoardDetail`을 통해 다시 불러옴
 */

// 📌 네비게이션 라우트 타입 지정
type EditStorybookScreenRouteProp = RouteProp<RootStackParamList, 'EditStorybookScreen'>;

const EditStorybookScreen = ({ route, navigation }: { route: EditStorybookScreenRouteProp, navigation: any }) => {
    const { boardId } = route.params; // ✅ 네비게이션에서 전달받은 boardId
    const fetchBoardDetail = boardStore((state) => state.fetchBoardDetail); // ✅ 게시글 데이터 불러오기
    const updateExistingBoard = boardStore((state) => state.updateExistingBoard); // ✅ 게시글 업데이트
    const selectedBoard = boardStore((state) => state.selectedBoard); // ✅ 현재 선택된 게시글 정보

    // ✅ 컴포넌트 상태
    const [title, setTitle] = useState('');
    const [story, setStory] = useState('');
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(true);

    // ✅ 게시글 상세 데이터 불러오기
    useEffect(() => {
        const loadPost = async () => {
            setLoading(true); // 🔄 로딩 시작
            try {
                await fetchBoardDetail(boardId); // 🟢 게시글 데이터 가져오기
            } catch (error) {
                Alert.alert('❌ 오류', '게시글을 불러오는 중 문제가 발생했습니다.');
                navigation.goBack();
            } finally {
                setLoading(false); // 🔄 로딩 종료
            }
        };

        loadPost();
    }, [boardId, fetchBoardDetail, navigation]);

    // ✅ `selectedBoard`가 변경될 때마다 상태 업데이트
    useEffect(() => {
        if (selectedBoard && selectedBoard.id === boardId) {
            setTitle(selectedBoard.title);
            setStory(selectedBoard.contents.find((c: any) => c.type === 'text')?.value || '');
            setSelectedImages(selectedBoard.contents.filter((c: any) => c.type === 'image').map((c: any) => c.value));
            setIsPublic(selectedBoard.visibility === 'PUBLIC');
        }
    }, [selectedBoard, boardId]);

    // ✅ 이미지 선택 기능 (이미지 라이브러리에서 선택)
    const pickImage = async () => {
        await launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) {
                console.log('🚫 사용자가 이미지 선택 취소');
            } else if (response.errorMessage) {
                console.log('❌ 이미지 선택 오류:', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                const imageUri = response.assets[0].uri;
                if (imageUri) {
                    setSelectedImages((prev) => [...prev, imageUri]); // ✅ 선택한 이미지 추가
                }
            }
        });
    };

    // ✅ 선택된 이미지 삭제 기능
    const removeImage = (index: number) => {
        setSelectedImages(selectedImages.filter((_, i) => i !== index));
    };

    // ✅ 게시글 업데이트 함수
    const handleUpdatePost = async () => {
        if (!title.trim() || !story.trim()) {
            Alert.alert('⚠️ 입력 오류', '제목과 내용을 입력해주세요.');
            return;
        }

        setLoading(true); // 🔄 업데이트 시작

        try {
            // 📌 업데이트할 데이터 준비
            const contents = [{ type: 'text', value: story }];
            selectedImages.forEach((img) => contents.push({ type: 'image', value: img }));

            // ✅ 게시글 업데이트 API 호출
            await updateExistingBoard(boardId, {
                title,
                visibility: isPublic ? 'PUBLIC' : 'FOLLOWERS',
                contents,
            });

            // ✅ 업데이트 후 데이터 다시 불러오기
            await fetchBoardDetail(boardId);

            Alert.alert('✅ 수정 완료', '게시글이 성공적으로 수정되었습니다.', [
                { text: '확인', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            Alert.alert('❌ 수정 실패', '게시글 수정 중 오류가 발생했습니다.');
        } finally {
            setLoading(false); // 🔄 업데이트 종료
        }
    };

    // ✅ 로딩 중일 때 표시할 UI
    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#FF6F00" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeContainer}>
            {/* ✅ 상단 네비게이션 바 */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back-ios" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>게시글 수정</Text>
                <TouchableOpacity onPress={handleUpdatePost} disabled={loading}>
                    {loading ? <ActivityIndicator size="small" color="#FF6F00" /> : <Text style={styles.saveButton}>저장</Text>}
                </TouchableOpacity>
            </View>

            {/* ✅ 공개 여부 토글 */}
            <View style={styles.visibilityContainer}>
                <Text style={styles.visibilityText}>{isPublic ? '공개' : '팔로워 전용'}</Text>
                <Switch
                    value={isPublic}
                    onValueChange={setIsPublic}
                    trackColor={{ false: '#767577', true: 'rgba(255,111,0,0.32)' }}
                    thumbColor={isPublic ? '#FF6F00' : '#f4f3f4'}
                    style={{ transform: [{ scale: 0.8 }] }}
                />
            </View>

            {/* 제목 입력 */}
            <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
            />

            {/* 본문 입력 */}
            <ScrollView style={styles.storyContainer}>
                <TextInput
                    style={styles.storyInput}
                    multiline
                    value={story}
                    onChangeText={setStory}
                />
                {/* 선택된 이미지 미리보기 및 삭제 버튼 */}
                {selectedImages.map((image, index) => (
                    <View key={index} style={styles.imageContainer}>
                        <Image source={{ uri: image }} style={styles.imagePreview} />
                        <TouchableOpacity style={styles.deleteImageButton} onPress={() => removeImage(index)}>
                            <MaterialIcons name="close" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            {/* 이미지 추가 버튼 */}
            <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                <Text style={styles.addImageText}>🖼️ 이미지 추가</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

// ✅ 스타일 정의
const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: '#FFF' },
    navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#EEE' },
    backButton: { padding: 8 },
    navTitle: { fontSize: 18, fontWeight: 'bold' },
    saveButton: { fontSize: 16, color: '#FF6F00', fontWeight: 'bold' },
    visibilityContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
    visibilityText: { fontSize: 16, fontWeight: 'bold' },
    titleInput: { fontSize: 24, fontWeight: 'bold', padding: 20, borderBottomWidth: 1, borderColor: '#EEE' },
    storyContainer: { flex: 1, padding: 20 },
    storyInput: { fontSize: 16, minHeight: 300 },
    imageContainer: { position: 'relative' },
    imagePreview: { width: '100%', height: 200, borderRadius: 10, marginTop: 15 },
    deleteImageButton: { position: 'absolute', top: 5, right: 5, backgroundColor: 'black', borderRadius: 20, padding: 5 },
    addImageButton: { padding: 15, backgroundColor: '#FF6F00', alignItems: 'center' },
    addImageText: { fontSize: 16, color: 'white' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default EditStorybookScreen;
