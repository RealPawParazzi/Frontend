// 📁 screens/MyGeneratedVideosScreen.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import {createThumbnail} from 'react-native-create-thumbnail';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {useAIvideoStore} from '../context/AIvideoStore';
import {GeneratedVideo} from '../services/AIvideoService'; // 타입 정의 파일
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import VideoPreviewModal from '../components/VideoPreviewModal';

dayjs.extend(utc);
dayjs.extend(timezone);

const MyGeneratedVideosScreen = () => {
  const navigation = useNavigation();
  const {fetchAllVideos} = useAIvideoStore();
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [thumbnails, setThumbnails] = useState<{[key: number]: string}>({});

  // ✅ 영상 불러오기
  useEffect(() => {
    (async () => {
      const data = await fetchAllVideos();
      setVideos(data);
    })();
  }, [fetchAllVideos]);

  useEffect(() => {
    const generateThumbnails = async () => {
      const results: {[key: number]: string} = {};

      for (const video of videos) {
        try {
          const {path} = await createThumbnail({
            url: video.resultUrl || '',
            timeStamp: 1000,
          });
          results[video.requestId] = path;
        } catch (e) {
          console.warn('❌ 썸네일 생성 실패:', e);
        }
      }

      setThumbnails(results);
    };

    if (videos.length > 0) {
      generateThumbnails();
    }
  }, [videos]);


  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      {/* 🔙 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-ios" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내가 생성한 동영상</Text>
        <View style={{width: 24}} />
      </View>

      <FlatList
        data={videos}
        keyExtractor={item => item.requestId.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              setSelectedVideo(item as GeneratedVideo);
              setModalVisible(true);
            }}>
            <Image
              source={{uri: thumbnails[item.requestId] || item.imageUrl}}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <Text style={styles.title} numberOfLines={1}>
              {item.prompt}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* ✅ 모달 */}
      <VideoPreviewModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        video={selectedVideo}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {fontSize: 17, fontWeight: 'bold', color: '#333'},
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F9F9F9',
  },
  thumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: '#ddd',
  },
  title: {
    fontSize: 14,
    color: '#444',
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000AA',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  video: {
    width: 280,
    height: 180,
    backgroundColor: '#000',
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F1F3F5',
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#4D7CFE',
    paddingVertical: 10,
    borderRadius: 10,
    width: '100%',
  },
  closeText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default MyGeneratedVideosScreen;
