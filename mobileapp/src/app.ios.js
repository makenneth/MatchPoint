/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { View } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Provider } from 'react-redux';
import { registerScreens } from './screens';

import { iconsMap, iconsLoaded } from './utils/AppIcons';
import configureStore from './store/configureStore';

const store = configureStore();

registerScreens(store, Provider);

const navigatorStyle = {
	navBarTranslucent: true,
	drawUnderNavBar: true,
	navBarTextColor: 'white',
	navBarButtonColor: 'white',
	navBarBackgroundColor: '#03A65A',
	statusBarTextColorScheme: 'dark',
	drawUnderTabBar: true
};

class App extends Component {
	constructor(props) {
		super(props);
		iconsLoaded.then(() => {
			this.startApp();
		});
	}

	startApp() {
		Navigation.startTabBasedApp({
			tabs: [
				{
					label: 'Movies',
					screen: 'movieapp.Movies',
					icon: iconsMap['ios-film-outline'],
					selectedIcon: iconsMap['ios-film'],
					title: 'Movies',
					navigatorStyle,
					navigatorButtons: {
						rightButtons: [
							{
								title: 'Search',
								id: 'search',
								icon: iconsMap['ios-log-out']
							}
						]
					}
				},
				{
					label: 'Browse',
					screen: 'movieapp.Browse',
					icon: iconsMap['ios-search-outline'],
					selectedIcon: iconsMap['ios-search'],
					title: 'Browse',
					navigatorStyle,
					navigatorButtons: {
						rightButtons: [
							{
								title: 'Filter',
								id: 'filter',
								icon: iconsMap['ios-options']
							}
						]
					}
				},
				{
					label: 'Settings',
					screen: 'movieapp.Movies',
					icon: iconsMap['ios-settings-outline'],
					selectedIcon: iconsMap['ios-settings'],
					title: 'Movies',
					navigatorStyle
				}
			],
			tabsStyle: {
				tabBarButtonColor: 'black',
				tabBarSelectedButtonColor: 'black',
				tabBarBackgroundColor: 'white'
			}
		});
	}
}

export default App;
