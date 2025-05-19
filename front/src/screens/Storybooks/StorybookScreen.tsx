import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import {launchImageLibrary} from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import boardStore from '../../context/boardStore';

// 🧩 콘텐츠 블록 타입 정의
interface BlockItem {
  type: 'text' | 'File'; // File 타입으로 통일
  value: string;
}

/**
 * 📝 네이버 블로그 스타일 게시물 작성 화면 (드래그 앤 드롭, 대표 이미지 지정 포함)
 */
const StorybookScreen = ({navigation}: any) => {
  const [title, setTitle] = useState('');
  const [titleImage, setTitleImage] = useState<string | null>(null); // ✅ 대표 이미지 URI 저장
  const [blocks, setBlocks] = useState<BlockItem[]>([
    {type: 'text', value: ''},
  ]);
  const [isPublic, setIsPublic] = useState(true); // ✅ 게시물 공개 여부 (기본값: 공개)
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const createNewBoard = boardStore(state => state.createNewBoard); // Zustand에서 게시글 생성 함수 가져오기

  // ✅ 현재 날짜 가져오기
  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // ✅ 갤러리에서 이미지/ 동영상 선택 후 블록 추가
  const pickMedia = async () => {
    await launchImageLibrary(
      {
        mediaType: 'mixed',
        quality: 1,
        videoQuality: 'high',
      },
      response => {
        if (response.didCancel) {
          console.log('사용자가 미디어 선택 취소');
        } else if (response.errorMessage) {
          console.log('미디어 선택 오류:', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const mediaUri = response.assets[0].uri;

          if (mediaUri) {
            setBlocks((prev: BlockItem[]) => {
              const nextBlocks = [...prev];
              if (
                nextBlocks.length === 1 &&
                nextBlocks[0].type === 'text' &&
                nextBlocks[0].value.trim() === ''
              ) {
                nextBlocks.pop();
              }
              return [
                ...nextBlocks,
                {type: 'File', value: mediaUri},
                {type: 'text', value: ''},
              ];
            });
            setTimeout(() => {
              scrollRef.current?.scrollToEnd({animated: true});
            }, 100);
          }
        }
      },
    );
  };

  // ✅ 텍스트 블록 수정
  const updateTextBlock = (index: number, text: string) => {
    setBlocks(prev =>
      prev.map((b, i) => (i === index ? {...b, value: text} : b)),
    );
  };

  // ✅ 블록 삭제하기
  // 수정된 부분: 블록 삭제 및 텍스트 병합 처리
  const removeBlock = (index: number) => {
    Alert.alert('삭제 확인', '해당 컨텐츠를 삭제할까요?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          setBlocks(prev => {
            const newBlocks = [...prev];
            const removed = newBlocks.splice(index, 1)[0];

            // 👇 삭제된 블록이 이미지이고, 앞뒤가 모두 텍스트일 경우 병합
            if (
              removed.type === 'File' &&
              newBlocks[index - 1]?.type === 'text' &&
              newBlocks[index]?.type === 'text'
            ) {
              const mergedValue =
                newBlocks[index - 1].value + '\n' + newBlocks[index].value;
              newBlocks.splice(index - 1, 2, {
                type: 'text',
                value: mergedValue,
              });
            }

            return newBlocks;
          });
        },
      },
    ]);
  };

  // ✅ 게시글 저장하기
  const handleSavePost = async () => {
    const validBlocks = blocks.filter(b => b.value.trim() !== '');
    const textBlocks = validBlocks.filter(b => b.type === 'text');
    const firstText = textBlocks[0]?.value || '내용 없음';

    // 🔒 텍스트 블록이 하나도 없을 경우 저장 방지
    if (textBlocks.length === 0) {
      Alert.alert(
        '⚠️ 입력 오류',
        '최소 하나 이상의 텍스트가 포함되어야 합니다.',
      );
      return;
    }

    if (
      !title.trim() &&
      validBlocks.length === 0 &&
      blocks.every(b => b.value.trim() === '')
    ) {
      Alert.alert('⚠️ 입력 오류', '제목과 내용은 필수 항목입니다.');
      return;
    }

    setLoading(true);

    try {
      // 컨텐츠 파일 추출
      const imageBlocks = validBlocks.filter(b => b.type === 'File');

      // ✅ imageUris 배열을 변환
      const mediaFiles = imageBlocks.map(({value}) => {
        const fileName = value.split('/').pop() || `media_${Date.now()}`;
        const isVideo =
          value.toLowerCase().endsWith('.mp4') ||
          value.toLowerCase().includes('video');
        return {
          uri: String(value),
          name: fileName,
          type: isVideo ? 'video/mp4' : 'image/jpeg',
        };
      });

      // ✅ 대표 이미지도 타입 맞춰 처리
      const coverImage = titleImage
        ? {
            uri: String(titleImage),
            name: titleImage.split('/').pop() || `cover_${Date.now()}`,
            type:
              titleImage.toLowerCase().endsWith('.mp4') ||
              titleImage.toLowerCase().includes('video')
                ? 'video/mp4'
                : 'image/jpeg',
          }
        : undefined;

      const boardPayload = {
        title: String(title),
        visibility: isPublic ? 'PUBLIC' : 'FOLLOWERS',
        contents: validBlocks.map(block => ({
          ...block,
          value: String(block.value),
        })),
      };

      await createNewBoard(
        boardPayload,
        mediaFiles as any[],
        coverImage as any,
        firstText,
      );

      console.log('🟡 게시글 등록 요청 데이터:');
      console.log('📝 boardPayload:', boardPayload);
      console.log('🖼️ mediaFiles:', mediaFiles);
      console.log('🏞️ coverImage:', coverImage);
      console.log('📌 titleContent:', firstText);

      Alert.alert('✅ 등록 완료', '게시글이 성공적으로 등록되었습니다.', [
        {text: '확인', onPress: () => navigation.goBack()},
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#333" />
        </TouchableOpacity>

        {/* 📅 현재 날짜 */}
        <Text style={styles.navTitle}>{getCurrentDate()}</Text>

        {/* ✅ 등록 버튼 */}
        <TouchableOpacity onPress={handleSavePost} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#FF6F00" />
          ) : (
            <Text style={styles.saveButton}>등록</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 공개 범위 토글 버튼 */}
      <View style={styles.visibilityContainer}>
        <Text style={styles.visibilityText}>
          {isPublic ? '공개' : '팔로워 전용'}
        </Text>
        <Switch
          value={isPublic}
          onValueChange={setIsPublic} // ✅ 공개 여부 토글
          trackColor={{false: '#767577', true: 'rgba(127,148,159,0.57)'}}
          thumbColor={isPublic ? '#4D7CFE' : '#f4f3f4'}
          style={{transform: [{scale: 0.8}]}} // ✅ 토글 크기 조절
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

      {/* 콘텐츠 영역 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.storyContainer}>
          {blocks.map((block, index) => (
            <View key={index} style={{marginBottom: 16}}>
              {block.type === 'text' ? (
                <TextInput
                  ref={ref => (inputRefs.current[index] = ref)}
                  multiline
                  // 조건: 첫 번째 텍스트 블록일 경우에만 placeholder 보이기
                  placeholder={index === 0 ? '내용 입력' : undefined}
                  style={styles.textArea}
                  value={block.value}
                  onChangeText={text => updateTextBlock(index, text)}
                />
              ) : (
                <View>
                  {block.value.toLowerCase().endsWith('.mp4') ||
                  block.value.toLowerCase().includes('video') ? (
                    <Video
                      source={
                        block.value ? {uri: String(block.value)} : undefined
                      }
                      style={styles.mediaPreview}
                      resizeMode="cover"
                      controls={true}
                      paused={true}
                    />
                  ) : (
                    <Image
                      source={
                        block.value
                          ? {uri: String(block.value)}
                          : require('../../assets/images/user-2.png')
                      }
                      style={styles.mediaPreview}
                    />
                  )}
                  <TouchableOpacity
                    style={styles.representativeTag}
                    onPress={() => setTitleImage(block.value)}>
                    <Text style={{color: 'white', fontWeight: 'bold'}}>
                      {titleImage === block.value
                        ? '대표 미디어 ✓'
                        : '대표 지정'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => removeBlock(index)}>
                    <MaterialIcons
                      name={Platform.OS === 'ios' ? 'close' : 'close'}
                      size={20}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 하단 네비게이션 바 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomIcon}
          onPress={() =>
            Alert.alert('😎 준비 중!', '이모티콘 기능은 곧 추가됩니다.')
          }>
          <Text style={styles.iconText}>😊</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomIcon} onPress={pickMedia}>
          <Text style={styles.iconText}>🖼️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomIcon}
          onPress={() =>
            Alert.alert('✨ 준비 중!', 'AI 기능은 곧 추가됩니다.')
          }>
          <Text style={styles.iconText}>✨</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ✅ 스타일 정의
const styles = StyleSheet.create({
  safeContainer: {flex: 1, backgroundColor: '#FFF'},
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  backButton: {padding: 8},
  navTitle: {fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1},
  saveButton: {fontSize: 16, color: '#4D7CFE', fontWeight: 'bold'},
  visibilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  visibilityText: {fontSize: 16, fontWeight: 'bold'},
  titleInput: {
    fontSize: 30,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#EEE',
    marginBottom: 8,
  },
  storyContainer: {paddingHorizontal: 20, paddingBottom: 80},
  storyInput: {
    fontSize: 16,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 10,
  },
  textArea: {fontSize: 16, color: '#333', minHeight: 40, paddingVertical: 8},
  mediaPreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: '#000',
  },
  representativeTag: {
    position: 'absolute',
    top: 15,
    left: 5,
    backgroundColor: '#00C853',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  deleteButton: {
    position: 'absolute',
    top: 15,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 5,
    borderRadius: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#EEE',
    backgroundColor: '#FFF',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 99,
  },
  bottomIcon: {padding: 10},
  iconText: {fontSize: 22},
});

export default StorybookScreen;
