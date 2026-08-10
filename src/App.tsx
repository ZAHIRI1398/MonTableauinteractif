import { useRef, useEffect, useState, useCallback } from 'react'

type Point = { x: number; y: number }
type PathObj = { id: string; type: 'path'; points: Point[]; color: string; width: number; opacity: number; nib: string }
type ShapeObj = { id: string; type: 'shape'; shape: string; x1: number; y1: number; x2: number; y2: number; color: string; width: number; opacity: number; filled: boolean; lineStyle: string }
type TextObj = { id: string; type: 'text'; x: number; y: number; text: string; color: string; size: number }
type ImageObj = { id: string; type: 'image'; x: number; y: number; w: number; h: number; src: string }
type StickyObj = { id: string; type: 'sticky'; x: number; y: number; w: number; h: number; text: string; color: string }
type StampObj = { id: string; type: 'stamp'; x: number; y: number; size: number; src: string }
type DrawObj = PathObj | ShapeObj | TextObj | ImageObj | StickyObj | StampObj

const BOARD_COLORS: Record<string, string> = {
  white: '#ffffff',
  black: '#0a0a0a',
  transparent: 'transparent',
  '#ef4444': '#ef4444',
  '#3b82f6': '#3b82f6',
  '#10b981': '#10b981',
  '#f59e0b': '#f59e0b',
  '#8b5cf6': '#8b5cf6',
  '#ec4899': '#ec4899',
  'green-board': '#14532d',
  'navy-board': '#0f172a',
  cream: '#fdf6e3',
}

const gridLabels: Record<string, string> = {
  none: 'Uni',
  grid: 'Quadrillage',
  ruled: 'Ligné',
  'ruled-wide': '9 lignes',
  'ruled-double': 'Double ligne',
  'ruled-narrow': 'Ligné serré',
  dotted: 'Pointillé',
  isometric: 'Isométrique',
  'math-squares': 'Graphique 📈',
  'math-pink': 'Graphique rose',
}

