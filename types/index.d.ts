export interface IAgendaItem {
  time: string
  activity: string
  location: string
  note?: string
}

export interface IDayAgenda {
  date: string
  items: IAgendaItem[]
}

export interface ITrip {
  id: string
  title: string
  date?: string
  startDate?: string
  endDate?: string
  isVisible: boolean
  agenda: IAgendaItem[] | IDayAgenda[]
}

export interface ITripsData {
  trips: ITrip[]
}
