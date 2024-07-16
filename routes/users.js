var express = require('express');
var router = express.Router();

const ps = require('@prisma/client');
const prisma = new ps.PrismaClient();
const pagesize = 2;
var lastCorsor = 0;
var cursor = 1;

prisma.$use(async (params,next) => {
    const result = await next(params);
    // cursor = result[result.length - 1].id; 元の見本はこれ
    cursor = result.id - 1;
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
    console.log("name: req.body.name = " + req.body.name)
    prisma.user.create({
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

router.get('/login' , (req , res , next) => {
    var data = {
        title:'Users/Login' , 
        content:'名前とパスワードを入力してください'
    }
    res.render('users/login' , data);
});

router.post('/login' , (req , res , next) => {
    prisma.User.findMany({
        where:{
            name:req.body.name , 
            pass:req.body.pass,
        }
    }).then(user => {
        if(usr != null && usr[0] != null){
            req.session.login = usr[0];
            let back = res.session.back;
            if(back == null){
                back = 'null';
            }
            res.redirect(back);
        }else{
            var data = {
                title:'Users/Login',
                content:'名前かパスワードに問題があります。再度入力して下さい'
            }
            res.render('users/login' , data);
        }
    })
});

module.exports = router;
