import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import boardStore, {Board} from '../../context/boardStore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {createThumbnail} from 'react-native-create-thumbnail';

const SCREEN_WIDTH = Dimensions.get('window').width;
const IS_TABLET = SCREEN_WIDTH >= 768;

// @ts-ignore
const UserPostsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {userId, userName} = route.params as {userId: number; userName: string};

  const {userBoardsMap, fetchUserBoards} = boardStore();
  const [posts, setPosts] = useState<Board[]>([]);
  const [thumbnailMap, setThumbnailMap] = useState<Record<number, string>>({}); // ✅ 썸네일 저장용 상태

  // ✅ 게시글 불러오기 (userId 변경 시마다)
  useEffect(() => {
    if (userId) {
      fetchUserBoards(userId);
    }
  }, [fetchUserBoards, userId]);

  // ✅ 게시글 목록 업데이트
  useEffect(() => {
    const userPosts = userBoardsMap[userId] || [];
    setPosts(userPosts);

    const loadThumbnails = async () => {
      const map: Record<number, string> = {};
      for (const post of userPosts) {
        if (
          post.titleImage.toLowerCase().endsWith('.mp4') ||
          post.titleImage.toLowerCase().includes('video')
        ) {
          try {
            const {path} = await createThumbnail({
              url: post.titleImage,
              timeStamp: 1000,
            });
            map[post.id] = path;
          } catch (err) {
            console.warn('❌ 썸네일 생성 실패:', err);
          }
        }
      }
      setThumbnailMap(map);
    };

    loadThumbnails();
  }, [userBoardsMap, userId]);

  /** 게시글 클릭 시 상세화면 이동 */
  const handlePostPress = (postId: number) => {
    // @ts-ignore
    navigation.navigate('StorybookDetailScreen', {boardId: postId});
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔙 헤더: 뒤로가기 + 유저 닉네임 출력 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back-ios" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.username}>
          {userName || '해당 유저'}님의 게시글
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* 📌 게시글 개수 출력 */}
      <Text style={styles.postCount}>총 {posts.length}개</Text>

      {/* 📝 게시글 리스트 */}
      <FlatList
        data={posts}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => {
          const isVideo =
            item.titleImage?.toLowerCase().endsWith('.mp4') ||
            item.titleImage?.toLowerCase().includes('video');
          const imageSource = isVideo
            ? {uri: thumbnailMap[item.id]}
            : {uri: item.titleImage};

          return (
            <TouchableOpacity
              style={styles.postCard}
              onPress={() => handlePostPress(item.id)}>
              <View style={styles.postContent}>
                <Text style={styles.postTitle}>{item.title}</Text>
                <Text style={styles.postDescription} numberOfLines={2}>
                  {item.titleContent}
                </Text>
                <View style={styles.metaInfo}>
                  <Text style={styles.metaText}>{item.author.nickname}</Text>
                  <Text style={styles.metaText}>
                    좋아요 {item.favoriteCount} ・ 댓글 {item.commentCount}
                  </Text>
                </View>
              </View>
              {item.titleImage && (
                <Image source={imageSource} style={styles.postImage} />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // 🔹 전체 배경을 아주 연한 회색으로
  },

  /** 🔙 헤더 */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 5,
  },
  username: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    color: '#111',
  },
  placeholder: {
    width: 24, // 아이콘 크기 맞추기
  },

  /** 📌 게시글 개수 */
  postCount: {
    fontSize: 13,
    color: '#666',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
  },

  /** 📝 게시글 카드 */
  postCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginVertical: 6,
    padding: 14,
    borderRadius: 10,
    width: '94%',
    maxWidth: IS_TABLET ? 650 : '95%',
    alignSelf: 'center',

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 5,
        borderWidth: 0.6,
        borderColor: '#E5E5E5', // 살짝 회색 라인
      },
    }),
  },

  postContent: {
    flex: 1,
    paddingRight: 10,
  },
  postTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  postDescription: {
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
    lineHeight: 18,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 11,
    color: '#999',
  },

  /** 🖼️ 썸네일 */
  postImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#EEE',
  },
});

export default UserPostsScreen;
