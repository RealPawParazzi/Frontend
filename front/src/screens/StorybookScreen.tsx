import React, { useState } from 'react';
import { Text, TextInput, Button, ScrollView } from 'react-native';

const StorybookScreen = () => {
    const [story, setStory] = useState('');

    return (
        <ScrollView style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>📖 반려동물 스토리북</Text>
            <TextInput
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 10, borderRadius: 5 }}
                placeholder="반려동물의 하루를 기록하세요!"
                multiline
                value={story}
                onChangeText={setStory}
            />
            <Button title="저장하기" onPress={() => alert('스토리 저장 완료!')} />
        </ScrollView>
    );
};

export default StorybookScreen;
