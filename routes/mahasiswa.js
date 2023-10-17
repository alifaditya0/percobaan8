const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const connection = require("../config/db");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
app.use(cors())

const filefilter = (reg, file, cb) => {
  // Mengecek jenis file yang diizinkan (misalnya, hanya gambar JPEG atau PNG)
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true); // Izinkan file
  } else {
    cb(new Error("Jenis file tidak diizinkan"), false); // Tolak file
  }
};

const storage = multer.diskStorage({
  destination: (reg, file, cb) => {
    cb(null, "public/images");
  },
  filename: (reg, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage, fileFilter: filefilter });

router.get("/", function (req, res) {
  connection.query(
    "SELECT a.nama, b.nama_jurusan AS jurusan FROM mahasiswa a JOIN jurusan b ON b.id_j = a.id_jurusan ORDER BY a.id_m DESC",
    function (err, rows) {
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
    }
  );
});

router.post(
  "/store",
  upload.fields([
    { name: "gambar", maxCount: 1 },
    { name: "swa_foto", maxCount: 1 },
  ]),
  [
    body("nama").notEmpty(),
    body("nrp").notEmpty(),
    body("id_jurusan").notEmpty(), // Menambah validasi untuk jurusan
  ],
  (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({
        error: error.array(),
      });
    }
    let Data = {
      nama: req.body.nama,
      nrp: req.body.nrp,
      id_jurusan: req.body.id_jurusan,
      gambar: req.files.gambar[0].filename,
      swa_foto: req.files.swa_foto[0].filename,
    };
    connection.query(
      "INSERT into mahasiswa set ? ",
      Data,
      function (err, rows) {
        if (err) {
          return res.status(500).json({
            status: false,
            message: "Server Error",
          });
        } else {
          return res.status(201).json({
            status: true,
            message: "Sukses..!",
            data: rows[0],
          });
        }
      }
    );
  }
);

router.get("/(:id)", function (req, res) {
  let id = req.params.id;
  connection.query(
    `SELECT * From mahasiswa where id_m = ${id}`,
    function (err, rows) {
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
    }
  );
});

router.patch(
  "/update/:id",
  upload.fields([
    { name: "gambar", maxCount: 1 },
    { name: "swa_foto", maxCount: 1 },
  ]),
  [
    body("nama").notEmpty(),
    body("nrp").notEmpty(),
    body("id_jurusan").notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array(),
      });
    }

    const id = req.params.id;

    const gambar = req.files["gambar"] ? req.files["gambar"][0].filename : null;
    const swa_foto = req.files["swa_foto"]
      ? req.files["swa_foto"][0].filename
      : null;

    connection.query(
      `SELECT * FROM mahasiswa WHERE id_m = ${id}`,
      function (err, rows) {
        if (err) {
          return res.status(500).json({
            status: false,
            message: "Server Error",
          });
        }
        if (rows.length === 0) {
          return res.status(404).json({
            status: false,
            message: "Not Found",
          });
        }

        const gambarLama = rows[0].gambar;
        const swa_fotoLama = rows[0].swa_foto;

        if (gambarLama && gambar) {
          const pathGambar = path.join(
            __dirname,
            "../public/images",
            gambarLama
          );
          fs.unlinkSync(pathGambar);
        }
        if (swa_fotoLama && gambar) {
          const pathSwa = path.join(
            __dirname,
            "../public/images",
            swa_fotoLama
          );
          fs.unlinkSync(pathSwa);
        }

        let Data = {
          nama: req.body.nama,
          nrp: req.body.nrp,
          id_jurusan: req.body.id_jurusan,
          gambar: gambar,
          swa_foto: swa_foto,
        };

        connection.query(
          `UPDATE mahasiswa SET ? WHERE id_m = ${id}`,
          Data,
          function (err, result) {
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
          }
        );
      }
    );
  }
);

router.delete("/delete/:id_m", function (req, res) {
  const id_m = req.params.id_m;

  connection.query(
    `SELECT * FROM mahasiswa WHERE id_m = ${id_m}`,
    function (err, rows) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Server Error",
        });
      }
      if (rows.length === 0) {
        return res.status(404).json({
          status: false,
          message: "Not Found",
        });
      }

      const gambarLama = rows[0].gambar;
      const swa_fotoLama = rows[0].swa_foto;
      // Hapus file lama jika ada
      if (gambarLama) {
        const pathfileLama = path.join(
          __dirname,
          "../public/images",
          gambarLama
        );
        fs.unlinkSync(pathfileLama);
        if (swa_fotoLama) {
          const pathfileLama = path.join(
            _dirname,
            "../public/images",
            swa_fotoLama
          );
          fs.unlinkSync(pathfileLama);
        }
      }
      connection.query(
        `delete from mahasiswa where id_m = ${id_m}`,
        function (err, result) {
          if (err) {
            return res.status(500).json({
              status: false,
              message: "Server Error",
            });
          } else {
            return res.status(200).json({
              status: true,
              message: "Deleted Sukses..!",
            });
          }
        }
      );
    }
  );
});

module.exports = router;