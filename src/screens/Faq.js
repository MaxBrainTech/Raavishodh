// FAQScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LinearGradient from 'react-native-linear-gradient'; // <--- added this

export default function FAQScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const navigation = useNavigation();

  const faqs = [
    {
      question: 'What image formats are supported?',
      answer: 'We support JPEG, PNG, and WebP formats. The maximum file size is 10MB per image.',
    },
    {
      question: 'How long does image processing take?',
      answer: 'Most operations complete within 10-30 seconds. Processing time may vary based on image size and the selected feature. Premium users enjoy priority processing.',
    },
    {
      question: 'Are my images stored securely?',
      answer: 'Yes, all uploaded images are encrypted and stored securely. We automatically delete processed images after 24 hours unless youYes, all uploaded images are encrypted and stored securely. We automatically delete processed images after 24 hours unless you are a premium user who has enabled image history.',
    },
    {
      question: 'Can I use the processed images commercially?',
      answer: 'Yes, you retain all rights to both your original and processed images. You can use them for any purpose, including commercial use.',
    },
    {
      question: "What's the difference between free and premium plans?",
      answer: 'Free plans include basic features with watermarks and daily usage limits. Premium plans offer unlimited processing, higher resolution outputs, and additional features like API access.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 14-day money-back guarantee for premium subscriptions if you are not satisfied with our service.',
    },
    {
      question: 'How accurate is the AI in detecting and processing images?',
      answer: 'Our AI models are trained on millions of images and achieve high accuracy. However, results may vary depending on image quality and complexity. We recommend following our guidelines for best results.',
    },
    {
      question: 'Can I process multiple images at once?',
      answer: 'Premium users can batch process up to 10 images simultaneously. Free users can process one image at a time.',
    },
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleExpand = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.header}>
          Frequently Asked Questions
        </Text>
        <Text style={styles.subText}>
          Find answers to common questions about our AI image editing tools
        </Text>

        {faqs.map((faq, index) => {
          const isOpen = activeIndex === index;
          return (
            <View key={index} style={styles.card}>
              <TouchableOpacity
                onPress={() => toggleExpand(index)}
                style={styles.questionRow}
                activeOpacity={0.8}
              >
                <Text style={styles.questionText}>{faq.question}</Text>
                <AntDesign
                  name={isOpen ? 'up' : 'down'}
                  size={20}
                  color="#333"
                />
              </TouchableOpacity>
              {isOpen && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          );
        })}

      </ScrollView>
    </LinearGradient>
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
    color: 'white',
  },
  subText: {
    fontSize: 14,
    marginBottom: 20,
    color: 'white',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
    color: '#000',
  },
  answerContainer: {
    marginTop: 10,
  },
  answerText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
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
