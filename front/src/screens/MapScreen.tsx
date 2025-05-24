// 🐾 MapScreen.tsx - 반려동물 산책 기능 포함 메인 지도 화면
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
} from 'react-native';
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import {launchCamera} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {requestLocationPermission} from '../utils/permissions/locationPermission';
import walkStore from '../context/walkStore';
import userStore from '../context/userStore';

import WalkStatsBar from '../components/Map/WalkStatsBar';
import WalkPathPolyline from '../components/Map/WalkPathPolyline';
import PetSelectorModal from '../components/Map/PetSelectorModal';
import PetRouteBottomModal from '../components/Map/PetRouteBottomModal';
import PlaceDetailModal from '../components/Map/PlaceDetailModal';

import {searchPetFriendlyPlaces} from '../services/placeSearchService';
import placeStore, {Place} from '../context/placeStore';
import FavoritesModal from '../components/Map/FavoritesModal'; // 🔹 즐겨찾기 장소 스토어 추가



// NodeJS 타입 오류 방지를 위한 글로벌 선언
declare global {
  namespace NodeJS {
    interface Timeout {}
  }
}

const MapScreen = () => {
  const {userData} = userStore();
  const {saveWalk, fetchWalk, walks, fetchPetWalksByDate, fetchWalksByPet} =
    walkStore(); // fetchPetWalksByDate 추가

  // 🐶 선택된 반려동물
  const [selectedPet, setSelectedPet] = useState(userData.petList[0]);
  // 🟢 산책 중 여부
  const [isWalking, setIsWalking] = useState(false);
  // 🧭 위치 기록 배열
  const [walkRoute, setWalkRoute] = useState<
    {latitude: number; longitude: number; timestamp: string}[]
  >([]);
  // 🕰️ 산책 시작 시간
  const [startTime, setStartTime] = useState<string | null>(null);
  // 📏 총 이동 거리 (km)
  const [totalDistance, setTotalDistance] = useState(0);
  // 🚀 평균 속도 (km/h)
  const [averageSpeed, setAverageSpeed] = useState(0);
  // 🆔 현재 산책 기록 ID
  const [currentWalkId, setCurrentWalkId] = useState<number | null>(null);
  // 📍 현재 위치 좌표
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
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

  // 🔽 검색 트리거 상태 추가
  const [shouldSearchPlaces, setShouldSearchPlaces] = useState(false);

  // 근처 검색 장소 배열
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);

  const [isPlaceModalVisible, setIsPlaceModalVisible] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  const { places, fetchPlaces, addPlace } = placeStore(); // 추가된 부분

  const [isFavoritesModalVisible, setIsFavoritesModalVisible] = useState(false);

  const [selectedFavoritePlace, setSelectedFavoritePlace] = useState<Place | null>(null); // 즐겨찾기 모달에서 선택한 장소

  /** ✅ 즐겨찾기 모달에서 장소 클릭 시 지도 이동 및 모달 열기 */
  const handleSelectFavoritePlace = (place: Place) => {
    const transformedPlace = {
      name: place.name,
      vicinity: place.address,
      geometry: {
        location: {
          lat: place.latitude,
          lng: place.longitude,
        },
      },
    };

    setSelectedPlace(transformedPlace);
    setIsPlaceModalVisible(true);

    // 지도 이동
    mapRef.current?.animateToRegion(
      {
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000,
    );
  };

  // ✅ 위치 권한 요청 및 확인 함수
  const checkLocationPermission = async (): Promise<boolean> => {
    const granted = await requestLocationPermission();
    console.log(granted ? '✅ 위치 권한 허용됨' : '❌ 위치 권한 거부됨');
    if (!granted) {
      Alert.alert(
        '위치 권한 필요',
        '산책을 기록하려면 위치 권한을 허용해주세요.',
      );
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
      position => {
        const {latitude, longitude} = position.coords;
        setCurrentLocation({latitude, longitude});
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        console.log('위치 가져오기 성공:', latitude, longitude);

        // ✅ 현재 위치를 지도 중심으로 이동
        mapRef.current?.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000,
        );
      },
      error => {
        console.error('❌ 위치 가져오기 실패:', error);

        let errorMessage = '위치 정보를 가져올 수 없습니다.';
        if (error.code === 1) {
          errorMessage =
            '위치 서비스가 비활성화되어 있습니다. 설정에서 활성화해주세요.';
        } else if (error.code === 2) {
          errorMessage = 'GPS 신호를 찾을 수 없습니다.';
        } else if (error.code === 3) {
          errorMessage = '위치 요청 시간이 초과되었습니다.';
        }

        Alert.alert('위치 오류', errorMessage);
      },
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 5000},
    );
  };

  // ✅ 컴포넌트 마운트 시 현재 위치 받아오기
  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    fetchPlaces(); // 즐겨찾기 장소 가져오기
  }, [fetchPlaces]);

  // ✅ 위치 변경 & 검색 트리거 시 근처 장소 검색
  useEffect(() => {
    if (currentLocation && shouldSearchPlaces) {
      const {latitude, longitude} = currentLocation;
      searchPetFriendlyPlaces(latitude, longitude).then(places => {
        console.log('🐾 nearbyPlaces 검색 결과:', places);
        setNearbyPlaces(places ?? []);
        setShouldSearchPlaces(false); // 🔁 검색 후 초기화
      });
    }
  }, [shouldSearchPlaces, currentLocation]);

  // ✅ 타이머 시작 (산책 시작 시)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>; // ✅ 이게 핵심!

    if (isWalking && startTime) {
      timer = setInterval(() => {
        // 🔽 문자열을 Date 객체로 변환 (KST 기준으로 해석하지 않도록 UTC 보정)
        const parsedStartTime = new Date(startTime);
        const localStartTime = new Date(
          parsedStartTime.getTime() + 9 * 60 * 60 * 1000,
        ); // UTC+9 보정

        const now = new Date();
        const diff = now.getTime() - localStartTime.getTime();

        const hours = String(Math.floor(diff / 3600000)).padStart(2, '0');
        const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(
          2,
          '0',
        );
        const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(
          2,
          '0',
        );
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
        Alert.alert(
          '❌ 위치 권한 거부됨',
          '산책을 기록하려면 위치 권한이 필요합니다.',
        );
        setIsWalking(false);
        return;
      }

      // ✅ startTime이 아직 설정되지 않았다면, 한 번만 설정
      setStartTime(prev =>
        prev ? prev : new Date().toISOString().replace('Z', '').split('.')[0],
      );

      watchId = Geolocation.watchPosition(
        position => {
          const {latitude, longitude} = position.coords;

          // ✅ 현재 위치 상태 업데이트
          setCurrentLocation({latitude, longitude});
          setMapRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });

          // ✅ 현재 위치에 따라 지도 이동 (산책 중만 이동)
          if (isWalking) {
            mapRef.current?.animateToRegion(
              {
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              },
              500,
            );
          }

          /** ✅ 위치 중복 저장 방지 */
          if (
            walkRoute.length === 0 ||
            (latitude !== walkRoute[walkRoute.length - 1].latitude &&
              longitude !== walkRoute[walkRoute.length - 1].longitude)
          ) {
            setWalkRoute(prevRoute => [
              ...prevRoute,
              {
                latitude,
                longitude,
                timestamp: new Date()
                  .toISOString()
                  .replace('Z', '')
                  .split('.')[0],
              },
            ]);
          }
        },
        error => console.error('❌ 위치 추적 오류:', error),
        {enableHighAccuracy: true, distanceFilter: 5, interval: 5000}, // 🔹 5m 이동 시마다 업데이트
      );
    };

    /** 산책 시작 시 위치 추적 실행 */
    if (isWalking) {
      /** ✅ 산책 시작 */
      console.log('🚶‍♂️ [산책 시작] 버튼 클릭됨');
      startTracking();
    } else {
      if (watchId) {
        Geolocation.clearWatch(watchId);
      }
    }

    return () => {
      if (watchId) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [isWalking, walkRoute]);

  // ✅ 거리 계산 및 평균 속도 계산
  useEffect(() => {
    if (walkRoute.length > 1 && startTime) {
      const distance = calculateDistance(walkRoute);
      setTotalDistance(distance);
      const duration =
        (new Date().getTime() - new Date(startTime || '').getTime()) /
        (1000 * 60 * 60);
      setAverageSpeed(
        duration > 0 ? parseFloat((distance / duration).toFixed(2)) : 0,
      );
    }
  }, [startTime, walkRoute]);

  // ✅ 산책 거리 계산 함수 (간단한 유클리드 방식)
  const calculateDistance = (route: string | any[]) => {
    let distance = 0;
    for (let i = 1; i < route.length; i++) {
      const prev = route[i - 1];
      const curr = route[i];
      distance +=
        Math.sqrt(
          Math.pow(curr.latitude - prev.latitude, 2) +
            Math.pow(curr.longitude - prev.longitude, 2),
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
      console.log(
        `📍 [산책 경로] 총 ${walkRoute.length}개의 위치 데이터 기록됨`,
      );

      // saveWalk이 walkId를 반환하도록 변경
      const savedWalkId = await saveWalk(
        Number(selectedPet.id),
        walkRoute,
        startTime, // ✅ 변환된 시간 사용
        endTime,
      );

      if (savedWalkId) {
        setCurrentWalkId(savedWalkId); // walkId 저장
        fetchWalk(savedWalkId); // 최신 데이터 반영
        Alert.alert('✅ 산책 기록이 저장되었습니다! 📍');
        console.log(`✅ [산책 기록 저장 성공] walkId: ${savedWalkId}`);
        // 콘솔 로그로 페이로드 확인
        console.log(
          '📤 [산책 저장 요청 데이터]:',
          JSON.stringify(
            {
              petId: Number(selectedPet.id),
              route: walkRoute,
              startTime,
              endTime,
              distance: totalDistance,
              averageSpeed: averageSpeed,
            },
            null,
            2,
          ),
        );
      } else {
        Alert.alert('❌ 산책 기록 저장 실패', '다시 시도해주세요.');
      }

      setWalkRoute([]);
      setStartTime(null);
      setElapsedTime('00:00:00'); // 🔄 이거도 추가해줘
      setTotalDistance(0); // 🔄 거리 초기화
      setAverageSpeed(0); // 🔄 속도 초기화
    }
  };

  const startWalking = () => {
    setPetRoutes([]);
    setWalkRoute([]);
    setStartTime(null);
  };

  const isPlaceInFavorites = (place: any): boolean => {
    return places.some(
      fav =>
        fav.name === place.name &&
        fav.address === place.vicinity
    );
  };

  const toggleFavorite = async () => {
    if (!selectedPlace) return;

    const isFav = isPlaceInFavorites(selectedPlace);

    if (isFav) {
      // 삭제
      const placeToRemove = places.find(
        p =>
          p.name === selectedPlace.name &&
          p.address === selectedPlace.vicinity
      );
      if (placeToRemove) {
        await placeStore.getState().removePlace(placeToRemove.id);
      }
    } else {
      // 추가
      await addPlace({
        name: selectedPlace.name,
        address: selectedPlace.vicinity,
        latitude: selectedPlace.geometry.location.lat,
        longitude: selectedPlace.geometry.location.lng,
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* ✅ 산책 중 상단 정보 바 */}
      {isWalking && (
        <WalkStatsBar pet={selectedPet} elapsedTime={elapsedTime} />
      )}
      {/* 🗺️ Google Maps 적용 */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject} // ✅ 화면 전체 덮도록 설정
          provider={PROVIDER_GOOGLE}
          region={
            mapRegion ?? {
              latitude: 37.5665,
              longitude: 126.978,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }
          }>
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
          <WalkPathPolyline route={walkRoute} />

          {/* ✅ 과거 산책 경로 */}
          {!isWalking && petRoutes.length > 1 && (
            <>
              <Polyline
                coordinates={petRoutes}
                strokeColor="#FFDD99"
                strokeWidth={4}
              />

              {/* 시작점 마커 */}
              <Marker coordinate={petRoutes[0]}>
                <Image
                  source={require('../assets/images/marker/startIcon.png')}
                  style={styles.markerIcon}
                />
              </Marker>

              {/* 종료점 마커 */}
              <Marker coordinate={petRoutes[petRoutes.length - 1]}>
                <Image
                  source={require('../assets/images/marker/endIcon.png')}
                  style={styles.markerIcon}
                />
              </Marker>
            </>
          )}

          {/* ✅ 근처 장소 마커, 즐겨찾는 장소는 노란 카머 표시 */}
          {nearbyPlaces.map((place, index) => {
            const isFavorite = places.some(fav =>
              fav.name === place.name && fav.address === place.vicinity
            ); // ✅ 이름 + 주소로 즐겨찾기 여부 확인

            return (
              <Marker
                key={`place-${index}`}
                coordinate={{
                  latitude: place.geometry.location.lat,
                  longitude: place.geometry.location.lng,
                }}
                onPress={() => {
                  setSelectedPlace(place);
                  setIsPlaceModalVisible(true);
                }}>
                {isFavorite ? (
                  // 즐겨찾기 마커 (노란색 + 별 아이콘)
                  <View style={styles.favoriteMarker}>
                    <Text style={styles.starText}>⭐</Text>
                  </View>
                ) : (
                  // ✅ 아래처럼 변경
                  <View style={styles.pawMarker}>
                    <Text style={styles.pawText}>🐾</Text>
                  </View>
                )}
              </Marker>
            );
          })}
        </MapView>
      </View>

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
            else {
              setPetModalVisible(true);
            }
          }}>
          <Text style={styles.walkButtonText}>
            {isWalking ? '산책 종료' : '산책 시작'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🐾 반려동물 선택 모달 */}
      <PetSelectorModal
        isVisible={isPetModalVisible} // ✅ 이름 수정
        selectedPetId={selectedPet.id}
        pets={userData.petList}
        keepThisPet={keepThisPet}
        onSelectPet={id => {
          const pet = userData.petList.find(p => p.id === id);
          if (pet) {
            setSelectedPet(pet);
          } else {
            console.error('❌ 선택한 Pet을 찾을 수 없습니다:', id);
            Alert.alert('에러', '선택한 반려동물을 찾을 수 없습니다.');
          }
        }}
        onToggleKeep={() => setKeepThisPet(!keepThisPet)}
        onConfirm={() => {
          setPetModalVisible(false);
          setIsWalking(true);
          startWalking();
        }}
        onClose={() => setPetModalVisible(false)}
      />
      {/* ✅ 하단 모달: 펫 루트 선택용 */}
      <PetRouteBottomModal
        isVisible={isBottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        pets={userData.petList.map(pet => ({
          id: Number(pet.id),
          name: pet.name,
          image: pet.image,
        }))}
        getWalksByPetId={async petId => {
          await fetchWalksByPet(petId); // 상태 업데이트
          return walkStore.getState().petWalks[petId] ?? []; // Zustand 상태에서 바로 반환
        }}
        onSelectWalk={async walkId => {
          await fetchWalk(walkId); // 단일 산책 기록 가져오기
          const walk = walkStore.getState().walks[walkId];
          if (walk?.route?.length > 0) {
            setPetRoutes(walk.route);

            // ✅ 지도 이동
            mapRef.current?.animateToRegion(
              {
                latitude: walk.route[0].latitude,
                longitude: walk.route[0].longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              },
              1000,
            );
          } else {
            setPetRoutes([]);
            Alert.alert(
              '🚫 산책 경로 없음',
              '선택한 산책 기록에 경로 데이터가 없습니다.',
            );
          }

          // 모달 닫기
          setBottomSheetVisible(false);
        }}
      />

      <PlaceDetailModal
        isVisible={isPlaceModalVisible}
        place={selectedPlace}
        onClose={() => setIsPlaceModalVisible(false)}
        isFavorite={selectedPlace ? isPlaceInFavorites(selectedPlace) : false}
        onToggleFavorite={toggleFavorite}
      />
      <FavoritesModal
        isVisible={isFavoritesModalVisible}
        onClose={() => setIsFavoritesModalVisible(false)}
        places={places}
        onSelectPlace={(place) => {
        handleSelectFavoritePlace(place);
        setIsFavoritesModalVisible(false);
      }}
        />

      <View style={styles.rightButtonGroup}>
        <TouchableOpacity onPress={() => setIsFavoritesModalVisible(true)}>
          <View style={styles.iconButton}>
            <Icon name="star" size={22} color="white" />
          </View>
        </TouchableOpacity>


        <TouchableOpacity onPress={() => setShouldSearchPlaces(true)}>
          <View style={styles.iconButton}>
            <Icon name="search" size={22} color="white" />
          </View>
        </TouchableOpacity>


        <TouchableOpacity onPress={() => setBottomSheetVisible(true)}>
          <View style={styles.iconButton}>
            <Icon name="pets" size={22} color="white" />
          </View>
        </TouchableOpacity>

        {/* 📍 현재 위치 버튼 */}
        <TouchableOpacity onPress={getCurrentLocation}>
          <View style={styles.iconButton}>
            <Icon name="my-location" size={22} color="white" />
          </View>
        </TouchableOpacity>
      </View>

    </View>
  );
};

/** ✅ 스타일 정의 */
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#ffffff'},
  mapContainer: {flex: 1.5, overflow: 'hidden'},

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
  walkButtonText: {color: 'white', fontSize: 18, fontWeight: 'bold'},

  markerIcon: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
    borderRadius: 50,
  },

  rightButtonGroup: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    alignItems: 'center',
    gap: 5,
  },
  iconButton: {
    backgroundColor: '#4D7CFE',
    padding: 12,
    borderRadius: 50,
    marginBottom: 10,
    elevation: 3,
  },

  favoriteMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#fff',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },

  starText: {
    fontSize: 20,
  },

  pawMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8888ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#fff',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 4,
  },
  pawText: {
    fontSize: 18,
  },
});

export default MapScreen;
