const http = require("http");

class zcash {
	constructor(conf) {
		if(conf.username && conf.password) {
			this.auth = "Basic " + Buffer.from(conf.username + ":" + conf.password).toString("base64");
		}

		this.host = conf.host || "localhost";
		this.port = conf.port || 8232;
	}
};

[
	"z_getbalance",
	"z_gettotalbalance",
	"z_getnewaddress",
	"z_listaddresses",
	"z_exportkey",
	"z_importkey",
	"z_exportwallet",
	"z_importwallet",
	"z_getoperationresult",
	"z_getoperationstatus",
	"z_listoperationids",
	"z_listreceivedbyaddress",
	"z_sendmany"
].forEach(method => {
	zcash.prototype[method] = function() {
		return new Promise((resolve, reject) => {
			const params = [...arguments];

			const postData = JSON.stringify({
				jsonrpc: "2.0",
				id: 1,
				method, params
			});

			const options = {
				hostname: this.hostname,
				port: this.port,
				method: "POST",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"Content-Length": Buffer.byteLength(postData),
					"Authorization": this.auth
				}
			};

			const req = http.request(options, (res) => {
				let data = "";

				res.setEncoding("utf8");
				res.on("data", chunk => data += chunk);

				res.on("end", () => {
					const response = JSON.parse(data);

					if(response.error) {
						return reject(new Error(response.error));
					}

					resolve(response.result);
				});
			});

			req.on("error", reject);

			req.write(postData);
			req.end();
		});
	}
});

module.exports = zcash;
