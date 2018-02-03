import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  detailList: {
    padding: 20
  },
  item: {
    flexDirection: 'row',
  },
  itemContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0'
  },
  title: {
    fontWeight: 'bold',
    marginRight: 10
  },
  button: {
    position: 'absolute',
    right: 20,
    top: '50%'
  }
});

export default styles;
