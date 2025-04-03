import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Image,
    Alert,
    Modal,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { requestLocationPermission } from '../utils/permissions/locationPermission';
import Geolocation from 'react-native-geolocation-service';
import walkStore from '../context/walkStore';
import userStore from '../context/userStore';
import Icon from 'react-native-vector-icons/MaterialIcons';


const MapScreen = () => {
    const { userData } = userStore();
    const { saveWalk, fetchWalk } = walkStore();
    const [selectedPet, setSelectedPet] = useState(userData.petList[0]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isWalking, setIsWalking] = useState(false);
    const [walkRoute, setWalkRoute] = useState<{ latitude: number; longitude: number; timestamp: string }[]>([]);
    const [startTime, setStartTime] = useState<string | null>(null);
    const [totalDistance, setTotalDistance] = useState(0);
    const [averageSpeed, setAverageSpeed] = useState(0);
    const [currentWalkId, setCurrentWalkId] = useState<number | null>(null);
    const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [isPetModalVisible, setPetModalVisible] = useState(false);
    const [keepThisPet, setKeepThisPet] = useState(true);
    const mapRef = useRef<MapView | null>(null); // ✅ 지도 참조 객체 추가

    const checkLocationPermission = async (): Promise<boolean> => {
        const granted = await requestLocationPermission();
        console.log(granted ? '✅ 위치 권한 허용됨' : '❌ 위치 권한 거부됨');
        if (!granted) {
            Alert.alert('위치 권한 필요', '산책을 기록하려면 위치 권한을 허용해주세요.');
        }
        return granted; // ✅ 올바르게 boolean 값 반환
    };

    /** ✅ 현재 위치 가져오기 함수 */
    const getCurrentLocation = async () => {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            Alert.alert('❌ 위치 권한 거부됨', '현재 위치를 가져올 수 없습니다.');
            return;
        }

        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentLocation({ latitude, longitude });

                // ✅ 현재 위치를 지도 중심으로 이동
                mapRef.current?.animateToRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }, 1000);
            },
            (error) => {
                console.error('❌ 위치 가져오기 실패:', error);

                let errorMessage = '위치 정보를 가져올 수 없습니다.';
                if (error.code === 1) {
                    errorMessage = '위치 서비스가 비활성화되어 있습니다. 설정에서 활성화해주세요.';
                } else if (error.code === 2) {
                    errorMessage = 'GPS 신호를 찾을 수 없습니다.';
                } else if (error.code === 3) {
                    errorMessage = '위치 요청 시간이 초과되었습니다.';
                }

                Alert.alert('위치 오류', errorMessage);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
        );
    };

    /** ✅ 최초 앱 실행 시 현재 위치 가져오기 */
    useEffect(() => {
        getCurrentLocation();
    }, []);

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
            const hasPermission = await checkLocationPermission();
            if (!hasPermission) {
                Alert.alert('❌ 위치 권한 거부됨', '산책을 기록하려면 위치 권한이 필요합니다.');
                setIsWalking(false);
                return;
            }

            /** 위치 권한 허용된 경우 위치 추적 시작 */
            setStartTime(new Date().toISOString().replace('Z', '').split('.')[0]);
            console.log(`[산책 시작시간] : ${startTime}`);


            watchId = Geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    // ✅ 현재 위치 상태 업데이트
                    setCurrentLocation({ latitude, longitude });

                    // ✅ 현재 위치에 따라 지도 이동 (산책 중만 이동)
                    if (isWalking) {
                        mapRef.current?.animateToRegion({
                            latitude,
                            longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }, 500);
                    }

                    /** ✅ 위치 중복 저장 방지 */
                    if (
                        walkRoute.length === 0 ||
                        (latitude !== walkRoute[walkRoute.length - 1].latitude &&
                            longitude !== walkRoute[walkRoute.length - 1].longitude)
                    ) {
                        setWalkRoute((prevRoute) => [
                            ...prevRoute,
                            { latitude, longitude, timestamp: new Date().toISOString().replace('Z', '').split('.')[0] },
                        ]);
                    }
                },
                (error) => console.error('❌ 위치 추적 오류:', error),
                { enableHighAccuracy: true, distanceFilter: 5, interval: 5000 } // 🔹 5m 이동 시마다 업데이트
            );
        };

        /** 산책 시작 시 위치 추적 실행 */
        if (isWalking) {
            /** ✅ 산책 시작 */
            console.log('🚶‍♂️ [산책 시작] 버튼 클릭됨');
            startTracking();
        } else {
            if (watchId) { Geolocation.clearWatch(watchId); }
        }

        return () => {
            if (watchId) { Geolocation.clearWatch(watchId); }
        };
    }, [isWalking, startTime, walkRoute]);

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
        console.log('⏹ [산책 종료] 버튼 클릭됨');
        setIsWalking(false);


        if (walkRoute.length > 0 && startTime) {

            const endTime = new Date().toISOString().replace('Z', '').split('.')[0];
            console.log(`[산책 종료시간] : ${endTime}`);
            console.log(`📍 [산책 경로] 총 ${walkRoute.length}개의 위치 데이터 기록됨`);

            // saveWalk이 walkId를 반환하도록 변경
            const savedWalkId = await saveWalk(
                Number(selectedPet.id),
                walkRoute,
                startTime,  // ✅ 변환된 시간 사용
                endTime
            );

            if (savedWalkId) {
                setCurrentWalkId(savedWalkId); // walkId 저장
                fetchWalk(savedWalkId); // 최신 데이터 반영
                Alert.alert('✅ 산책 기록이 저장되었습니다! 📍');
                console.log(`✅ [산책 기록 저장 성공] walkId: ${savedWalkId}`);
            } else {
                Alert.alert('❌ 산책 기록 저장 실패', '다시 시도해주세요.');
            }

            setWalkRoute([]);
            setStartTime(null);
        }
    };

    return (
        <View style={styles.container}>
            {/* 🗺️ Google Maps 적용 */}
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={StyleSheet.absoluteFillObject} // ✅ 화면 전체 덮도록 설정
                    provider={PROVIDER_GOOGLE}
                    initialRegion={{
                        latitude: 37.5665,
                        longitude: 126.9780,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                >
                    {/* ✅ 현재 위치 마커 */}
                    {currentLocation && (
                        <Marker coordinate={currentLocation}>
                            <Image
                                source={require('../assets/images/marker/currentIcon.png')}
                                style={styles.markerIcon}
                            />
                        </Marker>
                    )}

                    {/* ✅ 현재 산책 경로 마커 */}
                    {walkRoute.length > 0 && walkRoute.map((coord, index) => (
                        <Marker key={index} coordinate={coord}>
                            <Image
                                source={
                                    index === 0
                                        ? require('../assets/images/marker/startIcon.png')
                                        : index === walkRoute.length - 1
                                            ? require('../assets/images/marker/endIcon.png')
                                            : require('../assets/images/marker/middleIcon.png')
                                }
                                style={styles.markerIcon}
                            />
                        </Marker>
                    ))}

                    {/* ✅ 실시간 산책 경로 표시 */}
                    {walkRoute.length > 1 && (
                        <Polyline coordinates={walkRoute} strokeColor="#FF5733" strokeWidth={5} />
                    )}
                </MapView>
            </View>

            {/* 📍 현재 위치 버튼 (우하단 고정) */}
            <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
                <Icon name="my-location" size={24} color="white" />
            </TouchableOpacity>

            {/* 📊 거리/속도 통계 + 산책 버튼 */}
            <View style={styles.statsOverlay}>
                <Text style={styles.statsText}>이동 거리: {totalDistance} km</Text>
                <Text style={styles.statsText}>평균 속도: {averageSpeed} km/h</Text>
                <TouchableOpacity
                    style={[styles.walkButton, isWalking && styles.walking]}
                    onPress={() => {
                        if (isWalking) handleWalkEnd();
                        else { setPetModalVisible(true); }
                    }}
                >
                    <Text style={styles.walkButtonText}>{isWalking ? '산책 종료' : '산책 시작'}</Text>
                </TouchableOpacity>
            </View>


            <Modal visible={isPetModalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>🤔 <Text style={{ color: '#4D7CFE' }}>누구랑</Text> 산책할까요?</Text>
                        <FlatList
                            horizontal
                            data={userData.petList}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => setSelectedPet(item)}
                                    style={[
                                        styles.modalPetCard,
                                        selectedPet?.id === item.id && styles.modalPetCardSelected,
                                    ]}
                                >
                                    <Image source={item.image} style={{ width: 50, height: 50, borderRadius: 25 }} />
                                    <Text>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            showsHorizontalScrollIndicator={false}
                        />

                        <View style={styles.checkboxRow}>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center' }}
                                onPress={() => setKeepThisPet(!keepThisPet)}
                            >
                                <Icon
                                    name={keepThisPet ? 'check-box' : 'check-box-outline-blank'}
                                    size={24}
                                    color={keepThisPet ? '#4D7CFE' : '#999'}
                                />
                                <Text style={{ marginLeft: 8 }}>계속 이 아이와 산책할게요</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                setPetModalVisible(false);
                                setIsWalking(true);
                            }}
                        >
                            <Text style={styles.modalButtonText}>산책 시작하기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};


/** ✅ 스타일 정의 */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    /** 🗺️ 지도 스타일 */
    mapContainer: { flex: 1.5, overflow: 'hidden' },
    map: { width: '100%', height: '100%' },

    statsOverlay: {
        position: 'absolute',
        bottom: 140,
        alignSelf: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    statsText: { fontSize: 16, fontWeight: 'bold' },

    /** 📍 현재 위치 버튼 */
    locationButton: {
        position: 'absolute',
        bottom: 140,
        right: 20,
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 50,
        elevation: 3,
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

    markerIcon: {
        width: 36,
        height: 36,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        borderRadius: 50,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 30,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    modalPetCard: {
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#F0F0F0',
    },
    modalPetCardSelected: {
        backgroundColor: '#FFDD99',
        borderWidth: 2,
        borderColor: '#FFB400',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    checkboxLabel: { marginLeft: 8 },
    modalButton: {
        backgroundColor: '#4D7CFE',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    modalButtonText: { color: 'white', fontSize: 16 },
});

export default MapScreen;

