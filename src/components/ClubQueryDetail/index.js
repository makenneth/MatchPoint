import React from 'react';
import { RecordTableContainer } from 'containers';

const ClubQueryDetail = (props) => {
  let err;
  if (!props.clubSelected) {
    err = 'Please select a club...';
  } else if (!props.resultsAvailable) {
    err = 'The club has never posted any results.';
  } else if (!props.roundrobin) {
    err = 'Please select a date...';
  }

  if (err) {
    return (<div style={{ marginTop: '40px' }}>
      {err}
    </div>);
  }
  const {
    players, results, ratingChange,
    ratingChangeDetail, finalized,
    selected_schema: selectedSchema,
    sortedPlayerList,
  } = props.roundrobin;
  let countedPlayers = 0;
  return (<div style={{ overflow: 'scroll', marginTop: '40px' }}>
    {
      selectedSchema.map((sizeOfGroup, i) => {
        const joinedPlayers = players.slice(
          countedPlayers,
          countedPlayers + sizeOfGroup
        );
        countedPlayers += +sizeOfGroup;
        return (<RecordTableContainer
          key={i}
          editable={Boolean(false)}
          groupNum={i + 1}
          finalized={finalized}
          joinedPlayers={joinedPlayers}
          sizeOfGroup={+sizeOfGroup}
          results={results}
          ratingChange={ratingChange}
          ratingChangeDetail={ratingChangeDetail}
          sortedPlayerList={sortedPlayerList[i]}
        />);
      })
    }
  </div>);
};

export default ClubQueryDetail;
