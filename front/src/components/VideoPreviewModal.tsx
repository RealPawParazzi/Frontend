import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  PermissionsAndroid,
  Image, ScrollView,
} from 'react-native';
import Video from 'react-native-video';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {GeneratedVideo} from '../services/AIvideoService';

dayjs.extend(utc);
dayjs.extend(timezone);

interface Props {
  visible: boolean;
  onClose: () => void;
  video: GeneratedVideo | null;
}

const VideoPreviewModal: React.FC<Props> = ({visible, onClose, video}) => {
  if (!video) return null;

  const requestAndroidPermission = async () => {
    if (Platform.OS !== 'android') return true;

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

  const handleShare = async () => {
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
        await RNFS.downloadFile({
          fromUrl: video.resultUrl || '',
          toFile: destPath,
        }).promise;
      }

      await Share.open({
        url: `file://${destPath}`,
        type: 'video/mp4',
        failOnCancel: false,
      });
    } catch (err) {
      Alert.alert('공유 실패', '파일 공유 중 문제가 발생했습니다.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* 📅 생성일자 */}
          <Text style={styles.modalTitle}>
            {dayjs(video.createdAt).tz('Asia/Seoul').format('YYYY년 MM월 DD일 HH:mm')}
          </Text>

          {/* ✏️ 프롬프트 텍스트 */}
          <Text style={styles.promptText}>✏️ {video.prompt}</Text>

          {/* 📸 원본 이미지 */}
          {video.imageUrl && (
            <>
              <Text style={styles.sectionLabel}>📸 원본 이미지</Text>
              <Image
                source={{uri: video.imageUrl}}
                style={styles.image}
                resizeMode="cover"
              />
            </>
          )}

          {/* ⬇️ 화살표 */}
          <Text style={styles.arrow}>⬇️</Text>

          {/* 🎞️ 생성된 영상 */}
          <Text style={styles.sectionLabel}>🎞️ 생성된 영상</Text>
          <Video
            source={{uri: video.resultUrl || ''}}
            style={styles.video}
            controls
            resizeMode="contain"
          />

          {/* 공유/닫기 버튼 */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Text style={styles.actionText}>📤 공유, 저장</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>닫기</Text>
          </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000AA',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    maxHeight: '85%',
    padding: 10,
  },
  scrollContent: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  promptText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 12,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  image: {
    width: 280,
    height: 180,
    borderRadius: 8,
    marginBottom: 14,
    backgroundColor: '#eee',
  },
  arrow: {
    fontSize: 22,
    marginBottom: 14,
  },
  video: {
    width: 280,
    height: 180,
    backgroundColor: '#000',
    marginBottom: 20,
    borderRadius: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
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
    marginTop: 16,
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

export default VideoPreviewModal;
