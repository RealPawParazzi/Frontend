// 📁 /StoryViewersModal.tsx
import React, {useState} from 'react';
import {
    Modal,
    View,
    Text,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useStoryReelsStore } from '../../../context/storyReelsStore';
import MiniProfileModal from '../../MiniProfileModal';

interface Props {
    visible: boolean;
    onClose: () => void;
}

const StoryViewersModal = ({ visible, onClose }: Props) => {
    const { storyViewers } = useStoryReelsStore();

  // ✅ 모달 열릴 유저 상태
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    name: string | null;
    nickName: string;
    profileImage: string;
  } | null>(null);

  const [isMiniModalVisible, setMiniModalVisible] = useState(false);

  const handleUserPress = (user: any) => {
    setSelectedUser({
      id: user.viewerId,
      name: null, // 백엔드에 name 정보 없다면 null 처리
      nickName: user.viewerNickname,
      profileImage: user.viewerProfileImageUrl,
    });
    setMiniModalVisible(true);
  };

    // 스토리 조회자 목록이 비어있을 경우
    if (storyViewers.length === 0) {
        return (
            <Modal visible={visible} animationType="slide" transparent>
                <View style={styles.overlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.title}>조회한 사람이 없습니다.</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={{ color: '#3399ff' }}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }


  return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>조회한 사람</Text>
                    <FlatList
                        data={storyViewers}
                        keyExtractor={(item) => item.viewerId.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.viewerItem}
                            onPress={() => handleUserPress(item)} // ✅ 클릭 시 미니모달 열기
                          >
                            <Image
                              source={{ uri: item.viewerProfileImageUrl }}
                              style={styles.avatar}
                            />
                            <Text style={styles.nickname}>{item.viewerNickname}</Text>
                          </TouchableOpacity>
                        )}
                    />
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={{ color: '#3399ff' }}>닫기</Text>
                    </TouchableOpacity>
                </View>

              {/* ✅ 미니 프로필 모달 */}
              {selectedUser && (
                <MiniProfileModal
                  visible={isMiniModalVisible}
                  onClose={() => setMiniModalVisible(false)}
                  user={{
                    id: selectedUser.id,
                    name: selectedUser.name,
                    nickName: selectedUser.nickName,
                    profileImage: selectedUser.profileImage,
                  }}
                />
              )}


            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        maxHeight: '50%',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    viewerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 12,
    },
    nickname: {
        fontSize: 16,
    },
    closeButton: {
        marginTop: 12,
        alignSelf: 'center',
    },
});

export default StoryViewersModal;
