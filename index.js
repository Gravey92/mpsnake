/*var http = require('http')
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type' : 'text/plain'});
    res.end('Hello World\n');
}).listen(1337, '127.0.0.1');
console.log('Server running at http:://127.0.0.1:1337/');
*/

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var x = 0;
var user_states = {};
var block_size = 10;
var cwidth = 450;
var cheight = 450;
var count = 3;
var food;

app.get('/', function(req, res){
	res.sendFile('/Users/Gravey/Projects/2PSnake/index.html');
});

io.on('connection', function(socket){
	console.log('a user connected');
	var user = x;
	user_states[x] = {
		snake : create_snake(x),
		direction : (x == 0 ? "down" : "up")
	}

	socket.emit('player', user);

	x++;

	// socket.broadcast.emit('hi') send to all but newest
	socket.on('update direction', (function(dir){
   		user_states[user]["direction"] = dir;
  	}).bind(this));

	socket.on('disconnect', function(){
    	//console.log('user disconnected');
  	});

  	if(user == 1)
  	{
  		start_game();
  	}
})

http.listen(3000, function(){
	console.log('listening on port 3000');
})

function create_snake(player)
{
	var length = 5; //Length of the snake
	snake_array = []; //Empty array to start with
	if(player == 1)
	{
		for(var i = 20 ; i < 20 + length; i++)
		{
			//This will create a vertical snake on the left side
			snake_array.push({x: 10, y: i});
		}
	} else {
		for(var i = 25; i > 25 - length; i--)
		{
			//This will create a vertical snake on the right side
			snake_array.push({x: 30, y:i});
		}
	}

	return snake_array
}

function create_food()
{
	food = {
		x: Math.round(Math.random()*(cwidth-block_size)/block_size), 
		y: Math.round(Math.random()*(cheight-block_size)/block_size)
	};
}

function check_collision(x, y, array)
{
	for(var i = 0; i < array.length; i++)
	{
		if(array[i].x == x && array[i].y == y)
		 return true;
	}
	return false;
}

function update()
{
	console.log("update");
	//console.log(user_states);
	for(var i = 0; i < 2; i++)
	{
		var state = user_states[i];
		var snake = state["snake"];
		var dir = state["direction"]

		//Pop out the tail cell and place it infront of the head cell
		var nx = snake[0].x;
		var ny = snake[0].y;

		if(dir== "right") nx++;
		else if(dir == "left") nx--;
		else if(dir == "up") ny--;
		else if(dir == "down") ny++;
		
		if(nx == -1 || nx == cwidth/block_size || ny == -1 || ny == cheight/block_size || 
		   check_collision(nx, ny, snake) || check_collision(nx, ny, user_states[(i + 1)%2]["snake"]))
		{
			//Handle Restart
			end_game();
			return;
		}
		
		//If the new head position matches with that of the food,
		//Create a new head instead of moving the tail
		if(nx == food.x && ny == food.y)
		{
			var tail = {x: nx, y: ny};
			//score++;
			//Create new food
			create_food();
		}
		else
		{
			var tail = snake.pop(); //pops out the last cell
			tail.x = nx; tail.y = ny;
		}
		
		snake.unshift(tail); //puts back the tail as the first cell
	}
	io.emit('update tick', {user_states: user_states, food : food});
}

function start_game()
{
	if(typeof game_loop != "undefined") clearInterval(game_loop);
	//create_food();
	count = 3;
	game_loop = setInterval(do_countdown, 1000); //update.bind(this), 100);
	console.log("game started");
}

function do_countdown()
{
	var text = count;
	if(count == 0){
		text = "Start";
	} else if(count < 0){
		if(typeof game_loop != "undefined") clearInterval(game_loop);
		create_food();
		game_loop = setInterval(update.bind(this), 100);
		return;
	}

	count--;
	io.emit('update middle', text);

}

function end_game(player)
{
	console.log("end game");
	if(typeof game_loop != "undefined") clearInterval(game_loop);
}
