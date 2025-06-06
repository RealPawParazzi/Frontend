import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Alert,
  useWindowDimensions,
} from 'react-native';
import petStore, {PetRanking} from '../context/petStore';
import {useNavigation} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/AppNavigator'; // 경로 맞춰줘야 함

type NavigationProp = StackNavigationProp<RootStackParamList, 'MiniGameScreen'>;

const DEFAULT_PET_IMAGE = require('../assets/images/pets-1.jpg');

const HallOfFameScreen = () => {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp>();
  const {rankings, fetchPetRankings} = petStore();

  const {width} = useWindowDimensions(); // 추가됨
  const IS_TABLET = width >= 768;

  useEffect(() => {
    const loadRankings = async () => {
      try {
        await fetchPetRankings();
      } catch (error) {
        console.error('🏆 랭킹 불러오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRankings();
  }, [fetchPetRankings]);

  const renderItem = ({item, index}: {item: PetRanking; index: number}) => (
    <TouchableOpacity
      onPress={() =>
        Alert.alert('배틀 신청', `${item.name}에게 배틀을 신청해 볼까요?`, [
          {text: '아니요', style: 'cancel'},
          {
            text: '예',
            onPress: () => {
              //@ts-ignore
              navigation.navigate('MiniGameScreen', {
                preSelectedOpponent: {
                  opponentUserId: item.member.memberId,
                  petId: item.petId,
                },
              });
            },
          },
        ])
      }>
      {/* 🐾 카드 전체를 Touchable로 감싸야 함 */}
      <View style={styles.card}>
        <Text style={styles.rank}>#{index + 1}</Text>
        <Image
          source={{uri: item.petImg || DEFAULT_PET_IMAGE}}
          style={styles.image}
        />
        <View style={styles.infoBox}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.owner}>👤 {item.member.name}</Text>
          <Text style={styles.detail}>📧 {item.member.email}</Text>
          <Text style={styles.detail}>
            📅 {item.birthDate || '생일 정보 없음'}
          </Text>
          <View style={styles.winsRow}>
            <MaterialIcons name="emoji-events" size={18} color="#FFD700" />
            <Text style={styles.wins}>{item.winCount} 승</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: IS_TABLET ? 60 : 0, // 아이패드일 때 좌우 패딩 추가
      }}>
      {' '}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>🏆 명예의 전당</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#4D7CFE" />
      ) : (
        <FlatList
          data={rankings.slice(0, 10)}
          renderItem={renderItem}
          keyExtractor={item => `${item.petId}`}
          contentContainerStyle={{
            paddingBottom: 20,
            paddingHorizontal: IS_TABLET ? 60 : 16, // 아이패드 패딩 넓힘
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#333',
  },
  list: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 14,
    backgroundColor: '#F9F9F9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: {width: 0, height: 2},
        borderRadius: 12,
      },
      android: {
        elevation: 5,
        borderWidth: 0.6,
        borderRadius: 10,
        borderColor: '#DDD',
      },
    }),
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    color: '#4D7CFE',
    width: 35,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  infoBox: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  owner: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  detail: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  winsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  wins: {
    marginLeft: 6,
    fontSize: 14,
    color: '#333',
  },
});

export default HallOfFameScreen;
