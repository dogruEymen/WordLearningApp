import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { wordListApi, transformWordList } from '../services/ApiService';

const WordListDetailScreen = ({ navigation, route }) => {
  const { listId, listName, listColor, words: initialWords } = route.params;
  
  const [words, setWords] = useState(initialWords || []);
  const [expandedWordId, setExpandedWordId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sayfa odaklandığında listeyi yenile
  useFocusEffect(
    useCallback(() => {
      refreshListData();
    }, [listId])
  );

  const refreshListData = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      }

      const lists = await wordListApi.getMyLists();
      const currentList = lists.find(l => l.wordListId?.toString() === listId || l.id === listId);
      
      if (currentList) {
        const transformedList = transformWordList(currentList);
        setWords(transformedList.words || []);
      }
    } catch (error) {
      console.error('Liste yenilenirken hata:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    refreshListData(true);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleDeleteWord = (wordId) => {
    const word = words.find((w) => w.id === wordId);
    
    Alert.alert(
      'Kelimeyi Sil',
      `"${word.english}" kelimesini silmek istediğine emin misin?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            // Şimdilik sadece local olarak sil
            // Backend'de silme endpoint'i eklendiğinde API çağrısı yapılacak
            setWords(words.filter((w) => w.id !== wordId));
            setExpandedWordId(null);
          },
        },
      ]
    );
  };

  const toggleExpand = (wordId) => {
    setExpandedWordId(expandedWordId === wordId ? null : wordId);
  };

  const renderWordCard = (word) => {
    const isExpanded = expandedWordId === word.id;

    return (
      <View key={word.id} style={styles.wordCard}>
        <TouchableOpacity
          style={styles.wordHeader}
          onPress={() => toggleExpand(word.id)}
          activeOpacity={0.8}
        >
          <View style={styles.wordMain}>
            <Text style={styles.wordEnglish}>{word.english}</Text>
            <Text style={styles.wordTurkish}>{word.turkish || word.meaningEn || '-'}</Text>
            {word.partOfSpeech && (
              <Text style={styles.partOfSpeech}>{word.partOfSpeech}</Text>
            )}
          </View>
          <View style={styles.wordActions}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteWord(word.id)}
              activeOpacity={0.7}
            >
              <Feather name="trash-2" size={18} color="#EF4444" />
            </TouchableOpacity>
            <Feather
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#94A3B8"
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.wordExpanded}>
            {word.meaningEn && (
              <View style={styles.meaningContainer}>
                <Text style={styles.meaningLabel}>English Meaning:</Text>
                <Text style={styles.meaningText}>{word.meaningEn}</Text>
              </View>
            )}
            {word.example && (
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleLabel}>Örnek Cümle (EN):</Text>
                <Text style={styles.exampleText}>"{word.example}"</Text>
              </View>
            )}
            {word.exampleTr && (
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleLabel}>Örnek Cümle (TR):</Text>
                <Text style={styles.exampleText}>"{word.exampleTr}"</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2ECC71" />
          <Text style={styles.loadingText}>Kelimeler yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {listName}
          </Text>
          <Text style={styles.headerSubtitle}>{words.length} kelime</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* List Color Indicator */}
      <View style={[styles.colorIndicator, { backgroundColor: listColor }]} />

      {/* Search/Filter Info */}
      <View style={styles.infoBar}>
        <View style={styles.infoItem}>
          <Feather name="info" size={16} color="#64748B" />
          <Text style={styles.infoText}>
            Silmek için çöp kutusu ikonuna tıkla
          </Text>
        </View>
      </View>

      {/* Words List */}
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
        {words.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="text-box-remove-outline"
              size={64}
              color="#CBD5E1"
            />
            <Text style={styles.emptyTitle}>Liste boş</Text>
            <Text style={styles.emptySubtitle}>
              Bu listede henüz kelime bulunmuyor
            </Text>
          </View>
        ) : (
          words.map((word) => renderWordCard(word))
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
  },
  headerSpacer: {
    width: 44,
  },
  colorIndicator: {
    height: 4,
    marginHorizontal: 24,
    borderRadius: 2,
    marginBottom: 16,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
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
  },
  wordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  wordMain: {
    flex: 1,
  },
  wordEnglish: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  wordTurkish: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
  },
  partOfSpeech: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 4,
  },
  wordActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordExpanded: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  meaningContainer: {
    marginBottom: 12,
  },
  meaningLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  meaningText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#1E293B',
    lineHeight: 22,
  },
  exampleContainer: {
    gap: 6,
    marginTop: 8,
  },
  exampleLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exampleText: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#1E293B',
    fontStyle: 'italic',
    lineHeight: 22,
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

export default WordListDetailScreen;
