var express = require('express');
var router = express.Router();

const ps = require('@prisma/client');
const prisma = new ps.PrismaClient();
const pagesize = 2;
var lastCorsor = 0;
var cursor = 1;

prisma.$use(async (params,next) => {
    const result = await next(params);
    cursor = result[result.length - 1].id;
    if(cursor == lastCorsor){
        cursor = 1;
    }
    lastCorsor = cursor;
    return result;
});

router.get("/",(req,res,next) => {
    prisma.user.findMany({
        orderBy:[{id:'asc'}],
        cursor:{id:cursor},
        take:pagesize,
    }).then(users => {
        const data = {
            title:'Users/Index',
            content:users
        }
        res.render('users/index' , data);
    });
});
router.get("/find",(req,res,next) => {
    // const min = +req.query.min;
    // const max = +req.query.max;
    const name = req.query.name;
    const mail = req.query.mail;

    prisma.user.findMany({
        where: {
            // AND: [
            //     { age: { gte: min}},
            //     { age: { lte: max}}
            // ]
            OR: [
                { name: {contains: name}},
                { mail: {contains:mail}}
            ]
        }
    }).then(users => {
        var data = {
            title:"Users/Find",
            content:users
        }
        res.render("users/index",data);
    });
});

router.get('/add',(req,res,next) => {
    const data = {
        title:'Users/Add'
    }
    res.render('users/Add',data);
});

router.post('/add',(req,res,next) => {
    prisma.User.create({
        data:{
            name: req.body.name,
            pass: req.body.pass,
            mail: req.body.mail,
            age: +req.body.age
        }
    })
    .then(() => {
        res.redirect('/users');
    });
});

router.get('/edit/:id',(req,res,next) => {
    const id = req.params.id;
    prisma.user.findUnique(
        {where:{id:+id}}
    ).then(usr => {
        const data = {
            title:"Users/Eit",
            user:usr
        };
        res.render("users/edit",data);
    });
});

router.post("/edit",(req,res,next) => {
    const {id,name,pass,mail,age} = req.body;    
    prisma.user.update({
        where:{id:+id},
        data:{
            name:name,
            mail:mail,
            pass:pass,
            age:+age
        }
        
    }).then(()=>{
        res.redirect('/users');
    });

})

router.get('/delete/:id',(req,res,next) => {
    const id = req.params.id;
    prisma.user.findUnique(
        { where:{id:+id}}
    ).then(usr => {
        const data = {
            title:"User/Delete",
            user:usr
        }
        res.render('users/delete',data);
    });
});

router.post('/delete',(req,res,next) => {
    prisma.User.delete({
        where:{id:+req.body.id}
    }).then(() => {
        res.redirect('/users');
    });
});

module.exports = router;
