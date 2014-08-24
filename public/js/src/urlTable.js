/** @jsx React.DOM */
'use strict';


var React = require('react');
var socket = require('./socket')();

var URL_LENGTH = 150;
/**
 * slice url
 * @param {string} url
 * @return {*}
 */
var cat = function (url) {
    if (url.length > URL_LENGTH) {
        return url.slice(0, URL_LENGTH) + '...';
    }
    return url;
};

var UrlRow = React.createClass({
    render: function () {
        var className = this.props.item.statusCode >= 400 ? 'danger' : '';
        return (
            <tr className={className}>
                <td>{this.props.item.date}</td>
                <td>{this.props.item.method}</td>
                <td>{this.props.item.statusCode}</td>
                <td>{cat(this.props.item.url)}</td>
            </tr>
            );
    }
});

/**
 *
 * @param {HtmlElement} elem
 */
var scrollTableOnBottom = function (elem) {
    elem.scrollTop = elem.scrollHeight;
};

var UrlTable = React.createClass({

    componentDidMount: function () {
        var that = this;
        socket.on('new:url', function (item) {
            var items = that.state.items;
            items.push(item);
            that.setState({items: items});

            scrollTableOnBottom(document.getElementById(that.props.wrapper));
        });
    },
    getInitialState: function () {
        return {items: []};
    },
    render: function () {
        var rows = this.state.items.map(function (item) {
            return (<UrlRow item={item} />)
        })
        var table = (
            <table className="table table-striped table-hover">
                <thead>
                    <tr>
                        <td>method</td>
                        <td>status</td>
                        <td>url</td>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        );

        return rows.length ? table : (<h3>Pleas set proxy and press Start to inspect urls</h3>);
    }
});

module.exports = UrlTable;

