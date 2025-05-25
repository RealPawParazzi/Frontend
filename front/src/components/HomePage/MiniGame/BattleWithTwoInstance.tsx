import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import useBattleStore from '../../../context/battleStore';
import {useAIvideoStore} from '../../../context/AIvideoStore';
import Video from 'react-native-video';
import CustomDropdown from '../../../common/CustomDropdown';
import DateTimePicker from 'react-native-modal-datetime-picker';

const BattleWithTwoInstance = () => {
  const {loading, battleResult, requestTwoInstanceBattleAction} =
    useBattleStore();
  const {
    status,
    finalUrl,
    reset: resetVideo,
    startBattleVideoGeneration,
  } = useAIvideoStore();

  // ✅ 펫1 상태
  const [pet1, setPet1] = useState({
    name: '',
    type: 'DOG',
    petDetail: '',
    birthDate: '',
  });
  const [pet1Image, setPet1Image] = useState<any>(null);
  const [showDatePicker1, setShowDatePicker1] = useState(false);

  // ✅ 펫2 상태
  const [pet2, setPet2] = useState({
    name: '',
    type: 'CAT',
    petDetail: '',
    birthDate: '',
  });
  const [pet2Image, setPet2Image] = useState<any>(null);
  const [showDatePicker2, setShowDatePicker2] = useState(false);

  const pickImage = async (setImage: Function) => {
    const res = await launchImageLibrary({mediaType: 'photo'});
    const asset = res.assets?.[0];
    if (asset?.uri && asset?.fileName && asset?.type) {
      setImage({uri: asset.uri, name: asset.fileName, type: asset.type});
    }
  };

  const handleBattle = async () => {
    if (
      !pet1.name ||
      !pet1.petDetail ||
      !pet1.birthDate ||
      !pet1Image ||
      !pet2.name ||
      !pet2.petDetail ||
      !pet2.birthDate ||
      !pet2Image
    ) {
      Alert.alert(
        '⚠️ 입력 누락',
        '모든 필드를 입력하고 이미지를 선택해주세요.',
      );
      return;
    }
    try {
      resetVideo();
      await requestTwoInstanceBattleAction(pet1, pet1Image, pet2, pet2Image);
    } catch (e: any) {
      Alert.alert('❌ 실패', e.message || '배틀 요청 실패');
    }
  };

  const handleGenerateVideo = () => {
    if (!battleResult?.battleId) {
      return;
    }
    startBattleVideoGeneration(battleResult.battleId);
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 🐶 펫 1 */}
      <Text style={styles.subTitle}> 🐶 Instance Pet 1 </Text>
      <TextInput
        style={styles.input}
        placeholder="이름"
        value={pet1.name}
        onChangeText={v => setPet1({...pet1, name: v})}
      />
      <TextInput
        style={styles.input}
        placeholder="특징"
        value={pet1.petDetail}
        onChangeText={v => setPet1({...pet1, petDetail: v})}
      />
      <CustomDropdown
        options={[
          {label: 'DOG', value: 'DOG'},
          {label: 'CAT', value: 'CAT'},
        ]}
        selectedValue={pet1.type}
        onSelect={v => setPet1({...pet1, type: v as 'DOG' | 'CAT'})}
        placeholder="종류 선택"
      />
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker1(true)}>
        <Text>{pet1.birthDate ? `📅 ${pet1.birthDate}` : '생년월일 선택'}</Text>
      </TouchableOpacity>
      <DateTimePicker
        isVisible={showDatePicker1}
        mode="date"
        onConfirm={d => {
          setPet1({...pet1, birthDate: d.toISOString().split('T')[0]});
          setShowDatePicker1(false);
        }}
        onCancel={() => setShowDatePicker1(false)}
      />
      <TouchableOpacity
        style={styles.imageButton}
        onPress={() => pickImage(setPet1Image)}>
        <Text>{pet1Image ? '📸 이미지 선택 완료' : '🖼️ 이미지 선택'}</Text>
      </TouchableOpacity>
      {(pet1.name || pet1Image) && (
        <View style={styles.petCard}>
          {pet1Image && (
            <Image source={{uri: pet1Image.uri}} style={styles.petImage} />
          )}
          <View>
            <Text style={styles.petName}>{pet1.name}</Text>
            <Text style={styles.petType}>{pet1.type}</Text>
            <Text style={styles.petType}>{pet1.birthDate}</Text>
            <Text style={styles.petType}>{pet1.petDetail}</Text>
          </View>
        </View>
      )}

      <Text style={styles.vsText}>VS</Text>

      {/* 펫 2 */}
      <Text style={styles.subTitle}> 🐱 Instance Pet 2</Text>
      <TextInput
        style={styles.input}
        placeholder="이름"
        value={pet2.name}
        onChangeText={v => setPet2({...pet2, name: v})}
      />
      <TextInput
        style={styles.input}
        placeholder="특징"
        value={pet2.petDetail}
        onChangeText={v => setPet2({...pet2, petDetail: v})}
      />
      <CustomDropdown
        options={[
          {label: 'DOG', value: 'DOG'},
          {label: 'CAT', value: 'CAT'},
        ]}
        selectedValue={pet2.type}
        onSelect={v => setPet2({...pet2, type: v as 'DOG' | 'CAT'})}
        placeholder="종류 선택"
      />
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker2(true)}>
        <Text>{pet2.birthDate ? `📅 ${pet2.birthDate}` : '생년월일 선택'}</Text>
      </TouchableOpacity>
      <DateTimePicker
        isVisible={showDatePicker2}
        mode="date"
        onConfirm={d => {
          setPet2({...pet2, birthDate: d.toISOString().split('T')[0]});
          setShowDatePicker2(false);
        }}
        onCancel={() => setShowDatePicker2(false)}
      />
      <TouchableOpacity
        style={styles.imageButton}
        onPress={() => pickImage(setPet2Image)}>
        <Text>{pet2Image ? '📸 이미지 선택 완료' : '🖼️ 이미지 선택'}</Text>
      </TouchableOpacity>
      {(pet2.name || pet2Image) && (
        <View style={styles.petCard}>
          {pet2Image && (
            <Image source={{uri: pet2Image.uri}} style={styles.petImage} />
          )}
          <View>
            <Text style={styles.petName}>{pet2.name}</Text>
            <Text style={styles.petType}>{pet2.type}</Text>
            <Text style={styles.petType}>{pet2.birthDate}</Text>
            <Text style={styles.petType}>{pet2.petDetail}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.battleButton} onPress={handleBattle}>
        <Text style={styles.battleButtonText}>⚔️ 배틀 시작</Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#4D7CFE"
          style={{marginTop: 10}}
        />
      )}

      {battleResult && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>🎉 배틀 결과</Text>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {padding: 20},
  title: {fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#4D7CFE'},
  subTitle: {fontSize: 16, fontWeight: '600', marginTop: 10, marginBottom: 6},
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#4D7CFE',
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
  petImage: {width: 48, height: 48, borderRadius: 24, marginRight: 12},
  petName: {fontSize: 16, fontWeight: 'bold'},
  petType: {fontSize: 12, color: '#888', marginTop: 2},
  battleButton: {
    backgroundColor: '#4D7CFE',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  battleButtonText: {color: '#FFF', fontWeight: '600'},
  resultBox: {
    backgroundColor: '#F8F9FA',
    marginTop: 20,
    padding: 14,
    borderRadius: 10,
  },
  resultTitle: {fontSize: 16, fontWeight: '600', marginBottom: 8},
  resultText: {fontSize: 14, color: '#333', marginBottom: 4},
  generateButton: {
    marginTop: 10,
    backgroundColor: '#2ECC71',
    padding: 10,
    borderRadius: 8,
  },
  generateButtonText: {color: '#FFF', textAlign: 'center', fontWeight: '600'},
  videoLoading: {marginTop: 16, alignItems: 'center'},
});

export default BattleWithTwoInstance;
