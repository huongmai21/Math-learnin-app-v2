"use client"

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import "./WhiteboardInterface.css"

const WhiteboardInterface = forwardRef(({ roomId, onUpdate }, ref) => {
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState("pen") // pen, eraser, text, shape
  const [color, setColor] = useState("#000000")
  const [lineWidth, setLineWidth] = useState(3)
  const [shape, setShape] = useState("line") // line, rect, circle
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const canvasRef = useRef(null)
  const contextRef = useRef(null)
  const startPointRef = useRef({ x: 0, y: 0 })

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    clearCanvas: () => clearCanvas(),
    updateCanvas: (data) => updateCanvasFromData(data),
    saveImage: () => saveCanvasAsImage(),
  }))

  // Initialize canvas when component mounts
  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    canvas.style.width = `${canvas.offsetWidth}px`
    canvas.style.height = `${canvas.offsetHeight}px`

    const context = canvas.getContext("2d")
    context.scale(2, 2)
    context.lineCap = "round"
    context.strokeStyle = color
    context.lineWidth = lineWidth
    contextRef.current = context

    // Save initial canvas state
    saveCanvasState()
  }, [])

  // Update context when color or line width changes
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = tool === "eraser" ? "#FFFFFF" : color
      contextRef.current.lineWidth = tool === "eraser" ? lineWidth * 2 : lineWidth
    }
  }, [color, lineWidth, tool])

  // Save canvas state to history
  const saveCanvasState = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const imageData = canvas.toDataURL("image/png")

    // Remove any states after current index
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(imageData)

    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  // Undo last action
  const undo = () => {
    if (historyIndex <= 0) return

    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)

    const imageObj = new Image()
    imageObj.src = history[newIndex]
    imageObj.onload = () => {
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(imageObj, 0, 0, canvas.width, canvas.height)
    }
  }

  // Redo last undone action
  const redo = () => {
    if (historyIndex >= history.length - 1) return

    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)

    const imageObj = new Image()
    imageObj.src = history[newIndex]
    imageObj.onload = () => {
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(imageObj, 0, 0, canvas.width, canvas.height)
    }
  }

  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    context.clearRect(0, 0, canvas.width, canvas.height)
    saveCanvasState()

    // Send update to other users
    if (onUpdate) {
      onUpdate({
        action: "clear",
      })
    }
  }

  // Update canvas from received data
  const updateCanvasFromData = (data) => {
    if (!data) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (data.action === "clear") {
      context.clearRect(0, 0, canvas.width, canvas.height)
      saveCanvasState()
      return
    }

    if (data.action === "draw") {
      context.strokeStyle = data.color
      context.lineWidth = data.lineWidth

      context.beginPath()
      context.moveTo(data.startX, data.startY)
      context.lineTo(data.endX, data.endY)
      context.stroke()

      saveCanvasState()
    }

    if (data.action === "shape") {
      context.strokeStyle = data.color
      context.lineWidth = data.lineWidth

      context.beginPath()

      if (data.shape === "line") {
        context.moveTo(data.startX, data.startY)
        context.lineTo(data.endX, data.endY)
      } else if (data.shape === "rect") {
        context.rect(data.startX, data.startY, data.endX - data.startX, data.endY - data.startY)
      } else if (data.shape === "circle") {
        const radius = Math.sqrt(Math.pow(data.endX - data.startX, 2) + Math.pow(data.endY - data.startY, 2))
        context.arc(data.startX, data.startY, radius, 0, 2 * Math.PI)
      }

      context.stroke()
      saveCanvasState()
    }
  }

  // Save canvas as image
  const saveCanvasAsImage = () => {
    const canvas = canvasRef.current
    const image = canvas.toDataURL("image/png")

    const link = document.createElement("a")
    link.download = `whiteboard-${roomId}-${new Date().toISOString()}.png`
    link.href = image
    link.click()
  }

  // Start drawing
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent

    if (tool === "pen" || tool === "eraser") {
      contextRef.current.beginPath()
      contextRef.current.moveTo(offsetX, offsetY)
      setIsDrawing(true)
    } else if (tool === "shape") {
      startPointRef.current = { x: offsetX, y: offsetY }
      setIsDrawing(true)
    }
  }

  // Draw
  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return

    const { offsetX, offsetY } = nativeEvent

    if (tool === "pen" || tool === "eraser") {
      contextRef.current.lineTo(offsetX, offsetY)
      contextRef.current.stroke()

      // Send update to other users
      if (onUpdate) {
        onUpdate({
          action: "draw",
          startX: offsetX - 1, // Small offset to ensure continuous line
          startY: offsetY - 1,
          endX: offsetX,
          endY: offsetY,
          color: contextRef.current.strokeStyle,
          lineWidth: contextRef.current.lineWidth,
        })
      }
    }
  }

  // Finish drawing
  const finishDrawing = ({ nativeEvent }) => {
    if (!isDrawing) return

    const { offsetX, offsetY } = nativeEvent

    if (tool === "pen" || tool === "eraser") {
      contextRef.current.closePath()
    } else if (tool === "shape") {
      const startX = startPointRef.current.x
      const startY = startPointRef.current.y

      contextRef.current.beginPath()

      if (shape === "line") {
        contextRef.current.moveTo(startX, startY)
        contextRef.current.lineTo(offsetX, offsetY)
      } else if (shape === "rect") {
        contextRef.current.rect(startX, startY, offsetX - startX, offsetY - startY)
      } else if (shape === "circle") {
        const radius = Math.sqrt(Math.pow(offsetX - startX, 2) + Math.pow(offsetY - startY, 2))
        contextRef.current.arc(startX, startY, radius, 0, 2 * Math.PI)
      }

      contextRef.current.stroke()

      // Send update to other users
      if (onUpdate) {
        onUpdate({
          action: "shape",
          shape: shape,
          startX: startX,
          startY: startY,
          endX: offsetX,
          endY: offsetY,
          color: contextRef.current.strokeStyle,
          lineWidth: contextRef.current.lineWidth,
        })
      }
    }

    setIsDrawing(false)
    saveCanvasState()
  }

  return (
    <div className="whiteboard-interface">
      <div className="whiteboard-toolbar">
        <div className="tool-group">
          <button
            className={`tool-button ${tool === "pen" ? "active" : ""}`}
            onClick={() => setTool("pen")}
            title="Bút vẽ"
          >
            <i className="fas fa-pen"></i>
          </button>
          <button
            className={`tool-button ${tool === "eraser" ? "active" : ""}`}
            onClick={() => setTool("eraser")}
            title="Tẩy"
          >
            <i className="fas fa-eraser"></i>
          </button>
          <button
            className={`tool-button ${tool === "shape" ? "active" : ""}`}
            onClick={() => setTool("shape")}
            title="Hình"
          >
            <i className="fas fa-shapes"></i>
          </button>
        </div>

        {tool === "shape" && (
          <div className="shape-group">
            <button
              className={`shape-button ${shape === "line" ? "active" : ""}`}
              onClick={() => setShape("line")}
              title="Đường thẳng"
            >
              <i className="fas fa-minus"></i>
            </button>
            <button
              className={`shape-button ${shape === "rect" ? "active" : ""}`}
              onClick={() => setShape("rect")}
              title="Hình chữ nhật"
            >
              <i className="far fa-square"></i>
            </button>
            <button
              className={`shape-button ${shape === "circle" ? "active" : ""}`}
              onClick={() => setShape("circle")}
              title="Hình tròn"
            >
              <i className="far fa-circle"></i>
            </button>
          </div>
        )}

        <div className="color-group">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} title="Chọn màu" />
        </div>

        <div className="width-group">
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number.parseInt(e.target.value))}
            title="Độ dày nét vẽ"
          />
        </div>

        <div className="action-group">
          <button className="action-button" onClick={undo} disabled={historyIndex <= 0} title="Hoàn tác">
            <i className="fas fa-undo"></i>
          </button>
          <button
            className="action-button"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Làm lại"
          >
            <i className="fas fa-redo"></i>
          </button>
          <button className="action-button" onClick={clearCanvas} title="Xóa tất cả">
            <i className="fas fa-trash"></i>
          </button>
          <button className="action-button" onClick={saveCanvasAsImage} title="Lưu ảnh">
            <i className="fas fa-download"></i>
          </button>
        </div>
      </div>

      <div className="whiteboard-canvas-container">
        <canvas
          ref={canvasRef}
          className="whiteboard-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={finishDrawing}
          onMouseLeave={finishDrawing}
        />
      </div>
    </div>
  )
})

export default WhiteboardInterface
