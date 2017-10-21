import React, { Component } from 'react';
import { RecordTableView, RecordTableEnter } from 'components';
import { Tabs, Tab } from 'material-ui/Tabs';
import RaisedButton from 'material-ui/RaisedButton';

class ViewRecordTable extends Component {
  state = {
    tab: 0,
  };

  changeTab = (tab) => {
    this.setState({ tab });
  }

  render() {
    const editable = false;
    return (<div style={{ overflow: 'auto' }}>
      <Tabs
        value={this.state.tab}
        onChange={this.changeTab}
        tabItemContainerStyle={{ backgroundColor: 'white' }}
        contentContainerStyle={{
          padding: '20px',
          overflow: 'auto',
        }}
      >
        <Tab label="Enter Result" value={0} className="tab-menu-tab">
          {editable && <RaisedButton
            backgroundColor="#E64A19"
            labelColor="white"
            label="Calculate Score"
            onTouchTap={this.handleCalculate}
          />}
          <RecordTableEnter
            {...this.props}
            results={this.props.results}
            updateResult={this.updateResult}
            editable={!editable}
          />
        </Tab>
        <Tab label="View Result" value={1} className="tab-menu-tab">
          <RecordTableView
            {...this.props}
            result={this.props.results}
          />
        </Tab>
      </Tabs>
    </div>);
  }
};

export default ViewRecordTable;
