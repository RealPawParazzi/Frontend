// 📁 screens/TeamInfoScreen.tsx

import React from 'react';
import {View, Text, StyleSheet, ScrollView, Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const teamMembers = [
  {
    name: '이한준',
    role: '팀장, 백엔드, AI 서버 개발, 배포 관리',
    tasks: [
      '팀장으로서 운영진 관리 및 조율',
      '개발 자료 정리 및 관리',
      'AI 서버 개발, 프롬프트 설계',
      'REST API 설계 및 구현',
      '서버 배포 및 관리',
    ],
  },
  {
    name: '원준영',
    role: '백엔드, 백오피스 개발',
    tasks: [
      'REST API 설계 및 구현',
      'AI 프롬프트 설계 및 구현',
      'DB 설계 및 관리',
      '백오피스 개발',
    ],
  },
  {
    name: '이경민',
    role: '프론트엔드, 딥러닝 모델 개발',
    tasks: [
      'AI 서버 연동',
      '백오피스 ui/ux 프로토타입 디자인',
      '딥러닝 모델 개발',
      '자동 태깅 개발',
    ],
  },
  {
    name: '신민금',
    role: '통합 프론트엔드',
    tasks: [
      '프론트엔드 전반',
      'UI/UX 디자인',
      '기획 및 화면설계',
      'ios/안드로이드 앱 개발',
      'AI 서버 연동',
    ],
  },
];

const TeamInfoScreen = () => {
  return (
    <SafeAreaView style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>운영진 소개</Text>
        {teamMembers.map((member, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.name}>
              {member.name} <Text style={styles.role}>| {member.role}</Text>
            </Text>
            {member.tasks.map((task, idx) => (
              <Text key={idx} style={styles.task}>
                • {task}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4d7cfe',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
        borderWidth: 0.8,
        borderColor: '#DDD',
      },
    }),
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },
  role: {
    fontWeight: '500',
    color: '#4d7cfe',
  },
  task: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
    lineHeight: 20,
  },
});

export default TeamInfoScreen;

