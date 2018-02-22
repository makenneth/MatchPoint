import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import AddressAutoComplete from 'components/AutoComplete';
import './styles.scss';

export default class ContactInfo extends Component {
  constructor(props) {
    super(props);

    const user = props.user;
    this.state = {
      clubName: user.clubName || '',
      address: user.address || '',
      phone: user.phone || '',
      password: '',
      errors: {},
      predictionUsed: null,
      addressFocused: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { error, success, isLoading } = nextProps.infoChange;
    if (this.props.infoChange.isLoading && !isLoading) {
      if (success) {
        this.props.setMessage('Info has been changed successfully.');
        this.setState({
          password: '',
          clubName: nextProps.user.clubName || '',
          address: nextProps.user.address || '',
          phone: nextProps.user.phone || '',
          predictionUsed: null,
          addressFocused: false,
          errors: {},
        });
      } else if (error) {
        if (error.password || error.address || error.phone || error.clubName) {
          this.setState({ errors: error });
        } else {
          this.props.setMessage('Please try again later.');
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.acTimeout) clearTimeout(this.acTimeout);
  }

  focusAddress = () => {
    this.setState({ addressFocused: true });
  }

  handleAddressClickOutisde = () => {
    this.setState({ addressFocused: false });
  }

  selectPrediction = (prediction) => {
    this.props.clearPredictions();
    const { description } = prediction;
    this.setState({
      predictionUsed: prediction,
      address: description,
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();

    if (this.validate()) {
      const { password, predictionUsed, clubName, phone, address } = this.state;
      const data = {};
      if (address !== this.props.user.address) {
        data.address = predictionUsed;
      }
      if (clubName !== this.props.user.clubName) {
        data.clubName = clubName;
      }

      if (phone !== this.props.user.phone) {
        data.phone = phone;
      }
      if (Object.keys(data).length > 0) {
        this.props.submitChange(data, password);
      } else {
        this.setState({ password: '' });
        this.props.setMessage('Info has been changed successfully.');
      }
    }
  }

  handleChange(field, val) {
    const { [field]: error, ...rest } = this.state.errors;
    if (error) {
      this.setState({ errors: rest });
    }
    this.setState({ [field]: val });
  }

  handleAddressChange = (ev) => {
    const address = ev.target.value;
    this.props.clearPredictions();
    if (this.acTimeout) clearTimeout(this.acTimeout);
    this.acTimeout = setTimeout(() => {
      this.props.addressAutoComplete(address);
    }, 300);
    this.setState({ address, predictionUsed: null });
  }

  validate() {
    const errors = {};
    let isValid = true;
    const { clubName, address, phone } = this.props.user;
    if (this.state.password.length === 0) {
      errors.password = 'Password is required';
      isValid = false;
    }

    if (clubName !== this.state.clubName && clubName.length === 0) {
      errors.clubName = 'Club name cannot be empty.';
      isValid = false;
    }

    if (address !== this.state.address && address.length === 0) {
      errors.address = 'Address cannot be empty.';
      isValid = false;
    }

    if (phone !== this.state.phone && phone.length === 0) {
      errors.phone = 'Phone cannot be empty.';
      isValid = false;
    }

    if (!isValid) {
      this.setState({ errors });
    }
    return isValid;
  }

  render() {
    const { predictions } = this.props.autocomplete;
    const { addressFocused } = this.state;
    const { isLoading } = this.props.infoChange;

    return (<form onSubmit={this.handleSubmit} style={{ overflow: 'initial' }}>
      <TextField
        hintText="Club Name"
        floatingLabelText="Club Name"
        value={this.state.clubName}
        onChange={e => this.handleChange('clubName', e.target.value)}
        errorText={this.state.errors.clubName}
        type="clubName"
        fullWidth={Boolean(true)}
      />
      <TextField
        hintText="Phone"
        floatingLabelText="Phone"
        value={this.state.phone}
        onChange={e => this.handleChange('phone', e.target.value)}
        errorText={this.state.errors.phone}
        type="phone"
        fullWidth={Boolean(true)}
      />
      <AddressAutoComplete
        selectPrediction={this.selectPrediction}
        onClickOutside={this.handleAddressClickOutisde}
        onFocus={this.focusAddress}
        value={this.state.address}
        onChange={this.handleAddressChange}
        errorText={this.state.errors.address}
        addressFocused={addressFocused}
        predictions={predictions}
      />
      <TextField
        hintText="Password"
        floatingLabelText="Password"
        value={this.state.password}
        onChange={e => this.handleChange('password', e.target.value)}
        errorText={this.state.errors.password}
        type="password"
        fullWidth={Boolean(true)}
      />
      {!isLoading && <RaisedButton
        type="submit"
        label="Change Information"
        backgroundColor="#1565C0"
        labelColor="#FFFFFF"
        style={{ marginRight: '10px', marginTop: '10px' }}
        onClick={this.handleSubmit}
      />}
      {
        isLoading && <CircularProgress
          size={25}
          thickness={2}
          color="#aaa"
          style={{ marginTop: '20px' }}
        />
      }
    </form>);
  }
}
