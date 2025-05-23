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
    paddingHorizontal: 15,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderColor: '#eee',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  username: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    color: 'gray',
  },
  storyImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginTop: 8,
  },
  content: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 4,
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 13,
    marginLeft: 4,
    color: '#777',
  },
});

export default StoryBookCard;
