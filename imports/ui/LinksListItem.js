import { Meteor } from 'meteor/meteor';
import React from 'react';
import Modal from 'react-modal';
import Clipboard from 'clipboard';
import moment from 'moment';

export default class LinksListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      justCopied: false,
      isOpen: false
    };
  }
  componentDidMount() {
    this.clipboard = new Clipboard(this.refs.copy);

    this.clipboard.on('success', () => {
      this.setState({ justCopied: true });
      setTimeout(() => this.setState({ justCopied: false }), 1000);
    }).on('error', () => {
      alert('Unable to copy. Please manually copy the link.');
    })
  }
  componentWillUnmount() {
    this.clipboard.destroy();
  }
  onSubmit(e) {
    e.preventDefault();

    console.log(e);

    Meteor.call('links.remove', this.props._id, (err, res) => {
      if (!err) {
        this.handleModalClose();
      }
    });

    // Meteor.call('links.insert', url, (err, res) => {
    //   if (!err) {
    //     this.handleModalClose();
    //   } else {
    //     this.setState({ error: err.reason });
    //   }
    // });
  }
  handleModalClose() {
    this.setState({
      isOpen: false,
    });
  }
  renderStats() {
    const visitMessage = this.props.visitedCount === 1 ? 'visit' : 'visits';
    let visitedMessage = null;

    if (typeof this.props.lastVisitedAt === 'number') {
      visitedMessage = `(visited ${ moment(this.props.lastVisitedAt).fromNow() })`;
    }

    return <p className="item__message">{this.props.visitedCount} {visitMessage} {visitedMessage}</p>;
  }
  render() {
    return (
      <div className="item">
        <h2 className="item__url">{this.props.url}</h2>
        <p className="item__message">{this.props.shortUrl}</p>
        {this.renderStats()}

        <div className="item__actions">
          <div className="actions__wrapper">
            <a className="button button--pill button--link" href={this.props.shortUrl} target="_blank">
            Visit
            </a>
            <button className="button button--pill" ref="copy" data-clipboard-text={this.props.shortUrl}>
              {this.state.justCopied ? 'Copied' : 'Copy'}
            </button>
            <button className="button button--pill" onClick={() => {
              Meteor.call('links.setVisibility', this.props._id, !this.props.visible);
            }}>
              {this.props.visible ? 'Hide' : 'Unhide'}
            </button>
          </div>

          <i className="fas fa-trash item__remove" onClick={() => this.setState({isOpen: true})}></i>
        </div>

        <Modal
          isOpen={this.state.isOpen}
          contentLabel="Remove link"
          onRequestClose={this.handleModalClose.bind(this)}
          className="boxed-view__box"
          overlayClassName="boxed-view boxed-view--modal">
          <h1>Removing</h1>
          <form onSubmit={this.onSubmit.bind(this)} className="boxed-view__form">
              <p className="remove__text">You are about to remove following link:</p>
              <p className="remove__link"><strong>{this.props.url}</strong></p>
              <button className="button">Remove</button>
              <button type="button" className="button button--secondary" onClick={this.handleModalClose.bind(this)}>Cancel</button>
          </form>
        </Modal>
      </div>
    );
  }
};

LinksListItem.propTypes = {
  _id: React.PropTypes.string.isRequired,
  url: React.PropTypes.string.isRequired,
  userId: React.PropTypes.string.isRequired,
  visible: React.PropTypes.bool.isRequired,
  shortUrl: React.PropTypes.string.isRequired,
  visitedCount: React.PropTypes.number.isRequired,
  lastVisitedAt: React.PropTypes.number
};
