import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  StatusBar,
  SafeAreaView,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { saveResource } from '../services/StorageService';
import { pdfApi } from '../services/ApiService';

const UploadResourceScreen = ({ navigation }) => {
  const [selectedOption, setSelectedOption] = useState(null); // 'pdf' | 'text'
  const [textInput, setTextInput] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleBackPress = () => {
    if (selectedOption) {
      setSelectedOption(null);
      setTextInput('');
      setTextTitle('');
      setSelectedFile(null);
    } else {
      navigation.goBack();
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handlePdfUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      setSelectedFile(file);

      // Dosya bilgilerini göster
      Alert.alert(
        'PDF Seçildi',
        `Dosya: ${file.name}\nBoyut: ${(file.size / 1024).toFixed(2)} KB`,
        [
          { text: 'İptal', style: 'cancel', onPress: () => setSelectedFile(null) },
          { text: 'Yükle', onPress: () => savePdfFile(file) },
        ]
      );
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Hata', 'Dosya seçilirken bir hata oluştu.');
    }
  };

  const savePdfFile = async (file) => {
    setIsUploading(true);

    try {
      // 1. PDF'i Python servisine gönder ve plain text al
      console.log('PDF Python servisine gönderiliyor...');
      const extractionResult = await pdfApi.extractTextFromPdf(file.uri);
      
      if (!extractionResult.success || !extractionResult.text) {
        throw new Error('PDF\'den metin çıkarılamadı');
      }

      console.log(`PDF işlendi: ${extractionResult.page_count} sayfa, ${extractionResult.text.length} karakter`);

      // 2. Kelime sayısını hesapla
      const wordCount = extractionResult.text.trim().split(/\s+/).length;

      // 3. Plain text olarak kaydet (PDF dosyasını kaydetmiyoruz)
      const resource = await saveResource({
        title: file.name.replace('.pdf', ''),
        type: 'text', // PDF'den çıkarılan metin olarak kaydediyoruz
        content: extractionResult.text, // Plain text içerik
        wordCount: wordCount,
        metadata: {
          originalType: 'pdf',
          originalFileName: file.name,
          pageCount: extractionResult.page_count,
          extractionMethod: extractionResult.method,
          originalSize: file.size,
        },
      });

      setIsUploading(false);
      setUploadSuccess(true);

      // Başarılı yüklemeden sonra ReaderScreen'e yönlendir
      setTimeout(() => {
        setUploadSuccess(false);
        setSelectedFile(null);
        
        // ReaderScreen'e yönlendir - plain text ile
        navigation.navigate('Reader', {
          resourceId: resource.id,
          resourceTitle: resource.title,
          resourceType: 'text',
          resourceContent: extractionResult.text,
          resourceMetadata: resource.metadata,
        });
      }, 1500);
    } catch (error) {
      console.error('Error saving PDF:', error);
      setIsUploading(false);
      Alert.alert(
        'Hata', 
        error.message || 'PDF işlenirken bir hata oluştu. Python servisinin çalıştığından emin olun.'
      );
      setSelectedFile(null);
    }
  };

  const handleTextSubmit = async () => {
    if (!textTitle.trim()) {
      Alert.alert('Hata', 'Lütfen metin için bir başlık girin.');
      return;
    }

    if (!textInput.trim()) {
      Alert.alert('Hata', 'Lütfen bir metin girin.');
      return;
    }

    if (textInput.trim().length < 50) {
      Alert.alert('Hata', 'Metin en az 50 karakter olmalıdır.');
      return;
    }

    setIsUploading(true);

    try {
      // Kelime sayısını hesapla
      const wordCount = textInput.trim().split(/\s+/).length;

      // Resource olarak kaydet
      const resource = await saveResource({
        title: textTitle.trim(),
        type: 'text',
        content: textInput.trim(),
        wordCount: wordCount,
      });

      setIsUploading(false);
      setUploadSuccess(true);

      setTimeout(() => {
        setUploadSuccess(false);
        setTextInput('');
        setTextTitle('');
        navigation.goBack();
      }, 2000);
    } catch (error) {
      console.error('Error saving text:', error);
      setIsUploading(false);
      Alert.alert('Hata', 'Metin kaydedilirken bir hata oluştu.');
    }
  };

  const renderOptionSelection = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Kaynak Yükle</Text>
      <Text style={styles.subtitle}>
        Okuma modu için bir kaynak ekle
      </Text>

      {/* PDF Option */}
      <TouchableOpacity
        style={styles.optionCard}
        onPress={() => handleOptionSelect('pdf')}
        activeOpacity={0.9}
      >
        <View style={[styles.optionIconContainer, { backgroundColor: '#FEF2F2' }]}>
          <MaterialCommunityIcons name="file-pdf-box" size={48} color="#EF4444" />
        </View>
        <Text style={styles.optionTitle}>PDF Yükle</Text>
        <Text style={styles.optionSubtitle}>
          Cihazından bir PDF dosyası seç
        </Text>
        <View style={styles.optionArrow}>
          <Feather name="upload" size={20} color="#64748B" />
        </View>
      </TouchableOpacity>

      {/* Text Option */}
      <TouchableOpacity
        style={styles.optionCard}
        onPress={() => handleOptionSelect('text')}
        activeOpacity={0.9}
      >
        <View style={[styles.optionIconContainer, { backgroundColor: '#EEF2FF' }]}>
          <MaterialCommunityIcons name="text-box-outline" size={48} color="#6366F1" />
        </View>
        <Text style={styles.optionTitle}>Metin Yapıştır</Text>
        <Text style={styles.optionSubtitle}>
          Kopyaladığın bir metni yapıştır
        </Text>
        <View style={styles.optionArrow}>
          <Feather name="clipboard" size={20} color="#64748B" />
        </View>
      </TouchableOpacity>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Feather name="info" size={18} color="#64748B" />
        <Text style={styles.infoText}>
          Yüklediğin kaynaklar "Okuma Modu" bölümünde görüntülenecek ve kelime öğrenmek için kullanılabilecek.
        </Text>
      </View>
    </ScrollView>
  );

  const renderPdfUpload = () => (
    <View style={styles.uploadContainer}>
      <View style={styles.uploadArea}>
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={handlePdfUpload}
          activeOpacity={0.9}
        >
          <View style={styles.uploadIconContainer}>
            <MaterialCommunityIcons name="file-pdf-box" size={64} color="#EF4444" />
          </View>
          <Text style={styles.uploadTitle}>PDF Dosyası Seç</Text>
          <Text style={styles.uploadSubtitle}>
            Dosya seçmek için dokun
          </Text>
          <View style={styles.uploadButton}>
            <Feather name="upload" size={20} color="#FFFFFF" />
            <Text style={styles.uploadButtonText}>Dosya Seç</Text>
          </View>
        </TouchableOpacity>

        {/* Selected File Info */}
        {selectedFile && (
          <View style={styles.selectedFileInfo}>
            <MaterialCommunityIcons name="file-pdf-box" size={24} color="#EF4444" />
            <View style={styles.selectedFileDetails}>
              <Text style={styles.selectedFileName} numberOfLines={1}>
                {selectedFile.name}
              </Text>
              <Text style={styles.selectedFileSize}>
                {(selectedFile.size / 1024).toFixed(2)} KB
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedFile(null)}>
              <Feather name="x" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        )}

        {/* Supported Formats */}
        <View style={styles.formatInfo}>
          <Text style={styles.formatTitle}>Desteklenen Format</Text>
          <View style={styles.formatBadge}>
            <Text style={styles.formatText}>.PDF</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTextInput = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.textInputContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Title Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Başlık</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="Metin için bir başlık girin"
          placeholderTextColor="#94A3B8"
          value={textTitle}
          onChangeText={setTextTitle}
          maxLength={100}
        />
      </View>

      {/* Text Input */}
      <View style={styles.inputGroup}>
        <View style={styles.inputLabelRow}>
          <Text style={styles.inputLabel}>Metin</Text>
          <Text style={styles.charCount}>{textInput.length} karakter</Text>
        </View>
        <TextInput
          style={styles.textArea}
          placeholder="Metni buraya yapıştır veya yaz...

