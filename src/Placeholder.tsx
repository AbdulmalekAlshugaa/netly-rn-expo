import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Placeholder: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello from netly-rn-expo!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

export default Placeholder;
