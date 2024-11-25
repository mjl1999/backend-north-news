
const endpointsOverview = require("../endpoints.json")
exports.getApi = (req, res) => {
    try {
        console.log(endpointsOverview)
        res.status(200).send({endpoints: endpointsOverview})
    }
    catch (err) {
        console.log(err)
    }
   
}