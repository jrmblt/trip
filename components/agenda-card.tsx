import {MapPinIcon} from "lucide-react"
import React, {useState, useEffect} from "react"
import {motion, PanInfo, useAnimation} from "framer-motion"
import {IAgendaItem} from "@/types"

interface IProps {
  agenda: IAgendaItem
  currentTime: Date
  tripDate: Date
  isCurrentAgenda: boolean
}

const AgendaCard = (props: IProps) => {
  const [isCompleted, setIsCompleted] = useState(false)
  const controls = useAnimation()

  useEffect(() => {
    const savedState = localStorage.getItem(`agenda_${props.agenda.time}`)
    if (savedState) {
      setIsCompleted(JSON.parse(savedState))
    }
  }, [props.agenda.time])

  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return {hours, minutes}
  }

  const calculateDuration = (time: string) => {
    if (time.includes(" - ")) {
      const [start, end] = time.split(" - ")
      const startTime = parseTime(start)
      const endTime = parseTime(end)

      let duration =
        endTime.hours * 60 +
        endTime.minutes -
        (startTime.hours * 60 + startTime.minutes)
      if (duration < 0) duration += 24 * 60 // ถ้าข้ามวัน

      const hours = Math.floor(duration / 60)
      const minutes = duration % 60

      if (hours === 0 && minutes === 0) return null
      if (hours === 0) return `${minutes} นาที`
      if (minutes === 0) return `${hours} ชั่วโมง`
      return `${hours} ชั่วโมง ${minutes} นาที`
    }
    return null
  }

  const isPastAgenda = () => {
    const timeStr = props.agenda.time
    let agendaTime: Date

    if (timeStr.includes(" - ")) {
      const [start] = timeStr.split(" - ")
      const {hours, minutes} = parseTime(start)
      agendaTime = new Date(props.tripDate)
      agendaTime.setHours(hours, minutes)
    } else {
      const {hours, minutes} = parseTime(timeStr)
      agendaTime = new Date(props.tripDate)
      agendaTime.setHours(hours, minutes)
    }

    return props.currentTime > agendaTime
  }

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x > 40) {
      const newState = !isCompleted
      setIsCompleted(newState)
      localStorage.setItem(
        `agenda_${props.agenda.time}`,
        JSON.stringify(newState)
      )
    }
    controls.start({x: 0})
  }

  return (
    <motion.div
      className={`w-full border rounded-md flex text-stone-700 
      ${isPastAgenda() ? "opacity-50" : ""} 
      ${isCompleted ? "bg-gray-200" : ""} 
      ${props.isCurrentAgenda ? "border-green-500 border-2" : ""}
      cursor-grab active:cursor-grabbing`}
      whileHover={{scale: 1.02}}
      drag="x"
      dragConstraints={{left: 0, right: 50}}
      onDragEnd={handleDragEnd}
      animate={controls}
    >
      <div
        className={`h-full ${
          isCompleted ? "bg-green-500" : "bg-gray-300"
        } rounded-l w-1`}
      />
      <div className="flex-col flex gap-2 p-4 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {props.agenda.time && (
              <div className="text-xs md:text-sm lg:text-base font-semibold">
                {props.agenda.time}
              </div>
            )}
            {props.isCurrentAgenda && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                ปัจจุบัน
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {props.agenda.time && calculateDuration(props.agenda.time)}
          </div>
        </div>
        <div className="text-xs md:text-sm lg:text-base font-semibold">
          {props.agenda.activity}
        </div>
        <div className="text-xs md:text-sm lg:text-base text-muted-foreground">
          <MapPinIcon className="w-4 h-4 mr-1 inline" />
          {props.agenda.location}
        </div>
        <div className="text-xs md:text-sm lg:text-base text-muted-foreground italic mt-2 flex items-center gap-1">
          <p className="bg-slate-200/50">โน๊ต</p>
          {props.agenda.note || "-"}
        </div>
      </div>
    </motion.div>
  )
}

export default AgendaCard
