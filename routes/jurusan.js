const express = require('express');
const router = express.Router();

const {body, validationResult }= require('express-validator');

const connection = require('../config/db');

router.get('/', function (req, res){
    connection.query('select  a.nama, b.nama_jurusan as jurusan ' + 'from mahasiswa a  join jurusan b  ' +  'on b.id_j=a.id_jurusan order by a.id_m  desc ', function(err, rows){
        if(err){
            return res.status(500).json({
                status: false,
                message: 'Server Failed',
            })
        }else{
            return res.status(200).json({
                status:true,
                message: "Data Mahasiswa",
                data: rows
            })
        }
    })
});

router.post('/store', [
    body('nama_jurusan').notEmpty(),

],(req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(422).json({
            error: error.array()
        });
    }
    let Data = {
        nama_jurusan: req.body.nama_jurusan,
    }
    connection.query('insert into jurusan set ?', Data, function(err, rows){
        if(err){
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            })
        }else{
            return  res.status(201).json({
                status: true,
                message: 'Success..!',
                data: rows[0]
            })
        }
    })
})


router.get('/(:id)', function (req, res) {
let id=req.params.id;
connection.query(`select * from jurusan where id_j = ${id}`, function (err, rows) {
    if(err) {
return res.status(500).json({
status: false,
message: 'Server Error',
})
}

if(rows.length <=0){
return res.status(404).json({
status: false,
message: 'Not Found',
})
}
else{
return res.status(200).json({ 
status: true,
message: 'Data jurusan', 
data: rows[0]
})
}
})
})


router.patch('/update/:id', [ 
body('nama_jurusan').notEmpty(), 
], (req, res) => {
const error = validationResult(req); 
if(!error.isEmpty()){
return res.status(422).json({
});
}
let id = req.params.id;
let Data = {
    nama_jurusan: req.body.nama_jurusan,
}

connection.query(`update jurusan set? where id_j = ${id}`, Data, function (err, rows) {
if(err){
return res.status(500).json({
    status: false,
    message: 'Server Error',
})
} else {
return res.status(200).json({ 
    status: true,
message: 'Update Success..!'
})
}
})
})


router.delete('/delete/(:id)', function(req, res){
let id= req.params.id;
connection.query(`delete from jurusan where id_j = ${id}`, function (err, rows) { 
    if (err) {
return res.status(500).json({
status: false,
message: 'Server Error',
})
}else{
return res.status(200).json({
status: true,
message: 'Data has ben delete !',
})
}
})
})

module.exports = router;