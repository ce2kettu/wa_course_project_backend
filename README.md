# Web Applications - Course project (backend)

![Screenshot 1](/documentation/image1.jpeg)
![Screenshot 2](/documentation/image2.jpeg)

Deployed demo: https://wa-course-project-frontend.herokuapp.com

## Documentation

This is basically a stripped-down version of StackOverflow with the basic features. It is done as part of the Web Applications course at LUT University.

**Backend**

The backend is implemented using Node.js with Express.js. Additionally, the project is using
MongoDB as the database system along with Mongoose library to communicate with the actual
database. For the authentication JWT authorization and Passport.js library is used. Passwords are
encrypted using bcrypt, and all the requests are validated using express-validator (e.g., password
length, required parameters).

**Frontend**

The frontend is built entirely using React and some libraries are used to make things easier.
Material UI library is used to make creating views much easier. Additionally, react-time-ago is
used to display timestamps in human readable format. Questions and answer always display a
timestamp that shows when the post was created. If the content has been edited by either the author
or an admin, there will also be a timestamp showing when it was edited.

Markdown editor (@uiw/react-md-editor) is used to post content (questions and answers). It has
rich functionality for example posting code, different text formatting, lists, images etc. For
example, if one wanted to post JSX code with syntax highlighting, they would have to write

The same system is being used on stackoverflow.

**Installation**

The project is divided into two parts: the backend and the frontend. They are under separate
GitHub repositories.

Frontend: https://github.com/ce2kettu/wa_course_project_frontend
Backend: https://github.com/ce2kettu/wa_course_project_backend

**Configuring**

The backend needs .env file for configuring environment variables or they can also be supplied
from elsewhere. There is an example file named .env.example, which contains:

JWT_SECRET=secret
PORT= 5000
MONGOURL=mongodb://localhost:27017/testdb

The frontend app needs REACT_APP_API_URL environment variable for pointing the API base
URL, or the default http://localhost:5000 is used. Do not include a trailing slash.

You also need to point to a valid MongoDB instance that is accessible. MONGOURL contains the
connection string for connecting with Mongoose.

**Running**

After both projects are cloned, install the required packages using `npm install`. Do this for both
projects. After that run `npm start` in both projects to get them running.

**Deploying**

To deploy the frontend, run `npm build` and serve the static contents under build folder on your
website.

The backend can be started by `npm start`.
