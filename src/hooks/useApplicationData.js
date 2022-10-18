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

  const updateSpots = (type) => {
    let dayIndex = 0;

    if (state.day === "Monday") {
      dayIndex = 0;
    } else if (state.day === "Tuesday") {
      dayIndex = 1;
    } else if (state.day === "Wednesday") {
      dayIndex = 2;
    } else if (state.day === "Thursday") {
      dayIndex = 3;
    } else if (state.day === "Friday") {
      dayIndex = 4;
    }

    let numOfSpots = -1;

    for (const appmt of state.days[dayIndex].appointments) {
      if (!state.appointments[appmt].interview) {
        numOfSpots++;
      }
    }

    if (type === "delete") {
      numOfSpots += 2;
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
      const modifiedDaysArray = updateSpots();

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

      const modifiedDaysArray = updateSpots("delete");

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
