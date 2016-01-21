About the solution
==================

Running
-------

1. Clone the repo, make sure you have node.js properly setup. (https://github.com/creationix/nvm can solve this.)
2. Enter the directory 
3. Run ```npm install``` to install the libraries, needed to run serverside code to node_modules directory.
4. Run ```node index.js```
5. Point your browser to http://localhost:8001 (or change the port setting in install.js)

Notes
-----
- I used a parametric approach to solve the task. Many aspects of rendering and loading are configurable, so one can experiment with load time and improved UX.
- Some of the solutions are sub - optimal, because i decided to completely disregard the serverside code. That way a potentially unreasonable amout of ad server load (and data transfer) may occur to satisfy the project guidelies. That being said... Solving server side mistakes client side is a mistake and a disaster waiting to happen.
- I avoided using any extra libraries, except Angular. The exception is pure.io used for grid layout.
- The project being so tiny, I intentionally left it in one js file. Larger projects can be split in files and directories, but the exact schema depends on the type of project. Many solutions are available on github.
- I would not put this in production environment, because of recursive iteration through a random selection of ads. This is a bad principle server side.
- I used external CDN for angular and pure.io, which I would avoid in production environment.
