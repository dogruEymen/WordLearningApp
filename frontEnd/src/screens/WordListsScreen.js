import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { wordListApi, transformWordList } from '../services/ApiService';

const WordListsScreen = ({ navigation }) => {
  const [wordLists, setWordLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Yeni liste modal state
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Sayfa her odaklandığında listeleri yenile
  useFocusEffect(
    useCallback(() => {
      fetchWordLists();
    }, [])
  );

  const fetchWordLists = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const lists = await wordListApi.getMyLists();
      
      // Backend response'ı frontend formatına dönüştür
      const transformedLists = (lists || []).map(transformWordList);
      setWordLists(transformedLists);
    } catch (err) {
      console.error('Kelime listeleri yüklenirken hata:', err);
      setError(err.message || 'Listeler yüklenemedi');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchWordLists(true);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleListPress = (list) => {
    navigation.navigate('WordListDetail', {
      listId: list.id,
      listName: list.name,
      listColor: list.color,
      words: list.words || [],
    });
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      Alert.alert('Hata', 'Lütfen liste adı girin');
      return;
    }

    setIsCreating(true);
    
    try {
      await wordListApi.createList(newListName.trim());
      setNewListName('');
      setIsCreateModalVisible(false);
      // Listeleri yenile
      fetchWordLists();
      Alert.alert('Başarılı', 'Yeni liste oluşturuldu');
    } catch (err) {
      Alert.alert('Hata', err.message || 'Liste oluşturulamadı');
    } finally {
      setIsCreating(false);
    }
  };

  const getTotalWords = () => {
    return wordLists.reduce((sum, list) => sum + (list.wordCount || 0), 0);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2ECC71" />
          <Text style={styles.loadingText}>Listeler yükleniyor...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={64}
            color="#EF4444"
          />
          <Text style={styles.errorTitle}>Bir hata oluştu</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchWordLists()}
            activeOpacity={0.8}
          >
            <Feather name="refresh-cw" size={18} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (wordLists.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={64}
            color="#CBD5E1"
          />
          <Text style={styles.emptyTitle}>Henüz liste yok</Text>
          <Text style={styles.emptySubtitle}>
            Yeni bir kelime listesi oluşturarak başlayabilirsin
          </Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => setIsCreateModalVisible(true)}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={20} color="#FFFFFF" />
            <Text style={styles.createFirstButtonText}>İlk Listeyi Oluştur</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#2ECC71']}
            tintColor="#2ECC71"
          />
        }
      >
        {wordLists.map((list) => (
          <TouchableOpacity
            key={list.id}
            style={styles.listCard}
            onPress={() => handleListPress(list)}
            activeOpacity={0.9}
          >
            <View
              style={[
                styles.listIconContainer,
                { backgroundColor: `${list.color}15` },
              ]}
            >
              <MaterialCommunityIcons
                name="format-list-bulleted"
                size={28}
                color={list.color}
              />
            </View>
            <View style={styles.listInfo}>
              <Text style={styles.listName}>{list.name}</Text>
              <View style={styles.listMeta}>
                <Text style={styles.listWordCount}>
                  {list.wordCount} kelime
                </Text>
                {list.lastUpdated && (
                  <>
                    <View style={styles.metaDot} />
                    <Text style={styles.listUpdated}>{list.lastUpdated}</Text>
                  </>
                )}
              </View>
            </View>
            <Feather name="chevron-right" size={24} color="#94A3B8" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color="#475569" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kelime Listelerim</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsCreateModalVisible(true)}
          activeOpacity={0.7}
        >
          <Feather name="plus" size={22} color="#2ECC71" />
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      {wordLists.length > 0 && (
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{wordLists.length}</Text>
            <Text style={styles.statLabel}>Liste</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{getTotalWords()}</Text>
            <Text style={styles.statLabel}>Kelime</Text>
          </View>
        </View>
      )}

      {/* Content */}
      {renderContent()}

      {/* Create List Modal */}
      <Modal
        visible={isCreateModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Liste Oluştur</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setIsCreateModalVisible(false);
                  setNewListName('');
                }}
                activeOpacity={0.7}
              >
                <Feather name="x" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Liste adı girin"
              placeholderTextColor="#94A3B8"
              value={newListName}
              onChangeText={setNewListName}
              autoFocus={true}
            />

            <TouchableOpacity
              style={[
                styles.modalCreateButton,
                (!newListName.trim() || isCreating) && styles.modalCreateButtonDisabled,
              ]}
              onPress={handleCreateList}
              disabled={!newListName.trim() || isCreating}
              activeOpacity={0.85}
            >
              {isCreating ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Feather name="plus" size={20} color="#FFFFFF" />
                  <Text style={styles.modalCreateButtonText}>Oluştur</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}
        >
          <Ionicons name="home-outline" size={26} color="#94A3B8" />
          <Text style={styles.navText}>Ana Sayfa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Ionicons name="person-outline" size={26} color="#94A3B8" />
          <Text style={styles.navText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#2ECC71',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2ECC71',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2ECC71',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  createFirstButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  listIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listInfo: {
    flex: 1,
    marginLeft: 16,
  },
  listName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listWordCount: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  listUpdated: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#94A3B8',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInput: {
    width: '100%',
    height: 56,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#1E293B',
    marginBottom: 20,
  },
  modalCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2ECC71',
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalCreateButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowColor: '#94A3B8',
  },
  modalCreateButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 48,
    paddingBottom: 24,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 10,
    fontFamily: 'Poppins_500Medium',
    color: '#94A3B8',
  },
});

export default WordListsScreen;
