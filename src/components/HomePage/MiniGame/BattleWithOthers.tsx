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

const BattleWithOthers: React.FC = () => {
  const {pets} = petStore();
  const [myPetId, setMyPetId] = useState<number | null>(
    pets.length > 0 ? pets[0].petId : null,
  );
  const {battleOpponents, loadBattleOpponents} = userStore(); // ✅ 상대 유저 목록

  const [selectedOpponentId, setSelectedOpponentId] = useState<string | null>(
    null,
  );
  const [targetPetId, setTargetPetId] = useState<number | null>(null); // ✅ 선택된 상대 펫 ID

  const selectedOpponent = battleOpponents.find(
    o => o.id === selectedOpponentId,
  );

  const {battleResult, battleDetail, loading, error, requestBattleAction} =
    useBattleStore();

  const {
    status,
    finalUrl,
    startBattleVideoGeneration,
    reset: resetVideo,
  } = useAIvideoStore();

  useEffect(() => {
    loadBattleOpponents(); // ✅ 컴포넌트 마운트 시 상대 유저 로드
  }, [loadBattleOpponents]);

  const handleStartBattle = async () => {
    if (!myPetId || !targetPetId) {
      return;
    }
    resetVideo();
    await requestBattleAction(myPetId, targetPetId);
  };

  const handleGenerateVideo = () => {
    if (!battleResult?.runway_prompt || !battleDetail?.battleId) {
      return;
    }
    startBattleVideoGeneration(battleDetail.battleId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧬 다른 펫과 배틀하기</Text>

      <Text style={styles.label}>내 펫 선택</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={myPetId}
          onValueChange={value => setMyPetId(value)}
          mode="dropdown">
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
            setTargetPetId(null); // 유저 바뀌면 펫 초기화
          }}
          mode="dropdown">
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
              onValueChange={value => setTargetPetId(value)}
              mode="dropdown">
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
        <Text style={styles.battleButtonText}>배틀 시작</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#4D7CFE" />}

      {battleResult && (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>📜 배틀 결과</Text>
          <Text style={styles.resultText}>{battleResult.result}</Text>
          <Text style={styles.resultText}>🏆 승자: {battleResult.winner}</Text>

          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateVideo}>
            <Text style={styles.generateButtonText}>🎬 배틀 영상 생성</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'IN_PROGRESS' && (
        <Text style={styles.loadingText}>영상 생성 중...</Text>
      )}
      {finalUrl && (
        <View>
          <Text style={styles.label}>📹 배틀 영상:</Text>
          <Text style={{color: '#4D7CFE'}}>{finalUrl}</Text>
        </View>
      )}

      {error && <Text style={styles.errorText}>❌ {error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4D7CFE',
    marginBottom: 12,
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
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
  battleButtonText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  resultBox: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  resultLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
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
  loadingText: {
    marginTop: 10,
    color: '#999',
  },
  errorText: {
    color: '#DC3545',
    marginTop: 10,
  },
});

export default BattleWithOthers;
