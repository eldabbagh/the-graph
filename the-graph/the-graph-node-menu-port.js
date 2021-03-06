(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;


  TheGraph.NodeMenuPort = React.createClass({
    componentDidMount: function () {
      this.getDOMNode().addEventListener("pointerup", this.edgeStart);
    },
    edgeStart: function (event) {
      // Don't tap graph
      event.stopPropagation();

      var port = {
        process: this.props.processKey,
        port: this.props.label,
        type: this.props.port.type
      };

      var edgeStartEvent = new CustomEvent('the-graph-edge-start', { 
        detail: {
          isIn: this.props.isIn,
          port: port,
          route: this.props.route
        },
        bubbles: true
      });
      this.getDOMNode().dispatchEvent(edgeStartEvent);
    },
    render: function() {
      var labelLen = this.props.label.length;
      var bgWidth = (labelLen>12 ? labelLen*8+40 : 120);
      // Highlight compatible port
      var highlightPort = this.props.highlightPort;
      var highlight = (highlightPort && highlightPort.isIn === this.props.isIn && highlightPort.type === this.props.port.type);
      return (
        React.DOM.g(
          {
            className: "context-port click context-port-"+(this.props.isIn ? "in" : "out")
          },
          React.DOM.rect({
            className: "context-port-bg"+(highlight ? " highlight" : ""),
            rx: TheGraph.nodeRadius,
            ry: TheGraph.nodeRadius,
            x: this.props.x + (this.props.isIn ? -bgWidth : 0),
            y: this.props.y - TheGraph.contextPortSize/2,
            width: bgWidth,
            height: TheGraph.contextPortSize-1
          }),
          React.DOM.circle({
            className: "context-port-hole stroke route"+this.props.route,
            cx: this.props.x,
            cy: this.props.y,
            r: 10
          }),
          React.DOM.text({
            className: "context-port-label fill route"+this.props.route,
            x: this.props.x + (this.props.isIn ? -20 : 20),
            y: this.props.y,
            children: this.props.label.replace(/(.*)\/(.*)(_.*)\.(.*)/, '$2.$4')
          })
        )
      );
    }
  });


})(this);
