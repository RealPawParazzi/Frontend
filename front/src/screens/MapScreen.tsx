import React, { useState, useEffect } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Alert, Platform} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { requestNotificationPermission } from '../utils/permissions/notificationPermission'; // ✅ 권한 요청 추가
import Geolocation from 'react-native-geolocation-service'; // ✅ 위치 추적
import DateTimePicker from '@react-native-community/datetimepicker';
import walkStore from '../context/walkStore';
import userStore from '../context/userStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MapScreen = () => {
    const { userData } = userStore();
    const { saveWalk, fetchWalk, walks } = walkStore();
    const [selectedPet, setSelectedPet] = useState(userData.petList[0]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isWalking, setIsWalking] = useState(false);
    const [walkRoute, setWalkRoute] = useState<{ latitude: number; longitude: number; timestamp: string }[]>([]);
    const [startTime, setStartTime] = useState<string | null>(null);
    const [totalDistance, setTotalDistance] = useState(0);
    const [averageSpeed, setAverageSpeed] = useState(0);
    const [currentWalkId, setCurrentWalkId] = useState<number | null>(null);

    const checkNotificationPermission = async (): Promise<boolean> => {
        const granted = await requestNotificationPermission();
        console.log(granted ? '✅ 알림 권한 허용됨' : '❌ 알림 권한 거부됨');
        return granted; // ✅ 올바르게 boolean 값 반환
    };


    /** ✅ 선택된 펫의 산책 기록 불러오기 */
    useEffect(() => {
        if (selectedPet?.id) {
            console.log(`📥 [산책 기록 요청] 펫 ID: ${selectedPet.id}`);
            fetchWalk(Number(selectedPet.id)); // petId 기준으로 변경
        }
    }, [selectedPet, selectedDate, fetchWalk]);

    /** ✅ 위치 추적 설정 (위치 권한 확인 후 실행) */
    useEffect(() => {
        let watchId: any = null;

        const startTracking = async () => {
            /** 위치 권한 요청 후 결과 확인 */
            const hasPermission = await checkNotificationPermission();
            if (!hasPermission) {
                Alert.alert('❌ 위치 권한 거부됨', '산책을 기록하려면 위치 권한이 필요합니다.');
                setIsWalking(false);
                return;
            }

            /** 위치 권한 허용된 경우 위치 추적 시작 */
            setStartTime(new Date().toISOString());
            watchId = Geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    /** ✅ 위치 중복 저장 방지 */
                    if (
                        walkRoute.length === 0 ||
                        (latitude !== walkRoute[walkRoute.length - 1].latitude &&
                            longitude !== walkRoute[walkRoute.length - 1].longitude)
                    ) {
                        setWalkRoute((prevRoute) => [
                            ...prevRoute,
                            { latitude, longitude, timestamp: new Date().toISOString() },
                        ]);
                    }
                },
                (error) => console.error('❌ 위치 추적 오류:', error),
                { enableHighAccuracy: true, distanceFilter: 5, interval: 5000 } // 🔹 5m 이동 시마다 업데이트
            );
        };

        /** 산책 시작 시 위치 추적 실행 */
        if (isWalking) {
            startTracking();
        } else {
            if (watchId) { Geolocation.clearWatch(watchId); }
        }

        return () => {
            if (watchId) { Geolocation.clearWatch(watchId); }
        };
    }, [isWalking, walkRoute]);

    /** ✅ 실시간 거리 및 평균 속도 업데이트 */
    useEffect(() => {
        if (walkRoute.length > 1) {
            const distance = calculateDistance(walkRoute);
            setTotalDistance(distance);
            const duration = (new Date().getTime() - new Date(startTime || '').getTime()) / (1000 * 60 * 60);
            setAverageSpeed(duration > 0 ? parseFloat((distance / duration).toFixed(2)) : 0);
        }
    }, [startTime, walkRoute]);

    /** ✅ 거리 계산 함수 */
    const calculateDistance = (route: { latitude: number; longitude: number }[]) => {
        let distance = 0;
        for (let i = 1; i < route.length; i++) {
            const prev = route[i - 1];
            const curr = route[i];
            distance += Math.sqrt(
                Math.pow(curr.latitude - prev.latitude, 2) + Math.pow(curr.longitude - prev.longitude, 2)
            ) * 111;
        }
        return parseFloat(distance.toFixed(2));
    };

    /** ✅ 산책 종료 후 데이터 저장 */
    const handleWalkEnd = async () => {
        setIsWalking(false);
        if (walkRoute.length > 0 && startTime) {
            const endTime = new Date().toISOString();

            // saveWalk이 walkId를 반환하도록 변경
            const savedWalkId = await saveWalk(Number(selectedPet.id), walkRoute, startTime, endTime);

            if (savedWalkId) {
                setCurrentWalkId(savedWalkId); // walkId 저장
                fetchWalk(savedWalkId); // 최신 데이터 반영
                Alert.alert('✅ 산책 기록이 저장되었습니다! 📍');
            } else {
                Alert.alert('❌ 산책 기록 저장 실패', '다시 시도해주세요.');
            }

            setWalkRoute([]);
            setStartTime(null);
        }
    };

    return (
        <View style={styles.container}>

            {/* 📅 날짜 선택 */}
            <View style={styles.datePickerContainer}>
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
                            if (date) { setSelectedDate(date); }
                        }}
                    />
                )}
            </View>

            {/* 🗺️ Google Maps 적용 */}
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={{
                        latitude: 37.5665,
                        longitude: 126.9780,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                >
                    {/* ✅ 현재 산책 경로 마커 */}
                    {walkRoute.length > 0 && walkRoute.map((coord, index) => (
                        <Marker
                            key={index}
                            coordinate={coord}
                            title={index === 0 ? '출발' : index === walkRoute.length - 1 ? '도착' : ''}
                        />
                    ))}

                    {/* ✅ 실시간 산책 경로 표시 */}
                    {walkRoute.length > 1 && (
                        <Polyline coordinates={walkRoute} strokeColor="#FF5733" strokeWidth={5} />
                    )}
                </MapView>
            </View>

            {/* ✅ 실시간 거리 & 속도 표시 */}
            <View style={styles.statsContainer}>
                <Text style={styles.statsText}>이동 거리: {totalDistance} km</Text>
                <Text style={styles.statsText}>평균 속도: {averageSpeed} km/h</Text>
            </View>

            {/* 🐾 산책 컨트롤 버튼 */}
            <View style={styles.walkControl}>
                <TouchableOpacity
                    style={[styles.walkButton, isWalking && styles.walking]}
                    onPress={isWalking ? handleWalkEnd : () => setIsWalking(true)}
                >
                    <Text style={styles.walkButtonText}>
                        {isWalking ? '산책 종료' : '산책 시작'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* 🐶 반려동물 선택 */}
            <FlatList
                horizontal
                data={userData.petList}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.petList}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.petButton,
                            selectedPet.id === item.id && styles.selectedPetButton,
                        ]}
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

    /** 📅 날짜 선택 */
    datePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'white',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    dateText: { fontSize: 16, marginRight: 5, fontWeight: 'bold' },

    /** 🗺️ 지도 스타일 */
    mapContainer: { flex: 1.5, overflow: 'hidden', borderRadius: 15, marginHorizontal: 10 },
    map: { width: '100%', height: '100%' },

    statsContainer: { alignItems: 'center', padding: 10 },
    statsText: { fontSize: 16, fontWeight: 'bold' },

    /** 🐾 산책 버튼 */
    walkControl: {
        alignItems: 'center',
        paddingVertical: 15,
    },
    walkButton: {
        backgroundColor: '#FF5733',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    walking: { backgroundColor: '#FFB400' },
    walkButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },


    /** 🐶 반려동물 선택 리스트 */
    petList: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 10,
        justifyContent: 'center',
    },
    petButton: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
        padding: 10,
        borderRadius: 50,
        backgroundColor: 'white',
        width: 70,
        height: 70,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    selectedPetButton: {
        backgroundColor: '#FFDD99',
        borderWidth: 2,
        borderColor: '#FFB400',
    },
    petImage: { width: 50, height: 50, borderRadius: 25 },
    petName: { fontSize: 12, marginTop: 5, fontWeight: '600' },
});

export default MapScreen;
