import { Navigation } from 'react-native-navigation';

import SignUp from '../components/SignUp';
import Registration from '../components/Registration';
import ClubDetail from '../components/ClubDetail';
// import App from './App';

export default function registerScreens() {
  Navigation.registerComponent('matchpoints.SignUp', () => SignUp);
  Navigation.registerComponent('matchpoints.Registration', () => Registration);
  Navigation.registerComponent('matchpoints.ClubDetail', () => ClubDetail);
}
