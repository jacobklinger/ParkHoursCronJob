const parkHoursDataService = require('./parkHoursDataService');

async function handle() {
    await parkHoursDataService.updateDays();
}

exports.handler = handle;