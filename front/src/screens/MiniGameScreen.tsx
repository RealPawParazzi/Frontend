// 📄 screens/MiniGameScreen.tsx
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
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'others' && styles.activeTab]}
          onPress={() => setTab('others')}
        >
          <Text style={styles.tabText}>다른 펫과</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'ai-one' && styles.activeTab]}
          onPress={() => setTab('ai-one')}
        >
          <Text style={styles.tabText}>가상펫과</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'ai-two' && styles.activeTab]}
          onPress={() => setTab('ai-two')}
        >
          <Text style={styles.tabText}>가상펫끼리</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {renderTab()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#F4F4F4',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  activeTab: {
    backgroundColor: '#4D7CFE',
  },
  tabText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MiniGameScreen;

