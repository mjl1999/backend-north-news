
const endpointsOverview = require("../endpoints.json")
const {retrieveTopics, retrieveArticle} = require("../models/api.models")
exports.getApi = (req, res, next) => {
    try {
        res.status(200).send({endpoints: endpointsOverview})
    }
    catch (err) {
        console.log(err, "err is here")
        next(err)
    }
   
}


exports.getApiTopics = async (req, res, next) => {
    try {
        const topics = await retrieveTopics()
        res.status(200).send({allTopics: topics})
    }
    catch (err) {
        console.log(err)
        next(err)
    }
   
}


exports.getArticle = async (req, res, next) => {
    try {
        
        const {article_id} = req.params
        const article = await retrieveArticle(article_id)
        res.status(200).send({chosenArticle: article})
    }
    catch (err) {
        console.log(err)
        next(err)
    }
   
}