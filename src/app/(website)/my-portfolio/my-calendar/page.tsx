/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Create axios instance (adjust baseURL as needed)
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://your-api-base-url.com",
});

interface Event {
  symbol: string;
  type: string;
  date: string;
}

interface EventsResponse {
  total: number;
  events: Event[];
}

export default function FinancialDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);

  // Fetch events data
  const {
    data: eventsData,
    isLoading,
    error,
  } = useQuery<EventsResponse>({
    queryKey: ["upcomingEvents"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/portfolio/upcoming-event");
        return res.data || { total: 0, events: [] };
      } catch (error) {
        console.error("Error fetching events:", error);
        throw error;
      }
    },
  });

  const events = eventsData?.events || [];

  // Get current month info
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Calculate calendar days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  // Create calendar grid
  const calendarDays = useMemo(() => {
    const days = [];

    // Previous month days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      days.push({
        day: prevMonth.getDate() - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonth.getDate() - i),
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(year, month, day),
      });
    }

    // Next month days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month + 1, day),
      });
    }

    return days;
  }, [year, month, firstDayWeekday, daysInMonth]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: { [key: string]: Event[] } = {};
    events.forEach((event) => {
      const dateKey = event.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  // Filter events based on selection
  const filteredEvents = useMemo(() => {
    if (selectedDate) {
      return eventsByDate[selectedDate] || [];
    }

    // Show all events for current month
    const currentMonthStart = new Date(year, month, 1)
      .toISOString()
      .split("T")[0];
    const currentMonthEnd = new Date(year, month + 1, 0)
      .toISOString()
      .split("T")[0];

    return events.filter(
      (event) =>
        event.date >= currentMonthStart && event.date <= currentMonthEnd
    );
  }, [selectedDate, eventsByDate, events, year, month]);

  // Pagination logic
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
    setCurrentPage(1);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
    setCurrentPage(1);
  };

  // Handle date click - fix timezone issue
  const handleDateClick = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;

    // Create date string in local timezone to match API format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    const newSelectedDate = selectedDate === dateString ? null : dateString;
    setSelectedDate(newSelectedDate);
    setCurrentPage(1); // Reset to first page when date changes
  };

  // Check if date has events - fix timezone issue
  const hasEvents = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;
    return eventsByDate[dateString]?.length > 0;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (error) {
    return (
      <div className="w-[75vw] mt-16 border border-gray-100 p-4 rounded-lg shadow-lg">
        <div className="text-center text-red-500">
          Error loading events. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="w-[75vw] mt-16 border border-gray-100 p-4 rounded-lg shadow-lg">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{monthName}</h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={goToPreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={goToNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0">
            {/* Days of week */}
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
              <div
                key={day}
                className="text-center py-2 text-sm font-medium border-b"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((dateInfo, index) => {
              // Fix: Use consistent local date formatting for comparison
              const year = dateInfo.date.getFullYear();
              const month = String(dateInfo.date.getMonth() + 1).padStart(
                2,
                "0"
              );
              const day = String(dateInfo.date.getDate()).padStart(2, "0");
              const dateString = `${year}-${month}-${day}`;

              const isSelected = selectedDate === dateString;
              const hasEventsOnDate = hasEvents(dateInfo.date);

              return (
                <div
                  key={index}
                  className={`
                    border border-gray-100 p-3 text-center cursor-pointer transition-colors relative
                    ${
                      !dateInfo.isCurrentMonth
                        ? "text-gray-300 bg-gray-50"
                        : "hover:bg-gray-50"
                    }
                    ${
                      isSelected
                        ? "bg-indigo-700 text-white hover:bg-indigo-800"
                        : ""
                    }
                    ${
                      hasEventsOnDate && !isSelected
                        ? "bg-blue-50 text-blue-700"
                        : ""
                    }
                  `}
                  onClick={() =>
                    handleDateClick(dateInfo.date, dateInfo.isCurrentMonth)
                  }
                >
                  {dateInfo.day}
                  {hasEventsOnDate && (
                    <div
                      className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                        isSelected ? "bg-white" : "bg-blue-500"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {selectedDate && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Showing events for {formatDate(selectedDate)}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-6 px-2 text-xs"
                  onClick={() => setSelectedDate(null)}
                >
                  Show all month
                </Button>
              </p>
            </div>
          )}
        </div>

        {/* Events Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Events</h2>
            <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="bg-green-500 h-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    (filteredEvents.length / Math.max(events.length, 1)) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {isLoading
                ? "Loading..."
                : `${filteredEvents.length} events ${
                    selectedDate ? "for selected date" : "this month"
                  }${
                    totalPages > 1
                      ? ` (Page ${currentPage} of ${totalPages})`
                      : ""
                  }`}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium text-sm">
                    Symbol
                  </th>
                  <th className="text-left py-2 px-2 font-medium text-sm">
                    Type
                  </th>
                  <th className="text-left py-2 px-2 font-medium text-sm">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">
                      Loading events...
                    </td>
                  </tr>
                ) : paginatedEvents.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">
                      {selectedDate
                        ? "No events for selected date"
                        : "No events this month"}
                    </td>
                  </tr>
                ) : (
                  paginatedEvents.map((event, index) => (
                    <tr
                      key={`${event.symbol}-${event.date}-${index}`}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-2 text-green-600 font-medium">
                        {event.symbol}
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-blue-500">{event.type}</span>
                      </td>
                      <td className="py-3 px-2">{formatDate(event.date)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {filteredEvents.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + itemsPerPage, filteredEvents.length)}{" "}
                  of {filteredEvents.length} events
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className=" disabled:bg-green-300 disabled:text-gay-800 bg-green-500 text-white hover:bg-green-500 hover:text-white"
                  >
                    Previous
                  </Button>

                  {/* Page numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          className={`w-8 h-8 p-0 ${
                            currentPage === pageNum
                              ? "bg-green-500 text-white"
                              : ""
                          }`}
                          onClick={() => goToPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className=" disabled:bg-green-300 disabled:text-gay-800 bg-green-500 text-white hover:bg-green-500 hover:text-white"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
