// 📄 screens/SearchScreen.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import boardStore from '../context/boardStore';
import userStore from '../context/userStore';

interface Props {
  searchQuery: string;
  onClose: () => void;
}

interface Props {
  searchQuery: string;
  onClose: () => void;
}

const SearchScreen: React.FC<Props> = ({ searchQuery, onClose }) => {
  const navigation = useNavigation();
  const { boardList } = boardStore();

  const filteredPosts = useMemo(() => {
    return boardList.filter(post => {
      const lowerQuery = searchQuery.toLowerCase();
      return (
        post.title?.toLowerCase().includes(lowerQuery) ||
        post.titleContent?.toLowerCase().includes(lowerQuery) ||
        post.tag?.toLowerCase().includes(lowerQuery) ||
        post.author.nickname?.toLowerCase().includes(lowerQuery)
      );
    });
  }, [searchQuery, boardList]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.overlay}
    >
      <View style={styles.headerRow}>
        <Text style={styles.resultLabel}>🔍 검색 결과</Text>
        {/*<TouchableOpacity onPress={onClose}>*/}
        {/*  <Text style={styles.closeText}>✕</Text>*/}
        {/*</TouchableOpacity>*/}
      </View>
      <ScrollView
        style={styles.resultBox}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <TouchableOpacity
              key={post.id}
              style={styles.resultItem}
              onPress={() => {
                //@ts-ignore
                navigation.navigate('StorybookDetailScreen', { boardId: post.id });
                onClose();
              }}
            >
              <Text style={styles.resultTitle}>{post.title}</Text>
              <Text style={styles.resultSub}>{post.titleContent}</Text>
              <Text style={styles.resultMeta}>
                • 작성자: {post.author.nickname}  {post.tag ? `#${post.tag}` : ''}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noResult}>검색된 게시물이 없습니다</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 105 : 60, // 헤더 아래부터 시작
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 999, // 헤더 아래, 다른 컴포넌트 위
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#4D7CFE',
  },
  closeText: {
    fontSize: 18,
    color: '#999',
  },
  resultBox: {
    flex: 1,
  },
  resultItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  resultTitle: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 15,
  },
  resultMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
  },
  resultSub: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  noResult: {
    textAlign: 'center',
    marginTop: 30,
    color: '#aaa',
  },
});

export default SearchScreen;
