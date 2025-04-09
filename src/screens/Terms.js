// TermsOfServiceScreen.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function TermsOfServiceScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.header, { color: isDarkMode ? '#fff' : '#000' }]}>Terms of Service</Text>
        <Text style={[styles.subText, { color: isDarkMode ? '#aaa' : '#555' }]}>Last updated: February 20, 2025</Text>

        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>1. Acceptance of Terms</Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#333' }]}>
          By accessing and using our AI image enhancement services, you agree to be bound by these Terms of Service and all applicable laws and regulations.
        </Text>

        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>2. Service Description</Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#333' }]}>
          We provide AI-powered image enhancement and manipulation services. While we strive for high-quality results, we cannot guarantee specific outcomes due to the nature of AI processing.
        </Text>

        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>3. User Obligations</Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#333' }]}>
          • You must be at least 13 years old to use our services{'\n'}
          • You are responsible for maintaining the confidentiality of your account{'\n'}
          • You agree not to use our services for any illegal or unauthorized purpose{'\n'}
          • You must not upload content that infringes on others' rights
        </Text>

        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>4. Content Rights</Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#333' }]}>
          You retain all rights to your original content. By using our service, you grant us a license to process and modify your images as requested through our AI features.
        </Text>

        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>5. Service Limitations</Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#333' }]}>
          • Maximum file size: 10MB per image{'\n'}
          • Supported formats: JPEG, PNG, WebP{'\n'}
          • Processing time may vary based on server load{'\n'}
          • Service availability subject to maintenance and updates
        </Text>

        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>6. Modifications to Service</Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#333' }]}>
          We reserve the right to modify or discontinue any aspect of our service at any time. We will provide notice of significant changes when possible.
        </Text>

        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>7. Contact Information</Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#333' }]}>
          For questions about these terms, please contact us at:{'\n'}
          Email: vikasgdjp@gmail.com{'\n'}
          Address: MaxAIeditor, Jaipur (India)
        </Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  backButton: {
    marginTop: 30,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