Örnek:
The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet and is often used for typing practice."
          placeholderTextColor="#94A3B8"
          value={textInput}
          onChangeText={setTextInput}
          multiline
          textAlignVertical="top"
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!textTitle.trim() || textInput.trim().length < 50) && styles.submitButtonDisabled,
        ]}
        onPress={handleTextSubmit}
        disabled={!textTitle.trim() || textInput.trim().length < 50}
        activeOpacity={0.85}
      >
        <Feather name="check" size={20} color="#FFFFFF" />
        <Text style={styles.submitButtonText}>Kaydet</Text>
      </TouchableOpacity>

      {/* Min Character Info */}
      {textInput.length < 50 && textInput.length > 0 && (
        <Text style={styles.minCharWarning}>
          En az 50 karakter gerekli ({50 - textInput.length} karakter daha)
        </Text>
      )}
    </ScrollView>
  );

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
        <Text style={styles.headerTitle}>
          {selectedOption === 'pdf' ? 'PDF Yükle' : 
           selectedOption === 'text' ? 'Metin Yapıştır' : 
           'Kaynak Yükleme'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      {!selectedOption && renderOptionSelection()}
      {selectedOption === 'pdf' && renderPdfUpload()}
      {selectedOption === 'text' && renderTextInput()}

      {/* Loading/Success Modal */}
      <Modal
        visible={isUploading || uploadSuccess}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {isUploading ? (
              <View style={styles.loadingContent}>
                <View style={styles.loadingIconWrapper}>
                  <ActivityIndicator size="large" color="#2ECC71" />
                </View>
                <Text style={styles.loadingTitle}>Yükleniyor...</Text>
                <Text style={styles.loadingSubtitle}>
                  {selectedOption === 'pdf' ? 'PDF metne dönüştürülüyor...' : 'Metin kaydediliyor'}
                </Text>
              </View>
            ) : (
              <View style={styles.successContent}>
                <View style={styles.successIconWrapper}>
                  <Feather name="check-circle" size={48} color="#2ECC71" />
                </View>
                <Text style={styles.successTitle}>Başarılı!</Text>
                <Text style={styles.successSubtitle}>
                  Kaynak başarıyla eklendi
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      {!selectedOption && (
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
      )}
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
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  optionCard: {
    backgroundColor: '#A8DF8E',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  optionIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  optionSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  optionArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
    lineHeight: 20,
  },
  // PDF Upload Styles
  uploadContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  uploadArea: {
    flex: 1,
  },
  uploadBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    padding: 40,
    alignItems: 'center',
  },
  uploadIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
    marginBottom: 24,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    gap: 10,
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
  selectedFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    gap: 12,
  },
  selectedFileDetails: {
    flex: 1,
  },
  selectedFileName: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1E293B',
  },
  selectedFileSize: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
  },
  formatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 12,
  },
  formatTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
  },
  formatBadge: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  formatText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: '#EF4444',
  },
  // Text Input Styles
  textInputContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1E293B',
    marginBottom: 10,
  },
  charCount: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#94A3B8',
    marginBottom: 10,
  },
  titleInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#1E293B',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#1E293B',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    minHeight: 300,
    lineHeight: 24,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ECC71',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowColor: '#94A3B8',
  },
  submitButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
  },
  minCharWarning: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#F59E0B',
    textAlign: 'center',
    marginTop: 12,
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
    padding: 32,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
  },
  successContent: {
    alignItems: 'center',
  },
  successIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#2ECC71',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
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

export default UploadResourceScreen;
