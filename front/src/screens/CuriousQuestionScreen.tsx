// 📁 screens/CuriousQuestionScreen.tsx

import React, {useState} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import useQuestionStore from '../context/questionStore';
import {SafeAreaView} from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker'; // ✅ 드롭다운 Picker 추가


const CuriousQuestionScreen = () => {
  const navigation = useNavigation();
  const {submitInquiry, isLoading} = useQuestionStore();

  // ✅ 상태 관리
  const [titleOption, setTitleOption] = useState(''); // 선택된 제목 옵션
  const [customTitle, setCustomTitle] = useState(''); // 직접 입력 제목
  const [content, setContent] = useState(''); // 문의 내용

  const isCustomTitle = titleOption === '직접 작성하기';
  const finalTitle = isCustomTitle ? customTitle : titleOption;

  // ✅ 제출 핸들러
  const handleSubmit = async () => {
    if (!finalTitle.trim() || !content.trim()) {
      Alert.alert('입력 오류', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      await submitInquiry(finalTitle, content);
      Alert.alert('문의 완료', '문의가 성공적으로 등록되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('오류', '문의 등록 중 문제가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.wrapper}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          {/* ✅ 상단 안내 문구 */}
          <Text style={styles.title}>운영진에게 직접 질문해주세요 !</Text>

          {/* ✅ 제목 선택 드롭다운 */}
          <Text style={styles.label}>문의 유형 선택</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={titleOption}
              onValueChange={(itemValue) => setTitleOption(itemValue)}>
              <Picker.Item label="문의 제목을 선택해주세요" value="" enabled={false} />
              <Picker.Item label="AI 오류 문의" value="AI 오류 문의" />
              <Picker.Item label="기능 요청" value="기능 요청" />
              <Picker.Item label="사용법이 궁금해요" value="사용법이 궁금해요" />
              <Picker.Item label="버그 제보" value="버그 제보" />
              <Picker.Item label="기타 문의" value="기타 문의" />
              <Picker.Item label="제안 및 피드백" value="제안 및 피드백" />
              <Picker.Item label="운영진에게 질문" value="운영진에게 질문" />
              <Picker.Item label="유저 신고" value="유저 신고" />
              <Picker.Item label="직접 작성하기" value="직접 작성하기" />
            </Picker>
          </View>

          {/* ✅ 직접 제목 입력 필드 (선택 시 노출) */}
          {isCustomTitle && (
            <>
              <Text style={styles.label}>제목 입력</Text>
              <TextInput
                style={styles.input}
                value={customTitle}
                onChangeText={setCustomTitle}
                placeholder="제목을 입력해주세요"
                placeholderTextColor="#aaa"
              />
            </>
          )}

          {/* ✅ 내용 입력 */}
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

          {/* ✅ 제출 버튼 */}
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
    </SafeAreaView>
  );
};

/**
 * ✅ 스타일
 * - 화면 구성 요소에 대한 스타일을 정의합니다.
 */
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4d7cfe',
    marginBottom: 15,
    marginTop: 70,
    textAlign: 'center',
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
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
