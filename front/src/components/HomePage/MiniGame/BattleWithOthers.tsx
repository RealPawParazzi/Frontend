// 📦 components/Battle/BattleWithOthers.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import petStore from '../../../context/petStore';
import useBattleStore from '../../../context/battleStore';
import {useAIvideoStore} from '../../../context/AIvideoStore';
import userStore from '../../../context/userStore';
import Video from 'react-native-video';

const BattleWithOthers: React.FC = () => {
  const {pets} = petStore();
  const [myPetId, setMyPetId] = useState<number | null>(pets[0]?.petId || null);
  const {battleOpponents, loadBattleOpponents} = userStore();
  const [selectedOpponentId, setSelectedOpponentId] = useState<string | null>(
    null,
  );
  const [targetPetId, setTargetPetId] = useState<number | null>(null);

  const selectedOpponent = battleOpponents.find(
    o => o.id === selectedOpponentId,
  );

  const {
    battleResult,
    loading,
    error,
    requestBattleAction,
    fetchBattleDetailAction,
  } = useBattleStore();

  const {
    status,
    finalUrl,
    startBattleVideoGeneration,
    reset: resetVideo,
  } = useAIvideoStore();

  useEffect(() => {
    loadBattleOpponents();
  }, [loadBattleOpponents]);

  const handleStartBattle = async () => {
    if (!myPetId || !targetPetId) {
      return;
    }
    resetVideo();
    await requestBattleAction(myPetId, targetPetId);
  };

  const handleGenerateVideo = () => {
    if (!battleResult?.battleId) {
      return;
    }
    startBattleVideoGeneration(battleResult.battleId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧬 다른 펫과 배틀하기</Text>

      <Text style={styles.label}>내 펫 선택</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={myPetId}
          onValueChange={value => setMyPetId(value)}>
          {pets.map(p => (
            <Picker.Item key={p.petId} label={p.name} value={p.petId} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>상대 유저 선택</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedOpponentId}
          onValueChange={value => {
            setSelectedOpponentId(value);
            setTargetPetId(null);
          }}>
          <Picker.Item label="상대 유저 선택" value={null} />
          {battleOpponents.map(o => (
            <Picker.Item
              key={o.id}
              label={`${o.nickName} (${o.name})`}
              value={o.id}
            />
          ))}
        </Picker>
      </View>

      {selectedOpponent && (
        <>
          <Text style={styles.label}>상대 펫 선택</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={targetPetId}
              onValueChange={value => setTargetPetId(value)}>
              <Picker.Item label="상대 펫 선택" value={null} />
              {selectedOpponent.petList.map(pet => (
                <Picker.Item
                  key={pet.id}
                  label={pet.name}
                  value={Number(pet.id)}
                />
              ))}
            </Picker>
          </View>
        </>
      )}

      <TouchableOpacity style={styles.battleButton} onPress={handleStartBattle}>
        <Text style={styles.battleButtonText}>⚔️ 배틀 시작</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#4D7CFE" />}

      {battleResult && (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>📜 배틀 결과 요약</Text>
          <Text style={styles.resultText}>{battleResult.result}</Text>
          <Text style={styles.resultText}>🏆 승자: {battleResult.winner}</Text>

          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateVideo}>
            <Text style={styles.generateButtonText}>🎬 배틀 영상 생성</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ✅ 영상 생성 중 로딩 */}
      {status === 'IN_PROGRESS' && (
        <View style={styles.videoLoading}>
          <ActivityIndicator size="large" color="#4D7CFE" />
          <Text style={{marginTop: 8, color: '#666'}}>📽️ 영상 생성 중...</Text>
        </View>
      )}

      {finalUrl && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>📺 배틀 영상:</Text>
          <Video
            source={{ uri: finalUrl }}
            style={{
              width: '100%',
              height: 200,
              borderRadius: 10,
              backgroundColor: '#000',
            }}
            controls
            resizeMode="contain"
          />
        </View>
      )}

      {error && <Text style={styles.errorText}>❌ {error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {padding: 20},
  title: {fontSize: 20, fontWeight: 'bold', color: '#4D7CFE', marginBottom: 12},
  label: {marginTop: 10, fontSize: 14, fontWeight: '500'},
  pickerContainer: {
    backgroundColor: '#EEE',
    borderRadius: 8,
    marginVertical: 10,
  },
  battleButton: {
    backgroundColor: '#4D7CFE',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
  },
  battleButtonText: {color: '#FFF', textAlign: 'center', fontWeight: 'bold'},
  resultBox: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  resultLabel: {fontWeight: 'bold', marginBottom: 4},
  resultText: {fontSize: 14, color: '#333', marginBottom: 4},
  generateButton: {
    marginTop: 10,
    backgroundColor: '#2ECC71',
    padding: 10,
    borderRadius: 8,
  },
  generateButtonText: {color: '#FFF', textAlign: 'center', fontWeight: '600'},
  videoLoading: {
    marginTop: 16,
    alignItems: 'center',
  },
  loadingText: {marginTop: 10, color: '#999'},
  errorText: {color: '#DC3545', marginTop: 10},
  videoBox: {marginTop: 10},
  videoUrl: {color: '#4D7CFE', textDecorationLine: 'underline'},
});

export default BattleWithOthers;
