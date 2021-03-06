var express = require("express");
var router = express.Router();
var config = require("config");
var rn = require('random-number');
var promise = require("bluebird");
var dateFormat = require("dateformat");
var dbOptions = {
    // Initialization Options
    promiseLib: promise
};
var pgp = require("pg-promise")(dbOptions);

var connectionString = "postgres://" + config.get("environment.merakiConfig.dbUserName") + ":" +
    config.get("environment.merakiConfig.dbPassword") + "@localhost:" + config.get("environment.merakiConfig.dbPort") +
    "/" + config.get("environment.merakiConfig.dbName");
var db = pgp(connectionString);

router.get("/", function (req, res) {

    var responseObject = {};
    var dataList = [];
    var zoneList = [];


    var selectQuery = "select zone_id, zone_name from meraki.meraki_zones";
    db.any(selectQuery)
    .then(function (result) {
        console.log("db select success for date ", result);
        result.forEach(function (zoneObject) {

            console.log("zoneobject ",zoneObject)
            //Generate number of clients. 
            var gen1 = rn.generator({
                min: 0,
                max: 2,
                integer: true
            })
    
            var gen2 = rn.generator({
                min: 0,
                max: 10,
                integer: true
            })
    
            
            var gen3 = rn.generator({
                min: 1,
                max: 2,
                integer: true
            })
    
            var datetime = new Date();
            let ts = datetime.getTime();
            let formattedDateString = dateFormat(datetime, "yyyy-mm-dd");
            let yearValue = dateFormat(datetime, "yyyy");
            let monthValue = dateFormat(datetime, "m");
            let weekValue = dateFormat(datetime, "W");
            let dayValue = dateFormat(datetime, "d");
            let hourValue = dateFormat(datetime, "H");
            let minuteValue = dateFormat(datetime, "M");
    
            let dbInsertCamData = {};
            dbInsertCamData.ts = ts;
            dbInsertCamData.dateFormat_date = formattedDateString;
            dbInsertCamData.dateFormat_year = yearValue;
            dbInsertCamData.dateFormat_month = monthValue;
            dbInsertCamData.dateFormat_week = weekValue;
            dbInsertCamData.dateFormat_day = dayValue;
            dbInsertCamData.dateFormat_hour = hourValue;
            dbInsertCamData.dateFormat_minute = minuteValue;
    
            var numberOfPeopleDetected = 0;
            if (zoneObject.zone_id === 1 || zoneObject.zone_id === 12) {
                numberOfPeopleDetected = gen2();
            }
            else if (zoneObject.zone_id ===2 || zoneObject.zone_id === 3 || zoneObject.zone_id ===4 || zoneObject.zone_id === 5 || zoneObject.zone_id ===6) {
                numberOfPeopleDetected = gen3();
            }
            else if(zoneObject.zone_id === 7){
                numberOfPeopleDetected = gen1();
            }
            else if(zoneObject.zone_id === 8 || zoneObject.zone_id === 11){
                numberOfPeopleDetected = 20 + gen1();
            }
            else{
                numberOfPeopleDetected = 15+ gen1();
            }
            for (i = 0; i < numberOfPeopleDetected; i++) {
                var genOID = rn.generator({
                    min: 1000,
                    max: 9999,
                    integer: true
                })
                if(zoneObject.zone_id === 8  && i<20  ){
                    dbInsertCamData.personOID = 10001+i;
                    dbInsertCamData.zoneId = zoneObject.zone_id;
                }
                if(zoneObject.zone_id === 11 && i<20  ){
                    dbInsertCamData.personOID = 20001+i;
                    dbInsertCamData.zoneId = zoneObject.zone_id;
                }
                else if(zoneObject.zone_id === 9 && i<15){
                    dbInsertCamData.personOID = 30001+i;
                    dbInsertCamData.zoneId = zoneObject.zone_id;
                }
                else if(zoneObject.zone_id === 10 && i<15){
                    dbInsertCamData.personOID = 40001+i;
                    dbInsertCamData.zoneId = zoneObject.zone_id;
                }
                else{
                    dbInsertCamData.personOID = genOID();
                    dbInsertCamData.zoneId = zoneObject.zone_id;
                }
                 _performDBInsert(dbInsertCamData);
                dataList.push(dbInsertCamData);
                console.log('value of datalist is ',dataList);
            }
        });

    })
    .catch(function (err) {
        console.log("not able to get connection " + err);
      
    });


 

    responseObject.status = "SUCCESS";
    res.status(200).send(responseObject);
});


