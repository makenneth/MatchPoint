import React from 'react';
import { RecordTableView } from 'components';

const ClubQueryDetail = (props) => {
  if (!props._id) {
    return (<div style={{ marginTop: '20px' }}>
      Please select a date...
    </div>);
  }
  if (!props.finalized) {
    return (<div style={{ marginTop: '20px' }}>
      The results have not been posted yet...
    </div>);
  }
  let countedPlayers = 0;
  return (<div style={{ overflow: 'scroll', marginTop: '20px' }}>
    {
      props.selectedSchema.map((sizeOfGroup, i) => {
        countedPlayers += +sizeOfGroup;
        return (
          <RecordTableView
            key={i}
            groupNum={i + 1}
            start={countedPlayers - sizeOfGroup}
            finalized={props.finalized}
            scoreChange={props.scoreChange[i] || []}
            joinedPlayers={props.players}
            sizeOfGroup={+sizeOfGroup}
          />
        );
      })
    }
  </div>);
};

export default ClubQueryDetail;
