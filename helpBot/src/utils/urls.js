// /src/utils/urls.js
import { isProd } from "./isProd";

const backEndUrls = isProd() ? "" : "http://localhost:5000";

export default backEndUrls;
