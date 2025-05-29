// 📅 CalendarScreen.tsx - 게시글 & 산책 날짜 캘린더 표시 + 선택 날짜 활동 상세
import React, {useState, useEffect, useCallback, useMemo} from 'react';
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
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native'; // 🔹 네비게이션 훅
import {Calendar} from 'react-native-calendars';
import userStore from '../context/userStore';
import walkStore from '../context/walkStore';
import boardStore from '../context/boardStore';
import Footer from '../components/Footer';

const screenWidth = Dimensions.get('window').width;
const isTablet = screenWidth >= 768; // iPad 기준

const CalendarScreen = () => {
  const navigation = useNavigation(); // 🔹 화면 이동용 네비게이션 객체

  const {userData} = userStore();
  const {walks, fetchAllMyWalks} = walkStore(); // ✅ 전체 산책기록 불러오기
  const {userBoardsMap, fetchUserBoards} = boardStore();

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [searchText, setSearchText] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [refreshing, setRefreshing] = useState(false); // ✅ pull-to-refresh 상태

  // 📆 날짜 문자열 파싱 함수
  const formatDate = (datetime: string) => datetime.split('T')[0];

  // ✅ 내 게시글만 추출
  const myPosts = useMemo(() => {
    return userBoardsMap[Number(userData.id)] ?? [];
  }, [userBoardsMap, userData.id]);

  // ✅ 새로고침 핸들러
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchUserBoards(Number(userData.id)),
      fetchAllMyWalks(),
    ]);
    setRefreshing(false);
  }, [fetchUserBoards, fetchAllMyWalks, userData.id]);

  useEffect(() => {
    // ✅ 화면이 처음 로드될 때 산책 기록과 게시글을 불러옴
    fetchAllMyWalks();
    fetchUserBoards(Number(userData.id));
  }, [fetchAllMyWalks, fetchUserBoards, userData.id]);

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
    myPosts.forEach(post => {
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
  }, [walks, myPosts, selectedDate]);

  // ✅ 선택된 날짜의 산책 + 게시물 필터링
  const filteredWalks = useMemo(() => {
    return Object.values(walks).filter(walk => {
      const isSameDate = formatDate(walk.startTime) === selectedDate;

      const matchesSearch =
        searchText.trim() === '' ||
        walk.pet?.name?.toLowerCase().includes(searchText.toLowerCase());

      return isSameDate && matchesSearch;
    });
  }, [walks, selectedDate, searchText]);

  const filteredPosts = myPosts.filter(
    post =>
      post.writeDatetime?.startsWith(selectedDate) &&
      (post.title.includes(searchText) || searchText === ''),
  );

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <ScrollView
        style={{flex: 1, backgroundColor: '#ffffff'}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4D7CFE']}
            tintColor="#4D7CFE"
          />
        }
        keyboardShouldPersistTaps="handled">
        <View style={{flex: 1, alignItems: 'center'}}>
          <View style={{width: isTablet ? 600 : '100%'}}>
            <Calendar
              style={{padding: 20}}
              onDayPress={(day: {dateString: string}) =>
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

            <ScrollView
              style={{flex: 1, paddingHorizontal: 20, paddingBottom: 250}}>
              {/* 📍 산책 기록 출력 */}
              {filteredWalks.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>📍 산책 기록</Text>
                  {filteredWalks.map(walk => (
                    <TouchableOpacity
                      key={walk.id}
                      style={styles.cardWalk}
                      onPress={
                        () =>
                          //@ts-ignore
                          navigation.navigate('Map', {walkId: walk.id}) // ✅ 맵 화면으로 이동
                      }>
                      <Text style={styles.cardTitle}>
                        [산책] {walk.distance}km
                      </Text>
                      <Text style={styles.cardSub}>
                        {new Date(walk.startTime).toLocaleTimeString()} • 평균{' '}
                        {walk.averageSpeed}km/h
                      </Text>
                      {walk.pet && (
                        <Text style={styles.cardSub}>
                          🐾 {walk.pet.name} (
                          {walk.pet.type === 'DOG' ? '강아지' : '고양이'})
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* 📝 게시물 출력 */}
              {filteredPosts.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>📝 게시물</Text>
                  {filteredPosts.map(post => (
                    <TouchableOpacity
                      key={post.id}
                      style={styles.cardPost}
                      onPress={
                        () =>
                          //@ts-ignore
                          navigation.navigate('StorybookDetailScreen', {
                            boardId: post.id,
                          }) // ✅ 상세 게시글로 이동
                      }>
                      <Text style={styles.cardTitle}>
                        [게시물] {post.title}
                      </Text>
                      <Text style={styles.cardContent}>
                        {post.titleContent}
                      </Text>
                      <Text style={styles.cardSub}>
                        작성자: {post.author?.nickname}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* ❗활동이 없는 경우 */}
              {filteredWalks.length === 0 && filteredPosts.length === 0 && (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyEmoji}>🐾</Text>
                  <Text style={styles.emptyTitle}>
                    이 날은 조용한 하루였어요!
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    산책이나 게시물이 없네요 💤
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E4ECFA',
  },

  cardWalk: {
    backgroundColor: '#E7F0FF', // 💙 산책 카드 배경
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#B7D4FF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },

  cardPost: {
    backgroundColor: '#F1F3FF', // 🔵 게시물 카드 배경
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#CBD7FF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },

  cardTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#4D7CFE',
    marginBottom: 4,
  },

  cardSub: {
    fontSize: 13,
    color: '#666',
  },

  cardContent: {
    fontSize: 14,
    marginTop: 4,
    color: '#333',
  },

  emptyBox: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F7F9FE',
    borderRadius: 12,
    borderColor: '#DDE6FF',
    borderWidth: 1,
  },

  emptyEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4D7CFE',
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default CalendarScreen;
