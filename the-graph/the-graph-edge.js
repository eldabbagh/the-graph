(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;

  // Const
  var CURVE = TheGraph.nodeSize;

  // Point along cubic bezier curve
  // See http://en.wikipedia.org/wiki/File:Bezier_3_big.gif
  var findPointOnCubicBezier = function (p, sx, sy, c1x, c1y, c2x, c2y, ex, ey) {
    // p is percentage from 0 to 1
    var op = 1 - t;
    // 3 green points between 4 points that define curve
    var g1x = sx * p + c1x * op;
    var g1y = sy * p + c1y * op;
    var g2x = c1x * p + c2x * op;
    var g2y = c1y * p + c2y * op;
    var g3x = c2x * p + ex * op;
    var g3y = c2y * p + ey * op;
    // 2 blue points between green points
    var b1x = g1x * p + g2x * op;
    var b1y = g1y * p + g2y * op;
    var b2x = g2x * p + g3x * op;
    var b2y = g2y * p + g3y * op;
    // Point on the curve between blue points
    var x = b1x * p + b2x * op;
    var y = b1y * p + b2y * op;
    return [x, y];    
  };


  // Edge view

  TheGraph.Edge = React.createClass({
    mixins: [
      TheGraph.mixins.Tooltip
    ],
    componentWillMount: function() {
    },
    componentDidMount: function () {
      var domNode = this.getDOMNode();

      // Dragging
      domNode.addEventListener("trackstart", this.dontPan);

      if (this.props.onEdgeSelection) {
        // Needs to be click (not tap) to get event.shiftKey
        domNode.addEventListener("tap", this.onEdgeSelection);
      }

      // Context menu
      if (this.props.showContext) {
        domNode.addEventListener("contextmenu", this.showContext);
        domNode.addEventListener("hold", this.showContext);
      }
    },
    dontPan: function (event) {
      // Don't drag under menu
      if (this.props.app.menuShown) { 
        event.stopPropagation();
      }
    },
    onEdgeSelection: function (event) {
      // Don't click app
      event.stopPropagation();

      var toggle = (TheGraph.metaKeyPressed || event.pointerType==="touch");
      this.props.onEdgeSelection(this.props.key, this.props.edge, toggle);
    },
    showContext: function (event) {
      // Don't show native context menu
      event.preventDefault();

      var x = event.clientX;
      var y = event.clientY;

      // App.showContext
      this.props.showContext({
        element: this,
        type: (this.props.export ? (this.props.isIn ? "graphInport" : "graphOutport") : "edge"),
        x: x,
        y: y,
        graph: this.props.graph,
        itemKey: (this.props.export ? this.props.exportKey : null),
        item: (this.props.export ? this.props.export : this.props.edge)
      });

    },
    getContext: function (menu, options, hide) {
      return TheGraph.Menu({
        menu: menu,
        options: options,
        triggerHideContext: hide,
        label: this.props.label,
        iconColor: this.props.route
      });
    },
    shouldComponentUpdate: function (nextProps, nextState) {
      // Only rerender if changed
      return (
        nextProps.sX !== this.props.sX || 
        nextProps.sY !== this.props.sY ||
        nextProps.tX !== this.props.tX || 
        nextProps.tY !== this.props.tY ||
        nextProps.selected !== this.props.selected ||
        nextProps.animated !== this.props.animated ||
        nextProps.route !== this.props.route
      );
    },
    getTooltipTrigger: function () {
      return this.refs.touch.getDOMNode();
    },
    shouldShowTooltip: function () {
      return true;
    },
    componentDidUpdate: function (prevProps, prevState) {
      // HACK to change SVG class https://github.com/facebook/react/issues/1139
      var groupClass = "edge"+
        (this.props.selected ? " selected" : "")+
        (this.props.animated ? " animated" : "");
      this.getDOMNode().setAttribute("class", groupClass);
      var fgClass = "edge-fg stroke route"+this.props.route;
      this.refs.route.getDOMNode().setAttribute("class", fgClass);
    },
    render: function () {
      var sourceX = this.props.sX;
      var sourceY = this.props.sY;
      var targetX = this.props.tX;
      var targetY = this.props.tY;

      // Organic / curved edge
      var c1X, c1Y, c2X, c2Y;
      if (targetX-5 < sourceX) {
        if (Math.abs(targetY-sourceY) < TheGraph.nodeSize/2) {
          // Loopback
          c1X = sourceX + CURVE;
          c1Y = sourceY - CURVE;
          c2X = targetX - CURVE;
          c2Y = targetY - CURVE;
        } else {
          // Stick out some
          c1X = sourceX + CURVE;
          c1Y = sourceY + (targetY > sourceY ? CURVE : -CURVE);
          c2X = targetX - CURVE;
          c2Y = targetY + (targetY > sourceY ? -CURVE : CURVE);
        }
      } else {
        // Controls halfway between
        c1X = sourceX + (targetX - sourceX)/2;
        c1Y = sourceY;
        c2X = c1X;
        c2Y = targetY;
      }

      var path = [
        "M",
        sourceX, sourceY,
        "C",
        c1X, c1Y,
        c2X, c2Y,
        targetX, targetY
      ];
      // Make SVG path
      path = path.join(" ");


      return (
        React.DOM.g(
          {
            className: "edge",  // See componentDidUpdate
            title: this.props.label
          },
          React.DOM.path({
            className: "edge-bg",
            d: path
          }),
          React.DOM.path({
            ref: "route",
            className: "edge-fg stroke route"+this.props.route,  // See componentDidUpdate
            d: path
          }),
          React.DOM.path({
            className: "edge-touch",
            ref: "touch",
            d: path
          })
        )
      );
    }
  });

})(this);