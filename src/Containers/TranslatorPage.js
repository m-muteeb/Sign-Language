import React, { useState, useEffect } from 'react';
import { Text, SafeAreaView, View, TextInput, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Fonts } from '../Constants/Fonts';
import AppLoading from 'expo-app-loading';
import { useFonts } from '@use-expo/font';
import { images } from '../Constants/Images';

const TranslatorPage = () => {
  let [fontsLoaded] = useFonts(Fonts);
  const [text, setText] = useState("");
  const [playing, setPlaying] = useState(false);
  const [counterPlayed, setCounterPlayed] = useState(0);

  // Get special words from images object (words that aren't single letters)
  const getSpecialWords = () => {
    return Object.keys(images).filter(key => key.length > 1);
  };

  // Helper function to process input text
  const processText = (inputText) => {
    const words = inputText.split(' ');
    const specialWords = getSpecialWords();
    
    return words.map(word => {
      // Check if the word matches any image key (case-insensitive)
      const matchedSpecialWord = specialWords.find(
        specialWord => specialWord.toLowerCase() === word.toLowerCase()
      );
      
      if (matchedSpecialWord) {
        return [matchedSpecialWord]; // Return the word as it appears in the images object
      }
      return word.split(''); // Split regular words into letters
    }).flat();
  };

  // Helper function to get image key
  const getImageKey = (item) => {
    const specialWords = getSpecialWords();
    if (specialWords.includes(item)) return item;
    return item.toUpperCase(); // Convert all letters to uppercase for image lookup
  };

  const renderTranslationCards = () => {
    const processedText = processText(text);
    return processedText.map((item, idx) => {
      const imageKey = getImageKey(item);
      const imageUrl = images[imageKey];
      
      if (!imageUrl) return null; // Skip rendering if image doesn't exist
      
      return (
        <View
          key={idx}
          style={{
            width: 200,
            height: 220,
            margin: 20,
            borderRadius: 10,
            backgroundColor: 'white',
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.22,
            shadowRadius: 2.22,
            elevation: 3,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Image
            style={{
              width: 150,
              height: 150,
              resizeMode: 'stretch',
              marginBottom: 18
            }}
            source={imageUrl}
          />
          <Text
            style={{
              fontFamily: 'Bold',
              fontSize: 24
            }}
          >
            {getSpecialWords().includes(item) ? item : item.toUpperCase()}
          </Text>
        </View>
      )
    }).filter(Boolean); // Remove null items
  };

  const renderTranslationSlideShow = () => {
    const processedText = processText(text).filter(item => images[getImageKey(item)]); // Filter out items without images
    if (processedText.length === 0) return null;
    
    const currentItem = processedText[counterPlayed % processedText.length];
    const imageKey = getImageKey(currentItem);
    const imageUrl = images[imageKey];
    
    return (
      <View
        style={{
          width: 200,
          height: 220,
          margin: 20,
          borderRadius: 10,
          backgroundColor: 'white',
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,
          elevation: 3,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Image
          style={{
            width: 150,
            height: 150,
            resizeMode: 'stretch',
            marginBottom: 18
          }}
          source={imageUrl}
        />
        <Text
          style={{
            fontFamily: 'Bold',
            fontSize: 24
          }}
        >
          {getSpecialWords().includes(currentItem) ? currentItem : currentItem.toUpperCase()}
        </Text>
      </View>
    );
  };

  const renderTranslationSlider = () => {
    return (
      <View style={{ alignItems: "center"}}>
        {
          playing ?
          <>{ renderTranslationSlideShow() }</> :
          <ScrollView horizontal>
            { renderTranslationCards() }
          </ScrollView>
        }
        <TouchableOpacity
          style={{
            backgroundColor: 'white',
            paddingTop: 16,
            paddingHorizontal: 32,
            borderRadius: 32,
            width: '50%'
          }}
          onPress={() => {setCounterPlayed(0); setPlaying(!playing)}}
        >
          <Text
            style={{
              fontFamily: 'Medium',
              fontSize: 18,
              marginBottom: 18,
              textAlign: 'center',
              color: playing ? 'red' : 'black'
            }}
          >
            {playing ? 'Stop' : 'Play'}
          </Text>
        </TouchableOpacity>
      </View>
    )
  };
  
  useEffect(() => {
    const intervalID = setTimeout(() => {
      const processedText = processText(text).filter(item => images[getImageKey(item)]);
      if (counterPlayed >= processedText.length - 1) {
        setPlaying(false);
      } else {
        setCounterPlayed(counterPlayed + 1);
      }
    }, 1000);

    return () => clearInterval(intervalID);
  }, [counterPlayed, playing, text]);

  if (!fontsLoaded) {
    return <AppLoading />;
  } else {
    return ( 
      <SafeAreaView
        style={{
          flex: 1,
        }}
      >
        <ScrollView>
          <View
            style={{
              marginTop: 80,
              marginHorizontal: 30
            }}
          >
            <Text
              style={{
                fontFamily: 'Bold',
                fontSize: 24,
                marginBottom: 18
              }}
            >
              Translator
            </Text>
            <Text
              style={{
                fontFamily: 'Regular',
                fontSize: 16,
                marginBottom: 18
              }}
            >
              Enter any word or sentence to translate it into sign language
            </Text>
            <TextInput
              style={{
                height: 40,
                marginBottom: 18,
                padding: 10,
                borderRadius: 10,
                backgroundColor: 'white',
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
                elevation: 3
              }}
              onChangeText={setText}
              value={text}
              placeholder='Enter text here'
            />
          </View>
          <View
            style={{
              marginTop: 40,
              marginHorizontal: 30
            }}
          >
            <Text
              style={{
                fontFamily: 'Bold',
                fontSize: 18,
                marginBottom: 18
              }}
            >
              Translation
            </Text>
            { text.length > 0 ? renderTranslationSlider() : <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text
                style={{
                  fontFamily: 'Bold',
                  fontSize: 20,
                  marginTop: 64,
                  textAlign: 'center',
                  color: 'gray'
                }}
              >
               Enter the word you want to translate
              </Text>
            </View> }
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }
}

export default TranslatorPage;