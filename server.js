const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;



// Routes
const mtgRoutes = require('./routes/mtg');
app.use('/mtg', mtgRoutes);

app.get('/', async (req, res) => {
  console.log("The API was called");
  res.send("Hello World!");
});

// app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// app.get("/", function(req,res){
//     res.redirect("/docs")
// })

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
