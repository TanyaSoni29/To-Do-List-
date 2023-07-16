const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
const _ = require('lodash');

const date = require(__dirname + "/date.js");

const app = express();


let workItems =[];

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://tanya:Tanya790@cluster0.rxzdtbp.mongodb.net/toDoListDB", {useNewUrlParser : true})

const itemsSchema = {
   name: String
};

const Item = mongoose.model("Item", itemsSchema);
const  item1 = new Item({
   name: "Welcome To Your To Do List!"
})
const  item2 = new Item({
   name: "Hit the + button to save new list item! "
})
const  item3 = new Item({
   name: "<-- Hit this to delete this item"
})

const defaultItems = [item1, item2, item3];

const listSchema ={
   name: String,
   items:[itemsSchema]
};
const List= mongoose.model("List",listSchema);


app.get("/", function(req,res){
   
   foundItems = Item.find({})
   .then( (foundItems) => { if (foundItems.length === 0){
      Item.insertMany(defaultItems)
      .then( () => {
         console.log("successfully saved the default items to list ")
      })
      .catch((error) => {
         console.error("Error saving default items to list:", error);
       });
      res.redirect("/") ;
   } else {res.render("list", {listTitle :"Today", newListItems : foundItems});}
     
   })
   .catch((error) => {
      console.error("Error in founding new items:", error);
    });
 
});

app.post("/", function(req,res){ 
   const itemName = req.body.newItem;
   const listName = req.body.list;
   const item = new Item({
      name: itemName
   });
   if(listName ==="Today"){
   item.save();
   res.redirect("/");}
   else{
    foundList= List.findOne({name: listName})
      .then( (foundList) => {
         foundList.items.push(item);
         foundList.save();
         res.redirect("/" + listName)
      })
   }
  
});
app.post("/delete", function(req,res){
   const CheckedIdItem = (req.body.checkbox);
   const listName = req.body.listName;
   if(listName === "Today"){ 
      Item.findByIdAndRemove(CheckedIdItem)
      .then( () =>{
         console.log("successfully deleted the checked item!")
      })
      .catch( ()=> {
         console.log("Error in deleting your cheked item!")
      })
      res.redirect("/");}
      else {
        foundList = List.findOneAndUpdate({name: listName},{$pull: {items:{_id:CheckedIdItem}}})
         .then( (foundList) =>{
            res.redirect("/" + listName);
         })
        
      }
  
})
app.get("/:customListName", function(req,res){
   const customListName = _.capitalize(req.params.customListName);
   foundList =List.findOne({name: customListName})
.then( (foundList) =>{
   if(!foundList){
      const list = new List({
         name: customListName,
         items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
   }else {
res.render("list", {listTitle: foundList.name, newListItems:foundList.items});
   }
})
 


})



// app.get("/work", function(req,res){
//    res.render("list", {listTitle: "Work List", newListItems: workItems});
//    });
 app.get("/about", function(req,res){
   res.render("about");
});

app.listen(3000, function()
{
    console.log("server has started on port 3000!");
});
