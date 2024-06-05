import express from "express";
import bodyParser from "body-parser";
import fs from "fs";

const app = express();
const port = 3000;
var date_now=``;

function get_date(){
  var d = new Date();
  let day = d.getDate(); 
  let mon= d.getMonth()+1;
  let year= d.getFullYear();
  let h= d.getHours();
  let min = d.getMinutes();
  let sec = d. getSeconds();
  if ( (h<10)&&(min<10)&&(sec<10)){ //0 0 0
    date_now=`${day}/${mon}/${year} at 0${h}:0${min}:0${sec}`;
  }else if ( (h<10)&&(min<10)){ //0 0 1
    date_now=`${day}/${mon}/${year} at 0${h}:0${min}:${sec}`;
  }else if ( (h<10)&&(sec<10)){ // 0 1 0
    date_now=`${day}/${mon}/${year} at 0${h}:${min}:0${sec}`;
  }else if ( h<10){ //0 1 1
    date_now=`${day}/${mon}/${year} at 0${h}:${min}:${sec}`;
  }else if (( min<10)&&(sec<10)){ //1 0 0
    date_now=`${day}/${mon}/${year} at ${h}:0${min}:0${sec}`;  
  }else if (min<10){ // 1 0 1
    date_now=`${day}/${mon}/${year} at ${h}:0${min}:${sec}`;
  }else if ( sec<10 ){ // 1 1 0
    date_now=`${day}/${mon}/${year} at ${h}:${min}:0${sec}`;
  }else{    //1 1 1
    date_now=`${day}/${mon}/${year} at ${h}:${min}:${sec}`;
  }
  return  date_now;
}

var fnumber=0;
const t_text=[];
const b_text=[];
const date=[];
const op=[];
var r_title;
var r_text;

//Hint 1: CSS files are static files!
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

//Go to the main page after a modification in the post
app.post("/update", (req, res) => {
  console.log(`index: ${req.body.x}`);
  t_text.splice(req.body.x, 1,req.body.title_p );
  b_text.splice(req.body.x, 1,req.body.text_p);

  date.splice(req.body.x, 1 , get_date() );
  op.splice(req.body.x, 1 ,"Last modification on: ");

  console.log(t_text[req.body.x]);
  //save the data in a text file
  fs.writeFileSync(`posts/title${req.body.x}.txt`,t_text[req.body.x] , (err) => {
    if (err) throw err;
    console.log(`The file title${req.body.x} has been saved!`);
  }); 
  fs.writeFileSync(`posts/text${req.body.x}.txt`,b_text[req.body.x] , (err) => {
    if (err) throw err;
    console.log(`The file text${req.body.x} has been saved!`);
  }); 
  res.render("index.ejs",{
    op_str: op,
    date_str: date,
    fnum:fnumber-1, //the number has to be the index number to create the list in the for loop
    title:t_text,
  });
});

//Go to blog edition mode after a modification request
app.post("/mod", (req, res) => {
  console.log(`index: ${req.body.x}`);
  r_title=fs.readFileSync(`posts/title${req.body.x}.txt`, {encoding:'utf8', flag: 'r'});
  r_text=fs.readFileSync(`posts/text${req.body.x}.txt`, {encoding:'utf8', flag: 'r'});
  res.render("blog_mod.ejs",{
    b_number:req.body.x, 
    title:t_text[req.body.x],
    text: b_text[req.body.x],
  });
});

app.post("/del", (req, res) => {
  
  t_text.splice(req.body.x, 1);
  b_text.splice(req.body.x,1);
  date.splice(req.body.x, 1);
  op.splice(req.body.x, 1);
  fnumber=t_text.length;
  fs.unlinkSync(`posts/title${req.body.x}.txt`);
  fs.unlinkSync(`posts/text${req.body.x}.txt`);
  if(fnumber>0){
    for(let i=req.body.x;i<=fnumber-1;i++){
      var j=Number(Number(i)+1);
      console.log(`for loop index: ${j}`);
      fs.rename(`posts/title${j}.txt`, `posts/title${i}.txt`, function(err) {
        if ( err ) console.log(err);
      });
      fs.rename(`posts/text${j}.txt`, `posts/text${i}.txt`, function(err) {
        if ( err ) console.log(err);
      });
    }
  } 
  if(fnumber===0){
    res.render("index.ejs");
  }else{
    res.render("index.ejs",{
      op_str: op,
      date_str: date,
      fnum:fnumber-1, //the number has to be the index number to create the list in the for loop
      title:t_text,
    });
  }
});

//home page as soon as the server starts
app.get("/", (req, res) => {
  //get any posts to show the title in the main page
  if(fnumber===0){
    res.render("index.ejs");
  }else{
    res.render("index.ejs",{
      op_str: op,
      date_str: date,
      fnum: fnumber-1,  //the number has to be the index number to create the list in the for loop
      title:t_text,
    });
  }
});

//home page after back comand form the post reading page
app.post("/home", (req, res) => {
  //get any posts to show the title in the main page
  res.render("index.ejs",{
    op_str: op,
    date_str: date,
    fnum: fnumber-1,  //the number has to be the index number to create the list in the for loop
    title:t_text,
    });
});

app.post("/new", (req, res) => {
  //get data from the form
  
  console.log(`number before: ${fnumber} update`);
  //t_text[fnumber]=req.body.title_p;
  t_text.splice(fnumber, 0, req.body.title_p );
  console.log(t_text);
  //b_text[fnumber]=req.body.text_p;
  b_text.splice(fnumber, 0, req.body.text_p );
  
  date.splice(fnumber, 0 , get_date() );
  op.splice(fnumber, 0 ,"Created on: ");
  
  console.log(date);
   //save the data in a text file
  fs.writeFileSync(`posts/title${fnumber}.txt`,t_text[fnumber] , (err) => {
     if (err) throw err;
     console.log(`The file title${fnumber} has been saved!`);
  }); 
  fs.writeFileSync(`posts/text${fnumber}.txt`,b_text[fnumber] , (err) => {
    if (err) throw err;
    console.log(`The file text${fnumber} has been saved!`);
 }); 
 res.render("index.ejs",{
  op_str: op,
  date_str:date,
  fnum:fnumber,
  title:t_text,
  });
  fnumber=t_text.length; //fnumber take the next index value
  console.log(`number after: ${fnumber} update`);
});

app.get("/create", (req, res) => {
  //Step 1 - Make the get route work and render the index.ejs file.
  res.render("create_post.ejs");
});

app.post("/blog_content", (req, res) => {
  console.log(`index: ${req.body.x}`);
  r_title=fs.readFileSync(`posts/title${req.body.x}.txt`, {encoding:'utf8', flag: 'r'});
  r_text=fs.readFileSync(`posts/text${req.body.x}.txt`, {encoding:'utf8', flag: 'r'});
  console.log(r_title);
  console.log(req.body.op);
  res.render("blog_content.ejs",{ //those variables take the index from the form in index.ejs
    b_op:op,
    b_date_str:date,
    b_title:r_title,
    b_text:r_text,
    b_number:req.body.x,
    b_fnum:req.body.fnum,
    });
});



app.listen(port, () => {
console.log(`Listening on port ${port}`);
});