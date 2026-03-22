import axios from "axios";

const VN_PROVINCES_API = "https://provinces.open-api.vn/api/v2";

const addressApi = axios.create({
  baseURL: VN_PROVINCES_API,
  timeout: 10000,
});

addressApi.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error),
);

const addressService = {
  getProvinces: () => addressApi.get("/p/"),
  getDistricts: (provinceCode) => addressApi.get(`/p/${provinceCode}?depth=2`),
  getWardsByProvince: (provinceCode) =>
    addressApi.get(`/w/?province=${provinceCode}`),
  getWards: () => Promise.resolve({ wards: [] }),
};

export default addressService;
