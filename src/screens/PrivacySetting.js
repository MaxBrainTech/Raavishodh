import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function PrivacySettingsScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <LinearGradient colors={['#0d1117', '#8ec5fc']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={true}>
        <Text style={[styles.header, { color: '#fff' }]}>Privacy Policy</Text>
        <Text style={[styles.lastUpdated, { color: '#ccc' }]}>
          Last updated: February 20, 2025
        </Text>

        <Section title="Introduction">
          We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we handle your information when you use our AI image enhancement services.
        </Section>

        <Section title="Information We Collect">
          • Images you upload for processing{'\n'}
          • Usage data and interaction with our services{'\n'}
          • Technical data including IP address and browser information{'\n'}
          • Account information if you choose to register
        </Section>

        <Section title="How We Use Your Information">
          • To provide and improve our AI image enhancement services{'\n'}
          • To process your requests and transactions{'\n'}
          • To communicate with you about our services{'\n'}
          • To maintain the security of our platform
        </Section>

        <Section title="Data Storage and Security">
          We implement appropriate technical and organizational measures to protect your data. Your images and personal information are stored securely and processed using industry-standard encryption.
        </Section>

        <Section title="Your Rights">
          You have the right to:{'\n'}
          • Access your personal data{'\n'}
          • Correct inaccurate data{'\n'}
          • Request deletion of your data{'\n'}
          • Object to processing of your data{'\n'}
          • Request transfer of your data
        </Section>

        <Section title="Contact Us">
          If you have any questions about this Privacy Policy or our data practices, please contact us at:{'\n\n'}
          Email: vikasgdjp@gmail.com{'\n'}
          Address: MaxAIeditor, Jaipur (India)
        </Section>
      </ScrollView>
    </LinearGradient>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionContent}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  lastUpdated: {
    fontSize: 14,
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 12,
    lineHeight: 24,
    color: '#ddd',
  },
});
