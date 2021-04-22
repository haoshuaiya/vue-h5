import { get, post } from "./http";

const api = {
	test: (p) => {
		return get("testapiUrl", p);
	},
};

export default api;
