import Scheduler from 'utils/Scheduler';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default class PDFGenerator {
  constructor(clubName, players, schema, numOfPlayers, date) {
    this.clubName = clubName;
    this.players = players.playerList;
    this.schema = schema;
    this.numOfPlayers = numOfPlayers;
    this.date = date;
  }

  static link() {
    return {
      text: 'Check your result at https://matchpoints.org/results',
      alignment: 'center',
      color: 'red',
      margin: [0, 3],
    };
  }

  static scheduleTableSkeleton(body, numOfPlayers, isNotFirstChild) {
    return {
      width: 'auto',
      table: {
        headerRows: 1,
        widths: ['auto'],
        body: [
          [{
            text: `${numOfPlayers} Players`,
            fontSize: 18,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 5],
          }],
          ...body,
        ],
      },
      margin: [(isNotFirstChild ? 5 : 0), 0, 0, 0],
      layout: {
        hLineWidth: () => {
          return 0;
        },
        vLineWidth: () => {
          return 2;
        },
      },
    };
  }

  static scheduleTable(numOfPlayers) {
    const schedule = Scheduler.findSchedule(numOfPlayers);
    const columns = [];

    let body = [];
    schedule.forEach((match, i) => {
      if (i === 12) {
        columns.push(PDFGenerator.scheduleTableSkeleton(body, numOfPlayers, columns.length > 0));
        body = [];
      }

      if (i % Math.floor(numOfPlayers / 2) === 0 && i) {
        body.push([{
          text: match,
          fontSize: 18,
          alignment: 'center',
          margin: [0, 5, 0, 0],
        }]);
      } else {
        body.push([{ text: match, fontSize: 18, alignment: 'center' }]);
      }
    });

    if (body.length > 0) {
      columns.push(PDFGenerator.scheduleTableSkeleton(body, numOfPlayers, columns.length > 0));
    }
    return columns;
  }

  static scoreBoxes(numOfPlayers) {
    return Array.from(new Array(numOfPlayers + 1), (_, i) => i)
      .slice(2).map((i) => {
        return {
          columns: Array.from(new Array(i - 1), () => null).map((_, j) => PDFGenerator.scoreBox(`${j + 1} vs ${i}`, numOfPlayers)),
          margin: [0, 1],
        };
      });
  }

  static scoreBox(text, numOfPlayers) {
    return {
      stack: [
        {
          table: {
            headerRows: 0,
            body: [
              [{ text, bold: true, alignment: 'center', fontSize: 16 }],
            ],
            widths: ['*'],
          },
        },
        {
          table: {
            headerRows: 0,
            body: [
              [{ text: '', margin: [0, 15] }, { text: '', margin: [0, 15] }],
            ],
            widths: ['*', '*'],
          },
        },
      ],
      width: numOfPlayers === 7 ? 90 : 100,
      margin: [1, 0],
    };
  }

  header(num, pageBreak = false) {
    const header = {
      columns: [
        {
          width: 'auto',
          fontSize: 18,
          text: this.date,
        },
        {
          width: '*',
          fontSize: 28,
          bold: true,
          alignment: 'center',
          text: this.clubName,
        },
        {
          width: 'auto',
          fontSize: 18,
          text: `Group ${num + 1}`,
        },
      ],
    };

    if (pageBreak) {
      header.pageBreak = 'before';
    }

    return header;
  }

  body(groupNum, numOfPlayers) {
    return {
      columns: [
        this.playerList(groupNum, numOfPlayers),
        ...PDFGenerator.scheduleTable(numOfPlayers),
      ],
      margin: [
        0,
        numOfPlayers > 4 ? 15 : 35,
        0,
        numOfPlayers > 4 ? 275 - (numOfPlayers * 50) : 450 - (numOfPlayers * 50),
      ],
    };
  }

  playerList(groupNum, num) {
    return {
      width: '*',
      ol: this.players[groupNum].map(player => {
        return {
          columns: [
            {
              width: 'auto',
              text: player.name,
              bold: true,
              fontSize: 26,
            },
            {
              width: 'auto',
              text: player.rating,
              fontSize: 26,
            },
          ],
          columnGap: 7,
          margin: [0, num === 7 ? 3 : 7],
        };
      }),
      fontSize: 26,
    };
  }

  generate() {
    const content = [];
    this.schema.forEach((num, i) => {
      content.push(this.header(i, i !== 0));
      content.push(PDFGenerator.link());
      content.push(this.body(i, num));
      content.push(PDFGenerator.scoreBoxes(num));
    });

    const docDefinition = {
      pageSize: 'LETTER',
      content,
    };

    pdfMake.createPdf(docDefinition).download();
  }
}
