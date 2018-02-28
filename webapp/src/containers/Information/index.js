import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
// import Divider from 'material-ui/Divider';
import AutoComplete from 'components/AutoComplete';
import { clearPredictions, addressAutoComplete } from 'redux/modules/autocomplete';
import { configureInitInformation } from 'redux/modules/clubInformation';

@connect(
  ({ clubInformation: { error, isLoading }, autocomplete, auth: { user } }) =>
    ({ error, isLoading, autocomplete, user }),
  { clearPredictions, addressAutoComplete, configureInitInformation, push }
)
export default class InformationForm extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      clubName: props.user.clubName || '',
      address: props.user.address || '',
      phone: props.user.phone || '',
      predictionUsed: null,
      addressFocused: false,
      errors: {},
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.error !== this.props.error) {
      if (nextProps.error) {
        const addressError = nextProps.error.address;
        const clubNameError = nextProps.error.clubName;
        this.setState({
          errors: {
            ...this.state.errors,
            address: addressError,
            password: clubNameError,
          },
        });
      }
    }
  }

  updateField(field, e) {
    const { [field]: fieldError, ...errors } = this.state.errors;

    if (fieldError) {
      this.setState({ errors });
    }
    this.setState({ [field]: e.target.value });
  }

  validate() {
    let isValid = true;
    const errors = {};
    if (this.state.clubName.length < 5) {
      errors.clubName = 'Club name cannot be shorter than 4 characters.';
      isValid = false;
    }

    if (!this.state.predictionUsed) {
      errors.address = 'Address must be selected from one of the options';
      isValid = false;
    }

    this.setState({ errors });
    return isValid;
  }

  focusAddress = () => {
    this.setState({ addressFocused: true });
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

  handleSubmit = (ev) => {
    ev.preventDefault();
    if (this.validate()) {
      const { predictionUsed, clubName, phone } = this.state;
      const data = { clubName, address: predictionUsed };
      if (phone) {
        data.phone = phone;
      }
      this.props.configureInitInformation(data);
    }
  }


  render() {
    const { errors, addressFocused } = this.state;
    const { predictions } = this.props.autocomplete;
    return (<div className="forms information" style={{ maxHeight: '70vh' }}>
      <form onSubmit={this.handleSubmit}>
        <p>Just a little bit more...</p>
        <p>Please fill in these information so players can find your club.</p>
        <div style={{ width: '100%' }}>
          <TextField
            type="text"
            hintText="Club Name"
            floatingLabelText="Club Name"
            value={this.state.clubName}
            style={{ width: '100%' }}
            onChange={e => this.updateField('clubName', e)}
            errorText={errors.clubName}
          />
        </div>
        <div style={{ width: '100%' }}>
          <TextField
            type="text"
            hintText="Phone Number"
            floatingLabelText="Phone Number"
            value={this.state.phone}
            style={{ width: '100%' }}
            onChange={e => this.updateField('phone', e)}
            errorText={errors.phone}
          />
        </div>
        <AutoComplete
          selectPrediction={this.selectPrediction}
          onClickOutside={this.handleAddressClickOutisde}
          onFocus={this.focusAddress}
          value={this.state.address}
          onChange={this.handleAddressChange}
          errorText={errors.address}
          addressFocused={addressFocused}
          predictions={predictions}
        />
        {!this.props.isLoading && <div className="button-div">
          <RaisedButton
            label="Save"
            backgroundColor="#1565C0"
            labelColor="#fff"
            style={{ marginRight: '10px' }}
            onClick={this.handleSubmit}
          />
        </div>}
        {this.props.isLoading && <CircularProgress
          size={25}
          color="#aaa"
          style={{ marginTop: '10px' }}
          className="circular-progress"
        />}
      </form>
    </div>);
  }
}
