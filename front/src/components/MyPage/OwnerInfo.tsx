import React, { useEffect, useState } from 'react';
import {View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Alert, Modal} from 'react-native';
import userStore from '../../context/userStore';
import boardStore from '../../context/boardStore';
import userFollowStore from '../../context/userFollowStore'; // 현재 로그인 유저의 팔로우 상태 관리
import { useNavigation } from '@react-navigation/native';
import PostList from './PostList';
import Icon from 'react-native-vector-icons/MaterialIcons';
import authStore from '../../context/authStore'; // ✅ 아이콘 추가

// ✅ 기본 프로필 이미지
const DEFAULT_PROFILE_IMAGE = require('../../assets/images/user-2.png');

const OwnerInfo = () => {
    const navigation = useNavigation();
    const { userData } = userStore();
    const { boardList, fetchUserBoards } = boardStore();
    const { logout } = authStore(); // ✅ 로그아웃 함수 가져오기
    const [selectedTab, setSelectedTab] = useState<'posts' | 'photos' | 'videos'>('posts');
    const [menuVisible, setMenuVisible] = useState(false); // ✅ 햄버거 메뉴 모달 상태
    const { following, followers, fetchFollowing, fetchFollowers } = userFollowStore(); // ✅ 현재 로그인 유저의 팔로우 정보


    // ✅ 게시글, 팔로워, 팔로잉 수 상태 관리
    const [postCount, setPostCount] = useState(0);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [memories, setMemories] = useState<string[]>([]);
    const [latestPostTime, setLatestPostTime] = useState('없음');

    // ✅ 게시글 데이터 가져오기
    useEffect(() => {
        fetchUserBoards(Number(userData.id));
    }, [fetchUserBoards, userData.id]);

    // ✅ 게시글 개수 및 최신 게시물 시간 업데이트
    useEffect(() => {
        const userPosts = boardList
            .filter((post) => post.author.id === userData.id)
            .sort((a, b) => new Date(b.writeDatetime).getTime() - new Date(a.writeDatetime).getTime());

        setLatestPostTime(userPosts.length > 0 ? getRelativeTime(userPosts[0].writeDatetime) : '없음');
        setPostCount(userPosts.length || 0);
    }, [boardList, userData.id]);

    // ✅ 팔로잉 & 팔로워 목록 가져오기
    useEffect(() => {
        fetchFollowing(Number(userData.id)); // ✅ 로그인한 유저의 팔로잉 목록 불러오기
        fetchFollowers(Number(userData.id)); // ✅ 로그인한 유저를 팔로우하는 목록 불러오기
    }, [fetchFollowing, fetchFollowers, userData.id]);

    // ✅ 팔로워 및 팔로잉 수 업데이트
    useEffect(() => {
        setFollowerCount(followers.length);
        setFollowingCount(following.length);
    }, [followers, following]);

    useEffect(() => {
        setPostCount(boardList.length || 0);
        // TODO: 유저가 업로드한 메모리 이미지 가져오기 (더미 데이터)
        setMemories([
            'https://via.placeholder.com/80',
            'https://via.placeholder.com/80',
            'https://via.placeholder.com/80',
            'https://via.placeholder.com/80',
        ]);
    }, [boardList]);

    // ✅ 상대적인 시간 계산 함수
    const getRelativeTime = (dateString: string) => {
        const postDate = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - postDate.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) { return '방금 전'; }
        if (diffMinutes < 60) { return `${diffMinutes}분 전`; }
        if (diffHours < 24) { return `${diffHours}시간 전`; }
        return `${diffDays}일 전`;
    };

    const handleLogout = async () => {
        Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            { text: '로그아웃', onPress: async () => {
                    await logout(); // ✅ 로그아웃 처리
                    navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); // ✅ 로그인 화면으로 이동
                }},
        ]);
    };

    return (
        <View style={styles.container}>
            {/* ✅ 상단 프로필 영역 */}
            <View style={styles.profileContainer}>
                {/* ✅ 프로필 이미지 + 사용자 정보 */}
                <View style={styles.profileInfo}>
                    <Image
                        source={userData.profileImage ? { uri: userData.profileImage } : DEFAULT_PROFILE_IMAGE}
                        style={styles.profileImage}
                    />
                    <View style={styles.userInfo}>
                        <Text style={styles.username}>{userData.nickName || userData.name}</Text>
                        <Text style={styles.petCount}>{userData.petCount}마리</Text>
                    </View>
                </View>

                {/* ✅ 점 3개(더보기) 아이콘 버튼 */}
                <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
                    <Icon name="more-vert" size={24} color="#555" />
                </TouchableOpacity>
            </View>

            {/* ✅ 메뉴 모달 */}
            <Modal visible={menuVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity style={styles.modalOption} onPress={() => {
                            setMenuVisible(false);
                            // @ts-ignore
                            navigation.navigate('ProfileEditScreen'); // ✅ 프로필 수정 화면으로 이동
                        }}>
                            <Text style={styles.modalText}>프로필 수정</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalOption} onPress={handleLogout}>
                            <Text style={[styles.modalText, { color: 'red' }]}>로그아웃</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalCancel} onPress={() => setMenuVisible(false)}>
                            <Text style={styles.modalCancelText}>취소</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ✅ 게시글, 팔로워, 팔로잉 */}
            <View style={styles.statsContainer}>
                <TouchableOpacity style={styles.statBox} onPress={() =>
                    //@ts-ignore
                    navigation.navigate('UserPostsScreen', { userId: userData.id, userName: userData.name })}>
                    <Text style={styles.statNumber}>{postCount}</Text>
                    <Text style={styles.statText}>게시물</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statBox} onPress={() =>
                    //@ts-ignore
                    navigation.navigate('FollowListScreen', { type: 'followers', userId: userData.id, userName: userData.name })}>
                    <Text style={styles.statNumber}>{followerCount}</Text>
                    <Text style={styles.statText}>팔로워</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statBox} onPress={() =>
                    //@ts-ignore
                    navigation.navigate('FollowListScreen', { type: 'following', userId: userData.id, userName: userData.name})}>
                    <Text style={styles.statNumber}>{followingCount}</Text>
                    <Text style={styles.statText}>팔로잉</Text>
                </TouchableOpacity>
            </View>

            {/* ✅ 메모리 (스토리 형식) */}
            <Text style={styles.memoryTitle}>Memories</Text>
            <FlatList
                horizontal
                data={memories}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.memoryCircle}>
                        <Image source={{ uri: item }} style={styles.memoryImage} />
                    </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
            />

            {/* ✅ 탭 메뉴 */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'posts' && styles.activeTab]}
                    onPress={() => setSelectedTab('posts')}
                >
                    <Text style={selectedTab === 'posts' ? styles.activeTabText : styles.tabText}>Posts</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'photos' && styles.activeTab]}
                    onPress={() => setSelectedTab('photos')}
                >
                    <Text style={selectedTab === 'photos' ? styles.activeTabText : styles.tabText}>Photos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'videos' && styles.activeTab]}
                    onPress={() => setSelectedTab('videos')}
                >
                    <Text style={selectedTab === 'videos' ? styles.activeTabText : styles.tabText}>Videos</Text>
                </TouchableOpacity>
            </View>

            {/* ✅ 선택된 탭에 따라 다른 컴포넌트 출력 */}
            {selectedTab === 'posts' && <PostList />}
            {selectedTab === 'photos' && (
                <FlatList
                    data={boardList.filter(post => post.titleImage).map(post => post.titleImage)}
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={3} // 🔹 사진을 3열로 출력
                    renderItem={({ item }) => (
                        <View style={styles.photoContainer}>
                            <Image source={{ uri: item }} style={styles.photo} />
                        </View>
                    )}
                />
            )}
            {selectedTab === 'videos' && (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>아직 업로드된 비디오가 없습니다.</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { paddingHorizontal: 15, paddingVertical: 10 },

    /** ✅ 상단 프로필 영역 */
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // ✅ 점 세 개 아이콘을 우측 끝으로 정렬
        marginBottom: 15,
    },

    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#EAEAEA',
    },
    userInfo: {
        marginLeft: 12,
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    petCount: {
        fontSize: 14,
        color: 'gray',
    },

    /** ✅ 점 세 개(더보기) 버튼 */
    menuButton: {
        padding: 8,
    },

    /** ✅ 메뉴 모달 */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#FFF',
        width: 250,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalOption: {
        width: '100%',
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#DDD',
    },
    modalText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    modalCancel: {
        marginTop: 10,
        paddingVertical: 10,
        width: '100%',
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 16,
        color: '#555',
    },

    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 15,
    },
    statBox: {
        alignItems: 'center',
    },
    statText: {
        fontSize: 14,
        color: '#888',
    },
    statNumber: {
        fontSize: 16,
        fontWeight: 'bold',
    },

    memoryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    memoryCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: '#6A4BBC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    memoryImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },

    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 15,
        marginBottom: 10,
    },
    tab: {
        paddingVertical: 8,
        flex: 1,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#6A4BBC',
    },
    activeTabText: {
        color: '#6A4BBC',
        fontWeight: 'bold',
    },
    tabText: {
        color: 'gray',
    },
    photoContainer: {
        flex: 1,
        margin: 2,
        aspectRatio: 1, // 정사각형 유지
    },
    photo: {
        width: '100%',
        height: '100%',
        borderRadius: 5,
    },

    emptyContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    emptyText: {
        color: 'gray',
    },
});

export default OwnerInfo;