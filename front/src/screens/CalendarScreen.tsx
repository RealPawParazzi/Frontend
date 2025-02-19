import React, { useState } from 'react';
import { View, Text, FlatList, Image, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import useStore from '../context/useStore';
import Header from "../components/Header";

const CalendarScreen = () => {
    const { userData } = useStore(); // ✅ Zustand에서 사용자 데이터 가져오기
    const [selectedDate, setSelectedDate] = useState('');
    const [searchText, setSearchText] = useState('');

    // 📌 선택한 날짜의 활동 기록 필터링
    const filteredPosts = userData.recentPosts.filter(post =>
        post.title.includes(searchText) || searchText === ''
    );

    return (
        <View style={styles.container}>
            <Header />

            {/* 🗓️ 캘린더 */}
            <Calendar
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={{
                    [selectedDate]: { selected: true, selectedColor: '#6A5ACD' },
                }}
                theme={{
                    selectedDayBackgroundColor: '#6A5ACD',
                    todayTextColor: '#6A5ACD',
                    arrowColor: '#6A5ACD',
                }}
            />

            {/* 🔍 반려동물 검색 */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="검색 반려동물"
                    onChangeText={setSearchText}
                    value={searchText}
                />
                <TouchableOpacity style={styles.searchButton} onPress={() => setSearchText('')}>
                    <Text style={styles.searchButtonText}>초기화</Text>
                </TouchableOpacity>
            </View>

            {/* 📌 선택한 날짜의 반려동물 기록 표시 */}
            <FlatList
                data={filteredPosts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.postContainer}>
                        <Image source={item.image} style={styles.postImage} />
                        <View style={styles.postInfo}>
                            <Text style={styles.postTitle}>{item.title}</Text>
                            <Text style={styles.postDescription}>Category • $$ • 1.2 miles away</Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white', padding: 15 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
    searchInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8 },
    searchButton: { backgroundColor: '#6A5ACD', padding: 10, marginLeft: 10, borderRadius: 8 },
    searchButtonText: { color: 'white', fontWeight: 'bold' },
    postContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
    postImage: { width: 60, height: 60, borderRadius: 10, marginRight: 10 },
    postInfo: { flex: 1 },
    postTitle: { fontSize: 16, fontWeight: 'bold' },
    postDescription: { fontSize: 12, color: 'gray' },
});

export default CalendarScreen;
