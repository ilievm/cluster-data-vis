## Getting Started

First, run the development server:

```bash
npm run dev
```

in both "server" and "web-client" folders. 
It should launch web-client at port `:3000` and server at port `:3333`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the user page.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Info and Notes

The server is used to generate some random data points, to then be fetched and displayed on the front-end, represeinting the data for the graph
The app.tsx file on the front-end is a monolith. mostly due to time constraints,a nd because it's easy to see and work with it at the moment 

For the timeline change (in the top right corner in the UI) to work properly there needs to be enough data for the selected scale, which is not likely to happen unless the server is left for like a week. 

The server also won't start generating data untill the first request hits it. After that data on the FE is persistent unless the server is restarted

The form is just being sent to BE and sends back 200 for now.

Many types for type script were alsi not declared and are "any" since it wasn't a priority ATM.

If any questions, feel free to email me at any point