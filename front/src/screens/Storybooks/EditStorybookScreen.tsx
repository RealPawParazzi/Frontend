import React, {useState, useEffect, useRef} from 'react';
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
import Video from 'react-native-video'; // 비디오 컴포넌트 추가
import {launchImageLibrary} from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import boardStore from '../../context/boardStore';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../../navigation/AppNavigator';
import TagInputModal from '../../components/TagInputModal';

/**
 * 📄 스토리북 게시글 수정 화면
 * ✅ 사용자는 제목, 본문 내용을 편집하고, 이미지를 추가/삭제할 수 있음
 * ✅ 저장 버튼을 누르면 기존 데이터를 업데이트하고, 업데이트된 내용을 `fetchBoardDetail`을 통해 다시 불러옴
 * ✅ 네이버 블로그 스타일 with 드래그 앤 드롭, 대표 이미지 설정
 */

// 🧩 콘텐츠 블록 타입 정의
interface BlockItem {
  type: 'Text' | 'File'; // File 타입으로 통일
  value: string;
}

// 📌 네비게이션 라우트 타입 지정
type EditStorybookScreenRouteProp = RouteProp<
  RootStackParamList,
  'EditStorybookScreen'
>;

const EditStorybookScreen = ({
  route,
  navigation,
}: {
  route: EditStorybookScreenRouteProp;
  navigation: any;
}) => {
  const {boardId} = route.params; // 🔹 전달받은 게시글 ID
  const fetchBoardDetail = boardStore(state => state.fetchBoardDetail);
  const updateExistingBoard = boardStore(state => state.updateExistingBoard);
  const selectedBoard = boardStore(state => state.selectedBoard); // ✅ 현재 선택된 게시글 정보

  // ✅ 상태 정의
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [titleImage, setTitleImage] = useState<string | null>(null); // 대표 이미지 URI
  const [isPublic, setIsPublic] = useState(true); // 공개 여부
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  const [tags, setTags] = useState<string[]>([]);
  const [tagModalVisible, setTagModalVisible] = useState(false);

  const bottomBarAnim = useRef(new Animated.Value(0)).current;

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

  // ✅ 게시글 상세 불러오기 (초기 진입 시)
  useEffect(() => {
    const loadPost = async () => {
      setLoading(true); // 🔄 로딩 시작
      try {
        await fetchBoardDetail(boardId); // 🟢 서버에서 게시글 데이터 가져오기
      } catch (error) {
        Alert.alert('❌ 오류', '게시글을 불러오는 중 문제가 발생했습니다.');
        navigation.goBack();
      } finally {
        setLoading(false); // 🔄 로딩 종료
      }
    };

    loadPost();
  }, [boardId, fetchBoardDetail, navigation]);

  // ✅ selectedBoard가 변경되면 입력 필드 상태에 반영
  useEffect(() => {
    if (selectedBoard && selectedBoard.id === boardId) {
      const contents = selectedBoard.contents || [];
      // 타입 변환을 통해 BlockItem[] 형식으로 맞춤
      const convertedContents = contents.map(content => ({
        type: content.type === 'image' ? 'File' : content.type,
        value: content.value,
      })) as BlockItem[];
      setTitle(selectedBoard.title);
      setBlocks(
        convertedContents.length > 0
          ? convertedContents
          : [{type: 'Text', value: ''}],
      );
      setTitleImage(selectedBoard.titleImage || null);
      setIsPublic(selectedBoard.visibility === 'PUBLIC');
      setTags(selectedBoard.tag ? selectedBoard.tag.split(', ') : []);
    }

    console.log('❗️현재 선택된 게시글: ', selectedBoard);
  }, [selectedBoard, boardId]);

  // ✅ 텍스트 블록 업데이트
  const updateTextBlock = (index: number, text: string) => {
    setBlocks(prev =>
      prev.map((b, i) => (i === index ? {...b, value: text} : b)),
    );
  };

  // ✅ 이미지/동영상 선택 시 블록 추가 (이미지 라이브러리에서 선택)
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
            setBlocks(prev => {
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

  // ✅ 블록 삭제 함수 (이미지 또는 텍스트)
  const removeBlock = (index: number) => {
    Alert.alert('컨텐츠 삭제', '해당 컨텐츠를 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          setBlocks(prev => {
            const updated = prev.filter((_, i) => i !== index);
            // 삭제 후 연속된 텍스트 병합
            if (
              index > 0 &&
              updated[index - 1]?.type === 'Text' &&
              updated[index]?.type === 'Text'
            ) {
              const merged = updated[index - 1].value + updated[index].value;
              updated.splice(index - 1, 2, {type: 'Text', value: merged});
            }
            return updated;
          });
        },
      },
    ]);
  };

  // ✅ 게시글 수정 요청 처리
  const handleUpdatePost = async () => {
    const validBlocks = blocks.filter(b => b.value.trim() !== ''); // 공백 제거
    const textBlocks = validBlocks.filter(b => b.type === 'Text');
    const firstText = textBlocks[0]?.value || '내용 없음'; // titleContent 설정용
    const imageBlocks = validBlocks.filter(b => b.type === 'File');
    // 🔸 파일 업로드용 mediaFiles
    const mediaFiles = imageBlocks.map(({value}) => ({
      uri: value,
      name: value.split('/').pop() || `media_${Date.now()}`,
      type: value.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg',
    }));

    // 🔸 대표 이미지 coverImage (없으면 undefined)
    const coverImage = titleImage
      ? {
          uri: titleImage,
          name: titleImage.split('/').pop() || `cover_${Date.now()}`,
          type: titleImage.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg',
        }
      : undefined;

    // 🔸 유효성 검사
    if (
      !title.trim() ||
      validBlocks.length === 0 ||
      blocks.every(b => b.value.trim() === '')
    ) {
      Alert.alert('⚠️ 입력 오류', '제목과 내용을 입력해주세요.');
      return;
    }

    if (imageBlocks.length === 0) {
      Alert.alert(
        '⚠️ 미디어 누락',
        '게시물에는 하나 이상의 사진 또는 동영상이 포함되어야 합니다.',
      );
      return;
    }

    setLoading(true); // 🔄 업데이트 시작

    try {
      // 🔸 게시글 업데이트 요청
      await updateExistingBoard(
        boardId,
        {
          title,
          visibility: isPublic ? 'PUBLIC' : 'FOLLOWERS',
          contents: validBlocks,
        },
        mediaFiles as any[],
        coverImage as any,
        firstText,
        tags.join(', '), // ✅ 여기에 tag 추가!
      );

      // 🔸 게시글 수정 요청 콘솔 찍어보기
      console.log('게시글 수정 요청:', {
        title,
        visibility: isPublic ? 'PUBLIC' : 'FOLLOWERS',
        contents: validBlocks,
        mediaFiles,
        coverImage,
        firstText,
        tags: tags.join(', '),
      });

      await fetchBoardDetail(boardId); // 수정 후 다시 데이터 불러오기
      Alert.alert('✅ 수정 완료', '게시글이 성공적으로 수정되었습니다.', [
        {text: '확인', onPress: () => navigation.goBack()},
      ]);
    } catch (e) {
      Alert.alert('❌ 수정 실패', '게시글 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ 로딩 중
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4D7CFE" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* ✅ 상단 네비게이션 바 */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>게시글 수정</Text>
        <TouchableOpacity onPress={handleUpdatePost} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#4D7CFE" />
          ) : (
            <Text style={styles.saveButton}>저장</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 제목 입력 */}
      <TextInput
        style={styles.titleInput}
        placeholder="제목"
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

      {/* 본문 입력 */}
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
                  multiline
                  // index === 0일 때만 placeholder 표시
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
                    <MaterialIcons name="close" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          {/* 🔽 마지막 빈 공간을 누르면 새 텍스트 블록 추가 */}
          <TouchableOpacity
            activeOpacity={1}
            style={{minHeight: 100}}
            onPress={() => {
              // 이미 마지막이 빈 텍스트 블록이면 추가 안 함
              const last = blocks[blocks.length - 1];
              if (!(last?.type === 'Text' && last.value === '')) {
                setBlocks(prev => [...prev, {type: 'Text', value: ''}]);
                setTimeout(() => {
                  scrollRef.current?.scrollToEnd({animated: true});
                }, 100);
              }
            }}
          />
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

      <Animated.View style={[styles.bottomBar, {bottom: bottomBarAnim}]}>
        <TouchableOpacity
          style={styles.bottomIcon}
          onPress={() => setIsPublic(prev => !prev)}>
          <MaterialIcons
            name={isPublic ? 'public' : 'lock'}
            size={28}
            color={isPublic ? '#4D7CFE' : '#aaa'}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomIcon} onPress={pickMedia}>
          <MaterialIcons name="add-photo-alternate" size={28} color="#4D7CFE" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomIcon}
          onPress={() =>
            Alert.alert('준비 중!', 'AI 기능은 곧 추가될 예정입니다.')
          }>
          <MaterialIcons name="smart-toy" size={28} color="#aaa" />
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  backButton: {padding: 8},
  navTitle: {fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1},
  saveButton: {fontSize: 16, color: '#4D7CFE', fontWeight: 'bold'},
  titleInput: {
    fontSize: 30,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: '#EEE',
    marginBottom: 8,
  },
  // 추가된 스타일 정의
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
    top: 10,
    left: 10,
    backgroundColor: '#4D7CFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,

    borderRadius: 5,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    marginTop: 6,
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
  // 스타일 추가
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
  iconText: {fontSize: 22},
  loader: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});

export default EditStorybookScreen;
