const { Pool } = require('pg');
const express = require('express')
const formData = require('express-form-data');
const cors = require('cors')
const multer = require('multer');
const fs = require('fs')
require('dotenv').config();

const mysql = require('mysql')

const app = express() //  initiallising Express server
app.use(cors())   //    Middleware for server and client connections
app.use(express.json()) //  to req and res in json
app.use(express.static('public'))


// MYSQL Connect
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    // password: 'qwerty6789',
    database: 'appl'
  });
  
  db.connect(err => {
    if (err) {
      throw err;
    }
    console.log('MySQL Connected');
  });

//Multer SetUp
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/upload');
    },
    filename: (req, file, cb) => {
    //   cb(null, file.filename + '-' +Date.now() + '-' + file.originalname);
        cb(null, Date.now() + '-' + file.originalname);
    },
});

//Multer Variable
const upload = multer({ 
    storage:storage
 });


// Products
//  products list SQL
app.get('/products',(req, res)=>{
    const sql ="SELECT * FROM products"
    db.query(sql, (err, data)=>{
        if(err) {
            return res.json(err)
        } else{
            return res.json(data)
        }
    })  
})

//  Add products MySQL
app.post('/addProducts',upload.fields([
    {name:'image1', maxCount:1},
    {name:'image2', maxCount:1},
    {name:'image3', maxCount:1},
    {name:'image4', maxCount:1},
    ]),(req, res)=>{
    const {name, catagory, type, range, price, emi, feature, description, techspec, date, popular} =req.body
    const image1 = req.files.image1[0].filename
    const image2 = req.files.image2[0].filename
    const image3 = req.files.image3[0].filename
    const image4 = req.files.image4[0].filename

    const sql ="INSERT INTO products (name, catagory, type, Prodrange, price, emi, image1, image2, image3, image4, feature, description, techspec, date, popular) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    db.query(sql, [name, catagory, type, range, price, emi, image1, image2, image3, image4, feature, description, techspec, date, popular], (err, result) => {
        if (err) {
        console.error('Error inserting data into MySQL:', err);
        res.status(500).json({ error: 'Internal server error' });
        } else {
        res.status(200).json({ message: 'Product Updated' });
        }
    })  
})

// edit product
app.put('/updateProduct',upload.fields([
    {name:'image1', maxCount:1},
    {name:'image2', maxCount:1},
    {name:'image3', maxCount:1},
    {name:'image4', maxCount:1},
    ]),(req, res)=>{
    const {id, name, catagory, type, range, price, emi, feature, description, techspec, popular} =req.body
    const image1 = req.files.image1?req.files.image1[0].filename:req.body.image1
    const image2 = req.files.image2?req.files.image2[0].filename:req.body.image2
    const image3 = req.files.image3?req.files.image3[0].filename:req.body.image3
    const image4 = req.files.image4?req.files.image4[0].filename:req.body.image4
    
    console.log(popular)
    const sql =`UPDATE products SET name='${name}', catagory='${catagory}', type='${type}', Prodrange='${range}', price='${price}', emi='${emi}', image1='${image1}', image2='${image2}', image3='${image3}', image4='${image4}', feature='${feature}', description='${description}', techspec='${techspec}', popular='${popular}' WHERE productId = '${id}'`
    db.query(sql,(err, result) => {
        if (err) {
        console.error('Error inserting data into MySQL:', err);
        res.status(500).json({ error: 'Internal server error' });
        } else {
        res.status(200).json({ message: 'Product Updated' });
        }
    })  
})

// live product filter SQL
app.get('/liveProduct',(req, res)=>{
    const sql =`SELECT * FROM products WHERE popular='y'`
    db.query(sql, (err, data)=>{
        if(err) {
            return res.json(err)
            // console.error(err)
        } else{
            return res.json(data)
            // console.log(data)
        }
    })  
})

