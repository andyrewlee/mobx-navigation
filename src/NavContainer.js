import React from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  View
} from 'react-native';
import { observer } from 'mobx-react';
import { autorun, observable } from 'mobx';
import PropTypes from 'prop-types';

import { NavState } from './models/NavState';
import NavTabBar from './NavTabBar';
import NavCard from './NavCard';

import Log from './Logger';

const TransitionState = {
  NONE: 0,
  PUSH: 1,
  POP: 2,
};

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;

export const defaultConfig = {
  navBarVisible: false,
  tabBarVisible: false,
  cardStyle: {
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    position: 'absolute',
    backgroundColor: 'white',
  },
  navBarStyle: {
    backgroundColor: 'white',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#828287',
    height: 68,
  },
  navBarBackImage: null,
  navBarBackImageStyle: {
    width: 13,
    height: 21,
  },
  navBarCenter: null,
  navBarCenterProps: null,
  navBarCenterStyle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: STATUSBAR_HEIGHT,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  navBarLeft: null,
  navBarLeftProps: null,
  navBarLeftStyle: {
    position: 'absolute',
    justifyContent: 'center',
    paddingTop: STATUSBAR_HEIGHT,
    width: 100,
    top: 0,
    left: 0,
    bottom: 0,
    paddingLeft: 15,
  },
  navBarRight: null,
  navBarRightProps: null,
  navBarRightStyle: {
    position: 'absolute',
    justifyContent: 'center',
    paddingTop: STATUSBAR_HEIGHT,
    width: 100,
    top: 0,
    right: 0,
    bottom: 0,
    paddingRight: 15,
  },
  navBarTitleStyle: {
    alignItems: 'center',
  },
  navBarSubtitleStyle: {

  },
  navBarTransparent: false,
  statusBarStyle: 'default', // One of default, light-content, or dark-content
  tabBarStyle: {
    height: 50,
  },
  tabBarTransparent: false,
  logLevel: Log.Level.WARNING,
  unique: false,
}

// Top level container for all navigation elements and scenes
@observer
export default class NavContainer extends React.Component {
  static propTypes = {
    cardStyle: View.propTypes.style,
    navBarStyle: View.propTypes.style,
    tabStyle: View.propTypes.style,
    logLevel: PropTypes.number,
  };

  @observable width;
  @observable height;

  constructor(props) {
    super(props);
    const config = { ...defaultConfig, ...props };
    // Unset templates as this is not an actual configuration value
    config.templates = undefined;

    this.navState = new NavState(config, props.templates);
    if (typeof props.navStateRef === 'function') {
      props.navStateRef(this.navState);
    }

    Log.debug('Initializing nav container with configuration: ', config);
    const { height, width } = Dimensions.get('window');
    this.width = width;
    this.height = height;
  }

  componentWillMount() {
    Dimensions.addEventListener('change', (event) => {
      const { height, width } = event.window;
      this.width = width;
      this.height = height;
    });
  }

  componentWillUnmount() {
    Dimensions.removeEventListener('change');
  }

  cards() {
    return this.navState.elementPool.orderedElements().map(
      element => <NavCard
        navState={this.navState}
        key={element.key}
        element={element}
        height={this.height}
        width={this.width}
      />);
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.cards()}
        <NavTabBar navState={this.navState} style={this.props.tabStyle} height={this.height} width={this.width}>
          {this.props.children}
        </NavTabBar>
      </View>
      );
  }
}
