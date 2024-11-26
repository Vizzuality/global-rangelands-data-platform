import axios from "axios";

export const APIOpenStreetMapLocation = axios.create({
  baseURL: "https://nominatim.openstreetmap.org",
  headers: {},
});
