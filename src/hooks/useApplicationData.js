import { useEffect, useState } from "react";
import axios from "axios";

export default function useApplicationData() {
  const [state, setState] = useState({
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {},
  });

  const setDay = (day) => setState({ ...state, day });

  useEffect(() => {
    Promise.all([
      axios.get("/api/days"),
      axios.get("/api/appointments"),
      axios.get("/api/interviewers"),
    ])
      .then((all) => {
        setState((prev) => ({
          ...prev,
          days: all[0].data,
          appointments: all[1].data,
          interviewers: all[2].data,
        }));
      })
      .catch((e) => console.log(e));
  }, []);

  const updateSpots = (appointments) => {
    const dayIndex = state.days.findIndex((d) => d.name === state.day);

    let numOfSpots = 0;

    for (const appmt of state.days[dayIndex].appointments) {
      if (!appointments[appmt].interview) {
        numOfSpots++;
      }
    }

    const modifiedDaysArray = [...state.days];
    modifiedDaysArray[dayIndex].spots = numOfSpots;

    return modifiedDaysArray;
  };

  const bookInterview = function (id, interview) {
    const appointment = {
      ...state.appointments[id],
      interview: { ...interview },
    };
    const appointments = {
      ...state.appointments,
      [id]: appointment,
    };

    return axios.put(`/api/appointments/${id}`, appointment).then((res) => {
      const modifiedDaysArray = updateSpots(appointments);

      setState({
        ...state,
        appointments,
        days: modifiedDaysArray,
      });
    });
  };

  const cancelInterview = function (id) {
    console.log("cancel interview called, id", id);

    const appointment = {
      ...state.appointments[id],
      interview: null,
    };

    const appointments = {
      ...state.appointments,
      [id]: appointment,
    };

    return axios.delete(`/api/appointments/${id}`).then((res) => {
      console.log("axios delete res:", res);

      const modifiedDaysArray = updateSpots(appointments);

      setState({
        ...state,
        appointments,
        days: modifiedDaysArray,
      });
    });
  };

  return {
    state,
    setDay,
    bookInterview,
    cancelInterview,
  };
}
