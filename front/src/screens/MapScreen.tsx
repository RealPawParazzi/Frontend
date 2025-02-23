import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps'; // ✅ Google Maps 적용
import DateTimePicker from '@react-native-community/datetimepicker';
import useStore from '../context/useStore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/Header';

/** ✅ 반려동물별 산책 경로 데이터 */
const petWalkRoutes: Record<string, { latitude: number; longitude: number }[]> = {
    '김초코': [
        { latitude: 37.5665, longitude: 126.9780 },
        { latitude: 37.5670, longitude: 126.9785 },
        { latitude: 37.5675, longitude: 126.9790 },
    ],
    '바닐라': [
        { latitude: 37.5655, longitude: 126.9760 },
        { latitude: 37.5660, longitude: 126.9765 },
        { latitude: 37.5665, longitude: 126.9770 },
    ],
    '딸기': [
        { latitude: 37.5640, longitude: 126.9750 },
        { latitude: 37.5645, longitude: 126.9755 },
        { latitude: 37.5650, longitude: 126.9760 },
    ],
};

const MapScreen = () => {
    const { userData } = useStore();
    const [selectedPet, setSelectedPet] = useState(userData.petList[0]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    return (
        <View style={styles.container}>
            <Header />

            {/* 📅 날짜 선택 */}
            <View style={styles.datePickerContainer}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.dateText}>{selectedDate.toISOString().split('T')[0]}</Text>
                    <Icon name="calendar-today" size={20} color="black" />
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                            setShowDatePicker(false);
                            if (date) {setSelectedDate(date);}
                        }}
                    />
                )}
            </View>

            {/* 🗺️ Google Maps 적용 */}
            <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE} // ✅ Google Maps 사용 설정
                initialRegion={{
                    latitude: petWalkRoutes[selectedPet.name]?.[0].latitude || 37.5665,
                    longitude: petWalkRoutes[selectedPet.name]?.[0].longitude || 126.9780,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                {/* ✅ 반려동물 산책 경로 마커 */}
                {petWalkRoutes[selectedPet.name]?.map((coord, index) => (
                    <Marker
                        key={index}
                        coordinate={coord}
                        title={index === 0 ? '출발' : index === petWalkRoutes[selectedPet.name].length - 1 ? '도착' : ''}
                    />
                ))}

                {/* ✅ 반려동물 산책 경로 폴리라인 */}
                {petWalkRoutes[selectedPet.name] && (
                    <Polyline
                        coordinates={petWalkRoutes[selectedPet.name]}
                        strokeColor="#FF0000"
                        strokeWidth={5}
                    />
                )}
            </MapView>

            {/* 🐶 반려동물 선택 리스트 */}
            <FlatList
                horizontal
                data={userData.petList}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.petContainer, selectedPet.id === item.id && styles.selectedPet]}
                        onPress={() => setSelectedPet(item)}
                    >
                        <Image source={item.image} style={styles.petImage} />
                        <Text style={styles.petName}>{item.name}</Text>
                    </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
            />
        </View>
    );
};

/** ✅ 스타일 정의 */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    datePickerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
    label: { fontSize: 16, marginRight: 10 },
    dateButton: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: 'white', borderRadius: 10 },
    dateText: { fontSize: 16, marginRight: 5 },
    map: { flex: 1 },
    petContainer: { alignItems: 'center', marginHorizontal: 10, padding: 5, borderRadius: 10, backgroundColor: 'white' },
    selectedPet: { backgroundColor: '#D9E6FF' },
    petImage: { width: 60, height: 60, borderRadius: 30 },
    petName: { fontSize: 12, marginTop: 5 },
});

export default MapScreen;
