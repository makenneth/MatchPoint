import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import AutoComplete from 'material-ui/AutoComplete';
import CircularProgress from 'material-ui/CircularProgress';
import MdInfoOutline from 'react-icons/lib/md/info-outline';
import countries from 'constants/countries';
import AddressAutoComplete from './AutoComplete';
import './styles.scss';

export default class ContactInfo extends Component {
  constructor(props) {
    super(props);

    const club = props.club;
    this.state = {
      email: club.email || '',
      address: club.address || '',
      city: club.city || '',
      state: club.state || '',
      country: club.country || '',
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
          email: success.email || '',
          address: success.address || '',
          city: success.city || '',
          state: success.state || '',
          country: success.country || '',
          predictionUsed: null,
          addressFocused: false,
          errors: {},
        });
        if (!success.verified && this.props.club.verified) {
          browserHistory.push('/club/confirm');
        }
      } else {
        if (error.password || error.email ||
          error.address || error.state ||
          error.city || error.country
        ) {
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
    const { description, terms } = prediction;
    if (terms.length === 4) {
      const [, city, state, country] = terms;
      this.setState({
        predictionUsed: prediction,
        address: description,
        city: city.value,
        state: state.value,
        country: country.value,
      });
    } else if (terms.length === 5) {
      const [, , city, state, country] = terms;
      this.setState({
        predictionUsed: prediction,
        address: description,
        city: city.value,
        state: state.value,
        country: country.value,
      });
    } else {
      this.setState({
        predictionUsed: prediction,
        address: description,
      });
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();
    // eslint-disable-next-line no-unused-vars
    const { errors, password, ...others } = this.state;

    if (this.validate()) {
      this.props.submitChange(others, password);
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
    if (this.state.state.length === 0) {
      errors.state = 'State cannot be empty.';
      isValid = false;
    }

    if (this.state.city.length === 0) {
      errors.city = 'City cannot be empty.';
      isValid = false;
    }

    if (this.state.country.length === 0) {
      errors.country = 'Country cannot be empty.';
      isValid = false;
    }

    if (this.state.password.length === 0) {
      errors.password = 'Password is required';
      isValid = false;
    }

    const emailRegex = new RegExp('.+@.+..+', 'i');
    if (!emailRegex.test(this.state.email)) {
      errors.email = 'Not a valid email';
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
        floatingLabelText="City"
        value={this.state.city}
        onChange={e => this.handleChange('city', e.target.value)}
        errorText={this.state.errors.city}
        type="text"
        fullWidth={Boolean(true)}
      />
      <TextField
        floatingLabelText="State"
        value={this.state.state}
        onChange={e => this.handleChange('state', e.target.value)}
        errorText={this.state.errors.state}
        type="text"
        fullWidth={Boolean(true)}
      />
      <AutoComplete
        floatingLabelText="Country"
        searchText={this.state.country}
        onChange={e => this.handleUpdateInput('country', e.target.value)}
        errorText={this.state.errors.country}
        dataSource={countries}
        fullWidth={Boolean(true)}
        filter={AutoComplete.fuzzyFilter}
        maxSearchResults={5}
      />
      <div className="email-input-container">
        <TextField
          floatingLabelText="Email"
          value={this.state.email}
          onChange={e => this.handleChange('email', e.target.value)}
          errorText={this.state.errors.email}
          type="email"
          fullWidth={Boolean(true)}
        />
        <div className="hint-text">
          <MdInfoOutline />
          <div className="tooltip">
            You will be required to re-verify your email address.
          </div>
        </div>
      </div>
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
        labelColor="white"
        style={{ marginRight: '10px', marginTop: '10px' }}
        onClick={this.handleSubmit}
      />}
      {
        isLoading && <CircularProgress
          size={0.5}
          color="#aaa"
          style={{ marginTop: '20px' }}
        />
      }
    </form>);
  }
}
