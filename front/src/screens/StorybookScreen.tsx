import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * 📖 StorybookScreen (스토리북 게시물 작성)
 * - 네이버 블로그 스타일의 게시물 작성 화면
 * - 제목 입력, 본문 작성, 텍스트 스타일 적용, 이미지 업로드 기능 제공
 */
const StorybookScreen = () => {
    const [title, setTitle] = useState(''); // 제목 추가
    const [story, setStory] = useState('');
    const [bold, setBold] = useState(false);
    const [italic, setItalic] = useState(false);
    const [underline, setUnderline] = useState(false);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>📖 반려동물 스토리북</Text>

            {/* ✅ 제목 입력란 */}
            <TextInput
                style={styles.titleInput}
                placeholder="제목을 입력하세요"
                value={title}
                onChangeText={setTitle}
            />

            {/* ✅ 텍스트 스타일 버튼 */}
            <View style={styles.toolbar}>
                <TouchableOpacity onPress={() => setBold(!bold)}>
                    <Text style={[styles.toolbarText, bold && styles.activeText]}>B</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setItalic(!italic)}>
                    <Text style={[styles.toolbarText, italic && styles.activeText]}>I</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setUnderline(!underline)}>
                    <Text style={[styles.toolbarText, underline && styles.activeText]}>U</Text>
                </TouchableOpacity>
            </View>

            {/* ✅ 본문 작성란 */}
            <TextInput
                style={[styles.input, bold && { fontWeight: 'bold' }, italic && { fontStyle: 'italic' }, underline && { textDecorationLine: 'underline' }]}
                placeholder="반려동물의 하루를 기록하세요!"
                multiline
                value={story}
                onChangeText={setStory}
            />

            {/* ✅ 이미지 추가 버튼 */}
            <TouchableOpacity style={styles.imageButton}>
                <Text style={styles.imageButtonText}>🖼️ 이미지 추가</Text>
            </TouchableOpacity>

            {/* ✅ 저장 버튼 */}
            <Button title="저장하기" onPress={() => alert('스토리 저장 완료!')} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    titleInput: { borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 10, fontSize: 16 },
    toolbar: { flexDirection: 'row', marginBottom: 10 },
    toolbarText: { marginRight: 10, fontSize: 16 },
    activeText: { color: 'blue' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10 },
    imageButton: { backgroundColor: '#FFD700', padding: 10, borderRadius: 5, alignItems: 'center', marginBottom: 10 },
    imageButtonText: { fontSize: 16, fontWeight: 'bold' },
});

export default StorybookScreen;
