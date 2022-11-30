let jwt = require('jsonwebtoken');
// const config = require('./config.js');
let user = require('./authenticate');
let user1 = require('./admin');

let checkToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
//   if (token.startsWith('Bearer')) {
    // Remove Bearer from string
//     token = token.slice(7, token.length);
//   }

  if (token) {
    jwt.verify(token, 'prnv', (err, decoded) => {
      if (err) {
         console.log("erroe here");
        //  res.json({ status: 401, error: { message: 'Unauthorised' } });
         let err = new Error('unautherize');
          err.status = 401;
          throw err;
        
        
        // res.json({
        //   success: false,
        //   message: 'Token is not valid'
        // });
      } 
      else {
        if(user.user !=  undefined){
          if((user.user.username == decoded.username)&&(user.user.password == decoded.password)){
            req.decoded = decoded;
            next();
          }
        }
        else{
          // console.log("ornv")
          // if((user1.user1.username == decoded.username)&&(user1.user1.password == decoded.password)){
            req.decoded = decoded;
            next();
          // }
        }
        
       
      }
    });
  } else {
    console.log("erroe here123");
    let err = new Error('noToken');
          err.status = 111;
          throw err;
  }
};

module.exports = {
  checkToken: checkToken
}