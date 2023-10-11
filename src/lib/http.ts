import { API_URL } from "@/constants";
import { useUserStore } from "@/stores/userStore";
import axios, { AxiosHeaders } from "axios";
import { v4 } from "uuid";

const http = axios.create({
  baseURL: API_URL,
});
http.interceptors.request.use(
  async (config) => {
    // const accessToken = useUserStore.getState().magicDIDToken;
    const headers = new AxiosHeaders();
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    // if (accessToken) {
    //   headers.set("Authorization", `Bearer ${accessToken}`);
    // }

    let anonUserId = useUserStore.getState().xUserId;

    if (!anonUserId) {
      anonUserId = v4();
      useUserStore.setState({ xUserId: anonUserId });
    }
    headers.set("x-user-id", anonUserId);

    config.headers = headers;
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // const access_token = await magic.user.generateIdToken({ lifespan: 1800 });
      // useUserStore.setState({
      //   magicDIDToken: access_token,
      // });
      // axios.defaults.headers.common["Authorization"] = "Bearer " + access_token;

      return http(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default http;
