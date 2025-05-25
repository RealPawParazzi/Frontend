import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import BattleWithOthers from '../components/HomePage/MiniGame/BattleWithOthers';
import BattleWithOneAI from '../components/HomePage/MiniGame/BattleWithOneAI';
import BattleWithTwoAI from '../components/HomePage/MiniGame/BattleWithTwoAI';

const MiniGameScreen = () => {
  const [tab, setTab] = useState<'others' | 'ai-one' | 'ai-two'>('others');

  const renderTab = () => {
    switch (tab) {
      case 'others':
        return <BattleWithOthers />;
      case 'ai-one':
        return <BattleWithOneAI />;
      case 'ai-two':
        return <BattleWithTwoAI />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* 탭 UI 개선 - 3개로 확장 */}
      <View style={styles.tabWrapper}>
        <View style={styles.tabBox}>
          <TouchableOpacity
            style={[styles.tabItem, tab === 'others' && styles.activeTabItem]}
            onPress={() => setTab('others')}
          >
            <Text style={[styles.tabItemText, tab === 'others' && styles.activeTabText]}>
              다른 펫과
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, tab === 'ai-one' && styles.activeTabItem]}
            onPress={() => setTab('ai-one')}
          >
            <Text style={[styles.tabItemText, tab === 'ai-one' && styles.activeTabText]}>
              즉석 펫과
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, tab === 'ai-two' && styles.activeTabItem]}
            onPress={() => setTab('ai-two')}
          >
            <Text style={[styles.tabItemText, tab === 'ai-two' && styles.activeTabText]}>
              즉석 펫끼리
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {renderTab()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    shadowOffset: { width: 0, height: 1 },
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
