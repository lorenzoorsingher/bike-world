const app = require('./app/app.js');
const mongoose = require('mongoose');

/**
 * https://devcenter.heroku.com/articles/preparing-a-codebase-for-heroku-deployment#4-listen-on-the-correct-port
 */
const port = process.env.PORT || 8080;


/**
 * Configure mongoose
 */
// mongoose.Promise = global.Promise;
//app.locals.db = mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
app.locals.db = mongoose.connect('mongodb+srv://admin:admin@bikeworlddb.vdued.mongodb.net/BikeWorldDB?retryWrites=true&w=majority')
.then ( () => {
    
    console.log("Connected to Database");
    
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
    
});