export default function App() {
  const [isLight, setIsLight] = useState(false)
  const [boardBg, setBoardBg] = useState('white')
  const [customBg, setCustomBg] = useState('#ffffff')
  const [boardLine, setBoardLine] = useState('none')
  const [zenMode, setZenMode] = useState(false)
  const [tool, setTool] = useState('pen')
  const [nib, setNib] = useState('round')
  const [lineStyle, setLineStyle] = useState('solid')
  const [arrowStyle, setArrowStyle] = useState('solid')
  const [shape, setShape] = useState('rect')
  const [filled, setFilled] = useState(false)
  const [eraserType, setEraserType] = useState<'pixel' | 'object'>('pixel')
  const [activeColor, setActiveColor] = useState('#00a2ff')
  const [strokeWidth, setStrokeWidth] = useState(4)
  const [opacity, setOpacity] = useState(100)

  const [showLeft, setShowLeft] = useState(true)
  const [showRight, setShowRight] = useState(true)
  const [showPenMenu, setShowPenMenu] = useState(false)
  const [showEraserMenu, setShowEraserMenu] = useState(false)
  const [showLineMenu, setShowLineMenu] = useState(false)
  const [showArrowMenu, setShowArrowMenu] = useState(false)
  const [showShapesMenu, setShowShapesMenu] = useState(false)
  const [showStampMenu, setShowStampMenu] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [objects, setObjects] = useState<DrawObj[]>([])
  const [redoStack, setRedoStack] = useState<DrawObj[][]>([])
  const currentPath = useRef<Point[]>([])
  const isDrawing = useRef(false)
  const startPos = useRef<Point | null>(null)
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 })
  const isPanning = useRef(false)
  const lastPan = useRef<Point | null>(null)
  const [laserPos, setLaserPos] = useState<Point | null>(null)
  const [spotlightPos, setSpotlightPos] = useState<Point | null>(null)
  const [magnifierPos, setMagnifierPos] = useState<Point | null>(null)

  const [showTimer, setShowTimer] = useState(false)
  const [timerMin, setTimerMin] = useState(5)
  const [timerSec, setTimerSec] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [showRuler, setShowRuler] = useState(false)
  const [showProtractor, setShowProtractor] = useState(false)
  const [compassCenter, setCompassCenter] = useState<Point | null>(null)
  const [compassRadius, setCompassRadius] = useState(84)
  const [compassAngle, setCompassAngle] = useState(-0.9)
  const [compassIsDragging, setCompassIsDragging] = useState(false)
  const compassDragMode = useRef<null | 'center' | 'pencil' | 'sweep'>(null)
  const compassSweepStart = useRef<number | null>(null)
  const [showCurtain, setShowCurtain] = useState(false)
  const [curtainPos, setCurtainPos] = useState(50)
  const [showCalculator, setShowCalculator] = useState(false)
  const [calcDisplay, setCalcDisplay] = useState('0')
  const [calcPrev, setCalcPrev] = useState<number | null>(null)
  const [calcOp, setCalcOp] = useState<string | null>(null)
  const [showWheel, setShowWheel] = useState(false)
  const [wheelSpinning, setWheelSpinning] = useState(false)
  const [wheelRotation, setWheelRotation] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showBalloons, setShowBalloons] = useState(false)
  const [showGif, setShowGif] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [showQuran, setShowQuran] = useState(false)
  const [showYoutube, setShowYoutube] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [embeddedVideos, setEmbeddedVideos] = useState<{ id: string; url: string; x: number; y: number }[]>([])
  const [quranSurah, setQuranSurah] = useState('1')
  const [quranAyah, setQuranAyah] = useState('1')
  const [weatherCity, setWeatherCity] = useState('Paris')
  const [weatherData, setWeatherData] = useState<{ temp: number; weathercode: number; city: string } | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  const [showStickers, setShowStickers] = useState(false)
  const [showActivities, setShowActivities] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)

  const [textInputPos, setTextInputPos] = useState<Point | null>(null)
  const [textValue, setTextValue] = useState('')

  const stickyColors = ['#fef08a', '#bae6fd', '#bbf7d0', '#fecaca', '#e9d5ff']

  const [toast, setToast] = useState<string | null>(null)
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200) }

  useEffect(() => {
    if (!timerRunning) return
    const id = setInterval(() => {
      if (timerSec > 0) setTimerSec(s => s - 1)
      else if (timerMin > 0) { setTimerMin(m => m - 1); setTimerSec(59) }
      else { setTimerRunning(false); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 4000); showToast('⏰ Temps écoulé !') }
    }, 1000)
    return () => clearInterval(id)
  }, [timerRunning, timerMin, timerSec])

  useEffect(() => {
    document.documentElement.dir = 'ltr'
    document.documentElement.lang = 'fr'
    const saved = localStorage.getItem('tableau-matin-pro')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.boardBg) setBoardBg(data.boardBg)
        if (data.boardLine) setBoardLine(data.boardLine)
        if (data.objects) setObjects(data.objects)
        if (data.camera) setCamera(data.camera)
        if (data.activeColor) setActiveColor(data.activeColor)
      } catch { }
    }
  }, [])

  useEffect(() => {
    if (!isPro) return
    const save = () => localStorage.setItem('tableau-matin-pro', JSON.stringify({ boardBg, boardLine, objects, camera, activeColor }))
    const id = setInterval(save, 15000)
    return () => { clearInterval(id); save() }
  }, [isPro, boardBg, boardLine, objects, camera, activeColor])

  const getBoardBgColor = () => {
    if (boardBg === 'custom') return customBg
    return BOARD_COLORS[boardBg] || boardBg
  }

  const getPoint = (e: React.PointerEvent | PointerEvent, rect: DOMRect): Point => {
    return {
      x: (e.clientX - rect.left - camera.x) / camera.zoom,
      y: (e.clientY - rect.top - camera.y) / camera.zoom,
    }
  }

  const startRotate = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
    const inner = e.currentTarget.parentElement as HTMLElement
    const rect = inner.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const getAngle = (x: number, y: number) => Math.atan2(y - cy, x - cx) * 180 / Math.PI
    const startAngle = getAngle(e.clientX, e.clientY)
    const current = inner.style.transform
    const currentAngle = current ? parseFloat(current.replace('rotate(', '').replace('deg)', '')) || 0 : 0
    const base = currentAngle
    const move = (ev: PointerEvent) => {
      const a = getAngle(ev.clientX, ev.clientY)
      inner.style.transform = `rotate(${base + a - startAngle}deg)`
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const startWidgetDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input, select')) return
    const el = e.currentTarget.parentElement as HTMLElement
    if (!el) return
    const rect = el.getBoundingClientRect()
    const startX = e.clientX, startY = e.clientY
    const sx = rect.left, sy = rect.top
    el.style.left = `${sx}px`
    el.style.top = `${sy}px`
    el.style.bottom = 'auto'
    el.style.right = 'auto'
    el.style.transform = 'none'
    el.style.position = 'fixed'
    const move = (ev: PointerEvent) => { el.style.left = `${sx + (ev.clientX - startX)}px`; el.style.top = `${sy + (ev.clientY - startY)}px` }
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
  }

  const weatherInfo = (code: number) => {
    if (code === 0) return { icon: '☀️', label: 'Ensoleillé', color: '#f59e0b' }
    if ([1, 2, 3].includes(code)) return { icon: '🌤️', label: 'Partiellement nuageux', color: '#fbbf24' }
    if ([45, 48].includes(code)) return { icon: '🌫️', label: 'Brumeux', color: '#94a3b8' }
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { icon: '🌧️', label: 'Pluvieux', color: '#3b82f6' }
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: '🌨️', label: 'Neigeux', color: '#60a5fa' }
    if ([95, 96, 99].includes(code)) return { icon: '⛈️', label: 'Orageux', color: '#8b5cf6' }
    return { icon: '🌡️', label: 'Variable', color: '#10b981' }
  }

  const fetchWeather = async (city: string) => {
    try {
      setWeatherLoading(true)
      const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr&format=json`).then(r => r.json())
      if (!geo.results?.[0]) { showToast('Ville non trouvée'); return }
      const { latitude, longitude, name } = geo.results[0]
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`).then(r => r.json())
      setWeatherData({ temp: res.current_weather.temperature, weathercode: res.current_weather.weathercode, city: name })
    } catch {
      showToast('Erreur météo')
    } finally {
      setWeatherLoading(false)
    }
  }

  useEffect(() => { if (showQuran) fetchWeather(weatherCity) }, [showQuran, weatherCity])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, rect.width, rect.height)

    const bg = getBoardBgColor()
    if (bg !== 'transparent') {
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, rect.width, rect.height)
    } else {
      const size = 16
      for (let y = 0; y < rect.height; y += size) {
        for (let x = 0; x < rect.width; x += size) {
          ctx.fillStyle = (Math.floor(x / size) + Math.floor(y / size)) % 2 === 0 ? '#1e293b' : '#0f172a'
          ctx.fillRect(x, y, size, size)
        }
      }
    }

    ctx.save()
    ctx.translate(camera.x, camera.y)
    ctx.scale(camera.zoom, camera.zoom)
    const width = (rect.width - camera.x) / camera.zoom
    const height = (rect.height - camera.y) / camera.zoom
    const offsetX = -camera.x / camera.zoom
    const offsetY = -camera.y / camera.zoom

    if (boardLine !== 'none') {
      ctx.strokeStyle = boardLine === 'math-pink' ? 'rgba(236,72,153,0.18)' : boardLine.includes('math') ? 'rgba(59,130,246,0.18)' : boardLine === 'isometric' ? 'rgba(0,162,255,0.12)' : 'rgba(100,116,139,0.22)'
      ctx.lineWidth = 1 / camera.zoom
      if (boardLine === 'grid' || boardLine === 'math-squares' || boardLine === 'math-pink') {
        const step = 40
        const startX = Math.floor(offsetX / step) * step
        const startY = Math.floor(offsetY / step) * step
        for (let x = startX; x < offsetX + width; x += step) { ctx.beginPath(); ctx.moveTo(x, offsetY); ctx.lineTo(x, offsetY + height); ctx.stroke() }
        for (let y = startY; y < offsetY + height; y += step) { ctx.beginPath(); ctx.moveTo(offsetX, y); ctx.lineTo(offsetX + width, y); ctx.stroke() }
      } else if (boardLine === 'ruled' || boardLine === 'ruled-narrow' || boardLine === 'ruled-wide' || boardLine === 'ruled-double') {
        const step = boardLine === 'ruled-narrow' ? 28 : boardLine === 'ruled-wide' ? 72 : boardLine === 'ruled-double' ? 56 : 44
        const startY = Math.floor(offsetY / step) * step
        for (let y = startY; y < offsetY + height; y += step) {
          ctx.beginPath(); ctx.moveTo(offsetX, y); ctx.lineTo(offsetX + width, y); ctx.stroke()
          if (boardLine === 'ruled-double') { ctx.beginPath(); ctx.moveTo(offsetX, y + 16); ctx.lineTo(offsetX + width, y + 16); ctx.globalAlpha = 0.5; ctx.stroke(); ctx.globalAlpha = 1 }
        }
      } else if (boardLine === 'dotted') {
        const step = 80
        ctx.fillStyle = 'rgba(100,116,139,0.5)'
        const startX = Math.floor(offsetX / step) * step
        const startY = Math.floor(offsetY / step) * step
        for (let x = startX; x < offsetX + width; x += step) for (let y = startY; y < offsetY + height; y += step) { ctx.beginPath(); ctx.arc(x, y, 1.6 / camera.zoom, 0, Math.PI * 2); ctx.fill() }
      } else if (boardLine === 'isometric') {
        const step = 36
        ctx.strokeStyle = 'rgba(0,162,255,0.10)'
        const startX = Math.floor(offsetX / step) * step
        const startY = Math.floor(offsetY / step) * step
        for (let y = startY; y < offsetY + height; y += step) { ctx.beginPath(); ctx.moveTo(offsetX, y); ctx.lineTo(offsetX + width, y); ctx.stroke() }
        for (let x = startX; x < offsetX + width; x += step) {
          for (let y = startY; y < offsetY + height; y += step) {
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + step / 2, y + step * 0.866); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(x + step / 2, y + step * 0.866); ctx.lineTo(x + step, y); ctx.stroke()
          }
        }
      }
    }

    objects.forEach(obj => {
      ctx.save()
      ctx.globalAlpha = (obj as any).opacity !== undefined ? (obj as any).opacity / 100 : 1
      if (obj.type === 'path') {
        ctx.strokeStyle = obj.color
        ctx.lineWidth = obj.width
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        if (obj.nib === 'calligraphy') ctx.lineCap = 'butt'
        if (obj.nib === 'highlighter') { ctx.globalAlpha = 0.35; ctx.lineWidth = obj.width * 2.2 }
        if (obj.nib === 'spray') {
          obj.points.forEach(p => {
            for (let i = 0; i < 3; i++) {
              const ang = Math.random() * Math.PI * 2
              const r = Math.random() * obj.width * 0.8
              ctx.fillStyle = obj.color
              ctx.beginPath(); ctx.arc(p.x + Math.cos(ang) * r, p.y + Math.sin(ang) * r, 1.2, 0, Math.PI * 2); ctx.fill()
            }
          })
        } else if (obj.nib === 'chalk') {
          ctx.globalAlpha = 0.85
          ctx.setLineDash([1, 2])
          ctx.beginPath()
          obj.points.forEach((p, idx) => idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
          ctx.stroke()
          ctx.setLineDash([])
        } else {
          ctx.beginPath()
          obj.points.forEach((p, idx) => idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
          ctx.stroke()
          if (obj.nib === 'brush') {
            ctx.globalAlpha = 0.25
            ctx.lineWidth = obj.width * 1.6
            ctx.stroke()
          }
        }
      } else if (obj.type === 'shape') {
        ctx.strokeStyle = obj.color
        ctx.fillStyle = obj.color
        ctx.lineWidth = obj.width
        ctx.globalAlpha = obj.opacity / 100
        const minX = Math.min(obj.x1, obj.x2), minY = Math.min(obj.y1, obj.y2), w = Math.abs(obj.x2 - obj.x1), h = Math.abs(obj.y2 - obj.y1)
        if (obj.lineStyle === 'dotted') ctx.setLineDash([6, 6])
        const drawShapePath = (offset = 0) => {
          ctx.beginPath()
          if (obj.shape === 'rect' || obj.shape === 'square') {
            const size = obj.shape === 'square' ? Math.min(w, h) : w
            const hh = obj.shape === 'square' ? Math.min(w, h) : h
            if (offset) { ctx.rect(minX + offset, minY + offset, size - offset * 2, hh - offset * 2) } else ctx.rect(minX, minY, size, hh)
          } else if (obj.shape === 'circle') {
            ctx.ellipse(minX + w / 2 + offset * 0.1, minY + h / 2, w / 2 - offset, h / 2 - offset, 0, 0, Math.PI * 2)
          } else if (obj.shape === 'triangle') {
            ctx.moveTo(minX + w / 2, minY + offset); ctx.lineTo(minX + w - offset, minY + h - offset); ctx.lineTo(minX + offset, minY + h - offset); ctx.closePath()
          } else if (obj.shape === 'right-triangle') {
            ctx.moveTo(minX + offset, minY + offset); ctx.lineTo(minX + offset, minY + h - offset); ctx.lineTo(minX + w - offset, minY + h - offset); ctx.closePath()
          } else if (obj.shape === 'pentagon') {
            const cx = minX + w / 2, cy = minY + h / 2, rx = w / 2 - offset, ry = h / 2 - offset
            for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) } ctx.closePath()
          } else if (obj.shape === 'hexagon') {
            const cx = minX + w / 2, cy = minY + h / 2, rx = w / 2 - offset, ry = h / 2 - offset
            for (let i = 0; i < 6; i++) { const a = i * Math.PI * 2 / 6; const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) } ctx.closePath()
          } else if (obj.shape === 'rhombus') {
            ctx.moveTo(minX + w / 2, minY + offset); ctx.lineTo(minX + w - offset, minY + h / 2); ctx.lineTo(minX + w / 2, minY + h - offset); ctx.lineTo(minX + offset, minY + h / 2); ctx.closePath()
          } else if (obj.shape === 'parallelogram') {
            const skew = w * 0.2; ctx.moveTo(minX + skew + offset, minY + offset); ctx.lineTo(minX + w - offset, minY + offset); ctx.lineTo(minX + w - skew - offset, minY + h - offset); ctx.lineTo(minX + offset, minY + h - offset); ctx.closePath()
          } else if (obj.shape === 'trapezoid') {
            ctx.moveTo(minX + w * 0.2 + offset, minY + offset); ctx.lineTo(minX + w * 0.8 - offset, minY + offset); ctx.lineTo(minX + w - offset, minY + h - offset); ctx.lineTo(minX + offset, minY + h - offset); ctx.closePath()
          } else if (obj.shape === 'star') {
            const cx = minX + w / 2, cy = minY + h / 2, outer = Math.min(w, h) / 2 - offset, inner = outer * 0.4
            for (let i = 0; i < 10; i++) { const r = i % 2 === 0 ? outer : inner; const a = -Math.PI / 2 + i * Math.PI / 5; const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) } ctx.closePath()
          } else if (obj.shape === 'heart') {
            const cx = minX + w / 2, cy = minY + h / 2
            ctx.moveTo(cx, cy + h * 0.35)
            ctx.bezierCurveTo(cx + w * 0.5, cy - h * 0.2, cx + w * 0.5, cy + h * 0.2, cx, cy + h * 0.45)
            ctx.bezierCurveTo(cx - w * 0.5, cy + h * 0.2, cx - w * 0.5, cy - h * 0.2, cx, cy + h * 0.35)
          } else if (obj.shape === 'cube') {
            const s = Math.min(w, h) - offset * 2
            const ox = minX + (w - s) / 2 + offset, oy = minY + (h - s) / 2 + offset
            ctx.rect(ox, oy + s * 0.25, s * 0.65, s * 0.5)
            ctx.moveTo(ox, oy + s * 0.25); ctx.lineTo(ox + s * 0.35, oy); ctx.lineTo(ox + s, oy); ctx.lineTo(ox + s, oy + s * 0.5); ctx.lineTo(ox + s * 0.65, oy + s * 0.75); ctx.lineTo(ox, oy + s * 0.75); ctx.closePath()
            ctx.moveTo(ox + s * 0.65, oy + s * 0.25); ctx.lineTo(ox + s, oy)
            ctx.moveTo(ox + s * 0.65, oy + s * 0.75); ctx.lineTo(ox + s, oy + s * 0.5)
          } else if (obj.shape === 'cylinder') {
            const rx = w / 2 - offset, ry = h * 0.15
            ctx.ellipse(minX + w / 2, minY + ry + offset, rx, ry, 0, 0, Math.PI * 2)
            ctx.moveTo(minX + offset, minY + ry + offset); ctx.lineTo(minX + offset, minY + h - ry - offset)
            ctx.moveTo(minX + w - offset, minY + ry + offset); ctx.lineTo(minX + w - offset, minY + h - ry - offset)
            ctx.ellipse(minX + w / 2, minY + h - ry - offset, rx, ry, 0, 0, Math.PI * 2)
          } else if (obj.shape === 'cone') {
            ctx.moveTo(minX + w / 2, minY + offset); ctx.lineTo(minX + w - offset, minY + h - h * 0.2 - offset); ctx.lineTo(minX + offset, minY + h - h * 0.2 - offset); ctx.closePath()
            ctx.ellipse(minX + w / 2, minY + h - h * 0.2 - offset, w / 2 - offset, h * 0.12, 0, 0, Math.PI * 2)
          } else if (obj.shape === 'speech-bubble') {
            ctx.moveTo(minX + 10 + offset, minY + offset); ctx.lineTo(minX + w - 10 - offset, minY + offset); ctx.quadraticCurveTo(minX + w - offset, minY + offset, minX + w - offset, minY + 10 + offset)
            ctx.lineTo(minX + w - offset, minY + h - 20 - offset); ctx.lineTo(minX + w * 0.7 - offset, minY + h - 20 - offset); ctx.lineTo(minX + w * 0.5 - offset, minY + h - offset); ctx.lineTo(minX + w * 0.45 - offset, minY + h - 20 - offset); ctx.lineTo(minX + 10 + offset, minY + h - 20 - offset); ctx.quadraticCurveTo(minX + offset, minY + h - 20 - offset, minX + offset, minY + h - 28 - offset); ctx.lineTo(minX + offset, minY + 10 + offset); ctx.quadraticCurveTo(minX + offset, minY + offset, minX + 10 + offset, minY + offset)
          } else if (obj.shape === 'line') {
            ctx.moveTo(obj.x1, obj.y1); ctx.lineTo(obj.x2, obj.y2)
          } else if (obj.shape === 'arrow') {
            ctx.moveTo(obj.x1, obj.y1); ctx.lineTo(obj.x2, obj.y2)
            const angle = Math.atan2(obj.y2 - obj.y1, obj.x2 - obj.x1)
            const head = 14
            ctx.moveTo(obj.x2, obj.y2)
            ctx.lineTo(obj.x2 - head * Math.cos(angle - Math.PI / 6), obj.y2 - head * Math.sin(angle - Math.PI / 6))
            ctx.lineTo(obj.x2 - head * Math.cos(angle + Math.PI / 6), obj.y2 - head * Math.sin(angle + Math.PI / 6))
            ctx.closePath()
          } else {
            ctx.rect(minX, minY, w, h)
          }
        }
        drawShapePath(0)
        if (obj.shape === 'arrow') { ctx.fill() }
        if (obj.filled) { ctx.fill(); ctx.globalAlpha = obj.opacity / 100 * 0.9; }
        if (obj.lineStyle === 'double') {
          ctx.stroke()
          drawShapePath(4)
          ctx.stroke()
        } else {
          ctx.stroke()
        }
        ctx.setLineDash([])
      } else if (obj.type === 'text') {
        ctx.fillStyle = obj.color
        ctx.font = `700 ${obj.size}px 'Outfit', sans-serif`
        ctx.textAlign = 'left'
        const lines = obj.text.split('\n')
        lines.forEach((line, i) => ctx.fillText(line, obj.x, obj.y + i * (obj.size * 1.3)))
      } else if (obj.type === 'image') {
        const img = (obj as any)._img as HTMLImageElement | undefined
        if (img && img.complete) {
          ctx.drawImage(img, obj.x, obj.y, obj.w, obj.h)
          ctx.strokeStyle = 'rgba(0,162,255,0.4)'; ctx.lineWidth = 1 / camera.zoom; ctx.strokeRect(obj.x, obj.y, obj.w, obj.h)
        } else {
          ctx.fillStyle = '#1e293b'; ctx.fillRect(obj.x, obj.y, obj.w, obj.h)
          ctx.fillStyle = '#64748b'; ctx.font = '14px sans-serif'; ctx.fillText('Chargement...', obj.x + obj.w / 2, obj.y + obj.h / 2)
        }
      } else if (obj.type === 'sticky') {
        ctx.fillStyle = obj.color
        ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 10 / camera.zoom; ctx.shadowOffsetY = 4 / camera.zoom
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h)
        ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
        ctx.fillStyle = 'rgba(0,0,0,0.08)'
        ctx.beginPath(); ctx.moveTo(obj.x + obj.w - 16, obj.y); ctx.lineTo(obj.x + obj.w, obj.y); ctx.lineTo(obj.x + obj.w, obj.y + 16); ctx.closePath(); ctx.fill()
        ctx.fillStyle = '#78350f'; ctx.font = `500 ${14}px sans-serif`; ctx.textAlign = 'left'
        const words = obj.text.split(' ')
        let line = '', ly = obj.y + 28
        for (const w of words) {
          const test = line + w + ' '
          if (ctx.measureText(test).width > obj.w - 20 && line) { ctx.fillText(line, obj.x + 10, ly); line = w + ' '; ly += 18 } else line = test
        }
        if (line) ctx.fillText(line, obj.x + 10, ly)
        ctx.textAlign = 'left'
      } else if (obj.type === 'stamp') {
        const img = (obj as any)._img as HTMLImageElement | undefined
        if (img && img.complete) ctx.drawImage(img, obj.x - obj.size / 2, obj.y - obj.size / 2, obj.size, obj.size)
        else { ctx.fillStyle = (obj as any).color || '#f59e0b'; ctx.beginPath(); ctx.arc(obj.x, obj.y, obj.size / 2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'white'; ctx.font = '20px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('⭐', obj.x, obj.y + 7); ctx.textAlign = 'left' }
      }
      ctx.restore()
    })
    ctx.restore()

    if (isDrawing.current && startPos.current && currentPath.current.length > 1) {
      ctx.save()
      ctx.translate(camera.x, camera.y)
      ctx.scale(camera.zoom, camera.zoom)
      ctx.strokeStyle = activeColor
      ctx.lineWidth = strokeWidth
      ctx.globalAlpha = opacity / 100
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'
      if (tool === 'pen' || tool === 'highlighter') {
        if (nib === 'highlighter') { ctx.globalAlpha = 0.35; ctx.lineWidth = strokeWidth * 2.2 }
        ctx.beginPath()
        currentPath.current.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
        ctx.stroke()
      } else if (tool === 'line' || tool === 'arrow' || tool.startsWith('shape')) {
        const s = startPos.current
        const e = currentPath.current[currentPath.current.length - 1]
        if (tool === 'line') {
          ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(e.x, e.y)
          if (lineStyle === 'dotted') ctx.setLineDash([6, 6])
          if (lineStyle === 'double') {
            ctx.stroke(); ctx.beginPath(); ctx.moveTo(s.x, s.y + 6); ctx.lineTo(e.x, e.y + 6); ctx.stroke(); ctx.setLineDash([])
          } else { ctx.stroke(); ctx.setLineDash([]) }
          ctx.fillStyle = activeColor; ctx.beginPath(); ctx.arc(s.x, s.y, 3, 0, Math.PI * 2); ctx.arc(e.x, e.y, 3, 0, Math.PI * 2); ctx.fill()
        } else if (tool === 'arrow') {
          const angle = Math.atan2(e.y - s.y, e.x - s.x)
          const len = Math.hypot(e.x - s.x, e.y - s.y)
          ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(e.x, e.y)
          if (arrowStyle === 'dotted') ctx.setLineDash([6, 6])
          ctx.stroke(); ctx.setLineDash([])
          ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x - 14 * Math.cos(angle - Math.PI / 6), e.y - 14 * Math.sin(angle - Math.PI / 6)); ctx.lineTo(e.x - 14 * Math.cos(angle + Math.PI / 6), e.y - 14 * Math.sin(angle + Math.PI / 6)); ctx.closePath(); ctx.fillStyle = activeColor; ctx.fill()
          if (arrowStyle === 'double') {
            ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x + 14 * Math.cos(angle - Math.PI / 6), s.y + 14 * Math.sin(angle - Math.PI / 6)); ctx.lineTo(s.x + 14 * Math.cos(angle + Math.PI / 6), s.y + 14 * Math.sin(angle + Math.PI / 6)); ctx.closePath(); ctx.fill()
            void len
          }
        } else {
          const minX = Math.min(s.x, e.x), minY = Math.min(s.y, e.y), w = Math.abs(e.x - s.x), h = Math.abs(e.y - s.y)
          ctx.strokeStyle = activeColor; ctx.lineWidth = strokeWidth
          ctx.setLineDash([])
          if (filled) ctx.fillStyle = activeColor
          if (shape === 'rect' || shape === 'square') {
            const size = shape === 'square' ? Math.min(w, h) : w
            const hh = shape === 'square' ? Math.min(w, h) : h
            if (filled) ctx.fillRect(minX, minY, size, hh)
            ctx.strokeRect(minX, minY, size, hh)
          } else if (shape === 'circle') {
            ctx.beginPath(); ctx.ellipse(minX + w / 2, minY + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2)
            if (filled) ctx.fill(); ctx.stroke()
          } else if (shape === 'triangle') {
            ctx.beginPath(); ctx.moveTo(minX + w / 2, minY); ctx.lineTo(minX + w, minY + h); ctx.lineTo(minX, minY + h); ctx.closePath()
            if (filled) ctx.fill(); ctx.stroke()
          } else {
            if (filled) ctx.fillRect(minX, minY, w, h)
            ctx.strokeRect(minX, minY, w, h)
          }
        }
      }
      ctx.restore()
    }

    // --- Compas ---
    if (tool === 'compass' && compassCenter) {
      const cx = compassCenter.x, cy = compassCenter.y
      const r = compassRadius
      const ang = compassAngle
      const px = cx + Math.cos(ang) * r
      const py = cy + Math.sin(ang) * r
      const mx = (cx + px) / 2
      const my = (cy + py) / 2
      // hinge offset perpendicular
      const hx = mx - Math.sin(ang) * r * 0.42
      const hy = my + Math.cos(ang) * r * 0.42
      ctx.save()
      ctx.translate(camera.x, camera.y); ctx.scale(camera.zoom, camera.zoom)
      // preview circle dashed
      ctx.strokeStyle = activeColor
      ctx.lineWidth = Math.max(1.2, strokeWidth * 0.9) / Math.max(1,camera.zoom*0.9)
      ctx.globalAlpha = 0.38
      ctx.setLineDash([8,7])
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 1
      // radius line
      ctx.strokeStyle = activeColor
      ctx.globalAlpha = 0.22
      ctx.lineWidth = 1 / camera.zoom
      ctx.setLineDash([4,4])
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 1
      // ticks on radius
      const steps = Math.max(2, Math.floor(r/28))
      for(let i=1;i<steps;i++){
        const t=i/steps
        const tx = cx + Math.cos(ang)*r*t
        const ty = cy + Math.sin(ang)*r*t
        ctx.strokeStyle='rgba(148,163,184,0.9)'
        ctx.lineWidth=1/camera.zoom
        ctx.beginPath()
        const nx=-Math.sin(ang)*5/camera.zoom, ny=Math.cos(ang)*5/camera.zoom
        ctx.moveTo(tx-nx, ty-ny); ctx.lineTo(tx+nx, ty+ny); ctx.stroke()
      }
      // legs
      ctx.strokeStyle = isLight ? '#334155' : '#e2e8f0'
      ctx.lineWidth = 3.2 / camera.zoom
      ctx.lineCap='round'; ctx.lineJoin='round'
      // leg needle
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(cx, cy); ctx.stroke()
      // leg pencil
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(px, py); ctx.stroke()
      // hinge head
      ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc'
      ctx.strokeStyle = '#38bdf8'
      ctx.lineWidth = 2.2/camera.zoom
      ctx.beginPath(); ctx.arc(hx, hy, 9/camera.zoom, 0, Math.PI*2); ctx.fill(); ctx.stroke()
      ctx.fillStyle = '#38bdf8'
      ctx.beginPath(); ctx.arc(hx, hy, 3.2/camera.zoom, 0, Math.PI*2); ctx.fill()
      // pivot spring
      ctx.fillStyle = '#f59e0b'
      ctx.beginPath(); ctx.arc(hx, hy, 1.2/camera.zoom, 0, Math.PI*2); ctx.fill()
      // needle tip
      ctx.fillStyle = '#ef4444'
      ctx.strokeStyle = '#991b1b'
      ctx.lineWidth=1/camera.zoom
      ctx.beginPath(); ctx.arc(cx, cy, 6/camera.zoom, 0, Math.PI*2); ctx.fill(); ctx.stroke()
      ctx.fillStyle='white'
      ctx.beginPath(); ctx.arc(cx-1.2/camera.zoom, cy-1.2/camera.zoom, 1.8/camera.zoom,0,Math.PI*2); ctx.fill()
      // pencil tip
      const grad = ctx.createLinearGradient(px, py-10/camera.zoom, px, py+4/camera.zoom)
      grad.addColorStop(0,'#fde68a'); grad.addColorStop(0.5,'#f59e0b'); grad.addColorStop(1,'#78350f')
      ctx.fillStyle = grad
      ctx.strokeStyle='#92400e'
      ctx.lineWidth=1.1/camera.zoom
      ctx.beginPath()
      // pencil body short
      const pdx = Math.cos(ang), pdy=Math.sin(ang)
      const bx = px - pdx*18/camera.zoom, by = py - pdy*18/camera.zoom
      // draw pencil as small rotated rect + tip
      ctx.save()
      ctx.translate(px, py)
      ctx.rotate(ang)
      ctx.fillRect(-18/camera.zoom, -4/camera.zoom, 18/camera.zoom, 8/camera.zoom)
      ctx.strokeRect(-18/camera.zoom, -4/camera.zoom, 18/camera.zoom, 8/camera.zoom)
      ctx.fillStyle = activeColor
      ctx.beginPath(); ctx.moveTo(0, -4/camera.zoom); ctx.lineTo(6/camera.zoom,0); ctx.lineTo(0,4/camera.zoom); ctx.closePath(); ctx.fill(); ctx.stroke()
      ctx.restore()
      // labels
      ctx.fillStyle = isLight ? '#0f172a' : 'white'
      ctx.font = `700 ${11/camera.zoom}px Outfit, sans-serif`
      ctx.textAlign='center'
      ctx.fillText(`${(r/28).toFixed(1)} cm`, mx - Math.sin(ang)*14/camera.zoom, my + Math.cos(ang)*14/camera.zoom - 8/camera.zoom)
      ctx.restore()
      // center handle halo for hit
      // (DOM handles are drawn separately)
    }

    if (laserPos) {
      ctx.save()
      ctx.translate(camera.x, camera.y); ctx.scale(camera.zoom, camera.zoom)
      ctx.fillStyle = '#ff4d4d'
      ctx.shadowColor = '#ff4d4d'; ctx.shadowBlur = 18
      ctx.beginPath(); ctx.arc(laserPos.x, laserPos.y, 8, 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(laserPos.x - 2, laserPos.y - 2, 2.5, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    }
    if (spotlightPos && tool === 'spotlight') {
      const rect = canvas.getBoundingClientRect()
      ctx.fillStyle = 'rgba(0,0,0,0.78)'
      ctx.fillRect(0, 0, rect.width, rect.height)
      ctx.save()
      ctx.globalCompositeOperation = 'destination-out'
      const sx = spotlightPos.x * camera.zoom + camera.x
      const sy = spotlightPos.y * camera.zoom + camera.y
      const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 140)
      grad.addColorStop(0, 'rgba(0,0,0,1)'); grad.addColorStop(0.7, 'rgba(0,0,0,1)'); grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.beginPath(); ctx.arc(sx, sy, 140, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx, sy, 140, 0, Math.PI * 2); ctx.stroke()
    }
    if (magnifierPos && tool === 'magnifier') {
      const sx = magnifierPos.x * camera.zoom + camera.x
      const sy = magnifierPos.y * camera.zoom + camera.y
      ctx.save()
      ctx.beginPath(); ctx.arc(sx, sy, 90, 0, Math.PI * 2); ctx.clip()
      ctx.translate(sx, sy); ctx.scale(1.6, 1.6); ctx.translate(-sx, -sy)
      ctx.restore()
      ctx.strokeStyle = '#10b981'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(sx, sy, 90, 0, Math.PI * 2); ctx.stroke()
      ctx.fillStyle = 'rgba(16,185,129,0.12)'; ctx.beginPath(); ctx.arc(sx, sy, 90, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#059669'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx + 64, sy + 64); ctx.lineTo(sx + 95, sy + 95); ctx.stroke()
    }
  }, [objects, boardBg, customBg, boardLine, camera, activeColor, strokeWidth, opacity, tool, nib, lineStyle, arrowStyle, shape, filled, laserPos, spotlightPos, magnifierPos, compassCenter, compassRadius, compassAngle, isLight])

  useEffect(() => { redraw() }, [redraw])
  useEffect(() => {
    const onResize = () => redraw()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [redraw])

  useEffect(() => {
    objects.forEach(obj => {
      if ((obj.type === 'image' || obj.type === 'stamp') && !(obj as any)._img) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = obj.src
        img.onload = () => { (obj as any)._img = img; redraw() }
        ; (obj as any)._img = img
      }
    })
  }, [objects, redraw])

  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const pt = getPoint(e, rect)
      ; (e.target as Element).setPointerCapture(e.pointerId)

    if (tool === 'hand' || tool === 'select' && e.button === 1 || (e.altKey)) {
      isPanning.current = true
      lastPan.current = { x: e.clientX, y: e.clientY }
      return
    }
    if (tool === 'hand') {
      isPanning.current = true
      lastPan.current = { x: e.clientX, y: e.clientY }
      return
    }
    if (tool === 'text') {
      setTextInputPos(pt)
      setTextValue('')
      return
    }
    if (tool === 'sticky') {
      const newSticky: StickyObj = { id: Date.now().toString(), type: 'sticky', x: pt.x - 80, y: pt.y - 60, w: 160, h: 120, text: 'Nouvelle note ✏️', color: stickyColors[Math.floor(Math.random() * stickyColors.length)] }
      setObjects(o => [...o, newSticky])
      showToast('Post-it ajouté')
      return
    }
    if (tool === 'stamp') {
      const src = (window as any).__activeStamp || ''
      const newStamp: StampObj = { id: Date.now().toString(), type: 'stamp', x: pt.x, y: pt.y, size: 64, src: src || 'star' }
      if (!src) (newStamp as any).color = activeColor
      setObjects(o => [...o, newStamp])
      return
    }
    if (tool === 'compass') {
      if (!compassCenter) {
        setCompassCenter(pt)
        setCompassRadius(compassRadius)
        showToast('Pointe placée — faites glisser la mine pour régler le rayon')
        return
      }
      const cx = compassCenter.x, cy = compassCenter.y
      const r = compassRadius
      const ang = compassAngle
      const px = cx + Math.cos(ang) * r
      const py = cy + Math.sin(ang) * r
      const mx = (cx + px) / 2, my = (cy + py) / 2
      const hx = mx - Math.sin(ang) * r * 0.42
      const hy = my + Math.cos(ang) * r * 0.42
      const distToCenter = Math.hypot(pt.x - cx, pt.y - cy)
      const distToPencil = Math.hypot(pt.x - px, pt.y - py)
      const distToHinge = Math.hypot(pt.x - hx, pt.y - hy)
      const thr = 20 / camera.zoom
      if (distToCenter < 14 / camera.zoom + 6) {
        compassDragMode.current = 'center'
        setCompassIsDragging(true)
        isDrawing.current = true
        return
      }
      if (distToPencil < thr) {
        compassDragMode.current = 'pencil'
        setCompassIsDragging(true)
        isDrawing.current = true
        return
      }
      if (distToHinge < 16 / camera.zoom) {
        compassDragMode.current = 'center'
        setCompassIsDragging(true)
        isDrawing.current = true
        return
      }
      if (Math.abs(distToCenter - r) < thr) {
        compassDragMode.current = 'sweep'
        compassSweepStart.current = Math.atan2(pt.y - cy, pt.x - cx)
        setCompassIsDragging(true)
        isDrawing.current = true
        return
      }
      if (distToCenter > r * 1.45) {
        setCompassCenter(pt)
        showToast('Compas repositionné')
        return
      } else {
        compassDragMode.current = 'sweep'
        compassSweepStart.current = Math.atan2(pt.y - cy, pt.x - cx)
        setCompassIsDragging(true)
        isDrawing.current = true
        return
      }
    }
    if (tool === 'eraser') {
      isDrawing.current = true
      currentPath.current = [pt]
      setObjects(prev => prev.filter(obj => {
        if (obj.type === 'path') return !obj.points.some(p => Math.hypot(p.x - pt.x, p.y - pt.y) < strokeWidth + 12)
        if (obj.type === 'shape') {
          const minX = Math.min(obj.x1, obj.x2), maxX = Math.max(obj.x1, obj.x2), minY = Math.min(obj.y1, obj.y2), maxY = Math.max(obj.y1, obj.y2)
          return !(pt.x >= minX - 10 && pt.x <= maxX + 10 && pt.y >= minY - 10 && pt.y <= maxY + 10)
        }
        if (obj.type === 'text' || obj.type === 'sticky' || obj.type === 'image' || obj.type === 'stamp') {
          const ox = (obj as any).x, oy = (obj as any).y
          return Math.hypot(ox - pt.x, oy - pt.y) > 40
        }
        return true
      }))
      return
    }
    if (tool === 'laser' || tool === 'spotlight' || tool === 'magnifier') {
      if (tool === 'laser') setLaserPos(pt)
      if (tool === 'spotlight') setSpotlightPos(pt)
      if (tool === 'magnifier') setMagnifierPos(pt)
      isDrawing.current = true
      return
    }
    isDrawing.current = true
    startPos.current = pt
    currentPath.current = [pt]
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const pt = getPoint(e, rect)

    if (isPanning.current && lastPan.current) {
      const dx = e.clientX - lastPan.current.x
      const dy = e.clientY - lastPan.current.y
      setCamera(c => ({ ...c, x: c.x + dx, y: c.y + dy }))
      lastPan.current = { x: e.clientX, y: e.clientY }
      return
    }
    if (tool === 'laser' && isDrawing.current) { setLaserPos(pt); return }
    if (tool === 'spotlight' && isDrawing.current) { setSpotlightPos(pt); return }
    if (tool === 'magnifier' && isDrawing.current) { setMagnifierPos(pt); return }

    if (tool === 'compass' && compassCenter && compassIsDragging && compassDragMode.current) {
      const cx0 = compassCenter.x, cy0 = compassCenter.y
      if (compassDragMode.current === 'center') {
        setCompassCenter({ x: pt.x, y: pt.y })
      } else if (compassDragMode.current === 'pencil') {
        const dx = pt.x - cx0, dy = pt.y - cy0
        const nr = Math.min(420, Math.max(18, Math.hypot(dx, dy)))
        const na = Math.atan2(dy, dx)
        setCompassRadius(nr)
        setCompassAngle(na)
      } else if (compassDragMode.current === 'sweep') {
        const na = Math.atan2(pt.y - cy0, pt.x - cx0)
        setCompassAngle(na)
      }
      redraw()
      return
    }

    if (!isDrawing.current) return

    if (tool === 'eraser') {
      currentPath.current.push(pt)
      setObjects(prev => prev.filter(obj => {
        if (obj.type === 'path') return !obj.points.some(p => Math.hypot(p.x - pt.x, p.y - pt.y) < strokeWidth + 12)
        if (obj.type === 'shape') {
          const minX = Math.min(obj.x1, obj.x2), maxX = Math.max(obj.x1, obj.x2), minY = Math.min(obj.y1, obj.y2), maxY = Math.max(obj.y1, obj.y2)
          return !(pt.x >= minX - 8 && pt.x <= maxX + 8 && pt.y >= minY - 8 && pt.y <= maxY + 8)
        }
        return true
      }))
      redraw()
      return
    }

    if (tool === 'pen' || tool === 'highlighter' || tool === 'magic-pen') {
      currentPath.current.push(pt)
      redraw()
    } else if (tool === 'line' || tool === 'arrow' || tool.startsWith('shape') || shape) {
      currentPath.current = [startPos.current!, pt]
      redraw()
    }
  }

  const handlePointerUp = () => {
    if (isPanning.current) { isPanning.current = false; lastPan.current = null; return }
    if (tool === 'compass' && compassIsDragging) {
      setCompassIsDragging(false)
      isDrawing.current = false
      compassDragMode.current = null
      redraw()
      return
    }
    if (!isDrawing.current) return
    isDrawing.current = false

    if (tool === 'laser' || tool === 'spotlight' || tool === 'magnifier') return

    if (tool === 'pen' || tool === 'highlighter' || tool === 'magic-pen') {
      if (currentPath.current.length > 1) {
        const newObj: PathObj = { id: Date.now().toString(), type: 'path', points: [...currentPath.current], color: tool === 'highlighter' ? '#fde047' : activeColor, width: strokeWidth, opacity: tool === 'highlighter' ? 55 : opacity, nib: tool === 'magic-pen' ? 'magic' : nib }
        setObjects(o => [...o, newObj])
        if (tool === 'magic-pen') setTimeout(() => setObjects(prev => prev.filter(x => x.id !== newObj.id)), 2800)
      }
    } else if (tool === 'line') {
      if (startPos.current && currentPath.current.length > 1) {
        const end = currentPath.current[currentPath.current.length - 1]
        const newObj: ShapeObj = { id: Date.now().toString(), type: 'shape', shape: 'line', x1: startPos.current.x, y1: startPos.current.y, x2: end.x, y2: end.y, color: activeColor, width: strokeWidth, opacity, filled: false, lineStyle }
        setObjects(o => [...o, newObj as any])
        setObjects(prev => prev.map(x => x.id === newObj.id ? { ...x, shape: 'line' } as any : x))
      }
    } else if (tool === 'arrow') {
      if (startPos.current && currentPath.current.length > 1) {
        const end = currentPath.current[currentPath.current.length - 1]
        const newObj: any = { id: Date.now().toString(), type: 'shape', shape: 'arrow', x1: startPos.current.x, y1: startPos.current.y, x2: end.x, y2: end.y, color: activeColor, width: strokeWidth, opacity, filled: false, lineStyle: arrowStyle }
        setObjects(o => [...o, newObj])
      }
    } else if (tool === 'rect' || tool.startsWith('shape') || ['rect', 'square', 'circle', 'triangle', 'right-triangle', 'pentagon', 'hexagon', 'rhombus', 'parallelogram', 'trapezoid', 'star', 'heart', 'cube', 'cylinder', 'cone', 'speech-bubble'].includes(shape) || tool === 'shape') {
      if (startPos.current && currentPath.current.length > 1) {
        const end = currentPath.current[currentPath.current.length - 1]
        if (Math.abs(end.x - startPos.current.x) > 6 && Math.abs(end.y - startPos.current.y) > 6) {
          const newObj: ShapeObj = { id: Date.now().toString(), type: 'shape', shape, x1: startPos.current.x, y1: startPos.current.y, x2: end.x, y2: end.y, color: activeColor, width: strokeWidth, opacity, filled, lineStyle: 'solid' }
          setObjects(o => [...o, newObj])
        }
      }
    }
    currentPath.current = []
    startPos.current = null
    redraw()
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (tool === 'compass' && compassCenter && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      const delta = -e.deltaY * 0.12
      setCompassRadius(r => Math.min(420, Math.max(18, r + delta)))
      return
    }
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = -e.deltaY * 0.001
      setCamera(c => {
        const newZoom = Math.min(4, Math.max(0.2, c.zoom + delta))
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return { ...c, zoom: newZoom }
        const cx = e.clientX - rect.left
        const cy = e.clientY - rect.top
        const wx = (cx - c.x) / c.zoom
        const wy = (cy - c.y) / c.zoom
        return { x: cx - wx * newZoom, y: cy - wy * newZoom, zoom: newZoom }
      })
    } else {
      setCamera(c => ({ ...c, x: c.x - e.deltaX, y: c.y - e.deltaY }))
    }
  }

  const traceCompassCircle = () => {
    if (!compassCenter) { showToast("Placez d'abord la pointe du compas"); return }
    const cx = compassCenter.x, cy = compassCenter.y, r = compassRadius
    const newObj: ShapeObj = { id: Date.now().toString(), type: 'shape', shape: 'circle', x1: cx - r, y1: cy - r, x2: cx + r, y2: cy + r, color: activeColor, width: strokeWidth, opacity, filled: false, lineStyle: 'solid' }
    setObjects(o => [...o, newObj]); showToast(`Cercle tracé — rayon ${(r/28).toFixed(1)} cm`)
  }
  const traceCompassArc = (spanDeg: number) => {
    if (!compassCenter) { showToast("Placez d'abord la pointe du compas"); return }
    const cx = compassCenter.x, cy = compassCenter.y, r = compassRadius
    const start = compassAngle
    const span = spanDeg * Math.PI / 180
    const segs = Math.max(32, Math.floor(Math.abs(span)/Math.PI*64))
    const pts: Point[] = []
    for(let i=0;i<=segs;i++){ const a = start + span * (i/segs); pts.push({ x: cx + Math.cos(a)*r, y: cy + Math.sin(a)*r }) }
    const newObj: PathObj = { id: Date.now().toString(), type: 'path', points: pts, color: activeColor, width: strokeWidth, opacity, nib: 'round' }
    setObjects(o => [...o, newObj]); showToast(`Arc ${spanDeg}° tracé`)
  }
  const nudgeCompassRadius = (d: number) => setCompassRadius(v => Math.min(420, Math.max(18, v + d)))

  const handleClearDrawings = () => { setObjects([]); setRedoStack([]); showToast('Dessins effacés') }
  const handleClearAll = () => { setObjects([]); setRedoStack([]); setCamera({ x: 0, y: 0, zoom: 1 }); setEmbeddedVideos([]); setCompassCenter(null); setCompassIsDragging(false); showToast('Tableau réinitialisé') }
  const handleUndo = () => { if (objects.length === 0) return; const last = objects[objects.length - 1]; setRedoStack(r => [...r, objects]); setObjects(o => o.slice(0, -1)); void last }
  const handleRedo = () => { if (redoStack.length === 0) return; const prev = redoStack[redoStack.length - 1]; setObjects(prev); setRedoStack(r => r.slice(0, -1)) }

  const handleExport = async (type: 'png' | 'jpg' | 'pdf') => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (type === 'pdf') {
      try {
        // @ts-ignore
        const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1')
        const dpr = window.devicePixelRatio || 1
        const w = canvas.width / dpr
        const h = canvas.height / dpr
        const doc = new jsPDF({ unit: 'px', format: [w, h], orientation: w > h ? 'landscape' : 'portrait' })
        const imgData = canvas.toDataURL('image/png')
        doc.addImage(imgData, 'PNG', 0, 0, w, h)
        doc.save(`tableau-${Date.now()}.pdf`)
        showToast('Export PDF réussi ✅')
      } catch { showToast('Erreur export PDF') }
      return
    }
    const link = document.createElement('a')
    link.download = `tableau-${Date.now()}.${type}`
    link.href = canvas.toDataURL(type === 'png' ? 'image/png' : 'image/jpeg', 0.92)
    link.click()
    showToast(`Export ${type.toUpperCase()} réussi ✅`)
  }
  const startRecording = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      const videoStream = (canvas as any).captureStream(30)
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStreamRef.current = audioStream
      const combined = new MediaStream([...videoStream.getVideoTracks(), ...audioStream.getAudioTracks()])
      const chunks: Blob[] = []
      const recorder = new MediaRecorder(combined, { mimeType: 'video/webm;codecs=vp9,opus' })
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = `cours-${Date.now()}.webm`; a.click()
        audioStreamRef.current?.getTracks().forEach(t => t.stop())
        setIsRecording(false)
        showToast('Vidéo exportée ✅')
      }
      recorder.start()
      recorderRef.current = recorder
      setIsRecording(true)
      showToast('Enregistrement démarré 🎙️')
    } catch { showToast('Accès micro/canvas refusé') }
  }
  const stopRecording = () => { recorderRef.current?.stop() }

  const insertSticker = (emoji: string) => {
    const newObj: StampObj = { id: Date.now().toString(), type: 'stamp', x: 200 - camera.x / camera.zoom, y: 200 - camera.y / camera.zoom, size: 64, src: emoji }
    setObjects(o => [...o, newObj])
    setShowStickers(false)
    showToast('Sticker inséré')
  }

  const svgToImg = (svg: string, w: number, h: number) => {
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const newObj: ImageObj = { id: Date.now().toString(), type: 'image', x: 120 - camera.x / camera.zoom, y: 100 - camera.y / camera.zoom, w, h, src: url }
    setObjects(o => [...o, newObj])
  }

  const activities: { title: string; icon: string; svg: string; w: number; h: number }[] = [
    {
      title: 'Tableau de numération',
      icon: '🔢',
      w: 320,
      h: 160,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160" viewBox="0 0 320 160"><rect width="320" height="160" fill="white" stroke="#0f172a" stroke-width="2"/><line x1="80" y1="0" x2="80" y2="160" stroke="#0f172a" stroke-width="2"/><line x1="160" y1="0" x2="160" y2="160" stroke="#0f172a" stroke-width="2"/><line x1="240" y1="0" x2="240" y2="160" stroke="#0f172a" stroke-width="2"/><line x1="0" y1="60" x2="320" y2="60" stroke="#0f172a" stroke-width="2"/><text x="40" y="42" text-anchor="middle" font-size="18" font-weight="bold" fill="#0f172a">U</text><text x="120" y="42" text-anchor="middle" font-size="18" font-weight="bold" fill="#0f172a">D</text><text x="200" y="42" text-anchor="middle" font-size="18" font-weight="bold" fill="#0f172a">C</text><text x="280" y="42" text-anchor="middle" font-size="18" font-weight="bold" fill="#0f172a">M</text></svg>`
    },
    {
      title: 'Droite graduée',
      icon: '📏',
      w: 360,
      h: 100,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="100" viewBox="0 0 360 100"><rect width="360" height="100" fill="white"/><line x1="20" y1="70" x2="340" y2="70" stroke="#0f172a" stroke-width="3"/><text x="180" y="40" text-anchor="middle" font-size="16" font-weight="bold" fill="#0f172a">50</text>${[0, 1, 2, 3, 4, 5].map(i => `<line x1="${20 + i * 64}" y1="62" x2="${20 + i * 64}" y2="78" stroke="#0f172a" stroke-width="2"/><text x="${20 + i * 64}" y="92" text-anchor="middle" font-size="12" fill="#0f172a">${i * 10}</text>`).join('')}<text x="20" y="25" font-size="12" fill="#64748b">Droite graduée de 0 à 50</text></svg>`
    },
    {
      title: 'Abaque',
      icon: '🧮',
      w: 240,
      h: 140,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="white" stroke="#0f172a" stroke-width="2"/>${[0, 1, 2].map(row => `<line x1="20" y1="${35 + row * 40}" x2="220" y2="${35 + row * 40}" stroke="#0f172a" stroke-width="3"/>${[0,1,2,3,4,5,6,7,8,9].map(i => `<circle cx="${26 + i * 20}" cy="${35 + row * 40}" r="6" fill="#f59e0b" stroke="#0f172a" stroke-width="1"/>`).join('')}`).join('')}<text x="120" y="20" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">Abaque (unités, dizaines, centaines)</text></svg>`
    },
    {
      title: 'Fractions',
      icon: '🍕',
      w: 160,
      h: 160,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" fill="white"/><circle cx="80" cy="80" r="60" fill="#f472b6" stroke="#0f172a" stroke-width="2"/><line x1="80" y1="20" x2="80" y2="140" stroke="white" stroke-width="2"/><line x1="20" y1="80" x2="140" y2="80" stroke="white" stroke-width="2"/><text x="80" y="165" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">1/4</text></svg>`
    },
    {
      title: 'Décomposition',
      icon: '🧩',
      w: 280,
      h: 120,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="120" viewBox="0 0 280 120"><rect width="280" height="120" fill="white" stroke="#0f172a" stroke-width="2"/><text x="140" y="35" text-anchor="middle" font-size="16" font-weight="bold" fill="#0f172a">Décomposer 728</text><rect x="30" y="60" width="70" height="40" fill="#bae6fd" stroke="#0f172a"/><text x="65" y="86" text-anchor="middle" font-size="14" fill="#0f172a">700</text><rect x="105" y="60" width="70" height="40" fill="#bbf7d0" stroke="#0f172a"/><text x="140" y="86" text-anchor="middle" font-size="14" fill="#0f172a">20</text><rect x="180" y="60" width="70" height="40" fill="#fecaca" stroke="#0f172a"/><text x="215" y="86" text-anchor="middle" font-size="14" fill="#0f172a">8</text></svg>`
    },
    {
      title: 'Comparer',
      icon: '⚖️',
      w: 240,
      h: 100,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="100" viewBox="0 0 240 100"><rect width="240" height="100" fill="white" stroke="#0f172a" stroke-width="2"/><text x="70" y="45" text-anchor="middle" font-size="24" font-weight="bold" fill="#0f172a">34</text><text x="170" y="45" text-anchor="middle" font-size="24" font-weight="bold" fill="#0f172a">62</text><text x="120" y="45" text-anchor="middle" font-size="28" fill="#0f172a">&lt;</text><text x="120" y="80" text-anchor="middle" font-size="12" fill="#64748b">Comparer les nombres</text></svg>`
    }
  ]

  const insertActivity = (idx: number) => {
    const a = activities[idx]
    svgToImg(a.svg, a.w, a.h)
    setShowActivities(false)
    showToast(`Activité « ${a.title} » insérée`)
  }

  const generateShareLink = () => {
    const id = Math.random().toString(36).slice(2, 10)
    setShareLink(`https://tableaudumatin.app/s/${id}`)
    setShowShare(true)
  }

  const handleSaveJSON = () => {
    const data = { boardBg, boardLine, objects, camera, activeColor }
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `tableau-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url)
    showToast('Tableau sauvegardé')
  }
  const handleLoadJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        setBoardBg(data.boardBg || 'white'); setBoardLine(data.boardLine || 'none'); setObjects(data.objects || []); setCamera(data.camera || { x: 0, y: 0, zoom: 1 })
        showToast('Tableau importé avec succès')
      } catch { showToast('Fichier invalide') }
    }
    reader.readAsText(file)
  }
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      const newObj: ImageObj = { id: Date.now().toString(), type: 'image', x: 100 - camera.x / camera.zoom, y: 100 - camera.y / camera.zoom, w: 260, h: 180, src }
      setObjects(o => [...o, newObj])
      showToast('Image insérée')
    }
    reader.readAsDataURL(file)
  }
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    showToast(`PDF reçu : ${file.name} — rendu...`)
    try {
      // @ts-ignore
      const pdfjs: any = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.mjs')
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.mjs'
      const url = URL.createObjectURL(file)
      const pdf = await pdfjs.getDocument({ url }).promise
      const page = await pdf.getPage(1)
      const scale = 1.2
      const viewport = page.getViewport({ scale })
      const c = document.createElement('canvas')
      c.width = viewport.width; c.height = viewport.height
      const ctx = c.getContext('2d')!
      await page.render({ canvasContext: ctx, viewport }).promise
      const maxW = 800
      const w = Math.min(viewport.width, maxW)
      const h = w * (viewport.height / viewport.width)
      const newObj: ImageObj = { id: Date.now().toString(), type: 'image', x: 80, y: 80, w, h, src: c.toDataURL('image/png') }
      setObjects(o => [...o, newObj])
      showToast('PDF inséré')
    } catch {
      showToast('Erreur de rendu PDF')
    }
  }

  const playClap = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      for (let i = 0; i < 6; i++) {
        const o = ctx.createOscillator(), g = ctx.createGain()
        o.type = 'square'; o.frequency.value = 800 + Math.random() * 600
        g.gain.value = 0.12
        o.connect(g); g.connect(ctx.destination)
        o.start(ctx.currentTime + i * 0.07); o.stop(ctx.currentTime + i * 0.07 + 0.08)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.08)
      }
    } catch { }
    const el = document.createElement('div')
    el.textContent = '👏👏👏'
    el.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%) scale(0);font-size:64px;z-index:9999;pointer-events:none;animation:clapPop 900ms ease forwards'
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 1000)
    showToast('Applaudissements 👏')
  }
  const triggerCelebrate = () => { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3800); showToast('Bravo ! 🎉') }
  const triggerBalloons = () => { setShowBalloons(true); setTimeout(() => setShowBalloons(false), 4200); showToast('Ballons 🎈') }
  const triggerStick = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.frequency.value = 220; o.type = 'square'; g.gain.value = 0.3
      o.connect(g); g.connect(ctx.destination); o.start(); g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18); o.stop(ctx.currentTime + 0.18)
    } catch { }
    const el = document.createElement('div')
    el.textContent = '⚡ Attention !'
    el.style.cssText = 'position:fixed;left:50%;top:22%;transform:translateX(-50%);background:#ef4444;color:white;padding:10px 18px;border-radius:12px;font-weight:800;z-index:9999;animation:shake 400ms ease'
    document.body.appendChild(el); setTimeout(() => el.remove(), 900)
  }
  const triggerGavel = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.frequency.value = 140; o.type = 'triangle'; g.gain.value = 0.4
      o.connect(g); g.connect(ctx.destination); o.start(); g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28); o.stop(ctx.currentTime + 0.28)
      const o2 = ctx.createOscillator(), g2 = ctx.createGain()
      o2.frequency.value = 280; g2.gain.value = 0.2; o2.connect(g2); g2.connect(ctx.destination); o2.start(ctx.currentTime + 0.12); o2.stop(ctx.currentTime + 0.22)
    } catch { }
    const el = document.createElement('div')
    el.textContent = '🔨 Silence en classe !'
    el.style.cssText = 'position:fixed;left:50%;top:18%;transform:translate(-50%,0);background:#f59e0b;color:white;padding:10px 18px;border-radius:12px;font-weight:800;z-index:9999;animation:bounce 500ms ease'
    document.body.appendChild(el); setTimeout(() => el.remove(), 1000)
  }

  const handleCalcInput = (v: string) => {
    if (v >= '0' && v <= '9' || v === '.') {
      setCalcDisplay(d => d === '0' ? v : d + v)
    } else if (['+', '-', '×', '÷'].includes(v)) {
      setCalcPrev(parseFloat(calcDisplay)); setCalcOp(v); setCalcDisplay('0')
    } else if (v === '=') {
      if (calcPrev !== null && calcOp) {
        const cur = parseFloat(calcDisplay)
        let res = cur
        if (calcOp === '+') res = calcPrev + cur
        if (calcOp === '-') res = calcPrev - cur
        if (calcOp === '×') res = calcPrev * cur
        if (calcOp === '÷') res = cur !== 0 ? calcPrev / cur : 0
        setCalcDisplay(String(Math.round(res * 100000) / 100000)); setCalcPrev(null); setCalcOp(null)
      }
    } else if (v === 'C') { setCalcDisplay('0'); setCalcPrev(null); setCalcOp(null) }
    else if (v === '⌫') setCalcDisplay(d => d.length > 1 ? d.slice(0, -1) : '0')
  }

  const [wheelOptions, setWheelOptions] = useState(['Léo', 'Chloé', 'Noah', 'Inès', 'Adam', 'Jade', 'Louis', 'Emma'])
  const [newWheelName, setNewWheelName] = useState('')
  const spinWheel = () => {
    if (wheelSpinning) return
    setWheelSpinning(true)
    const add = 1440 + Math.random() * 1440
    setWheelRotation(r => r + add)
    setTimeout(() => {
      setWheelSpinning(false)
      const idx = Math.floor(Math.random() * wheelOptions.length)
      showToast(`Gagnant : ${wheelOptions[idx]} 🎉`)
      setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000)
    }, 3000)
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA' || (e.target as HTMLElement)?.tagName === 'SELECT') return
      if (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleUndo() }
      if (e.key.toLowerCase() === 'y' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleRedo() }
      if (e.key.toLowerCase() === 'v') setTool('select')
      if (e.key.toLowerCase() === 'h') setTool('hand')
      if (e.key.toLowerCase() === 'p') setTool('pen')
      if (e.key.toLowerCase() === 'e') setTool('eraser')
      if (e.key.toLowerCase() === 'l') setTool('line')
      if (e.key.toLowerCase() === 'a') setTool('arrow')
      if (e.key.toLowerCase() === 't') setTool('text')
      if (e.key.toLowerCase() === 's' && !e.ctrlKey) setTool('rect')
      if (e.key.toLowerCase() === 'o') { setTool('compass'); if(!compassCenter) showToast('Compas activé — cliquez pour placer la pointe 📍') }
      if (e.key === 'Escape') { setShowTimer(false); setShowRuler(false); setShowProtractor(false); setShowCurtain(false); setShowCalculator(false); setShowWheel(false); if(tool==='compass'){ setCompassIsDragging(false); (compassDragMode as any).current=null } }
      if (e.key.toLowerCase() === 'z' && !e.ctrlKey && !e.metaKey) setZenMode(z => !z)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const youtubeId = (() => {
    try {
      const u = new URL(youtubeUrl)
      if (u.hostname.includes('youtu.be')) return u.pathname.slice(1)
      return u.searchParams.get('v') || ''
    } catch { return '' }
  })()

  return (
    <div dir="ltr" className={`min-h-screen w-screen overflow-hidden select-none ${isLight ? 'bg-[#f0f4f8] text-slate-900' : 'bg-[#0b0f19] text-white'}`} style={{ fontFamily: "'Outfit', system-ui, -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Amiri:wght@400;700&family=Amiri+Quran&display=swap');
        *{scrollbar-width:thin;scrollbar-color:rgba(0,162,255,0.3) transparent}
        @keyframes crown-shimmer{0%{transform:translateX(-100%) rotate(30deg)}100%{transform:translateX(100%) rotate(30deg)}}
        @keyframes heartbeat{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
        @keyframes clapPop{0%{transform:translate(-50%,-50%) scale(0) rotate(-10deg);opacity:0}40%{transform:translate(-50%,-50%) scale(1.18) rotate(4deg);opacity:1}100%{transform:translate(-50%,-50%) scale(1) rotate(0);opacity:0}}
        @keyframes shake{0%,100%{transform:translate(-50%,0)}25%{transform:translate(-48%,0) rotate(-2deg)}75%{transform:translate(-52%,0) rotate(2deg)}}
        @keyframes bounce{0%{transform:translate(-50%,-20px) scale(0.8)}50%{transform:translate(-50%,8px) scale(1.08)}100%{transform:translate(-50%,0) scale(1)}}
        @keyframes confettiFall{0%{transform:translateY(-20vh) rotate(0) translateX(0);opacity:1}100%{transform:translateY(110vh) rotate(720deg) translateX(60px);opacity:0}}
        @keyframes balloonFloat{0%{transform:translateY(110vh) scale(0.9)}100%{transform:translateY(-20vh) scale(1.08)}}
      `}</style>

      <div ref={containerRef} className="fixed inset-0 overflow-hidden" style={{ touchAction: 'none' }}>
        <div className="absolute inset-0" style={{ background: getBoardBgColor() === 'transparent' ? 'transparent' : getBoardBgColor(), transition: 'background 0.25s' }} />
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
          className="absolute inset-0 w-full h-full block"
          style={{ cursor: tool === 'hand' ? 'grab' : tool === 'compass' ? (compassCenter ? 'crosshair' : 'copy') : tool === 'pen' ? 'crosshair' : tool === 'eraser' ? 'cell' : tool === 'text' ? 'text' : 'crosshair', touchAction: 'none' }}
        />
        <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 pointer-events-none z-10 text-[11px] font-bold tracking-wide opacity-60" style={{ color: boardBg === 'white' || boardBg === 'cream' ? '#0f172a' : 'white', textShadow: boardBg === 'white' || boardBg === 'cream' ? '0 1px 0 rgba(255,255,255,0.9)' : '0 1px 3px rgba(0,0,0,0.6)' }}>
          Tableau du Matin — Tous droits réservés
        </div>

        {embeddedVideos.map(v => (
          <div key={v.id} className="absolute z-20 group" style={{ left: v.x, top: v.y, width: 360, height: 202 }}>
            <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black">
              <iframe src={`https://www.youtube.com/embed/${v.url}?autoplay=0`} className="w-full h-full" allowFullScreen title="youtube" />
            </div>
            <button onClick={() => setEmbeddedVideos(ev => ev.filter(x => x.id !== v.id))} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white grid place-items-center text-xs opacity-0 group-hover:opacity-100 transition">✕</button>
          </div>
        ))}

        {showCurtain && (
          <div className="absolute inset-0 z-30 flex flex-col">
            <div className="flex-1 bg-[#0f172a]/95 backdrop-blur-[2px] border-b border-white/10 flex items-center justify-center relative" style={{ height: `${curtainPos}%`, flex: 'none' }}>
              <div className="text-white/60 text-sm">Faites glisser le rideau pour révéler — saisissez la poignée</div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-14 h-6 rounded-full bg-[#334155] border border-white/15 grid place-items-center cursor-ns-resize" onPointerDown={e => {
                const startY = e.clientY; const startPos = curtainPos
                const move = (ev: PointerEvent) => setCurtainPos(Math.min(95, Math.max(8, startPos + (ev.clientY - startY) / window.innerHeight * 100)))
                const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
                window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
              }}>
                <div className="w-6 h-1 rounded-full bg-white/40" />
              </div>
            </div>
            <div className="flex-1" />
            <button onClick={() => setShowCurtain(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 grid place-items-center text-white">✕</button>
          </div>
        )}
      </div>

      {/* Theme toggle - top right en LTR */}
      <button
        onClick={() => setIsLight(v => !v)}
        className={`fixed top-4 right-4 z-40 h-9 px-3 rounded-full flex items-center gap-2 text-sm font-semibold border backdrop-blur-xl transition ${isLight ? 'bg-white border-slate-200 text-slate-700 shadow-md' : 'bg-white/[0.08] border-white/15 text-white hover:bg-white/[0.12]'}`}
        title="Mode sombre / clair"
      >
        <span className="text-[16px]">{isLight ? '☀️' : '🌙'}</span>
        <span className="hidden sm:inline">{isLight ? 'Clair' : 'Sombre'}</span>
        <span className={`w-9 h-5 rounded-full relative ml-1 ${isLight ? 'bg-slate-200' : 'bg-white/15'}`}>
          <span className={`absolute top-0.5 w-4 h-4 rounded-full shadow transition ${isLight ? 'left-0.5' : 'left-4'}`} style={{ background: isLight ? '#0080cc' : 'white' }} />
        </span>
      </button>

      {/* Top bar central */}
      {!zenMode && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-2 py-1.5 rounded-2xl backdrop-blur-xl border shadow-[0_8px_24px_rgba(0,0,0,0.25)] max-w-[96vw] overflow-x-auto ${isLight ? 'bg-white/92 border-slate-200' : 'bg-[rgba(15,23,42,0.92)] border-white/[0.12]'}`}>
          <button onClick={() => setCamera({ x: 0, y: 0, zoom: 1 })} title="Centrer la vue" className={`w-9 h-9 shrink-0 grid place-items-center rounded-xl border transition ${isLight ? 'bg-slate-50 border-slate-200 hover:bg-white text-slate-600' : 'bg-white/[0.06] border-white/10 hover:bg-white/[0.10] text-white/80'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          </button>
          <button onClick={handleClearDrawings} title="Effacer les dessins" className="w-9 h-9 shrink-0 grid place-items-center rounded-xl bg-white/[0.06] border border-white/10 text-amber-400 hover:bg-amber-500/15">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
          </button>
          <button onClick={handleClearAll} title="Réinitialiser tout" className="w-9 h-9 shrink-0 grid place-items-center rounded-xl bg-white/[0.06] border border-white/10 text-red-400 hover:bg-red-500/15">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          </button>
          <div className="w-px h-4 bg-white/15 mx-1 shrink-0" />
          <button onClick={playClap} className="px-2.5 py-1.5 shrink-0 rounded-xl text-[15px] leading-none bg-amber-400/15 border border-amber-400/30 hover:scale-105 transition">👏</button>
          <button onClick={triggerCelebrate} className="px-2.5 py-1.5 shrink-0 rounded-xl text-[15px] leading-none bg-purple-500/15 border border-purple-500/30 hover:scale-105 transition">🎉</button>
          <button onClick={triggerBalloons} className="px-2.5 py-1.5 shrink-0 rounded-xl text-[15px] leading-none bg-rose-500/15 border border-rose-500/30 hover:scale-105 transition">🎈</button>
          <button onClick={triggerStick} className="px-2.5 py-1.5 shrink-0 rounded-xl bg-red-500/15 border border-red-500/30 grid place-items-center hover:scale-105 transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" style={{ transform: 'rotate(-20deg)' }}><line x1="12" y1="3" x2="12" y2="21" /><line x1="10" y1="21" x2="14" y2="21" /><circle cx="12" cy="3" r="1.5" fill="currentColor" /></svg>
          </button>
          <button onClick={triggerGavel} className="px-2.5 py-1.5 shrink-0 rounded-xl bg-amber-500/15 border border-amber-500/30 grid place-items-center hover:scale-105 transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="m14 13-5 5m6-12-3-3a1 1 0 0 0-1.4 0L2.3 12a1 1 0 0 0 0 1.4l3 3a1 1 0 0 0 1.4 0l8.3-8.3M16 5l3 3M19 8l2.5-2.5a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0L16 5" /><path d="m6 16-4 4" /></svg>
          </button>
          <button onClick={() => { setShowGif(true); setTimeout(() => setShowGif(false), 2600) }} className="px-2.5 py-1.5 shrink-0 rounded-xl text-[15px] leading-none bg-emerald-500/15 border border-emerald-500/30 hover:scale-105 transition">🎊</button>
          <button onClick={() => setZenMode(v => !v)} className="px-2.5 py-1.5 shrink-0 rounded-xl text-[15px] leading-none bg-sky-500/15 border border-sky-500/30">👁️</button>

          {isPro ? (
            <span className="hidden md:flex items-center gap-1.5 ml-1 px-3 py-1.5 shrink-0 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-400 text-white text-[12.5px] font-extrabold shadow">👑 Pro</span>
          ) : (
            <button onClick={() => setShowUpgrade(true)} className="hidden md:flex relative overflow-hidden items-center gap-1.5 ml-1 px-3 py-1.5 shrink-0 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 border border-amber-400 text-white text-[12.5px] font-extrabold shadow-[0_0_14px_rgba(245,158,11,0.45)] hover:scale-[1.02] transition">
              <span>👑 Passer en Pro</span>
              <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(60deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)', animation: 'crown-shimmer 2.5s infinite', transform: 'rotate(30deg)' as any }} />
            </button>
          )}
          <button onClick={() => setShowAbout(true)} className="ml-1 shrink-0 text-[20px] leading-none hover:scale-110 transition" style={{ animation: 'heartbeat 1.3s ease-in-out infinite' }}>❤️</button>
        </div>
      )}

      {!zenMode && (
        <>
          {/* Panneau gauche - Paramètres tableau (LTR: à gauche) */}
          <div className={`hidden lg:flex fixed top-[76px] bottom-[90px] left-4 w-[300px] z-30 flex-col gap-4 p-4 rounded-[20px] backdrop-blur-xl border shadow-[0_8px_28px_rgba(0,0,0,0.28)] overflow-auto ${showLeft ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6 pointer-events-none'} transition-all ${isLight ? 'bg-white/92 border-slate-200' : 'bg-[rgba(15,23,42,0.92)] border-white/10'}`}>
            <button onClick={() => setShowLeft(false)} className="absolute top-3 right-3 w-7 h-7 grid place-items-center rounded-full bg-black/5 hover:bg-black/10 text-slate-500 text-xs">✕</button>
            <div className="text-center">
              <h2 className={`text-[19px] font-extrabold ${isLight ? 'text-sky-600' : 'text-[#00a2ff]'}`}>Tableau du Matin</h2>
              <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Tableau blanc infini & intelligent</div>
            </div>

            <div>
              <h3 className={`text-[13px] font-bold mb-2 ${isLight ? 'text-slate-700' : 'text-white'}`}>Couleur du tableau</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(BOARD_COLORS).map(([key, col]) => (
                  <button key={key} onClick={() => setBoardBg(key)} title={key} className={`w-7 h-7 rounded-full border-2 transition ${boardBg === key ? 'scale-110 ring-2 ring-sky-400' : 'border-transparent'} ${key === 'transparent' ? 'border-dashed !border-slate-300' : ''}`} style={{ background: col === 'transparent' ? 'transparent' : col, borderColor: boardBg === key ? '#0ea5e9' : col === '#ffffff' ? '#cbd5e1' : 'transparent' }} />
                ))}
                <label className="w-7 h-7 rounded-full border-2 border-transparent cursor-pointer" style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}>
                  <input type="color" value={customBg} onChange={e => { setCustomBg(e.target.value); setBoardBg('custom') }} className="opacity-0 w-0 h-0" />
                </label>
              </div>
            </div>

            <div>
              <h3 className={`text-[13px] font-bold mb-2 ${isLight ? 'text-slate-700' : 'text-white'}`}>Grille & lignage</h3>
              <div className="grid grid-cols-3 gap-1.5">
                {Object.entries(gridLabels).map(([k, label]) => (
                  <button key={k} onClick={() => setBoardLine(k)} className={`text-[11px] py-2 rounded-xl border font-semibold transition ${boardLine === k ? 'bg-sky-500 text-white border-sky-500 shadow' : isLight ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white' : 'bg-white/[0.06] border-white/10 text-slate-300 hover:bg-white/[0.10]'}`}>{label}</button>
                ))}
              </div>
            </div>

            <div>
              <h3 className={`text-[13px] font-bold mb-2 ${isLight ? 'text-slate-700' : 'text-white'}`}>Projet & Export</h3>
              <div className="flex flex-col gap-2">
                <button onClick={handleSaveJSON} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold border transition ${isLight ? 'bg-slate-900 text-white border-slate-900 hover:bg-black' : 'bg-white text-slate-900 hover:bg-slate-100'}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                  Sauvegarder le tableau
                </button>
                <label className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold border cursor-pointer transition ${isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-white/[0.06] border-white/10 text-white hover:bg-white/[0.10]'}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M14 9l-2-2-2 2M12 7v8" /></svg>
                  Importer un tableau
                  <input type="file" accept=".json" onChange={handleLoadJSON} className="hidden" />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleExport('png')} className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold border ${isLight ? 'bg-white border-slate-200 hover:bg-slate-50' : 'bg-white/[0.06] border-white/10 hover:bg-white/[0.10] text-white'}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                    Export PNG
                  </button>
                  <button onClick={() => handleExport('pdf')} className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold border ${isLight ? 'bg-white border-slate-200 hover:bg-slate-50' : 'bg-white/[0.06] border-white/10 hover:bg-white/[0.10] text-white'}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                    Export PDF
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handleUndo} className={`py-2 rounded-xl text-xs font-bold border ${isLight ? 'bg-white border-slate-200' : 'bg-white/[0.06] border-white/10 text-white'}`}>Annuler ↩️</button>
                  <button onClick={handleRedo} className={`py-2 rounded-xl text-xs font-bold border ${isLight ? 'bg-white border-slate-200' : 'bg-white/[0.06] border-white/10 text-white'}`}>Rétablir ↪️</button>
                </div>
                <button onClick={() => setShowShortcuts(true)} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold border ${isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-white/[0.05] border-white/10 text-slate-300'}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  Raccourcis clavier
                </button>
              </div>
            </div>

            <div className={`mt-auto pt-3 text-center text-[10px] border-t ${isLight ? 'text-slate-400 border-slate-100' : 'text-slate-500 border-white/5'}`}>
              Tous droits réservés — Tableau du Matin 2025
            </div>
          </div>

          {/* Panneau droit - Propriétés & Médias */}
          <div className={`hidden lg:flex fixed top-[76px] bottom-[90px] right-4 w-[300px] z-30 flex-col gap-4 p-4 rounded-[20px] backdrop-blur-xl border shadow-[0_8px_28px_rgba(0,0,0,0.28)] overflow-auto ${showRight ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition ${isLight ? 'bg-white/92 border-slate-200' : 'bg-[rgba(15,23,42,0.92)] border-white/10'}`}>
            <button onClick={() => setShowRight(false)} className="absolute top-3 right-3 w-7 h-7 grid place-items-center rounded-full bg-black/5 hover:bg-black/10 text-slate-500 text-xs">✕</button>

            <div>
              <h3 className={`text-[13px] font-bold mb-3 ${isLight ? 'text-slate-700' : 'text-white'}`}>Propriétés de l'outil</h3>
              <div className={`rounded-2xl p-3 border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/[0.04] border-white/5'}`}>
                <label className={`text-[12px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Couleur active</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['#00a2ff', '#ff4d4d', '#10b981', '#f59e0b', '#a855f7', '#ffffff', '#121212', '#e11d48', '#06b6d4', '#84cc16'].map(c => (
                    <button key={c} onClick={() => setActiveColor(c)} className={`w-7 h-7 rounded-full border-2 transition ${activeColor === c ? 'scale-110 ring-2 ring-sky-400' : ''}`} style={{ background: c, borderColor: c === '#ffffff' ? '#e2e8f0' : 'transparent' }} />
                  ))}
                  <label className="w-7 h-7 rounded-full border-2 border-white/20 cursor-pointer relative overflow-hidden" style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}>
                    <input type="color" value={activeColor} onChange={e => setActiveColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </label>
                </div>

                <div className="mt-4">
                  <label className={`text-[12px] font-semibold flex justify-between ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Épaisseur du trait : <span className="text-sky-500 font-extrabold">{(strokeWidth/28).toFixed(1)} cm</span></label>
                  <input type="range" min={1} max={40} value={strokeWidth} onChange={e => setStrokeWidth(parseInt(e.target.value))} className="w-full mt-1 accent-sky-500" />
                </div>
                <div className="mt-3">
                  <label className={`text-[12px] font-semibold flex justify-between ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Opacité : <span className="text-sky-500 font-extrabold">{opacity}%</span></label>
                  <input type="range" min={10} max={100} value={opacity} onChange={e => setOpacity(parseInt(e.target.value))} className="w-full mt-1 accent-sky-500" />
                </div>
                <div className={`mt-3 text-[11px] rounded-xl px-2.5 py-2 border flex items-center justify-between ${isLight ? 'bg-white border-slate-100 text-slate-500' : 'bg-black/20 border-white/5 text-slate-400'}`}>
                  <span>Outil actuel</span><span className="font-bold text-sky-500 capitalize">{tool}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className={`text-[13px] font-bold mb-2 ${isLight ? 'text-slate-700' : 'text-white'}`}>Médias & Outils</h3>
              <div className="flex flex-col gap-2">
                <label className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold border cursor-pointer ${isLight ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700' : 'bg-white/[0.06] border-white/10 hover:bg-white/[0.10] text-white'}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                  Insérer une image
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <label className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold border cursor-pointer ${isLight ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700' : 'bg-white/[0.06] border-white/10 hover:bg-white/[0.10] text-white'}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                  Importer un PDF
                  <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
                </label>
                <button onClick={() => setShowYoutube(true)} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold border ${isLight ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700' : 'bg-white/[0.06] border-white/10 hover:bg-white/[0.10] text-white'}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                  Insérer vidéo YouTube 🎥
                </button>
                <button onClick={() => setShowQuran(true)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold border bg-gradient-to-br from-teal-600 to-teal-700 border-teal-500 text-white shadow">
                  <span>🌦️</span> Météo du jour
                </button>
                <div className={`grid grid-cols-3 gap-2 pt-2 mt-1 border-t ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                  <button onClick={() => setShowWheel(true)} className={`py-2 rounded-xl text-[11px] font-bold border ${isLight ? 'bg-white border-slate-200' : 'bg-white/[0.06] border-white/10 text-white'}`}>🎡 Roue</button>
                  <button onClick={() => setShowCalculator(c => !c)} className={`py-2 rounded-xl text-[11px] font-bold border ${showCalculator ? 'bg-sky-500 text-white border-sky-500' : isLight ? 'bg-white border-slate-200' : 'bg-white/[0.06] border-white/10 text-white'}`}>🧮 Calculatrice</button>
                  <button onClick={() => setShowCurtain(c => !c)} className={`py-2 rounded-xl text-[11px] font-bold border ${showCurtain ? 'bg-slate-700 text-white' : isLight ? 'bg-white border-slate-200' : 'bg-white/[0.06] border-white/10 text-white'}`}>🫣 Rideau</button>
                  <button onClick={() => setShowActivities(true)} className={`py-2 rounded-xl text-[11px] font-bold border col-span-3 ${isLight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-600/20 border-rose-500/30 text-rose-200'}`}>🎒 Activités pédagogiques</button>
                </div>
              </div>
            </div>

            {isPro && (
              <div className="rounded-2xl p-3 border bg-gradient-to-br from-amber-500/10 to-amber-700/10 border-amber-500/20">
                <h3 className={`text-[13px] font-bold mb-2 ${isLight ? 'text-amber-800' : 'text-amber-200'}`}>👑 Fonctions Pro</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={isRecording ? stopRecording : startRecording} className={`py-2 rounded-xl text-[11px] font-bold border ${isRecording ? 'bg-red-500 text-white border-red-500' : 'bg-amber-600 text-white border-amber-600'}`}>{isRecording ? 'Arrêter 🎬' : 'Exporter vidéo 🎬'}</button>
                  <button onClick={() => setShowStickers(true)} className="py-2 rounded-xl text-[11px] font-bold border bg-emerald-600 text-white border-emerald-600">Stickers 🧩</button>
                  <button onClick={generateShareLink} className="py-2 rounded-xl text-[11px] font-bold border bg-sky-600 text-white border-sky-600">Partager 👥</button>
                  <button onClick={() => showToast('Sauvegarde cloud active')} className="py-2 rounded-xl text-[11px] font-bold border bg-violet-600 text-white border-violet-600">Cloud ☁️</button>
                </div>
              </div>
            )}

            <div className={`rounded-2xl p-3 border flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/[0.04] border-white/5'}`}>
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Zoom</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setCamera(c => ({ ...c, zoom: Math.max(0.2, c.zoom - 0.1) }))} className="w-7 h-7 rounded-lg bg-white border border-slate-200 grid place-items-center text-slate-600">−</button>
                <span className="text-xs font-bold min-w-[48px] text-center" style={{ color: isLight ? '#0f172a' : 'white' }}>{Math.round(camera.zoom * 100)}%</span>
                <button onClick={() => setCamera(c => ({ ...c, zoom: Math.min(4, c.zoom + 0.1) }))} className="w-7 h-7 rounded-lg bg-white border border-slate-200 grid place-items-center text-slate-600">+</button>
              </div>
            </div>
          </div>

          <button onClick={() => setShowLeft(v => !v)} className={`fixed top-[74px] left-3 z-40 w-11 h-11 rounded-2xl grid place-items-center text-lg backdrop-blur-xl border shadow ${isLight ? 'bg-white border-slate-200' : 'bg-[rgba(15,23,42,0.92)] border-white/10 text-white'}`}>⚙️</button>
          <button onClick={() => setShowRight(v => !v)} className={`fixed top-[74px] right-3 z-40 w-11 h-11 rounded-2xl grid place-items-center text-lg backdrop-blur-xl border shadow ${isLight ? 'bg-white border-slate-200' : 'bg-[rgba(15,23,42,0.92)] border-white/10 text-white'}`}>🎨</button>

          {showLeft && (
            <div className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={() => setShowLeft(false)}>
              <div onClick={e => e.stopPropagation()} className={`absolute top-0 left-0 bottom-0 w-[84%] max-w-[360px] overflow-auto p-4 flex flex-col gap-4 ${isLight ? 'bg-white' : 'bg-[#0f172a]'} `}>
                <div className="flex justify-between items-center">
                  <h2 className="font-extrabold text-sky-500">Tableau du Matin</h2>
                  <button onClick={() => setShowLeft(false)} className="w-8 h-8 rounded-full bg-black/10 grid place-items-center">✕</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(BOARD_COLORS).map(([k, col]) => (
                    <button key={k} onClick={() => setBoardBg(k)} className={`w-8 h-8 rounded-full border-2 ${boardBg === k ? 'ring-2 ring-sky-400' : ''}`} style={{ background: col === 'transparent' ? 'transparent' : col, borderColor: col === '#ffffff' ? '#e2e8f0' : 'transparent' }} />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.entries(gridLabels).map(([k, l]) => (
                    <button key={k} onClick={() => setBoardLine(k)} className={`py-2 rounded-xl text-xs font-bold border ${boardLine === k ? 'bg-sky-500 text-white' : 'bg-slate-50 border-slate-200'}`}>{l}</button>
                  ))}
                </div>
                <button onClick={handleSaveJSON} className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold">Sauvegarder</button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleExport('png')} className="py-3 rounded-xl bg-white border font-bold">PNG</button>
                  <button onClick={() => handleExport('pdf')} className="py-3 rounded-xl bg-white border font-bold">PDF</button>
                </div>
              </div>
            </div>
          )}
          {showRight && (
            <div className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={() => setShowRight(false)}>
              <div onClick={e => e.stopPropagation()} className={`absolute top-0 right-0 bottom-0 w-[84%] max-w-[360px] overflow-auto p-4 flex flex-col gap-4 ${isLight ? 'bg-white' : 'bg-[#0f172a]'}`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">Propriétés de l'outil</h3>
                  <button onClick={() => setShowRight(false)} className="w-8 h-8 rounded-full bg-black/10 grid place-items-center">✕</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['#00a2ff', '#ff4d4d', '#10b981', '#f59e0b', '#a855f7', '#ffffff', '#121212'].map(c => (
                    <button key={c} onClick={() => setActiveColor(c)} className={`w-8 h-8 rounded-full border-2 ${activeColor === c ? 'ring-2 ring-sky-400' : ''}`} style={{ background: c, borderColor: c === '#ffffff' ? '#e2e8f0' : 'transparent' }} />
                  ))}
                </div>
                <label className="text-xs">Épaisseur : {(strokeWidth/28).toFixed(1)} cm <input type="range" min={1} max={40} value={strokeWidth} onChange={e => setStrokeWidth(parseInt(e.target.value))} className="w-full accent-sky-500" /></label>
                <label className="text-xs">Opacité : {opacity}% <input type="range" min={10} max={100} value={opacity} onChange={e => setOpacity(parseInt(e.target.value))} className="w-full accent-sky-500" /></label>
                <label className="w-full py-3 rounded-xl bg-white border flex items-center justify-center gap-2 font-bold"> Insérer image <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /></label>
                <button onClick={() => setShowQuran(true)} className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold">📖 Coran</button>
                <button onClick={() => setShowYoutube(true)} className="w-full py-3 rounded-xl bg-white border font-bold">🎥 YouTube</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Barre d'outils flottante */}
      <div className={`fixed bottom-3 left-1/2 -translate-x-1/2 z-40 max-w-[min(96vw,1180px)] w-auto flex flex-wrap items-center justify-center gap-1 px-2 py-2 rounded-[18px] backdrop-blur-xl border shadow-[0_12px_32px_rgba(0,0,0,0.32)] ${zenMode ? 'translate-y-[140%]' : ''} transition-transform ${isLight ? 'bg-white/96 border-slate-200' : 'bg-[rgba(15,23,42,0.94)] border-white/12'}`}>
        <button onClick={() => setTool('select')} title="Sélection (V)" className={`w-[42px] h-[42px] grid place-items-center rounded-xl border transition ${tool === 'select' ? 'bg-sky-500 border-sky-500 text-white shadow' : isLight ? 'bg-slate-50 border-slate-200 hover:bg-white text-slate-600' : 'bg-white/[0.06] border-white/10 hover:bg-white/[0.10] text-white'}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 3l14 9-7 2-3 7L5 3z" fill={tool === 'select' ? 'white' : '#60a5fa'} stroke={tool === 'select' ? 'white' : '#3b82f6'} strokeWidth="1.5" strokeLinejoin="round" /></svg>
        </button>
        <button onClick={() => setTool('hand')} title="Main — déplacer (H)" className={`w-[42px] h-[42px] grid place-items-center rounded-xl border ${tool === 'hand' ? 'bg-amber-500 border-amber-500 text-white shadow' : isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-white/[0.06] border-white/10 text-amber-400'}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V5a2 2 0 0 0-4 0v5M10 10.5V6a2 2 0 0 0-4 0v8.5M6 14v-1.5a2 2 0 0 0-4 0V18a6 6 0 0 0 6 6h4a10 10 0 0 0 10-10v-3a2 2 0 0 0-4 0v2" /></svg>
        </button>

        <div className="relative">
          <button onClick={() => { setTool('pen'); setShowPenMenu(v => !v) }} title="Stylo (P)" className={`w-[52px] h-[42px] grid place-items-center rounded-xl border ${tool === 'pen' ? 'bg-blue-600 border-blue-600 text-white shadow' : isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.06] border-white/10'} relative`}>
            <span className="flex flex-col items-center leading-none">
              <svg width="20" height="20" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill={tool === 'pen' ? 'white' : '#3b82f6'} /><path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill={tool === 'pen' ? 'rgba(255,255,255,0.85)' : '#1d4ed8'} /></svg>
              <span className="text-[7px] mt-0.5 font-bold" style={{ color: tool === 'pen' ? 'white' : '#3b82f6' }}>▼ {nib === 'round' ? 'Rond' : nib === 'calligraphy' ? 'Calli.' : nib === 'brush' ? 'Pinceau' : nib === 'chalk' ? 'Craie' : nib === 'highlighter' ? 'Marqueur' : 'Spray'}</span>
            </span>
          </button>
          {showPenMenu && (
            <div className={`absolute bottom-[52px] left-1/2 -translate-x-1/2 w-[160px] rounded-2xl border shadow-xl p-2 flex flex-col gap-1 z-50 ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-white/10'}`}>
              {[
                { k: 'round', l: '✒️ Pointe ronde' },
                { k: 'calligraphy', l: '🖋️ Calligraphie' },
                { k: 'brush', l: '🖌️ Pinceau' },
                { k: 'chalk', l: '✏️ Craie' },
                { k: 'highlighter', l: '🖍️ Marqueur' },
                { k: 'spray', l: '💨 Aérosol' },
              ].map(it => (
                <button key={it.k} onClick={() => { setNib(it.k); setTool('pen'); setShowPenMenu(false) }} className={`text-left px-3 py-2 rounded-xl text-xs font-bold ${nib === it.k ? 'bg-sky-500 text-white' : isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-white/5 text-white'}`}>{it.l}</button>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => setTool('highlighter')} title="Surligneur (I)" className={`w-[42px] h-[42px] grid place-items-center rounded-xl border ${tool === 'highlighter' ? 'bg-amber-400 border-amber-400 text-slate-900' : 'bg-[#fde68a]/20 border-amber-400/20'}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14 2l4 4L7 17H3v-4L14 2z" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5" /><path d="M3 21h18" stroke="#f59e0b" strokeWidth="2" /></svg>
        </button>

        <div className="relative">
          <button onClick={() => { setTool('eraser'); setShowEraserMenu(v => !v) }} title="Gomme (E)" className={`w-[52px] h-[42px] grid place-items-center rounded-xl border ${tool === 'eraser' ? 'bg-red-500 border-red-500 text-white' : isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.06] border-white/10'}`}>
            <span className="flex flex-col items-center">
              <svg width="20" height="20" viewBox="0 0 24 24"><path d="M20.71 7.04L16.66 3a1 1 0 0 0-1.41 0L3.51 14.74c-.78.78-.78 2.05 0 2.83l2.83 2.83c.78.78 2.05.78 2.83 0L20.71 8.45a1 1 0 0 0 0-1.41z" fill={tool === 'eraser' ? 'white' : '#fca5a5'} stroke={tool === 'eraser' ? 'white' : '#ef4444'} strokeWidth="1.2" /><path d="M3 21h8" stroke={tool === 'eraser' ? 'white' : '#ef4444'} strokeWidth="2" strokeLinecap="round" /></svg>
              <span className="text-[7px] font-bold" style={{ color: tool === 'eraser' ? 'white' : '#ef4444' }}>▼ {eraserType === 'object' ? 'Objet' : 'Pixel'}</span>
            </span>
          </button>
          {showEraserMenu && (
            <div className={`absolute bottom-[52px] left-1/2 -translate-x-1/2 w-[160px] rounded-2xl border shadow-xl p-2 flex flex-col gap-1 ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-white/10'}`}>
              <button onClick={() => { setEraserType('object'); setShowEraserMenu(false) }} className={`px-3 py-2 rounded-xl text-xs font-bold text-left ${eraserType === 'object' ? 'bg-red-500 text-white' : isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5 text-white'}`}>🧹 Gomme d'objets</button>
              <button onClick={() => { setEraserType('pixel'); setShowEraserMenu(false) }} className={`px-3 py-2 rounded-xl text-xs font-bold text-left ${eraserType === 'pixel' ? 'bg-red-500 text-white' : isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5 text-white'}`}>🧽 Gomme pixel</button>
            </div>
          )}
        </div>

        <div className="w-px h-7 bg-white/10 mx-1 hidden sm:block" />

        <div className="relative">
          <button onClick={() => { setTool('line'); setShowLineMenu(v => !v) }} title="Ligne (L)" className={`w-[52px] h-[42px] grid place-items-center rounded-xl border ${tool === 'line' ? 'bg-violet-600 border-violet-600 text-white' : isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.06] border-white/10'}`}>
            <span className="flex flex-col items-center">
              <svg width="20" height="20" viewBox="0 0 24 24"><line x1="4" y1="20" x2="20" y2="4" stroke={tool === 'line' ? 'white' : '#a78bfa'} strokeWidth="2.5" strokeLinecap="round" /><circle cx="4" cy="20" r="2" fill={tool === 'line' ? 'white' : '#7c3aed'} /><circle cx="20" cy="4" r="2" fill={tool === 'line' ? 'white' : '#7c3aed'} /></svg>
              <span className="text-[7px] font-bold" style={{ color: tool === 'line' ? 'white' : '#a78bfa' }}>▼ Ligne</span>
            </span>
          </button>
          {showLineMenu && (
            <div className={`absolute bottom-[52px] left-1/2 -translate-x-1/2 w-[160px] rounded-2xl border shadow-xl p-2 flex flex-col gap-1 ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-white/10'}`}>
              {[
                { k: 'solid', l: 'Trait continu' },
                { k: 'dotted', l: 'Trait pointillé' },
                { k: 'double', l: 'Double trait' },
              ].map(it => (
                <button key={it.k} onClick={() => { setLineStyle(it.k); setTool('line'); setShowLineMenu(false) }} className={`px-3 py-2 rounded-xl text-xs font-bold text-left ${lineStyle === it.k ? 'bg-violet-600 text-white' : isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5 text-white'}`}>{it.l}</button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => { setTool('arrow'); setShowArrowMenu(v => !v) }} title="Flèche (A)" className={`w-[52px] h-[42px] grid place-items-center rounded-xl border ${tool === 'arrow' ? 'bg-emerald-600 border-emerald-600 text-white' : isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.06] border-white/10'}`}>
            <span className="flex flex-col items-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tool === 'arrow' ? 'white' : '#34d399'} strokeWidth="2.2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              <span className="text-[7px] font-bold" style={{ color: tool === 'arrow' ? 'white' : '#34d399' }}>▼ Flèche</span>
            </span>
          </button>
          {showArrowMenu && (
            <div className={`absolute bottom-[52px] left-1/2 -translate-x-1/2 w-[160px] rounded-2xl border shadow-xl p-2 flex flex-col gap-1 ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-white/10'}`}>
              {[
                { k: 'solid', l: 'Flèche continue' },
                { k: 'dotted', l: 'Flèche pointillée' },
                { k: 'double', l: 'Flèche double' },
              ].map(it => (
                <button key={it.k} onClick={() => { setArrowStyle(it.k); setTool('arrow'); setShowArrowMenu(false) }} className={`px-3 py-2 rounded-xl text-xs font-bold text-left ${arrowStyle === it.k ? 'bg-emerald-600 text-white' : isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5 text-white'}`}>{it.l}</button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => { setTool('rect'); setShowShapesMenu(v => !v) }} title="Formes (S)" className={`w-[52px] h-[42px] grid place-items-center rounded-xl border ${tool === 'rect' ? 'bg-sky-600 border-sky-600 text-white' : isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.06] border-white/10'}`}>
            <span className="flex flex-col items-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tool === 'rect' ? 'white' : '#60a5fa'} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
              <span className="text-[7px] font-bold" style={{ color: tool === 'rect' ? 'white' : '#60a5fa' }}>▼ Formes</span>
            </span>
          </button>
          {showShapesMenu && (
            <div className={`absolute bottom-[54px] left-1/2 -translate-x-1/2 w-[220px] rounded-2xl border shadow-2xl p-3 grid grid-cols-4 gap-1.5 ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-white/10'}`}>
              {[
                { k: 'rect', icon: <rect x="3" y="6" width="18" height="12" rx="1.5" />, c: '#3b82f6', t: 'Rectangle' },
                { k: 'square', icon: <rect x="4" y="4" width="16" height="16" rx="2" />, c: '#60a5fa', t: 'Carré' },
                { k: 'circle', icon: <circle cx="12" cy="12" r="10" />, c: '#f472b6', t: 'Cercle' },
                { k: 'triangle', icon: <polygon points="12,3 1,21 23,21" />, c: '#34d399', t: 'Triangle' },
                { k: 'right-triangle', icon: <polygon points="4,4 4,20 20,20" />, c: '#a78bfa', t: 'Triangle rect.' },
                { k: 'pentagon', icon: <polygon points="12,2 22,8.5 18,20 6,20 2,8.5" />, c: '#fb923c', t: 'Pentagone' },
                { k: 'hexagon', icon: <polygon points="12,2 22,6.5 22,17.5 12,22 2,17.5 2,6.5" />, c: '#fbbf24', t: 'Hexagone' },
                { k: 'rhombus', icon: <polygon points="12,2 22,12 12,22 2,12" />, c: '#e879f9', t: 'Losange' },
                { k: 'parallelogram', icon: <polygon points="6,4 22,4 18,20 2,20" />, c: '#2dd4bf', t: 'Parallélogramme' },
                { k: 'trapezoid', icon: <polygon points="6,4 18,4 22,20 2,20" />, c: '#f87171', t: 'Trapèze' },
                { k: 'star', icon: <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />, c: '#f59e0b', t: 'Étoile' },
                { k: 'heart', icon: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />, c: '#ef4444', t: 'Cœur' },
                { k: 'cube', icon: <g><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></g>, c: '#f43f5e', t: 'Cube' },
                { k: 'cylinder', icon: <g><ellipse cx="12" cy="5" rx="6" ry="2.5" /><ellipse cx="12" cy="19" rx="6" ry="2.5" /><line x1="6" y1="5" x2="6" y2="19" /><line x1="18" y1="5" x2="18" y2="19" /></g>, c: '#06b6d4', t: 'Cylindre' },
                { k: 'cone', icon: <g><ellipse cx="12" cy="19" rx="7" ry="3" /><line x1="5" y1="19" x2="12" y2="3" /><line x1="19" y1="19" x2="12" y2="3" /></g>, c: '#eab308', t: 'Cône' },
                { k: 'speech-bubble', icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />, c: '#0ea5e9', t: 'Bulle' },
              ].map(it => (
                <button key={it.k} onClick={() => { setShape(it.k); setTool('rect'); setShowShapesMenu(false) }} title={it.t} className={`aspect-square grid place-items-center rounded-xl border ${shape === it.k ? 'bg-sky-500 border-sky-500 text-white' : isLight ? 'bg-slate-50 border-slate-200 hover:bg-white' : 'bg-white/[0.06] border-white/10 hover:bg-white/10'}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={shape === it.k ? 'white' : it.c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{it.icon}</svg>
                </button>
              ))}
              <div className="col-span-4 flex gap-1.5 mt-1 pt-2 border-t border-white/10">
                <button onClick={() => setFilled(false)} className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold border ${!filled ? 'bg-sky-500 text-white border-sky-500' : 'bg-white/5 border-white/10 text-white'}`}>Contour</button>
                <button onClick={() => setFilled(true)} className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold border ${filled ? 'bg-sky-500 text-white border-sky-500' : 'bg-white/5 border-white/10 text-white'}`}>Rempli</button>
              </div>
            </div>
          )}
        </div>

        <button onClick={() => setTool('text')} title="Texte (T)" className={`w-[42px] h-[42px] grid place-items-center rounded-xl border ${tool === 'text' ? 'bg-orange-500 border-orange-500 text-white' : 'bg-orange-500/12 border-orange-500/20'}`}>
          <svg width="20" height="20" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="3" fill={tool === 'text' ? 'white' : '#fed7aa'} opacity={tool === 'text' ? '0.25' : '0.45'} /><path d="M5 4v3h5.5v12h3V7H19V4z" fill={tool === 'text' ? 'white' : '#f97316'} /></svg>
        </button>

        <div className="w-px h-7 bg-white/10 mx-1 hidden sm:block" />

        <button onClick={() => setTool('laser')} title="Laser (K)" className={`w-[42px] h-[42px] grid place-items-center rounded-xl border ${tool === 'laser' ? 'bg-red-500 border-red-500 scale-105' : 'bg-white/[0.06] border-white/10'}`}>
          <span className="relative">
            <span className="w-3 h-3 rounded-full bg-red-500 block shadow-[0_0_10px_rgba(239,68,68,0.9)]" />
            <span className="absolute inset-0 w-3 h-3 rounded-full border border-red-400 animate-ping opacity-60" />
          </span>
        </button>
        <button onClick={() => setTool('spotlight')} title="Projecteur" className={`w-[42px] h-[42px] grid place-items-center rounded-xl border ${tool === 'spotlight' ? 'bg-amber-400 border-amber-400 text-slate-900' : 'bg-white/[0.06] border-white/10 text-amber-400'}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="12" r="3.5" fill="currentColor" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
        <button onClick={() => setTool('magnifier')} title="Loupe (G)" className={`w-[42px] h-[42px] grid place-items-center rounded-xl border ${tool === 'magnifier' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white/[0.06] border-white/10 text-emerald-400'}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="2" /><circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1" fill="white" opacity="0.5" /><line x1="15.5" y1="15.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
        </button>
        <button onClick={() => setTool('magic-pen')} title="Stylo magique (M)" className={`w-[42px] h-[42px] grid place-items-center rounded-xl border ${tool === 'magic-pen' ? 'bg-violet-600 border-violet-600 text-white' : 'bg-white/[0.06] border-white/10 text-violet-400'}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 2l4 4L8 20H4v-4L18 2z" fill="#e9d5ff" stroke="currentColor" strokeWidth="1.5" /><path d="M15 5l4 4" stroke="currentColor" strokeWidth="1.5" /><circle cx="3" cy="3" r="1.5" fill="#c084fc" /></svg>
        </button>
        <button onClick={() => setTool('sticky')} title="Post-it (W)" className={`w-[42px] h-[42px] grid place-items-center rounded-xl border ${tool === 'sticky' ? 'bg-yellow-400 border-yellow-400' : 'bg-yellow-400/15 border-yellow-400/30'}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9z" fill="#fef08a" stroke="#eab308" strokeWidth="1.5" /><path d="M14 3v6h6" stroke="#ca8a04" strokeWidth="1.5" /><path d="M6 13h12M6 17h8" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
        <button onClick={() => setShowCurtain(v => !v)} title="Rideau (C)" className={`w-[42px] h-[42px] grid place-items-center rounded-xl border ${showCurtain ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white/[0.06] border-white/10 text-slate-400'}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" fill="#334155" opacity="0.6" /><rect x="3" y="3" width="18" height="18" rx="2" stroke="#94a3b8" strokeWidth="1.5" /><path d="M3 9h18M9 9v12M15 9v12" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
        <button onClick={() => { setShowTimer(true); setShowCurtain(false) }} title="Minuteur (N)" className={`w-[42px] h-[42px] grid place-items-center rounded-xl border ${showTimer ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/[0.06] border-white/10 text-orange-400'}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#ffedd5" stroke="#f97316" strokeWidth="1.5" /><path d="M12 7v5l3 2" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" /><path d="M9 2h6M12 2v2" stroke="#f97316" strokeWidth="1.5" /></svg>
        </button>
        <button onClick={() => setShowRuler(v => !v)} title="Règle" className={`w-[42px] h-[42px] grid place-items-center rounded-xl border ${showRuler ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white/[0.06] border-white/10 text-teal-400'}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="9" width="20" height="6" rx="1" fill="#ccfbf1" stroke="#2dd4bf" strokeWidth="1.5" /><path d="M6 9v3M9 9v2M12 9v3M15 9v2M18 9v3" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
        <button onClick={() => setShowProtractor(v => !v)} title="Rapporteur" className={`w-[42px] h-[42px] grid place-items-center rounded-xl border ${showProtractor ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white/[0.06] border-white/10 text-indigo-400'}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 14a9 9 0 0 1 18 0Z" fill="#ede9fe" stroke="#818cf8" strokeWidth="1.5" /><line x1="3" y1="14" x2="21" y2="14" stroke="#6366f1" strokeWidth="1.5" /><circle cx="12" cy="14" r="2" fill="#6366f1" /></svg>
        </button>
        <button onClick={() => { setTool('compass'); if(!compassCenter){ showToast('Cliquez sur le tableau pour placer la pointe du compas 📍') } }} title="Compas — tracer des cercles (O)" className={`w-[42px] h-[42px] grid place-items-center rounded-xl border ${tool === 'compass' ? 'bg-cyan-500 border-cyan-500 text-white shadow scale-105' : 'bg-white/[0.06] border-white/10 text-cyan-400 hover:bg-white/[0.10]'}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2" fill={tool==='compass' ? 'white' : '#a5f3fc'} stroke="currentColor" strokeWidth="1.4"/><path d="M11.1 7.2L5.2 20l1.8 0.4L11.1 7.2Z" fill={tool==='compass' ? 'rgba(255,255,255,0.95)' : '#cffafe'} stroke="currentColor" strokeWidth="1.1"/><path d="M12.9 7.2L18.8 20l-1.8 0.4L12.9 7.2Z" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.1"/><circle cx="5.3" cy="20.6" r="1.1" fill="#ef4444"/><path d="M18.2 20.6l-1.3-2 2.2-0.6 0.5 2.1-1.4 0.5Z" fill="#0ea5e9"/></svg>
        </button>
        <button onClick={() => setTool('stamp')} title="Tampons" className={`w-[42px] h-[42px] grid place-items-center rounded-xl border relative ${tool === 'stamp' ? 'bg-fuchsia-500 border-fuchsia-500 text-white' : 'bg-white/[0.06] border-white/10 text-fuchsia-400'}`} onContextMenu={e => { e.preventDefault(); setShowStampMenu(v => !v) }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 8.5 9 10 10.5 10.5V14H6C4.9 14 4 14.9 4 16V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V16C20 14.9 19.1 14 18 14H13.5V10.5C15 10 16.5 8.5 16.5 6.5C16.5 4 14.5 2 12 2Z" /><line x1="4" y1="18" x2="20" y2="18" /></svg>
          {showStampMenu && (
            <div onClick={e => e.stopPropagation()} className={`absolute bottom-[52px] left-1/2 -translate-x-1/2 w-[200px] rounded-2xl border shadow-xl p-2 grid grid-cols-4 gap-1.5 ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-white/10'}`}>
              {['⭐', '🌟', '🎖️', '🏆', '👏', '💯', '❤️', '✅', '🌈', '🎉', '🔥', '💡'].map(s => (
                <button key={s} onClick={() => { (window as any).__activeStamp = ''; setTool('stamp'); setShowStampMenu(false); showToast(`Tampon : ${s}`); }}>{s}</button>
              ))}
              <button onClick={() => setShowStampMenu(false)} className="col-span-4 py-1.5 rounded-xl bg-fuchsia-500 text-white text-xs font-bold">Fermer</button>
            </div>
          )}
        </button>
        <button onClick={() => setShowCalculator(v => !v)} title="Calculatrice" className={`w-[42px] h-[42px] grid place-items-center rounded-xl border ${showCalculator ? 'bg-sky-500 border-sky-500 text-white' : 'bg-white/[0.06] border-white/10 text-sky-400'}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="3" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="1.8" /><rect x="7" y="5" width="10" height="4" rx="1" fill="white" stroke="#0ea5e9" strokeWidth="1.2" /><circle cx="8.5" cy="13" r="1.2" fill="#0ea5e9" /><circle cx="12" cy="13" r="1.2" fill="#0ea5e9" /><circle cx="15.5" cy="13" r="1.2" fill="#0ea5e9" /></svg>
        </button>
        <button onClick={() => setShowWheel(v => !v)} title="Roue des noms (D)" className={`w-[42px] h-[42px] grid place-items-center rounded-xl border ${showWheel ? 'bg-pink-500 border-pink-500 text-white' : 'bg-white/[0.06] border-white/10 text-pink-400'}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#fdf2f8" stroke="#d946ef" strokeWidth="1.5" /><path d="M 12 12 L 12 3 A 9 9 0 0 1 21 12 Z" fill="#f472b6" /><circle cx="12" cy="12" r="2.5" fill="white" stroke="#c026d3" strokeWidth="1.5" /></svg>
        </button>

        <div className="w-px h-7 bg-white/10 mx-1 hidden sm:block" />
        <button onClick={() => setZenMode(v => !v)} title="Masquer la barre" className="w-[42px] h-[42px] grid place-items-center rounded-xl border bg-white/[0.04] border-dashed border-white/20 text-slate-400 hover:bg-white/[0.08]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" /><path d="M17 16l-4-4 4-4" /></svg>
        </button>
      </div>

      {zenMode && (
        <button onClick={() => setZenMode(false)} className="fixed bottom-5 right-5 z-40 w-[48px] h-[48px] rounded-full grid place-items-center text-xl bg-[rgba(15,23,42,0.9)] border border-sky-500/40 text-sky-400 shadow-xl">🔧</button>
      )}

      {textInputPos && (
        <div className="fixed inset-0 z-40 grid place-items-center pointer-events-none p-4" onClick={() => setTextInputPos(null)}>
          <div onClick={e => e.stopPropagation()} className={`pointer-events-auto w-full max-w-[520px] rounded-[20px] border shadow-2xl p-5 ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-white/10'}`}>
            <h3 className={`font-extrabold mb-3 ${isLight ? 'text-slate-800' : 'text-white'}`}>Ajouter un texte</h3>
            <textarea value={textValue} onChange={e => setTextValue(e.target.value)} placeholder="Tapez votre texte ici..." rows={3} className={`w-full rounded-2xl border p-3 text-[15px] outline-none focus:ring-2 focus:ring-sky-500 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400' : 'bg-white/[0.06] border-white/10 text-white placeholder:text-slate-500'}`} autoFocus />
            <div className="flex gap-2 mt-4">
              <button onClick={() => {
                if (textValue.trim()) {
                  const obj: TextObj = { id: Date.now().toString(), type: 'text', x: textInputPos.x, y: textInputPos.y, text: textValue, color: activeColor, size: Math.max(16, strokeWidth * 4 + 8) }
                  setObjects(o => [...o, obj])
                }
                setTextInputPos(null); setTextValue('')
              }} className="flex-1 py-3 rounded-xl bg-sky-500 text-white font-extrabold hover:bg-sky-600">Insérer ✓</button>
              <button onClick={() => setTextInputPos(null)} className={`px-6 py-3 rounded-xl font-bold border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10 text-white'}`}>Annuler</button>
            </div>
            <div className="flex gap-2 mt-3 items-center">
              <span className="text-xs text-slate-400">Couleur :</span>
              {['#00a2ff', '#ff4d4d', '#10b981', '#f59e0b', '#121212', '#ffffff'].map(c => (
                <button key={c} onClick={() => setActiveColor(c)} className={`w-6 h-6 rounded-full border ${activeColor === c ? 'ring-2 ring-sky-400' : ''}`} style={{ background: c, borderColor: c === '#ffffff' ? '#e2e8f0' : 'transparent' }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {showTimer && (
        <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-[320px] rounded-[24px] border shadow-2xl p-5 flex flex-col gap-4 ${isLight ? 'bg-white border-slate-200' : 'bg-[rgba(15,23,42,0.96)] border-white/10 backdrop-blur-xl'}`}>
          <button onClick={() => setShowTimer(false)} className="absolute top-3 right-3 w-7 h-7 grid place-items-center rounded-full bg-red-500 text-white text-xs z-10">✕</button>
          <div onPointerDown={startWidgetDrag} className={`text-center text-xs font-bold tracking-widest cursor-grab active:cursor-grabbing py-1 -mt-2 -mx-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>MINUTEUR</div>
          <div className="flex items-center justify-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <button onClick={() => setTimerMin(m => Math.min(99, m + 1))} className="w-10 h-8 rounded-xl bg-sky-500 text-white grid place-items-center">▲</button>
              <div className={`w-[88px] h-[72px] grid place-items-center rounded-2xl text-4xl font-black tabular-nums border ${isLight ? 'bg-slate-900 text-white border-slate-900' : 'bg-black text-white border-white/10'}`}>{String(timerMin).padStart(2, '0')}</div>
              <button onClick={() => setTimerMin(m => Math.max(0, m - 1))} className="w-10 h-8 rounded-xl bg-white border border-slate-200 grid place-items-center text-slate-600">▼</button>
              <span className="text-[10px] text-slate-400">minutes</span>
            </div>
            <span className="text-3xl font-black pb-6">:</span>
            <div className="flex flex-col items-center gap-1">
              <button onClick={() => setTimerSec(s => Math.min(59, s + 5))} className="w-10 h-8 rounded-xl bg-sky-500 text-white grid place-items-center">▲</button>
              <div className={`w-[88px] h-[72px] grid place-items-center rounded-2xl text-4xl font-black tabular-nums border ${timerRunning ? 'bg-red-500 text-white animate-pulse border-red-500' : isLight ? 'bg-slate-900 text-white border-slate-900' : 'bg-black text-white border-white/10'}`}>{String(timerSec).padStart(2, '0')}</div>
              <button onClick={() => setTimerSec(s => Math.max(0, s - 5))} className="w-10 h-8 rounded-xl bg-white border border-slate-200 grid place-items-center text-slate-600">▼</button>
              <span className="text-[10px] text-slate-400">secondes</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setTimerRunning(v => !v)} className={`py-3 rounded-xl font-extrabold ${timerRunning ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>{timerRunning ? 'Pause ⏸️' : 'Démarrer ▶️'}</button>
            <button onClick={() => { setTimerRunning(false); setTimerMin(5); setTimerSec(0) }} className="py-3 rounded-xl bg-white border border-slate-200 font-bold text-slate-700">Réinitialiser 🔄</button>
          </div>
          <div className="flex gap-1.5 justify-center">
            {[1, 3, 5, 10].map(m => (
              <button key={m} onClick={() => { setTimerMin(m); setTimerSec(0); setTimerRunning(false) }} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${timerMin === m && timerSec === 0 ? 'bg-sky-500 text-white border-sky-500' : 'bg-white border-slate-200 text-slate-600'}`}>{m} min</button>
            ))}
          </div>
        </div>
      )}

      {showRuler && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-[min(92vw,460px)] select-none">
          <div className={`relative w-full h-[72px] rounded-2xl border shadow-2xl overflow-hidden ${isLight ? 'bg-[#fdf6e3] border-amber-200' : 'bg-[#1a1a1a] border-white/10'}`}>
            <button onClick={() => setShowRuler(false)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white grid place-items-center text-[11px] z-10">✕</button>
            <button onPointerDown={startRotate} title="Faites glisser pour pivoter" className="absolute top-2 left-2 w-6 h-6 rounded-full bg-sky-500 text-white grid place-items-center text-xs z-10 cursor-grab active:cursor-grabbing">↻</button>
            <svg viewBox="0 0 460 72" className="w-full h-full">
              <rect x="0" y="0" width="460" height="72" fill={isLight ? '#fdf6e3' : '#1e293b'} />
              {/* Graduations en cm / mm — 1 cm = 28 px, 16 cm visibles */}
              {Array.from({ length: 161 }).map((_, i) => {
                const x = 8 + i * 2.8
                if (x > 452) return null
                const isCm = i % 10 === 0
                const isHalfCm = i % 5 === 0
                const h = isCm ? 22 : isHalfCm ? 14 : 8
                const cm = Math.floor(i / 10)
                return <g key={i}>
                  <line x1={x} y1={72 - h} x2={x} y2={72} stroke={isLight ? '#92400e' : '#94a3b8'} strokeWidth={isCm ? 1.4 : 1} opacity={isCm ? 1 : 0.9} />
                  {isCm && <text x={x} y={16} textAnchor="middle" fontSize="9" fill={isLight ? '#78350f' : '#e2e8f0'} fontWeight="700">{cm}</text>}
                </g>
              })}
              <rect x="8" y="36" width={16*28} height="1" fill={isLight ? '#f59e0b' : '#38bdf8'} opacity="0.35" />
              <text x={8 + 16*28 + 6} y={40} fontSize="8" fill={isLight ? '#92400e' : '#94a3b8'} fontWeight="800">cm</text>
            </svg>
            <div className="absolute inset-0 cursor-move" onPointerDown={e => {
              const el = (e.currentTarget.parentElement as HTMLElement).parentElement as HTMLElement
              const startX = e.clientX, startY = e.clientY
              const rect = el.getBoundingClientRect()
              const sx = rect.left, sy = rect.top
              const move = (ev: PointerEvent) => { el.style.left = `${sx + (ev.clientX - startX)}px`; el.style.top = `${sy + (ev.clientY - startY)}px`; el.style.transform = 'translate(0,0)'; el.style.position = 'fixed' }
              const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
              window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
            }} />
          </div>
          <div className="text-center text-[11px] text-white/50 mt-1.5">Faites glisser la règle (cm) — ↻ pour pivoter</div>
        </div>
      )}

      {showProtractor && (
        <div className="fixed top-[38%] left-1/2 -translate-x-1/2 z-40 select-none">
          <div className={`relative w-[320px] h-[170px] rounded-t-[160px] border shadow-2xl overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-white/10'}`}>
            <button onClick={() => setShowProtractor(false)} className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-red-500 text-white grid place-items-center text-[11px] z-10">✕</button>
            <svg viewBox="0 0 320 170" className="w-full h-full">
              <path d="M 10 160 A 150 150 0 0 1 310 160 Z" fill={isLight ? '#f8fafc' : '#1e293b'} stroke="#818cf8" strokeWidth="1.5" />
              <line x1="10" y1="160" x2="310" y2="160" stroke="#6366f1" strokeWidth="1.5" />
              {Array.from({ length: 19 }).map((_, i) => {
                const deg = i * 10
                const rad = (180 - deg) * Math.PI / 180
                const r1 = 150, r2 = deg % 30 === 0 ? 128 : deg % 10 === 0 ? 136 : 142
                const x1 = 160 + Math.cos(rad) * r1, y1 = 160 - Math.sin(rad) * r1
                const x2 = 160 + Math.cos(rad) * r2, y2 = 160 - Math.sin(rad) * r2
                return <g key={i}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={deg % 30 === 0 ? '#6366f1' : '#94a3b8'} strokeWidth={deg % 30 === 0 ? 1.3 : 1} />
                  {<text x={160 + Math.cos(rad) * 115} y={160 - Math.sin(rad) * 115} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill={isLight ? '#475569' : '#e2e8f0'} fontWeight="700">{deg}°</text>}
                </g>
              })}
              <circle cx="160" cy="160" r="3" fill="#6366f1" />
              <line x1="160" y1="160" x2="160" y2="22" stroke="#a5b4fc" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
            <button onPointerDown={startRotate} title="Faites glisser pour pivoter" className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-sky-500 text-white grid place-items-center text-[11px] z-10 cursor-grab active:cursor-grabbing">↻</button>
            <div className="absolute inset-0 cursor-move" onPointerDown={e => {
              const el = (e.currentTarget.parentElement as HTMLElement).parentElement as HTMLElement
              const startX = e.clientX, startY = e.clientY
              const rect = el.getBoundingClientRect()
              const sx = rect.left, sy = rect.top
              const move = (ev: PointerEvent) => { el.style.left = `${sx + (ev.clientX - startX)}px`; el.style.top = `${sy + (ev.clientY - startY)}px`; el.style.transform = 'translate(0,0)'; el.style.position = 'fixed' }
              const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
              window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
            }} />
          </div>
        </div>
      )}

      {/* Compas Réel — widget flottant photo-réaliste (toujours visible quand l'outil Compas est actif, sans bloquer le tableau) */}
      {tool === 'compass' && (
        <div
          className={`fixed z-40 rounded-[18px] overflow-hidden border shadow-[0_16px_48px_rgba(0,0,0,0.42)] backdrop-blur-xl ${isLight ? 'bg-white border-slate-200' : 'bg-[#0b1220] border-white/10'}`}
          style={{ left: '50%', transform: 'translateX(-50%)', bottom: '76px', width: 'min(92vw, 380px)', maxHeight: 'min(62vh, 520px)', overflowY: 'auto' }}
        >
            {/* Header */}
            <div onPointerDown={startWidgetDrag} className={`relative flex items-center justify-between px-3 py-2.5 border-b cursor-grab active:cursor-grabbing ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-[#060a14] border-white/5'}`}>
              <div className="flex items-center gap-2">
                <button onClick={() => setTool('select')} className="w-7 h-7 rounded-full bg-[#ef4444] hover:bg-red-600 text-white grid place-items-center text-[11px] font-black shadow">✕</button>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-amber-400 text-[#78350f] grid place-items-center text-[11px] font-black">⚠</span>
                  <span className={`text-[12.5px] font-extrabold ${isLight ? 'text-slate-700' : 'text-slate-100'}`}>Compas intelligent (outil géométrique)</span>
                </div>
              </div>
              <button onClick={() => { setCompassCenter(null); setCompassIsDragging(false); }} className={`w-7 h-7 rounded-full grid place-items-center text-xs ${isLight ? 'bg-white border border-slate-200 text-slate-500' : 'bg-white/5 border border-white/10 text-white/60'}`} title="Réinitialiser">↺</button>
            </div>

            {/* Stage — compas réel + règle jaune */}
            <div className={`relative p-3 ${isLight ? 'bg-[#f8fafc]' : 'bg-[#0a0f1e]'}`}>
              {/* Zone compas */}
              <div className="relative mx-auto h-[152px] w-[300px] flex items-end justify-center select-none" style={{ filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.35))' }}>
                {/* legs SVG for opening visualization, behind photo for realism */}
                <svg viewBox="0 0 300 140" className="absolute inset-0 w-full h-full pointer-events-none">
                  {(() => {
                    const openingCm = compassRadius / 28
                    const openingPx = Math.min(300*0.82, Math.max(28, openingCm * 19.2))
                    const cx = 150, topY=18
                    const half = openingPx/2
                    const baseY = 104
                    return (
                      <>
                        {/* left leg */}
                        <line x1={cx} y1={topY} x2={cx - half} y2={baseY} stroke={isLight ? '#475569' : '#cbd5e1'} strokeWidth={5} strokeLinecap="round" opacity={0.95} />
                        {/* right leg */}
                        <line x1={cx} y1={topY} x2={cx + half} y2={baseY} stroke={isLight ? '#334155' : '#e2e8f0'} strokeWidth={5} strokeLinecap="round" opacity={0.95} />
                        {/* hinge */}
                        <circle cx={cx} cy={topY} r={11} fill={isLight ? '#e2e8f0' : '#0f172a'} stroke="#f59e0b" strokeWidth={2.4} />
                        <circle cx={cx} cy={topY} r={5.5} fill="#38bdf8" stroke="white" strokeWidth={1.2} />
                        <circle cx={cx} cy={topY} r={1.6} fill="#f59e0b" />
                        {/* needle tip */}
                        <g>
                          <circle cx={cx - half} cy={baseY+8} r={3.2} fill="#0f172a" stroke="#ef4444" strokeWidth={1.2} />
                          <path d={`M ${cx-half} ${baseY+8} l -2.2 8 l 4.4 0 z`} fill="#991b1b" />
                        </g>
                      </>
                    )
                  })()}
                </svg>

                {/* Real compass photo — superposed for photo-realism */}
                <img
                  src="/compass/compass-sprite.png"
                  alt="Compas réel"
                  className="absolute left-1/2 top-[14px] -translate-x-1/2 w-[176px] h-[112px] object-contain pointer-events-none select-none"
                  style={{ opacity: 0.96, mixBlendMode: isLight ? 'multiply' : 'normal' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display='none' }}
                />

                {/* Pencil — positioned at opening */}
                {(() => {
                  const openingCm = compassRadius / 28
                  const openingPx = Math.min(300*0.82, Math.max(28, openingCm * 19.2))
                  const cx = 150, half = openingPx/2
                  const px = cx + half, py = 104
                  return (
                    <div className="absolute w-[14px] h-[44px] pointer-events-none" style={{ left: px - 7, top: py - 6, transform: 'rotate(7deg)', transformOrigin: 'top center' }}>
                      <div className="w-full h-[30px] rounded-[3px] border" style={{ background: 'linear-gradient(180deg,#fde68a 0%,#f59e0b 55%,#92400e 100%)', borderColor:'#78350f' }}>
                        <div className="mx-auto mt-1 w-[7px] h-[22px] rounded-full bg-black/15" />
                        <div className="mx-auto w-[9px] h-[4px] rounded bg-[#1f2937] mt-0.5" />
                      </div>
                      <div className="mx-auto w-0 h-0 border-l-[7px] border-r-[7px] border-t-[9px] border-l-transparent border-r-transparent border-t-[#0f172a]" style={{ marginTop: -1 }} />
                      <div className="mx-auto w-[2px] h-[3px] bg-cyan-500 rounded-full -mt-1" />
                    </div>
                  )
                })()}

                {/* subtle opening indicator line */}
                {(() => {
                  const openingCm = compassRadius / 28
                  const openingPx = Math.min(300*0.82, Math.max(28, openingCm * 19.2))
                  return <div className="absolute bottom-[42px] h-px bg-sky-500/30 border-t border-dashed border-sky-500/40" style={{ left: `calc(50% - ${openingPx/2}px)`, right: `calc(50% - ${openingPx/2}px)` }} />
                })()}
              </div>

              {/* Règle jaune */}
              <div className="mt-2 mx-auto w-[292px] h-[34px] rounded-[6px] border-[2px] border-[#b45309] bg-[#facc15] relative overflow-hidden shadow-inner flex items-stretch select-none">
                <div className="absolute inset-0 flex">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="flex-1 relative border-l border-black/20 first:border-l-0">
                      <div className="absolute top-0 left-0 w-px h-[10px] bg-black/70" />
                      {i < 15 && <span className="absolute -top-[1px] left-1/2 -translate-x-1/2 text-[9px] font-black text-black/80 leading-none pt-1">{i}</span>}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-px h-[8px] items-end">
                        <span className="w-px h-[4px] bg-black/40 block" />
                        <span className="w-px h-[6px] bg-black/50 block" />
                        <span className="w-px h-[4px] bg-black/40 block" />
                        <span className="w-px h-[8px] bg-black/70 block" />
                      </div>
                    </div>
                  ))}
                </div>
                {/* thumb indicator on ruler */}
                {(() => {
                  const cm = compassRadius / 28
                  const pct = Math.min(96, Math.max(2, (cm/15)*100))
                  return <div className="absolute top-1/2 -translate-y-1/2 w-2 h-6 rounded-full bg-white border-2 border-sky-500 shadow -translate-x-1/2" style={{ left: `${pct}%` }} />
                })()}
              </div>
              <div className="mt-1 flex justify-between text-[10px] font-bold text-slate-400 px-1"><span>0</span><span>15 cm</span></div>
            </div>

            {/* Controls */}
            <div className={`p-3 pt-2.5 border-t ${isLight ? 'bg-white border-slate-100' : 'bg-[#0b1220] border-white/5'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[12px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Ouverture du compas :</span>
                <span className="text-[13px] font-black px-2.5 py-1 rounded-full bg-sky-500 text-white tabular-nums shadow">{(compassRadius/28).toFixed(1)} cm</span>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => nudgeCompassRadius(-6)} className={`w-8 h-8 shrink-0 rounded-xl grid place-items-center font-black border ${isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-white/[0.06] border-white/10 text-white'}`}>−</button>
                <input
                  type="range"
                  min={14}
                  max={420}
                  value={compassRadius}
                  onChange={e => setCompassRadius(parseInt(e.target.value))}
                  className="flex-1 accent-sky-500 h-2"
                  style={{ accentColor: activeColor }}
                />
                <button onClick={() => nudgeCompassRadius(6)} className={`w-8 h-8 shrink-0 rounded-xl grid place-items-center font-black border ${isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-white/[0.06] border-white/10 text-white'}`}>+</button>
              </div>

              <div className="mt-2.5 grid grid-cols-4 gap-1.5">
                {[2,4,6,8].map(cm => {
                  const r = cm*28
                  const active = Math.abs(compassRadius - r) < 7
                  return (
                    <button key={cm} onClick={() => setCompassRadius(r)} className={`py-1.5 rounded-xl text-[11px] font-black border ${active ? 'bg-sky-500 text-white border-sky-500 shadow' : isLight ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white' : 'bg-white/[0.06] border-white/10 text-slate-200 hover:bg-white/[0.10]'}`}>{cm} cm</button>
                  )
                })}
              </div>

              <div className={`mt-2.5 flex items-center justify-between rounded-xl px-3 py-2 border text-[11px] ${isLight ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-white/[0.04] border-white/5 text-slate-400'}`}>
                <span>Couleur & épaisseur suivent l'outil actif</span>
                <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-sm" style={{ background: activeColor }} /><span className="font-black" style={{ color: activeColor }}>{(strokeWidth/28).toFixed(1)} cm</span><span className="opacity-60">· {(opacity)}%</span></span>
              </div>

              <button onClick={traceCompassCircle} className="mt-3 w-full py-3 rounded-xl bg-[#10b981] hover:bg-emerald-600 text-white font-black shadow flex items-center justify-center gap-2 text-[13px]">
                ✓ Appliquer l'ouverture et tracer
              </button>

              <div className="mt-2 grid grid-cols-4 gap-1.5">
                <button onClick={() => traceCompassArc(90)} className={`py-2 rounded-xl text-xs font-bold border ${isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-white/[0.06] border-white/10 text-white hover:bg-white/[0.08]'}`}>Arc 90°</button>
                <button onClick={() => traceCompassArc(180)} className={`py-2 rounded-xl text-xs font-bold border ${isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-white/[0.06] border-white/10 text-white hover:bg-white/[0.08]'}`}>Arc 180°</button>
                <button onClick={() => traceCompassArc(270)} className={`py-2 rounded-xl text-xs font-bold border ${isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-white/[0.06] border-white/10 text-white hover:bg-white/[0.08]'}`}>Arc 270°</button>
                <button onClick={() => traceCompassCircle()} className="py-2 rounded-xl bg-slate-900 text-white text-xs font-black">Cercle 360°</button>
              </div>

              {!compassCenter && (
                <div className={`mt-2.5 rounded-xl p-2.5 border text-center text-[11px] leading-relaxed ${isLight ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-amber-500/10 border-amber-500/15 text-amber-200'}`}>
                  Cliquez n'importe où sur le tableau pour placer la <b>pointe du compas</b> 📍 — le cercle d'aperçu apparaîtra sur le tableau.
                </div>
              )}
              {compassCenter && (
                <div className={`mt-2.5 rounded-xl p-2.5 border text-[11px] leading-relaxed text-center ${isLight ? 'bg-sky-50 border-sky-100 text-sky-700' : 'bg-sky-500/10 border-sky-500/15 text-sky-200'}`}>
                  💡 <b>Sur le tableau :</b> saisissez la <b>pointe rouge</b> pour déplacer · la <b>mine</b> pour l'ouverture · le <b>cercle pointillé</b> pour pivoter · <b>molette</b> = réglage fin.
                </div>
              )}

              {/* Mini galerie “vrai compas” */}
              <div className="mt-3 pt-3 border-t border-black/5 flex gap-1.5 overflow-x-auto">
                <img src="https://dvxrhkgloakisnvqoxgl.supabase.co/storage/v1/object/sign/images/inputs/1786357738542_z0za08vtm.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80NWE1YWU1ZS0xNzg4LTRiMWYtYWM5OC1hMjgwNmQ2OTM4ZWMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvaW5wdXRzLzE3ODYzNTc3Mzg1NDJfejB6YTA4dnRtLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODYzNTc3NDcsImV4cCI6MTgxNzg5Mzc0N30.Veue_BV0HLJtCZjVMJS4lKr8Y-gpfKnMsS_K_gWyyQY" alt="référence compas 1" className="h-14 w-auto rounded-lg border border-black/10 object-contain bg-white shrink-0" />
                <img src="https://dvxrhkgloakisnvqoxgl.supabase.co/storage/v1/object/sign/images/inputs/1786357739692_40qbgdmba.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80NWE1YWU1ZS0xNzg4LTRiMWYtYWM5OC1hMjgwNmQ2OTM4ZWMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvaW5wdXRzLzE3ODYzNTc3Mzk2OTJfNDBxYmdkbWJhLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODYzNTc3NDcsImV4cCI6MTgxNzg5Mzc0N30.xwm_tnh8p2_Rhc-i8ddZ_6W9cC3SsotKgTuDPqt204U" alt="référence compas 2" className="h-14 w-auto rounded-lg border border-black/10 object-contain bg-white shrink-0" />
                <img src="https://dvxrhkgloakisnvqoxgl.supabase.co/storage/v1/object/sign/images/inputs/1786357740486_12kn00y6e.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80NWE1YWU1ZS0xNzg4LTRiMWYtYWM5OC1hMjgwNmQ2OTM4ZWMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvaW5wdXRzLzE3ODYzNTc3NDA0ODZfMTJrbjAweTZlLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODYzNTc3NDcsImV4cCI6MTgxNzg5Mzc0N30.nubWxjQvZ91ndaSuhIuuIElvlQSuz9AO0BH9rs6_v4U" alt="référence compas 3" className="h-14 w-auto rounded-lg border border-black/10 object-contain bg-white shrink-0" />
                <img src="/compass/compass-sprite.png" alt="compas transparent" className="h-14 w-14 rounded-lg border border-black/10 object-contain bg-white shrink-0 p-1" />
              </div>
            </div>
          </div>
      )}

      {showCalculator && (
        <div className={`fixed bottom-[88px] left-1/2 -translate-x-1/2 z-40 w-[300px] rounded-[20px] border shadow-2xl overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-white/10'}`}>
          <div onPointerDown={startWidgetDrag} className={`flex items-center justify-between px-4 py-3 border-b cursor-grab active:cursor-grabbing ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/[0.04] border-white/5'}`}>
            <span className={`text-sm font-extrabold ${isLight ? 'text-slate-700' : 'text-white'}`}>Calculatrice</span>
            <button onClick={() => setShowCalculator(false)} className="w-6 h-6 rounded-full bg-red-500 text-white grid place-items-center text-xs">✕</button>
          </div>
          <div className={`mx-3 mt-3 rounded-2xl px-4 py-3 text-right font-mono text-2xl font-black tabular-nums border overflow-hidden ${isLight ? 'bg-slate-900 text-white border-slate-900' : 'bg-black text-emerald-400 border-white/5'}`} dir="ltr">{calcDisplay}</div>
          <div className="grid grid-cols-4 gap-2 p-3">
            {[
              ['C', '⌫', '÷', '×'],
              ['7', '8', '9', '-'],
              ['4', '5', '6', '+'],
              ['1', '2', '3', '='],
              ['0', '.', '=', '='],
            ].flat().slice(0, 20).map((k, i) => {
              const isOp = ['÷', '×', '-', '+', '='].includes(k)
              const isEq = k === '='
              if (i === 16 && k === '0') return <button key={i} onClick={() => handleCalcInput(k)} className={`col-span-2 py-3.5 rounded-xl font-black text-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.06] border-white/10 text-white'}`}>{k}</button>
              if (k === '=' && i === 19) return null
              if (k === '=' && i === 18) return <button key={i} onClick={() => handleCalcInput('=')} className="row-span-1 py-3.5 rounded-xl font-black text-lg bg-sky-500 text-white border border-sky-500">=</button>
              if (i === 19) return null
              return <button key={i} onClick={() => handleCalcInput(k)} className={`py-3.5 rounded-xl font-black text-[15px] border transition ${isEq ? 'bg-sky-500 text-white border-sky-500' : isOp ? 'bg-amber-500 text-white border-amber-500' : k === 'C' ? 'bg-red-500 text-white border-red-500' : isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-white/[0.06] border-white/10 text-white hover:bg-white/[0.10]'}`}>{k}</button>
            })}
          </div>
        </div>
      )}

      {showWheel && (
        <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-[380px] max-h-[90vh] overflow-auto rounded-[24px] border shadow-2xl p-5 flex flex-col items-center gap-4 ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-white/10'}`}>
          <button onClick={() => setShowWheel(false)} className="absolute top-3 right-3 w-7 h-7 grid place-items-center rounded-full bg-red-500 text-white text-xs z-10">✕</button>
          <h3 onPointerDown={startWidgetDrag} className={`font-extrabold cursor-grab active:cursor-grabbing w-full text-center py-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>🎡 Roue des noms — tirage au sort</h3>
          <div className="relative w-[260px] h-[260px]">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[18px] border-l-transparent border-r-transparent border-b-red-500 z-10 drop-shadow" />
            <div
              className="w-full h-full rounded-full border-[6px] border-white shadow-xl overflow-hidden relative"
              style={(() => {
                const angle = 360 / wheelOptions.length
                const colors = ['#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f87171', '#2dd4bf', '#818cf8']
                const grad = `conic-gradient(${wheelOptions.map((_, i) => `${colors[i % colors.length]} ${i * angle}deg ${(i + 1) * angle}deg`).join(', ')})`
                return { transform: `rotate(${wheelRotation}deg)`, transition: wheelSpinning ? 'transform 3s cubic-bezier(0.15,0.7,0.2,1)' : 'none', background: grad }
              })()}
            >
              {wheelOptions.map((name, i) => {
                const angle = 360 / wheelOptions.length
                return <div key={i} className="absolute left-1/2 top-1/2 text-[11px] font-extrabold text-white drop-shadow" style={{ transform: `rotate(${i * angle + angle / 2}deg) translate(0, -92px) rotate(90deg)`, transformOrigin: '0 92px', whiteSpace: 'nowrap' }}>{name}</div>
              })}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white border-4 border-slate-900 grid place-items-center font-black text-slate-900 shadow">🎯</div>
            </div>
          </div>
          <button onClick={spinWheel} disabled={wheelSpinning || wheelOptions.length < 2} className={`w-full py-3 rounded-xl font-extrabold text-white shadow ${wheelSpinning ? 'bg-slate-400' : 'bg-gradient-to-br from-pink-500 to-violet-600 hover:scale-[1.01]'} transition`}>{wheelSpinning ? 'Tirage en cours...' : 'Faire tourner la roue 🎲'}</button>

          <div className="w-full grid gap-2">
            <div className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Modifier les noms</div>
            {wheelOptions.map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={name} onChange={e => setWheelOptions(opts => opts.map((n, idx) => idx === i ? e.target.value : n))} className={`flex-1 rounded-xl border px-2 py-1.5 text-sm font-bold outline-none ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.06] border-white/10 text-white'}`} />
                <button onClick={() => setWheelOptions(opts => opts.filter((_, idx) => idx !== i))} className="w-7 h-7 rounded-full bg-red-500 text-white grid place-items-center text-xs">✕</button>
              </div>
            ))}
            {wheelOptions.length < 8 && (
              <form onSubmit={e => { e.preventDefault(); const v = newWheelName.trim(); if (v) { setWheelOptions(opts => [...opts, v]); setNewWheelName('') } }} className="flex gap-2">
                <input value={newWheelName} onChange={e => setNewWheelName(e.target.value)} placeholder="Ajouter un nom..." className={`flex-1 rounded-xl border px-2 py-1.5 text-sm font-bold outline-none ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.06] border-white/10 text-white'}`} />
                <button type="submit" className="px-3 py-1.5 rounded-xl bg-sky-600 text-white text-sm font-bold">+</button>
              </form>
            )}
          </div>
        </div>
      )}

      {showQuran && (
        <div className="fixed inset-0 z-40 grid place-items-center pointer-events-none p-4" onClick={() => setShowQuran(false)}>
          <div onClick={e => e.stopPropagation()} className={`pointer-events-auto w-full max-w-[480px] max-h-[86vh] overflow-auto rounded-[24px] border shadow-2xl ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-white/10'}`}>
            <div onPointerDown={startWidgetDrag} className={`sticky top-0 p-5 border-b flex items-center justify-between cursor-grab active:cursor-grabbing ${isLight ? 'bg-white border-slate-100' : 'bg-[#0f172a] border-white/5'}`}>
              <h3 className={`font-extrabold flex items-center gap-2 ${isLight ? 'text-sky-700' : 'text-sky-300'}`}><span>🌦️</span> Météo du jour</h3>
              <button onClick={() => setShowQuran(false)} className="w-8 h-8 rounded-full bg-black/10 grid place-items-center">✕</button>
            </div>
            <div className="p-5 grid gap-4">
              <form onSubmit={e => { e.preventDefault(); fetchWeather(weatherCity) }} className="flex gap-2">
                <input value={weatherCity} onChange={e => setWeatherCity(e.target.value)} placeholder="Ville..." className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-bold outline-none ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.06] border-white/10 text-white'}`} />
                <button type="submit" className="px-4 py-2.5 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700">Rechercher</button>
              </form>

              {weatherLoading && <div className="text-center py-6 text-slate-400">Chargement…</div>}
              {weatherData && !weatherLoading && (
                <div className={`rounded-2xl p-6 text-center border ${isLight ? 'bg-sky-50 border-sky-200' : 'bg-sky-900/20 border-sky-800'}`}>
                  <div className="text-6xl mb-2">{weatherInfo(weatherData.weathercode).icon}</div>
                  <div className="text-4xl font-black" style={{ color: weatherInfo(weatherData.weathercode).color }}>{Math.round(weatherData.temp)}°C</div>
                  <div className={`text-lg font-bold mt-1 ${isLight ? 'text-slate-700' : 'text-white'}`}>{weatherInfo(weatherData.weathercode).label}</div>
                  <div className={`text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{weatherData.city}</div>
                </div>
              )}
              {!weatherData && !weatherLoading && (
                <div className="text-center py-6 text-slate-400">Entrez une ville pour voir la météo.</div>
              )}

              <button onClick={() => setShowQuran(false)} className={`py-3 rounded-xl font-bold border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10 text-white'}`}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {showStickers && (
        <div className="fixed inset-0 z-40 grid place-items-center pointer-events-none p-4" onClick={() => setShowStickers(false)}>
          <div onClick={e => e.stopPropagation()} className={`pointer-events-auto w-full max-w-[420px] max-h-[80vh] overflow-auto rounded-[24px] border shadow-2xl p-5 ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-white/10'}`}>
            <h3 onPointerDown={startWidgetDrag} className={`font-extrabold mb-3 cursor-grab active:cursor-grabbing ${isLight ? 'text-slate-800' : 'text-white'}`}>🧩 Stickers pédagogiques</h3>
            <div className="grid grid-cols-6 gap-2 mb-4">
              {['⭐', '🌟', '✅', '❌', '❓', '❗', '💡', '🔍', '📚', '🎓', '✏️', '📐', '🧮', '🌍', '🔬', '🎨', '🎵', '🏆', '📢', '⏰', '📅', '📌', '🔥', '✨', '🏅', '🎁', '🎀', '🎊', '🎉', '💯', '🧠', '👍', '👏', '🙌', '💪', '🤝'].map(emoji => (
                <button key={emoji} onClick={() => insertSticker(emoji)} className={`text-2xl p-2 rounded-xl border hover:scale-110 transition ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.06] border-white/10'}`}>{emoji}</button>
              ))}
            </div>
            <button onClick={() => setShowStickers(false)} className={`w-full py-3 rounded-xl font-bold border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10 text-white'}`}>Fermer</button>
          </div>
        </div>
      )}

      {showActivities && (
        <div className="fixed inset-0 z-40 grid place-items-center pointer-events-none p-4" onClick={() => setShowActivities(false)}>
          <div onClick={e => e.stopPropagation()} className={`pointer-events-auto w-full max-w-[560px] max-h-[80vh] overflow-auto rounded-[24px] border shadow-2xl p-5 ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-white/10'}`}>
            <h3 onPointerDown={startWidgetDrag} className={`font-extrabold mb-3 cursor-grab active:cursor-grabbing ${isLight ? 'text-slate-800' : 'text-white'}`}>🎒 Activités pédagogiques</h3>
            <div className="text-xs font-bold text-slate-500 mb-2">Maths — Numération</div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {activities.map((a, i) => (
                <button key={i} onClick={() => insertActivity(i)} className={`p-2 rounded-xl border text-center hover:scale-[1.02] transition ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.06] border-white/10 text-white'}`}>
                  <div className="text-2xl mb-1">{a.icon}</div>
                  <div className="text-[10px] font-bold leading-tight">{a.title}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowActivities(false)} className={`w-full py-3 rounded-xl font-bold border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10 text-white'}`}>Fermer</button>
          </div>
        </div>
      )}

      {showShare && (
        <div className="fixed inset-0 z-40 grid place-items-center pointer-events-none p-4" onClick={() => setShowShare(false)}>
          <div onClick={e => e.stopPropagation()} className={`pointer-events-auto w-full max-w-[420px] rounded-[24px] border shadow-2xl p-5 text-center ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-white/10'}`}>
            <h3 onPointerDown={startWidgetDrag} className={`font-extrabold mb-2 cursor-grab active:cursor-grabbing ${isLight ? 'text-slate-800' : 'text-white'}`}>👥 Partage en direct</h3>
            <div className={`text-sm mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Partagez ce lien avec vos élèves pour suivre le tableau en direct.</div>
            <div className={`break-all rounded-xl p-3 text-sm font-mono border mb-3 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/[0.04] border-white/10 text-white'}`}>{shareLink}</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { navigator.clipboard.writeText(shareLink); showToast('Lien copié') }} className="py-3 rounded-xl bg-sky-600 text-white font-extrabold">Copier le lien</button>
              <button onClick={() => setShowShare(false)} className={`py-3 rounded-xl font-bold border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10 text-white'}`}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {showYoutube && (
        <div className="fixed inset-0 z-40 grid place-items-center pointer-events-none p-4" onClick={() => setShowYoutube(false)}>
          <div onClick={e => e.stopPropagation()} className={`pointer-events-auto w-full max-w-[520px] rounded-[20px] border shadow-2xl p-5 ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-white/10'}`}>
            <h3 onPointerDown={startWidgetDrag} className={`font-extrabold mb-3 cursor-grab active:cursor-grabbing ${isLight ? 'text-slate-800' : 'text-white'}`}>Insérer une vidéo YouTube 🎥</h3>
            <input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." dir="ltr" className={`w-full rounded-xl border px-3 py-3 text-sm outline-none ${isLight ? 'bg-slate-50 border-slate-200 placeholder:text-slate-400' : 'bg-white/[0.06] border-white/10 text-white placeholder:text-slate-500'}`} />
            {youtubeId && (
              <div className="mt-3 rounded-xl overflow-hidden border border-black/10 aspect-video bg-black">
                <iframe src={`https://www.youtube.com/embed/${youtubeId}`} className="w-full h-full" allowFullScreen title="preview" />
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={() => {
                if (!youtubeId) { showToast('Lien invalide'); return }
                setEmbeddedVideos(v => [...v, { id: Date.now().toString(), url: youtubeId, x: 120, y: 120 }])
                setShowYoutube(false); setYoutubeUrl(''); showToast('Vidéo insérée')
              }} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-extrabold">Insérer la vidéo</button>
              <button onClick={() => setShowYoutube(false)} className={`px-6 py-3 rounded-xl font-bold border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10 text-white'}`}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {showAbout && (
        <div className="fixed inset-0 z-40 grid place-items-center pointer-events-none p-4" onClick={() => setShowAbout(false)}>
          <div onClick={e => e.stopPropagation()} className={`pointer-events-auto w-full max-w-[480px] rounded-[24px] border shadow-2xl p-6 text-center ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-white/10'}`}>
            <div className="text-5xl mb-3">❤️</div>
            <h3 className={`text-xl font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>Tableau du Matin</h3>
            <div className="text-sm text-slate-500 mt-1">Tableau blanc interactif pour enseignants — inspiré de NinjaScribe</div>
            <div className={`mt-4 rounded-2xl p-4 text-sm leading-relaxed border text-left ${isLight ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-white/[0.04] border-white/5 text-slate-300'}`}>
              Un tableau blanc moderne pour remplacer le tableau traditionnel : dessin à main levée avec 6 types de pointes, formes géométriques, surligneur, laser, projecteur, loupe, post-its, minuteur, règle et rapporteur, roue des prénoms, calculatrice, import d'images / PDF / vidéos, et extrait de versets coraniques en calligraphie — avec export PNG/PDF et sauvegarde de projets.
              <div className="mt-3 text-xs opacity-70">Tous droits réservés — version web</div>
            </div>
            <button onClick={() => setShowAbout(false)} className="mt-4 w-full py-3 rounded-xl bg-sky-500 text-white font-extrabold">Fermer</button>
          </div>
        </div>
      )}

      {showUpgrade && (
        <div className="fixed inset-0 z-40 grid place-items-center pointer-events-none p-4" onClick={() => setShowUpgrade(false)}>
          <div onClick={e => e.stopPropagation()} className={`pointer-events-auto w-full max-w-[520px] rounded-[24px] border shadow-2xl overflow-hidden ${isLight ? 'bg-white border-amber-200' : 'bg-[#0f172a] border-amber-500/20'}`}>
            <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-6 text-white text-center">
              <div className="text-4xl">👑</div>
              <h3 className="text-xl font-black mt-2">Passer à la version Pro</h3>
              <div className="text-sm text-white/85 mt-1">Sauvegarde cloud, export vidéo et bibliothèque de stickers illimitée</div>
            </div>
            <div className="p-5 grid gap-3">
              {[
                '☁️ Sauvegarde automatique dans le cloud',
                '🎬 Exporter vos cours en vidéo avec voix off',
                '🧩 Bibliothèque de 500+ stickers pédagogiques',
                '👥 Partage en direct avec les élèves via lien',
              ].map(t => (
                <div key={t} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border text-sm font-semibold ${isLight ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-amber-500/10 border-amber-500/15 text-amber-200'}`}> {t}</div>
              ))}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button onClick={() => { setIsPro(true); setShowUpgrade(false); showToast('Version Pro activée ✨') }} className="py-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white font-extrabold shadow">Activer Pro</button>
                <button onClick={() => setShowUpgrade(false)} className={`py-3 rounded-xl font-bold border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10 text-white'}`}>Plus tard</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showShortcuts && (
        <div className="fixed inset-0 z-40 grid place-items-center pointer-events-none p-4" onClick={() => setShowShortcuts(false)}>
          <div onClick={e => e.stopPropagation()} className={`pointer-events-auto w-full max-w-[520px] rounded-[24px] border shadow-2xl p-5 ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-white/10'}`}>
            <h3 className={`font-black mb-4 ${isLight ? 'text-slate-800' : 'text-white'}`}>⌨️ Raccourcis clavier</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                ['V', 'Sélection'],
                ['H', 'Main / déplacer'],
                ['P', 'Stylo'],
                ['E', 'Gomme'],
                ['L', 'Ligne'],
                ['A', 'Flèche'],
                ['T', 'Texte'],
                ['S', 'Formes'],
                ['K', 'Laser'],
                ['O', 'Compas'],
                ['Ctrl+Z', 'Annuler'],
                ['Ctrl+Y', 'Rétablir'],
                ['Z', 'Mode présentation'],
              ].map(([k, v]) => (
                <div key={k} className={`flex items-center justify-between rounded-xl px-3 py-2 border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/[0.04] border-white/5'}`}>
                  <span className={`font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{v}</span>
                  <span className="px-2 py-1 rounded-lg bg-slate-900 text-white text-xs font-mono font-bold">{k}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowShortcuts(false)} className="mt-4 w-full py-3 rounded-xl bg-slate-900 text-white font-extrabold">OK</button>
          </div>
        </div>
      )}

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 36 }).map((_, i) => (
            <span key={i} className="absolute top-0 w-2 h-6 rounded-sm" style={{ left: `${(i * 7 + Math.random() * 6) % 100}%`, background: ['#00a2ff', '#f59e0b', '#10b981', '#ef4444', '#a855f7', '#ec4899'][i % 6], animation: `confettiFall ${1.8 + Math.random() * 1.2}s linear forwards`, animationDelay: `${Math.random() * 0.35}s`, transform: `rotate(${Math.random() * 360}deg)` }} />
          ))}
        </div>
      )}
      {showBalloons && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="absolute text-5xl select-none" style={{ left: `${8 + i * 9}%`, bottom: '-10vh', animation: `balloonFloat ${3.2 + Math.random() * 1.2}s ease-in forwards`, animationDelay: `${i * 0.12}s` }}>{['🎈', '🎈', '🎈', '🎀', '🎈'][i % 5]}</span>
          ))}
        </div>
      )}
      {showGif && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 backdrop-blur-[2px] pointer-events-none">
          <div className="text-center animate-[bounce_900ms_ease]">
            <div className="text-[84px]">🎊✨🎉</div>
            <div className="mt-2 px-6 py-3 rounded-2xl bg-white text-slate-900 font-black text-xl shadow-2xl">Bravo ! Excellent travail 👏</div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className={`px-4 py-2.5 rounded-full font-bold text-sm shadow-xl border backdrop-blur-xl ${isLight ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-900 border-white'}`}>{toast}</div>
        </div>
      )}

      <div className={`fixed bottom-2 left-1/2 -translate-x-1/2 z-20 hidden lg:flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-full border backdrop-blur ${isLight ? 'bg-white/90 border-slate-200 text-slate-500' : 'bg-black/30 border-white/10 text-white/55'}`}>
        <span>Molette pour faire défiler • Ctrl + molette pour zoomer • Glissez avec l'outil Main</span>
        <span className="w-1 h-1 rounded-full bg-current opacity-40" />
        <span>{objects.length} éléments</span>
      </div>
    </div>
  )
}
