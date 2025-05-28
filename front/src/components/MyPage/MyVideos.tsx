import React, {useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {createThumbnail} from 'react-native-create-thumbnail';
import boardStore from '../../context/boardStore';

const screenWidth = Dimensions.get('window').width;
const isTablet = screenWidth >= 768;

const CARD_MARGIN = 10;
const CARD_WIDTH = isTablet
  ? (screenWidth - CARD_MARGIN * 3) / 2 // 2열: 좌우 + 가운데 간격
  : screenWidth - CARD_MARGIN * 2;      // 1열: 좌우 여백만


const DEFAULT_THUMBNAIL = require('../../assets/images/user-2.png');

interface Props {
  userId: number;
}

/** ✅ MyVideos: 동영상 게시글 썸네일 목록 컴포넌트 */
const MyVideos: React.FC<Props> = ({userId}) => {
  const navigation = useNavigation();
  const {userBoardsMap} = boardStore();

  // ✅ 사용자 게시글 목록 가져오기
  const myBoards = useMemo(
    () => userBoardsMap[userId] || [],
    [userBoardsMap, userId],
  );

  // ✅ 동영상이 포함된 게시글 필터링
  const videoBoards = useMemo(() => {
    return myBoards.filter(post => {
      const hasVideoInContents = post.contents?.some(
        c =>
          c.type === 'File' &&
          typeof c.value === 'string' &&
          (c.value.endsWith('.mp4') || c.value.endsWith('.mov')),
      );

      const hasVideoInTitleImage =
        typeof post.titleImage === 'string' &&
        (post.titleImage.endsWith('.mp4') || post.titleImage.endsWith('.mov'));

      return hasVideoInContents || hasVideoInTitleImage;
    });
  }, [myBoards]);

  // ✅ 썸네일과 게시글 정보 저장용 상태
  const [videoWithThumbs, setVideoWithThumbs] = useState<
    {boardId: number; title: string; thumbnail: string}[]
  >([]);

  // ✅ 썸네일 생성 useEffect
  useEffect(() => {
    const generateThumbnails = async () => {
      const results: {boardId: number; title: string; thumbnail: string}[] = [];

      for (const post of videoBoards) {
        const videoUrl =
          post.contents?.find(
            c =>
              c.type === 'File' &&
              typeof c.value === 'string' &&
              (c.value.endsWith('.mp4') || c.value.endsWith('.mov')),
          )?.value ||
          (typeof post.titleImage === 'string' &&
          (post.titleImage.endsWith('.mp4') || post.titleImage.endsWith('.mov'))
            ? post.titleImage
            : '');

        if (videoUrl) {
          try {
            const {path} = await createThumbnail({
              url: videoUrl,
              timeStamp: 1000,
            });

            results.push({
              boardId: post.id,
              title: post.titleContent,
              thumbnail: path,
            });
          } catch (err) {
            console.warn('❌ 썸네일 생성 실패:', err);
          }
        }
      }

      setVideoWithThumbs(results);
    };

    generateThumbnails();
  }, [videoBoards]);

  const getImageSource = (thumbnail: string | undefined, defaultImage: any) => {
    return thumbnail ? { uri: thumbnail } : defaultImage;
  };


  return (
    <FlatList
      data={videoWithThumbs}
      numColumns={isTablet ? 2 : 1} // ✅ 아이패드일 경우 2열 출력
      keyExtractor={item => item.boardId.toString()}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.card, { width: CARD_WIDTH }]} // ✅ 카드 너비 적용
          onPress={() => {
            // @ts-ignore
            navigation.navigate('StorybookDetailScreen', { boardId: item.boardId });
          }}>
          <Image
            source={getImageSource(item.thumbnail, DEFAULT_THUMBNAIL)}
            style={styles.thumbnail}
          />
          <View style={styles.caption}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title || '제목 없는 영상'}
            </Text>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.noPosts}>🎥 영상이 포함된 게시글이 없습니다!</Text>
          <Text style={styles.suggestion}>첫 게시글을 업로드 해볼까요?</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('StorybookScreen');
            }}>
            <Text style={styles.uploadButtonText}>+ 새 게시글 작성</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
};

/** ✅ 스타일 정의 */
const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: CARD_MARGIN,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 16,
    marginRight: isTablet ? CARD_MARGIN : 0, // ✅ 두 번째 열 마진 제외 가능
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f1f1f1',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(245,245,245,0.75)',
  },
  caption: {
    backgroundColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
    margin: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  noPosts: {fontSize: 18, fontWeight: 'bold', color: '#444', marginBottom: 5},
  suggestion: {fontSize: 14, color: 'gray', marginBottom: 15},
  uploadButton: {
    backgroundColor: '#4D7CFE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fullHeightCenter: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
});

export default MyVideos;
