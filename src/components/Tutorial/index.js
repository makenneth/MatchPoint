import React, { Component } from 'react';
import { connect } from 'react-redux';
import { endTutorial, disableTutorial } from 'redux/modules/tutorial';
import './styles.scss';

@connect(({ tutorial }) => ({ tutorial }),  { endTutorial, disableTutorial })
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
    queue: this.props.elements,
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
    this.handleNext();
  }

  autoPlay = () => {
    this.int = setInterval(this.handleNext, 5000);
  }

  stopAutoPlay = () => {
    if (this.int) clearInterval(this.int);
  }

  updateTutorial = () => {
    const el = this.state.currentEl;
    const rect = document.querySelector(el.selector).getBoundingClientRect();
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

  handlePrev = () => {
    const { queue, idx } = this.state;
    const { elements } = this.props;
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
    const { idx, highlighter, currentEl } = this.state;
    const { left, top, width, height, className } = highlighter;
    return (
      <div className="tutorial-container">
        {
          left && top &&
            <div
              className="highlighter"
              style={{
                left,
                top,
                width,
                height,
              }}
            >
              <div className={`arrow ${className}`} />
              <div className={`text ${className}`}>
                {currentEl.text}
              </div>
            </div>
        }
        <div className="buttons">
          {idx !== 0 && <div className="button" onClick={this.handlePrev}>Prev</div>}
          <div
            className="button"
            onClick={this.handleNext}>
            {this.props.elements.length > idx + 1 ? 'Next' : 'Finish'}
          </div>
        </div>
      </div>
    );
  }
}
