// --------------modules-----------------
var express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"));
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", { useNewUrlParser: true });
const { Schema, model } = mongoose;
// using ejs
app.set('view engine', 'ejs');
const _ = require("lodash");

// ---------------mian code---------------
const itemSchema = new Schema({
    name: String
})
const Item = model("Item", itemSchema)
var item1 = new Item({
    name: "Welcome to your toDoList."
});
var item2 = new Item({
    name: "Hit the + button to add new item."
});
var item3 = new Item({
    name: "Check the check-box to delete an item."
});

var defaultitems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
}
const List = model("List", listSchema)

app.get("/", function (req, res) {
    
    Item.find()
        .then((result) => {
            if (result.length === 0) {
                Item.insertMany(defaultitems)
                    .then(() => { console.log("item inserted") })
                    .catch((err) => { if (err) console.log(err) });
                res.redirect("/")
            } else {
                res.render("list", { listTitle: "Today", newListItems: result })
            }
        })
})

app.post("/", function (req, res) {
    const itemName = req.body.inputValue;
    const listName = req.body.list;

    let item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/")
    } else {
        List.findOne({ name: listName })
            .then((result) => {
                result.items.push(item);
                result.save()
                res.redirect("/" + listName);
            })
    }


})

app.post("/delete", (req, res) => {

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.deleteOne({ _id: checkedItemId })
            .catch((err) => { console.log(err) })
        res.redirect("/")
    }
    else {
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkedItemId}}})
            .then(()=>{
                res.redirect("/"+listName)
            })
            .catch((err)=>{console.log(err)})
            
    }
})

app.get("/:customListName", (req, res) => {

    customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName })
        .then((result) => {
            if (!result) {
                const list = new List({
                    name: customListName,
                    items: defaultitems
                })
                list.save()
                res.redirect("/" + customListName)
            } else {
                res.render("list", { listTitle: result.name, newListItems: result.items })
            }
        })
    

})



app.listen("3000", function () {
    console.log("server started at 3000");
})
