const mongoose = require("mongoose")

const connectDb = (database) => {
    mongoose.connect(database.url, database.options).then(() => {
        console.log(`Database connected`);
    }).catch((err)=> {
        console.log(`Error in database connection -> ${err.message}`);
    })
}

module.exports = connectDb