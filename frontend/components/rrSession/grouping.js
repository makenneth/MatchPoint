import React from 'react'
import ParticipantGroup from './participantGroup'
import { findSchemata } from "../../methods/findSchema"
import { generatePDF, fetchPDFLinks } from "../../actions/clientActions"
import PDFStore from "../../stores/pdfStore"


class Grouping extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          schemata: [],
          rangeOfPlayers: [6, 5, 4],
          selectedGroup: [],
          pdfs: null
        }
    }   
    componentWillMount() {
      let schemata = findSchemata(this.props.numPlayers, this.state.rangeOfPlayers),
          pdfs = PDFStore.getPDF();
      this.pListener = PDFStore.addListener(this._fetchedPDF);
      this.setState({ 
        schemata: schemata || [],
        selectedGroup: schemata.length ? schemata[0] : "",
        pdfs
      })
      if (!pdfs){
        fetchPDFLinks();
      }
    }
    componentWillUnmount() {
     this.pListener.remove(); 
    }
    _fetchedPDF = () => {
      this.setState({pdfs: PDFStore.getPDF()})
    }
    schemata() {
      if (this.state.schemata.length){
        return <select value="" 
                       onChange={this.changeSchema}>Select the grouping schema:
          <option value=""></option>;
          {
            this.state.schemata.map( (schema, i)=>{
              return <option key={schema} value={schema}>{schema.join(", ")}</option>;
            })
          }
        </select>;
      } else {
        return <p>Nothing is available...<br />Try selecting more players..</p>;
      }
    }

    changeSchema = (e) => {
      this.totalPlayerAdded = 0;
      this.setState({ selectedGroup: e.target.value.split(",") }); 
    }
    generatePDF = () => {
      generatePDF(this.props.addedPlayers, this.state.selectedGroup);
    }
    changeNumOfPlayers = (index, num, _) => {
      let selectedGroup = this.state.selectedGroup.slice();
      selectedGroup[index] = num;
      this.setState({ selectedGroup });
    }

    render() {
      this.totalPlayerAdded = 0;
      return <div className="grouping">
        <button className="create-pdf" 
                onClick={ this.generatePDF }>Create PDF</button>
        <button className="save-session"
                onClick={this.props.saveSession.bind(null, 
                  this.state.schemata, this.state.rangeOfPlayer, 
                  this.state.selectedGroup)}>Save</button>
        { this.schemata() }
        { 
           this.state.selectedGroup.map((numPlayers, i) => {
              this.totalPlayerAdded += +numPlayers;
              return <ParticipantGroup key={i + "" + numPlayers} groupId={i}
                        numPlayers={numPlayers}
                        changeNumOfPlayers={() => this.changeNumOfPlayers(i)}
                        players={this.props.addedPlayers.slice(
                          this.totalPlayerAdded - numPlayers, this.totalPlayerAdded
                          )}
                      />;
           })
        }
      </div>;
    }
}

export default Grouping;
