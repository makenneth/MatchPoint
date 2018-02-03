import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    width: '100%',
    backgroundColor: 'white',
  },
  item: {
    marginBottom: 10,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: 10,
    marginRight: 10,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20
  },
  location: {
    fontSize: 16
  },
  statusIndicator: {
    position: 'absolute',
    right: 20,
    top: '50%',
    alignItems: 'flex-end'
  }
});

export default styles;
