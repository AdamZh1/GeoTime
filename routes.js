let path = require("path");
let express = require("express");

//Look at below web page for info on express.Router()
//https://scotch.io/tutorials/learn-to-use-the-new-router-in-expressjs-4
let router = express.Router();

//request is info sending to server from client.
//response is info sending to client from server.

const myDatabase = require('./myDatabase');
let db = new myDatabase();

const Score = require('./models/Data');

router.get("/single",function(req,res){
    res.sendFile(path.resolve(__dirname + "/public/views/index.html"));  //changed
});
router.get("/", function(req, res){
    res.sendFile(path.resolve(__dirname + "/public/views/homepage.html"));
});



var infoList = [{"lat":51.51055261808582,"lng":-0.13532114247134447,"tme":1975,"file":"image1.webp"},
{"lat":51.372627618378345,"lng":-0.47002494335174566,"tme":1964,"file":"image2.webp"},
{"lat":36.116691203724564,"lng":-115.17435885382592,"tme":2022,"file":"image3.webp"},
{"lat":60.17165706432126,"lng":24.941431915545934,"tme":1971,"file":"image4.jpg"},
{"lat":37.78683122768935,"lng":-122.45032599060268,"tme":1906,"file":"image5.webp"},
{"lat":19.305705059708917,"lng":-99.06144932488375,"tme":2021,"file":"image6.webp"},
{"lat":40.721134984989355,"lng":-73.9792996925389,"tme":1970,"file":"image7.webp"},
{"lat":55.75969134225963,"lng":37.62681722691981,"tme":1991,"file":"image8.webp"},
{"lat":50.454456539568284,"lng":30.529942642338064,"tme":2022,"file":"image9.webp"},
{"lat":40.78325380124167,"lng":-73.95888760707334,"tme":1959,"file":"image10.webp"},
{"lat":41.876894521023154,"lng":-87.62769606391898,"tme":1972,"file":"image11.webp"},
{"lat":33.814335791401646,"lng":-117.91813502142233,"tme":1959,"file":"image12.webp"},
{"lat":36.141427289898054,"lng":-5.353515417510856,"tme":1980,"file":"image13.webp"},
{"lat":51.49981970102623,"lng":-0.12605691901431634,"tme":1982,"file":"image14.webp"},
{"lat":43.459440463151346,"lng":39.9100003085752,"tme":1972,"file":"image15.webp"},
{"lat":43.740675626717156,"lng":7.430432061770503,"tme":1987,"file":"image16.webp"},
{"lat":-37.81371580092351,"lng":144.9654581930489,"tme":1956,"file":"image17.webp"},
{"lat":37.018828887963316,"lng":-7.934262868814628,"tme":1961,"file":"image18.webp"},
{"lat":14.670151401572523,"lng":-17.39915144668574,"tme":2018,"file":"image19.webp"},
{"lat":43.46699230994544,"lng":11.883160700567467,"tme":2022,"file":"image20.webp"},
{"lat":51.50150254071996,"lng":-0.16060799369177697,"tme":1974,"file":"image21.webp"},
{"lat":51.44222953184201,"lng":-2.5818220059048453,"tme":2013,"file":"image22.webp"},
{"lat":54.61112343675746,"lng":-5.9478409556692435,"tme":1987,"file":"image23.webp"},
{"lat":38.896001003926344,"lng":-77.03661566780275,"tme":2010,"file":"image24.webp"},
{"lat":52.31585264967701,"lng":4.971454814866632,"tme":1958,"file":"image25.webp"},
{"lat":-33.85846911389502,"lng":151.21601919552842,"tme":1965,"file":"image26.webp"},
{"lat":41.38820373111061,"lng":2.173387347401077,"tme":2019,"file":"image27.webp"},
{"lat":22.272780043876747,"lng":114.18861950633422,"tme":2015,"file":"image28.webp"},
{"lat":49.3979232290144,"lng":-0.8944917099165449,"tme":1944,"file":"image29.webp"},
{"lat":47.05266261481203,"lng":8.308861053907577,"tme":1980,"file":"image30.webp"},
{"lat":48.84491533536642,"lng":2.3736864054858544,"tme":2006,"file":"image31.webp"},];

/* Old leaderboard - Unused
var leaderBoard = [{"name":"Unclaimed","score":0},
{"name":"Unclaimed","score":0},
{"name":"Unclaimed","score":0},
{"name":"Unclaimed","score":0},
{"name":"Unclaimed","score":0},
{"name":"Unclaimed","score":0},
{"name":"Unclaimed","score":0},
{"name":"Unclaimed","score":0},
{"name":"Unclaimed","score":0},
{"name":"Unclaimed","score":0}];

let hasInitialized = false;

router.get('/initializeserver', function(req, res){
    return(db.initializeData(res));
});
router.post('/initializeserver2', function(req, res){
    if(!hasInitialized){
        for (let x=0;x<req.body.list.length;x++){
          leaderBoard[x] = {"name":req.body.list[x].name,"score":req.body.list[x].score};
        }   
        hasInitialized = true;
    }
    res.json(null);
});

*/
router.get('/generaterounds', function(req, res){
    let returnarray = [-1,-1,-1,-1,-1]
    for(i = 0; i < returnarray.length; i++){
        let tempval = Math.floor(Math.random()*infoList.length);
        while(returnarray.includes(tempval)){
            tempval = Math.floor(Math.random()*infoList.length);
        }
        returnarray[i] = tempval;
    }
    res.json({"indexarray":returnarray});
});
router.get('/calcpoints', function(req, res){
    const distanceoff = Number(req.query.distanceoff ?? 0);
    const timeoff = Number(req.query.timeoff ?? 0);
    let pointsD = Math.floor(5000*((0.9996)**distanceoff));
    let pointsT = Math.floor(5000-250*timeoff);
    if (pointsT < 0)
      pointsT = 0;
    res.json({"pointsD":pointsD, "pointsT":pointsT});
});

router.get('/getinfo', function(req, res){
    const index = Number(req.query.index);
    reallat = infoList[index].lat;
    reallng = infoList[index].lng;
    realtime = infoList[index].tme;
    filename = infoList[index].file;
    res.json({"lat":reallat, "lng":reallng, "tme":realtime, "file":filename});
});

router.post("/uploadscore", async (req, res) => {
    try {
      const name = String(req.body.name ?? "Anonymous").slice(0, 30);
      const score = Number(req.body.score ?? 0);
      if (!Number.isFinite(score) || score < 0) {
        return res.status(400).json({ ok: false, error: "invalid score" });
      }
      await Score.create({ name, score });
      res.json({ ok: true });
    } catch (err) {
      console.error("uploadscore error:", err);
      res.status(500).json({ ok: false, error: "failed to save score" });
    }
  });

  router.get("/getleaderboard", async (req, res) => {
    try {
      const top = await Score.find({})
        .sort({ score: -1, createdAt: 1 }) // highest first; older wins ties
        .limit(10)
        .lean();
      res.json({ leaderboard: top });
    } catch (err) {
      console.error("getleaderboard error:", err);
      res.status(500).json({ error: "failed to fetch leaderboard" });
    }
  });


module.exports = router;