import { StyleSheet } from 'react-native';
import Color from '../../_global/constants/Color';

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  detailList: {

  },
  detailListItem: {
    width: '90%',
    flexDirection: 'column',
    marginBottom: 10,
  },
  timeList: {
    paddingLeft: 15,
    display: 'flex',
    flexDirection: 'column'
  },
  dayTimeList: {
    display: 'flex',
    flexDirection: 'row'
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    marginRight: 5,
    width: 120,
  },
  mainLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  textStyle: {
    color: 'white',
    paddingTop: 10,
    fontSize: 12,
    fontWeight: 'bold'
  },
  underlineStyle: {
    backgroundColor: '#EA0000'
  },
  tabBar: {
    backgroundColor: Color.GREEN
  },
  contentContainer: {
    // flex: 1,
    marginTop: 10,
  },
});

export default styles;
