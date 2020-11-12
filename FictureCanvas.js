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

const getCursorPosition = (canvas, event) => {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  return { x, y }
}

class FictureCanvas extends HTMLElement {
  constructor() {
    super()

    const shadow = this.attachShadow({ mode: 'open' })
    shadow.appendChild(template.content.cloneNode(true))

    this.height = Number.parseInt(this.getAttribute('height')) || 500
    this.width = Number.parseInt(this.getAttribute('width')) || 500
    this.penColor = this.getAttribute('color') || '#000'
    this.data = [...Array(this.height)].map((_) =>
      [...Array(this.width)].map((_) => '#fff')
    )
    this.drawing = false

    this.setupCanvas()

    if (this.getAttribute('controls') === null)
      shadow.querySelector('#controls').style.display = 'none'
    else
      shadow
        .querySelector('#pen-color')
        .addEventListener('change', (e) => (this.penColor = e.target.value))
  }

  setupCanvas() {
    const canvas = this.shadowRoot.querySelector('canvas')

    // setup pixel dimensions of canvas
    canvas.width = this.width
    canvas.height = this.height

    // setup CSS styling of canvas
    canvas.style.width = this.width
    canvas.style.height = this.height

    const ctx = canvas.getContext('2d')

    // paint entire canvas white
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, this.width, this.height)

    // when a user begins drawing
    canvas.addEventListener('mousedown', (e) => {
      const { x, y } = getCursorPosition(canvas, e)

      this.drawing = true
      ctx.fillStyle = this.penColor
      ctx.fillRect(x, y, 1, 1)
      this.data[y][x] = this.penColor
    })

    canvas.addEventListener('mousemove', (e) => {
      const { x, y } = getCursorPosition(canvas, e)

      if (this.drawing) {
        ctx.fillStyle = this.penColor
        ctx.fillRect(x, y, 1, 1)
        this.data[y][x]
      }
    })

    // when a user finishes drawing
    canvas.addEventListener('mouseup', (e) => {
      this.drawing = false
      console.log(this.data)
    })
  }

  getPixelData() {
    return this.data
  }
}

customElements.define('ficture-canvas', FictureCanvas)
