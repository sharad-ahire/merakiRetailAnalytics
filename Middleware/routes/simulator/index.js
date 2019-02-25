var express = require("express");
var router = express.Router();


router.post("/generate", function (req, res) {

    var apDeviceCountMap = new Map();
    let apclients = req.body.data;
    apclients.forEach(apclientDetails => { 
        apDeviceCountMap.set(apclientDetails.apMacAddr,apclientDetails.numberOfClients);
    });
    var scanningApClients= JSON.stringify(_generateClients(apDeviceCountMap));
    console.log(scanningApClients);
    res.status(200).send(scanningApClients);
});
var client_macs = [], ip_count = 0;
var device_list;
function _generateClients(apDeviceCountMap) {

    device_list = [
        { "os": "Android", "manufacturer": "Samsung" },
        { "os": "iOS", "manufacturer": "Apple" },
        { "os": "macOS", "manufacturer": "Apple" },
        { "os": "Windows", "manufacturer": "Lenovo" },
        { "os": "Linux", "manufacturer": "Nest" },
        { "os": "Linux", "manufacturer": "Amazon" },
    ];

    var iterator = apDeviceCountMap[Symbol.iterator]();
    var data = [];
    var finalJSON = {};
    for (let item of iterator) {
        var num_clients = item[1];
        var num_aps = item[0];
        generate_client_macs(num_clients);
        var tempData = {};
        tempData["apFloors"] = [];
        tempData["apMac"] = item[0];
        tempData["apTags"] = [];
        tempData["observations"] = client_macs;
        data.push(tempData);
        client_macs = [];
    }
    finalJSON["data"] = data;
    return finalJSON;

}

function generate_client_macs(num_clients) {

    for (client = 1; client <= num_clients; client++) {
        var client_mac = "";
        for (mac_part = 0; mac_part < 6; mac_part++) {
            var alphabet = "0123456789abcdef";
            var emptyString = "";
            while (emptyString.length < 2) {
                emptyString += alphabet[Math.floor(Math.random() * alphabet.length)];
            }
            client_mac += emptyString;
            if (mac_part < 5) {
                client_mac += ":"
            } else {
                var associated = getRandomInt(0, 1);
                var ipv4 = "None";
                var ssid = "None";
                if (associated === 1) {
                    ipv4 = "192.168.0." + (ip_count++);
                    if(ip_count > 254){
                        ipv4 = "192.168.1." + (ip_count-254);
                    }
                    ssid = "SimulatorWifi";
                }
                var latAndLong = generateRandomPoint({ 'lat': 24.23, 'lng': 23.12 }, 1000);
                var deviceDetails = device_list[getRandomInt(0, device_list.length - 1)];
                client_macs.push({
                    "client_mac": client_mac,
                    "ipv4": ipv4,
                    "ipv6": "None",
                    "location": {
                        "lat": latAndLong.lat,
                        "lng": latAndLong.lng,
                        "unc": getRandomUNC(0, 10),
                        "x": [],
                        "y": [],
                    },
                    "manufacturer": deviceDetails.manufacturer,
                    "os": deviceDetails.os,
                    "rssi": getRandomInt(25, 120),
                    "seenEpoch": (new Date).getTime(),
                    "seenTime": new Date(),
                    "ssid": ssid
                });
            }
        }
    }
}

function generateRandomPoint(center, radius) {
    var x0 = center.lng;
    var y0 = center.lat;
    // Convert Radius from meters to degrees.
    var rd = radius / 111300;

    var u = Math.random();
    var v = Math.random();

    var w = rd * Math.sqrt(u);
    var t = 2 * Math.PI * v;
    var x = w * Math.cos(t);
    var y = w * Math.sin(t);

    var xp = x / Math.cos(y0);

    // Resulting point.
    return { 'lat': y + y0, 'lng': xp + x0 };
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomUNC(min, max) {
    return Math.random() * (max - min) + min;
}

module.exports = router;


// function start() {
//     var apDeviceCountMap = new Map();
//     apDeviceCountMap.set("mac1", 10);
//     apDeviceCountMap.set("mac2", 6);
//     apDeviceCountMap.set("mac3", 8);
//     apDeviceCountMap.set("mac4", 4);
//     console.log(JSON.stringify(generateClients(apDeviceCountMap)));
// }

// start();