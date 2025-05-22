// screens/VideoEditorScreen.tsx
import React, {useEffect, useRef, useState} from 'react';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import {useNavigation} from '@react-navigation/native';

import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import Video from 'react-native-video';
import {useAIvideoStore} from '../../context/AIvideoStore';

const VideoEditorScreen: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('');
  const [imageFile, setImageFile] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  // ✅ 상태 관리 (Zustand에서 필요한 상태만 개별로 구독)
  const status = useAIvideoStore(s => s.status);
  const finalUrl = useAIvideoStore(s => s.finalUrl);
  const error = useAIvideoStore(s => s.error);
  const startGeneration = useAIvideoStore(s => s.startGeneration);

  const scrollRef = useRef<ScrollView>(null); // ✅ ref 선언
  const navigation = useNavigation();

  // ✅ 유효성 검사 상태 추가
  const [durationError, setDurationError] = useState('');

  // ✅ 유효성 검사 - 5초 미만 또는 10초 초과일 경우 메시지 설정
  useEffect(() => {
    const value = Number(duration);
    if (!duration.trim()) {
      setDurationError('');
    } else if (isNaN(value)) {
      setDurationError('숫자를 입력해주세요.');
    } else if (value < 5) {
      setDurationError('* 최소 생성 길이는 5초입니다.');
    } else if (value > 10) {
      setDurationError('* 최대 생성 길이는 10초입니다.');
    } else {
      setDurationError('');
    }
  }, [duration]);

  // ✅ 이미지 선택 함수
  const pickImage = () => {
    launchImageLibrary({mediaType: 'photo', quality: 1}, res => {
      if (res.didCancel) {
        return;
      }
      if (res.errorMessage) {
        Alert.alert('오류', res.errorMessage);
        return;
      }
      const asset = res.assets?.[0];
      if (asset?.uri && asset.fileName && asset.type) {
        setImageFile({
          uri: asset.uri,
          name: asset.fileName,
          type: asset.type,
        });
      }
    });
  };

  // ✅ 생성 요청 처리
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert('입력 오류', '줄거리를 입력해주세요.');
      return;
    }
    if (!imageFile) {
      Alert.alert('입력 오류', '이미지를 선택해주세요.');
      return;
    }
    const parsedDuration = Number(duration); // 숫자 변환 추가
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      Alert.alert('입력 오류', '유효한 지속 시간(초)을 입력해주세요.');
      return;
    }

    try {
      await startGeneration(prompt.trim(), parsedDuration, imageFile);
      console.log(
        '❗❗영상 제작 요청 : ',
        prompt.trim(),
        parsedDuration,
        imageFile,
      );
    } catch (e: any) {
      Alert.alert('요청 실패', e.message || '알 수 없는 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    if (finalUrl && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({animated: true});
      }, 300); // 렌더링 타이밍 고려해 약간의 딜레이
    }
  }, [finalUrl]);

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* ...기존 코드 유지 */}
        <Text style={styles.title}> 동영상을 생성해보자 !</Text>

        <TextInput
          style={styles.input}
          placeholder="원하는 동영상 줄거리 입력하기"
          value={prompt}
          onChangeText={setPrompt}
        />
        <TextInput
          style={styles.input}
          placeholder="몇초짜리 영상을 만들까? (ex: 5)"
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
        />

        {/* ✅ 유효성 경고 메시지 */}
        {durationError ? (
          <Text style={styles.durationErrorText}>{durationError}</Text>
        ) : null}

        {/* ✅ 이미지 미리보기 박스 (업로드 전/후 상태 구분) */}
        <TouchableOpacity onPress={pickImage} activeOpacity={0.9}>
          <View style={styles.previewBox}>
            {imageFile ? (
              <>
                {/* ✅ 업로드된 이미지 표시 */}
                <Image
                  source={{uri: imageFile.uri}}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                {/* ✅ 삭제 버튼 (우측 상단) */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => setImageFile(null)}>
                  <Text style={styles.deleteButtonText}>✕</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.placeholderContent}>
                <Text style={styles.placeholderTitle}>
                  아직 선택된 이미지가 없습니다.
                </Text>
                <Text style={styles.placeholderSub}>
                  이미지를 업로드하세요.
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* ✅ 생성 버튼 */}
        <TouchableOpacity
          style={[
            styles.generateButton,
            (status === 'PENDING' || status === 'IN_PROGRESS') &&
              styles.disabledButton,
          ]}
          onPress={handleGenerate}
          disabled={status === 'PENDING' || status === 'IN_PROGRESS'}>
          <Text style={styles.buttonText}>
            {status === 'PENDING' || status === 'IN_PROGRESS'
              ? '열심히 동영상을 생성 중...'
              : '동영상 생성하기'}
          </Text>
        </TouchableOpacity>

        {/* ✅ 로딩 중 표시 */}
        {(status === 'PENDING' || status === 'IN_PROGRESS') && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4D7CFE" />
            <Text style={styles.loadingText}>
              동영상을 생성하고 있습니다...
            </Text>
          </View>
        )}

        {/* ✅ 에러 메시지 */}
        {error && <Text style={styles.errorText}>❌ 오류: {error}</Text>}

        {/* ✅ 결과 영상 미리보기 */}
        {finalUrl && (
          <>
            <Text style={styles.resultLabel}>✅ 생성 완료!</Text>
            <Video
              source={{uri: finalUrl}}
              style={styles.video}
              controls
              resizeMode="contain"
              paused={true}
            />
            {/* 기능 버튼 영역 */}
            <View style={styles.actionRow}>
              {/* 게시글 작성으로 이동 */}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  // @ts-ignore
                  navigation.navigate('StorybookScreen', {videoUri: finalUrl}); // 이동시 URI 넘김
                }}>
                <Text style={styles.iconText}>✍️ 게시글 작성</Text>
              </TouchableOpacity>

              {/* 기기에 저장 */}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={async () => {
                  try {
                    const fileName = `Pawparazzi_${Date.now()}.mp4`;

                    // ✅ 더 안전한 저장 경로 (iOS & Android 모두 동작)
                    const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

                    console.log('✅ 영상 저장 경로:', destPath);

                    await RNFS.copyFile(finalUrl, destPath);

                    Alert.alert(
                      '성공',
                      '기기에 저장되었습니다!\n(앱 전용 폴더에 저장됨)',
                    );
                  } catch (err) {
                    console.log('❌ 저장 에러:', err);
                    Alert.alert('실패', '파일 저장에 실패했습니다.');
                  }
                }}>
                <Text style={styles.iconText}>💾 저장</Text>
              </TouchableOpacity>

              {/* 공유하기 */}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={async () => {
                  try {
                    const fileName = `Pawparazzi_${Date.now()}.mp4`;
                    const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

                    console.log('✅ 공유용 영상 저장 경로:', destPath);

                    // 공유 전에 파일이 없으면 먼저 저장
                    const exists = await RNFS.exists(destPath);
                    if (!exists) {
                      await RNFS.copyFile(finalUrl, destPath);
                      console.log('✅ 공유를 위해 영상 복사 완료');
                    }

                    // ✅ iOS, Android 모두 'file://' prefix 필요
                    const fileUrl = `file://${destPath}`;

                    await Share.open({
                      url: fileUrl,
                      type: 'video/mp4',
                      failOnCancel: false,
                    });
                  } catch (error) {
                    console.warn('❌ 공유 실패:', error);
                    Alert.alert('공유 실패', '파일 공유 중 문제가 발생했습니다.');
                  }
                }}
              >
                <Text style={styles.iconText}>📤 공유</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 150 : 120,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#2C3E50',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    fontSize: 16,
    color: '#495057',
  },
  durationErrorText: {
    color: '#DC3545',
    fontSize: 13,
    marginBottom: 10,
    marginTop: -12,
    paddingLeft: 4,
  },
  // ✅ 점선 박스 스타일
  previewBox: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#CED4DA',
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  placeholderContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderTitle: {
    fontSize: 16,
    color: '#868E96',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  placeholderSub: {
    fontSize: 14,
    color: '#ADB5BD',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#000000AA',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 20,
  },

  generateButton: {
    backgroundColor: '#4D7CFEFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#7F949F91',
    opacity: 0.8,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#7F949F91',
    marginTop: 8,
    fontSize: 14,
  },
  errorText: {
    color: '#DC3545',
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
  },
  resultLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
    color: '#2C3E50',
    textAlign: 'center',
  },
  video: {
    width: '100%',
    height: 250,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  iconButton: {
    flex: 1,
    backgroundColor: '#F1F3F5',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  iconText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
});

export default VideoEditorScreen;
