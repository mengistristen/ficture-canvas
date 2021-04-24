const template = document.createElement('template')
template.innerHTML = `
    <style>
        .container {
            display: inline-flex;
            flex-direction: column;
            font-family: Roboto;
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
        }

        #line-width {
          line-height: 5em;
        }
        .controls {
            background-color: #ccc;
            padding: 1em;
            display: flex;
            align-items: center;
        }
        .controls > * {
          margin: 0 0.25em;
        }

      .default-color {
        height: 1em;
        width: 1em;
        border: 3px solid #eee;
      }

      #clear {
        background: none;
        border: none;
        padding: 0.5em 1em;
        border-radius: 10px;
        transition: all 0.2s ease-in-out;
      }

      #clear:hover {
        background-color: rgba(120, 120, 120, 0.5);
        color: white;
      }
    </style>
    <div class='container'>
        <div class='controls'>
            <input type="color" id='primary-color'/> 
            <div class='default-color' name='#ff0000'></div>
            <div class='default-color' name='#00ff00'></div>
            <div class='default-color' name='#0000ff'></div>
            <div class='default-color' name='#eeff00'></div>
            <div class='default-color' name='#000000'></div>
            <select id='line-width' value=1>
              <option value=1>1</option>
              <option value=2>2</option>
              <option value=3>3</option>
              <option value=4>4</option>
            </select>
            <button id='clear'>CLEAR</button>
        </div>
        <canvas />
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
    context.lineJoin = 'round'
    context.stroke()
  }
}

const defaultColorListener = (canvas, color) => {
  return (e) => {
    e.preventDefault()
    canvas.getPrimaryColorElement().value = color
    canvas.setPenColor(color)
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

    // Create shadow dom and attach template
    this.shadow = this.attachShadow({ mode: 'open' })
    this.shadow.appendChild(template.content.cloneNode(true))

    // Set attributes
    this.height = Number.parseInt(this.getAttribute('height')) || 500
    this.width = Number.parseInt(this.getAttribute('width')) || 500
    this.lineWidth = Number.parseInt(this.getAttribute('line-width')) || 3
    this.setPenColor(this.getAttribute('color') || '#000')

    this.setupCanvas()

    if (this.getAttribute('controls') === null)
      this.shadow.querySelector('.controls').style.display = 'none'
    else
      this.shadow
        .querySelector('#primary-color')
        .addEventListener('change', (e) => this.setPenColor(e.target.value))

    // Add backgrounds and listeners to default color selectors
    this.shadow.querySelectorAll('.default-color').forEach((element) => {
      const color = element.getAttribute('name')

      element.style.backgroundColor = color
      element.addEventListener('click', defaultColorListener(this, color))
    })

    // Add listener to line width selector
    this.shadow.querySelector('#line-width').addEventListener('change', (e) => {
      this.lineWidth = e.target.value * 3
    })

    // Add listener to clear button
    this.shadow.querySelector('#clear').addEventListener('click', (e) => {
      const ctx = this.shadow.querySelector('canvas').getContext('2d')

      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, this.width, this.height)
    })
  }

  /** Setup size and add event listeners to the canvas */
  setupCanvas() {
    const canvas = this.shadow.querySelector('canvas')
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

    /* // paint entire canvas white
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, this.width, this.height) */

    ctx.clearRect(0, 0, this.width, this.height)

    canvas.addEventListener('mousedown', (e) => {
      const { x, y } = getCursorPosition(canvas, e)

      // set style for the line
      ctx.lineWidth = Number.parseInt(this.lineWidth)
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

    canvas.addEventListener('mouseleave', () =>
      canvas.removeEventListener('mousemove', listener)
    )
  }

  setPenColor(color) {
    this.getPrimaryColorElement().value = color
    this.penColor = color
  }

  getPrimaryColorElement() {
    return this.shadow.querySelector('#primary-color')
  }

  getCanvas() {
    return this.shadow.querySelector('canvas')
  }

  clear() {
    const canvas = this.shadow.querySelector('canvas')
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, this.width, this.height)
  }
}

customElements.define('ficture-canvas', FictureCanvas)
