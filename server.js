var express = require ('express');
var app = express();
var PORT = process.env.PORT || 3000;

var todos = [{
	id: 1,
	description: 'Go for Grocery',
	completed: false
},{
	id: 2,
	description: 'call to akka',
	completed: false

},{
	id: 3,
	description: 'Envoy code completion',
	completed: true
}];

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
	var todoItem;
		todos.forEach( function (todo){
			if(todo.id == todoId){
				todoItem = todo;
				console.log('Requested id and item are:', todoId + ' item: ', todoItem);
			}
		});
	if(todoItem){
		console.log("found");
		res.json(todoItem);
	}
	else{
		console.log("Not found");
		res.sendStatus(404);
	}
});



app.listen(PORT, function(){
	console.log('Express server is running on port :',PORT );
});

