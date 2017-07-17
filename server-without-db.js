var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');


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
	var filteredItems = todos;

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		filteredItems = _.where(todos, {
			completed: true
		});
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredItems = _.where(todos, {
			completed: false
		});
	}
	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		filteredItems = _.filter(filteredItems, function(todoItem) {
			return todoItem.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
		});
	}

	res.json(filteredItems);
});

//GET: todo based on id
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	var todoItem = _.findWhere(todos, {
		id: todoId
	});
				/* ---todos.forEach( function (todo){
					if(todo.id == todoId){
					todoItem = todo;
					console.log('Requested id and item are:', todoId + ' item: ', todoItem);
					}
				});----*/
	if (todoItem) {
		console.log("found");
		res.json(todoItem);
	} else {
		console.log("Not found");
		res.sendStatus(404);
	}
});

//POST: create a todo 
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	body.id = nextId;
	nextId++;
	if ((!_.isBoolean(body.completed)) || !_.isString(body.description) ||
		body.description.trim().length === 0) {
		return res.sendStatus(400);
	}
	body.description = body.description.trim();

	todos.push(body);

	res.json(body);

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

app.listen(PORT, function() {
		console.log('Express server is running on port :', PORT);
	});

