"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Users,
  Settings,
  Phone,
  PhoneOff,
  Volume2,
  Share,
  Send,
} from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  name: string
  x: number
  y: number
  color: string
  isOnline: boolean
  isTalking: boolean
}

interface ChatMessage {
  id: string
  userId: string
  userName: string
  message: string
  timestamp: Date
  x?: number
  y?: number
  isLocationBased?: boolean
}

export default function VirtualOffice() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentUser, setCurrentUser] = useState<User>({
    id: "user-1",
    name: "You",
    x: 400,
    y: 300,
    color: "#3B82F6",
    isOnline: true,
    isTalking: false,
  })

  const [users, setUsers] = useState<User[]>([
    { id: "user-2", name: "Alice", x: 200, y: 200, color: "#EF4444", isOnline: true, isTalking: false },
    { id: "user-3", name: "Bob", x: 600, y: 250, color: "#10B981", isOnline: true, isTalking: true },
    { id: "user-4", name: "Carol", x: 300, y: 400, color: "#F59E0B", isOnline: true, isTalking: false },
    { id: "user-5", name: "David", x: 500, y: 150, color: "#8B5CF6", isOnline: false, isTalking: false },
  ])

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      userId: "user-2",
      userName: "Alice",
      message: "Hey everyone! Ready for the standup?",
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "2",
      userId: "user-3",
      userName: "Bob",
      message: "Yes! Just finishing up my coffee ☕",
      timestamp: new Date(Date.now() - 240000),
    },
    {
      id: "3",
      userId: "user-4",
      userName: "Carol",
      message: "I love this new office layout!",
      timestamp: new Date(Date.now() - 120000),
      x: 300,
      y: 400,
      isLocationBased: true,
    },
  ])

  const [newMessage, setNewMessage] = useState("")
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isInCall, setIsInCall] = useState(false)
  const [showChat, setShowChat] = useState(true)
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([])

  // Canvas drawing
  const drawOffice = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw floor
    ctx.fillStyle = "#F3F4F6"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid pattern
    ctx.strokeStyle = "#E5E7EB"
    ctx.lineWidth = 1
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw furniture
    const furniture = [
      { x: 150, y: 150, width: 100, height: 60, color: "#8B4513", type: "desk" },
      { x: 450, y: 150, width: 100, height: 60, color: "#8B4513", type: "desk" },
      { x: 150, y: 350, width: 100, height: 60, color: "#8B4513", type: "desk" },
      { x: 450, y: 350, width: 100, height: 60, color: "#8B4513", type: "desk" },
      { x: 300, y: 250, width: 80, height: 80, color: "#4B5563", type: "table" },
      { x: 50, y: 100, width: 60, height: 120, color: "#059669", type: "plant" },
      { x: 650, y: 100, width: 60, height: 120, color: "#059669", type: "plant" },
    ]

    furniture.forEach((item) => {
      ctx.fillStyle = item.color
      ctx.fillRect(item.x, item.y, item.width, item.height)

      // Add some detail based on type
      if (item.type === "desk") {
        ctx.fillStyle = "#6B7280"
        ctx.fillRect(item.x + 10, item.y + 10, item.width - 20, item.height - 20)
      } else if (item.type === "plant") {
        ctx.fillStyle = "#10B981"
        ctx.beginPath()
        ctx.arc(item.x + item.width / 2, item.y + 20, 25, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    // Draw meeting rooms
    ctx.strokeStyle = "#6B7280"
    ctx.lineWidth = 3
    ctx.strokeRect(600, 300, 150, 120)
    ctx.fillStyle = "rgba(59, 130, 246, 0.1)"
    ctx.fillRect(600, 300, 150, 120)

    ctx.fillStyle = "#374151"
    ctx.font = "14px Inter"
    ctx.fillText("Meeting Room", 620, 370)

    // Draw all users
    const allUsers = [currentUser, ...users]
    allUsers.forEach((user) => {
      if (!user.isOnline) return

      // Draw proximity circle for current user
      if (user.id === currentUser.id) {
        ctx.strokeStyle = "rgba(59, 130, 246, 0.3)"
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.arc(user.x, user.y, 80, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Draw user avatar
      ctx.fillStyle = user.color
      ctx.beginPath()
      ctx.arc(user.x, user.y, 20, 0, Math.PI * 2)
      ctx.fill()

      // Draw talking indicator
      if (user.isTalking) {
        ctx.strokeStyle = "#10B981"
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(user.x, user.y, 25, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Draw name
      ctx.fillStyle = "#1F2937"
      ctx.font = "12px Inter"
      ctx.textAlign = "center"
      ctx.fillText(user.name, user.x, user.y - 35)
    })

    // Draw location-based chat messages
    chatMessages.forEach((msg) => {
      if (msg.isLocationBased && msg.x && msg.y) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
        ctx.strokeStyle = "#E5E7EB"
        ctx.lineWidth = 1

        const padding = 8
        const maxWidth = 150
        const lines = msg.message.match(/.{1,20}(\s|$)/g) || [msg.message]
        const lineHeight = 16
        const bubbleHeight = lines.length * lineHeight + padding * 2

        ctx.fillRect(msg.x - maxWidth / 2, msg.y - 50, maxWidth, bubbleHeight)
        ctx.strokeRect(msg.x - maxWidth / 2, msg.y - 50, maxWidth, bubbleHeight)

        ctx.fillStyle = "#374151"
        ctx.font = "12px Inter"
        ctx.textAlign = "center"
        lines.forEach((line, index) => {
          ctx.fillText(line.trim(), msg.x, msg.y - 35 + index * lineHeight)
        })
      }
    })
  }, [currentUser, users, chatMessages])

  // Handle canvas click to move user
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    setCurrentUser((prev) => ({ ...prev, x, y }))
  }

  // Calculate nearby users
  useEffect(() => {
    const nearby = users.filter((user) => {
      if (!user.isOnline) return false
      const distance = Math.sqrt(Math.pow(user.x - currentUser.x, 2) + Math.pow(user.y - currentUser.y, 2))
      return distance <= 80
    })
    setNearbyUsers(nearby)
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

  // Redraw canvas
  useEffect(() => {
    drawOffice()
  }, [drawOffice])

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
            <span className="font-bold text-xl">Gather</span>
          </Link>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
            Virtual Office
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant={isAudioOn ? "default" : "destructive"} size="sm" onClick={() => setIsAudioOn(!isAudioOn)}>
            {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>
          <Button variant={isVideoOn ? "default" : "destructive"} size="sm" onClick={() => setIsVideoOn(!isVideoOn)}>
            {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </Button>
          <Button variant={isInCall ? "destructive" : "default"} size="sm" onClick={() => setIsInCall(!isInCall)}>
            {isInCall ? <PhoneOff className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Office View */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-full cursor-pointer"
            onClick={handleCanvasClick}
          />

          {/* Nearby Users Panel */}
          {nearbyUsers.length > 0 && (
            <Card className="absolute top-4 left-4 p-4 bg-white/95 backdrop-blur-sm">
              <h3 className="font-semibold text-sm mb-2 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Nearby ({nearbyUsers.length})
              </h3>
              <div className="space-y-2">
                {nearbyUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: user.color }}></div>
                    <span className="text-sm">{user.name}</span>
                    {user.isTalking && <Volume2 className="w-3 h-3 text-green-500" />}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Instructions */}
          <Card className="absolute bottom-4 left-4 p-3 bg-white/95 backdrop-blur-sm">
            <p className="text-sm text-gray-600">
              Click anywhere to move around • Get close to others to start talking
            </p>
          </Card>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
                ×
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{msg.userName}</span>
                    <span className="text-xs text-gray-500">{msg.timestamp.toLocaleTimeString()}</span>
                    {msg.isLocationBased && (
                      <Badge variant="secondary" className="text-xs">
                        📍 Location
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{msg.message}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Chat toggle button when hidden */}
        {!showChat && (
          <Button className="fixed bottom-4 right-4 rounded-full w-12 h-12" onClick={() => setShowChat(true)}>
            <MessageSquare className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  )
}
