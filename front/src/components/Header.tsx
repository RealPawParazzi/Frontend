import React, {useEffect} from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import petStore from '../context/petStore'; // userStore → petStore로 변경

const Header = () => {
    const { pets } = petStore(); // Zustand에서 반려동물 리스트 가져옴


    const DEFAULT_IMAGE = require('../assets/images/pets-1.jpg');

    const getImageSource = () => {
        if (!pets?.length) { return DEFAULT_IMAGE; }

        const petImage = pets[0]?.petImg;
        if (!petImage) { return DEFAULT_IMAGE; }

        if (typeof petImage === 'string') {
            return {
                uri: petImage,
                width: 40,
                height: 40,
                cache: 'force-cache',
            };
        }

        return DEFAULT_IMAGE;
    };

    useEffect(() => {
        if (!pets?.length) {
            console.log('⚠️ 반려동물 없음, 기본 이미지 사용됨');
        } else {
            console.log('✅ Header에서 불러온 펫:', pets[0]);
        }
    }, [pets]);

    return (
        <View style={styles.container}>
            {/* 🖼️ 반려동물 프로필 (왼쪽) */}
            <TouchableOpacity style={styles.petContainer}>
                <Image
                    source={getImageSource()}
                    style={styles.petImage}
                />
                <Text style={styles.petName}>
                    {pets[0]?.name || '반려동물 선택'}
                </Text>
                <Icon
                    name={Platform.OS === 'ios' ? 'keyboard-arrow-down' : 'arrow-drop-down'}
                    size={20}
                    color="black"
                />
            </TouchableOpacity>

            {/* 🔔 알림 아이콘 (오른쪽) */}
            <TouchableOpacity style={styles.notificationIcon}>
                <Icon
                    name={Platform.OS === 'ios' ? 'notifications' : 'notifications-none'}
                    size={28}
                    color="black"
                />
            </TouchableOpacity>
        </View>
    );
};

/**
 * ✅ 스타일 정의
 */
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,

        // 💫 그림자 스타일 추가
        backgroundColor: '#fff', // 그림자 보이게 하려면 필요
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 4, // Android용
        zIndex: 10, // iOS z-index 효과 보정
    },
    petContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    petImage: {
        width: 35,
        height: 35,
        borderRadius: 50,
        marginRight: 8,
    },
    petName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 4,
    },
    notificationIcon: {
        padding: 5,
    },
});

export default Header;