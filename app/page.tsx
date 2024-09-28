"use client"
import AgendaCard from "@/components/agenda-card"
import tripsData from "@/constants/trips/trips.json"
import {ClockIcon, DownloadIcon, RefreshCwIcon} from "lucide-react"
import Clock from "react-live-clock"
import {useState, useEffect, useRef} from "react"
import html2canvas from "html2canvas"
import {saveAs} from "file-saver"
import {ITripsData, ITrip, IDayAgenda, IAgendaItem} from "@/types"

export default function Home() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [visibleTrips, setVisibleTrips] = useState<ITrip[]>([])
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const visible = (tripsData as ITripsData).trips.filter(
      (trip) => trip.isVisible
    )
    setVisibleTrips(visible)
    if (
      visible.length > 0 &&
      (!selectedTripId || !visible.some((trip) => trip.id === selectedTripId))
    ) {
      setSelectedTripId(visible[0].id)
    } else if (visible.length === 0) {
      setSelectedTripId(null)
    }
  }, [selectedTripId])

  const handleDownload = async () => {
    if (contentRef.current) {
      try {
        const canvas = await html2canvas(contentRef.current, {
          scale: 2,
          logging: false,
          useCORS: true,
        })
        canvas.toBlob((blob) => {
          if (blob) {
            const selectedTrip = visibleTrips.find(
              (trip) => trip.id === selectedTripId
            )
            saveAs(blob, `${selectedTrip?.title}.png`)
          }
        })
      } catch (error) {
        console.error("Error generating image:", error)
      }
    }
  }

  const handleClearLocalStorage = () => {
    localStorage.clear()
    window.location.reload()
  }

  const selectedTrip = visibleTrips.find((trip) => trip.id === selectedTripId)

  const isSingleDayTrip = (
    agenda: ITrip["agenda"]
  ): agenda is IAgendaItem[] => {
    return Array.isArray(agenda) && agenda.length > 0 && "time" in agenda[0]
  }

  if (visibleTrips.length === 0) {
    return (
      <main className="container text-sm bg-white mx-auto h-full min-h-dvh relative flex items-center justify-center">
        <p>ไม่มีทริปที่สามารถแสดงผลได้ในขณะนี้</p>
      </main>
    )
  }

  return (
    <main className="container text-sm bg-white mx-auto h-full min-h-dvh relative">
      <div ref={contentRef} className="bg-white h-full p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <select
            value={selectedTripId || ""}
            onChange={(e) => setSelectedTripId(e.target.value)}
            className="border rounded-md border-gray-100 p-2 flex items-center justify-center
              hover:bg-gray-100/50 transition-all duration-100 active:bg-gray-100/70
              cursor-pointer focus:outline-none"
          >
            {visibleTrips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.title}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <button
              className="border rounded-md border-gray-100 p-2 flex items-center justify-center
              hover:bg-gray-100/50 transition-all duration-100 active:bg-gray-100/70
              cursor-pointer"
              onClick={handleClearLocalStorage}
              title="Clear all saved states"
            >
              <RefreshCwIcon size={16} />
            </button>
            <button
              className="border rounded-md border-gray-100 p-2 flex items-center justify-center
              hover:bg-gray-100/50 transition-all duration-100 active:bg-gray-100/70
              cursor-pointer"
              onClick={handleDownload}
            >
              <DownloadIcon size={16} />
            </button>
          </div>
        </div>
        {selectedTrip && (
          <div className="flex flex-col gap-2 pb-2">
            {isSingleDayTrip(selectedTrip.agenda)
              ? // Single-day trip
                selectedTrip.agenda.map((agenda, index) => (
                  <AgendaCard
                    key={index}
                    agenda={agenda}
                    currentTime={currentTime}
                    tripDate={new Date(selectedTrip.date as string)}
                  />
                ))
              : // Multi-day trip
                (selectedTrip.agenda as IDayAgenda[]).map((day, dayIndex) => (
                  <div key={dayIndex} className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">
                      {new Date(day.date).toLocaleDateString("th-TH", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    <div className="flex flex-col gap-2">
                      {day.items.map((agenda, index) => (
                        <AgendaCard
                          key={index}
                          agenda={agenda}
                          currentTime={currentTime}
                          tripDate={new Date(day.date)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
          </div>
        )}
      </div>
      <div className="sticky bottom-4 flex items-center justify-center">
        <div className="bg-white p-2 border flex rounded-md shadow-sm w-32 gap-2 items-center justify-center">
          <ClockIcon size={16} />
          <Clock
            format={"HH:mm:ss"}
            noSsr
            ticking={true}
            timezone={"Asia/Bangkok"}
          />
        </div>
      </div>
    </main>
  )
}
