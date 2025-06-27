"use client"
import { useState } from "react"
import { MoreHorizontal } from "lucide-react"
import { useSocketContext } from "@/providers/SocketProvider"

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("today")
  const [selectedType, setSelectedType] = useState("all")
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla lorem et maximus nec malesuada vitae, volutpat sed ipsum.",
      time: "1hr ago",
      unread: true,
      type: "alert",
      date: new Date(Date.now() - 1000 * 60 * 60 * 2), // Today
    },
    {
      id: 2,
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla lorem et maximus nec malesuada vitae, volutpat sed ipsum.",
      time: "1hr ago",
      unread: false,
      type: "news",
      date: new Date(Date.now() - 1000 * 60 * 60 * 2), // Today
    },
    {
      id: 3,
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla lorem et maximus nec malesuada vitae, volutpat sed ipsum.",
      time: "1hr ago",
      unread: true,
      type: "promotional",
      date: new Date(Date.now() - 1000 * 60 * 60 * 2), // Today
    },
    {
      id: 4,
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla lorem et maximus nec malesuada vitae, volutpat sed ipsum.",
      time: "1hr ago",
      unread: false,
      type: "alert",
      date: new Date(Date.now() - 1000 * 60 * 60 * 2), // Today
    },
    {
      id: 5,
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla lorem et maximus nec malesuada vitae, volutpat sed ipsum.",
      time: "1hr ago",
      unread: true,
      type: "news",
      date: new Date(Date.now() - 1000 * 60 * 60 * 2), // Today
    },
    {
      id: 6,
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla lorem et maximus nec malesuada vitae, volutpat sed ipsum.",
      time: "3 days ago",
      unread: false,
      type: "promotional",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // Previous
    },
    {
      id: 7,
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla lorem et maximus nec malesuada vitae, volutpat sed ipsum.",
      time: "4 days ago",
      unread: true,
      type: "alert",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // Previous
    },
    {
      id: 8,
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla lorem et maximus nec malesuada vitae, volutpat sed ipsum.",
      time: "5 days ago",
      unread: false,
      type: "news",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // Previous
    },
    {
      id: 9,
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla lorem et maximus nec malesuada vitae, volutpat sed ipsum.",
      time: "1 week ago",
      unread: true,
      type: "promotional",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // Previous
    },
    {
      id: 10,
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla lorem et maximus nec malesuada vitae, volutpat sed ipsum.",
      time: "2 weeks ago",
      unread: false,
      type: "alert",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // Previous
    },
  ])


  const { newsNotification } = useSocketContext()

  // Filter notifications based on active tab
  const filteredNotifications = notifications
    .filter((notification) => {
      // Filter by tab (today or previous)
      if (activeTab === "today") {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return notification.date >= today
      } else if (activeTab === "previous") {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return notification.date < today
      }
      return true
    })
    .filter((notification) => {
      // Filter by type
      return selectedType === "all" || notification.type === selectedType
    })

  // Count today's notifications
  const todayCount = notifications.filter((notification) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return notification.date >= today
  }).length

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        unread: false,
      })),
    )
  }

  // Handle clear all
  const handleClearAll = () => {
    setNotifications([])
  }

  // Handle tab click
  const handleTabClick = (tab: "today" | "previous" | "mark" | "clear") => {
    if (tab === "mark") {
      handleMarkAllAsRead()
    } else if (tab === "clear") {
      handleClearAll()
    } else {
      setActiveTab(tab)
    }
  }


  console.log(newsNotification)

  return (
    <div className="container mx-auto px-6 py-4 mt-28">
      <h1 className="text-4xl font-bold mb-5 text-center">Notifications</h1>

      <div className="border-b mb-2">
        <div className="flex text-sm">
          <button
            className={`px-4 py-2 font-medium ${activeTab === "today" ? "text-green-500 border-b-2 border-sky-300" : "text-gray-600"}`}
            onClick={() => handleTabClick("today")}
          >
            Today ({todayCount})
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === "previous" ? "text-green-500 border-b-2 border-sky-300" : "text-gray-600"}`}
            onClick={() => handleTabClick("previous")}
          >
            Previous
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === "mark" ? "text-green-500 border-b-2 border-sky-300" : "text-gray-600"}`}
            onClick={() => handleTabClick("mark")}
          >
            Mark as read
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === "clear" ? " border-b-2 border-sky-300 text-red-500" : "text-red-600"}`}
            onClick={() => handleTabClick("clear")}
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="flex items-center mb-4">
        <p className="text-sm text-gray-600 mr-2">Filter by type:</p>
        <select
          className="text-sm border rounded-md px-2 py-1"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="all">All</option>
          <option value="alert">Alerts</option>
          <option value="news">News</option>
          <option value="promotional">Promotional</option>
        </select>
      </div>

      <div className="space-y-0">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center gap-1 py-4 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer transition-all duration-300"
            >
              {notification.unread ? (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 pr-8 line-clamp-2">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="capitalize font-medium">{notification.type}</span> • {notification.time}
                </p>
              </div>

              <div className="flex flex-col gap-4 items-end">
                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">No notifications to display</div>
        )}
      </div>
    </div>
  )
}
