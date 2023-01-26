var express = require("express");
var cors = require("cors");
var app = express();
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
const fileUpload = require("express-fileupload");
const path = require("path");
const mime = require("mime");
const fs = require("fs");
// Use cors to allow cross origin resource sharing
app.use(cors());
// Use the express-fileupload middleware
app.use(fileUpload());
var mysql = require("mysql");
var poolCluster = mysql.createPoolCluster();
poolCluster.add("node0", {
  host: "192.168.1.22",
  port: "3306",
  database: "mymariaDB",
  user: "devchon",
  password: "devchon101",
  charset: "utf8mb4",
});

app.listen(3032, function () {
  console.log("CORS-enabled web server listening on port 3032");
});

app.get("/getDisease", jsonParser, function (req, res, next) {
  poolCluster.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
    } else {
      connection.query(
        "SELECT * FROM Disease",
        [req.body.name],
        function (err, data) {
          if (err) {
            res.json({ err });
          } else {
            console.log(data.length);
            for (let i = 0; i < data.length; i++) {
              data[i].ImageUrl =
                "http://192.168.1.22:3032/image/" + data[i].ImageName;
            }
            res.json({ data });
            // connection.end();
            connection.release();
          }
        }
      );
    }
  });
});

app.put("/AddDisease", jsonParser, function (req, res) {
  let sampleFile;
  let uploadPath;
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  } else {
    poolCluster.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
      } else {
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        sampleFile = req.files;
        console.log(sampleFile);
        console.log(sampleFile.file.name);
        uploadPath = __dirname + "/image/" + sampleFile.file.name;
        console.log(uploadPath);
        // Use the mv() method to place the file somewhere on your server
        sampleFile.file.mv(uploadPath, function (err) {
          if (err) return res.status(500).send(err);
        });
        connection.query(
          "INSERT INTO `Disease` (`DiseaseName`, `InfoDisease`, `ProtectInfo`, `ImageName`, `DiseaseNameEng`) VALUES ( ?, ?, ?, ?, ?);",
          [
            req.body.DiseaseName,
            req.body.InfoDisease,
            req.body.ProtectInfo,
            sampleFile.file.name,
            req.body.DiseaseNameEng,
          ],
          function (err) {
            if (err) {
              res.json({ err });
            } else {
              res.json({ status: "success" });
              connection.release();
            }
          }
        );
      }
    });
  }
});

app.delete("/deleteDisease", jsonParser, function (req, res, next) {
    console.log(req.body);
    poolCluster.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
      } else {
        connection.query(
          "DELETE FROM `Disease` WHERE `Disease`.`DiseaseID` = ?",
          [req.body.DiseaseID],
          function (err) {
            if (err) {
              res.json({ err });
            } else {
              console.log("delete success");
              res.json({ status: "success" });
              connection.release();
            }
          }
        );
      }
    });
}); 

app.patch("/updateDisease", jsonParser, function (req, res, next) {
    console.log(req.body);
    let sampleFile;
    let uploadPath;
    if (!req.files || Object.keys(req.files).length === 0) {
    poolCluster.getConnection(function (err, connection) {
        if (err) {
          console.log(err);
        } else {
          connection.query(
            "UPDATE `Disease` SET `DiseaseName` = ?, `InfoDisease` = ?, `ProtectInfo` = ?, `DiseaseNameEng` = ?, `Modifydate` = ? WHERE `Disease`.`DiseaseID` = ?",
            [
              req.body.DiseaseName,
              req.body.InfoDisease,
              req.body.ProtectInfo,
              req.body.DiseaseNameEng,
              req.body.Modifydate,
              req.body.DiseaseID,
            ],
            function (err) {
              if (err) {
                res.json({ err });
              } else {
                res.json({ status: "success" });
                connection.release();
              }
            }
          );
        }
      });
    } else {
    poolCluster.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
      } else {
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        sampleFile = req.files;
        console.log(sampleFile);
        console.log(sampleFile.file.name);
        uploadPath = __dirname + "/image/" + sampleFile.file.name;
        console.log(uploadPath);
        // Use the mv() method to place the file somewhere on your server
        sampleFile.file.mv(uploadPath, function (err) {
          if (err) return res.status(500).send(err);
        });
        connection.query(
          "UPDATE  `Disease` SET `DiseaseName` = ?, `InfoDisease` = ?, `ProtectInfo` = ?,  `ImageName` = ?, `DiseaseNameEng` = ?, `Modifydate` = ? WHERE `Disease`.`DiseaseID` = ?",
          [
            req.body.DiseaseName,
            req.body.InfoDisease,
            req.body.ProtectInfo,
            sampleFile.file.name,
            req.body.DiseaseNameEng,
            req.body.Modifydate,
            req.body.DiseaseID,
          ],
          function (err) {
            if (err) {
              res.json({ err });
            } else {
              res.json({ status: "success" });
              connection.release();
            }
          }
        );
      }
    });
  }
  });

app.get("/image/:filename", (req, res) => {
  const filePath = path.join(__dirname, "/image/", req.params.filename);
  console.log(filePath);
  const fileType = mime.lookup(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) throw err;
    res.writeHead(200, { "Content-Type": fileType });
    res.end(data);
  });
});

app.get("/diseaseallreport", jsonParser, function (req, res) {
  console.log(req.body);
  poolCluster.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
    } else {
      connection.query(
        "SELECT * FROM DiseaseReport",
        [req.body.userID],
        function (err, data) {
          if (err) {
            res.json({ err });
          } else {
            console.log(data.length);
            for (let i = 0; i < data.length; i++) {
              data[i].ImageUrl =
                "http://192.168.1.22:3030/image/" + data[i].DiseaseImage;
            }
            res.json({ data });
            // connection.end();
            connection.release();
          }
        }
      );
    }
  });
});
