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
	var todoItem = _.findWhere(todos, {
		id: todoId
	});
	if (!todoItem) {
		res.status(400).json({
			"error": "No todo Item Found with that Id"
		});
	} else {
		todos = _.without(todos, todoItem);
		res.json(todoItem);
	}

});

//PUT : /todos/:id
app.put('/todos/:id', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	var todoId = parseInt(req.params.id, 10);
	var matchedItem = _.findWhere(todos, {
		id: todoId
	});
	var validAttributes = {};

	if (!matchedItem) {
		res.send(404).json({
			"error": "Not found with that id "
		});
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
		//	matchedItem.completed = validAttributes.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).json({
			"error": "Something wrong with completed"
		});
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) &&
		body.description.trim().length > 0) {
		validAttributes.description = body.description;
		//	matchedItem.description = validAttributes.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).json({
			"error": "Something wrong with description"
		});
	}
	_.extend(matchedItem, validAttributes);
	res.json(matchedItem);

});


db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express server is running on port :', PORT);
	});
});