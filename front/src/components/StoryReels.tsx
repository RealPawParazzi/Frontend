import React, { useState } from 'react';
import { View, Image, FlatList, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import Video from 'react-native-video';

interface Story {
    id: string;
    image: any;
    video?: any;
}

/**
 * 📌 StoryReels 컴포넌트
 * - 스토리 리스트를 수평 스크롤로 표시
 * - 누르면 모달이 뜨면서 전체 화면으로 스토리 표시
 */
const StoryReels = ({ stories }: { stories: Story[] }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);

    const openStory = (story: Story) => {
        setSelectedStory(story);
        setModalVisible(true);
    };

    return (
        <View>
            {/* 🟢 스토리 리스트 */}
            <FlatList
                horizontal
                data={stories}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => openStory(item)} style={styles.storyContainer}>
                        <Image source={item.image} style={styles.storyImage} />
                    </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
            />

            {/* 🟣 스토리 전체 화면 모달 */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <TouchableOpacity style={styles.modalContainer} onPress={() => setModalVisible(false)}>
                    {selectedStory?.video ? (
                        <Video
                            source={selectedStory.video}
                            style={styles.fullScreenMedia}
                            controls
                            resizeMode="contain"
                        />
                    ) : (
                        <Image source={selectedStory?.image} style={styles.fullScreenMedia} />
                    )}
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    storyContainer: { marginHorizontal: 8 },
    storyImage: { width: 60, height: 60, borderRadius: 50 },
    modalContainer: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
    fullScreenMedia: { width: '90%', height: '80%', borderRadius: 10 },
});

export default StoryReels;
