import { Navigation } from 'react-native-navigation';
import registerScreens from './config/screens';

registerScreens();
// Navigation.startSingleScreenApp({
//   screen: {
//     screen: 'matchpoints.SignUp', // unique ID registered with Navigation.registerScreen
//     title: 'SignUp', // title of the screen as appears in the nav bar (optional)
//     navigatorStyle: {
//       navBarHidden: true,
//     }, // override the navigator style for the screen, see "Styling the navigator" below (optional)
//     navigatorButtons: {
//       rightButtons: [
//         {
//           title: 'Log Out',
//           id: 'logout',
//         }
//       ]
//     } // override the nav buttons for the screen, see "Adding buttons to the navigator" below (optional)
//   },
//   passProps: {}, // simple serializable object that will pass as props to all top screens (optional)
//   animationType: 'fade'
// });
Navigation.startSingleScreenApp({
  screen: {
    screen: 'matchpoints.Registration', // unique ID registered with Navigation.registerScreen
    title: 'Registration', // title of the screen as appears in the nav bar (optional)
    navigatorStyle: {
      navBarBackgroundColor: 'black',
      navBarTextColor: 'white'
    }, // override the navigator style for the screen, see "Styling the navigator" below (optional)
    navigatorButtons: {
      rightButtons: [
        {
          title: 'Log Out',
          id: 'logout',
        }
      ]
    } // override the nav buttons for the screen, see "Adding buttons to the navigator" below (optional)
  },
  passProps: {}, // simple serializable object that will pass as props to all top screens (optional)
  animationType: 'fade'
});
