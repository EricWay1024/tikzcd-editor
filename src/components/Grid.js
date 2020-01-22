import {h, Component} from 'preact'
import classNames from 'classnames'
import {getId, arrEquals, arrSubtract, arrScale} from '../helper'

import GridCell from './GridCell'
import GridArrow from './GridArrow'

export default class Grid extends Component {
  constructor(props) {
    super()

    this.state = {
      width: null,
      height: null,
      phantomArrow: null,
      cellTypesetSizes: {}
    }
  }

  componentDidMount() {
    this.updateSize()

    window.addEventListener('resize', () => this.updateSize())

    document.addEventListener('mouseup', () => {
      this.mouseDown = null

      let {phantomArrow} = this.state

      if (phantomArrow != null) {
        if (!arrEquals(phantomArrow.from, phantomArrow.to)) {
          // Add edge

          let newNodes = [...this.props.data.nodes]

          let [fromNode, toNode] = [
            phantomArrow.from,
            phantomArrow.to
          ].map(position => newNodes.find(n => arrEquals(n.position, position)))

          if (fromNode == null) {
            newNodes.push(
              (fromNode = {
                id: getId(),
                position: phantomArrow.from,
                value: ''
              })
            )
          }

          if (toNode == null) {
            newNodes.push(
              (toNode = {
                id: getId(),
                position: phantomArrow.to,
                value: ''
              })
            )
          }

          let newEdges = [
            ...this.props.data.edges,
            {
              from: fromNode.id,
              to: toNode.id
            }
          ]

          let {onDataChange = () => {}} = this.props
          onDataChange({data: {nodes: newNodes, edges: newEdges}})
        }

        this.setState({phantomArrow: null})
      }
    })

    document.addEventListener('mousemove', evt => {
      if (this.mouseDown == null) return

      evt.preventDefault()

      let {cellSize, cameraPosition} = this.props
      let newPosition = [evt.clientX, evt.clientY].map((x, i) =>
        Math.floor((x + cameraPosition[i]) / cellSize)
      )

      if (this.mouseDown.mode === 'pan') {
        let {movementX, movementY} = evt
        let {onPan = () => {}} = this.props

        onPan({
          cameraPosition: arrSubtract(cameraPosition, [movementX, movementY])
        })
      } else if (this.mouseDown.mode === 'move') {
        let {nodeIndex} = this.mouseDown
        if (nodeIndex < 0) return

        let existingNode = this.props.data.nodes.find(n =>
          arrEquals(n.position, newPosition)
        )
        if (existingNode != null) return

        let {onDataChange = () => {}} = this.props

        onDataChange({
          selectedCell: newPosition,
          data: {
            nodes: this.props.data.nodes.map((x, i) =>
              i !== nodeIndex ? x : {...x, position: newPosition}
            ),

            edges: this.props.data.edges
          }
        })
      } else if (this.mouseDown.mode === 'arrow') {
        let {position: from} = this.mouseDown
        let to = newPosition

        if (
          this.state.phantomArrow != null &&
          arrEquals(from, this.state.phantomArrow.from) &&
          arrEquals(to, this.state.phantomArrow.to)
        )
          return

        this.setState({
          phantomArrow: {from, to}
        })
      }
    })
  }

  updateSize() {
    let {width, height} = this.element.getBoundingClientRect()
    this.setState({width, height})
  }

  handleNodeMouseDown = evt => {
    if (evt.button !== 0) return

    let {cellSize, cameraPosition} = this.props
    let position = [evt.clientX, evt.clientY].map((x, i) =>
      Math.floor((x + cameraPosition[i]) / cellSize)
    )
    let nodeIndex = this.props.data.nodes.findIndex(n =>
      arrEquals(n.position, position)
    )
    let node = this.props.data.nodes[nodeIndex]

    this.mouseDown = {
      evt,
      position,
      nodeIndex,
      node,
      mode: this.props.mode
    }
  }

  handleCellGrabberMouseDown = evt => {
    if (evt.button !== 0) return

    evt.stopPropagation()

    let {position} = evt
    let nodeIndex = this.props.data.nodes.findIndex(n =>
      arrEquals(n.position, position)
    )
    let node = this.props.data.nodes[nodeIndex]

    this.mouseDown = {
      evt,
      position,
      nodeIndex,
      node,
      mode: 'move'
    }
  }

  handleCellAddLoopClick = evt => {
    if (evt.button !== 0) return

    evt.stopPropagation()

    let {cellSize, cameraPosition} = this.props
    let newNodes = [...this.props.data.nodes]

    let position = [evt.clientX, evt.clientY].map((x, i) =>
      Math.floor((x + cameraPosition[i]) / cellSize)
    )

    let node = newNodes.find(n => arrEquals(n.position, position))
    if (node == null) newNodes.push((node = {id: getId(), position, value: ''}))

    let newEdges = [
      ...this.props.data.edges,
      {
        from: node.id,
        to: node.id,
        loop: [0, false],
        labelPosition: 'right'
      }
    ]

    let {onDataChange = () => {}} = this.props
    onDataChange({data: {nodes: newNodes, edges: newEdges}})
  }

