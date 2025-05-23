// 📁 StoryBookCard.tsx
import React, {useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import Video from 'react-native-video';
import {createThumbnail} from 'react-native-create-thumbnail';

interface StoryBookCardProps {
  id: number;
  titleImage: string;
  titleContent: string;
  writeDatetime: string;
  author: {
    nickname: string;
    profileImageUrl: string;
  };
  favoriteCount: number;
  commentCount: number;
  viewCount: number;
}

const StoryBookCard: React.FC<{story: StoryBookCardProps}> = ({story}) => {
  const navigation = useNavigation();

  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);

  const isVideo =
    story.titleImage.toLowerCase().endsWith('.mp4') ||
    story.titleImage.toLowerCase().includes('video');

  // ✅ 썸네일 생성
  useEffect(() => {
    const generateThumbnail = async () => {
      if (isVideo) {
        try {
          const { path } = await createThumbnail({ url: story.titleImage, timeStamp: 1000 });
          setThumbnailUri(path);
          console.log('썸네일 생성 성공:', path);
        } catch (err) {
          console.warn('썸네일 생성 실패:', err);
        }
      }
    };
    generateThumbnail();
  }, [isVideo, story.titleImage]);

  // ✅ 상세 페이지 이동
  const handlePress = () => {
    // @ts-ignore
    navigation.navigate('StorybookDetailScreen', {boardId: story.id});
  };

  return (
    <View style={styles.card}>
      {/* 🔹 상단 정보 */}
      <View style={styles.header}>
        <Image
          source={{uri: story.author.profileImageUrl}}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.username}>{story.author.nickname}</Text>
          <Text style={styles.meta}>
            {new Date(story.writeDatetime).toLocaleDateString()}
          </Text>
        </View>
        <Icon name="more-vert" size={20} color="gray" />
      </View>

      {/* ✅ 이미지 or 썸네일 */}
      <TouchableOpacity onPress={handlePress}>
        {story.titleImage &&
          (isVideo ? (
            thumbnailUri ? (
              <Image source={{ uri: thumbnailUri }} style={styles.storyImage} />
            ) : (
              <View style={[styles.storyImage, { backgroundColor: '#000' }]} />
            )
          ) : (
            <Image source={{ uri: story.titleImage }} style={styles.storyImage} />
          ))}
      </TouchableOpacity>

      {/* 🔹 콘텐츠 텍스트 */}
      <Text style={styles.content}>{story.titleContent}</Text>

      {/* 🔹 하단 아이콘 */}
      <View style={styles.footer}>
        <View style={styles.iconGroup}>
          <Icon name="favorite-border" size={18} color="#888" />
          <Text style={styles.iconText}>{story.favoriteCount}</Text>
        </View>
        <View style={styles.iconGroup}>
          <Icon name="chat-bubble-outline" size={18} color="#888" />
          <Text style={styles.iconText}>{story.commentCount}</Text>
        </View>
        <View style={styles.iconGroup}>
          <Icon name="visibility" size={18} color="#888" />
          <Text style={styles.iconText}>{story.viewCount}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 25,
    marginVertical: 10,
    marginHorizontal: 5,

    // iOS
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,

    // Android
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  info: {
    flex: 1,
    marginLeft: 10,
  },
  username: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  meta: {
    fontSize: 12,
    color: 'gray',
  },
  storyImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#000',
  },
  content: {
    fontSize: 14,
    color: '#444',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 4,
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 13,
    marginLeft: 4,
    color: '#555',
  },
});

export default StoryBookCard;
