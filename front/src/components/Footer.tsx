// 📁 components/Footer.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import {useNavigation} from '@react-navigation/native';

const Footer = () => {
  const navigation = useNavigation();

  const openGitHub = () => {
    Linking.openURL('https://github.com/RealPawParazzi');
  };
  return (
    <View style={styles.container}>
      {/* ✅ 상단 링크 버튼 라인 */}
      <View style={styles.linkRow}>
        {/*<TouchableOpacity onPress={() => navigation.navigate('CuriousScreen')}>*/}
        {/*  <Text style={styles.link}>1:1 문의</Text>*/}
        {/*</TouchableOpacity>*/}
        {/*<Text style={styles.separator}>|</Text>*/}
        <TouchableOpacity onPress={() => navigation.navigate('CuriousScreen')}>
          <Text style={styles.link}>고객센터</Text>
        </TouchableOpacity>
        <Text style={styles.separator}>|</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CuriousScreen')}>
          <Text style={styles.link}>서비스 안내</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ 회사명 및 약관 */}
      <Text style={styles.corp}>© 2025 PawParazzi Project</Text>
      <View style={styles.termsRow}>
        <TouchableOpacity onPress={openGitHub}>
          <Text style={styles.terms}>GitHub</Text>
        </TouchableOpacity>
        <Text style={styles.separator}>|</Text>
        <TouchableOpacity onPress={() => navigation.navigate('TeamInfoScreen')}>
          <Text style={styles.terms}>운영진 정보</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ 고지 문구 */}
      <Text style={styles.notice}>
        PawParazzi는 사용자 업로드 기반 콘텐츠를 포함하고 있으며,
        본 앱은 콘텐츠 중개 플랫폼으로서 직접적인 거래에 대한 책임을 지지 않습니다.
        또한, 부적절한 콘텐츠 제작에 대한 책임 또한 사용자에게 있으며,
        운영진으로부터 제재를 받을 수 있습니다.

      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    marginTop: 50,
    height: 350,
  },
  linkRow: {
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 10,
  },
  link: {
    color: '#4d7cfe',
    fontSize: 14,
    fontWeight: '600',
  },
  separator: {
    marginHorizontal: 10,
    color: '#999',
  },
  corp: {
    fontSize: 13,
    color: '#888',
    marginTop: 15,
    marginBottom: 5,
  },
  termsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  terms: {
    fontSize: 13,
    color: '#555',
  },
  notice: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Footer;
