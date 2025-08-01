"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Users,
  Phone,
  PhoneOff,
  Volume2,
  Share,
  Send,
  Search,
  MapPin,
  Plus,
  Minus,
  UserPlus,
  Copy,
  Maximize2,
} from "lucide-react"

interface User {
  id: string
  name: string
  x: number
  y: number
  avatar: string
  isOnline: boolean
  isTalking: boolean
  isVideoOn: boolean
  currentRoom?: string
}

interface Room {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  type: "meeting" | "lounge" | "desk" | "game" | "private"
  capacity?: number
  isPrivate?: boolean
}

interface ChatMessage {
  id: string
  userId: string
  userName: string
  message: string
  timestamp: Date
  roomId?: string
}

interface InteractiveObject {
  id: string
  type: "desk" | "chair" | "plant" | "whiteboard" | "screen" | "game"
  x: number
  y: number
  width: number
  height: number
  ownerId?: string
  isInteractable: boolean
}

export default function GatherPlatform() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)
  const [cameraX, setCameraX] = useState(0)
  const [cameraY, setCameraY] = useState(0)

  const [currentUser, setCurrentUser] = useState<User>({
    id: "user-1",
    name: "Kousik G",
    x: 400,
    y: 300,
    avatar: "👨‍💻",
    isOnline: true,
    isTalking: false,
    isVideoOn: true,
  })

  const [users, setUsers] = useState<User[]>([
    {
      id: "user-2",
      name: "Ashok Manthena",
      x: 450,
      y: 320,
      avatar: "👨‍💼",
      isOnline: true,
      isTalking: false,
      isVideoOn: true,
    },
    {
      id: "user-3",
      name: "Sarah Chen",
      x: 200,
      y: 200,
      avatar: "👩‍🎨",
      isOnline: true,
      isTalking: true,
      isVideoOn: false,
    },
    {
      id: "user-4",
      name: "Mike Johnson",
      x: 600,
      y: 150,
      avatar: "👨‍🔬",
      isOnline: false,
      isTalking: false,
      isVideoOn: false,
    },
  ])

  const [rooms] = useState<Room[]>([
    { id: "meeting-1", name: "Conference Room", x: 500, y: 100, width: 200, height: 150, type: "meeting", capacity: 8 },
    { id: "lounge-1", name: "Team Lounge", x: 150, y: 250, width: 180, height: 120, type: "lounge" },
    { id: "games-1", name: "Game Zone", x: 300, y: 450, width: 160, height: 100, type: "game" },
    { id: "desk-1", name: "Kousik's Desk", x: 380, y: 280, width: 80, height: 60, type: "desk", isPrivate: true },
  ])

  const [objects] = useState<InteractiveObject[]>([
    // Desks
    { id: "desk-1", type: "desk", x: 380, y: 280, width: 80, height: 60, ownerId: "user-1", isInteractable: true },
    { id: "desk-2", type: "desk", x: 200, y: 180, width: 80, height: 60, ownerId: "user-3", isInteractable: true },
    { id: "desk-3", type: "desk", x: 580, y: 130, width: 80, height: 60, ownerId: "user-4", isInteractable: true },

    // Meeting furniture
    { id: "table-1", type: "desk", x: 550, y: 150, width: 100, height: 80, isInteractable: true },
    { id: "whiteboard-1", type: "whiteboard", x: 520, y: 120, width: 60, height: 40, isInteractable: true },

    // Lounge furniture
    { id: "couch-1", type: "chair", x: 160, y: 270, width: 60, height: 40, isInteractable: true },
    { id: "couch-2", type: "chair", x: 240, y: 270, width: 60, height: 40, isInteractable: true },

    // Decorative
    { id: "plant-1", type: "plant", x: 100, y: 100, width: 30, height: 40, isInteractable: false },
    { id: "plant-2", type: "plant", x: 700, y: 100, width: 30, height: 40, isInteractable: false },
    { id: "plant-3", type: "plant", x: 350, y: 200, width: 30, height: 40, isInteractable: false },

    // Game area
    { id: "game-table", type: "game", x: 320, y: 470, width: 120, height: 60, isInteractable: true },
  ])

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      userId: "user-2",
      userName: "Ashok Manthena",
      message: "Hey team! Ready for the standup meeting?",
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "2",
      userId: "user-3",
      userName: "Sarah Chen",
      message: "Yes! Just finishing up some designs. Be there in 2 mins",
      timestamp: new Date(Date.now() - 240000),
    },
    {
      id: "3",
      userId: "user-1",
      userName: "Kousik G",
      message: "Perfect! I'll set up the screen share",
      timestamp: new Date(Date.now() - 120000),
    },
  ])

  const [newMessage, setNewMessage] = useState("")
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isInCall, setIsInCall] = useState(false)
  const [showChat, setShowChat] = useState(true)
  const [showMembers, setShowMembers] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([])
  const [currentLocation, setCurrentLocation] = useState("Marketing Office")
  const [keys, setKeys] = useState({ up: false, down: false, left: false, right: false })

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          setKeys(prev => ({ ...prev, up: true }))
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          setKeys(prev => ({ ...prev, down: true }))
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          setKeys(prev => ({ ...prev, left: true }))
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          setKeys(prev => ({ ...prev, right: true }))
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          setKeys(prev => ({ ...prev, up: false }))
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          setKeys(prev => ({ ...prev, down: false }))
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setKeys(prev => ({ ...prev, left: false }))
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          setKeys(prev => ({ ...prev, right: false }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Movement animation loop
  useEffect(() => {
    const moveSpeed = 3
    let animationFrame: number

    const animate = () => {
      setCurrentUser(prev => {
        let newX = prev.x
        let newY = prev.y

        if (keys.up) newY -= moveSpeed
        if (keys.down) newY += moveSpeed
        if (keys.left) newX -= moveSpeed
        if (keys.right) newX += moveSpeed

        // Boundary checks
        newX = Math.max(20, Math.min(newX, 1180))
        newY = Math.max(20, Math.min(newY, 780))

        return { ...prev, x: newX, y: newY }
      })

      animationFrame = requestAnimationFrame(animate)
    }

    if (keys.up || keys.down || keys.left || keys.right) {
      animationFrame = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [keys])

  // Draw the virtual office
  const drawOffice = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas with dark background
    ctx.fillStyle = "#1a1a1a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Save context for transformations
    ctx.save()

    // Apply camera transform and zoom
    ctx.scale(zoom, zoom)
    ctx.translate(-cameraX, -cameraY)

    // Draw outdoor grass background
    const tileSize = 32
    for (let x = 0; x < 1200; x += tileSize) {
      for (let y = 0; y < 800; y += tileSize) {
        const variation = (x + y) % 4
        ctx.fillStyle = variation === 0 ? "#4ade80" : variation === 1 ? "#22c55e" : variation === 2 ? "#16a34a" : "#15803d"
        ctx.fillRect(x, y, tileSize, tileSize)
        
        // Add grass texture
        if (Math.random() > 0.7) {
          ctx.fillStyle = "rgba(0,0,0,0.1)"
          ctx.fillRect(x + Math.random() * 20, y + Math.random() * 20, 2, 2)
        }
      }
    }

    // Draw water feature (pond)
    ctx.fillStyle = "#0ea5e9"
    ctx.fillRect(50, 650, 180, 120)
    ctx.fillStyle = "#0284c7"
    ctx.fillRect(55, 655, 170, 110)
    
    // Water ripples
    ctx.strokeStyle = "rgba(255,255,255,0.3)"
    ctx.lineWidth = 1
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.arc(140 + i * 20, 710 + i * 10, 15 + i * 5, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw stone paths
    ctx.fillStyle = "#6b7280"
    // Horizontal main path
    ctx.fillRect(0, 350, 1200, 50)
    // Vertical main path  
    ctx.fillRect(400, 0, 50, 800)
    // Entrance paths
    ctx.fillRect(250, 350, 20, 100)
    ctx.fillRect(700, 350, 20, 100)
    ctx.fillRect(900, 350, 20, 100)

    // Path texture
    ctx.fillStyle = "#9ca3af"
    for (let x = 0; x < 1200; x += 30) {
      ctx.fillRect(x, 360, 15, 30)
    }
    for (let y = 0; y < 800; y += 30) {
      ctx.fillRect(410, y, 30, 15)
    }

    // Define detailed building areas
    const buildings = [
      // Main Office Building
      { 
        x: 500, y: 100, width: 300, height: 200, 
        color: "#8b4513", floorColor: "#d4a574", 
        name: "MAIN OFFICE", entrance: { x: 600, y: 300 }
      },
      // Conference Rooms
      { 
        x: 850, y: 120, width: 200, height: 180, 
        color: "#4a5568", floorColor: "#718096", 
        name: "MEETINGS", entrance: { x: 900, y: 300 }
      },
      // Lounge Area
      { 
        x: 200, y: 450, width: 250, height: 150, 
        color: "#553c9a", floorColor: "#805ad5", 
        name: "LOUNGE", entrance: { x: 270, y: 450 }
      },
      // Game Room
      { 
        x: 500, y: 450, width: 200, height: 150, 
        color: "#c53030", floorColor: "#fc8181", 
        name: "GAME ROOM", entrance: { x: 600, y: 450 }
      },
      // Kitchen/Break Room
      { 
        x: 750, y: 450, width: 150, height: 120, 
        color: "#38a169", floorColor: "#68d391", 
        name: "KITCHEN", entrance: { x: 825, y: 450 }
      },
      // Private Offices
      { 
        x: 200, y: 100, width: 200, height: 180, 
        color: "#744210", floorColor: "#d69e2e", 
        name: "OFFICES", entrance: { x: 270, y: 280 }
      }
    ]

    buildings.forEach((building) => {
      // Building shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)"
      ctx.fillRect(building.x + 5, building.y + 5, building.width, building.height)

      // Building walls
      ctx.fillStyle = building.color
      ctx.fillRect(building.x, building.y, building.width, building.height)

      // Building floor
      ctx.fillStyle = building.floorColor
      ctx.fillRect(building.x + 10, building.y + 10, building.width - 20, building.height - 20)

      // Floor pattern
      ctx.strokeStyle = "rgba(0,0,0,0.1)"
      ctx.lineWidth = 1
      for (let x = building.x + 10; x < building.x + building.width - 10; x += 20) {
        for (let y = building.y + 10; y < building.y + building.height - 10; y += 20) {
          ctx.strokeRect(x, y, 20, 20)
        }
      }

      // Building border
      ctx.strokeStyle = "#2d3748"
      ctx.lineWidth = 4
      ctx.strokeRect(building.x, building.y, building.width, building.height)

      // Entrance door
      ctx.fillStyle = "#8b4513"
      ctx.fillRect(building.entrance.x - 15, building.entrance.y, 30, 8)
      ctx.fillStyle = "#fbbf24"
      ctx.fillRect(building.entrance.x - 12, building.entrance.y + 2, 24, 4)

      // Building label
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 14px monospace"
      ctx.textAlign = "center"
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 3
      ctx.strokeText(building.name, building.x + building.width / 2, building.y - 15)
      ctx.fillText(building.name, building.x + building.width / 2, building.y - 15)
    })

    // Draw trees and landscaping
    const trees = [
      { x: 100, y: 100, size: 30 },
      { x: 1050, y: 100, size: 35 },
      { x: 80, y: 500, size: 25 },
      { x: 1000, y: 550, size: 30 },
      { x: 150, y: 300, size: 20 },
      { x: 950, y: 320, size: 25 },
      { x: 450, y: 50, size: 28 },
      { x: 850, y: 60, size: 32 },
      { x: 300, y: 650, size: 25 },
      { x: 950, y: 650, size: 30 }
    ]

    trees.forEach((tree) => {
      // Tree shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)"
      ctx.beginPath()
      ctx.ellipse(tree.x, tree.y + tree.size, tree.size * 0.8, tree.size * 0.3, 0, 0, Math.PI * 2)
      ctx.fill()

      // Tree trunk
      ctx.fillStyle = "#8b4513"
      ctx.fillRect(tree.x - 4, tree.y + 10, 8, tree.size * 0.8)

      // Tree foliage
      ctx.fillStyle = "#22c55e"
      ctx.beginPath()
      ctx.arc(tree.x, tree.y, tree.size, 0, Math.PI * 2)
      ctx.fill()

      // Tree highlights
      ctx.fillStyle = "#4ade80"
      ctx.beginPath()
      ctx.arc(tree.x - tree.size * 0.3, tree.y - tree.size * 0.3, tree.size * 0.4, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw detailed furniture and objects
    objects.forEach((obj) => {
      // Object shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)"
      ctx.fillRect(obj.x + 2, obj.y + 2, obj.width, obj.height)

      switch (obj.type) {
        case "desk":
          // Desk base
          ctx.fillStyle = "#8b4513"
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height)
          // Desk surface
          ctx.fillStyle = "#d2b48c"
          ctx.fillRect(obj.x + 3, obj.y + 3, obj.width - 6, obj.height - 6)
          // Computer monitor
          ctx.fillStyle = "#1f2937"
          ctx.fillRect(obj.x + 15, obj.y + 10, 25, 18)
          ctx.fillStyle = "#3b82f6"
          ctx.fillRect(obj.x + 17, obj.y + 12, 21, 14)
          // Keyboard
          ctx.fillStyle = "#374151"
          ctx.fillRect(obj.x + 20, obj.y + 30, 15, 8)
          break

        case "chair":
          ctx.fillStyle = "#6b46c1"
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height)
          ctx.fillStyle = "#8b5cf6"
          ctx.fillRect(obj.x + 5, obj.y + 5, obj.width - 10, obj.height - 10)
          // Chair back
          ctx.fillStyle = "#6b46c1"
          ctx.fillRect(obj.x + 5, obj.y - 5, obj.width - 10, 10)
          break

        case "plant":
          // Pot
          ctx.fillStyle = "#8b4513"
          ctx.fillRect(obj.x + 5, obj.y + obj.height - 10, obj.width - 10, 10)
          // Plant
          ctx.fillStyle = "#22c55e"
          ctx.beginPath()
          ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, 0, Math.PI * 2)
          ctx.fill()
          // Leaves
          ctx.fillStyle = "#16a34a"
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2
            const leafX = obj.x + obj.width / 2 + Math.cos(angle) * (obj.width / 3)
            const leafY = obj.y + obj.height / 2 + Math.sin(angle) * (obj.width / 3)
            ctx.beginPath()
            ctx.arc(leafX, leafY, 5, 0, Math.PI * 2)
            ctx.fill()
          }
          break

        case "whiteboard":
          ctx.fillStyle = "#f8fafc"
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height)
          ctx.strokeStyle = "#374151"
          ctx.lineWidth = 3
          ctx.strokeRect(obj.x, obj.y, obj.width, obj.height)
          // Whiteboard content
          ctx.strokeStyle = "#3b82f6"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(obj.x + 10, obj.y + 15)
          ctx.lineTo(obj.x + obj.width - 10, obj.y + 25)
          ctx.moveTo(obj.x + 10, obj.y + 25)
          ctx.lineTo(obj.x + obj.width - 10, obj.y + 15)
          ctx.stroke()
          break

        case "game":
          ctx.fillStyle = "#dc2626"
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height)
          ctx.fillStyle = "#fca5a5"
          ctx.fillRect(obj.x + 10, obj.y + 10, obj.width - 20, obj.height - 20)
          // Game elements
          ctx.fillStyle = "#ffffff"
          ctx.beginPath()
          ctx.arc(obj.x + obj.width / 3, obj.y + obj.height / 2, 8, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = "#000000"
          ctx.beginPath()
          ctx.arc(obj.x + (obj.width * 2) / 3, obj.y + obj.height / 2, 8, 0, Math.PI * 2)
          ctx.fill()
          break
      }
    })

    // Draw area indicators and signage
    const areaSignages = [
      { text: "TEAM GAMES", x: 600, y: 630, color: "#dc2626", bgColor: "#fca5a5" },
      { text: "MEETINGS", x: 950, y: 80, color: "#4a5568", bgColor: "#a0aec0" },
      { text: "MAIN OFFICE", x: 650, y: 80, color: "#8b4513", bgColor: "#d2b48c" },
      { text: "BREAK AREA", x: 825, y: 420, color: "#38a169", bgColor: "#68d391" }
    ]

    areaSignages.forEach((sign) => {
      // Sign background
      ctx.fillStyle = sign.bgColor
      ctx.fillRect(sign.x - 60, sign.y - 15, 120, 25)
      ctx.strokeStyle = sign.color
      ctx.lineWidth = 2
      ctx.strokeRect(sign.x - 60, sign.y - 15, 120, 25)
      
      // Sign text
      ctx.fillStyle = sign.color
      ctx.font = "bold 12px monospace"
      ctx.textAlign = "center"
      ctx.fillText(sign.text, sign.x, sign.y + 5)
    })

    // Draw users with enhanced pixel art style
    const allUsers = [currentUser, ...users.filter((u) => u.isOnline)]
    allUsers.forEach((user) => {
      // Proximity circle for current user
      if (user.id === currentUser.id) {
        ctx.strokeStyle = "rgba(59, 130, 246, 0.4)"
        ctx.lineWidth = 2
        ctx.setLineDash([8, 8])
        ctx.beginPath()
        ctx.arc(user.x, user.y, 60, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // User shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
      ctx.beginPath()
      ctx.ellipse(user.x, user.y + 15, 12, 4, 0, 0, Math.PI * 2)
      ctx.fill()

      // User body (pixel character)
      const userColor = user.id === currentUser.id ? "#3b82f6" : "#8b5cf6"
      ctx.fillStyle = userColor
      ctx.fillRect(user.x - 8, user.y - 4, 16, 20)

      // User head
      ctx.fillStyle = "#fbbf24"
      ctx.fillRect(user.x - 6, user.y - 16, 12, 12)

      // User eyes
      ctx.fillStyle = "#000000"
      ctx.fillRect(user.x - 4, user.y - 12, 2, 2)
      ctx.fillRect(user.x + 2, user.y - 12, 2, 2)

      // User hair
      ctx.fillStyle = "#92400e"
      ctx.fillRect(user.x - 6, user.y - 16, 12, 4)

      // User name with background
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(user.x - 35, user.y - 35, 70, 15)
      ctx.fillStyle = "#ffffff"
      ctx.font = "11px monospace"
      ctx.textAlign = "center"
      ctx.fillText(user.name, user.x, user.y - 25)

      // Talking indicator (animated ring)
      if (user.isTalking) {
        const time = Date.now() / 1000
        const radius = 20 + Math.sin(time * 4) * 3
        ctx.strokeStyle = "#10b981"
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(user.x, user.y, radius, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Video indicator
      if (user.isVideoOn) {
        ctx.fillStyle = "#10b981"
        ctx.beginPath()
        ctx.arc(user.x + 10, user.y - 10, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = "#ffffff"
        ctx.font = "8px monospace"
        ctx.textAlign = "center"
        ctx.fillText("📹", user.x + 10, user.y - 7)
      }

      // Movement direction indicator for current user
      if (user.id === currentUser.id && (keys.up || keys.down || keys.left || keys.right)) {
        ctx.strokeStyle = "#fbbf24"
        ctx.lineWidth = 2
        ctx.beginPath()
        if (keys.up) {
          ctx.moveTo(user.x, user.y - 25)
          ctx.lineTo(user.x - 5, user.y - 20)
          ctx.moveTo(user.x, user.y - 25)
          ctx.lineTo(user.x + 5, user.y - 20)
        }
        if (keys.down) {
          ctx.moveTo(user.x, user.y + 25)
          ctx.lineTo(user.x - 5, user.y + 20)
          ctx.moveTo(user.x, user.y + 25)
          ctx.lineTo(user.x + 5, user.y + 20)
        }
        if (keys.left) {
          ctx.moveTo(user.x - 25, user.y)
          ctx.lineTo(user.x - 20, user.y - 5)
          ctx.moveTo(user.x - 25, user.y)
          ctx.lineTo(user.x - 20, user.y + 5)
        }
        if (keys.right) {
          ctx.moveTo(user.x + 25, user.y)
          ctx.lineTo(user.x + 20, user.y - 5)
          ctx.moveTo(user.x + 25, user.y)
          ctx.lineTo(user.x + 20, user.y + 5)
        }
        ctx.stroke()
      }
    })

    // Update camera to follow current user smoothly
    const targetCameraX = currentUser.x - canvas.width / (2 * zoom)
    const targetCameraY = currentUser.y - canvas.height / (2 * zoom)
    setCameraX(prev => prev + (targetCameraX - prev) * 0.1)
    setCameraY(prev => prev + (targetCameraY - prev) * 0.1)

    ctx.restore()
  }, [currentUser, users, zoom, cameraX, cameraY, objects, keys])

  // Handle canvas interactions
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) / zoom + cameraX
    const y = (event.clientY - rect.top) / zoom + cameraY

    // Move current user
    setCurrentUser((prev) => ({ ...prev, x, y }))

    // Update camera to follow user
    setCameraX(x - canvas.width / (2 * zoom))
    setCameraY(y - canvas.height / (2 * zoom))
  }

  // Calculate nearby users and current location
  useEffect(() => {
    const nearby = users.filter((user) => {
      if (!user.isOnline) return false
      const distance = Math.sqrt(Math.pow(user.x - currentUser.x, 2) + Math.pow(user.y - currentUser.y, 2))
      return distance <= 60
    })
    setNearbyUsers(nearby)

    // Determine current location based on user position
    const buildings = [
      { x: 500, y: 100, width: 300, height: 200, name: "Main Office" },
      { x: 850, y: 120, width: 200, height: 180, name: "Meeting Rooms" },
      { x: 200, y: 450, width: 250, height: 150, name: "Team Lounge" },
      { x: 500, y: 450, width: 200, height: 150, name: "Game Room" },
      { x: 750, y: 450, width: 150, height: 120, name: "Kitchen" },
      { x: 200, y: 100, width: 200, height: 180, name: "Private Offices" }
    ]

    let newLocation = "Outdoor Area"
    for (const building of buildings) {
      if (currentUser.x >= building.x && currentUser.x <= building.x + building.width &&
          currentUser.y >= building.y && currentUser.y <= building.y + building.height) {
        newLocation = building.name
        break
      }
    }

    // Check if near water
    if (currentUser.x >= 50 && currentUser.x <= 230 && 
        currentUser.y >= 650 && currentUser.y <= 770) {
      newLocation = "Pond Area"
    }

    setCurrentLocation(newLocation)
  }, [currentUser, users])

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      message: newMessage,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  // Zoom controls
  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2))
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5))

  // Redraw canvas
  useEffect(() => {
    drawOffice()
  }, [drawOffice])

  // Filter users based on search
  const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="h-screen bg-black flex">
      {/* Main Canvas Area */}
      <div className="flex-1 relative bg-black">
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          className="w-full h-full cursor-pointer"
          onClick={handleCanvasClick}
        />

        {/* Bottom Control Bar - Centered */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800/95 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-600">
          <div className="flex items-center space-x-4">
            {/* User Avatar */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">KG</span>
              </div>
              <span className="text-white text-sm font-medium">Kousik G</span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center space-x-2">
              <Button 
                variant={isAudioOn ? "default" : "destructive"} 
                size="sm" 
                onClick={() => setIsAudioOn(!isAudioOn)}
                className="w-9 h-9 rounded-full p-0 bg-gray-700 hover:bg-gray-600 border-0"
              >
                {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              
              <Button 
                variant={isVideoOn ? "default" : "destructive"} 
                size="sm" 
                onClick={() => setIsVideoOn(!isVideoOn)}
                className="w-9 h-9 rounded-full p-0 bg-gray-700 hover:bg-gray-600 border-0"
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                className="w-9 h-9 rounded-full p-0 bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300"
              >
                <Share className="w-4 h-4" />
              </Button>

              <Button 
                variant={isInCall ? "destructive" : "outline"} 
                size="sm" 
                onClick={() => setIsInCall(!isInCall)}
                className="w-9 h-9 rounded-full p-0 bg-red-600 hover:bg-red-700 border-0 text-white"
              >
                {isInCall ? <PhoneOff className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
              </Button>
            </div>

            {/* People Count */}
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-white text-sm">{nearbyUsers.length + 1}</span>
            </div>
          </div>
        </div>

        {/* Zoom Controls - Top Right */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={zoomIn} 
            className="w-8 h-8 rounded p-0 bg-gray-800/80 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={zoomOut} 
            className="w-8 h-8 rounded p-0 bg-gray-800/80 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Minus className="w-4 h-4" />
          </Button>
        </div>

        {/* Current Location Indicator */}
        <div className="absolute top-4 left-4 bg-gray-800/90 text-white px-4 py-2 rounded-lg border border-gray-600">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="font-medium">{currentLocation}</span>
          </div>
        </div>

        {/* Movement Controls Instructions */}
        <div className="absolute bottom-20 left-4 bg-gray-800/90 text-white px-4 py-3 rounded-lg border border-gray-600">
          <div className="text-sm">
            <div className="font-medium mb-2">Movement Controls:</div>
            <div className="space-y-1 text-xs text-gray-300">
              <div>↑ W - Move Up</div>
              <div>↓ S - Move Down</div>
              <div>← A - Move Left</div>
              <div>→ D - Move Right</div>
            </div>
          </div>
        </div>

        {/* Mini Map */}
        <div className="absolute bottom-4 right-4 w-48 h-32 bg-gray-800/90 border border-gray-600 rounded-lg overflow-hidden">
          <div className="p-2">
            <div className="text-xs text-gray-300 mb-1">Mini Map</div>
            <div className="relative w-full h-24 bg-green-900/50 rounded">
              {/* Buildings on mini map */}
              <div className="absolute w-6 h-4 bg-yellow-600/70 rounded-sm" style={{left: '40%', top: '15%'}}></div>
              <div className="absolute w-4 h-3 bg-blue-600/70 rounded-sm" style={{left: '70%', top: '20%'}}></div>
              <div className="absolute w-5 h-3 bg-purple-600/70 rounded-sm" style={{left: '15%', top: '65%'}}></div>
              <div className="absolute w-4 h-3 bg-red-600/70 rounded-sm" style={{left: '40%', top: '65%'}}></div>
              
              {/* Current user position */}
              <div 
                className="absolute w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                style={{
                  left: `${(currentUser.x / 1200) * 100}%`,
                  top: `${(currentUser.y / 800) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              ></div>
              
              {/* Other users on mini map */}
              {users.filter(u => u.isOnline).map(user => (
                <div 
                  key={user.id}
                  className="absolute w-1.5 h-1.5 bg-purple-400 rounded-full"
                  style={{
                    left: `${(user.x / 1200) * 100}%`,
                    top: `${(user.y / 800) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - People Panel */}
      {showMembers && (
        <div className="w-72 bg-gray-900 text-white flex flex-col border-l border-gray-700">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">People</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowMembers(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Find someone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-500 text-sm"
              />
            </div>
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* In this space */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">In This Space</span>
                <Badge variant="secondary" className="bg-gray-800 text-gray-400 text-xs">
                  {users.filter((u) => u.isOnline).length + 1}
                </Badge>
              </div>

              <div className="space-y-1">
                {/* Current User */}
                <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-800/50">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">KG</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{currentUser.name}</div>
                    <div className="text-xs text-gray-500">you</div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {currentUser.isTalking && <Volume2 className="w-3 h-3 text-green-400" />}
                    {currentUser.isVideoOn && <Video className="w-3 h-3 text-blue-400" />}
                  </div>
                </div>

                {/* Other Online Users */}
                {filteredUsers.filter((u) => u.isOnline).map((user) => (
                  <div key={user.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-800/50">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{user.name}</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {user.isTalking && <Volume2 className="w-3 h-3 text-green-400" />}
                      {user.isVideoOn && <Video className="w-3 h-3 text-blue-400" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Offline Members */}
            {users.filter((u) => !u.isOnline).length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Offline</span>
                  <Badge variant="secondary" className="bg-gray-800 text-gray-400 text-xs">
                    {users.filter((u) => !u.isOnline).length}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {users.filter((u) => !u.isOnline).map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 p-2 opacity-50">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-500 rounded-full border-2 border-gray-900"></div>
                      </div>
                      <div className="font-medium text-sm">{user.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toggle People Panel Button */}
      {!showMembers && (
        <Button
          className="fixed top-4 right-4 w-10 h-10 rounded-lg bg-gray-800/80 hover:bg-gray-700 border border-gray-600 text-gray-300"
          onClick={() => setShowMembers(true)}
        >
          <Users className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
