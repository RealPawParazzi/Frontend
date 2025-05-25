import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import useBattleStore from '../../../context/battleStore';
import {useAIvideoStore} from '../../../context/AIvideoStore';
import userStore from '../../../context/userStore';
import Video from 'react-native-video';
import CustomDropdown from '../../../common/CustomDropdown';
import DateTimePicker from 'react-native-modal-datetime-picker';

const BattleWithOneInstance = () => {
  // ✅ 상태 정의
  const [selectedOpponentId, setSelectedOpponentId] = useState<string | null>(
    null,
  );
  const [targetPetId, setTargetPetId] = useState<number | null>(null);
  const [myInstanceName, setMyInstanceName] = useState('');
  const [myInstanceDetail, setMyInstanceDetail] = useState('');
  const [myInstanceType, setMyInstanceType] = useState<'DOG' | 'CAT'>('DOG');
  const [myInstanceBirth, setMyInstanceBirth] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [instanceImage, setInstanceImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  const {battleOpponents, loadBattleOpponents} = userStore();
  const {loading, battleResult, error, requestOneInstanceBattleAction} =
    useBattleStore();

  const targetUser = battleOpponents.find(o => o.id === selectedOpponentId);

  const {
    startBattleVideoGeneration,
    finalUrl,
    status,
    reset: resetVideo,
  } = useAIvideoStore();

  useEffect(() => {
    loadBattleOpponents();
  }, [loadBattleOpponents]);

  // ✅ 이미지 선택 핸들러
  const handlePickImage = async () => {
    const res = await launchImageLibrary({mediaType: 'photo'});
    const asset = res.assets?.[0];
    if (asset?.uri && asset.fileName && asset.type) {
      setInstanceImage({
        uri: asset.uri,
        name: asset.fileName,
        type: asset.type,
      });
    }
  };

  // ✅ 배틀 실행 핸들러
  const handleBattle = async () => {
    if (
      !targetPetId ||
      !myInstanceName ||
      !myInstanceDetail ||
      !myInstanceBirth ||
      !instanceImage
    ) {
      Alert.alert(
        '⚠️ 입력 누락',
        '모든 정보를 입력하고 이미지를 선택해주세요.',
      );
      return;
    }
    try {
      resetVideo();
      await requestOneInstanceBattleAction(
        targetPetId,
        {
          name: myInstanceName,
          type: myInstanceType,
          petDetail: myInstanceDetail,
          birthDate: myInstanceBirth,
        },
        instanceImage,
      );
    } catch (e: any) {
      Alert.alert('❌ 실패', e.message || '배틀 요청 실패');
    }
  };

  // ✅ 영상 생성 핸들러
  const handleGenerateVideo = () => {
    console.log('🎬 [영상 생성 요청]', battleResult?.battleId);
    if (!battleResult?.battleId) {
      return;
    }
    startBattleVideoGeneration(battleResult?.battleId);
  };

  const handleConfirm = (selectedDate: Date) => {
    const isoDate = selectedDate.toISOString().split('T')[0];
    setMyInstanceBirth(isoDate);
    setBirthDate(selectedDate);
    setShowDatePicker(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.subtitle}> 🐶 My Instance Pet</Text>
      <TextInput
        style={styles.input}
        placeholder="펫 이름"
        value={myInstanceName}
        onChangeText={setMyInstanceName}
      />
      <TextInput
        style={[styles.input, {height: 80}]}
        placeholder="펫의 특징 설명"
        multiline
        value={myInstanceDetail}
        onChangeText={setMyInstanceDetail}
      />
      <CustomDropdown
        options={[
          {label: 'DOG', value: 'DOG'},
          {label: 'CAT', value: 'CAT'},
        ]}
        selectedValue={myInstanceType}
        onSelect={val => setMyInstanceType(val as 'DOG' | 'CAT')}
        placeholder="종류 선택"
      />
      {/** 생년월일 선택 버튼 */}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}>
        <Text>
          {myInstanceBirth ? `📅 ${myInstanceBirth}` : '생년월일 선택'}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          isVisible={showDatePicker}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={() => setShowDatePicker(false)}
        />
      )}
      <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
        <Text>
          {instanceImage ? '📸 이미지 선택 완료' : '🖼️ 펫 이미지 선택'}
        </Text>
      </TouchableOpacity>

      {/* 🐶 내 펫 카드 미리보기 */}
      {(myInstanceName || myInstanceDetail || instanceImage) && (
        <View style={styles.petCard}>
          {instanceImage && (
            <Image source={{uri: instanceImage.uri}} style={styles.petImage} />
          )}
          <View>
            <Text style={styles.petName}>{myInstanceName}</Text>
            <Text style={styles.petType}>{myInstanceType}</Text>
            <Text style={styles.petType}>{myInstanceBirth}</Text>
            <Text style={styles.petType}>{myInstanceDetail}</Text>
          </View>
        </View>
      )}

      <Text style={styles.vsText}>VS</Text>

      {/* 👤 상대 유저 드롭다운 */}
      <Text style={styles.subtitle}> 🐱 Opponent</Text>
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

      {/* 🐶 상대 펫 선택 드롭다운 */}
      {targetUser && (
        <CustomDropdown
          options={targetUser.petList.map(p => ({
            label: p.name,
            value: Number(p.id),
          }))}
          selectedValue={targetPetId}
          onSelect={val => setTargetPetId(val as number)}
          placeholder="상대 펫 선택"
        />
      )}

      {/* 🐱 상대 펫 카드 */}
      {targetUser &&
        targetPetId &&
        (() => {
          const opponentPet = targetUser.petList.find(
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

      <TouchableOpacity style={styles.battleButton} onPress={handleBattle}>
        <Text style={styles.battleButtonText}>⚔️ 배틀 시작</Text>
      </TouchableOpacity>

      {/* ✅ 로딩 표시 */}
      {loading && <ActivityIndicator size="large" color="#4D7CFE" />}

      {/* ✅ 결과 출력 */}
      {battleResult && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>🎉 배틀 결과</Text>
          <Text>{battleResult.result}</Text>
          <Text>🏆 승자: {battleResult.winner}</Text>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateVideo}>
            <Text style={styles.generateButtonText}>🎬 배틀 영상 생성</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'IN_PROGRESS' && (
        <View style={styles.videoLoading}>
          <ActivityIndicator size="large" color="#4D7CFE" />
          <Text style={{marginTop: 8, color: '#666'}}>📽️ 영상 생성 중...</Text>
        </View>
      )}

      {finalUrl && (
        <View style={{marginTop: 20}}>
          <Text style={{fontWeight: 'bold', marginBottom: 8}}>
            📺 배틀 영상:
          </Text>
          <Video
            source={{uri: finalUrl}}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
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
    marginVertical: 8,
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#4D7CFE',
  },
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
  videoLoading: {
    marginTop: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#DC3545',
    marginTop: 12,
    fontWeight: '500',
  },
});

export default BattleWithOneInstance;
