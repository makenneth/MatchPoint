import React, { Component } from 'react';
import { push } from 'react-router-redux';
import CircularProgress from 'material-ui/CircularProgress';
import SearchIcon from 'react-icons/lib/md/search';
import { connect } from 'react-redux';
import { searchClubs } from 'redux/modules/clubSearch';
import { AutoComplete } from 'components';

@connect(({ clubSearch }) => ({ clubSearch }), { searchClubs, push })
export default class Search extends Component {
  state = {
    searchValue: '',
    inputFocused: false,
  }

  handleSearchStringChange = (ev) => {
    this.setState(
      { searchValue: ev.target.value },
      () => {
        if (this.to) clearTimeout(this.to);
        this.to = setTimeout(() => {
          this.props.searchClubs(this.state.searchValue);
        }, 500);
      }
    );
  }

  handleClubSelect = (club) => {
    this.setState({ inputFocused: false, searchValue: club.clubName });
    this.props.push(`/clubs/${club.id}`);
  }

  focus = () => {
    this.setState({ inputFocused: true });
  }

  unfocus = () => {
    this.setState({ inputFocused: false });
  }

  render() {
    const { clubSearch } = this.props;

    return (<AutoComplete
      predictions={clubSearch.clubs}
      displayKey="clubName"
      isLoading={clubSearch.isLoading}
      addressFocused={this.state.inputFocused}
      selectPrediction={this.handleClubSelect}
      onClickOutside={this.unfocus}
      className="club-search-autocomplete"
      customInput={<div className="club-search-autocomplete--input">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search for a club..."
          onFocus={this.focus}
          value={this.state.searchValue}
          onChange={this.handleSearchStringChange}
        />
        {clubSearch.isLoading && <CircularProgress
          size={15}
          color="#aaa"
          thickness={1}
        />}
      </div>}
      customListItem={(item) => ([
        <div>{item.clubName}</div>,
        <div>{item.city || 'unknown'}, {item.state || 'unknown'}</div>,
      ])}
    />);
  }
}
