import React, { Component } from 'react'
import * as d3 from 'd3'

var width = 800
var height = 600
var simulation = d3.forceSimulation()
  .force('collide', d3.forceCollide(d => 2 * d.size))
  .force('charge', d3.forceManyBody(-100))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .stop()

export default class Graph extends Component {
  constructor (props) {
    super(props)
    this.state = {selected: null}

    this.selectNode = this.selectNode.bind(this)
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (nextProps.version === this.props.version) {
      // if version is the same, no updates to data
      // so it must be interaction to select+highlight a node
      this.calculateHighlights(nextState.selected)
      this.circles.attr('opacity', d =>
        !nextState.selected || this.highlightedNodes[d.id] ? 1 : 0.2)
      this.lines.attr('opacity', d =>
        !nextState.selected || this.highlightedLinks[d.id] ? 0.5 : 0.1)
      return false
    }
    return true
  }

  componentDidMount () {
    var {nodes, links} = this.props
    this.container = d3.select(this.refs.container)
    this.calculateData()
    this.calculateHighlights(this.state.selected)
    this.renderLinks()
    this.renderNodes()
  }

  componentDidUpdate () {
    this.calculateData()
    this.calculateHighlights(this.state.selected)
    this.renderLinks()
    this.renderNodes()
  }

  calculateData () {
    var {nodes, links} = this.props
    simulation.nodes(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))

    Array.from(Array(2000), (_, i) => simulation.tick())
  }

  calculateHighlights (selected) {
    var {links} = this.props
    this.highlightedNodes = {}
    this.highlightedLinks = {}
    if (selected) {
      this.highlightedNodes[selected] = 1
      links.forEach(link => {
        if (link.source.id === selected) {
          this.highlightedNodes[link.target.id] = 1
          this.highlightedLinks[link.id] = 1
        }
        if (link.target.id === selected) {
          this.highlightedNodes[link.source.id] = 1
          this.highlightedLinks[link.id] = 1
        }
      })
    }
  }

  renderNodes () {
    var {nodes} = this.props
    this.circles = this.container.selectAll('circle')
      .data(nodes, d => d.id)
    // exit
    this.circles.exit().remove()
    // enter + update
    this.circles = this.circles.enter().append('circle')
      .classed('node', true)
      .merge(this.circles)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => 10)
      .attr('opacity', d =>
        !this.state.selected || this.highlightedNodes[d.id] ? 1 : 0.2)
      .on('click', this.selectNode)
      .call(d3.drag()
        .on('start', (d) => {
          if (!d3.event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (d) => {
          d.fx = d3.event.x
          d.fy = d3.event.y
        })
        .on('end', (d) => {
          if (!d3.event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        }))
  }

  renderLinks () {
    var {links} = this.props
    this.lines = this.container.selectAll('line')
      .data(links, d => d.id)
    // exit
    this.lines.exit().remove()
    // enter + update
    this.lines = this.lines.enter().insert('line', 'circle')
      .classed('link', true)
      .merge(this.lines)
      .attr('stroke-width', d => d.size)
      .attr('x1', d => d.source.x)
      .attr('x2', d => d.target.x)
      .attr('y1', d => d.source.y)
      .attr('y2', d => d.target.y)
      .attr('opacity', d =>
        !this.state.selected || this.highlightedLinks[d.id] ? 0.5 : 0.1)
  }

  selectNode (node) {
    if (node.id === this.state.selected) {
      this.setState({selected: null})
    } else {
      this.setState({selected: node.id})
    }
  }

  render () {
    console.log(this.props)
    return (
      <svg ref='container' style={{width, height}} />
    )
  }
}
