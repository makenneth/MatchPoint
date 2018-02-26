import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'lodash';
import CircularProgress from 'material-ui/CircularProgress';
import MdDirections from 'react-icons/lib/md/directions';
import MdPhone from 'react-icons/lib/md/phone';
import MdLocation from 'react-icons/lib/md/location-on';
import { HoursTable } from 'components';
import { clubDetailQuery } from 'redux/modules/clubDetailSearch';
import loadjs from 'loadjs';
import './styles.scss';

@connect(({ clubDetailSearch }) => ({ clubDetailSearch }), { clubDetailQuery })
export default class ClubInfo extends Component {
  static contextTypes = {
    router: PropTypes.any,
  };

  componentWillMount() {
    const clubId = this.props.params.id;
    const { isLoading } = this.props.clubDetailSearch;
    if (!isLoading) {
      this.props.clubDetailQuery(clubId);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.params.id !== nextProps.params.id) {
      const clubId = nextProps.params.id;
      this.props.clubDetailQuery(clubId);
    }
  }

  renderNotes(notes) {
    return Object.keys(notes).map(note => (
      <div className="club-information-container--column">
        <div className="club-information-container--note">
        <div className="club-information-container--note-type">Note about {note}:</div>
        <p className="club-information-container--note-value">{notes[note]}</p>
        </div>
      </div>
    ));
  }

  render() {
    const { clubs, isLoading } = this.props.clubDetailSearch;
    const clubId = this.props.params.id;
    const club = clubs[clubId];
    return (<div className="club-information-container">
      {club && <div className="club-information-container--body">
        <h1>{club.clubName}</h1>
        <div>
          <div className="club-information-container--columns">
            <Map lat={club.geolat} lng={club.geolng} />
            <div className="club-information-container--column">
              <div className="club-information-container--row">
                <MdLocation />
                <span>{`${club.address}`}</span>
              </div>
              <div className="club-information-container--row">
                <MdDirections />
                <a
                  href={`https://www.google.com/maps/?q=${club.geolat},${club.geolng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Direction
                </a>
              </div>
              <div className="club-information-container--row">
                <MdPhone />
                <span>{club.phone}</span>
              </div>
            </div>
          </div>
          {this.renderNotes(club.notes)}
          <div className="club-information-container--hours">
            <HoursTable
              title="Operation Hours"
              type="operation"
              hourState={{ }}
              hours={get(club, 'operationHours', [])}
              readOnly
            />
            <HoursTable
              title="Round Robin Hours"
              type="roundrobin"
              hourState={{ }}
              hours={get(club, 'roundrobinHours', [])}
              readOnly
            />
          </div>
        </div>
      </div>}
      {isLoading && <div className="overlay">
        <CircularProgress
          color="#555"
          size={50}
          style={{
            margin: '0',
            position: 'absolute',
            transform: 'translate(-50%)',
            top: '50%',
            left: '50%',
          }}
        />
      </div>}
    </div>);
  }
}

class Map extends Component {
  componentDidMount() {
    if (this.props.lat && this.props.lng) {
      window.initMap = this.initMap;
      loadjs('https://maps.googleapis.com/maps/api/js?key=AIzaSyDdc8AO7MIwT7Cko3gTi167pAstQYrMoQQ&callback=initMap');
    }
  }

  componentWillUnmount() {
    loadjs.reset();
  }

  initMap = () => {
    const { lat, lng } = this.props;
    const center = { lat, lng };
    this.map = new google.maps.Map(this.mapNode, {
      zoom: 15,
      center,
    });
    // eslint-disable-next-line no-unused-vars
    const marker = new google.maps.Marker({
      position: center,
      map: this.map,
    });
  }

  render() {
    return (
      <div id="map" ref={(node) => { this.mapNode = node; }} />
    );
  }
}
