import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {SafeAreaView} from 'react-native-safe-area-context';

interface FAQ {
  question: string;
  answer: string;
}

const faqList: FAQ[] = [
  {
    question: 'AI 컨텐츠 생성은 무료인가요?',
    answer: '네, 현재는 모든 AI 컨텐츠 생성 기능을 무료로 제공하고 있습니다.',
  },
  {
    question: '제작, 업로드한 동영상은 어디에 저장되나요?',
    answer:
      '업로드된 동영상은 S3에 저장되며, 운영진의 관리하에 안전하게 보관됩니다.',
  },
  {
    question: '스토리는 며칠 동안 보여지나요?',
    answer: '스토리는 업로드 시점부터 24시간 동안 유지됩니다.',
  },
  {
    question: '스토리를 삭제하고 싶어요 !',
    answer: '스토리 우측 상단 옵션 버튼을 눌러 수정, 삭제할 수 있습니다.',
  },
  {
    question: '펫 산책 기록은 어디서 확인하나요?',
    answer: '맵 → 산책 기록 탭에서 반려동물 별로 확인하실 수 있습니다.',
  },
  {
    question: '내가 등록한 장소는 수정할 수 있나요?',
    answer: '장소 상세 페이지에서 “수정” 버튼을 통해 정보 변경이 가능합니다.',
  },
  {
    question: '게시글은 어떤 포맷으로 작성되나요?',
    answer:
      '사진, 동영상, 텍스트를 자유롭게 조합해 포스트를 작성할 수 있습니다.',
  },
  {
    question: '특정 유저를 신고하고 싶어요 !',
    answer:
      '궁금해요 탭 하단의 1:1 문의를 통해 남겨주시거나 홈페이지 하단 운영진에게 질문 탭에서 불편 사항을 건의하실 수 있습니다.',
  },
  {
    question: '앱은 오프라인에서도 사용 가능한가요?',
    answer:
      '일부 기능(조회 등)은 오프라인에서도 작동할 수 있으나, 업로드, 컨텐츠 제작 등은 불가능합니다.',
  },
  {
    question: '프로필 이미지는 어떻게 변경하나요?',
    answer:
      '마이페이지 → 우측 상단 메뉴 탭 → 프로필 편집에서 이미지 변경이 가능합니다.',
  },
];

/**
 * ✅ 궁금해요 화면
 * - 사용자가 궁금한 점을 질문할 수 있는 페이지
 */

const CuriousScreen = () => {
  const navigation = useNavigation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAnswer = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <SafeAreaView edges={['top']} style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}> 자주 묻는 질문 </Text>
        {faqList.map((item, index) => (
          <View key={index} style={styles.faqItem}>
            <TouchableOpacity
              onPress={() => toggleAnswer(index)}
              style={styles.questionRow}>
              <Text style={styles.questionText}>
                {String(index + 1).padStart(2, '0')} {item.question}
              </Text>
              <Icon
                name={openIndex === index ? 'expand-less' : 'expand-more'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
            {openIndex === index && (
              <Text style={styles.answerText}>{item.answer}</Text>
            )}
          </View>
        ))}

        <Text style={styles.noResultText}>찾으시는 질문이 없다면?</Text>

        <TouchableOpacity
          style={styles.askButton}
          //@ts-ignore
          onPress={() => navigation.navigate('CuriousQuestionScreen')}>
          <Text style={styles.askButtonText}>1:1 문의하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#222',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 14,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  answerText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    paddingLeft: 8,
    lineHeight: 20,
  },
  askButton: {
    marginTop: 10,
    backgroundColor: '#4d7cfe',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  askButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noResultText: {
    marginTop: 30,
    marginBottom: 5,
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
  },
});

export default CuriousScreen;
