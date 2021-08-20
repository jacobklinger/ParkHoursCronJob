const request = require('request');
const jsdom = require("jsdom");
const apiService = require('./apiService');
const { JSDOM } = jsdom;

const parkHoursDataService = {};

const wdwOptions = {
    "url": "https://disneyworld.disney.go.com/calendars/five-day/",
    "parks": {
        "magicKingdom": "magic-kingdom",
        "epcot": "epcot",
        "hollywoodStudios": "hollywood-studios",
        "animalKingdom": "animal-kingdom"
    }
};

const dlrOptions = {
    "url": "https://disneyland.disney.go.com/calendars/five-day/",
    "parks": {
        "disneyland": "disneyland",
        "disneyCaliforniaAdventure": "disney-california-adventure"
    }
};

async function makeRequest(requestUrl, date) {
    const options = {
        url: requestUrl + date,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36',
            'Accept': '*/*',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'https://disneyworld.disney.go.com/calendars/day/2018-03-12/'
        }
    };
    return new Promise(function (resolve, reject) {
        request(options, function (error, res, html) {
            resolve(html);
        });
    });
}

parkHoursDataService.updateDays = async function () {
    await updateDaysHelper(wdwOptions);
    await updateDaysHelper(dlrOptions);
}

async function updateDaysHelper(options) {
    // Start with today
    var date = new Date();
    date = new Date(date.toLocaleString('sv', { timeZone: 'America/New_York' }).substring(0, 10));

    var noHours = false;
    while (!noHours) {
        var html = await makeRequest(options.url, date.toISOString().substring(0, 10));
        const dom = new JSDOM(html);
        for (let i = 0; i < 5; i++) {
            noHours = true;
            var offsetDate = new Date(date);
            offsetDate.setDate(offsetDate.getDate() + i);

            var splitDates = offsetDate.toISOString().substring(0, 10).split('-');
            var month = splitDates[1];
            var day = splitDates[2];

            var parkHours = {};
            parkHours.parks = {};

            for (parkProp in options.parks) {
                var parkValue = options.parks[parkProp];
                var selector = "td[headers*='" + getDate(month, day) + " " + parkValue + "']";

                var dailyParkBlock = dom.window.document.querySelector(selector);

                // If we didn't find the dailyParkBlock for this date, then we are done
                if (dailyParkBlock != null) {
                    noHours = false;
                    // Park hours
                    var parkHoursBlock = dailyParkBlock.querySelector("div.parkHours");
                    var parkHoursBlockHours = parkHoursBlock.querySelector("p:nth-child(2)");
                    var parkHoursString = parkHoursBlockHours.textContent;
                    var parkHoursClass = parkHoursBlockHours.className;
                    var splitHours = parkHoursString.split(' to ');

                    thisPark = {};
                    if (parkHoursClass !== "parkHoursClosure") {
                        if (splitHours[1] != null) {
                            thisPark.hours = {};
                            thisPark.hours.start = splitHours[0];
                            thisPark.hours.end = splitHours[1];
                            // Park hopper magic hours

                            var parkHoursParkBlock = dailyParkBlock.querySelector("div.parkHopperHours");

                            //if (parkHopperHoursString != null) {
                            var parkHopperHoursString = parkHoursParkBlock.querySelector("p:nth-child(2)").textContent;
                            splitHours = parkHopperHoursString.split(' to ');

                            if (splitHours[1] != null) {
                                thisPark.parkHopperHours = {};
                                thisPark.parkHopperHours.start = splitHours[0];
                                thisPark.parkHopperHours.end = splitHours[1];
                            }
                            //}
                            thisPark.parades = [];
                            var parades = dailyParkBlock.querySelectorAll("div.parades div.eventDetailsWrapper div.eventDetail div.textColumn");
                            for (let j = 0; j < parades.length; j++) {
                                var paradeLink = parades[j].querySelector("a");
                                if (paradeLink != null) {
                                    var paradeName = paradeLink.textContent;
                                    var paradeTime = parades[j].querySelector("p.operatingHoursContainer").textContent;
                                    var time = {};
                                    if (paradeTime.indexOf(' to ') > -1) {
                                        paradeTimeSplit = paradeTime.split(' to ');
                                        time.start = paradeTimeSplit[0];
                                        time.end = paradeTimeSplit[1];
                                    }
                                    else {
                                        time.start = paradeTime;
                                    }
                                    var parade = { "name": paradeName, "start": time.start };
                                    thisPark.parades.push(parade);
                                }
                            }

                            thisPark.fireworks = [];
                            var fireworks = dailyParkBlock.querySelectorAll("div.fireworksandNighttimeEntertainment div.eventDetailsWrapper div.eventDetail div.textColumn");
                            if (fireworks.length == 0)
                            {
                                fireworks = dailyParkBlock.querySelectorAll("div.nighttime-spectacular-firework div.eventDetailsWrapper div.eventDetail div.textColumn");
                            }
                            for (let j = 0; j < fireworks.length; j++) {
                                var fireworkLink = fireworks[j].querySelector("a");

                                if (fireworkLink == null) {
                                    fireworkLink = fireworks[j].querySelector("p");
                                }

                                if (fireworkLink != null) {
                                    var fireworkName = fireworkLink.textContent;

                                    if (fireworkName !== '-' && fireworkName !='—') {
                                        var fireworkTime = fireworks[j].querySelector("p.operatingHoursContainer").textContent;
                                        var time = {};
                                        if (fireworkTime.indexOf(' to ') > -1) {
                                            fireworkTimeSplit = fireworkTime.split(' to ');
                                            time.start = fireworkTimeSplit[0];
                                            time.end = fireworkTimeSplit[1];
                                        }
                                        else {
                                            time.start = fireworkTime;
                                        }
                                        var firework = { "name": fireworkName, "start": time.start };
                                        thisPark.fireworks.push(firework);
                                    }
                                }
                            }
                        }
                        thisPark.events = [];
                        var events = dailyParkBlock.querySelectorAll("div.events div.eventDetailsWrapper div.eventDetail div.textColumn");
                        for (let j = 0; j < events.length; j++) {
                            var eventLink = events[j].querySelector("a");
                            if (eventLink != null) {
                                var eventName = eventLink.textContent;
                                var eventTime = events[j].querySelector("p.operatingHoursContainer").textContent;
                                var time = {};
                                if (eventTime.indexOf(' to ') > -1) {
                                    eventTimeSplit = eventTime.split(' to ');
                                    time.start = eventTimeSplit[0];
                                    time.end = eventTimeSplit[1];
                                }
                                else {
                                    time.start = eventTime;
                                    time.end = null;
                                }
                                var event = { "name": eventName, "start": time.start, "end": time.end };
                                thisPark.events.push(event);
                            }
                        }
                    }
                    parkHours.parks[parkProp] = thisPark;
                }
            }
            console.log(offsetDate.toISOString().substring(0, 10) + ", " + JSON.stringify(parkHours));
            await apiService.add(offsetDate.toISOString().substring(0, 10), parkHours);
            noHours = true;
        }
        date.setDate(date.getDate() + 5);
    }
}

function getDate(month, day) {
    switch (month) {
        case '01':
            m = 'january';
            break;
        case '02':
            m = 'february';
            break;
        case '03':
            m = 'march';
            break;
        case '04':
            m = 'april';
            break;
        case '05':
            m = 'may';
            break;
        case '06':
            m = 'june';
            break;
        case '07':
            m = 'july';
            break;
        case '08':
            m = 'august';
            break;
        case '09':
            m = 'september';
            break;
        case '10':
            m = 'october';
            break;
        case '11':
            m = 'november';
            break;
        case '12':
            m = 'december';
            break;
    }
    return m + day;
}

module.exports = parkHoursDataService;