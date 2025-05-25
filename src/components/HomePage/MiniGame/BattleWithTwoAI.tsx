import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import useBattleStore from '../../../context/battleStore';
import {useAIvideoStore} from '../../../context/AIvideoStore';

const BattleWithTwoAI = () => {
  const {loading, battleResult, battleDetail, requestTwoInstanceBattleAction} =
    useBattleStore();

  const {
    status,
    finalUrl,
    reset: resetVideo,
    startBattleVideoGeneration,
  } = useAIvideoStore();

  // 🐶 펫1 상태
  const [pet1, setPet1] = useState({name: '', type: 'DOG', petDetail: ''});
  const [pet1Image, setPet1Image] = useState<any>(null);

  // 🐱 펫2 상태
  const [pet2, setPet2] = useState({name: '', type: 'CAT', petDetail: ''});
  const [pet2Image, setPet2Image] = useState<any>(null);

  // 🖼️ 이미지 선택
  const pickImage = async (setImage: Function) => {
    const res = await launchImageLibrary({mediaType: 'photo'});
    const asset = res.assets?.[0];
    if (asset?.uri && asset?.fileName && asset?.type) {
      setImage({
        uri: asset.uri,
        name: asset.fileName,
        type: asset.type,
      });
    }
  };

  // 🥊 배틀 요청
  const handleBattle = async () => {
    if (
      !pet1.name ||
      !pet1.petDetail ||
      !pet1Image ||
      !pet2.name ||
      !pet2.petDetail ||
      !pet2Image
    ) {
      Alert.alert(
        '⚠️ 입력 누락',
        '모든 필드를 입력하고 이미지를 선택해주세요.',
      );
      return;
    }

    try {
      resetVideo(); // 영상 초기화
      console.log('[⚔️ 두 가상펫 배틀 시작]');
      await requestTwoInstanceBattleAction(pet1, pet1Image, pet2, pet2Image);
    } catch (e: any) {
      Alert.alert('❌ 실패', e.message || '배틀 요청 실패');
    }
  };

  // 🎬 배틀 영상 생성
  const handleGenerateVideo = () => {
    if (!battleResult?.runway_prompt || !battleDetail?.battleId) {
      return;
    }
    console.log('🎬 [영상 생성 요청]', battleDetail.battleId);
    startBattleVideoGeneration(battleDetail.battleId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🤖 가상의 두 마리 펫 배틀</Text>

      {/* 🐶 펫1 입력 */}
      <Text style={styles.subTitle}>🐶 가상 펫 1</Text>
      <TextInput
        style={styles.input}
        placeholder="이름"
        value={pet1.name}
        onChangeText={name => setPet1({...pet1, name})}
      />
      <TextInput
        style={styles.input}
        placeholder="설명"
        value={pet1.petDetail}
        onChangeText={petDetail => setPet1({...pet1, petDetail})}
      />
      <TextInput
        style={styles.input}
        placeholder="타입 (DOG/CAT)"
        value={pet1.type}
        onChangeText={type =>
          setPet1({...pet1, type: type.toUpperCase() === 'CAT' ? 'CAT' : 'DOG'})
        }
      />
      <TouchableOpacity
        style={styles.imageButton}
        onPress={() => pickImage(setPet1Image)}>
        <Text>{pet1Image ? '📸 이미지 선택 완료' : '🖼️ 이미지 선택하기'}</Text>
      </TouchableOpacity>

      {/* 🐱 펫2 입력 */}
      <Text style={styles.subTitle}>🐱 가상 펫 2</Text>
      <TextInput
        style={styles.input}
        placeholder="이름"
        value={pet2.name}
        onChangeText={name => setPet2({...pet2, name})}
      />
      <TextInput
        style={styles.input}
        placeholder="설명"
        value={pet2.petDetail}
        onChangeText={petDetail => setPet2({...pet2, petDetail})}
      />
      <TextInput
        style={styles.input}
        placeholder="타입 (DOG/CAT)"
        value={pet2.type}
        onChangeText={type =>
          setPet2({...pet2, type: type.toUpperCase() === 'CAT' ? 'CAT' : 'DOG'})
        }
      />
      <TouchableOpacity
        style={styles.imageButton}
        onPress={() => pickImage(setPet2Image)}>
        <Text>{pet2Image ? '📸 이미지 선택 완료' : '🖼️ 이미지 선택하기'}</Text>
      </TouchableOpacity>

      {/* 🔘 배틀 버튼 */}
      <TouchableOpacity style={styles.battleButton} onPress={handleBattle}>
        <Text style={styles.battleButtonText}>배틀 시작</Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#4D7CFE"
          style={{marginTop: 10}}
        />
      )}

      {/* 🎉 결과 */}
      {battleResult && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>🎉 배틀 결과</Text>
          <Text style={styles.resultText}>{battleResult.result}</Text>
          <Text style={styles.resultText}>🏆 승자: {battleResult.winner}</Text>

          <TouchableOpacity style={styles.generateButton} onPress={handleGenerateVideo}>
            <Text style={styles.generateButtonText}>🎬 배틀 영상 생성</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'IN_PROGRESS' && (
        <Text style={{ marginTop: 10, color: '#666' }}>📽️ 영상 생성 중...</Text>
      )}
      {finalUrl && (
        <Text style={{ color: '#4D7CFE', marginTop: 10 }}>📺 영상 링크: {finalUrl}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {padding: 20},
  title: {fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#4D7CFE'},
  subTitle: {fontSize: 16, fontWeight: '600', marginTop: 10, marginBottom: 6},
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
    marginBottom: 14,
  },
  battleButton: {
    backgroundColor: '#4D7CFE',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
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

export default BattleWithTwoAI;
