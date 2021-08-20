const axios = require('axios');

const apiService = {};

const endpoint = "http://localhost:8080/parkHours";

apiService.add  = async function (date, parkHours) {
    let apiServiceResponse;

    await axios.head(endpoint + '/' + date)
        .then(function (response) {
            apiServiceResponse = response;
        })
        .catch(function (error) {
            console.log(error);
            apiServiceResponse = error.response;
        });

        if (apiServiceResponse.status == 200)
        {
            await axios.patch(endpoint + '/' + date, parkHours)
                .catch(function (error) {
                    console.log(error);
            });
        }
        else if (apiServiceResponse.status == 404) 
        {
            await axios.put(endpoint + '/' + date, parkHours)
                .catch(function (error) {
                    console.log(error);
            });
        }
}

module.exports = apiService;