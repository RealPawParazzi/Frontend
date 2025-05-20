// 📁 screens/CuriousQuestionScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useQuestionStore from '../context/questionStore';

const CuriousQuestionScreen = () => {
  const navigation = useNavigation();
  const { submitInquiry, isLoading } = useQuestionStore();

  // ✅ 입력값 상태
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // ✅ 제출 핸들러
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('입력 오류', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      await submitInquiry(title, content);
      Alert.alert('문의 완료', '문의가 성공적으로 등록되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      Alert.alert('오류', '문의 등록 중 문제가 발생했습니다.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Text style={styles.label}>제목</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="제목을 입력해주세요"
          placeholderTextColor="#aaa"
        />

        <Text style={styles.label}>내용</Text>
        <TextInput
          style={styles.textarea}
          value={content}
          onChangeText={setContent}
          placeholder="문의하실 내용을 자세히 입력해주세요"
          placeholderTextColor="#aaa"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.button, isLoading && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>문의 보내기</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
    color: '#000',
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    height: 150,
    fontSize: 15,
    color: '#000',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#4d7cfe',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CuriousQuestionScreen;
