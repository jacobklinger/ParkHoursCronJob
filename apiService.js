const axios = require('axios');

const apiService = {};

const endpoint = "ec2-54-162-5-35.compute-1.amazonaws.com:8080/parkHours";

apiService.head  = async function (date, parkHours) {
    axios.head(endpoint + '/' + date)
        .then(function (response) {
            return response;
        })
        .catch(function (error) {
            console.log(error);
        });
}

apiService.put  = async function (date, parkHours) {
}

apiService.patch  = async function (date, parkHours) {
}



module.exports = apiService;