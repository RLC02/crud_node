const express = require("express");
const app = express();
const handlebars = require("express-handlebars").engine;
const bodyParser = require("body-parser");
const Post = require("./models/post");
const moment = require("moment");

const hbs = handlebars({
  defaultLayout: "main",
  helpers: {
    eq: (a, b) => a === b,
  },
});

app.engine("handlebars", hbs);
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.render("primeira_pagina");
});

app.get("/atualizar/:id", function (req, res) {
    Post.findAll({
        where: { id: req.params.id }
    })
    .then(function (posts) {
        if (posts.length === 0) {
            return res.status(404).send("Post não encontrado");
        }
    
        posts = posts.map(post => {
            post.dataValues.data_contato = moment(post.dataValues.data_contato).format("YYYY-MM-DD");
            return post;
        });

        res.render("atualizar", { posts });
    })
    .catch(function (erro) {
        res.send("Erro ao buscar o post: " + erro);
    });
});

app.post("/atualizar/:id", function (req, res) {
  const id = req.params.id;
  Post.update(
    {
      nome: req.body.nome,
      telefone: req.body.telefone,
      origem: req.body.origem,
      data_contato: req.body.data_contato,
      observacao: req.body.observacao,
    },
    {
      where: { id: id },
    }
  )
    .then(function () {
      res.redirect("/consulta");
    })
    .catch(function (erro) {
      res.send("Erro ao atualizar: " + erro);
    });
});

app.get("/excluir", function (req, res) {
    const { id } = req.query;
    
    if (!id) {
      return res.send("ID não fornecido.");
    }
  
    Post.destroy({
      where: { id: id },
    })
      .then(function () {
        res.redirect("/consulta");
      })
      .catch(function (erro) {
        res.send("Erro ao excluir: " + erro);
      });
});
  

app.post("/cadastrar", function (req, res) {
  Post.create({
    nome: req.body.nome,
    telefone: req.body.telefone,
    origem: req.body.origem,
    data_contato: req.body.data_contato,
    observacao: req.body.observacao,
  })
    .then(function () {
      res.redirect("/consulta");
    })
    .catch(function (erro) {
      res.send("Erro ao cadastrar: " + erro);
    });
});

app.get("/consulta", function (req, res) {
  Post.findAll()
    .then(function (posts) {
      res.render("consulta", { posts: posts });
      console.log(posts);
    })
    .catch(function (erro) {
      res.send("Erro ao consultar: " + erro);
    });
});

app.listen(8081, function () {
  console.log("Servidor Ativo!");
});
