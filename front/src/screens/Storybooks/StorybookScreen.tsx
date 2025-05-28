import React, {useEffect, useRef, useState} from 'react';
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
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import {launchImageLibrary} from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import boardStore from '../../context/boardStore';
import TagInputModal from '../../components/TagInputModal';
import {createThumbnail} from 'react-native-create-thumbnail';
import {predictPetBreed} from '../../services/breedService';
import {useDiaryStore} from '../../context/diaryStore'; // ✅ Zustand store 사용으로 변경

// 🧩 콘텐츠 블록 타입 정의
interface BlockItem {
  type: 'Text' | 'File'; // File 타입으로 통일
  value: string;
}

/**
 * 📝 네이버 블로그 스타일 게시물 작성 화면 (드래그 앤 드롭, 대표 이미지 지정 포함)
 */
const StorybookScreen = ({navigation, route}: any) => {
  const videoUri = route?.params?.videoUri ?? null; // 🔥 생성된 영상 URI 받아오기

  const [title, setTitle] = useState('');
  const [titleImage, setTitleImage] = useState<string | null>(null); // ✅ 대표 이미지 URI 저장
  const [blocks, setBlocks] = useState<BlockItem[]>([
    {type: 'Text', value: ''},
  ]);
  const [tagModalVisible, setTagModalVisible] = useState(false); // 모달 열기/닫기 상태
  const [tags, setTags] = useState<string[]>([]); // 태그 리스트
  const [isPublic, setIsPublic] = useState(true); // ✅ 게시물 공개 여부 (기본값: 공개)
  const [generatingDiary, setGeneratingDiary] = useState(false); // ✅ AI 일기 생성 상태
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const createNewBoard = boardStore(state => state.createNewBoard); // Zustand에서 게시글 생성 함수 가져오기
  const {createDiary} = useDiaryStore(); // ✅ 상태에서 일기 생성 메서드 가져오기

  const bottomBarAnim = useRef(new Animated.Value(0)).current;

  const [isPredicting, setIsPredicting] = useState(false);

  // 🔥 전달받은 영상이 있을 경우 블록 초기화
  useEffect(() => {
    if (videoUri) {
      setBlocks([
        {type: 'File', value: videoUri},
        {type: 'Text', value: ''},
      ]);
      setTitleImage(videoUri); // 자동으로 대표 미디어 설정
    }
  }, [videoUri]);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillShow', e => {
      Animated.timing(bottomBarAnim, {
        toValue: e.endCoordinates.height,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    });

    const hide = Keyboard.addListener('keyboardWillHide', () => {
      Animated.timing(bottomBarAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, [bottomBarAnim]);

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
                nextBlocks[0].type === 'Text' &&
                nextBlocks[0].value.trim() === ''
              ) {
                nextBlocks.pop();
              }
              return [
                ...nextBlocks,
                {type: 'File', value: mediaUri},
                {type: 'Text', value: ''},
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
              newBlocks[index - 1]?.type === 'Text' &&
              newBlocks[index]?.type === 'Text'
            ) {
              const mergedValue =
                newBlocks[index - 1].value + '\n' + newBlocks[index].value;
              newBlocks.splice(index - 1, 2, {
                type: 'Text',
                value: mergedValue,
              });
            }

            return newBlocks;
          });
        },
      },
    ]);
  };

  const handleBreedPrediction = async (imageUri: string) => {
    if (!imageUri) {
      return;
    }

    try {
      setIsPredicting(true); // 🔄 시작
      const finalImageUri = await generateThumbnailIfNeeded(imageUri);
      console.log('🔍 이미지 URI:', finalImageUri);
      const result = await predictPetBreed(finalImageUri);
      console.log('✅ 예측된 품종:', result);

      // 이미 존재하지 않는 경우에만 태그로 추가
      if (!tags.includes(result.breed)) {
        setTags(prev => [...prev, result.breed]);
      }

      Alert.alert('🐶 AI 태그 생성 완료', `생성된 태그: ${result.breed}`);
    } catch (err) {
      Alert.alert(
        '❌ AI 태그 생성 실패',
        '이미지 분석 중 오류가 발생했습니다.',
      );
    } finally {
      setIsPredicting(false); // 🔁 종료
    }
  };

  const generateThumbnailIfNeeded = async (uri: string) => {
    if (uri.toLowerCase().endsWith('.mp4')) {
      const {path} = await createThumbnail({url: uri, timeStamp: 1000});
      return path;
    }
    return uri;
  };

  const handleAIContentGeneration = async () => {
    const firstText = blocks.find(b => b.type === 'Text' && b.value.trim());
    if (!title.trim() || !firstText) {
      return Alert.alert(
        '⚠️ 조건 누락',
        '제목과 내용 중 하나 이상이 필요합니다.',
      );
    }
    console.log('AI 일기 생성 요청 내용:', title, firstText.value);
    try {
      setGeneratingDiary(true);
      const createdDiary = await createDiary(title, firstText.value); // ✅ 생성된 일기 받기
      if (createdDiary) {
        setTitle(createdDiary.title || '');
        setBlocks([{type: 'Text', value: createdDiary.content || ''}]);
      }

      console.log('AI 일기 생성 결과:', createdDiary);
      Alert.alert('✅ 생성 완료', 'AI 일기가 성공적으로 생성되었습니다.');
    } catch (err: any) {
      Alert.alert('❌ 생성 실패', err.message || 'AI 일기 생성 중 오류');
    } finally {
      setGeneratingDiary(false);
    }
  };

  const hasTextOrTitle =
    title.trim() !== '' ||
    blocks.some(b => b.type === 'Text' && b.value.trim() !== '');

  // ✅ 게시글 저장하기
  const handleSavePost = async () => {
    const validBlocks = blocks.filter(b => b.value.trim() !== '');
    const textBlocks = validBlocks.filter(b => b.type === 'Text');
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

    // ✅ 미디어 포함 여부 확인
    const imageBlocks = validBlocks.filter(b => b.type === 'File');
    if (imageBlocks.length === 0) {
      Alert.alert(
        '⚠️ 미디어 누락',
        '사진이나 동영상 중 하나 이상 포함되어야 합니다.',
      );
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
        tags.join(', '), // ✅ 콤마로 연결된 문자열로 변환하여 tag 파라미터에 전달
      );

      console.log('🟡 게시글 등록 요청 데이터:');
      console.log('📝 boardPayload:', boardPayload);
      console.log('🖼️ mediaFiles:', mediaFiles);
      console.log('🏞️ coverImage:', coverImage);
      console.log('📌 titleContent:', firstText);
      console.log('🏷️ tags:', tags);

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
            <ActivityIndicator size="small" color="#4D7CFE" />
          ) : (
            <Text style={styles.saveButton}>등록</Text>
          )}
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

      {tags.length > 0 && (
        <View style={styles.tagWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tagChip}>
                <Text style={styles.tagText}>#{tag}</Text>
                <TouchableOpacity
                  onPress={() =>
                    setTags(prev => prev.filter((_, i) => i !== index))
                  }>
                  <MaterialIcons name="close" size={16} color="#aaa" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 콘텐츠 영역 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.storyContainer}>
          {blocks.map((block, index) => (
            <View key={index} style={{marginBottom: 16}}>
              {block.type === 'Text' ? (
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
                    style={[styles.representativeTag, {top: 45}]}
                    onPress={() => handleBreedPrediction(block.value)}
                    disabled={isPredicting} // 로딩 중 중복 클릭 방지
                  >
                    {isPredicting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={{color: 'white', fontWeight: 'bold'}}>
                        + AI 태그
                      </Text>
                    )}
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

      {/* ➕ Floating Action Button (태그 추가용) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setTagModalVisible(true)}>
        <MaterialIcons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <TagInputModal
        visible={tagModalVisible}
        onClose={() => setTagModalVisible(false)}
        onAddTag={newTag => {
          if (!tags.includes(newTag)) {
            setTags([...tags, newTag]);
          }
        }}
      />

      {/* 하단 네비게이션 바 */}
      <Animated.View style={[styles.bottomBar, {bottom: bottomBarAnim}]}>
        {/* 버튼들 */}
        {/* 🔁 공개 범위 토글 버튼으로 변경 */}
        <TouchableOpacity
          style={styles.bottomIcon}
          onPress={() => setIsPublic(prev => !prev)}>
          <MaterialIcons
            name={isPublic ? 'public' : 'lock'}
            size={30}
            color={isPublic ? '#4D7CFE' : '#aaa'}
          />
          {/*<Text style={[styles.iconLabel, {color: isPublic ? '#4D7CFE' : '#aaa'}]}>*/}
          {/*  {isPublic ? '공개' : '팔로워'}*/}
          {/*</Text>*/}
        </TouchableOpacity>
        {/* 🖼️ 미디어 추가 */}
        <TouchableOpacity style={styles.bottomIcon} onPress={pickMedia}>
          <MaterialIcons name="add-photo-alternate" size={30} color="#4D7CFE" />
          {/*<Text style={styles.iconLabel}>미디어</Text>*/}
        </TouchableOpacity>
        {/* ✨ AI 기능 자리 */}
        <TouchableOpacity
          style={styles.bottomIcon}
          disabled={!hasTextOrTitle || generatingDiary}
          onPress={handleAIContentGeneration}>
          {generatingDiary ? (
            <ActivityIndicator size="small" color="#4D7CFE" />
          ) : (
            <MaterialIcons
              name="smart-toy"
              size={30}
              color={hasTextOrTitle ? '#4D7CFE' : '#aaa'}
            />
          )}
        </TouchableOpacity>
      </Animated.View>
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
    paddingVertical: 7,
    borderBottomWidth: 1.5,
    borderColor: '#EEE',
  },
  backButton: {padding: 8},
  navTitle: {fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1},
  saveButton: {fontSize: 18, color: '#4D7CFE', fontWeight: 'bold'},
  titleInput: {
    fontSize: 30,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1.5,
    borderColor: '#EEE',
    marginBottom: 8,
  },
  tagWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },

  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },

  tagText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 4,
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
    backgroundColor: '#4D7CFE',
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
    borderTopWidth: 3,
    borderColor: '#EEE',
    backgroundColor: '#FFF',
    position: 'absolute',
    width: '100%',
    height: 75,
  },
  bottomIcon: {
    width: 60,
    height: 60,
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 95, // 하단바 위에 떠 있도록
    right: 20,
    width: 57,
    height: 57,
    borderRadius: 30,
    backgroundColor: '#4D7CFE',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  iconText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default StorybookScreen;
