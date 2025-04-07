// 🐾 MapScreen.tsx - 반려동물 산책 기능 포함 메인 지도 화면
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
    Platform,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { requestLocationPermission } from '../utils/permissions/locationPermission';
import Geolocation from 'react-native-geolocation-service';
import walkStore from '../context/walkStore';
import userStore from '../context/userStore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PetRouteBottomModal from '../components/PetRouteBottomModal'; // 추가된 모달 컴포넌트 import
import PlaceDetailModal from '../components/PlaceDetailModal';
import { searchPetFriendlyPlaces } from '../services/placeSearchService';
import { createPlace } from '../services/placeService';

// NodeJS 타입 오류 방지를 위한 글로벌 선언
declare global {
    namespace NodeJS {
        interface Timeout {}
    }
}

const MapScreen = () => {
    const { userData } = userStore();
    const { saveWalk, fetchWalk, walks, fetchPetWalksByDate } = walkStore(); // fetchPetWalksByDate 추가

    // 🐶 선택된 반려동물
    const [selectedPet, setSelectedPet] = useState(userData.petList[0]);
    // 🟢 산책 중 여부
    const [isWalking, setIsWalking] = useState(false);
    // 🧭 위치 기록 배열
    const [walkRoute, setWalkRoute] = useState<{ latitude: number; longitude: number; timestamp: string }[]>([]);
    // 🕰️ 산책 시작 시간
    const [startTime, setStartTime] = useState<string | null>(null);
    // 📏 총 이동 거리 (km)
    const [totalDistance, setTotalDistance] = useState(0);
    // 🚀 평균 속도 (km/h)
    const [averageSpeed, setAverageSpeed] = useState(0);
    // 🆔 현재 산책 기록 ID
    const [currentWalkId, setCurrentWalkId] = useState<number | null>(null);
    // 📍 현재 위치 좌표
    const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    // 🐾 반려동물 선택 모달
    const [isPetModalVisible, setPetModalVisible] = useState(false);
    const [keepThisPet, setKeepThisPet] = useState(true);
    // ⏱️ 경과 시간 추적용
    const [elapsedTime, setElapsedTime] = useState('00:00:00');

    const [isBottomSheetVisible, setBottomSheetVisible] = useState(false); // 추가: 하단 모달 표시 여부

    const [petRoutes, setPetRoutes] = useState<any[]>([]); // 선택한 펫의 루트를 위한 상태

    // 📍 지도 참조
    const mapRef = useRef<MapView | null>(null); // ✅ 지도 참조 객체 추가
    const [mapRegion, setMapRegion] = useState<Region | null>(null);

    // 근처 검색 장소 배열
    const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);

    const [isPlaceModalVisible, setIsPlaceModalVisible] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<any>(null);


    // ✅ 위치 권한 요청 및 확인 함수
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
                setMapRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });
                console.log('위치 가져오기 성공:', latitude, longitude);

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

    // ✅ 컴포넌트 마운트 시 현재 위치 받아오기
    useEffect(() => {
        getCurrentLocation();
    }, []);

    // ✅ 현재 위치가 정해지면 근처 장소 검색
    useEffect(() => {
        if (currentLocation) {
            const { latitude, longitude } = currentLocation;
            searchPetFriendlyPlaces(latitude, longitude).then((places) => {
                console.log('🐾 nearbyPlaces 저장됨:', places); // 👈 로그 확인!
                setNearbyPlaces(places ?? []);
            });
        }
    }, [currentLocation]);

    // ✅ 타이머 시작 (산책 시작 시)
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>; // ✅ 이게 핵심!

        if (isWalking && startTime) {
            timer = setInterval(() => {
                const diff = new Date().getTime() - new Date(startTime).getTime();
                const hours = String(Math.floor(diff / 3600000)).padStart(2, '0');
                const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
                const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
                setElapsedTime(`${hours}:${minutes}:${seconds}`);
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer); // 💡 여기서도 오류 안 나게 잘 작동함
        };
    }, [isWalking, startTime]);

    /** ✅ 선택된 펫의 산책 기록 불러오기 */
    useEffect(() => {
        if (selectedPet?.id) {
            console.log(`📥 [산책 기록 요청] 펫 ID: ${selectedPet.id}`);
            fetchWalk(Number(selectedPet.id)); // petId 기준으로 변경
        }
    }, [selectedPet, fetchWalk]);

    // ✅ 위치 추적 시작 (산책 중일 때만 watchPosition 실행)
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
                    setMapRegion({
                        latitude,
                        longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    });

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

    // ✅ 거리 계산 및 평균 속도 계산
    useEffect(() => {
        if (walkRoute.length > 1 && startTime) {
            const distance = calculateDistance(walkRoute);
            setTotalDistance(distance);
            const duration = (new Date().getTime() - new Date(startTime || '').getTime()) / (1000 * 60 * 60);
            setAverageSpeed(duration > 0 ? parseFloat((distance / duration).toFixed(2)) : 0);
        }
    }, [startTime, walkRoute]);

    // ✅ 산책 거리 계산 함수 (간단한 유클리드 방식)
    const calculateDistance = (route: string | any[]) => {
        let distance = 0;
        for (let i = 1; i < route.length; i++) {
            const prev = route[i - 1];
            const curr = route[i];
            distance += Math.sqrt(Math.pow(curr.latitude - prev.latitude, 2) + Math.pow(curr.longitude - prev.longitude, 2)) * 111;
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

    const handleSelectPetFromModal = async (petId: number) => {
        // ✅ 1. Pet 객체 존재 여부 체크
        const foundPet = userData.petList.find((pet) => pet.id === petId.toString());
        if (!foundPet) {
            Alert.alert('❌ 선택된 반려동물을 찾을 수 없습니다.');
            return;
        }
        setSelectedPet(foundPet);
        const today = new Date().toISOString().split('T')[0];
        const dateParam = `${today}T12:00:00Z`; // ✅ 고정 시간 (UTC)

        try {
            // ✅ 2. 날짜 기준 산책 기록 불러오기
            const petWalks = await fetchPetWalksByDate(petId, dateParam);

            if (petWalks && petWalks.length > 0) {
                const lastRoute = petWalks[0].route;
                setPetRoutes(lastRoute); // ✅ 경로 상태 저장

                // ✅ 3. 맵 이동
                if (lastRoute.length > 0) {
                    mapRef.current?.animateToRegion({
                        latitude: lastRoute[0].latitude,
                        longitude: lastRoute[0].longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }, 1000);
                }
            } else {
                setPetRoutes([]);
                Alert.alert('🚫 산책 기록 없음', '해당 반려동물의 오늘 산책 기록이 없습니다.');
            }
        } catch (err) {
            console.error('❌ 산책 기록 조회 중 에러 발생:', err);
            Alert.alert('에러', '산책 기록을 불러오는 중 문제가 발생했습니다.');
        }

        setBottomSheetVisible(false); // ✅ 모달 닫기
    };


    return (
        <View style={styles.container}>
            {/* ✅ 산책 중 상단 정보 바 */}
            {isWalking && (
                <View style={styles.topInfoBar}>
                    <View style={styles.topInfoLeft}>
                        <Text style={styles.walkingPetText}>🐶 {selectedPet.name}와 행복한 산책 중</Text>
                        <Text style={styles.walkingTime}>{elapsedTime}</Text>
                    </View>
                    <Image source={selectedPet.image} style={styles.petImage} />
                </View>
            )}
            {/* 🗺️ Google Maps 적용 */}
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={StyleSheet.absoluteFillObject} // ✅ 화면 전체 덮도록 설정
                    provider={PROVIDER_GOOGLE}
                    region={mapRegion ?? {
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

                    {nearbyPlaces.map((place, index) => (
                        <Marker
                            key={`place-${index}`}
                            coordinate={{
                                latitude: place.geometry.location.lat,
                                longitude: place.geometry.location.lng,
                            }}
                            onPress={() => {
                                setSelectedPlace(place); // 클릭 시 모달 표시용 상태 저장
                                setIsPlaceModalVisible(true);
                            }}
                        >
                            <Image
                                source={require('../assets/images/marker/middleIcon.png')}
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

            {/* ✅ 하단 버튼 바 */}
            <View style={styles.bottomBar}>
                {isWalking && (
                    <TouchableOpacity style={styles.cameraButton}>
                        <Icon name="photo-camera" size={24} color="#333" />
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.walkMainButton}
                    onPress={() => {
                        if (isWalking) handleWalkEnd();
                        else { setPetModalVisible(true); }
                    }}
                >
                    <Text style={styles.walkButtonText}>{isWalking ? '산책 종료' : '산책 시작'}</Text>
                </TouchableOpacity>
            </View>

            {/* 🐾 반려동물 선택 모달 */}
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
            {/* ✅ 하단 모달: 펫 루트 선택용 */}
            <PetRouteBottomModal
                isVisible={isBottomSheetVisible}
                onClose={() => setBottomSheetVisible(false)}
                pets={userData.petList.map(pet => ({
                    id: Number(pet.id), // ← 숫자로 변환!
                    name: pet.name,
                    image: pet.image,
                }))}
                onSelectPet={handleSelectPetFromModal}
            />

            <PlaceDetailModal
                isVisible={isPlaceModalVisible}
                place={selectedPlace}
                onClose={() => setIsPlaceModalVisible(false)}
                onAddFavorite={async () => {
                    if (!selectedPlace) { return; }
                    try {
                        await createPlace({
                            name: selectedPlace.name,
                            address: selectedPlace.vicinity,
                            latitude: selectedPlace.geometry.location.lat,
                            longitude: selectedPlace.geometry.location.lng,
                        });
                        Alert.alert('✅ 즐겨찾기에 추가되었습니다!');
                    } catch (e) {
                        Alert.alert('❌ 실패', '즐겨찾기 추가에 실패했습니다.');
                    }
                }}
            />

            {/* ✅ 추가된 버튼: 산책 루트 보기 모달 열기 */}
            <TouchableOpacity
                style={[styles.locationButton, { bottom: 190 }]} // 위치 조정
                onPress={() => setBottomSheetVisible(true)}
            >
                <Icon name="pets" size={22} color="white" />
            </TouchableOpacity>

            {/* ✅ 선택된 펫의 산책 루트를 지도에 표시 */}
            {petRoutes.length > 1 && (
                <Polyline coordinates={petRoutes} strokeColor="#FFDD99" strokeWidth={4} />
            )}
        </View>
    );
};


/** ✅ 스타일 정의 */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    /** 상단 정보 바 (산책 중만 표시됨) */
    topInfoBar: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 20 : 10,
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 99,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    topInfoLeft: { flex: 1 },
    walkingPetText: { fontSize: 14, fontWeight: '600' },
    walkingTime: { fontSize: 24, fontWeight: 'bold' },
    petImage: { width: 40, height: 40, borderRadius: 20, marginLeft: 10 },

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
        bottom: 120,
        right: 20,
        backgroundColor: '#4D7CFE',
        padding: 12,
        borderRadius: 50,
        elevation: 3,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 30,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    cameraButton: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 40,
        marginRight: 12,
    },
    walkMainButton: {
        flex: 1,
        backgroundColor: '#4D7CFE',
        paddingVertical: 16,
        borderRadius: 32,
        alignItems: 'center',
    },
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

