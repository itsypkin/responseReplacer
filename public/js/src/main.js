/** @jsx React.DOM */
'use strict';

var React = require('react');
var UrlTable = require('./urlTable');
var ControlPanel = require('./controlPanel');


React.renderComponent(
    <UrlTable wrapper='url-table'/>,
    document.getElementById('url-table')
);


React.renderComponent(
    <ControlPanel/>,
    document.getElementById('control-panel')
);
