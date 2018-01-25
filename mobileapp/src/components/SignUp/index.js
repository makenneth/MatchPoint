/* @flow */
import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Image,
} from 'react-native';
import Button from 'react-native-button';

const styles = StyleSheet.create({
  title: {
    marginTop: 30,
    paddingVertical: 30,
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'STHeitiTC-Medium',
    color: 'white',
    backgroundColor: 'transparent'
  },
  container: {
    flex: 1,
    backgroundColor: 'rgb(0, 0, 0)',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  header: {
    fontSize: 34,
    marginBottom: 80
  },
  input: {
    width: '80%',
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderRadius: 5,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'white',
    marginBottom: 15
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    marginTop: 10,
    backgroundColor: 'white',
    color: 'black',
    borderRadius: 5,
    overflow: 'hidden',
    fontSize: 15,
    paddingHorizontal: 40,
    paddingVertical: 12
  }
});

export default class SignUp extends Component<{}> {

  state = {
    email: '',
    password: '',
    passwordConfirm: '',
  }

  handleChangeEmail = (email: string) => {
    this.setState({ email });
  }

  handleChangePassword = (password: string) => {
    this.setState({ password });
  }

  handleChangePasswordConfirm = (passwordConfirm: string) => {
    this.setState({ passwordConfirm });
  }

  render() {
    const { email, password, passwordConfirm } = this.state;
    return (
      <View style={styles.container}>
        <Image
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            flex: 1,
            resizeMode: 'cover',
            zIndex: -1,
          }}
          blurRadius={5}
          source={require('../../assets/images/tt-4.jpg')}
        />
        <Text style={styles.title}>MatchPoints</Text>
        <View style={styles.form}>
          <TextInput
            placeholderTextColor="white"
            style={styles.input}
            keyboardType="email-address"
            onChangeText={this.handleChangeEmail}
            placeholder="E-mail"
            value={email}
          />
          <TextInput
            placeholderTextColor="white"
            style={styles.input}
            keyboardType="default"
            onChangeText={this.handleChangePassword}
            placeholder="Pick a password"
            value={password}
            secureTextEntry={true}
          />
          <TextInput
            placeholderTextColor="white"
            style={styles.input}
            keyboardType="default"
            onChangeText={this.handleChangePasswordConfirm}
            placeholder="Retype the password"
            value={passwordConfirm}
            secureTextEntry={true}
          />
          <Button
            style={styles.button}
            onPress={() => {}}
          >
            Sign Up
          </Button>
        </View>
        <Text>
          Already have an account? <Text>Log In</Text>
        </Text>
      </View>
    );
  }
}
