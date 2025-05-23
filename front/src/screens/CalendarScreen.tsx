// 📅 CalendarScreen.tsx - 게시글 & 산책 날짜 캘린더 표시 + 선택 날짜 활동 상세
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import userStore from '../context/userStore';
import walkStore from '../context/walkStore';
import boardStore from '../context/boardStore';
import Footer from '../components/Footer';

const CalendarScreen = () => {
  const {userData} = userStore();
  const {walks, fetchWalk} = walkStore(); // 🔄 산책 기록 불러오기 함수 추가
  const {boardList, fetchBoardList} = boardStore(); // 🔄 게시글 불러오기 함수 추가


  const [selectedDate, setSelectedDate] = useState('');
  const [searchText, setSearchText] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [refreshing, setRefreshing] = useState(false); // ✅ pull-to-refresh 상태

  // 📆 날짜 문자열 파싱 함수
  const formatDate = (datetime: string) => datetime.split('T')[0];

  // ✅ 새로고침 핸들러
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchBoardList(),
      fetchWalk(Number(userData.id)),
    ]);
    setRefreshing(false);
  }, [fetchBoardList, fetchWalk, userData.id]);

  // 🟦 산책기록 + 게시물 날짜 마킹
  useEffect(() => {
    const tempMarked: Record<string, any> = {};

    // 1️⃣ 산책 날짜 마킹
    Object.values(walks).forEach(walk => {
      const dateKey = formatDate(walk.startTime);
      tempMarked[dateKey] = {
        marked: true,
        dotColor: '#4D7CFE',
        selectedColor: '#4D7CFE',
      };
    });

    // 2️⃣ 게시글 날짜 마킹 (산책 없을 경우만 연한 색)
    boardList.forEach(post => {
      const dateKey = post.writeDatetime?.split('T')[0];
      if (!tempMarked[dateKey]) {
        tempMarked[dateKey] = {
          marked: true,
          dotColor: '#B3C7FF',
        };
      }
    });

    // 3️⃣ 선택 날짜 마킹
    if (selectedDate) {
      tempMarked[selectedDate] = {
        ...(tempMarked[selectedDate] || {}),
        selected: true,
        selectedColor: '#4D7CFE',
      };
    }

    setMarkedDates(tempMarked);
  }, [walks, boardList, selectedDate]);

  // 📌 선택 날짜의 산책 + 게시물 필터
  const filteredWalks = Object.values(walks).filter(
    w => formatDate(w.startTime) === selectedDate,
  );

  const filteredPosts = boardList.filter(
    post =>
      post.writeDatetime?.startsWith(selectedDate) &&
      (post.title.includes(searchText) || searchText === ''),
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
    <ScrollView
      style={{ flex: 1, backgroundColor: '#ffffff' }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#4D7CFE']}
          tintColor="#4D7CFE"
        />
      }
      keyboardShouldPersistTaps="handled" // ✅ 키보드 닫힘 방지
    >
      <Calendar
        style={{padding: 20}}
        onDayPress={(day: {dateString: React.SetStateAction<string>}) =>
          setSelectedDate(day.dateString)
        }
        markedDates={markedDates}
        theme={{
          selectedDayBackgroundColor: '#4D7CFE',
          todayTextColor: '#4D7CFE',
          arrowColor: '#4D7CFE',
        }}
      />

      {/* 🔍 검색창 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="검색 반려동물"
          onChangeText={setSearchText}
          value={searchText}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setSearchText('')}>
          <Text style={styles.searchButtonText}>초기화</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{flex: 1, paddingHorizontal: 20}}>
        {/* 🐾 산책 기록 */}
        {filteredWalks.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>📍 산책 기록</Text>
            {filteredWalks.map(walk => (
              <View key={walk.id} style={styles.walkItem}>
                <Text style={styles.walkTitle}>[산책] {walk.distance}km</Text>
                <Text style={styles.walkDesc}>
                  {new Date(walk.startTime).toLocaleTimeString()} • 평균{' '}
                  {walk.averageSpeed}km/h
                </Text>
              </View>
            ))}
          </>
        )}

        {/* 📝 게시물 */}
        {filteredPosts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>📝 게시물</Text>
            {filteredPosts.map(post => (
              <View key={post.id} style={styles.postItem}>
                <Text style={styles.postTitle}>[게시물] {post.title}</Text>
                <Text style={styles.postContent}>{post.titleContent}</Text>
                <Text style={styles.postAuthor}>
                  작성자: {post.author?.nickname}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
      <Footer />
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
  },
  searchButton: {
    backgroundColor: '#4D7CFE',
    padding: 10,
    marginLeft: 10,
    borderRadius: 8,
  },
  searchButtonText: {color: 'white', fontWeight: 'bold'},

  sectionTitle: {fontSize: 16, fontWeight: 'bold', marginTop: 16},

  walkItem: {
    backgroundColor: '#EDF3FF',
    padding: 10,
    marginTop: 8,
    borderRadius: 8,
  },
  walkTitle: {fontWeight: 'bold', color: '#4D7CFE'},
  walkDesc: {fontSize: 12, color: '#333', marginTop: 2},

  postItem: {
    backgroundColor: '#E6EDFF',
    padding: 10,
    marginTop: 8,
    borderRadius: 8,
  },
  postTitle: {fontWeight: 'bold', color: '#4D7CFE'},
  postContent: {marginTop: 4, fontSize: 14},
  postAuthor: {marginTop: 4, fontSize: 12, color: 'gray'},
});

export default CalendarScreen;
