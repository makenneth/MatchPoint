import React from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import InfoOutline from 'react-icons/lib/md/info-outline';
import AddressAutoComplete from 'components/AutoComplete';

export default class OperationInfo extends React.PureComponent {
  constructor(props) {
    super(props);

    const user = props.user || {};
    this.state = {
      clubName: user.clubName || '',
      address: user.address || '',
      phone: user.phone || '',
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
          clubName: nextProps.user.clubName || '',
          address: nextProps.user.address || '',
          phone: nextProps.user.phone || '',
          predictionUsed: null,
          addressFocused: false,
          errors: {},
        });
      } else if (error) {
        if (error.address || error.phone || error.clubName) {
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
      const { predictionUsed, clubName, phone, address } = this.state;
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
        this.props.submitChange(data);
      } else {
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

    if (this.state.clubName.length === 0) {
      errors.clubName = 'Club name cannot be empty.';
      isValid = false;
    }

    if (this.state.address.length === 0) {
      errors.address = 'Address cannot be empty.';
      isValid = false;
    }

    if (this.state.phone.length === 0) {
      errors.phone = 'Phone cannot be empty.';
      isValid = false;
    }

    if (!isValid) {
      this.setState({ errors });
    }
    return isValid;
  }

  render() {
    const { infoChange, autocomplete: { predictions } } = this.props;
    const { addressFocused } = this.state;

    return (<div className="contact-info-container--info">
      <h2 className="contact-info-container--title">
        <InfoOutline />
        Information
      </h2>
      <form
        id="contact-info-form"
        onSubmit={this.handleSubmit}
        style={{ overflow: 'initial' }}
      >
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
        {!infoChange.isLoading && <RaisedButton
          type="submit"
          label="Change Information"
          backgroundColor="#1565C0"
          labelColor="#FFFFFF"
          style={{ marginRight: '10px', marginTop: '10px' }}
          onClick={this.handleSubmit}
        />}
        {
          infoChange.isLoading && <CircularProgress
            size={25}
            thickness={2}
            color="#aaa"
            style={{ marginTop: '20px' }}
          />
        }
      </form>
    </div>);
  }
}
