/** @jsx React.DOM */
'use strict';
var socket = require('./socket')();
var React = require('react');

var ControlPanel = React.createClass({
    getInitialState: function () {
        return {started: false};
    },
    handleStartClick: function () {
        this.setState({started: true});
        socket.emit('start');
    },
    handleStopClick: function () {
        this.setState({started: false});
        socket.emit('stop');
    },
    handleRefreshClick: function () {
        console.log('click refresh', this);
    },
    render: function () {
        var startButtonState = this.state.started ? 'disabled' : '';
        var stopButtonState = this.state.started ? '' : 'disabled';

        return (
            <div className="nav btn-toolbar control-panel" role="toolbar">
                <button className="btn btn-default" onClick={this.handleStartClick} disabled={startButtonState}>
                    <span className="glyphicon glyphicon-play"></span> Start
                </button>
                <button className="btn btn-default" onClick={this.handleStopClick} disabled={stopButtonState}>
                    <span className="glyphicon glyphicon-stop"></span> Stop
                </button>
                <button className="btn btn-default" onClick={this.handleRefreshClick}>
                    <span className="glyphicon glyphicon-refresh"></span> Refresh
                </button>
            </div>
        );
    }

});

module.exports = ControlPanel;