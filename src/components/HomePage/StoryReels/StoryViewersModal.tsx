// 📁 /StoryViewersModal.tsx
import React from 'react';
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

interface Props {
    visible: boolean;
    onClose: () => void;
}

const StoryViewersModal = ({ visible, onClose }: Props) => {
    const { storyViewers } = useStoryReelsStore();

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>조회한 사람</Text>
                    <FlatList
                        data={storyViewers}
                        keyExtractor={(item) => item.viewerId.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.viewerItem}>
                                <Image source={{ uri: item.viewerProfileImageUrl }} style={styles.avatar} />
                                <Text style={styles.nickname}>{item.viewerNickname}</Text>
                            </View>
                        )}
                    />
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={{ color: '#3399ff' }}>닫기</Text>
                    </TouchableOpacity>
                </View>
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
