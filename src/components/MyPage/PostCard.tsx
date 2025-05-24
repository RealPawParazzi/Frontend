import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {getImageSource} from '../../utils/imageUtils';
import {createThumbnail} from 'react-native-create-thumbnail';
import boardStore from '../../context/boardStore';
import userStore from '../../context/userStore';
import useSearchStore from '../../context/searchStore'; // ✅ 추가

const DEFAULT_PROFILE_IMAGE = require('../../assets/images/user-2.png');

/** ✅ 게시글 데이터 타입 */
interface Post {
  id: number;
  title: string;
  titleImage: string;
  titleContent: string;
  writeDatetime: string;
  favoriteCount: number;
  commentCount: number;
  author: {
    id: number;
    nickname: string;
    profileImageUrl: string;
  };
  tag?: string; // 태그는 선택적
}

/** ✅ 네비게이션 타입 */
type NavigationProp = StackNavigationProp<
  RootStackParamList,
  'StorybookDetailScreen'
>;

/** ✅ 게시물 카드 컴포넌트 */
const PostCard: React.FC<{post: Post}> = ({post}) => {
  const navigation = useNavigation<NavigationProp>();
  const {userData} = userStore(); // 로그인 유저
  const {deleteExistingBoard, fetchUserBoards} = boardStore(); // 삭제 및 새로고침

  // 썸네일 상태 추가
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);

  const isVideo =
    post.titleImage.toLowerCase().endsWith('.mp4') ||
    post.titleImage.toLowerCase().includes('video');

  // 썸네일 생성
  useEffect(() => {
    const generateThumbnail = async () => {
      if (isVideo) {
        try {
          const {path} = await createThumbnail({
            url: post.titleImage,
            timeStamp: 1000,
          });
          setThumbnailUri(path);
        } catch (error) {
          console.warn('썸네일 생성 실패:', error);
        }
      }
    };
    generateThumbnail();
  }, [isVideo, post.titleImage]);

  // ✅ 삭제 로직
  const handleDelete = () => {
    Alert.alert('삭제 확인', '정말 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteExistingBoard(post.id);
            await fetchUserBoards(Number(userData.id)); // 삭제 후 새로고침
            Alert.alert('삭제 완료', '게시글이 삭제되었습니다.');
          } catch (err) {
            Alert.alert('오류', '게시글 삭제 중 오류가 발생했습니다.');
            console.error('❌ 삭제 오류:', err);
          }
        },
      },
    ]);
  };

  // ✅ 햄버거 메뉴 옵션
  const handleOptions = () => {
    const isAuthor = post.author.nickname === userData.nickName;

    if (!isAuthor) {
      return;
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['수정하기 ✏️', '삭제하기 ❌', '취소'],
          cancelButtonIndex: 2,
          destructiveButtonIndex: 1,
        },
        buttonIndex => {
          if (buttonIndex === 0) {
            // @ts-ignore
            navigation.navigate('EditStorybookScreen', {boardId: post.id});
          } else if (buttonIndex === 1) {
            handleDelete();
          }
        },
      );
    } else {
      Alert.alert('게시글 관리', '수정 또는 삭제하시겠습니까?', [
        {
          text: '수정하기',
          onPress: () => {
            // @ts-ignore
            navigation.navigate('EditStorybookScreen', {boardId: post.id});
          },
        },
        {
          text: '삭제하기',
          style: 'destructive',
          onPress: handleDelete,
        },
        {text: '취소', style: 'cancel'},
      ]);
    }
  };

  return (
    <View style={styles.card}>
      {/* 🔹 상단 프로필 정보 + 작성 시간 + 옵션 버튼 */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Image
            source={getImageSource(
              post.author.profileImageUrl,
              DEFAULT_PROFILE_IMAGE,
            )}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.authorName}>{post.author.nickname}</Text>
            <Text style={styles.postTime}>
              {post.writeDatetime.split('T')[0]}
            </Text>
          </View>
        </View>

        {/* 🔹 옵션 버튼 (게시글 수정/삭제) */}
        {/* ✅ 로그인 유저가 작성자일 때만 햄버거 메뉴 출력 */}
        {post.author.nickname === userData.nickName && (
          <TouchableOpacity onPress={handleOptions}>
            <Icon name="more-vert" size={24} color="gray" />
          </TouchableOpacity>
        )}
      </View>

      {/* 🔹 게시글 메인 이미지 또는 동영상 */}
      {/* 🔹 게시글 메인 이미지 or 썸네일 이미지 */}
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('StorybookDetailScreen', {boardId: post.id})
        }>
        {isVideo ? (
          thumbnailUri ? (
            <Image source={{uri: thumbnailUri}} style={styles.postImage} />
          ) : (
            <View style={[styles.postImage, {backgroundColor: '#000'}]} />
          )
        ) : (
          <Image
            source={getImageSource(post.titleImage, DEFAULT_PROFILE_IMAGE)}
            style={styles.postImage}
          />
        )}
      </TouchableOpacity>

      {/* 🔹 타이틀 콘텐츠 */}
      <View style={styles.textWrapper}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.contentText}>{post.titleContent}</Text>
        {post.tag && <Text style={styles.tagText}>#{post.tag}</Text>}
      </View>


      {/* 🔹 하단 아이콘: 좋아요, 댓글 */}
      <View style={styles.footer}>
        <View style={styles.iconContainer}>
          <Icon name="favorite-border" size={20} color="gray" />
          <Text style={styles.iconText}>{post.favoriteCount}</Text>
        </View>

        <View style={styles.iconContainer}>
          <Icon name="chat-bubble-outline" size={20} color="gray" />
          <Text style={styles.iconText}>{post.commentCount}</Text>
        </View>
      </View>
    </View>
  );
};

/** ✅ 스타일 */
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1.5,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },

  authorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
  },

  postTime: {
    fontSize: 12,
    color: '#999',
  },

  postImage: {
    width: '100%',
    height: 260,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  textWrapper: {
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  contentText: {
    fontSize: 13,
    color: '#333',
    paddingTop: 6,
    lineHeight: 18,
  },
  tagText: {
    fontSize: 12,
    color: '#4D7CFE',
    marginTop: 6,
    fontWeight: '600',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },

  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },

  iconText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 4,
  },
});

export default PostCard;
