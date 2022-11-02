const http = require('http');

const app = require('./app.js')

const {loadPlanetsData} = require('./models/planets.model')

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

const startServer = async()=>{
    await loadPlanetsData();
    server.listen(PORT,()=>{
        console.log('LISTENING ON PORT :',PORT);
    });
}

startServer();
