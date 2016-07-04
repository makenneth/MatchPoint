import React from 'react'
import RRSessionStore from "../../stores/rrSessionStore"
import CSRFStore from "../../stores/csrfStore"
import ClubActions from "../../actions/clubActions"
import rrSessionActions from "../../actions/rrSessionActions"
import moment from 'moment'
import RecordTable from "./RecordTable"
import { browserHistory } from "react-router"

class RoundRobinSession extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = 'RoundRobinSession';
        this.state = {
          session: RRSessionStore.find(this.props.params.id) || null,
          scoreChange: [],
          _csrf: null
        }
    }

    componentDidMount() {
      this.rrsListener = RRSessionStore.addListener(this.setRRSession);
      this.csrfListener = CSRFStore.addListener(this._fetchedCSRF);
      if (!this.state.session){
        rrSessionActions.fetchSession(this.props.params.id);
      } else {
        this.setRRSession();
      }
    }
    _fetchedCSRF = () => {
      this.setState({ _csrf: CSRFStore.getCSRF() });
    }
    shouldComponentUpdate(nextProps, nextState) {
      if (nextState._csrf !== null && this.state._csrf === null){
        return false;
      } else {
        return true;
      }
    }
    updateScore = (scoreChangeInGroup, i) => {
      var scoreChange = this.state.scoreChange;
      scoreChange[i] = scoreChangeInGroup;
      this.setState({scoreChange: scoreChange});
    }

    setRRSession = () => {
      var curSession = this.state.session || RRSessionStore.find(this.props.params.id),
          schema = curSession.selectedSchema,
          scoreChange = curSession.results.length ? curSession.results : this.setUpChangeArray(schema);
      this.setState({
        session: curSession,
        scoreChange: scoreChange
      });
      ClubActions.fetchCSRF();
    }

    componentWillReceiveProps(nextProps) {
      RRSessionStore.fetchSsession(nextProps.params.id);
    }
    setTab = (tabNumber) => {
      this.setState({ currentTab: tabNumber})
    }
    componentWillUnmount() {
      if (this.rrListener) this.rrsListener.remove();
      if (this.csrfListener) this.csrfListener.remove();
    }

    setUpChangeArray(selectedSchema) {
      return [...Array(selectedSchema.length)];
    }

    saveSession = () => {
      if (!this.state.session) {
        browserHistory.push("/");
      } else if (!this.state._csrf) {
        forceUpdate();
      } else {
        rrSessionActions.updateSession(
          this.state.scoreChange, this.state._csrf, this.state.session._id
        )
      }
    }

    render() {
        var { session, scoreChange } = this.state;

        var selectedSchema = session.selectedSchema,
            schemata = session.schemata,  
            numOfPlayers = session.numOfPlayers,
            clubId = session._clubId,
            joinedPlayers = session.players;

        var countedPlayers = 0;
        return <div>
          <h1>Session Date: { moment(session.date).format("YYYY/MM/DD") }</h1>
            {
              selectedSchema.map ( (sizeOfGroup, i) => {
                countedPlayers += sizeOfGroup;
                return (
                    <RecordTable key={i} groupNum={i + 1} 
                     start={countedPlayers - sizeOfGroup}
                     joinedPlayers={joinedPlayers} sizeOfGroup={+sizeOfGroup} 
                     updateScore={this.updateScore} 
                     scoreChange={scoreChange.length ? scoreChange[i] : []}
                     saveSession={this.saveSession} />
                )
                })
            }
        </div>;
    }
}
export default RoundRobinSession;

