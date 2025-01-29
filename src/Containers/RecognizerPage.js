import React, { useEffect, useState, useRef } from 'react';
import { Text, SafeAreaView, View, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Fonts } from '../Constants/Fonts';

import AppLoading from 'expo-app-loading';
import { useFonts } from '@use-expo/font';
import { Camera } from 'expo-camera';
import axios from 'axios';
import IconFlip from '../Assets/icons/IconFlip';
import { useIsFocused } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';

const RecognizerPage = () => {
  let [fontsLoaded] = useFonts(Fonts);
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [recording, setRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState([]);
  const cameraRef = useRef(null);
  const isFocused = useIsFocused();

  const handleRecognizedWord = (response) => {
    const predictions = response.predictions;
    if (predictions && predictions.length > 0) {
      const highestConfidencePrediction = predictions.reduce((max, current) =>
        current.confidence > max.confidence ? current : max
      );
      const word = highestConfidencePrediction.class;
      setRecognizedText((prevText) => {
        if (prevText[prevText.length - 1] !== word) {
          return [...prevText, word];
        }
        return prevText;
      });
    }
  };

  const getPredictedLetter = () => {
    if (recognizedText.length > 0) {
      return recognizedText[recognizedText.length - 1];
    }
    return '';
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!recording) return;
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
        const image = await FileSystem.readAsStringAsync(photo.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        axios({
          method: 'POST',
          url: 'https://detect.roboflow.com/english-sentences-pomoo-iu7mq/1',
          params: { api_key: 'g1gMLG4quRQRpZrb4QRP' },
          data: image,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
          .then((response) => {
            console.log('Prediction Result:', response.data);
            handleRecognizedWord(response.data);
          })
          .catch((error) => console.error('Error:', error.message));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [recording]);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const renderContent = () => (
    <View style={{ width: Dimensions.get('window').width, flex: 1, backgroundColor: 'transparent', flexDirection: 'row' }}>
      <View
        style={{
          flex: 1,
          height: 250,
          alignSelf: 'flex-end',
          alignItems: 'center',
          backgroundColor: 'white',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <View style={{ flex: 1, width: Dimensions.get('window').width, alignSelf: 'flex-end', alignItems: 'center' }}>
          <TouchableOpacity style={{ paddingVertical: 18 }} onPress={() => setRecognizedText(recognizedText.slice(0, -1))}>
            <Text style={{ margin: 18, fontFamily: 'Bold', textAlign: 'center', color: 'gray' }}>
              {recognizedText.length > 0 ? 'Translation Result' : ''}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Text
                style={{
                  marginBottom: 32,
                  textAlign: 'center',
                  fontSize: recognizedText.length > 0 ? 32 : 18,
                  fontFamily: 'Bold',
                  color: recognizedText.length > 0 ? 'black' : 'gray',
                }}
              >
                {recognizedText.length > 0 ? recognizedText.join('') : "Press 'Record' to start"}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', flex: 1, width: Dimensions.get('window').width, alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity onPress={() => setRecording(!recording)}>
              <View
                style={{
                  height: 70,
                  width: 70,
                  backgroundColor: 'red',
                  borderRadius: 35,
                  borderWidth: recording ? 5 : 20,
                  borderColor: 'white',
                  elevation: 3,
                }}
              />
            </TouchableOpacity>
            <View style={{ width: 30 }} />
            <TouchableOpacity
              onPress={() => setType(type === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back)}
            >
              <View
                style={{
                  height: 40,
                  width: 40,
                  backgroundColor: 'white',
                  borderRadius: 20,
                  elevation: 3,
                }}
              >
                <IconFlip />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderCamera = () =>
    isFocused ? (
      <Camera style={{ flex: 1 }} type={type} ref={cameraRef}>
        {renderContent()}
      </Camera>
    ) : (
      renderContent()
    );

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {renderCamera()}
      <Text>Predicted Letter: {getPredictedLetter()}</Text>
    </SafeAreaView>
  );
};

export default RecognizerPage;
