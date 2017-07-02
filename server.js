var express = require ('express');
var bodyParser =require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;


app.use(bodyParser.json());

var todos = [];
var nextId = 1;

//GET : Root
app.get('/',function(req,res){
	res.send('Welcome to TODO API !');
});

//GET : all todos
app.get('/todos',function(req,res){
	res.json(todos);
});

//GET: todo based on id
app.get('/todos/:id', function (req,res) {
	var todoId = parseInt(req.params.id, 10);
	var todoItem = _.findWhere(todos, {id: todoId});
															/*todos.forEach( function (todo){
																if(todo.id == todoId){
																	todoItem = todo;
																	console.log('Requested id and item are:', todoId + ' item: ', todoItem);
																}
															});*/
	if(todoItem){
		console.log("found");
		res.json(todoItem);
	}
	else{
		console.log("Not found");
		res.sendStatus(404);
	}
});

//POST: create a todo 
app.post('/todos', function (req,res) {
	var body = _.pick(req.body, 'description', 'completed');
	body.id = nextId;
	nextId++;
		if((!_.isBoolean(body.completed)) || !_.isString(body.description) || 
				body.description.trim().length === 0){
			return res.sendStatus(400);
		}
	body.description = body.description.trim();
	todos.push(body);
		
	res.json(body);

});



app.listen(PORT, function(){
	console.log('Express server is running on port :',PORT );
});

