const express = require('express'); // eslint-disable-line
const app = express();
const port = process.env.PORT || 8081;
const bodyParser = require('body-parser');
const cors = require('cors');
var mongoose = require('mongoose');
// tools
const { decryptApiKey } = require('./utils/tools');

// routes

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const scheduleRoutes=require('./routes/provider.routes');
const socialRoutes=require('./routes/social.routes')

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/UsersDB');

app.use(cors());
app.options('*', cors());
app.use(bodyParser.json({ extended: true, limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/v0.1/', decryptApiKey);

app.get('/v0.1/health', (req, res) => {
  res.status(200).send('Health Check');
});


app.use('/v0.1/', [
  authRoutes,
  userRoutes,
  scheduleRoutes,
  socialRoutes
]);
//app.use(app.router);
//routes.initialize(app);
app.listen(port, () => {
  console.error('TaskHuman api on port ' + port + ' :)'); // eslint-disable-line
});

module.exports = app;
