const mongoose = require('mongoose');

const planetSchema= new mongoose.Schema({
    keplerName:{
        type:String,
        requied:true,
    }
})

module.exports = mongoose.model('Planet',planetSchema)