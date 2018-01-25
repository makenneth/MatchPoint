import React, { Component } from 'react';
import { connect } from 'react-redux';
import { endTutorial, disableTutorial } from 'redux/modules/tutorial';
import './styles.scss';

@connect(
  ({ tutorial }) => ({
    data: tutorial.data,
    tutorialStart: tutorial.tutorialStart,
  }),
  dispatch => ({
    dispatch,
    endTutorial: () => dispatch(endTutorial()),
    disableTutorial: () => dispatch(disableTutorial()),
  })
)
export default class Tutorial extends Component {
  /*
    Props -
      elements: [{
        selector:
        text:
      }] used by querySelectorAll();
      text: string
  */
  state = {
    currentEl: null,
    queue: [],
    idx: -1,
    highlighter: {
      top: null,
      left: null,
      width: 0,
      height: 0,
      className: '',
    },
  };

  componentDidMount() {
    window.addEventListener('resize', this.handleSize);
  }

  componentWillReceiveProps(nextProps) {
    const { data } = nextProps;
    if (this.props.data !== data && data.elements.length > 0) {
      document.querySelector('body').className = 'no-scroll';
      this.setState({
        queue: data.elements,
        currentEl: null,
        idx: -1,
      }, this.handleNext);
    }

    if (this.props.tutorialStart && !nextProps.tutorialStart) {
      document.querySelector('body').className = '';
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleSize);
  }

  handleSize = () => {
    if (!this.state.currentEl) return;
    const { currentEl: { selector } } = this.state;
    const elementToHighlight = document.querySelector(selector);
    const rect = elementToHighlight.getBoundingClientRect();
    this.setState({
      highlighter: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        className: rect.top > (window.innerHeight / 2) ? 'top' : 'bottom',
      },
    });
  }

  autoPlay = () => {
    this.int = setInterval(this.handleNext, 5000);
  }

  stopAutoPlay = () => {
    if (this.int) clearInterval(this.int);
  }

  updateTutorial = () => {
    const { eventTiming, selector, eventTarget, /* attribute, */ event } = this.state.currentEl;
    if (eventTiming === 'before') {
      const clickEvent = new MouseEvent(event, {
        view: window,
        bubbles: true,
        cancelable: false,
      });
      document.querySelector(eventTarget).dispatchEvent(clickEvent);
    }
    const elementToHighlight = document.querySelector(selector);
    if (elementToHighlight) {
      const rect = elementToHighlight.getBoundingClientRect();
      this.setState({
        highlighter: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          className: rect.top > (window.innerHeight / 2) ? 'top' : 'bottom',
        },
      }, () => {
        if (eventTiming === 'after') {
          document.querySelector(eventTarget).click();
        }
      });
    } else {
      this.handleNext();
    }
  }

  handlePrev = () => {
    const { queue, idx } = this.state;
    const { elements } = this.props.data;
    if (idx > 0) {
      this.setState({
        currentEl: elements[idx - 1],
        queue: [elements[idx], ...queue],
        idx: idx - 1,
      }, this.updateTutorial);
    }
  }

  handleNext = () => {
    const { queue, idx } = this.state;
    if (queue.length === 0) {
      this.props.endTutorial();
    } else {
      this.setState({
        currentEl: queue[0],
        queue: queue.slice(1),
        idx: idx + 1,
      }, this.updateTutorial);
    }
  }

  handleDisableTutorial = () => {
    this.props.disableTutorial();
  }

  render() {
    if (!this.props.tutorialStart) {
      return <div />;
    }

    const { idx, highlighter, currentEl } = this.state;
    const { left, top, width, height, className } = highlighter;
    return (
      <div className="tutorial-container">
        <div className="disable">
          <div
            className="button"
            onClick={this.handleDisableTutorial}
          >
            Disable Tutorial
          </div>
        </div>
        {
          left && top &&
            <div
              className="highlighter"
              style={{
                left: left - 5,
                top: top - 5,
                width: width + 10,
                height: height + 10,
              }}
            >
              <div className={`arrow ${className}`} />
              <div className={`text ${className}`}>
                {currentEl && currentEl.text}
              </div>
            </div>
        }
        <div className="buttons">
          {idx !== 0 && <div className="button" onClick={this.handlePrev}>Prev</div>}
          <div
            className="button"
            onClick={this.handleNext}
          >
            {this.props.data.elements.length > idx + 1 ? 'Next' : 'Finish'}
          </div>
          <div className="button" onClick={this.props.endTutorial}>
            Close
          </div>
        </div>
      </div>
    );
  }
}
