const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use(
  jsonServer.rewriter({
    '/api/todos/*': '/todos/$1',
    '/api/todos': '/todos'
  })
);

// FETCH_TODOS
server.get('/todos', (req, res) => {
  res.send(db.get('todos').value());
});

// CLEAR_COMPLETED_TODOS
server.delete('/todos', (req, res) => {
  db.get('todos').remove({ completed: true }).write();
  res.send(db.get('todos').value());
});

// ADD_TODO
server.post('/todos', (req, res) => {
  const prevTodos = db.get('todos').value();
  const newTodos = [...prevTodos, req.body];
  db.set('todos', newTodos).write();
  res.send(db.get('todos').value());
});

// TOGGLE_COMPLETED_ALL_TODO
server.patch('/todos', (req, res) => {
  const changeStatus = req.body.completed;
  const prevTodos = db.get('todos').value();
  const newTodos = prevTodos.map(todo => ({
    ...todo,
    completed: changeStatus
  }));
  db.set('todos', newTodos).write();
  res.send(newTodos);
});

server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running');
});
