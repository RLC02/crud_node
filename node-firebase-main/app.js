const express = require("express")
const app = express()
const { engine } = require("express-handlebars")
const bodyParser = require("body-parser")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')

const serviceAccount = require('./nodefbs-firebase-adminsdk-fbsvc-f52a3dd783.json')

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

app.engine("handlebars", engine({
  defaultLayout: "main",
  helpers: {
    eq: function (a, b) {
      return a === b
    }
  }
}))

app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", function(req, res){
    res.render("primeira_pagina")
})

app.get("/consulta", async function(req, res){
    const agendamentosRef = db.collection("agendamentos")
    const snapshot = await agendamentosRef.get()

    const agendamentos = []
    snapshot.forEach(doc => {
        agendamentos.push({ id: doc.id, ...doc.data() })
    })

    res.render("consulta", { agendamentos })
})


app.get("/editar/:id", async function(req, res){
    const docRef = db.collection("agendamentos").doc(req.params.id)
    const doc = await docRef.get()
    
    if (!doc.exists) {
        res.send("Agendamento não encontrado.")
    } else {
        res.render("editar", { id: doc.id, ...doc.data() })
    }
})


app.get("/excluir/:id", async function(req, res){
    await db.collection("agendamentos").doc(req.params.id).delete()
    res.redirect("/consulta")
})

app.post("/cadastrar", function(req, res){
    var result = db.collection('agendamentos').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Added document');
        res.redirect('/')
    })
})

app.post("/atualizar", async function(req, res){
    const id = req.body.id
    await db.collection("agendamentos").doc(id).update({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    })
    res.redirect("/consulta")
})


app.listen(8081, function(){
    console.log("Servidor ativo!")
})