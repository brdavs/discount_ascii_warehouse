About the solution
==================

This is a quick solution to the task with minimal codebase (<200 lines with comments), minimal dependencies and, fast, slick UX. The focus of development was speed, size and maintainability of code with minimal external dependencies.

Running the project
-------------------
1. Set up node.js environment. https://github.com/creationix/nvm can solve this for you.
2. Clone the repo (```git clone https://github.com/brdavs/discount_ascii_warehouse.git```), or download the repo's zip.
3. Enter the directory you have created.
4. Run ```npm install``` to install the libraries, needed to run serverside code to node_modules directory.
5. Run ```node index.js```.
6. Point your browser to http://localhost:8001 (you can change the port setting in install.js).

Notes
-----
- I used a parametric approach to solve the task. Many aspects of rendering and loading are configurable, so one can experiment with load time and improved UX.
- Some of the solutions are sub - optimal, because i decided to completely disregard the serverside code. That way a potentially unreasonable amout of ad server load (and data transfer) may occur to satisfy the project guidelies. That being said... Solving server side mistakes client side is a mistake and a disaster waiting to happen.
- I avoided using any extra libraries, except Angular. The exception is pure.io used for grid layout.
- The project being so tiny, I intentionally left it in one js file. Larger projects can be split in files and directories, but the exact schema depends on the type of project. Many solutions are available on github.
- I would not put this in production environment, because of recursive iteration through a random selection of ads. This is a bad principle server side.
- I used external CDN for angular and pure.io, which I would avoid in a production environment. I'd rather use bower to download dependancies and grunt to copy minified files into static directory.
- The ~ end of catalogue ~ will not occur, because product IDs just increase perpetually. I am not checking product/price/size to eliminate duplicates. I assume every ID has it's own product, even if it's a duplicate.
