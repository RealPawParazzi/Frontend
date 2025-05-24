import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import useBattleStore from '../../../context/battleStore';
import {useAIvideoStore} from '../../../context/AIvideoStore';

// 예시: 서버에서 가져올 수 있음
const opponentPets = [
  {
    petId: 6,
    name: '루비',
    type: 'DOG',
    image: require('../../../assets/images/1.jpg'),
    detail: '루비는 활발하고 용감한 강아지입니다.',
  },
  {
    petId: 7,
    name: '몽이',
    type: 'CAT',
    image: require('../../../assets/images/cat-1.jpg'),
    detail: '몽이는 호기심 많고 장난꾸러기 고양이입니다.',
  },
  {
    petId: 8,
    name: '짱이',
    type: 'CAT',
    image: require('../../../assets/images/cat-4.jpg'),
    detail: '짱이는 조용하고 차분한 성격의 고양이입니다.',
  },
];

const BattleWithOneAI = () => {
  // ✅ 상태 정의
  const [targetPetId, setTargetPetId] = useState<number | null>(null); // 상대 펫 (하드코딩된 예시)
  const [myAiName, setMyAiName] = useState('');
  const [myAiDetail, setMyAiDetail] = useState('');
  const [myAiType, setMyAiType] = useState<'DOG' | 'CAT'>('DOG'); // 선택지 확장 가능
  const [aiImage, setAiImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  const {loading, battleResult, battleDetail, requestOneInstanceBattleAction} =
    useBattleStore();

  const {
    startBattleVideoGeneration,
    finalUrl,
    status,
    reset: resetVideo,
  } = useAIvideoStore();

  // ✅ 이미지 선택
  const handlePickImage = async () => {
    const res = await launchImageLibrary({mediaType: 'photo'});
    const asset = res.assets?.[0];
    if (asset?.uri && asset.fileName && asset.type) {
      setAiImage({
        uri: asset.uri,
        name: asset.fileName,
        type: asset.type,
      });
    }
  };

  // ✅ 배틀 시작
  const handleBattle = async () => {
    if (!targetPetId || !myAiName || !myAiDetail || !myAiType || !aiImage) {
      Alert.alert(
        '⚠️ 입력 누락',
        '모든 정보를 입력하고 이미지를 선택해주세요.',
      );
      return;
    }

    try {
      resetVideo();
      console.log('[⚔️ 배틀 요청 시작]');
      await requestOneInstanceBattleAction(
        targetPetId,
        {
          name: myAiName,
          type: myAiType,
          petDetail: myAiDetail,
        },
        aiImage,
      );
    } catch (e: any) {
      Alert.alert('❌ 실패', e.message || '배틀 요청 실패');
    }
  };

  const handleGenerateVideo = () => {
    if (!battleResult?.runway_prompt || !battleDetail?.battleId) {
      console.log('❌ runway_prompt 또는 battleId 없음');
      return;
    }

    console.log('🎬 [영상 생성 요청]', {
      battleId: battleDetail.battleId,
      prompt: battleResult.runway_prompt,
    });

    startBattleVideoGeneration(battleDetail.battleId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💥 내 가상 펫으로 다른 펫과 배틀하기</Text>

      {/* 🎯 상대 펫 선택 */}
      <Text style={styles.subtitle}>배틀 상대 선택:</Text>
      {opponentPets.map(pet => (
        <TouchableOpacity
          key={pet.petId}
          style={[styles.selectButton, targetPetId === pet.petId && styles.selectedButton]}
          onPress={() => setTargetPetId(pet.petId)}
        >
          <Text>{pet.name} (ID: {pet.petId}, {pet.type}, {pet.detail})</Text>
        </TouchableOpacity>
      ))}


      {/* ✍️ 내 펫 정보 입력 */}
      <TextInput
        style={styles.input}
        placeholder="가상 펫 이름"
        value={myAiName}
        onChangeText={setMyAiName}
      />
      <TextInput
        style={[styles.input, {height: 80}]}
        placeholder="가상 펫의 특징 설명"
        multiline
        value={myAiDetail}
        onChangeText={setMyAiDetail}
      />
      <TextInput
        style={styles.input}
        placeholder="종류 (DOG 또는 CAT)"
        value={myAiType}
        onChangeText={v =>
          setMyAiType(v.toUpperCase() === 'CAT' ? 'CAT' : 'DOG')
        }
      />

      {/* ✅ 이미지 선택 */}
      <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
        <Text>{aiImage ? '📸 이미지 선택 완료' : '🖼️ 펫 이미지 선택'}</Text>
      </TouchableOpacity>

      {/* ✅ 배틀 버튼 */}
      <TouchableOpacity style={styles.battleButton} onPress={handleBattle}>
        <Text style={styles.battleButtonText}>배틀 시작</Text>
      </TouchableOpacity>

      {/* ✅ 로딩 표시 */}
      {loading && <ActivityIndicator size="large" color="#4D7CFE" />}

      {/* ✅ 결과 출력 */}
      {battleResult && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>🎉 배틀 결과</Text>
          <Text>{battleResult.result}</Text>
          <Text>🏆 승자: {battleResult.winner}</Text>

          <TouchableOpacity style={styles.generateButton} onPress={handleGenerateVideo}>
            <Text style={styles.generateButtonText}>🎬 배틀 영상 생성</Text>
          </TouchableOpacity>
        </View>
      )}
      {status === 'IN_PROGRESS' && (
        <Text style={{marginTop: 10, color: '#888'}}>📽️ 영상 생성 중...</Text>
      )}
      {finalUrl && (
        <Text style={{color: '#4D7CFE'}}>📺 영상 링크: {finalUrl}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {padding: 20},
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#4D7CFE',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectButton: {
    backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedButton: {
    backgroundColor: '#A7C8FF',
  },
  petLabel: {
    fontSize: 14,
  },
  input: {
    backgroundColor: '#F1F3F5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: '#DDE6FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  battleButton: {
    backgroundColor: '#4D7CFE',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  battleButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  resultBox: {
    backgroundColor: '#F8F9FA',
    marginTop: 20,
    padding: 14,
    borderRadius: 10,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },

  generateButton: {
    marginTop: 10,
    backgroundColor: '#2ECC71',
    padding: 10,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default BattleWithOneAI;
