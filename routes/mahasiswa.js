const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const connection = require("../config/db");

const multer = require("multer")
const path = require("path")

const storage = multer.diskStorage({
        destination: (req, file, cb) => {
        cb(null,'public/images')
    },
        filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname (file.originalname))
    }
})
const upload = multer ({storage: storage});

router.get("/", function (req, res) {
  connection.query("SELECT a.nama, b.nama_jurusan AS jurusan FROM mahasiswa a JOIN jurusan b ON b.id_j = a.id_jurusan ORDER BY a.id_m DESC", function (err, rows) {
    if (err) {
      console.error(err); // Tampilkan error di konsol
      return res.status(500).json({
        status: false,
        message: "Server Error",
      });
    } else {
      return res.status(200).json({
        status: true,
        message: "Data Mahasiswa",
        data: rows,
      });
    }
  });
});

router.post('/store', upload.single("gambar") , [
    //validation
    body('nama').notEmpty(),
    body('nrp').notEmpty(),
    body('id_jurusan').notEmpty()
],(req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(422).json({
            error: error.array()
        });
    }
    let Data = {
        nama: req.body.nama,
        nrp: req.body.nrp,
        id_jurusan: req.body.id_jurusan,
        gambar: req.file.filename
    }
    connection.query('insert into mahasiswa set ?', Data, function(err, rows){
        if(err){
            return res.status(500).json({
                status: false,
                message: 'Server Error',
                error:  err
            })
        }else{
            return res.status(201).json({
                status: true,
                message: 'Success..!',
                data: rows[0]
            })
        }
    })
})

router.get("/(:id)", function (req, res) {
  let id = req.params.id;
  connection.query(`SELECT * From mahasiswa where id_m = ${id}`, function (err, rows) {
    if (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
      });
    }
    if (rows.length <= 0) {
      return res.status(404).json({
        status: false,
        message: "Not Found",
      });
    } else {
      return res.status(200).json({
        status: true,
        message: "Data Mahasiswa",
        data: rows[0],
      });
    }
  });
});

router.patch("/update/(:id)", [body("nama").notEmpty(), body("nrp").notEmpty()], (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).json({
      error: error.array(),
    });
  }
  let id = req.params.id;
  let Data = {
    nama: req.body.nama,
    nrp: req.body.nrp,
  };
  connection.query(`UPDATE mahasiswa set ? where id_m = ${id}`, Data, function (err, rows) {
    if (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
      });
    } else {
      return res.status(200).json({
        status: true,
        message: "Update Sukses..!",
      });
    }
  });
});

router.delete("/delete/(:id)", function (req, res) {
  let id = req.params.id;
  connection.query(`DELETE From mahasiswa where id_m = ${id}`, function (err, rows) {
    if (err) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
      });
    } else {
      return res.status(200).json({
        status: true,
        message: "Data has ben delete..!!",
      });
    }
  });
});

module.exports = router;