//  Filter products
app.post('/filterProducts',upload.single('testImage'),(req, res)=>{
    const {category, type} = req.body    
    const cat = category.split(',').map(tr=>`'${tr}'`).join(',')
    const ty = type.split(',').map(tr=>`'${tr}'`).join(',')

    const sql = `SELECT * FROM products WHERE catagory IN (${cat}) AND type IN (${ty})`
    db.query(sql, (err, data)=>{
        if(err) {
            return res.json(err)
            // console.error(err)
        } else{
            return res.json(data)
            // console.log(data.rows)
        }
    })   
})

// Delete Products
app.delete('/RemoveProduct',(req, res)=>{
    const {id, image1, image2, image3, image4} = req.body;
    const file = [image1, image2, image3, image4]
    let delfile = true
    file.map((image)=>{
        fs.unlink(`public/upload/${image}`, (err)=>{
            if(err){
                console.log(err)
                delfile=false
            }
        })
    })
    if(delfile){
        const sql = `DELETE FROM products WHERE productId='${id}';`
        db.query(sql, (err, result)=>{            
            if(err) return res.json(err)
            return res.json(result)
            // if(err) console.log(res.json(err))
            // console.log(res.json(result))
        })
    } else{
        console.log("false")
        res.status(500).json({ error: 'Internal server error' });
    }
})

//  Story
//  Story list
app.get('/stories',(req, res)=>{
    const sql ="SELECT * FROM story"
    db.query(sql, (err, data)=>{
        if(err) {
            return res.json(err)
        } else{
            return res.json(data)
        }
    })  
})

//  Add Story
app.post('/addStory',upload.fields([
    {name:'image1', maxCount:1},
    {name:'image2', maxCount:1},
    {name:'image3', maxCount:1},
    {name:'image4', maxCount:1},
    ]),(req, res)=>{
    const prop =req.body
    const image1 = req.files.image1[0].filename
    const image2 = req.files.image2[0].filename
    const image3 = req.files.image3[0].filename
    const image4 = req.files.image4[0].filename

    // console.log(image1)
    const sql ="INSERT INTO story (storytitle, storylocation, storygen, storysave, storystory, image1, image2, image3, image4, storydate, storytype, storylive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    db.query(sql, [prop.storytitle, prop.storylocation, prop.storygen, prop.storysave, prop.storystory, image1, image2, image3, image4, prop.date, prop.type, prop.live], (err, result) => {
        if (err) {
        console.error('Error inserting data into MySQL:', err);
        res.status(500).json({ error: 'Internal server error' });
        } else {
        res.status(200).json({ message: 'Story Updated' });
        }
    })  
})

// Update Story
app.put('/updateStory',upload.fields([
    {name:'image1', maxCount:1},
    {name:'image2', maxCount:1},
    {name:'image3', maxCount:1},
    {name:'image4', maxCount:1},
    ]),(req, res)=>{
    const {id, storytitle, storylocation, storygen, storysave, storystory, type, live} =req.body
    const image1 = req.files.image1?req.files.image1[0].filename:req.body.image1
    const image2 = req.files.image2?req.files.image2[0].filename:req.body.image2
    const image3 = req.files.image3?req.files.image3[0].filename:req.body.image3
    const image4 = req.files.image4?req.files.image4[0].filename:req.body.image4
    
    const sql =`UPDATE story SET storytitle='${storytitle}', storylocation='${storylocation}', storygen='${storygen}', storysave='${storysave}', storystory='${storystory}', image1='${image1}', image2='${image2}', image3='${image3}', image4='${image4}', storytype='${type}', storylive='${live}' WHERE storyid = '${id}'`
    db.query(sql,(err, result) => {
        if (err) {
        console.error('Error inserting data into MySQL:', err);
        res.status(500).json({ error: 'Internal server error' });
        } else {
        res.status(200).json({ message: 'Story Updated' });
        }
    })  
})