function _performDBInsert(dbInsertCamData) {
    return new Promise(function (fulfill, reject) {
        var insertQueryForDB = "INSERT INTO meraki.camera_detections "
            + "(person_oid,"
            + "zoneId,"
            + "datetime, "
            + "dateformat_date,"
            + "dateformat_year, "
            + "dateformat_month,"
            + "dateformat_week, "
            + "dateformat_day, "
            + "dateformat_hour, "
            + "dateformat_minute)"
            + " VALUES ("
            + dbInsertCamData.personOID + ","
            + dbInsertCamData.zoneId + ","
            + dbInsertCamData.ts + ",'"
            + dbInsertCamData.dateFormat_date + "',"
            + dbInsertCamData.dateFormat_year + ","
            + dbInsertCamData.dateFormat_month + ","
            + dbInsertCamData.dateFormat_week + ","
            + dbInsertCamData.dateFormat_day + ","
            + dbInsertCamData.dateFormat_hour + ","
            + dbInsertCamData.dateFormat_minute
            + ")";

        db.none(insertQueryForDB)
            .then(function (response) {
                console.log("db insert success for oid and zone  ", dbInsertCamData.personOID + " zone " + dbInsertCamData.zoneId);
                fulfill(response);
            })
            .catch(function (err) {
                console.log("not able to get connection " + err);
                reject(err);
            });
    });
}


