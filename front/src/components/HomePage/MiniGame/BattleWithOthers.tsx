// 📦 components/Battle/BattleWithOthers.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import petStore from '../../../context/petStore';
import useBattleStore from '../../../context/battleStore';
import {useAIvideoStore} from '../../../context/AIvideoStore';
import userStore from '../../../context/userStore';
import Video from 'react-native-video';
import CustomDropdown from '../../../common/CustomDropdown';

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.sectionTitle}> 🐶 My Pet</Text>

      {/* 🐶 내 펫 드롭다운 */}
      <CustomDropdown
        options={pets.map(p => ({label: p.name, value: p.petId}))}
        selectedValue={myPetId}
        onSelect={(val) => setMyPetId(val as number)}
        placeholder="내 펫 선택"
      />

      {/* 🐶 내 펫 카드 */}
      {myPetId &&
        (() => {
          const pet = pets.find(p => p.petId === myPetId);
          if (!pet) {
            return null;
          }
          return (
            <View style={styles.petCard}>
              <Image source={{uri: pet.petImg}} style={styles.petImage} />
              <View>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petType}>{pet.type.toUpperCase()}</Text>
                <Text style={styles.petInfo}>{pet.birthDate}</Text>
                <Text style={styles.petInfo}>{pet.petDetail}</Text>
              </View>
            </View>
          );
        })()}

      <Text style={styles.vsText}>VS</Text>


      <Text style={styles.sectionTitle}> 🐱 Opponent </Text>

      {/* 👤 상대 유저 드롭다운 */}
      <CustomDropdown
        options={battleOpponents.map(o => ({
          label: `${o.nickName} (${o.name})`,
          value: o.id,
        }))}
        selectedValue={selectedOpponentId}
        onSelect={val => {
          setSelectedOpponentId(val as string);
          setTargetPetId(null);
        }}
        placeholder="상대 유저 선택"
      />

      {selectedOpponent && (
        <CustomDropdown
          options={selectedOpponent.petList.map(p => ({
            label: p.name,
            value: Number(p.id),
          }))}
          selectedValue={targetPetId}
          onSelect={val => setTargetPetId(Number(val))}
          placeholder="상대 펫 선택"
        />
      )}

      {/* 🐱 상대 펫 카드 */}
      {selectedOpponent &&
        targetPetId &&
        (() => {
          const opponentPet = selectedOpponent.petList.find(
            p => p.id === targetPetId.toString(),
          );
          if (!opponentPet) {
            return null;
          }
          return (
            <View style={styles.petCard}>
              <Image
                source={{uri: opponentPet.image.uri}}
                style={styles.petImage}
              />
              <View>
                <Text style={styles.petName}>{opponentPet.name}</Text>
                <Text style={styles.petType}>
                  {opponentPet.species.toUpperCase()}
                </Text>
              </View>
            </View>
          );
        })()}

      {/* ⚔️ 배틀 시작 버튼 */}
      <TouchableOpacity style={styles.battleButton} onPress={handleStartBattle}>
        <Text style={styles.battleButtonText}>⚔️ Start Battle</Text>
      </TouchableOpacity>

      {/* 🔄 로딩 */}
      {loading && <ActivityIndicator size="large" color="#4D7CFE" />}

      {/* 📜 배틀 결과 */}
      {battleResult && (
        <View style={styles.resultBox}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1601758123927-196d15f05e4e?fit=crop&w=500&q=80',
            }}
            style={styles.resultImage}
          />
          <View style={styles.resultOverlay}>
            <Text style={styles.resultTitle}>{battleResult.winner} wins!</Text>
            <Text style={styles.resultText}>{battleResult.result}</Text>
          </View>
        </View>
      )}

      {/* 🎬 배틀 영상 생성 버튼 */}
      {battleResult && (
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateVideo}>
          <Text style={styles.generateButtonText}>
            🎬 Generate Battle Video
          </Text>
        </TouchableOpacity>
      )}

      {/* 📽️ 영상 생성 중 */}
      {status === 'IN_PROGRESS' && (
        <View style={styles.videoLoading}>
          <ActivityIndicator size="large" color="#4D7CFE" />
          <Text style={{marginTop: 8, color: '#666'}}>Generating video...</Text>
        </View>
      )}

      {/* 📺 최종 영상 출력 */}
      {finalUrl && (
        <View style={{marginTop: 16}}>
          <Video
            source={{uri: finalUrl}}
            style={styles.videoPlayer}
            controls
            resizeMode="contain"
          />
        </View>
      )}

          {error && <Text style={styles.errorText}>❌ {error}</Text>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {padding: 20},
  sectionTitle: {fontSize: 16, fontWeight: 'bold', marginVertical: 6},
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 12,
    color: '#4D7CFE',
  },
  petImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  petType: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  petInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  battleButton: {
    backgroundColor: '#4D7CFE',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  battleButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  resultBox: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  resultImage: {
    width: '100%',
    height: 180,
  },
  resultOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
  generateButton: {
    marginTop: 14,
    backgroundColor: '#2ECC71',
    padding: 12,
    borderRadius: 10,
  },
  generateButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  videoLoading: {
    marginTop: 16,
    alignItems: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  errorText: {
    color: '#DC3545',
    marginTop: 12,
    fontWeight: '500',
  },
});

export default BattleWithOthers;
