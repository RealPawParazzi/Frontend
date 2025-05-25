// 📁 screens/MyGeneratedVideosScreen.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {createThumbnail} from 'react-native-create-thumbnail';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import {useNavigation} from '@react-navigation/native';
import {useAIvideoStore} from '../context/AIvideoStore';
import {GeneratedVideo} from '../services/AIvideoService'; // 타입 정의 파일
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

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

  const requestAndroidPermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: '저장 공간 권한 요청',
          message: '동영상을 저장하려면 저장 공간 접근 권한이 필요합니다.',
          buttonNeutral: '나중에',
          buttonNegative: '거부',
          buttonPositive: '허용',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleShare = async (url: string) => {
    const hasPermission = await requestAndroidPermission();
    if (!hasPermission) {
      Alert.alert('권한 필요', '저장을 위해 권한을 허용해주세요.');
      return;
    }

    try {
      const fileName = `Pawparazzi_${Date.now()}.mp4`;
      const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      const exists = await RNFS.exists(destPath);
      if (!exists) {
        await RNFS.downloadFile({fromUrl: url, toFile: destPath}).promise;
      }

      await Share.open({
        url: `file://${destPath}`,
        type: 'video/mp4',
        failOnCancel: false,
      });
    } catch (error) {
      Alert.alert('공유 실패', '문제가 발생했습니다.');
    }
  };

  const handleSave = async (url: string) => {
    try {
      const fileName = `Pawparazzi_${Date.now()}.mp4`;
      const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      await RNFS.downloadFile({fromUrl: url, toFile: destPath}).promise;

      Alert.alert('성공', '기기에 저장되었습니다!');
    } catch (e) {
      Alert.alert('저장 실패', '문제가 발생했습니다.');
    }
  };

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
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedVideo && (
              <>
                <Text style={styles.modalTitle} numberOfLines={2}>
                  {dayjs(selectedVideo.createdAt)
                    .tz('Asia/Seoul')
                    .format('YYYY년 MM월 DD일 HH시 mm분')}
                </Text>
                <Video
                  source={{uri: selectedVideo.resultUrl || ''}}
                  style={styles.video}
                  controls
                  resizeMode="contain"
                />
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSave(selectedVideo.resultUrl || '')}>
                    <Text style={styles.actionText}>💾 저장</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleShare(selectedVideo.resultUrl || '')}>
                    <Text style={styles.actionText}>📤 공유</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeText}>닫기</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
