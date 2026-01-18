import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getResources } from '../services/StorageService';

const ReadingModeScreen = ({ navigation }) => {
  const [resources, setResources] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'text' | 'pdf-origin'
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadResources = async () => {
    try {
      const data = await getResources();
      setResources(data);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Ekrana her dönüldüğünde yenile
  useFocusEffect(
    useCallback(() => {
      loadResources();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadResources();
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleResourcePress = (resource) => {
    navigation.navigate('Reader', {
      resourceId: resource.id,
      resourceTitle: resource.title,
      resourceType: 'text', // Artık her şey text olarak kaydediliyor
      resourceContent: resource.content || null,
      resourceMetadata: resource.metadata || null,
    });
  };

  const handleAddResource = () => {
    navigation.navigate('UploadResource');
  };

  const getFilteredResources = () => {
    if (filter === 'all') return resources;
    if (filter === 'pdf-origin') {
      // PDF'den dönüştürülmüş metinler
      return resources.filter((r) => r.metadata?.originalType === 'pdf');
    }
    if (filter === 'text') {
      // Direkt yapıştırılan metinler
      return resources.filter((r) => r.type === 'text' && !r.metadata?.originalType);
    }
    return resources;
  };

  const getResourceIcon = (resource) => {
    // PDF'den dönüştürülmüş ise PDF ikonu göster
    if (resource.metadata?.originalType === 'pdf') {
      return 'file-pdf-box';
    }
    return 'text-box-outline';
  };

  const getResourceColor = (resource) => {
    // PDF'den dönüştürülmüş ise kırmızı, değilse mor
    if (resource.metadata?.originalType === 'pdf') {
      return '#EF4444';
    }
    return '#6366F1';
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return '#10B981';
    if (progress > 0) return '#F59E0B';
    return '#E2E8F0';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    return `${Math.floor(diffDays / 30)} ay önce`;
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
        <Text style={styles.headerTitle}>Okuma Modu</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddResource}
          activeOpacity={0.7}
        >
          <Feather name="plus" size={22} color="#2ECC71" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Tümü ({resources.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'pdf-origin' && styles.filterTabActive]}
          onPress={() => setFilter('pdf-origin')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="file-pdf-box"
            size={18}
            color={filter === 'pdf-origin' ? '#FFFFFF' : '#64748B'}
          />
          <Text style={[styles.filterText, filter === 'pdf-origin' && styles.filterTextActive]}>
            PDF
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'text' && styles.filterTabActive]}
          onPress={() => setFilter('text')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="text-box-outline"
            size={18}
            color={filter === 'text' ? '#FFFFFF' : '#64748B'}
          />
          <Text style={[styles.filterText, filter === 'text' && styles.filterTextActive]}>
            Metin
          </Text>
        </TouchableOpacity>
      </View>

      {/* Resources List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2ECC71']}
            tintColor="#2ECC71"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        ) : getFilteredResources().length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={64}
              color="#CBD5E1"
            />
            <Text style={styles.emptyTitle}>Henüz kaynak yok</Text>
            <Text style={styles.emptySubtitle}>
              Okumak için PDF veya metin ekle
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleAddResource}
              activeOpacity={0.85}
            >
              <Feather name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Kaynak Ekle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          getFilteredResources().map((resource) => (
            <TouchableOpacity
              key={resource.id}
              style={styles.resourceCard}
              onPress={() => handleResourcePress(resource)}
              activeOpacity={0.9}
            >
              <View
                style={[
                  styles.resourceIcon,
                  { backgroundColor: `${getResourceColor(resource)}15` },
                ]}
              >
                <MaterialCommunityIcons
                  name={getResourceIcon(resource)}
                  size={32}
                  color={getResourceColor(resource)}
                />
              </View>

              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle} numberOfLines={2}>
                  {resource.title}
                </Text>
                <View style={styles.resourceMeta}>
                  {resource.wordCount > 0 && (
                    <>
                      <Text style={styles.resourceMetaText}>
                        {resource.wordCount} kelime
                      </Text>
                      <View style={styles.metaDot} />
                    </>
                  )}
                  <Text style={styles.resourceMetaText}>
                    {formatDate(resource.addedDate)}
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${resource.readProgress || 0}%`,
                          backgroundColor: getProgressColor(resource.readProgress || 0),
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.progressText,
                      { color: getProgressColor(resource.readProgress || 0) },
                    ]}
                  >
                    {resource.readProgress === 100
                      ? 'Tamamlandı'
                      : resource.readProgress > 0
                      ? `%${resource.readProgress}`
                      : 'Yeni'}
                  </Text>
                </View>
              </View>

              <Feather name="chevron-right" size={24} color="#94A3B8" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: '#2ECC71',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
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
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ECC71',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  resourceIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  resourceTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1E293B',
    marginBottom: 4,
    lineHeight: 22,
  },
  resourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resourceMetaText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#94A3B8',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    minWidth: 60,
    textAlign: 'right',
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

export default ReadingModeScreen;
