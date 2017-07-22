var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;


app.use(bodyParser.json());

var todos = [];
var nextId = 1;

//GET : Root
app.get('/', function(req, res) {
	res.send('Welcome to TODO API !');
});

//GET : all todos
app.get('/todos', function(req, res) {
	var queryParams = req.query;
	var where = {};

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		where.completed = true;
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		where.completed = false;
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		where.description = {
			$like: '%' + queryParams.q + '%'
		};
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.status(200).json(todos);
	}, function(e) {
		res.status(400).json(e);
	});


});

//GET: todo based on id
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			res.status(200).json(todo.toJSON());
		} else {
			res.status(404).json('Not Found');
		}
	}, function(e) {
		res.sendStatus(500);
	});

});

//POST: create a todo 
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo) {
		res.status(200).json(todo.toJSON());
	}, function(e) {
		res.status(400).json(e);
	});

});

//DELETE: /todos/:id
app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			todo.destroy();
			res.status(204).json('Deleted Successfuly');
		} else {
			res.status(404).json('Not Found');
		}
	});


});

//PUT : /todos/:id
app.put('/todos/:id', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	var todoId = parseInt(req.params.id, 10);
	var attributes = {};


	if (body.hasOwnProperty('completed') ) {
		attributes.completed = body.completed;
		} 

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	} 
	
	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send('Not found');
		}
	});

});


db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express server is running on port :', PORT);
	});
});