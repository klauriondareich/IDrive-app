import Joi from "joi"
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import initCon from '../../db.js';

const schema = Joi.object({ 

    username: Joi.string().required(),
    email: Joi.string().
        email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'fr'] } }).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    size_of_all_docs: Joi.number().required(),
    blocked: Joi.boolean().required()

})

// Register user
export const registerUser = async (req, res) =>{

    const result = schema.validate(req.body);
    if (result.error) return res.status(400).send(result.error.details[0].message);

    const gen = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, gen);

    let username = req.body.username;
    let email = req.body.email;
    let password = hashedPassword;
    let doc_size = req.body.size_of_all_docs;
    let blocked = req.body.blocked;

    initCon.connect(function() {

      // Check if the user exist or not
      let  sql_search_user = `SELECT * FROM users WHERE email="${email}"`;
      initCon.query(sql_search_user, function (err, result) {
          if (err) throw err;
          
          if (result.length == 0){
            // Insert user infos in database
            var sql = `INSERT INTO users (username, email, mdp, size_of_all_docs, blocked) VALUES ('${username}', '${email}', '${password}', '${doc_size}', '${blocked}')`;
            initCon.query(sql, function (err) {
              if (err) throw err;
              return res.status(200).send({message: "Votre compte a été crée avec succès!"})
            });
          }
          else return res.status(400).send({message:"L'adresse email existe déjà"})
          
        });
    });
    
};

// Login user 
export const loginUser = async (req, res) =>{

    initCon.connect(function() {

        var sql = `SELECT * FROM users WHERE email="${req.body.email}"`;
        initCon.query(sql, function (err, result) {
          if (err) throw err;
          console.log("result", result);
          if (result.length == 0) return res.status(400).send({ message: "l'utilisateur n'existe pas" });
          else if (result.length != 0) {
            const validPassword = bcrypt.compare(req.body.password, result[0].mdp);
            if (!validPassword) return res.status(400).send({ message: "Mot de passe incorrect" });
            
            // Generate token
            const myToken = jwt.sign({id: result[0].id}, "kld1SGSAHJLZHZZ");
            let userId = result[0].id;
            return res.status(200).send({myToken: myToken, userId: userId});
          }
          
        });
      });
};

// get user connected info
export const getCurrentUser = async (req, res) =>{

    let userId = req.header('userId');

    initCon.connect(function() {

        var sql = `SELECT * FROM users WHERE id="${userId}"`;
        initCon.query(sql, function (err, result) {
          if (err) throw err;
          if (result.length == 0) return res.status(400).send({ message: "Erreur impossible de récupérer les infos de l'utilisateur" });
          else if (result.length != 0) {
            let userInfo = result[0];
            return res.status(200).send(userInfo);
          } 
        });
      });
};
