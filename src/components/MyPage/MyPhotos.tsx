import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getImageSource} from '../../utils/imageUtils';
import boardStore from '../../context/boardStore';


const DEFAULT_PROFILE_IMAGE = require('../../assets/images/user-2.png');

interface Props {
  userId: number;
}

/**
 * ✅ MyPhotos 컴포넌트
 * - 대표 이미지가 "사진(jpg/png 등)"인 게시글만 출력
 */
const MyPhotos: React.FC<Props> = ({userId}) => {
  const navigation = useNavigation();
  const {userBoardsMap} = boardStore();

  // ✅ 대표 이미지가 "동영상이 아닌 사진"인 게시글만 필터링
  const myBoards = userBoardsMap[userId] || [];
  const photoBoards = myBoards.filter(
    board =>
      board.titleImage &&
      !board.titleImage.toLowerCase().endsWith('.mp4') &&
      !board.titleImage.toLowerCase().endsWith('.mov') &&
      !board.titleImage.toLowerCase().includes('video'),
  );


  return (
    <FlatList
      data={photoBoards}
      keyExtractor={item => item.id.toString()}
      numColumns={3}
      renderItem={({item}) => (
        <TouchableOpacity
          style={styles.photoContainer}
          onPress={() => {
            // @ts-ignore
            navigation.navigate('StorybookDetailScreen', {boardId: item.id});
          }}>
          <Image
            source={getImageSource(item.titleImage, DEFAULT_PROFILE_IMAGE)}
            style={styles.photo}
          />
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.noPosts}>📷 사진이 포함된 게시글이 없습니다!</Text>
          <Text style={styles.suggestion}>첫 게시글을 업로드 해볼까요?</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('StorybookScreen');
            }}>
            <Text style={styles.uploadButtonText}>+ 새 게시글 작성</Text>
          </TouchableOpacity>
        </View>
      }
      contentContainerStyle={photoBoards.length === 0 && styles.fullHeightCenter}
    />
  );
};

const styles = StyleSheet.create({
  photoContainer: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 1,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#eee',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
    margin: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  noPosts: {fontSize: 18, fontWeight: 'bold', color: '#444', marginBottom: 5},
  suggestion: {fontSize: 14, color: 'gray', marginBottom: 15},
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
  fullHeightCenter: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
});

export default MyPhotos;
