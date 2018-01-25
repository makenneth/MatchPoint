// import { TEST_DATA_PARTICIPANTS, RESTORE_STATE } from 'redux/modules/newSession';

const tutorialElements = {
  registration: {
    /* mockActions: {
      setup: [
        {
          type: TEST_DATA_PARTICIPANTS,
          payload: {
            1: {
              _id: 1,
              name: 'Thyra Wade',
              rating: 1250,
            },
            2: {
              _id: 2,
              name: 'Oscar Huff',
              rating: 1600,
            },
            3: {
              _id: 3,
              name: 'Hadley Wallis',
              rating: 1210,
            },
            4: {
              _id: 4,
              name: 'Fionntan Chase',
              rating: 1130,
            },
            5: {
              _id: 5,
              name: 'Brenton Watson',
              rating: 1090,
            },
            6: {
              _id: 6,
              name: 'Andrey Stern',
              rating: 1270,
            },
            7: {
              _id: 7,
              name: 'Harvey Hagebak',
              rating: 1503,
            },
          },
        },
      ],
      cleanup: [
        {
          type: RESTORE_STATE,
        },
      ],
    }, */
    elements: [
      {
        selector: '.registration-tab',
        text: 'This is where you would add players to the roster.',
      },
      {
        selector: '.session-date-picker > div',
        text: 'You can select the date of the session here.',
      },
      {
        selector: '.new-player-button',
        text: 'You can add new players.',
      },
      {
        selector: '.upload-player-button',
        text: 'You can mass upload players.',
      },
      {
        selector: '.table-search-field',
        text: 'You can search for players here.',
      },
      {
        selector: '.grouping-tab',
        text: 'After you are done with this screen, move on to this tab.',
      },
    ],
  },
  grouping: {
    elements: [
      {
        selector: '#select-schema-field',
        text: 'This is where you select the desired group arrangement.',
      },
      // {
      //   selector: '.participant-group-tables',
      //   text: 'These are the arranged groups.',
      // },
      {
        // selector: 'div',
        // attribute: {
        //   zIndex: 2100,
        // },
        // event: 'touchend',
        selector: '.group-menu-icon',
        // eventTiming: 'before',
        text: 'This is where you can print out schedules and save the session.',
      },
    ],
  },
};


export default tutorialElements;
