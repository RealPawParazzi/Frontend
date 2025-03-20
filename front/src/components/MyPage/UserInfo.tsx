import React from 'react';
import { View } from 'react-native';
import PetInfo from './PetInfo';
import OwnerInfo from './OwnerInfo';

// ✅ Props 인터페이스
interface UserInfoProps {
    selectedTab: number;
}

/**
 * 📌 UserInfo 컴포넌트
 * - selectedTab 값이 0일 때 펫 정보를, 1일 때 집사 정보를 표시
 */

const UserInfo = ({ selectedTab }: UserInfoProps) => {
    return (
        <View>
            {selectedTab === 1 ? <OwnerInfo /> : <PetInfo />}
        </View>
    );
};

export default UserInfo;