  handleNodeMouseUp = evt => {
    if (this.mouseDown == null) return

    let oldEvt = this.mouseDown.evt
    if (evt.clientX !== oldEvt.clientX || evt.clientY !== oldEvt.clientY) return

    let {position} = this.mouseDown
    let {onCellClick = () => {}} = this.props

    onCellClick({position})
  }

  handleCellChange = evt => {
    let {onDataChange = () => {}} = this.props

    let nodes = [...this.props.data.nodes]
    let index = nodes.findIndex(n => arrEquals(n.position, evt.position))

    if (index < 0) {
      if (evt.value.trim() !== '') {
        nodes.push({
          id: getId(),
          position: evt.position,
          value: evt.value
        })
      }
    } else {
      let {id} = nodes[index]

      if (evt.value.trim() === '') {
        // Cleanup if necessary

        let existingEdge = this.props.data.edges.find(
          e => e.from === id || e.to === id
        )
        if (!existingEdge) nodes[index] = null
      } else {
        nodes[index] = {id, position: [...evt.position], value: evt.value}
      }
    }

    onDataChange({
      data: {
        nodes: nodes.filter(x => x != null),
        edges: this.props.data.edges
      }
    })
  }

  handleTypesetFinish = evt => {
    if (evt.element == null) {
      delete this.state.cellTypesetSizes[evt.position.join(',')]
      return
    }

    let rect = evt.element.getBoundingClientRect()

    this.setState(state => ({
      cellTypesetSizes: Object.assign(state.cellTypesetSizes, {
        [evt.position.join(',')]: [rect.width, rect.height]
      })
    }))
  }

  handleEdgeClick = index => {
    if (this.edgeClickHandlersCache == null) this.edgeClickHandlersCache = {}

    if (this.edgeClickHandlersCache[index] == null) {
      this.edgeClickHandlersCache[index] = evt => {
        let {onEdgeClick = () => {}} = this.props

        evt.edge = index
        onEdgeClick(evt)
      }
    }

    return this.edgeClickHandlersCache[index]
  }

  render() {
    if (this.state.width == null)
      return <section ref={el => (this.element = el)} id="grid" />

    let {cellSize, cameraPosition} = this.props
    let {cellTypesetSizes} = this.state
    let size = [this.state.width, this.state.height]
    let [xstart, ystart] = cameraPosition.map(x => Math.floor(x / cellSize))
    let [xend, yend] = cameraPosition.map((x, i) =>
      Math.floor((x + size[i]) / cellSize)
    )
    let [cols, rows] = [xend - xstart + 1, yend - ystart + 1]
    let [tx, ty] = arrSubtract(
      arrScale(cellSize, [xstart, ystart]),
      cameraPosition
    )

    return (
      <section
        ref={el => (this.element = el)}
        id="grid"
        class={this.props.mode}
      >
        <ol
          style={{
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
            left: tx,
            top: ty,
            width: cols * cellSize,
            height: rows * cellSize
          }}
          onMouseDown={this.handleNodeMouseDown}
          onMouseUp={this.handleNodeMouseUp}
        >
          {Array(rows)
            .fill()
            .map((_, j) =>
              Array(cols)
                .fill()
                .map((_, i) => [i + xstart, j + ystart])
                .map(position => {
                  let selected =
                    this.props.selectedCell != null &&
                    arrEquals(position, this.props.selectedCell)

                  let node = this.props.data.nodes.find(n =>
                    arrEquals(n.position, position)
                  )

                  return (
                    <GridCell
                      key={position.join(',')}
                      position={position}
                      size={cellSize}
                      selected={selected}
                      edit={selected && this.props.cellEditMode}
                      value={node && node.value}
                      onGrabberMouseDown={this.handleCellGrabberMouseDown}
                      onAddLoopClick={this.handleCellAddLoopClick}
                      onSubmit={this.props.onCellSubmit}
                      onChange={this.handleCellChange}
                      onTypesetFinish={this.handleTypesetFinish}
                    />
                  )
                })
            )}
        </ol>

        <ul
          style={{
            left: -cameraPosition[0],
            top: -cameraPosition[1]
          }}
        >
          {this.props.data.edges.map((edge, i) => {
            let {nodes} = this.props.data
            let fromPosition = nodes.find(n => n.id === edge.from).position
            let toPosition = nodes.find(n => n.id === edge.to).position

            return (
              <GridArrow
                cellSize={cellSize}
                id={i.toString()}
                from={fromPosition}
                to={toPosition}
                fromSize={cellTypesetSizes[fromPosition.join(',')]}
                toSize={cellTypesetSizes[toPosition.join(',')]}
                selected={this.props.selectedEdge === i}
                bend={edge.bend}
                shift={edge.shift}
                loop={edge.loop}
                tail={edge.tail}
                line={edge.line}
                head={edge.head}
                value={edge.value}
                labelPosition={edge.labelPosition}
                onClick={this.handleEdgeClick(i)}
              />
            )
          })}

          {this.state.phantomArrow && (
            <GridArrow
              cellSize={cellSize}
              phantom
              from={this.state.phantomArrow.from}
              to={this.state.phantomArrow.to}
              fromSize={
                cellTypesetSizes[this.state.phantomArrow.from.join(',')]
              }
              toSize={cellTypesetSizes[this.state.phantomArrow.to.join(',')]}
            />
          )}
        </ul>
      </section>
    )
  }
}
