const { Pool } = require('pg');
const express = require('express')
const formData = require('express-form-data');
const cors = require('cors')
const multer = require('multer');
require('dotenv').config();

const app = express() //  initiallising Express server
app.use(cors())   //    Middleware for server and client connections
app.use(express.json()) //  to req and res in json
app.use(express.static('public'))

//formData decyript
// app.use(formData.parse());
// app.use(formData.format());
// app.use(formData.stream());
// app.use(formData.union());

// Postgre Connection connect
const db = new Pool({
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE,
})

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

//  dummy get
app.get('/',(req, res)=>{
    return res.json("whats")
})

//  products list
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

//  Add products
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

    // console.log(feature)
    // var lines = feature.split(/\r?\n/);
    // feature.map((i)=>{
    //     console.log(i)
    // })
    
    // console.log(req.files)
    const sql ="INSERT INTO products (name, catagory, type, range, price, emi, image1, image2, image3, image4, feature, description, techspec, date, popular) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)"
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
    const sql =`UPDATE products SET "name"='${name}', "catagory"='${catagory}', "type"='${type}', "range"='${range}', "price"='${price}', "emi"='${emi}', "image1"='${image1}', "image2"='${image2}', "image3"='${image3}', "image4"='${image4}', "feature"='${feature}', "description"='${description}', "techspec"='${techspec}', "popular"='${popular}' WHERE "productId" = '${id}'`
    db.query(sql,(err, result) => {
        if (err) {
        console.error('Error inserting data into MySQL:', err);
        res.status(500).json({ error: 'Internal server error' });
        } else {
        res.status(200).json({ message: 'Product Updated' });
        }
    })  
})

// live product filter
app.get('/liveProduct',(req, res)=>{
    const sql =`SELECT * FROM products WHERE "popular"='y'`
    db.query(sql, (err, data)=>{
        if(err) {
            return res.json(err)
            // console.error(err)
        } else{
            return res.json(data.rows)
            // console.log(data)
        }
    })  
})

//  Filter products
app.post('/filterProducts',upload.single('testImage'),(req, res)=>{
    const {category, type} = req.body    
    const cat = category.split(',').map(tr=>`'${tr}'`).join(',')
    const ty = type.split(',').map(tr=>`'${tr}'`).join(',')

    const sql = `SELECT * FROM products WHERE "catagory" IN (${cat}) AND "type" IN (${ty})`
    db.query(sql, (err, data)=>{
        if(err) {
            return res.json(err)
            // console.error(err)
        } else{
            return res.json(data.rows)
            // console.log(data.rows)
        }
    })   
})

// add Testimonial
app.post('/addTest',upload.single('testImage'),(req, res)=>{
    const prop = req.body
    const image = req.file.filename
    console.log(image)

    const sql ="INSERT INTO testimonial (testtitle, testcontent, testname, testrating, testimage) VALUES ($1, $2, $3, $4, $5)"
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
    const image = req.files.image?req.files.image.filename:req.body.testImage
    
    const sql =`UPDATE testimonial SET "testTitle"='${testTitle}', "testContent"='${testContent}', "testName"='${testName}', "testRating"='${testRating}', "testimage"='${image}' WHERE "id" = '${id}'`
    db.query(sql,(err, result) => {
        if (err) {
        console.error('Error inserting data into MySQL:', err);
        res.status(500).json({ error: 'Internal server error' });
        } else {
        res.status(200).json({ message: 'Product Updated' });
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
    const sql ="INSERT INTO story (storytitle, storylocation, storygen, storysave, storystory, image1, image2, image3, image4, storydate, storytype, storylive) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)"
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
    const {id, storytitle, storylocation, storygen, storysave, storystory} =req.body
    const image1 = req.files.image1?req.files.image1[0].filename:req.body.image1
    const image2 = req.files.image2?req.files.image2[0].filename:req.body.image2
    const image3 = req.files.image3?req.files.image3[0].filename:req.body.image3
    const image4 = req.files.image4?req.files.image4[0].filename:req.body.image4
    
    const sql =`UPDATE story SET "storytitle"='${storytitle}', "storylocation"='${storylocation}', "storygen"='${storygen}', "storysave"='${storysave}', "storystory"='${storystory}', "image1"='${image1}', "image2"='${image2}', "image3"='${image3}', "image4"='${image4}', "storytype"='${type}', "storylive"='${live}' WHERE "storyid" = '${id}'`
    db.query(sql,(err, result) => {
        if (err) {
        console.error('Error inserting data into MySQL:', err);
        res.status(500).json({ error: 'Internal server error' });
        } else {
        res.status(200).json({ message: 'Product Updated' });
        }
    })  
})

// live project filter
app.get('/liveProject',(req, res)=>{
    const sql =`SELECT * FROM story WHERE "storylive" IN ('y','n')`
    db.query(sql, (err, data)=>{
        if(err) {
            return res.json(err)
            // console.error(err)
        } else{
            return res.json(data.rows)
            // console.log(data)
        }
    })  
})

app.get('/counts', async(req, res)=>{
    try{
        const queryProduct = db.query("SELECT COUNT(*) FROM products")
        const queryStories = db.query("SELECT COUNT(*) FROM story")
        const queryTests = db.query("SELECT COUNT(*) FROM testimonial")

        const result = await Promise.all([queryProduct, queryStories, queryTests])
        res.json({products:parseInt(result[0].rows[0].count), stories:parseInt(result[1].rows[0].count), tests:parseInt(result[2].rows[0].count)})
    }catch(err){
        console.error("count:",err)
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.listen(8801, ()=>{
    console.log('Listening')
})