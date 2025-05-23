import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getImageSource} from '../../utils/imageUtils';
import {createThumbnail} from 'react-native-create-thumbnail'; // ✅ 동영상 썸네일 생성 라이브러리
import boardStore from '../../context/boardStore';

const DEFAULT_PROFILE_IMAGE = require('../../assets/images/user-2.png');

interface Props {
  userId: number;
}

const MyPhotos: React.FC<Props> = ({userId}) => {
  const navigation = useNavigation();
  const {userBoardsMap} = boardStore();

  // ✅ 게시글 중 대표 이미지가 있는 것만 필터링
  const myBoards = userBoardsMap[userId] || [];
  const photoBoards = myBoards.filter(board => !!board.titleImage);

  // ✅ 게시글 ID별 썸네일 URI 저장용 상태
  const [thumbnailMap, setThumbnailMap] = useState<Record<number, string>>({});

  /** ✅ 컴포넌트 마운트 시 썸네일 생성 */
  useEffect(() => {
    const loadThumbnails = async () => {
      const map: Record<number, string> = {};

      for (const board of photoBoards) {
        const isVideo =
          board.titleImage.toLowerCase().endsWith('.mp4') ||
          board.titleImage.toLowerCase().includes('video');

        if (isVideo) {
          try {
            const {path} = await createThumbnail({
              url: board.titleImage,
              timeStamp: 1000, // ✅ 1초 지점에서 썸네일 생성
            });
            map[board.id] = path;
          } catch (err) {
            console.warn('❌ 썸네일 생성 실패:', err);
          }
        }
      }

      setThumbnailMap(map);
    };

    loadThumbnails();
  }, [photoBoards]);

  return (
    <FlatList
      data={photoBoards}
      keyExtractor={item => item.id.toString()}
      numColumns={3} // ✅ 3열 출력
      renderItem={({item}) => {
        // ✅ 대표 이미지가 동영상인지 여부 확인
        const isVideo =
          item.titleImage.toLowerCase().endsWith('.mp4') ||
          item.titleImage.toLowerCase().includes('video');

        // ✅ 동영상이면 썸네일, 아니면 이미지 자체
        const imageSource = isVideo
          ? {uri: thumbnailMap[item.id]}
          : getImageSource(item.titleImage, DEFAULT_PROFILE_IMAGE);

        return (
          <TouchableOpacity
            style={styles.photoContainer}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('StorybookDetailScreen', {boardId: item.id});
            }}>
            <Image source={imageSource} style={styles.photo} />
          </TouchableOpacity>
        );
      }}
    />
  );
};


const styles = StyleSheet.create({
  photoContainer: {
    flex: 1 / 3,
    aspectRatio: 1, // ✅ 정사각형 비율 유지
    margin: 1,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: 'rgba(245,245,245,0.75)', // ✅ 썸네일 로딩 전 대비
  },
});

export default MyPhotos;
