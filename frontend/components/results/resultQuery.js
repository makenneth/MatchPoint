import React, { Component } from 'react'
import NavBar from "../navBar"
import { Tabs, Tab } from "material-ui/Tabs"
import PlayerResultQuery from "./playerResultQuery"
import ClubResult from "./clubResult"
import { fetchAllClubs  } from "../../actions/clientActions"
import AllClubsStore from "../../stores/allClubsStore"
export default class ResultQuery extends Component {
  constructor(props){
    super(props)
    this.state = {
      clubs: null,
      tab: 0
    }
  }
  componentDidMount() {
    this.allCListener = AllClubsStore.addListener(this._fetchedAllClubs);
    this._checkIfCachedClubs();
  }
  componentWillUnmount(){
    this.allCListener.remove();
  }
  handleTabChange = (e, i, tab) => {
    this.setState({ tab });
  }
  _checkIfCachedClubs(){
    let clubs = AllClubsStore.all();
    if (clubs){
      this.setState({ clubs });
    } else {
      fetchAllClubs();
    }
  }

  _fetchedAllClubs = () => {
    this.setState({ clubs: AllClubsStore.all() })
  }

  render() {
    return <div>
      <NavBar />
      <div className="result-query-container">
        <Tabs 
          value={this.state.tab}
          onChange={this.handleTabChange}>
          <Tab label="Players" value={0}>
            <PlayerResultQuery clubs={this.state.clubs}/>
          </Tab>
          <Tab label="Club" value={1}>
            <ClubResult clubs={this.state.clubs}/>
          </Tab>
        </Tabs>
      </div>
    </div>;
  }
}