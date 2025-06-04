import React from 'react';
import { View, Text, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

export default function TermsOfServiceScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const navigation = useNavigation();

  return (
    <LinearGradient colors={['#0d1117', '#8ec5fc']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={true}>
        <Text style={styles.header}>Terms of Service</Text>
        <Text style={styles.subText}>Last updated: February 20, 2025</Text>

        <Section title="1. Acceptance of Terms">
          By accessing and using our AI image enhancement services, you agree to be bound by these Terms of Service and all applicable laws and regulations.
        </Section>

        <Section title="2. Service Description">
          We provide AI-powered image enhancement and manipulation services. While we strive for high-quality results, we cannot guarantee specific outcomes due to the nature of AI processing.
        </Section>

        <Section title="3. User Obligations">
          • You must be at least 13 years old to use our services{'\n'}
          • You are responsible for maintaining the confidentiality of your account{'\n'}
          • You agree not to use our services for any illegal or unauthorized purpose{'\n'}
          • You must not upload content that infringes on others' rights
        </Section>

        <Section title="4. Content Rights">
          You retain all rights to your original content. By using our service, you grant us a license to process and modify your images as requested through our AI features.
        </Section>

        <Section title="5. Service Limitations">
          • Maximum file size: 10MB per image{'\n'}
          • Supported formats: JPEG, PNG, WebP{'\n'}
          • Processing time may vary based on server load{'\n'}
          • Service availability subject to maintenance and updates
        </Section>

        <Section title="6. Modifications to Service">
          We reserve the right to modify or discontinue any aspect of our service at any time. We will provide notice of significant changes when possible.
        </Section>

        <Section title="7. Contact Information">
          For questions about these terms, please contact us at:{'\n'}
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
      <Text style={styles.sectionText}>{children}</Text>
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
    color: '#fff',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 12,
    lineHeight: 24,
    color: '#ddd',
  },
});