router.post("/clients", function(req, res){


    var zoneId = req.body.zoneId;
    var timeRange = req.body.timeRange || "today";
   

    console.log('Value of zone id is ',zoneId);
    console.log('value of time range is ',timeRange);
    
    if(timeRange === "today"){
        let datetime = new Date();
        let formattedDateString = dateFormat(datetime, "yyyy-mm-dd");

        let selectDataQuery = "select sum(entrances)/60 as detected_clients , dateformat_hour as timeRange"
        +" from meraki.realtime_mqtt_detections "
        +" where zone_id="+zoneId
        +" and dateformat_date='"+formattedDateString
        +"' group by dateformat_hour order by dateformat_hour";
        console.log(selectDataQuery);

        db.any(selectDataQuery)
        .then(function (result) {
            console.log("db select success", result);
            res.status(200).send(result);

        })
        .catch(function (err) {
            console.log("not able to get connection " + err);
            res.status(500).send(JSON.stringify(err.message));
        });

    }
    else if (timeRange === "yesterday"){
        let datetime = new Date();
        datetime.setDate(datetime.getDate() - 1);
        let formattedDateString = dateFormat(datetime, "yyyy-mm-dd");

        let selectDataQuery = "select sum(entrances)/60 as detected_clients , dateformat_hour as timeRange"
        +" from meraki.realtime_mqtt_detections "
        +" where zone_id="+zoneId
        +" and dateformat_date='"+formattedDateString
        +"' group by dateformat_hour order by dateformat_hour";
        db.any(selectDataQuery)
        .then(function (result) {
            console.log("db select success", result);
            res.status(200).send(result);

        })
        .catch(function (err) {
            console.log("not able to get connection " + err);
            res.status(500).send(JSON.stringify(err.message));
        });

    }
    else if (timeRange === "this week"){
        let datetime = new Date();
        let weekValue = dateFormat(datetime, "W");

        let selectDataQuery = "select sum(entrances)/(60*24) as detected_clients , dateformat_date as timeRange"
        +" from meraki.realtime_mqtt_detections "
        +" where zone_id="+zoneId
        +" and dateformat_week="+weekValue
        +" group by dateformat_date order by dateformat_date";
        db.any(selectDataQuery)
        .then(function (result) {
            console.log("db select success", result);
            res.status(200).send(result);

        })
        .catch(function (err) {
            console.log("not able to get connection " + err);
            res.status(500).send(JSON.stringify(err.message));
        });

    }
    else if (timeRange === "last week"){
        let datetime = new Date();
        let weekValue = dateFormat(datetime, "W") -1;

        let selectDataQuery = "select sum(entrances)/(60*24) as detected_clients , dateformat_date as timeRange"
        +" from meraki.realtime_mqtt_detections "
        +" where zone_id="+zoneId
        +" and dateformat_week="+weekValue
        +" group by dateformat_date order by dateformat_date";
        db.any(selectDataQuery)
        .then(function (result) {
            console.log("db select success", result);
            res.status(200).send(result);

        })
        .catch(function (err) {
            console.log("not able to get connection " + err);
            res.status(500).send(JSON.stringify(err.message));
        });

    }
    else if (timeRange === "this month"){
        let datetime = new Date();
        let monthValue = dateFormat(datetime, "m");
        let selectDataQuery = "select sum(entrances) /(60*24) as detected_clients , dateformat_week as timeRange"
        +" from meraki.realtime_mqtt_detections "
        +" where zone_id="+zoneId
        +" and dateformat_month="+monthValue
        +" group by dateformat_week order by dateformat_week";
        db.any(selectDataQuery)
        .then(function (result) {
            console.log("db select success", result);
            res.status(200).send(result);

        })
        .catch(function (err) {
            console.log("not able to get connection " + err);
            res.status(500).send(JSON.stringify(err.message));
        });

    }
    else if (timeRange === "last month"){
        let datetime = new Date();
        let monthValue = dateFormat(datetime, "m") -1;
        let selectDataQuery = "select sum(entrances)/(60*24) as detected_clients , dateformat_week as timeRange"
        +" from meraki.realtime_mqtt_detections "
        +" where zone_id="+zoneId
        +" and dateformat_month="+monthValue
        +" group by dateformat_week order by dateformat_week";
        db.any(selectDataQuery)
        .then(function (result) {
            console.log("db select success", result);
            res.status(200).send(result);

        })
        .catch(function (err) {
            console.log("not able to get connection " + err);
            res.status(500).send(JSON.stringify(err.message));
        });

    }
})




router.get("/zones", function (req, res) {

    var responseObject = {};
  
    var zoneList = [];
    var selectQuery = "select zone_id as zoneId, zone_name as zoneName from meraki.realtime_zones ";
    //where zone_name not like 'Checkout%'";
    db.any(selectQuery)
    .then(function (result) {
        console.log("db select success for date ", result);
        res.status(200).send(result);

    })
    .catch(function (err) {
        console.log("not able to get connection " + err);
        res.status(500).send(JSON.stringify(err.message));
    });
});

router.get("/currentVisitorsPerZone", function (req, res) {

    var datetime = new Date();
    let formattedDateString = dateFormat(datetime, "yyyy-mm-dd");
    let hourValue = dateFormat(datetime, "H");

    var selectQuery = "SELECT (case when max(cam.entrances) > 0 then max(cam.entrances) else 0 end) as count, zones.zone_id , zones.zone_name from meraki.realtime_zones zones left join meraki.realtime_mqtt_detections cam "
    +" on cam.zone_id = zones.zone_id and  "
    +" cam.dateformat_date = '"+formattedDateString+"' and cam.dateformat_hour="+hourValue 
     +" and cam.dateformat_minute =(select dateformat_minute from meraki.realtime_mqtt_detections "
    +" order by unique_mqtt_detection_key desc LIMIT 1 ) "
    +" group by zones.zone_id, zones.zone_name";

    console.log(selectQuery);

    db.any(selectQuery)
        .then(function (result) {
            console.log("db select success for date ", result);
            res.status(200).send(result);

        })
        .catch(function (err) {
            console.log("not able to get connection " + err);
            res.status(500).send(JSON.stringify(err.message));
        });
});


module.exports = router;
