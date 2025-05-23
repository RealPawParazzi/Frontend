import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const EmptyPostPrompt = ({ message }: { message: string }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.noPosts}>📭 {message}</Text>
      <Text style={styles.suggestion}>첫 게시글을 업로드 해볼까요?</Text>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => {
          // @ts-ignore
          navigation.navigate('StorybookScreen');
        }}
      >
        <Text style={styles.uploadButtonText}>+ 새 게시글 작성</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginTop: 20,
  },
  noPosts: { fontSize: 18, fontWeight: 'bold', color: '#444', marginBottom: 5 },
  suggestion: { fontSize: 14, color: 'gray', marginBottom: 15 },
  uploadButton: {
    backgroundColor: '#4D7CFE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default EmptyPostPrompt;