// live project filter SQL
app.get('/liveProject',(req, res)=>{
    const sql =`SELECT * FROM story WHERE storylive = 'y'`
    db.query(sql, (err, data)=>{
        if(err) {
            return res.json(err)
            // console.error(err)
        } else{
            return res.json(data)
            // console.log(data)
        }
    })  
})

// Delete Products
app.delete('/RemoveStory',(req, res)=>{
    
    const {id, image1, image2, image3, image4} = req.body;
    const file = [image1, image2, image3, image4]
    console.log(req.body)
    let delfile = true
    file.map((image)=>{
        fs.unlink(`public/upload/${image}`, (err)=>{
            if(err){
                console.error(err)
                delfile=false
            }
        })
    })
    if(delfile){
        const sql = `DELETE FROM story WHERE storyid='${id}';`
        db.query(sql, (err, result)=>{    
            // if(err) console.log("err")
            // console.log("result")        
                if(err) return res.json(err)
                return res.json(result)            
        })
    } else{
        console.log("fasle")
        res.status(500).json({ error: 'Internal server error' });
    }
    

})

// Testimonial
//  Test list
app.get('/testimonial',(req, res)=>{
    const sql ="SELECT * FROM testimonial"
    db.query(sql, (err, data)=>{
        if(err) {
            return res.json(err)
        } else{
            return res.json(data)
        }
    })  
})

// add Testimonial
app.post('/addTest',upload.single('testImage'),(req, res)=>{
    const prop = req.body
    const image = req.file.filename

    const sql ="INSERT INTO testimonial (testtitle, testcontent, testname, testrating, testimage) VALUES (?, ?, ?, ?, ?)"
    db.query(sql, [prop.testTitle, prop.testContent, prop.testName, prop.testRating, image], (err, result) => {
        if (err) {
        console.error('Error inserting data into MySQL:', err);
        res.status(500).json({ error: 'Internal server error' });
        } else {
        res.status(200).json({ message: 'Testimonial Updated' });
        }
    })  
})

// Update Testimonial
app.put('/updateTest',upload.single('testImage'),(req, res)=>{
    const {id, testTitle, testContent, testName, testRating} =req.body
    const image = req.file?req.file.filename:req.body.testImage
    
    const sql =`UPDATE testimonial SET testTitle='${testTitle}', testContent='${testContent}', testName='${testName}', testRating='${testRating}', testimage='${image}' WHERE id = '${id}'`
    db.query(sql,(err, result) => {
        if (err) {
        console.error('Error inserting data into MySQL:', err);
        res.status(500).json({ error: 'Internal server error' });
        } else {
        res.status(200).json({ message: 'Product Updated' });
        }
    })  
})

// Delete Products
app.delete('/RemoveTest',(req, res)=>{
    
    const {id, image} = req.body;
    fs.unlink(`public/upload/${image}`, (err)=>{
        if(err){
            console.error(err)
            res.status(500).json({ error: 'Internal server error' });
        }else{
            const sql = `DELETE FROM testimonial WHERE id='${id}';`
            db.query(sql, (err, result)=>{                    
                    if(err) return res.json(err)
                    return res.json(result)        
            })
        }
    })
    
})

// Others
// Count for Dashboard  
app.get('/counts', (req, res)=>{
    try{

        const sql1 ="SELECT COUNT(*) AS products FROM products"
        const sql2 = "SELECT COUNT(*) AS story FROM story"
        const sql3 = "SELECT COUNT(*) AS testimonial FROM testimonial"
        db.query(sql1, (err1, products)=>{
            if(err1) {
                return res.json(err1)
            } 
            db.query(sql2, (err2, story)=>{
                if(err2) {
                    return res.json(err2)
                }
                db.query(sql3, (err3, testimonial)=>{
                    if(err3) {
                        return res.json(err3)
                    }
                    res.json({products, story, testimonial})
                })
            }) 
        }) 
    }catch(err){
        console.error("count:",err)
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.listen(8801, ()=>{
    console.log("Listinig")
})