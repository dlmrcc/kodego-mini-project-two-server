// here we get codes from 3rd party plugins/library
let PORT = 3030;
const express = require('express') // server code or to run our own server on localhost specified by port
const cors = require('cors') // this allows us to access our server on a different domain
const bodyParser = require("body-parser"); // this allows us to ready request data JSON object
const app = express() // initialize express server into a variable
const fs = require('fs') // use file system of windows or other OS to access local files
const request = require('request');
const requestAPI = request;
const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('kodego-mini-project-two', 'root', '', {
//     host: 'localhost',
//     dialect: 'mysql'
// });
const sequelize = new Sequelize('caca', 'wd32p', '7YWFvP8kFyHhG3eF', {

    host: '20.211.37.87',
    dialect: 'mysql'
});


const User = sequelize.define('users', {
    email: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    lastname: {
        type: Sequelize.STRING
    },
    firstname: {
        type: Sequelize.STRING
    }
}, {
    tableName: 'users',
    timestamps: false,
});

const FaveRecipe = sequelize.define('favoraterecipe', {
    userEmail: {
        type: Sequelize.STRING
    },
    faveRecipe: {
        type: Sequelize.STRING
    }
},
    {
        tableName: 'favoraterecipe',
        timestamps: false,
    });



let rawData = fs.readFileSync('data.json'); // read file from given path
let parsedData = JSON.parse(rawData); // parse rawData (which is a string into a JSON object)

app.use(cors()) // initialize cors plugin on express
app.use(bodyParser.urlencoded({ // initialize body parser plugin on express
    extended: true
}));
app.use(bodyParser.json());// initialize body parser plugin on express

let defaultData = [];


app.post('/api/login', function (
    request,
    response
) {
    let retVal = { success: false };
    console.log('req: ', request.body)

    User.findOne({
        where: {
            email: request.body.email
        }
    })
        .then((result) => {
            if (result) {
                return result.dataValues;
            } else {
                retVal.success = false;
                retVal.message = 'User Does not Exist!'
            }
        })
        .then((result) => {
            if (result.password === request.body.password) {
                retVal.success = true;
                delete result.password;
                retVal.userData = result;
                return true;
            } else {
                retVal.success = false;
                retVal.message = 'Invalid Password!'
                throw new Error('invalid password')
            }
        })
        .finally(() => {
            response.send(retVal)
        })
        .catch((error) => {
            console.log('error: ', error)
            // response.send(retVal)
        })
})

//signup for new users
app.post('/api/signup', function (request, response) {

    let retVal = { success: false };
    console.log('req: ', request.body)
    User.findOne({
        where: {
            email: request.body.email
        }
    })
        .then((result) => {
            if (result) {
                retVal.success = false;
                retVal.message = 'email address is already exist.'
                response.send(retVal);
            } else {
                User.create({
                    email: request.body.email,
                    password: request.body.password,
                    lastname: request.body.lastname,
                    firstname: request.body.firstname
                })
                    .then((result) => {
                        return result.dataValues;
                    })
                    .then((result) => {
                        retVal.success = true;
                        delete result.password;
                        retVal.userData = null;
                        // retVal.userData = result; // for auto login after registration
                    })
                    .finally(() => {
                        response.send(retVal)
                    })
                    .catch((error) => {
                        console.log('error: ', error)
                    })
            }
        })
})

//get the result of recipe API

app.get('/api/recipe/:query', function (request, response) {
    console.log('request recipe params: ', request.params);
    const query = request.params.query; // get the "query" parameter from the request
    var options = {
        'method': 'GET',
        // 'url': `https://api.edamam.com/search?r=${encodeURIComponent(query)}&app_id=d007afe7&app_key=5701b572564cca4a0fc6f4d93f3e54a7`,
        'url': `https://api.edamam.com/search?q=${query}&app_id=d007afe7&app_key=5701b572564cca4a0fc6f4d93f3e54a7`,
        'headers': {}
    };
    requestAPI(options, function (error, response_) {
        if (error) throw new Error(error);
        response.send(JSON.parse(response_.body));

    });
});

//save the fave recipe in the database
app.post('/api/faverecipe', function (request, response) {

    let retVal = { success: false };
    console.log('req: ', request.body)
    FaveRecipe.create({
        userEmail: request.body.email,
        faveRecipe: request.body.faveRecipe
    })
        .then((result) => {
            return result.dataValues;
        })
        .then((result) => {
            retVal.success = true;
            retVal.faveRecipe = null;
        })
        .finally(() => {
            response.send(retVal)
        })
        .catch((error) => {
            console.log('error: ', error)
        })
})

//retrieve the fave recipe in the database
app.post('/api/retrieve/faverecipe', function (request, response) {
    let retVals = { success: false };
    console.log('req: ', request.body)

    FaveRecipe.findAll({
        attributes: ['faveRecipe'],
        where: {
            userEmail: request.body.email
        }
    })
        .then((results) => {
            if (results.length > 0) {
                retVals.success = true;
                retVals.faveRecipeData = results.map(results => {
                    // Exclude the "id" and "userEmail" fields from the response
                    return {
                        faveRecipe: results.faveRecipe
                    };
                });
                console.log(retvals.faveRecipeData)
            }
            else {
                retVals.success = false;
            }
            response.send(retVals);
        })
        .catch((error) => {
            console.log('error: ', error);
            response.send(retVals);
        });
});

app.delete('/api/delete/faverecipe', function (request, response) {
    let retVals = { success: false };
    console.log('req: ', request.body);

    FaveRecipe.destroy({
        where: {
            userEmail: request.body.email,
            faveRecipe: request.body.faveRecipe
        }
    })
        .then((result) => {
            if (result) {
                retVals.success = true;
            }
            response.send(retVals);
        })
        .catch((error) => {
            console.log('error: ', error);
            response.send(retVals);
        });
});



app.put('/api/update/userpassword', function (request, response) {
    let retVals = { success: false };
    console.log('req: ', request.body);

    User.update({
        password: request.body.password
    }, {
        where: {
            email: request.body.email
        }
    })
        .then((result) => {
            // The number of rows updated is returned in the first element of the array
            const numRowsUpdated = result[0];
            if (numRowsUpdated > 0) {
                retVals.success = true;
                retVals.message = 'Password updated successfully';
            } else {
                retVals.message = 'User not found';
            }
            response.json(retVals);
        })
        .catch((error) => {
            console.error(error);
            response.status(500).send('Server error');
        });
});


const runApp = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully. PORT:', PORT);
        app.listen(PORT) // run app with this given port
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
runApp()

