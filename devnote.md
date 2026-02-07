# Repo Structure:

- the `backend` folder stores the python code for the backend. while the `frontend` folder stores the code for the frontend. (!) Although these two folders are in the same repo, its actually hosted by two different machines: backend hosted via vercel, as frontend hosted via gh pages. So the only way they communicate is via HTTP requests.

- the /tools/ path for the frontend is where the tools pages lies. and other pages shall be in /pages/ path.

- Any API endpoints must be recorded in backend/API.md

- Any new components in the frontend shall consider the "admin manage mode", ie providing an edit button like the other components.

- Due to stress storage, any data stored via vercel vercel edge config shall be minimun. Especially the "key"s, because they are not visible to normal users (eg, key "username" -> "n"). However, anywhere that uses a short key, there shall be a comment explaining the full meaning of the short key to keep the code readable.

