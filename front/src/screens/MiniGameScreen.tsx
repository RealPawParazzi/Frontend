import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native'; // ✅ navigation 사용
import Icon from 'react-native-vector-icons/MaterialIcons'; // ✅ Material 아이콘 import
import BattleWithOthers from '../components/HomePage/MiniGame/BattleWithOthers';
import BattleWithOneInstance from '../components/HomePage/MiniGame/BattleWithOneInstance';
import BattleWithTwoInstance from '../components/HomePage/MiniGame/BattleWithTwoInstance';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator'; // 경로에 맞게 수정

type MiniGameRouteProp = RouteProp<RootStackParamList, 'MiniGameScreen'>;

const MiniGameScreen = () => {
  const navigation = useNavigation(); // ✅ navigation 객체
  const route = useRoute<MiniGameRouteProp>();

  const {preSelectedOpponent} = route.params || {};
  const [tab, setTab] = useState<'others' | 'instance-one' | 'instance-two'>(
    preSelectedOpponent ? 'others' : 'others',
  );

  const renderTab = () => {
    switch (tab) {
      case 'others':
        return <BattleWithOthers preSelectedOpponent={preSelectedOpponent} />;
      case 'instance-one':
        return <BattleWithOneInstance />;
      case 'instance-two':
        return <BattleWithTwoInstance />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#FFFFFF', height: '100%'}}>
      {/* ✅ 뒤로가기 아이콘 (MaterialIcons) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color="#4D7CFE" />
        </TouchableOpacity>
      </View>

      {/* 탭 UI 개선 - 3개로 확장 */}
      <View style={styles.tabWrapper}>
        <View style={styles.tabBox}>
          <TouchableOpacity
            style={[styles.tabItem, tab === 'others' && styles.activeTabItem]}
            onPress={() => setTab('others')}>
            <Text
              style={[
                styles.tabItemText,
                tab === 'others' && styles.activeTabText,
              ]}>
              다른 펫과
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabItem,
              tab === 'instance-one' && styles.activeTabItem,
            ]}
            onPress={() => setTab('instance-one')}>
            <Text
              style={[
                styles.tabItemText,
                tab === 'instance-one' && styles.activeTabText,
              ]}>
              즉석 펫과
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabItem,
              tab === 'instance-two' && styles.activeTabItem,
            ]}
            onPress={() => setTab('instance-two')}>
            <Text
              style={[
                styles.tabItemText,
                tab === 'instance-two' && styles.activeTabText,
              ]}>
              즉석 펫끼리
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={{padding: 20}}>
        {renderTab()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  backText: {
    fontSize: 14,
    color: '#4D7CFE',
    fontWeight: 'bold',
  },
  // 탭 박스 바깥 여백
  tabWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  // 탭 박스
  tabBox: {
    flexDirection: 'row',
    backgroundColor: '#F4F4F4',
    borderRadius: 16,
    overflow: 'hidden',
  },
  // 탭 항목 기본
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 활성 탭
  activeTabItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // 텍스트
  tabItemText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999999',
  },
  activeTabText: {
    color: '#4D7CFE',
  },
});

export default MiniGameScreen;
