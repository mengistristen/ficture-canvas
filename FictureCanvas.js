const template = document.createElement('template')
template.innerHTML = `
    <style>
        #container {
            display: inline-flex;
            flex-direction: column;
            font-family: Roboto;
        }

        #canvas-container {
            background-color: #eee;
            padding: 50px;
        }

        canvas {
            margin: 0 auto;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        }

        #controls {
            background-color: grey;
            padding: 1em;
        }

        #controls:after {
            content: "";
            width: 100%;
            z-index: -1;
            transform: scale(.9);
            box-shadow: 0px 0px 9px 2px #000;
        }

        input[type='color'] {
            appearance: none;
            background: white;
            padding: 0;
        }
    </style>
    <div id='container'>
        <div id='controls'>
            <label id='pen-label' for='pen-color'>Pen:</label>
            <input id='pen-color' type='color' value='#000' name='pen-color' />
        </div>
        <div id='canvas-container'>
            <canvas />
        </div>
    <div>
`

/**
 * Calculates the x and y coordinates of an interaction with
 *  a canvas
 * @param {HTMLCanvasElement} canvas - the canvas that is being interacted with
 * @param {Event} event - the event fired by that canvas
 */
const getCursorPosition = (canvas, event) => {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  return { x, y }
}

/**
 * Creates a listener for painting lines on a canvas
 * @param {HTMLCanvasElement} canvas
 */
const paintListener = (canvas) => {
  const context = canvas.getContext('2d')

  return (e) => {
    const { x, y } = getCursorPosition(canvas, e)

    context.lineTo(x, y)
    context.stroke()
  }
}

/**
 * Class representing a canvas with the capability to draw
 *  and change colors.
 */
class FictureCanvas extends HTMLElement {
  /** Create a new canvas and setup the shadow DOM */
  constructor() {
    super()

    const shadow = this.attachShadow({ mode: 'open' })
    shadow.appendChild(template.content.cloneNode(true))

    this.height = Number.parseInt(this.getAttribute('height')) || 500
    this.width = Number.parseInt(this.getAttribute('width')) || 500
    this.lineWidth = Number.parseInt(this.getAttribute('line-width')) || 3
    this.penColor = this.getAttribute('color') || '#000'
    this.data = [...Array(this.height)].map((_) =>
      [...Array(this.width)].map((_) => '#fff')
    )

    this.setupCanvas()

    if (this.getAttribute('controls') === null)
      shadow.querySelector('#controls').style.display = 'none'
    else
      shadow
        .querySelector('#pen-color')
        .addEventListener('change', (e) => (this.penColor = e.target.value))
  }

  /** Setup size and add event listeners to the canvas */
  setupCanvas() {
    const canvas = this.shadowRoot.querySelector('canvas')
    const ctx = canvas.getContext('2d')
    const listener = paintListener(canvas, ctx)

    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    // setup pixel dimensions of canvas
    canvas.width = this.width
    canvas.height = this.height

    // setup CSS styling of canvas
    canvas.style.width = this.width
    canvas.style.height = this.height

    // paint entire canvas white
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, this.width, this.height)

    canvas.addEventListener('mousedown', (e) => {
      const { x, y } = getCursorPosition(canvas, e)

      // set style for the line
      ctx.lineWidth = this.lineWidth
      ctx.strokeStyle = this.penColor

      // start drawing the line
      ctx.beginPath()
      ctx.moveTo(x, y)

      // draw as you drag the mouse
      canvas.addEventListener('mousemove', listener)
    })

    canvas.addEventListener('mouseup', () =>
      canvas.removeEventListener('mousemove', listener)
    )
  }

  getPixelData() {
    return this.data
  }
}

customElements.define('ficture-canvas', FictureCanvas)
