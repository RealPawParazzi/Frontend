import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useQuestionStore from '../context/questionStore';

const MyInquiriesScreen = () => {
  const navigation = useNavigation();
  const { inquiries, isLoading, loadMyInquiries } = useQuestionStore();

  useEffect(() => {
    loadMyInquiries();
  }, [loadMyInquiries]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔙 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back-ios" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 질문들</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 총 개수 */}
      <Text style={styles.countText}>총 {inquiries.length}개</Text>

      {/* 문의 목록 */}
      <FlatList
        data={inquiries}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardTextBox}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={styles.cardStatusBox}>
              <Text style={[styles.cardStatus, item.answered ? styles.answered : styles.pending]}>
                {item.answered ? '답변 완료' : '답변 대기'}
              </Text>
              <Icon
                name="chevron-right"
                size={20}
                color="#999"
              />
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  backButton: { padding: 5 },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    color: '#111',
  },
  placeholder: { width: 24 },
  countText: {
    fontSize: 13,
    color: '#666',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
  },
  listContainer: { paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTextBox: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
  },
  cardStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  cardStatus: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
  },
  answered: { color: '#2ECC71' },
  pending: { color: '#F39C12' },
});

export default MyInquiriesScreen;
