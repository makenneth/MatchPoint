import React, { Component, PropTypes } from "react";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import IconMenu from "material-ui/IconMenu";
import IconButton from "material-ui/IconButton/IconButton";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import SnackBar from "material-ui/Snackbar";
import FlatButton from "material-ui/FlatButton";
import Dialog from "material-ui/Dialog";
import CircularProgress from "material-ui/CircularProgress";
import ParticipantGroup from "./participantGroup";
import findSchemata from "../../../methods/findSchema";
import { generatePDF } from "../../../actions/clientActions";
import PDFStore from "../../../stores/pdfStore";

const rangeOfPlayers = [3, 4, 5, 6, 7];

class Grouping extends Component {
  static propTypes = {
    club: PropTypes.object,
    date: PropTypes.string,
    addedPlayers: PropTypes.array,
    saveSession: PropTypes.func,
    cached: PropTypes.bool,
    numPlayers: PropTypes.number,
    temporarilySaveSession: PropTypes.func
  }
  constructor(props) {
    super(props);
    this.state = {
      schemata: [[]],
      max: null,
      min: null,
      selectedGroup: [],
      pdfs: null,
      generated: false,
      stepIndex: 0,
      open: false,
      dialogOpen: false,
      loading: false
    };
  }

  componentWillMount() {
    this.pListener = PDFStore.addListener(this.fetchedPDF);
    this.int = setInterval(this.tempSave, 60000);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.cached !== nextProps.cached) {
      const schemata = (function parseSchemata(s) {
        if (s) {
          if (typeof s === "string" ||
            typeof s === "number") {
            return [+s];
          }

          return s.map(arr => arr.map(el => +el));
        }

        return [[]];
      }());
      this.setState({
        schemata,
        selectedGroup: nextProps.selectedGroup ? nextProps.selectedGroup.map(el => +el) : [],
        pdfs: nextProps.pdfs === "" ? null : nextProps.pdfs,
        min: nextProps.min ? +nextProps.min : null,
        max: nextProps.max ? +nextProps.max : null
      });
    }
    if (this.props.addedPlayers.length !== nextProps.addedPlayers.length) {
      if (this.state.min && this.state.max) {
        this.setState({
          selectedGroup: []
        });
        this.updateSchema(this.state.min, this.state.max);
      }
    }
  }

  componentWillUnmount() {
    this.pListener.remove();
    clearInterval(this.int);
  }
  tempSave = () => {
    this.props.temporarilySaveSession(
      this.state.min,
      this.state.max,
      this.state.schemata,
      this.state.selectedGroup,
      this.state.pdfs
    );
  }
  handleOpen() {
    this.setState({ open: true });
  }
  handleClose = () => {
    this.setState({ open: false });
  }
  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  }
  fetchedPDF = () => {
    const error = PDFStore.getError();
    if (error) {
      this.error = error;
      this.setState({ loading: false });
      this.handleOpen();
    } else {
      this.setState({ pdfs: PDFStore.getPDF(), loading: false });
    }
  }
  updateSchema = (min, max) => {
    process.nextTick(() => {
      const numPlayers = this.props.numPlayers;
      const range = [];
      for (let i = max; i >= min; i--) {
        range.push(i);
      }
      const schemata = findSchemata(numPlayers, range);
      this.setState({
        schemata: schemata.length ? schemata : [[]]
      });
    });
  }
  handleChange = (field, e, idx, value) => {
    if (value) {
      let { min, max } = this.state;
      this.setState({ [field]: value });
      if (field === "min") {
        min = value;
      } else {
        max = value;
      }
      if (min && max) {
        this.updateSchema(min, max);
      }
    }
  }
  schemata() {
    const schemata = this.state.schemata;
    const floatingStyle = {
      zIndex: this.state.selectedGroup.length ? "auto" : 999,
      color: this.state.selectedGroup.length ? "#E0E0E0" : "orange"
    };
/*        style={{ zIndex: !max ? 999 : "auto" }}
        floatingLabelStyle={ maxFloatingStyle }
        errorText={!max ? "Maximum number of players you want to allow" : ""}
        errorStyle={{color: "orange"}}*/
    if (schemata.length) {
      return (<div>
        <SelectField
          value={this.state.selectedGroup.join(",")}
          onChange={this.changeSchema}
          floatingLabelStyle={ floatingStyle }
          floatingLabelText="Select a schema"
          floatingLabelFixed={Boolean(true)}
          style={{ zIndex: this.state.selectedGroup.length ? "auto" : 999 }}
          errorText={this.state.selectedGroup.length ? "" : "Select an arrangement"}
          errorStyle={{color: "orange"}}
        >
          {
            schemata ?
              schemata.map(schema => (
                <MenuItem
                  key={schema}
                  value={schema.join(",")}
                  primaryText={schema.join(", ")}
                />
              ))
              :
              <MenuItem key={"noth"} disabled={Boolean(true)} primaryText="No Available Schemas..." />
          }
        </SelectField>
      </div>);
    }
    return null;
  }
  numOfPlayers() {
    const { min, max } = this.state;
    const minFloatingStyle = {
      zIndex: max && !min ? 999 : "auto",
      color: max && !min ? "orange" : "#E0E0E0"
    };
    const maxFloatingStyle = {
      zIndex: max ? "auto" : 999,
      color: max ? "#E0E0E0" : "orange"
    };
    return (<div className="min-max">
      <SelectField
        value={max}
        style={{ zIndex: !max ? 999 : "auto" }}
        floatingLabelStyle={ maxFloatingStyle }
        errorText={!max ? "Maximum number of players you want to allow" : ""}
        errorStyle={{color: "orange"}}
        floatingLabelFixed={Boolean(true)}
        floatingLabelText="Max Players"
        onChange={(e, idx, val) => this.handleChange("max", e, idx, val)}
      >
        {
          rangeOfPlayers.map(num => (
            <MenuItem key={num} value={num} primaryText={num} disabled={num < min} />
          ))
        }
      </SelectField>
      <SelectField
        value={min}
        style={{ zIndex: max && !min ? 999 : "auto" }}
        floatingLabelStyle={ minFloatingStyle }
        errorStyle={{color: "orange"}}
        errorText={max && !min ? "Minimum number of players you want to allow" : ""}
        floatingLabelFixed={Boolean(true)}
        floatingLabelText="Min Players"
        onChange={(e, idx, val) => this.handleChange("min", e, idx, val)}
      >
        {
          rangeOfPlayers.map(num => (
            <MenuItem key={num} value={num} primaryText={num} disabled={num > max} />
          ))
        }
      </SelectField>
    </div>);
  }
  changeSchema = (e, _, selectedGroup) => {
    if (selectedGroup) {
      this.totalPlayerAdded = 0;
      this.setState({ selectedGroup: selectedGroup.split(",").map(el => +el) });
    }
  }
  generatePDF = () => {
    if (this.state.generated) {
      this.title = "Whooops..";
      this.content = "You may only generate once every 30secs.";
      this.setState({ dialogOpen: true });
      return;
    }
    if (!this.state.schemata[0].length) {
      this.title = "Oooops..";
      this.content = "There are no players yet :(.";
      this.setState({ dialogOpen: true });
      return;
    }
    generatePDF(
      this.props.addedPlayers,
      this.state.selectedGroup,
      this.props.club,
      this.props.date);

    this.setState({ generated: true, loading: true });
    setTimeout(() => {
      this.setState({ generated: false });
    }, 30000);
  }

  handleSave = () => {
    if (!this.state.selectedGroup.length) {
      this.title = "Well....";
      this.content = "You have to have selected a schema before you can save.";
      this.setState({ dialogOpen: true });
    } else {
      this.setState({ loading: true });
      this.props.saveSession(
        this.state.schemata,
        this.state.selectedGroup,
        this.props.addedPlayers
      );
    }
  }
  download = (link) => {
    try {
      window.open(`/api/pdfs/download/${link}`);
    } catch (e) {
      console.log(e);
    }
  }
  moveUp = (group) => {
    if (group === 0) return;
    const selectedGroup = this.state.selectedGroup.slice();
    selectedGroup[group - 1] += 1;
    selectedGroup[group] -= 1;
    this.setState({ selectedGroup });
  }
  moveDown = (group) => {
    const selectedGroup = this.state.selectedGroup.slice();
    if (group === selectedGroup.length - 1) return;
    selectedGroup[group + 1] += 1;
    selectedGroup[group] -= 1;
    this.setState({ selectedGroup });
  }
  groupTables() {
    const pdfs = this.state.pdfs;
    return (<div>
      {
        this.state.selectedGroup.map((numPlayers, i, arr) => {
          this.totalPlayerAdded += +numPlayers;
          return (<ParticipantGroup
            key={`${i}${numPlayers}`} groupId={i}
            pdfDownload={!pdfs ? () => {} : this.download.bind(this, pdfs[`group${(i + 1)}`])}
            pdfs={!!pdfs}
            numPlayers={numPlayers}
            players={this.props.addedPlayers.slice(
              this.totalPlayerAdded - numPlayers, this.totalPlayerAdded
              )}
            moveUp={i === 0 ? null : this.moveUp}
            moveDown={i === arr.length - 1 ? null : this.moveDown}
          />);
        })
      }
    </div>);
  }

  dialog() {
    const actions = [
      <FlatButton
        label="Close"
        primary={Boolean(true)}
        onTouchTap={this.handleDialogClose}
      />
    ];
    return (<Dialog
      title={this.title}
      actions={actions}
      open={this.state.dialogOpen}
      modal={false}
      onRequestClose={this.handleDialogClose}
    >
      {this.content}
    </Dialog>);
  }
  render() {
    let schemata;
    let groupTables;

    if (this.state.max && this.state.min) {
      schemata = this.schemata();
      if (this.state.selectedGroup.length) {
        groupTables = this.groupTables();
      }
    }
    this.totalPlayerAdded = 0;

    return (<div className="grouping">
      <IconMenu
        style={{
          position: "absolute",
          right: 0,
          top: "-20px",
          zIndex: "50"
        }}
        iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
        targetOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <MenuItem
          primaryText="Generate PDF"
          onClick={this.generatePDF}
          disabled={this.state.generated || !this.state.selectedGroup.length}
        />
        <MenuItem
          primaryText="Save"
          onClick={this.handleSave}
          disabled={!this.state.selectedGroup.length}
        />
      </IconMenu>
      {this.numOfPlayers()}
      {schemata}
      {groupTables}
      <SnackBar
        open={this.state.open}
        onRequestClose={this.handleClose}
        message={this.error || ""}
        autoHideDuration={8000}
      />
      {
        this.state.loading &&
          <div className="overlay">
            <div className="loading">
              <CircularProgress size={2} />
            </div>
          </div>
      }
      {this.state.dialog && this.dialog()}
    </div>);
  }
}


export default Grouping;
