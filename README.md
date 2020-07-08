# Task Manager MEAN Stack Web App
A Full stack web development practice with MongoDB, Express.js, Angular.js, Node.js
A task manager app the builds to do lists with basic crud implementation

## Live Demo
Live Demo will be launched to Heroku around midnight tonight, July 6th, 2020. 
//The Quarintine Projects
//Single Day Full-Stack App Challenge
//Disclaimer* following DevStackR and making my on twists to it from his project guide (He's teaching mean stack on youtube)

## Project Purpose
The motives behind this are as follow:
 - I've learned how to use all these technologies in the mean stack seperately, in seperate projects. Now I want to put it all together and see how it connects. 
 - Able to have my own simple to do list app to use, to gain inspiration from and continue  devloping new things
 - Establish best practices, good mvc architecture and extera seperations of concerns
 - Have super clean code to show recruiters/interviewers in the future

## Tools Used
As of July 7th, 2020, the technologies, softwares, and applications used to facilitate this project are as follows:
 - Github (version control)
 - Visual Studio Code (code editor)
 - Mongodb (database for models)
 - Express.js (backend routing, api builds)
 - Angular (front-end)
 - Node.js (backend framework)
 - Nutribullet (awesome smoothie maker ^o^)

------
------
------
------
------
------
## DevNotes
*I'm working on a Mac*
But to get started: 
1. I'm using 
- MongoDB shell version v4.2.8
- Express v
- Angular 10.0.1
2. Firstly made some space on my workbench with a new directory
```
cd /Documents/Workbench/<repoName>
```
3. Then used
```
ng new frontend --style=scss --routing=true
```
4. I would show you the code skeleton  it gives but... 4801 directories, 35266 files. Big Yikes, in short, directory structure looks like this:
```
.
├── api
└── frontend
    ├── e2e
    ├── node_modules
    └── src
        ├── app
        ├── assets
        └── environments
```
5. For front end styling we're using the bulma.io css framework
```
npm install bulma --save
``` 
6. Imported bulma source files in src/styles.scss, and also created main-styles.scss for global styles

7. For angular components I will be making the following:
 - task-view
 - new-list
 - edit-list
 - new-task
 - edit-task
 - signup-page
 - login-page
 using the angular cli to generate my components, ie:
 ```
ng generate component pages/TaskView
ng generate component <yourChoiceOfDirStructure>/<ComponentName>
 ```
8. All my routes are defined in app-routing-module.ts, ie:
```
const routes: Routes = [
  { path: '', redirectTo: '/lists', pathMatch: 'full' },
  { path: 'new-list', component: NewListComponent },
  { path: 'edit-list/:listId', component: EditListComponent },
  { etc... }
];
```
and make sure to import those components in that file as well

9. Now for notes on a bit of our backend, we have an api folder that we'll hold code that leverages express.js to make our api endpoints and also communicates with mongodb. Here's a look at our directory structure:
```
.
├── app.js
├── db
    └── mongoose.js
```
10. In MongoDB, make sure to have an account, create the m0 sandbox cluster build, create a database user with the correct permissions, and your good for mongoose to connect to mongodb atlas
11. Don't leak sensitive info, use enviornment vars, im using dotenv to do so with
```
npm install dotenv --save-dev
```
12. Make sure to add your .env file to your .gitignore lol
13. When you're coding you're api endpoints , make sure you install the proper middleware to handle the http reqs, ie: body parser
```
npm install body-parser --save
```

