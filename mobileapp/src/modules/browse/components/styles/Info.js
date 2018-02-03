import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  detailList: {
    padding: 20,
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
    color: 'black'
  },
  mainLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black'
  }
});

export default styles;
